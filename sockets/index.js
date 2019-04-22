let io = require('socket.io');
const ChatBox = require('../models/ChatBox');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');
const { eventName } = require('./constants');
const ObjectId = mongoose.Types.ObjectId;

module.exports = function (server) {
  io = io(server);

  const listUserOnline = [];

  const getUserByUserId = userId => {
    for (user of listUserOnline) {
      if (user.id === userId) {
        return user;
      }
    }
    return null;
  }

  const getUserBySocketId = socketId => {
    for (user of listUserOnline) {
      if (user.socketId === socketId) {
        return user;
      }
    }
    return null;
  }

  io.on("connection", function (socket) {
    // load chat box inf
    // ...

    // add user online and new sockets
    socket.on('add-user-connect', userId => {
      console.log(`user id ${userId} connecting...`);
      let isPush = true;
      for (user of listUserOnline) {
        if (user.id === userId) {
          isPush = false;
          break;
        }
      }
      if (isPush) {
        listUserOnline.push({
          socketId: socket.id,
          id: userId,
        });
      }
    });

    // Xóa user khỏi list online
    socket.on("disconnect", function () {
      var indexDelete = null;
      for (let i = 0; i < listUserOnline.length; i++) {
        if (listUserOnline[i].socketId === socket.id) {
          indexDelete = i;
          break;
        }
      }
      if (indexDelete !== null) {
        listUserOnline.splice(indexDelete, 1);
      }
    });

    // gửi tin nhắn
    socket.on(eventName.sendMessageToServer, (data) => {
      let { userId, recieverId, chatBoxId, content } = data;
      let reciever = getUserByUserId(recieverId);
      let sender = getUserByUserId(userId);
      new Message({
        userId,
        content,
      }).save((err, message) => {
        if (err) throw err;
        ChatBox.findOne({ _id: chatBoxId })
          .then(chatBox => {
            chatBox.messageIds.push(ObjectId(message.id));
            if (!chatBox.notSeen) chatBox.notSeen = 1
            else chatBox.notSeen += 1;
            chatBox.save((err, chatBox) => {
              Message.$getListMessageByListId(chatBox.messageIds)
                .then(messages => {
                  if (reciever !== null) {
                    io.to(reciever.socketId).emit(eventName.updateChatBox, {
                      messages,
                      notSeen: chatBox.notSeen,
                      chatBoxId,
                    });
                    io.to(reciever.socketId).emit(eventName.updateChatBoxNotSeen, {
                      messages,
                      notSeen: chatBox.notSeen,
                      chatBoxId,
                    });
                  }
                  io.to(sender.socketId).emit(eventName.updateChatBox, {
                    messages,
                    notSeen: chatBox.notSeen,
                    chatBoxId,
                  });
                  io.to(sender.socketId).emit(eventName.updateChatBoxNotSeen, {
                    messages,
                    notSeen: chatBox.notSeen,
                    chatBoxId,
                  });
                })
                .catch(err => { throw err });

            });
          })
          .catch(err => { throw err })
      });

    });

    // search new user
    socket.on(eventName.searchNewUser, searchText => {
      User.find({
        _id: { $ne: ObjectId(getUserBySocketId(socket.id).id) },
        name: { $regex: searchText, $options: 'i' },
      }, {
          _id: 1,
          name: 1,
          img: 1,
          provider: 1,
        })
        .then(users => {
          io.to(socket.id).emit(eventName.getSearchNewUser, users);
        })
        .catch(err => { throw err })
    });

    // create new chat box
    socket.on(eventName.createChatBox, ({ userIds, firstMessageContent }) => {
      userIds = userIds.map(userId => ObjectId(userId));
      new ChatBox({
        userIds,
        messageIds: [],
        notSeen: 0,
      }).save((err, chatBox) => {
        if (err) throw err;
        for (let userId of userIds) {
          if (userId.toString() !== getUserBySocketId(socket.id)._id) {
            User.findOne({ _id: userId }, {
              accessToken: 0,
              providerId: 0,
            })
              .then(receiver => io.emit(eventName.updateNewChatBox, { receiver, chatBox, firstMessageContent }))
              .catch(err => { throw err });
            break;
          }
        }
      });
    })

    // realtime seen message
    socket.on(eventName.changeChatBoxNotSeen, ({ chatBox, notSeen }) => {
      console.log('chat box change not seen');
      ChatBox.findOne({ _id: chatBox._id })
        .then(chatBox => {
          chatBox.notSeen = notSeen;
          chatBox.save((err, chatBox) => {
            if (err) throw err;

            Message.$getListMessageByListId(chatBox.messageIds)
              .then(messages => {
                for (let userId of chatBox.userIds) {
                  const user = getUserByUserId(userId.toString())
                  console.log(user);
                  console.log('messages.length', messages.length);
                  if (user !== null && user.socketId !== socket.id) {
                    io.to(user.socketId).emit(eventName.updateChatBoxNotSeen, {
                      messages,
                      notSeen: chatBox.notSeen,
                      chatBoxId: chatBox._id,
                    });
                    break;
                  }
                }
                io.to(socket.id).emit(eventName.updateChatBoxNotSeen, {
                  messages,
                  notSeen: chatBox.notSeen,
                  chatBoxId: chatBox._id,
                });
              })
              .catch(err => {throw err});

          });
        })
        .catch(err => { throw err });
    });


    //   // thêm user vào list đang online
    //   socket.on("add-user-connect", function (name) {
    //     console.log(socket.id + " vừa mới connect");
    //     var isPush = true;
    //     for (user of USERS) {
    //       if (name === user.name) {
    //         socket.emit("goto-login");
    //         isPush = false;
    //         break;
    //       }
    //     }
    //     if (isPush) {
    //       USERS.push({
    //         id: socket.id,
    //         name
    //       });
    //     }
    //     io.sockets.emit("get-all-user", USERS);
    //   });

    //   // Xóa user khỏi list online
    //   socket.on("disconnect", function () {
    //     var indexDelete = null;
    //     for (let i = 0; i < USERS.length; i++) {
    //       if (USERS[i].id === socket.id) {
    //         indexDelete = i;
    //         break;
    //       }
    //     }
    //     if (indexDelete !== null) {
    //       io.sockets.emit("delete-user", USERS[indexDelete]);
    //       USERS.splice(indexDelete, 1);
    //     }
    //   });

    //   // gửi tin nhắn
    //   socket.on("send-message-to-server", function (from, to, msg) {
    //     let toId = "";
    //     for (user of USERS) {
    //       if (user.name === to) {
    //         toId = user.id;
    //         break;
    //       }
    //     }

    //     io.to(toId).emit("send-message-to-client", from, msg);
    //   });

  });
}