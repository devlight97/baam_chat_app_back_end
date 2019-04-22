var config = require("./config"); // tự hiểu sẽ kết nối tới .json

module.exports = {
    getLinkToConnectDB_dev: function () {
        return `mongodb://${ config.host }:${ config.port }/chat_app`;
    }
}