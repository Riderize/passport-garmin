const { expect } = require('chai');
const strategy = require('..');

describe('passport-garmin', () => {
  it('should export Strategy constructor', () => {
    expect(strategy.Strategy).to.be.a('function');
  });

  it('should export Strategy constructor as module', () => {
    expect(strategy).to.be.a('function');
    expect(strategy).to.equal(strategy.Strategy);
  });
});
