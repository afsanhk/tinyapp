const { assert } = require('chai');

const { generateRandomString } = require('../helpers.js');


describe('generateRandomString', function() {
  it('should return a string', function() {
    assert.equal(typeof generateRandomString(),'string');
  });

  it('should return a string of length 6', function() {
    assert.equal(generateRandomString().length,6);
  });

});