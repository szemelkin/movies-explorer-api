const { celebrate, Joi } = require('celebrate');

const router = require('express').Router();

const auth = require('../middlewares/auth');

const {
  getUsers,
  renewUser,
  getUserSelf,
} = require('../controllers/users');

router.use(auth);

// Пусть будет этот роут для разработки
router.get('/', getUsers);

router.get('/me',
  celebrate({
    query: Joi.object().keys({
      _id: Joi.string().hex(),
    }),
  }),
  getUserSelf);

router.patch('/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().min(2).max(30),
    }),
  }),
  renewUser);

module.exports = router;
