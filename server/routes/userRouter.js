const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const {
      email, username, password, passwordCheck,
    } = req.body;
    if (!email || !username || !password || !passwordCheck) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least of 8 characters long.' });
    }
    if (password !== passwordCheck) {
      return res.status(400).json({ message: 'Passwords don\'t match.' });
    }
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHach = await bcrypt.hash(password, salt);
    const user = new User({
      email,
      password: passwordHach,
      username,
    });
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ message: `${err.name}: ${err.error}` });
  }
  return true;
});
router.post('/refresh', async (req, res) => {
  try {
    const refToken = req.headers.authorization.split(' ')[1]; // TODO send ref token in the right place
    jwt.verify(refToken, process.env.JWT_SECRET, (err, verified) => {
      if (err) return res.status(401).json({ message: `${err.name}: ${err.message}` });
      const accessToken = jwt.sign({ id: verified.id }, process.env.JWT_SECRET, { expiresIn: '10s' });
      res.json({ accessToken });
      return true;
    });
  } catch (err) {
    res.status(500).json({ message: `${err.name}: ${err.message}` });
  }
  return true;
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate
    if (!email || !password) { return res.status(400).json({ mesaage: 'Missing required fields.' }); }

    const user = await User.findOne({ email });
    if (!user) { return res.status(400).json({ message: 'No account with this email has been found.' }); }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) { return res.status(400).json({ message: 'Invalid credentials.' }); }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '10s' },
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: `${err.name}: ${err.error}` });
  }
  return true;
});

router.delete('/delete', auth, async (req, res) => {
  try {
    const deleteUser = User.findOneAndDelete(req.user);
    res.json(deleteUser);
  } catch (err) {
    res.status(500).json({ message: `${err.name}: ${err.error}` });
  }
});

router.post('/tokenIsValid', auth, async (req, res) => res.json(true));

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const { id, email, username } = user;
    res.json({ id, email, username });
  } catch (err) {
    res.status(500).json({ message: `${err.name}: ${err.error}` });
  }
});
module.exports = router;
