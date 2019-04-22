const createError = require('http-errors');
const express = require('express');
const fs = require('fs');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const db = require('./config/database');
const setAPI = require('./api');
const setSocket = require('./sockets');

const app = express();

const indexRouter = require('./routes/index');


// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/assets", express.static(__dirname + "/public"));


// cho phép tên miền khác gọi api
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'https://localhost:8008');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();

});

// set routing and api.
app.use('/', indexRouter);
setAPI(app);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

mongoose.connect(db.getLinkToConnectDB_dev(), { useNewUrlParser: true });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// const options = {
//   key: fs.readFileSync('./file.pem'),
//   cert: fs.readFileSync('./file.crt')
// };
const server = require("http").createServer(app);
setSocket(server);
server.listen(8080, () => {
  console.log(`Listening on port 8080`);
});
