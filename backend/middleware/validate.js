const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return all error messages joined, or you can format it as needed
    return res.status(400).json({ 
      error: "Validation failed", 
      details: errors.array().map(e => e.msg).join(', ') 
    });
  }
  next();
};

module.exports = validate;
