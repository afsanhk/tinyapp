// Helper Functions
// Generates random 6 length string
const generateRandomString = function() {
  let characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString; // Edge case: Improbably but this doesn't account for if string has already been generated for another URL.
};

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

// Check userDB for existingEmail (email as string, userDB)
const authenticateEmail = function(authEmail, userObj) {
  for (let key in userObj) {
    if (userObj.hasOwnProperty(key)) {
      if (authEmail === userObj[key]['email']) {
        return true;
      }
    }
  }
};

// Returns URLs for userID --> filtered URL object for user in dateVisitInfoForUser
const urlsForUser = function(id, userObj) {
  let output = {};
  for (let key in userObj) {
    if (userObj[key]['userID'] === id) {
      output[key] = userObj[key]['longURL'];
    }
  }
  return output;
};

// Returns creation date, total visits and unique visitors for userID
const dateVisitInfoForUser = function(filteredUrlObject, urlDB) {
  const output = {};

  for (let key in filteredUrlObject) {
    for (let shortURL in urlDB) {
      if (key === shortURL) {
        output[key] = {
          created: urlDB[key]['created'],
          visits: urlDB[key]['visits'],
          visitors: urlDB[key]['visitors']
        };
      }
    }
  }

  return output;
};


module.exports = {getUserID, generateRandomString, authenticateEmail, urlsForUser, dateVisitInfoForUser};