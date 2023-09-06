const mongoose = require('mongoose');
const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({}).populate(['owner', 'likes'])
    .then((cards) => res.send(cards.map((card) => card.toObject())))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const { _id: owner } = req.user;
  Card.create({ name, link, owner })
    .then((card) => card.populate('owner'))
    .then((card) => res.status(201).send(card.toObject()))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(400).send({ message: err.message });
        return;
      }
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndDelete(cardId).orFail()
    .then(() => {
      res.send({ message: 'Карточка удалена' });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(404).send({ message: 'Карточка не найдена' });
        return;
      }
      if (err instanceof mongoose.Error.CastError) {
        res.status(400).send({ message: err.message });
        return;
      }
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

function updateLike(cardId, userId, like, res) {
  const query = {};
  query[like ? '$addToSet' : '$pull'] = { likes: userId };
  Card.findByIdAndUpdate(
    cardId,
    query,
    { new: true, runValidators: true },
  ).populate(['owner', 'likes']).orFail()
    .then((card) => {
      res.send(card.toObject());
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(404).send({ message: 'Карточка не найдена' });
        return;
      }
      if (err instanceof mongoose.Error.CastError) {
        res.status(400).send({ message: err.message });
        return;
      }
      res.status(500).send({ message: 'Произошла ошибка' });
    });
}

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  const { _id: userId } = req.user;
  updateLike(cardId, userId, true, res);
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  const { _id: userId } = req.user;
  updateLike(cardId, userId, false, res);
};