const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');

const bodyParser = require('body-parser');

const { errors } = require('celebrate');

const routers = require('./routes');

const NotFoundError = require('./errors/not-found-err');

const { requestLogger, errorLogger } = require('./middlewares/logger');

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  // setDefaultsOnInsert: true,
  // new: true,
  // upsert: true,
});

const { PORT = 3000 } = process.env;

const app = express();

app.use(cors());

app.use(requestLogger);

app.use(bodyParser.json());

app.use(routers);

app.use(errorLogger);

app.use(errors());

app.get('*', (_req, _res, next) => next(new NotFoundError('Такой страницы не существует')));

app.use((err, req, res, next) => {
  res.status(err.statusCode).send({ message: err.message });
  next();
});

app.listen(PORT, () => {});
