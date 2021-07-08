const { assert } = require('chai');

const { getUserID } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserID', function() {
  it('should return a user with valid email', function() {
    const user = getUserID("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user,expectedOutput);
  });

  it('should return undefined for invalid email', function() {
    const user = getUserID("asdasd@asdasd.com", testUsers);
    assert.isUndefined(user);
  });

});