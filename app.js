require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const routers = require('./routes');
const NotFoundError = require('./errors/not-found-err');
const { requestLogger, errorLogger } = require('./middlewares/logger');

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  // setDefaultsOnInsert: true,
  // new: true,
  // upsert: true,
});

const { PORT = 3000 } = process.env;

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use(cors());

app.use(requestLogger);

app.use(bodyParser.json());

app.use(routers);

app.use(errorLogger);

app.use(errors());

// app.get('*', (_req, _res, next) => next(new NotFoundError('Такой страницы не существует')));
app.all('*', (_req, _res, next) => next(new NotFoundError('Такой страницы не существует')));

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).send({ message: err.message || 'Произошла ошибка на сервре' });
  next();
});

app.listen(PORT, () => {});
