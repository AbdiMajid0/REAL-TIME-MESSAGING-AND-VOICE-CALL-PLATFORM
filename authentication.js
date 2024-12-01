const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
require('dotenv').config();

const db = mysql.createPool({
    host: 'majid',
    user: 'root', 
    password: '', 
    database: 'chatapp', 
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 

    },
});


function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


async function sendOtp(req, res) {
    const { email  } = req.body;

    if (!email) {
        return res.status(400).send('Email is required');
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); 
        await db.query('UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?', [otp, otpExpiry, email]);

        await transporter.sendMail({
            from: 'process.env.EMAIL_USER',
            to: email,
            subject: 'Your OTP Code',
            text: `OTP kodunuz ${otp}. 5 dakaki sonra sona erecek .`,
        });

        res.send('OTP sent to your email');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sending OTP');
    }
}

async function verifyOtp(req, res) {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).send('Email and OTP are required');
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = rows[0];

        if (user.otp === otp && new Date(user.otp_expiry) > new Date()) {
            await db.query('UPDATE users SET otp = NULL, otp_expiry = NULL WHERE email = ?', [email]);
            res.send('OTP verified successfully');
        } else {
            res.status(401).send('Invalid or expired OTP');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error verifying OTP');
    }
}

module.exports = { sendOtp, verifyOtp };
