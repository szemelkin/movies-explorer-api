const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const cors = require('cors');

const NotFoundError = require('../errors/not-found-err');
const DefaultError = require('../errors/default-err');
const ValidationError = require('../errors/validation-err');
const AlreadyExist = require('../errors/already-exist');
const IncorrectAuth = require('../errors/incorrect-auth');

const JWT_SECRET = '12345';

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
          }, JWT_SECRET);
          res
            // .cookie('jwt', token, {
            //   httpOnly: true,
            //   maxAge: 3600000,
            //   sameSite: true,
            // })
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
    about,
    avatar,
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
            about,
            avatar,
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
                error = new ValidationError('Не валидный _id');
              } else {
                error = new DefaultError('Ошибка по умолчанию');
              }
              next(error);
            });
        });
      return undefined;
    });
  return undefined;
};

const renewUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
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
                error = new ValidationError('Не валидный _id');
              } else {
                error = new DefaultError('Ошибка по умолчанию');
              }
              next(error);
            });
        });
      return undefined;
    });
  return undefined;
};


module.exports = {
  getUsers,
  createUser,
  renewUser,
  login,
  getUserSelf,
};