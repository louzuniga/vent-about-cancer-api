const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const Posts = require('../../models/Posts');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// POST api/posts - create a new post
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

      const newPost = new Posts({
        text: req.body.text,
        name: user.name,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// GET api/posts - get all posts by all users registered
router.get('/', auth, async (req, res) => {
  try {
    // finds and sorts posts from most recent
    const posts = await Posts.find().sort({ date: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sever Error');
  }
});

// GET api/vetns/:id - get posts by id
router.get('/:id', auth, async (req, res) => {
  try {
    // req.param.id allows to get it from url
    const post = await Posts.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post is not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post is not found' });
    }

    res.status(500).send('Server Error');
  }
});

// DELETE api/posts/:id - Delete a post by id
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post is not found' });
    }

    // make sure that the user can only his own post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not Authorized to delete post' });
    }
    await post.remove();

    res.json(post);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post is not found' });
    }

    res.status(500).send('Server Error');
  }
});

// PUT api/posts/love/:id - love a post
router.put('/love/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);

    // Verify if already clicked love
    if (
      post.love.filter(love => love.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: 'Already showed some love' });
    }

    post.love.unshift({ user: req.user.id });

    await post.save();

    res.json(post.love);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT api/posts/unlove/:id - undo the love
router.put('/unlove/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);

    // Verify if already clicked love
    if (
      post.love.filter(love => love.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: 'No love yet' });
    }

    // Find the correct love to be removed
    const removeIndex = post.love
      .map(love => love.user.toString())
      .indexOf(req.user.id);

    post.love.splice(removeIndex, 1);

    await post.save();

    res.json(post.love);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// POST api/posts/comment/:id - comment on a post
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
      const post = await Posts.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Delete api/posts/comment/:id/:comment_id
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);

    // extract comment
    const comment = post.comments.find(
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
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
