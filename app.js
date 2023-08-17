const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const usersApi = require('./routes/users');
const cardsApi = require('./routes/cards');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(bodyParser.json());
app.use((req, res, next) => {
  req.user = {
    _id: '64dbd61793f3c5f5a97f9c5b',
  };

  next();
});

app.use('/users', usersApi);
app.use('/cards', cardsApi);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}...`); // eslint-disable-line no-console
});
