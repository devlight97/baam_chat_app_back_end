const mongoose = require("mongoose");
const Schema = mongoose.Schema; // khai báo ánh xạ

const userSchema = new Schema({ // khai báo một model theo ánh xạ Schema
  provider: String,
  providerId: String,
  accessToken: String,
  name: String,
  img: String,
});

const User = mongoose.model('User', userSchema);

User.$getListUserByListId = (listId) => User.find(
  { _id: { $in: listId } },
  {
    accessToken: 0,
    providerId: 0,
    provider: 0,
  }
);
module.exports = User;

