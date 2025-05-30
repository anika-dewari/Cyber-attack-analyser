const User = require('../models/User');
const bcrypt = require('bcryptjs');

// User registration
const register = async (req, res) => {
    try {
        console.log('Registration attempt:', req.body);
        const { email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ 
            email, 
            password: hashedPassword 
        });
        await user.save();
        console.log('User registered successfully:', email);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message });
    }
};

// User login
const login = async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('Login failed: User not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Login failed: Invalid password');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set cookies
        res.cookie('userId', user._id, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.cookie('userEmail', user.email, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log('Login successful:', email);
        res.json({ 
            message: 'Login successful', 
            user: {
                email: user.email,
                id: user._id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get scan history
const getScanHistory = async (req, res) => {
    try {
        console.log('Fetching scan history for user:', req.params.userId);
        const user = await User.findById(req.params.userId).populate('scanHistory');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user.scanHistory);
    } catch (error) {
        console.error('Error fetching scan history:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    register,
    login,
    getScanHistory
}; 