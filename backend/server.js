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
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (media)
app.use('/media', express.static(path.join(__dirname, 'media')));

// Routes
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
app.use('/api', require('./routes/community'));
app.use('/api', require('./routes/lookbooks'));
app.use('/api', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "An internal server error occurred" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
