// Gmail Configuration (requires 2-Step Verification)
// 1. Go to: https://myaccount.google.com/security
// 2. Enable 2-Step Verification
// 3. Generate App Password (select 'Other' as device type)
// 4. Copy the 16-digit password below

module.exports = {
    service: 'gmail',
    auth: {
        user: 'your-actual-email@gmail.com', // Replace with your Gmail
        pass: 'your-16-digit-app-password'  // Replace with generated app password
    },
    tls: {
        rejectUnauthorized: false // For development only
    },
    logger: true // Enable detailed logging
};