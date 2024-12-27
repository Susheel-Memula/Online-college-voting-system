const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Setup nodemailer (replace with your email service credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '',
        pass: ''
    }
});

// Store OTPs (in memory for this example, use a database in production)
const otps = {};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'jsjs.html'));
});

app.post('/send-otp', (req, res) => {
    const { email } = req.body;
    console.log('Received email:', email);
    const otp = Math.floor(100000 + Math.random() * 900000);
    otps[email] = otp;
    console.log('Generated OTP:', otp);

    const mailOptions = {
        from: '',
        to: email,
        subject: 'Your OTP for Online Voting',
        text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.json({ success: false, message: 'Failed to send OTP' });
        } else {
            console.log('Email sent:', info.response);
            res.json({ success: true, message: 'OTP sent successfully' });
        }
    });
});

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (otps[email] && otps[email].toString() === otp) {
        delete otps[email]; // Remove OTP after successful verification
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get('/voting', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'voting.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/submit-vote', (req, res) => {
    const { candidate } = req.body;
    // Here you would typically store the vote in a database
    // For this example, we're just sending it back to the client
    res.json({ success: true, message: 'Vote received', candidate });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});