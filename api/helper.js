const User = require('../models/User');

module.exports = {
  checkToken: (token, providerId, callback) => {
    User.findOne({ providerId })
      .then(user => {
        if (user !== null) {
          if (user.providerId === providerId) {
            return callback(true);
          }
        }
        return callback(false);
      })
      .catch(err => console.log('Error check access token: ', err));
  }
}