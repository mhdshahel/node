const express = require('express');
const mysql = require('mysql');
const app = express();
const nodemailer = require('nodemailer');

const session = require('express-session');
// const bcrypt = require('bcrypt');
// require('dotenv').config();
const admin=require('./admin.js');
const booking=require('./booking.js');
app.use('/admin',admin);
app.use('/booking',booking);
// app.use(express.static('C:\Users\User\OneDrive\Desktop\node.2024\WhatsApp Image 2024-11-18 at 14.02.21_9c612d3f.jpg'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'defaultsecret',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 // 1 day (in milliseconds)
        }
    })
);

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'al rihla',
});

connection.connect((error) => {
    if (error) {
        console.error('Error connecting to database');
        return;
    }
    console.log('Connected to database');
});

/////////////////////////////////////////////////// User registration (insert)/////////////////////////////////////////////////
app.post('/insert', (req, res) => {
    const { name, password, phone, email, address,catagory } = req.body;
    const OTP = Math.floor(10000 + Math.random() * 900000);
    console.log(OTP);

    // Send OTP via email
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mhdshahel36@gmail.com',
            pass: 'odhe jnop autz wecp',
        }
    });

    const message = {
        from: 'mhdshahel36@gmail.com',
        to: email,
        subject: 'OTP FOR YOUR REGISTRATION',
        text: `YOUR OTP IS ${OTP}`,
    };

    transport.sendMail(message, (error, info) => {
        if (error) {
            console.log('Error sending OTP email:', error);
            return res.status(500).send('Error sending OTP');
        }

        req.session.user = { name: name, password: password, phone: phone, email: email, address: address, otp: OTP ,catagory:catagory };
        res.json({ message: 'OTP sent successfully' });
    });
});






//////////////////////////////// OTP verification and user insertion://///////////////////////////////////////////////////////////////
app.post('/otp', (req, res) => {
    const { OTP } = req.body;

    if (!req.session.user) {
        return res.status(400).send('Session expired or user not found');
    }

    const { name, password, email, phone, address, otp, catagory  } = req.session.user;

    // Validate OTP
    if (parseInt(OTP) !== otp) {
        return res.status(400).send('Invalid OTP');
    }

    

        connection.query(
            'INSERT INTO rihla (name, password, email, phone, address, catagory) VALUES (?, ?, ?, ?, ?,?)',[name, password, email, phone, address,catagory],
            (error, results) => {
                if (error) {
                    console.log(req.session.user);
                    
                    console.error('Error inserting data:', error);
                    return res.status(500).send('Error inserting data');
                }
                res.json({ message: 'User registered successfully' });
            }
        );
    });


// User login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    connection.query('SELECT * FROM rihla WHERE email = ?', [email], (error, results) => {
        if (error) {
            return res.status(500).send('Error fetching user');
        }

        if (results.length === 0) {
            return res.status(400).send('User not found');
        }

        bcrypt.compare(password, results[0].PASSWORD, (err, result) => {
            if (err) {
                return res.status(500).send('Error comparing password');
            }

            if (!result) {
                return res.status(400).send('Invalid credentials');
            }

            req.session.userid = email;
            res.json({ message: 'You are successfully logged in' });
        });
    });
});

////// User logout//////
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

app.listen(3000);
