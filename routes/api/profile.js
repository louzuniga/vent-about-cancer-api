const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');
const Profile = require('../../models/Profile');

// GET api/profile/mine. Will get curret users profile
router.get('/mine', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user'
    );

    if (!profile) {
      return res.status(400).json({ msg: 'No profile' });
    }

    res, json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create or update user profile
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Please be sure to share status')
        .not()
        .isEmpty(),
      check('location', 'Please share your location')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  }
);

module.exports = router;
