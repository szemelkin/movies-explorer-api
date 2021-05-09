const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();
const cardRouter = require('./cards');
const userRouter = require('./users');

const {
  createUser,
  login,
} = require('../controllers/users');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().min(2)
      .max(30),
    password: Joi.string().min(2),
  }),
}),
login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().min(2)
      .max(30),
    password: Joi.string().min(2),
  }),
}),
createUser);

router.use('/users', userRouter);

router.use('/cards', cardRouter);

module.exports = router;
