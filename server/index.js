require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const connectDB = require('./config/database');

// Import Models
const User = require('./models/User');
const Note = require('./models/Note');
const OTP = require('./models/OTP');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const APP_PORT = Number(process.env.PORT || 4000);

// Connect to MongoDB
connectDB();

async function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function signJwt(user) {
  return jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

async function start() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  const transporter = await createTransporter();

  // Send OTP
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { email, name, dob } = req.body || {};
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
      }

      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Save OTP to database
      await OTP.create({ email: email.toLowerCase(), code, expiresAt });

      const info = await transporter.sendMail({
        from: process.env.MAIL_FROM || 'no-reply@example.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Hello${name ? ' ' + name : ''}, your OTP is ${code}. It expires in 5 minutes.`,
        html: `<p>Hello${name ? ' ' + name : ''},</p><p>Your OTP is <b>${code}</b>. It expires in 5 minutes.</p>`,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      return res.json({ message: 'OTP sent', previewUrl });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Failed to send OTP' });
    }
  });

  // Verify OTP => upsert user => issue JWT
  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { email, otp, name, dob } = req.body || {};
      if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

      // Find and verify OTP
      const otpRecord = await OTP.findOne({ 
        email: email.toLowerCase(), 
        code: otp,
        expiresAt: { $gt: new Date() }
      });

      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      // Delete used OTP
      await OTP.findByIdAndDelete(otpRecord._id);

      // Find or create user
      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        user = await User.create({
          email: email.toLowerCase(),
          name: name || 'User',
          dob: dob || '',
          provider: 'email'
        });
      } else {
        // Update user info if provided
        if (name && !user.name) user.name = name;
        if (dob && !user.dob) user.dob = dob;
        await user.save();
      }

      const token = signJwt(user);
      return res.json({ token, user });
    } catch (error) {
      console.error('OTP verification error:', error);
      return res.status(500).json({ message: 'OTP verification failed' });
    }
  });

  // Google sign-in
  app.post('/api/auth/google', async (req, res) => {
    try {
      const { email, name } = req.body || {};
      if (!email) return res.status(400).json({ message: 'Email is required' });

      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        user = await User.create({
          email: email.toLowerCase(),
          name: name || 'Google User',
          provider: 'google'
        });
      }

      const token = signJwt(user);
      return res.json({ token, user });
    } catch (error) {
      console.error('Google auth error:', error);
      return res.status(500).json({ message: 'Google authentication failed' });
    }
  });

  // Me
  app.get('/api/me', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ user });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Notes
  app.get('/api/notes', authMiddleware, async (req, res) => {
    try {
      const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
      return res.json({ notes });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch notes' });
    }
  });

  app.post('/api/notes', authMiddleware, async (req, res) => {
    try {
      const { title, text } = req.body || {};
      if (!title || !title.trim()) return res.status(400).json({ message: 'Note title is required' });
      if (!text || !text.trim()) return res.status(400).json({ message: 'Note text is required' });

      const note = await Note.create({
        userId: req.userId,
        title: title.trim(),
        text: text.trim()
      });

      return res.status(201).json({ note });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create note' });
    }
  });

  app.delete('/api/notes/:id', authMiddleware, async (req, res) => {
    try {
      const note = await Note.findOneAndDelete({ 
        _id: req.params.id, 
        userId: req.userId 
      });
      
      if (!note) return res.status(404).json({ message: 'Note not found' });
      return res.json({ message: 'Deleted' });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete note' });
    }
  });

  app.listen(APP_PORT, () => console.log(`API running on http://localhost:${APP_PORT}`));
}

start().catch((e) => {
  console.error('Failed to start server', e);
  process.exit(1);
});