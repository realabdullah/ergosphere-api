import User from '../models/user.js';

const REFRESH_TOKEN = {
    secret: process.env.REFRESH_TOKEN_SECRET,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
};

// Create a new user
export const register = async (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { name, email, password } = req.body;
        const [firstName, lastName] = name.split(' ');

        const user = new User({ firstName, lastName, email, password });
        const savedUser = await user.save();
        const accessToken = await user.generateAccessToken();

        res.cookie('refreshToken', await user.generateRefreshToken(), REFRESH_TOKEN.cookie);

        res.status(201).json({ success: true, user: savedUser, accessToken});
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ error: errors });
        }
        res.status(500).json({ error: error.message, success: false });
    }
};

// Login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByCredentials(email, password);
        const accessToken = await user.generateAccessToken();

        res.cookie('refreshToken', await user.generateRefreshToken(), REFRESH_TOKEN.cookie);

        res.json({ success: true, user, accessToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get a user by ID
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "User not found" });
  }
};

