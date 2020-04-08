const express = require('express');
const app = (module.exports = express.Router());

app.get('/api/v1/500', function(req, res) {
  res.status(500).send({
    error_message: '500 Error'
  });
});

app.get('*', function(req, res) {
  res.status(404).send({
    error_message: '404 Error'
  });
});
