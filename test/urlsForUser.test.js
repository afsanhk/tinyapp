const { assert } = require('chai');

const { urlsForUser } = require('../helpers.js');

const testDB = {
  "b2xVn2" : {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK" : {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  },
  "abcdeg" : {
    longURL: "http://www.youtube.com",
    userID: "user2RandomID"
  }
};

describe('urlsForUser', function() {
  it('should return {} if there are no URLS for the ID}', function() {
    const urls = urlsForUser("123456", testDB)
    const expectedOutput = {};
    assert.deepEqual(urls,expectedOutput);
  });

  it('should return an object with short:long URL pairs for a valid ID', function() {
    const urls = urlsForUser("userRandomID", testDB)
    const expectedOutput = {"b2xVn2" : "http://www.lighthouselabs.ca",}
    assert.deepEqual(urls,expectedOutput);
  });

});