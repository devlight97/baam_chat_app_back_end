const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

// api test create a message
router.get('/testcreate', (req, res) => {
  User.findOne({})
    .then(doc => {
      let newMessage = new Message({
        userId: doc._id,
        content: 'the first message',
      });
      newMessage.save(err => console.log('Error test create message: ', err))
    });
});

module.exports = router;