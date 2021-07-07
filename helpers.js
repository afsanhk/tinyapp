// Return user ID by email (email as string, userDB)
const getUserID = function(checkEmail, userObj) {
  for (let key in userObj) {
    if (userObj.hasOwnProperty(key)) {
      if (checkEmail === userObj[key]['email']) {
        return key;
      }
    }
  }
};

module.exports = {getUserID}