require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const cors = require('cors');
const User = require('../models/user');

const NotFoundError = require('../errors/not-found-err');
const DefaultError = require('../errors/default-err');
const ValidationError = require('../errors/validation-err');
const AlreadyExist = require('../errors/already-exist');
const IncorrectAuth = require('../errors/incorrect-auth');

const getUsers = (req, res, next) => {
  User.find({})
    .orFail()
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      let error;
      if (err.name === 'CastError') {
        error = new ValidationError('Переданы некорректные данные');
      } else {
        error = new DefaultError('Ошибка по умолчанию');
      }
      next(error);
    });
};

const getUserSelf = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      let error;
      if (err.name === 'CastError') {
        error = new ValidationError('Не валидный _id');
      } else if (err.name === 'DocumentNotFoundError') {
        error = new NotFoundError('Пользователь по указанному _id не найден.');
      } else {
        error = new DefaultError('Ошибка по умолчанию');
      }
      next(error);
    });
};

const { NODE_ENV, JWT_SECRET } = process.env;
// console.log('JWT ', JWT_SECRET);

const login = (req, res, next) => {
  const {
    email,
    password,
  } = req.body;

  if (!email || !password) {
    return next(new ValidationError('Email или пароль не могут быть пустыми'));
  }

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new IncorrectAuth('Пользователя не существует'));
      }
      bcrypt.compare(password, user.password, ((error, isValid) => {
        if (error) {
          return next(new NotFoundError('Неверные логин или пароль'));
        }
        if (isValid) {
          const token = jwt.sign({
            _id: user._id,
          },
          NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
          res
            .status(200)
            .send({ token });
        }
        if (!isValid) {
          return next(new NotFoundError('Неверные логин или пароль'));
        }
        return undefined;
      }));
      return undefined;
    });
  return undefined;
};

const createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;
  if (!email || !password) {
    return next(new ValidationError('Email или пароль не могут быть пустыми'));
  }
  User.findOne(
    { email },
  )
    .then((user) => {
      if (user) {
        return next(new AlreadyExist('Пользователь уже существует'));
      }
      bcrypt.hash(password, 10)
        .then((hash) => {
          User.create({
            name,
            email,
            password: hash,
          })
            .then((userWithHash) => {
              User.findById(userWithHash._id)
                .then((userWithoutHash) => {
                  res.send(userWithoutHash);
                });
            })
            .catch((err) => {
              let error;
              if (err.name === 'ValidationError') {
                error = new ValidationError('Не все обязательные поля введены или введены некорректно');
              }
              next(error);
            });
        });
      return undefined;
    });
  return undefined;
};

const renewUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    {
      new: false,
      runValidators: true,
      upsert: true,
    },
  )
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      let error;
      if (err.name === 'ValidationError') {
        error = new ValidationError('Переданы некорректные данные при создании пользователя');
      } else if (err.name === 'DocumentNotFoundError') {
        error = new NotFoundError('Пользователь по указанному _id не найден.');
      } else {
        error = new DefaultError('Ошибка по умолчанию');
      }
      next(error);
    });
};

module.exports = {
  getUsers,
  createUser,
  renewUser,
  login,
  getUserSelf,
};
