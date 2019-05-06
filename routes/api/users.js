const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

// Bring in user model
const User = require('../../models/User');

// register user
router.post(
  '/',
  // validation
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Plese enter a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 8 or more characters'
    ).isLength({ min: 8 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // reaches for name, email, password within req.body
    const { name, email, password } = req.body;

    try {
      // Check for duplicate user
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      //create new user instance
      user = new User({
        name,
        email,
        password
      });

      // Ecrypt password
      const salt = await bcrypt.genSalt(10);
      // hashes user password
      user.password = await bcrypt.hash(password, salt);

      // saves the user instance above
      await user.save();
      // Return jsonwebtoken

      res.send('User registred');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
