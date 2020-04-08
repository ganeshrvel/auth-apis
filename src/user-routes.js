const express = require('express');
const _ = require('lodash');
const { validateToken } = require('./users');
const { decodeToken } = require('./users');
const { createIdToken, getUserScheme, users } = require('./users');

const app = (module.exports = express.Router());

app.post('/api/v1/users/register', function(req, res) {
  const userScheme = getUserScheme(req);

  if (!userScheme.username || !req.body.password) {
    return res.status(400).send({
      error_message: 'You must send the username and the password'
    });
  }

  if (_.find(users, userScheme.userSearch)) {
    return res.status(400).send({
      error_message: 'A user with that username already exists'
    });
  }

  const profile = _.pick(req.body, userScheme.type, 'password', 'extra');

  profile.id = _.max(users, 'id').id + 1;

  users.push(profile);

  res.status(201).send({
    error_message: null,
    token_id: createIdToken(profile)
  });
});

app.post('/api/v1/users/login', function(req, res) {
  const userScheme = getUserScheme(req);

  if (!userScheme.username || !req.body.password) {
    return res.status(400).send({
      error_message: 'You must send the username and the password'
    });
  }

  const user = _.find(users, userScheme.userSearch);

  if (!user) {
    return res.status(401).send({
      error_message: "The username or password don't match"
    });
  }

  if (user.password !== req.body.password) {
    return res.status(401).send({
      error_message: "The username or password don't match"
    });
  }

  res.status(201).send({
    error_message: null,
    token_id: createIdToken(user)
  });
});

app.get('/api/v1/users/getLogin', validateToken, function(req, res) {
  const { decodedValue: tokenData } = decodeToken(req);

  const user = _.find(users, tokenData.user);

  if (!user) {
    return res.status(401).send({
      error_message: 'no user found with this token'
    });
  }

  const { id, email, username } = user;

  return res.status(201).send({
    error_message: null,
    id,
    email,
    username
  });
});

app.get(
  '/api/v1/users/refreshToken',
  (req, res, next) => {
    return validateToken(req, res, next, true);
  },
  function(req, res) {
    const { decodedValue: tokenData } = decodeToken(req, true);

    const user = _.find(users, tokenData.user);

    if (!user) {
      return res.status(401).send({
        error_message: 'no user found with this token'
      });
    }

    res.status(201).send({
      error_message: null,
      token_id: createIdToken(user)
    });
  }
);
