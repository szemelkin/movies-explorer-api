const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    // unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Поле "email" должно быть валидным email-адресом',
    },
  },
  password: {
    type: String,
    minlength: 2,
    select: false,
    required: true,
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },

});

module.exports = mongoose.model('user', userSchema);
