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
const httpErrors = require('./errors/http');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

const app = express();

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

app.use(helmet());
app.use(bodyParser.json());

app.use(requestLogger);

app.post('/signup', validateCreateUser, createUser);
app.post('/signin', validateLogin, login);

app.use(auth);

app.use('/users', usersApi);
app.use('/cards', cardsApi);

app.use((req, res, next) => next(new httpErrors.NotFoundError('Неправильный путь')));

app.use(errorLogger);

app.use(validationErrors());
app.use(errors);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}...`); // eslint-disable-line no-console
});
