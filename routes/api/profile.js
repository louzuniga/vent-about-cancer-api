const express = require('express');
const router = express.Router();
const config = require('config');
const request = require('request');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Vents = require('../../models/Vents');

// GET api/profile/mine. Will get curret users profile
router.get('/mine', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user'
    );

    if (!profile) {
      return res.status(400).json({ msg: 'No profile' });
    }

    res.json(profile);
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
      check('status', 'Please be sure to share your status')
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

    // pull everything from the req.body through object destrucing
    const {
      location,
      status,
      bio,
      twitter,
      linkedin,
      instagram,
      facebook
    } = req.body;

    // Build up profile fields obeject to insert into the DB
    const profileFields = {};
    profileFields.user = req.user.id;
    // check to make sure everything is coming in before it's set
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    // if (social) {
    //   profileFields.skills = skills.split(',').map(skill => skill.trim());
    // }

    // build social object
    profileFields.social = {};
    if (twitter) profileFields.social.twitter = twitter;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;
    if (facebook) profileFields.social.facebook = facebook;

    try {
      // finds profile by looking for user in req.user.id
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // if the profile is found Update it
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        // send back the profile
        return res.json(profile);
      }

      // if profile is not found then Create it
      profile = new Profile(profileFields);

      await profile.save();
      // Return profile
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// GET all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', 'name');
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET request to api/profile by user ID
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', 'name');

    if (!profile)
      return res.status(400).json({ msg: 'Profile does not exists' });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile does not exists' });
    }

    res.status(500).send('Server Error');
  }
});

// Delete request to api/profile that will delete profile, user and vents
router.delete('/', auth, async (req, res) => {
  try {
    // remove vents
    await Post.deleteMany({ user: req.user.id });

    // remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT request to api/profile/victim to add victim blog in profile page
router.put(
  '/victim',
  [
    auth,
    [
      check('name', 'name is required')
        .not()
        .isEmpty(),
      check('dates', 'Please write a short tribute')
        .not()
        .isEmpty(),
      check('relationship', 'name is required')
        .not()
        .isEmpty(),
      check('story', 'Please write a short tribute')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, dates, relationship, story } = req.body;

    const newVictim = {
      name,
      dates,
      relationship,
      story
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // victim array with unshift which prepends most recent post to top
      profile.victim.unshift(newVictim);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// DELETE api/profile/victim/:victim_id - Delete victim story from profile
router.delete('/victim/:victim_id', auth, async (req, res) => {
  try {
    //  retrive profile of logged in user
    const profile = await Profile.findOne({ user: req.user.id });

    //  Get the right victim to remove index and match the index by id
    const removeIndex = profile.victim
      .map(item => item.id)
      .indexOf(req.params.victim_id);

    profile.victim.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT request to api/profile/vent to add victim blog in profile page
router.put(
  '/vent',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('vent', 'Your vent is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, date, vent } = req.body;

    const newVent = {
      title,
      date,
      vent
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // victim array with unshift which prepends most recent post to top
      profile.vent.unshift(newVent);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// DELETE api/profile/vent/:vent_id - Delete vent story from profile
router.delete('/vent/:vent_id', auth, async (req, res) => {
  try {
    //  retrive profile of logged in user
    const profile = await Profile.findOne({ user: req.user.id });

    //  Get the right victim to remove index and match the index by id
    const removeIndex = profile.vent
      .map(item => item.id)
      .indexOf(req.params.vent);

    profile.vent.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
