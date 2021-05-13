const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const DefaultError = require('../errors/default-err');
const ValidationError = require('../errors/validation-err');
const ForbiddenError = require('../errors/forbidden-err');

const getMovies = (req, res, next) => {
  Movie.find({})
    .orFail()
    .then((movies) => {
      res.send(movies);
    })
    .catch((err) => {
      let error;
      if (err.name === 'CastError') {
        error = new ValidationError('Переданы некорректные данные');
      }
      next(error);
    });
};

function deleteMovieById(req, res, next) {
  const { movieId } = req.params;

  Movie.findById(movieId)
    .orFail()
    .then((movie) => {
      if (movie.owner.toString() === req.user._id) {
        return Movie.findByIdAndRemove(movieId)
          .orFail()
          .then((movieWithHash) => {
            res.send(movieWithHash);
          })
          .catch((err) => {
            let error2;
            if (err.name === 'CastError') {
              error2 = new ValidationError('Не валидный _id');
            } else if (err.name === 'DocumentNotFoundError') {
              error2 = new NotFoundError('Карточка не найдена');
            } else {
              error2 = new DefaultError('Ошибка по умолчанию');
            }
            next(error2);
          });
      }
      return next(new ForbiddenError('Можно удалять только свои карточки'));
    })
    .catch((err) => {
      let error;
      if (err.name === 'CastError') {
        error = new ValidationError('Не валидный _id');
      } else if (err.name === 'DocumentNotFoundError') {
        error = new NotFoundError('Карточка не найдена');
      } else {
        error = new DefaultError('Ошибка по умолчанию');
      }
      next(error);
    });
}

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  }).then((movie) => {
    res.send(movie);
  })
    .catch((err) => {
      let error;
      if (err.name === 'ValidationError') {
        error = new ValidationError('Переданы некорректные данные');
      } else {
        error = new DefaultError('Ошибка по умолчанию');
      }
      next(error);
    });
};

module.exports = {
  getMovies,
  deleteMovieById,
  createMovie,
};
