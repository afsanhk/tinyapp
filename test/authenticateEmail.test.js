const { assert } = require('chai');

const { authenticateEmail } = require('../helpers.js');

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

describe('authenticateEmail', function() {
  it('should return true if email is in user DB', function() {
    assert.isTrue(authenticateEmail("user@example.com", testUsers));
  });

  it('should return undefined if email is not in user DB', function() {
    assert.isUndefined(authenticateEmail("asdasd@asdasd.com", testUsers));
  });

});