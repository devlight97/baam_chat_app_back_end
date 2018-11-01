var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login.ejs', {msg: ""});
});

router.post('/gotochat', function (req, res, next) {
  console.log(req.body.name);
  if ( req.body.name === "" ) {
    res.render('login.ejs', {msg: "Không được để trống tên !!"});
  } else {
    // if ( nameIsExist(req.body.name) ) {
    //   res.render('login.ejs', {msg: "Người dùng đã tồn tại !!"});
    // }
    res.render('index.ejs', {name: req.body.name});
  }
  
});

module.exports = router;
