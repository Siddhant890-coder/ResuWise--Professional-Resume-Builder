const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const compression = require('compression');
const fs = require('fs');

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
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files with caching
app.use(express.static(path.join(__dirname, '..'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    const mimeType = express.static.mime.lookup(path);
    if (mimeType === 'text/html') {
      res.setHeader('Cache-Control', 'public, max-age=0');
    } else if (mimeType.includes('javascript') || mimeType.includes('css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Mock database
let users = [
  {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    id: 1
  }
];
let resumes = [];
let passwordResetTokens = {};

// JWT mock functions
const jwt = {
  sign: (payload) => `mock-jwt-token-${payload.id}`,
  verify: (token) => ({ 
    id: token.split('-')[3],
    email: 'test@example.com',
    name: 'Test User'
  })
};

// Token verification endpoint
app.post('/api/verify-token', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token required' });
    }
    
    try {
        const decoded = jwt.verify(token);
        res.json({ user: decoded });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = jwt.sign({ id: user.id });
    res.json({
      user: {
        email: user.email,
        name: user.name,
        id: user.id
      },
      token
    });
  } else {
    res.status(401).json({ 
      message: 'Invalid email or password' 
    });
  }
});

// Google OAuth verification
app.post('/api/auth/google', (req, res) => {
  const token = jwt.sign({ id: 2 });
  res.json({
    user: {
      email: 'google-user@example.com',
      name: 'Google User',
      id: 2
    },
    token
  });
});

// LinkedIn OAuth verification
app.post('/api/auth/linkedin', (req, res) => {
  const token = jwt.sign({ id: 3 });
  res.json({
    user: {
      email: 'linkedin-user@example.com',
      name: 'LinkedIn User',
      id: 3
    },
    token
  });
});

// Authentication middleware
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token);
      return next();
    } catch (err) {
      console.error('JWT verification failed:', err);
    }
  }
  // Continue without auth for non-API routes
  if (!req.path.startsWith('/api')) return next();
  res.status(401).json({ message: 'Unauthorized' });
});

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

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve specific HTML files directly
['/login', '/dashboard', '/reset-password', '/preview'].forEach(route => {
  app.get(route, (req, res) => {
    const filePath = path.join(__dirname, `..${route}.html`);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('Not found');
    }
  });
});

// Client-side routing fallback
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, `../${req.path}`);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) return res.sendFile(filePath);
    res.sendFile(path.join(__dirname, '../index.html'));
  });
});

// Start Server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (without MongoDB)`);
});
