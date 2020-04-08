const quotes = require('./quotes.json');

exports.getRandomOne = function() {
  const totalAmount = quotes.length;
  const rand = Math.floor(Math.random() * totalAmount);

  return quotes[rand];
};
