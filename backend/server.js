const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Needed to serve static images across origins
}));
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const rateLimit = require('express-rate-limit');

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login/register attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const blogEngagementLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Too many engagement actions, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Static files (media)
app.use('/media', express.static(path.join(__dirname, 'media')));

// Routes
app.use('/api/register', authLimiter);
app.use('/api/login', authLimiter);
app.use('/api/blogs/*/engagement', blogEngagementLimiter);
app.use('/api', generalLimiter);
app.get('/api/hello/', (req, res) => {
  res.json({ message: "Hello from Node.js backend!" });
});

app.post('/api/quiz/submit/', (req, res) => {
  const { answers, persona, timestamp } = req.body;
  console.log(`Quiz submitted - Persona: ${persona}, Answers: ${answers}, Timestamp: ${timestamp}`);
  res.json({
    message: 'Quiz submitted successfully',
    persona,
    answers,
    timestamp
  });
});

app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/profile'));
app.use('/api/products', require('./routes/products'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/community', require('./routes/community'));
app.use('/api/designs', require('./routes/designs'));
app.use('/api/lookbooks', require('./routes/lookbooks'));
app.use('/api/content', require('./routes/content'));
// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "An internal server error occurred" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
