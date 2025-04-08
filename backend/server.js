const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

// Mock email service
const transporter = {
  sendMail: (mailOptions, callback) => {
    const resetLink = mailOptions.html.match(/http[^"]+/)[0];
    console.log('\x1b[36m%s\x1b[0m', '=== Mock Email Service ===');
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('Reset Link:', resetLink);
    console.log('=========================');
    callback(null, { response: 'Mock email service - see console for reset link' });
  }
};
console.log('Running with mock email service - reset links will appear in terminal');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Serve static files from root directory
app.use(express.static(path.join(__dirname, '..')));

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Mock database
let users = [];
let resumes = [];
let passwordResetTokens = {};

// Password reset endpoint
app.post('/api/reset-password', (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user) {
        return res.status(404).json({ error: 'Email not found' });
    }

    // Generate reset token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    passwordResetTokens[email] = token;
    console.log('Generated token for', email, ':', token); // Debug output

    // Send email
    console.log('Constructing reset link...'); // Debug output
    const resetUrl = `http://localhost:8000/reset-password.html?token=${token}&email=${encodeURIComponent(email)}`;
    console.log('Reset URL:', resetUrl); // Debug output
    
    const mailOptions = {
        from: 'no-reply@example.com',
        to: email,
        subject: 'Password Reset Request',
        html: `Click <a href="${resetUrl}">here</a> to reset your password.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Email send error:', {
                message: error.message,
                code: error.code,
                response: error.response
            });
            return res.status(500).json({ 
                error: 'Failed to send email',
                details: error.message 
            });
        }
        res.json({ 
            message: 'Password reset link generated (see terminal)',
            email: mailOptions.to
        });
    });
});

// Routes
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    users.push({ email, password });
    res.status(201).json({ message: 'User registered successfully' });
});

app.post('/api/save-resume', (req, res) => {
    const { email, resumeData } = req.body;
    resumes.push({ email, ...resumeData });
    res.status(200).json({ message: 'Resume saved successfully' });
});

app.get('/api/resumes/:email', (req, res) => {
    const userResumes = resumes.filter(r => r.email === req.params.email);
    res.status(200).json(userResumes);
});

// Serve HTML files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Start Server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (without MongoDB)`);
});
