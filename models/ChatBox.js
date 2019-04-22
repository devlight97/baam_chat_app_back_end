const mongoose = require("mongoose");
const Schema = mongoose.Schema; // khai báo ánh xạ
const ObjectId = mongoose.Types.ObjectId;

const chatBoxSchema = new Schema({ // khai báo một model theo ánh xạ Schema
  userIds: Array,
  messageIds: Array,
  notSeen: Number,
});

const ChatBox = mongoose.model('ChatBox', chatBoxSchema);

ChatBox.$getListChatBoxByUserId = (userId) => {
  // get list chat box by user id
  return ChatBox.aggregate([
    {
      $unwind: '$messageIds'
    },
    {
      $lookup: {
        from: 'messages',
        localField: 'messageIds',
        foreignField: '_id',
        as: 'messages'
      }
    },
    {
      $match: {
        messages: { $ne: [] },
        userIds: { $ne: [] },
        userIds: { $in: [ObjectId(userId)] }
      }
    },
    {
      $group: {
        _id: '$_id',
        userIds: { $first: '$userIds' },
        messages: { $push: { $arrayElemAt: ['$messages', 0] } },
        notSeen: { $first: '$notSeen' },
      }
    }
  ]);
}

module.exports = ChatBox;
