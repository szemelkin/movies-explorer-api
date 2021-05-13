require('dotenv').config();
const jwt = require('jsonwebtoken');
const IncorrectAuth = require('../errors/incorrect-auth');

const { NODE_ENV, JWT_SECRET } = process.env;
// console.log('JWT ', JWT_SECRET);

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    throw new IncorrectAuth('Необходима авторизация');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
    // payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(res.status(401).send({ message: 'Авторизация не прошла' }));
  }
  req.user = payload;
  next();
};

module.exports = auth;
