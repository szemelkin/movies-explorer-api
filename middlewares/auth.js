const jwt = require('jsonwebtoken');
const IncorrectAuth = require('../errors/incorrect-auth');

const JWT_SECRET = '12345';

// function getcookies(req) {
//   const { cookie } = req.headers;
//   if (cookie) {
//     const values = cookie.split(';').reduce((res, item) => {
//       const data = item.trim().split('=');
//       return { ...res, [data[0]]: data[1] };
//     }, {});
//     return values;
//   }
//   return undefined;
// }

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    throw new IncorrectAuth('Необходима авторизация');
  }

  const token = authorization.replace('Bearer ', '');
  // console.log(req.cookies);
  // console.log(req.headers);
  // const cookies = getcookies(req);
  // console.log(cookies);
  // if (!cookies) {
  //   next(res.status(403).send({ message: 'Авторизация не прошла' }));
  // } else {
  // const token = req.cookies.jwt;
  // const token = cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(res.status(403).send({ message: 'Авторизация не прошла' }));
  }
  req.user = payload;
  next();
  // }
};

module.exports = auth;
