const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const Vents = require('../../models/Vents');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// POST api/vents - create a new vent posts
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // retrive user and name from the DB
      const user = await User.findById(req.user.id).select('-password');

      const newVent = new Vents({
        text: req.body.text,
        name: user.name,
        user: req.user.id
      });

      const vent = await newVent.save();

      res.json(vent);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// GET api/vents - get all vents by all users registered
router.get('/', auth, async (req, res) => {
  try {
    // finds and sorts vents from most recent
    const vents = await Vents.find().sort({ date: -1 });

    res.json(vents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sever Error');
  }
});

// GET api/vetns/:id - get vents by id
router.get('/:id', auth, async (req, res) => {
  try {
    // req.param.id allows to get it from url
    const vent = await Vents.findById(req.params.id);

    if (!vent) {
      return res.status(404).json({ msg: 'Vent is not found' });
    }

    res.json(vent);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Vent is not found' });
    }

    res.status(500).send('Server Error');
  }
});

// DELETE api/vents/:id - Delete a vent by id
router.delete('/:id', auth, async (req, res) => {
  try {
    const vent = await Vents.findById(req.params.id);

    if (!vent) {
      return res.status(404).json({ msg: 'Vent is not found' });
    }

    // make sure that the user can only his own vent
    if (vent.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not Authorized to delete vent' });
    }
    await vent.remove();

    res.json(vent);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Vent is not found' });
    }

    res.status(500).send('Server Error');
  }
});

// PUT api/vents/love/:id - love a vent
router.put('/love/:id', auth, async (req, res) => {
  try {
    const vent = await Vents.findById(req.params.id);

    // Verify if already clicked love
    if (
      vent.love.filter(love => love.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: 'Already showed some love' });
    }

    vent.love.unshift({ user: req.user.id });

    await vent.save();

    res.json(vent.love);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT api/vents/unlove/:id - undo the love
router.put('/unlove/:id', auth, async (req, res) => {
  try {
    const vent = await Vents.findById(req.params.id);

    // Verify if already clicked love
    if (
      vent.love.filter(love => love.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: 'No love yet' });
    }

    // Find the correct love to be removed
    const removeIndex = vent.love
      .map(love => love.user.toString())
      .indexOf(req.user.id);

    vent.love.splice(removeIndex, 1);

    await vent.save();

    res.json(vent.love);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// POST api/vents/comment/:id - comment on a vent
router.post(
  '/comment/:id',
  [
    auth,
    [
      check('text', 'Use your words, please')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const vent = await Vents.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        user: req.user.id
      };

      vent.comments.unshift(newComment);

      await vent.save();

      res.json(vent.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Delete api/vents/comment/:id/:comment_id
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const vent = await Vents.findById(req.params.id);

    // extract comment
    const comment = vent.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'No such comment' });
    }

    // verify that the user deleting is the one logged in
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Get remove index
    const removeIndex = vent.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);

    vent.comments.splice(removeIndex, 1);

    await vent.save();

    res.json(vent.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
