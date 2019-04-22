const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/testcreate', function (req, res) {
  const newUser = new User({
    name: 'Kim Long',
    img: 'https://scontent.fsgn5-5.fna.fbcdn.net/v/t1.0-1/p160x160/51137458_2536257143057862_4425742573352517632_n.jpg?_nc_cat=100&_nc_oc=AQlJYg01wTFQ5IHwobts_gGhKm5ITcvN9YmAsQWREmP6zzDlrEJYkoxwxI6fyrjxkNk&_nc_ht=scontent.fsgn5-5.fna&oh=755eb2a43026dab0aed4db32c56a5d5b&oe=5D3A8B43',
    provider: 'FACEBOOK',
    providerId: '123123123',
    accessToken: '123123123'
  });
  newUser.save(err => {
    if (err) {
      console.log(err);
      res.render('fail.ejs');
    } else res.render('success.ejs');
  });
});

// /users/login (api đăng nhập)
router.post('/login', function (req, res, next) {
  const userInfo = req.body;
  User.findOne({ providerId: userInfo.providerId }, function (err, user) {
    if (err) {
      console.log(err)
      res.send({ status: 'fail' });
    } else {
      // console.log('user find one: ', user)
      if (user === null) {
        let newUser = new User({
          name: userInfo.name,
          img: userInfo.img,
          provider: userInfo.provider,
          providerId: userInfo.providerId,
          accessToken: userInfo.accessToken,
        });
        newUser.save((err, user) => {
          if (err) {
            console.log('Error create a user: ', err);
            res.send({ status: 'fail', auth: false, });
          } else {
            console.log('create user success.');
            res.send({ status: 'success', auth: true, userId: user._id });
          }
        });
      } else {
        user.name = userInfo.name;
        user.img = userInfo.img;
        user.provider = userInfo.provider;
        user.providerId = userInfo.providerId;
        user.accessToken = userInfo.accessToken;
        user.save((err, user) => {
          if (err) {
            console.log('Error save a user: ', err);
            res.send({ status: 'fail', auth: false });
          } else {
            console.log('save user success.');
            res.send({ status: 'success', auth: true, userId: user._id });
          }
        });
      }
    }
  });
});

// get list user by id
router.post('/get-list-user-by-id', function (req, res) {
  // console.log(req.body.listChatBox);
  
});

// get all user
router.get('/', function (req, res) {
  User.find({}, {
    _id: 1,
    name: 1,
    img: 1,
    providerId: 1,
    provider: 1,
  })
    .then(docs => {
      res.send({
        status: 'success',
        users: docs,
      });
    })
    .catch(err => {
      console.log(err)
      res.send({ status: 'fail' });
    });
});

module.exports = router;
