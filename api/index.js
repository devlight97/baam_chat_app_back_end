const usersRouter = require('./users');
const chatboxRouter = require('./chatbox');
const messageRouter = require('./message');

module.exports = function (app) {
  app.use('/users', usersRouter);
  app.use('/chatbox', chatboxRouter);
  app.use('/message', messageRouter);
}