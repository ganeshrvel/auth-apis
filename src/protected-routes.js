const express = require('express');
const quoter = require('./quoter');
const { validateToken } = require('./users');

const app = (module.exports = express.Router());

app.use('/api/v1/protected', validateToken);

app.get('/api/v1/protected/random-quote', function(req, res) {
  res.status(200).send({
    error_message: null,
    quote: quoter.getRandomOne()
  });
});

app.get('/api/v1/protected/paid-quote', function(req, res) {
  res.status(402).send({
    error_message: 'Not free, requires payment'
  });
});
