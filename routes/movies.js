const { celebrate, Joi } = require('celebrate');

const router = require('express').Router();

const auth = require('../middlewares/auth');

const {
  getMovies,
  deleteMovieById,
  createMovie,
} = require('../controllers/movies');

router.use(auth);

router.get('/', getMovies);

router.post('/',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string(),
      director: Joi.string(),
      duration: Joi.number(),
      year: Joi.number(),
      description: Joi.string().min(2).max(2000),
      image: Joi.string(),
      trailer: Joi.string(),
      thumbnail: Joi.string(),
      movieId: Joi.number(),
      nameRU: Joi.string(),
      nameEN: Joi.string(),
    }),
  }),
  createMovie);

router.delete('/:movieId',
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().hex().length(24),
    }),
  }),
  deleteMovieById);

module.exports = router;
