const express = require('express'),
  quoter = require('./quoter');

const app = (module.exports = express.Router());

app.get('/api/v1/random-quote', function(req, res) {
  res.status(200).send({
    error_message: null,
    quote: quoter.getRandomOne()
  });
});
