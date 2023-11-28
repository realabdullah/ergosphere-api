import {
    generateRegistrationOptions,
    generateAuthenticationOptions,
    verifyRegistrationResponse,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import {isoBase64URL} from '@simplewebauthn/server/helpers';
import Authn from '../models/AuthnModel.js';
import 'dotenv/config';

const rpName = process.env.RPNAME;
const rpId = process.env.RPDOMAIN;
const rpOrigin = process.env.RPORIGIN;

export const generateRegistrationOptionsWithAuthn = async (req, res) => {
    try {
        const savedAuthns = await Authn.find({user: req.user._id});

        const excludeCredentials = [];
        if (savedAuthns) {
            for (const cred of savedAuthns) {
                excludeCredentials.push({
                    id: isoBase64URL.toBuffer(cred.credentialID),
                    type: 'public-key',
                    transports: ['internal'],
                });
            }
        }

        const pubKeyCredParams = [];
        const params = [-7, -257];
        for (const param of params) {
            pubKeyCredParams.push({type: 'public-key', alg: param});
        }


        const options = await generateRegistrationOptions({
            rpName,
            rpID: rpId,
            userID: req.user.email,
            userName: req.user.username,
            timeout: 60000,
            attestationType: 'direct',
            authenticatorSelection: {
                userVerification: 'required',
                residentKey: 'required',
            },
            authenticatorAttachment: 'cross-platform',
            excludeCredentials,
        });

        req.user.challenge = options.challenge;
        await req.user.save();
        res.json({success: true, options});
    } catch (error) {
        res.status(500).json({error: error.message, success: false});
    }
};

export const verifyAuthnResponse = async (req, res) => {
    try {
        const {attResp, device} = req.body;
        const savedAuthns = await Authn.find({user: req.user._id});

        const verification = await verifyRegistrationResponse({
            response: attResp,
            expectedChallenge: req.user.challenge,
            expectedOrigin: rpOrigin,
            expectedRPID: rpId,
        });

        const {verified, registrationInfo} = verification;
        if (verified && registrationInfo) {
            const {credentialID, credentialPublicKey, counter} = registrationInfo;
            const base64CredentialID = isoBase64URL.fromBuffer(credentialID);
            const base64PublicKey = isoBase64URL.fromBuffer(credentialPublicKey);
            const existingDevice = savedAuthns ?
                savedAuthns.find((authn) => authn.credentialID === base64CredentialID) :
                false;

            if (existingDevice) {
                return res.status(400).json({error: 'Device already registered'});
            }

            const authn = {
                device,
                publicKey: base64PublicKey,
                credentialID: base64CredentialID,
                transports: registrationInfo.transports || ['internal'],
                counter,
                user: req.user._id,
            };

            const newAuthn = new Authn(authn);
            await newAuthn.save();
            res.json({success: true, authn: newAuthn});
        } else {
            res.status(400).json({error: 'Registration failed'});
        }
    } catch (error) {
        res.status(500).json({error: error.message, success: false});
    }
};

export const removeAuthn = async (req, res) => {
    try {
        const {id} = req.body;
        const authn = await Authn.findOneAndDelete({_id: id, user: req.user._id});
        if (!authn) throw new Error('Authn not found');
        res.json({success: true});
    } catch (error) {
        res.status(500).json({error: error.message, success: false});
    }
};

export const fetchSavedAuthns = async (req, res) => {
    try {
        const savedAuthns = await Authn.find({user: req.user._id});
        res.json({success: true, authns: savedAuthns});
    } catch (error) {
        res.status(500).json({error: error.message, success: false});
    }
};
