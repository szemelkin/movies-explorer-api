const { celebrate, Joi } = require('celebrate');

const router = require('express').Router();

const auth = require('../middlewares/auth');

const {
  getMovies,
  deleteMovieById,
  createMovie,
} = require('../controllers/movie');

router.use(auth);

router.get('/', getMovies);

router.post('/',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      link: Joi.string(),
    }),
  }),
  createMovie);

router.delete('/:movieId',
celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  }),
}),
deleteMovieById);

module.exports = router;
