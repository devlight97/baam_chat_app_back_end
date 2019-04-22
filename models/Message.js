var mongoose = require("mongoose");
var Schema = mongoose.Schema; // khai báo ánh xạ

var messageSchema = new Schema({ // khai báo một model theo ánh xạ Schema
  userId: String,
  content: String,
  createDate: { type: Date, default: Date.now },
});

var Message = mongoose.model('Message', messageSchema);

Message.$getListMessageByListId = listId => {
  return Message.find({ _id: { $in: listId } });
}

module.exports = Message;

