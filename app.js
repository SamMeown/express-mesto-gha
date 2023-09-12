const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { errors: validationErrors } = require('celebrate');

const usersApi = require('./routes/users');
const cardsApi = require('./routes/cards');
const { createUser, login } = require('./controllers/users');
const { validateCreateUser, validateLogin } = require('./validators/user');
const auth = require('./middlewares/auth');
const errors = require('./middlewares/errors');

const { PORT = 3000, DB_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

const app = express();

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

app.use(helmet());
app.use(bodyParser.json());

app.post('/signup', validateCreateUser, createUser);
app.post('/signin', validateLogin, login);

app.use(auth);

app.use('/users', usersApi);
app.use('/cards', cardsApi);

app.use((req, res) => res.status(404).send({ message: 'Неправильный путь' }));

app.use(validationErrors());
app.use(errors);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}...`); // eslint-disable-line no-console
});
