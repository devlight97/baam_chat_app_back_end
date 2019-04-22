const express = require('express');
const router = express.Router();
const ChatBox = require('../models/ChatBox');
const User = require('../models/User');
const helper = require('./helper');
const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

// api test create a chat box
router.get('/testcreate', (req, res) => {
  User.findOne({})
    .then(doc => {
      let newChatBox = new ChatBox({
        userIds: [doc._id, new ObjectId('5caf5947763d7534ad623880')],
        messageIds: [new ObjectId('5cb08edc67b6e13d7c45d698'), new ObjectId('5cb094b2f7a1233f876cf5cf')],
      });
      newChatBox.save(err => console.log('Error test create chat box: ', err))
    });
});

router.post('/', (req, res) => {
  helper.checkToken(
    req.body.accessToken,
    req.body.providerId,
    checkResult => {
      if (checkResult) {
        const responseData = {
          status: 'susscess',
          auth: true,
          reason: 'Xác thực người dùng thành công',
        }
        ChatBox.$getListChatBoxByUserId(req.body.userId)
          .then(docs => {
            responseData.listChatBox = docs;

            // get list user id from list chat box
            const listFriendId = []
            docs.forEach(el => {
              el.userIds.forEach(friendId => {
                if (friendId.toString() !== req.body.userId) {
                  listFriendId.push(ObjectId(friendId))
                }
              });
            });
            return User.$getListUserByListId(listFriendId)
          })
          .then(friends => {
            responseData.listFriend = friends;
            res.send(responseData);
          })
          .catch(err => console.log('Error:', err));

      } else {
        res.send({
          status: 'fail',
          auth: false,
          reason: 'Xác thực người dùng thất bại',
        });
      }
    }
  );
});



module.exports = router;