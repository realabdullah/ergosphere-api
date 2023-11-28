import {
    generateRegistrationOptions,
    generateAuthenticationOptions,
    verifyRegistrationResponse,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import {isoBase64URL} from '@simplewebauthn/server/helpers';
import Authn from '../models/AuthnModel.js';
import User from '../models/userModel.js';
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
                credentialPublicKey: base64PublicKey,
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

export const requestLoginWithAuthn = async (req, res) => {
    try {
        const {email} = req.body;

        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({error: 'Email not found or no devices registered', success: false});
        }

        const savedAuthns = await Authn.find({user: user._id});
        if (!savedAuthns || savedAuthns.length === 0) {
            return res.status(404).json({error: 'Email not found or no devices registered', success: false});
        }

        const allowedCredentials = [];
        for (const cred of savedAuthns) {
            allowedCredentials.push({
                id: isoBase64URL.toBuffer(cred.credentialID),
                type: 'public-key',
                transports: cred.transports || ['internal'],
            });
        }

        const options = await generateAuthenticationOptions({
            rpID: rpId,
            timeout: 60000,
            allowCredentials: allowedCredentials,
            userVerification: 'required',
        });

        user.challenge = options.challenge;
        await user.save();
        res.json({success: true, options});
    } catch (error) {
        res.status(500).json({error: error.message, success: false});
    }
};

export const loginWithAuthn = async (req, res) => {
    try {
        const {attResp, email} = req.body;

        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({error: 'Email not found or no devices registered', success: false});
        }

        const savedAuthns = await Authn.find({user: user._id});
        if (!savedAuthns) {
            return res.status(404).json({error: 'Email not found or no devices registered', success: false});
        }

        const verification = await verifyAuthenticationResponse({
            response: attResp,
            expectedChallenge: user.challenge,
            expectedOrigin: rpOrigin,
            expectedRPID: rpId,
            authenticator: savedAuthns.filter((authn) => authn.credentialID === attResp.id).map((authn) => ({
                credentialPublicKey: isoBase64URL.toBuffer(authn.credentialPublicKey),
                credentialID: isoBase64URL.toBuffer(authn.credentialID),
                counter: authn.counter,
            }))[0],
        });

        const {verified, authenticationInfo} = verification;
        if (verified && authenticationInfo) {
            const {credentialID, newCounter} = authenticationInfo;
            const base64CredentialID = isoBase64URL.fromBuffer(credentialID);
            const existingDevice = savedAuthns ?
                savedAuthns.find((authn) => authn.credentialID === base64CredentialID) :
                false;

            if (!existingDevice) {
                return res.status(400).json({error: 'BEmail not found or no devices registered', success: false});
            }

            existingDevice.counter = newCounter;
            await existingDevice.save();

            const access = await user.generateAccessToken();
            const refresh = await user.generateRefreshToken();

            res.json({success: true, accessToken: {
                token: access,
                expires: new Date(Date.now() + 60 * 60 * 1000),
            }, refreshToken: {
                token: refresh,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }});
        } else {
            res.status(400).json({error: 'Email not found or no devices registered', success: false});
        }
    } catch (error) {
        res.status(500).json({error: 'An error occured while signing in.', success: false});
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
