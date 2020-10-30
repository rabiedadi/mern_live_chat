const mongoose = require('mongoose');

userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  username: { type: String, required: true },
});

module.exports = User = mongoose.model('user', userSchema);
