var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/assets", express.static(__dirname + "/public"));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var server = require("http").createServer(app);
var io = require("socket.io")(server);
server.listen(8080);

var USERS = [];

io.on("connection", function (socket) {
  // thêm user vào list đang online
  socket.on("add-user-connect", function (name) {
    console.log(name + " vừa mới connect");
    var isPush = true;
    for ( user of USERS ) {
      if ( name === user.name ) {
        socket.emit("goto-login");
        isPush = false;
        break;
      }
    }
    if ( isPush ) {
      USERS.push({
        id: socket.id,
        name
      });
    }
    io.sockets.emit("get-all-user", USERS);
  });

  // Xóa user khỏi list online
  socket.on("disconnect", function () {
    var indexDelete = null;
    for ( let i = 0; i < USERS.length; i++ ) {
      if ( USERS[i].id === socket.id ) {
        indexDelete = i;
        break;
      }
    }
    if (indexDelete !== null) {
      io.sockets.emit("delete-user", USERS[indexDelete]);
      USERS.splice(indexDelete, 1);
    }
  });

  // gửi tin nhắn
  socket.on("send-message-to-server", function (from, to, msg) {
    let toId = "";
    for ( user of USERS ) {
      if ( user.name === to ) {
        toId = user.id;
        break;
      }
    }

    io.to(toId).emit("send-message-to-client", from, msg);
  });
  
});
