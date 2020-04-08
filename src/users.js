const jwt = require('jsonwebtoken');
const _ = require('lodash');
const { usersConfig } = require('./config');

// XXX: This should be a database of users :).
const usersList = [
  {
    id: 1,
    username: 'user',
    password: 'password',
    email: 'user@gmail.com'
  }
];

module.exports.users = usersList;

const createIdToken = user => {
  return jwt.sign(_.omit(user, 'password'), usersConfig.secret, {
    expiresIn: 60 * 60 * 5
  });
};

module.exports.createIdToken = createIdToken;

// Generate Unique Identifier for the access token
const genJti = () => {
  let jti = '';
  let possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 16; i++) {
    jti += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return jti;
};

module.exports.genJti = genJti;

const createAccessToken = () => {
  return jwt.sign(
    {
      iss: usersConfig.issuer,
      aud: usersConfig.audience,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      scope: 'full_access',
      sub: 'lalaland|gonto',
      jti: genJti(), // unique identifier for the token
      alg: 'HS256'
    },
    usersConfig.secret
  );
};

module.exports.createAccessToken = createAccessToken;

const getUserScheme = req => {
  let username;
  let type;
  let userSearch = {};

  // The POST contains a username and not an email
  if (req.body.username) {
    username = req.body.username;
    type = 'username';
    userSearch = { username: username };
  }
  // The POST contains an email and not an username
  else if (req.body.email) {
    username = req.body.email;
    type = 'email';
    userSearch = { email: username };
  }

  return {
    username: username,
    type: type,
    userSearch: userSearch
  };
};

module.exports.getUserScheme = getUserScheme;

const extractToken = authorizationToken => {
  const token = authorizationToken.split(' ');

  return token[token.length - 1];
};

module.exports.extractToken = extractToken;

const decodeToken = (req, ignoreExpiredToken) => {
  if (
    req.headers.authorization === undefined ||
    req.headers.authorization === null ||
    req.headers.authorization === ''
  ) {
    return {
      invalidTokenHeader: true
    };
  }

  const token = extractToken(req.headers.authorization);

  let decodedValue;

  try {
    decodedValue = jwt.verify(token, usersConfig.secret, {
      ignoreExpiration: ignoreExpiredToken
    });
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return {
        expiredToken: true
      };
    }

    return {
      invalidToken: true
    };
  }

  return {
    decodedValue
  };
};

module.exports.decodeToken = decodeToken;

const validateToken = (req, res, next, ignoreExpiredToken = false) => {
  const { invalidTokenHeader, invalidToken, expiredToken } = decodeToken(
    req,
    ignoreExpiredToken
  );

  if (invalidTokenHeader) {
    return res.status(401).send({
      error_message: 'invalid authorization token in the header'
    });
  }

  if (invalidToken) {
    return res.status(401).send({
      error_message: 'invalid authorization token'
    });
  }

  if (expiredToken) {
    return res.status(401).send({
      error_message: 'authorization token is expired',
      token_expired: true
    });
  }

  next();
};

module.exports.validateToken = validateToken;
