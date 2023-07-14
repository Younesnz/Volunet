const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/userModel');

// Define validation
const registerSchema = Joi.object({
    username: Joi.string().min(4).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

exports.registerUser = async (req, res) => {
    const { error } = registerSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password } = req.body;

    try {
        const user = new User({ username, email, password });
        await user.save();
        return res
            .status(201)
            .json({ message: 'User registered successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.loginUser = async (req, res) => {
    const { error } = loginSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(400)
                .json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res
                .status(400)
                .json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        return res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Authenticated User Controllers

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) throw Error('User does not exist');
        return res.json(user);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!user) throw Error('User does not exist');
        return res.json(user);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
};

// Admin Controllers

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find(req.query);
        return res.json(users);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) throw Error('User does not exist');
        res.json(user);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
};

exports.updateUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!user) throw Error('User does not exist');
        res.json(user);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
};

exports.deleteUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) throw Error('User does not exist');
        res.json({ msg: 'User deleted successfully' });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
};
