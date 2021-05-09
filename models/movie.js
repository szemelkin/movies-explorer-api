const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 150,
  },
  director: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 150,
  },
  duration: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
          return /d{10}/.test(v);
      },
      message: '{VALUE} is not a valid 10 digit number!'
  },
    minlength: 2,
    maxlength: 4,
  },
  year: {
    type: Date,
    required: true,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 1000,
  },
  image: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        const regexp = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w\W.-]*)#?$/g;
        return regexp.test(v);
      },
      message: 'Ссылка не верна',
    },
  },
  thumbnail: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        const regexp = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w\W.-]*)#?$/g;
        return regexp.test(v);
      },
      message: 'Ссылка не верна',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
          return /d{10}/.test(v);
      },
      message: '{VALUE} is not a valid 10 digit number!'
  },
    minlength: 2,
    maxlength: 10,
  },
  nameRU: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  nameEN: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
});

module.exports = mongoose.model('card', cardSchema);
