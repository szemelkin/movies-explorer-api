module.exports = {
  extends: [
    'airbnb-base',
  ],

  rules: {
    'no-underscore-dangle': ['off', { allow: ['_id'] }],
  },
};
