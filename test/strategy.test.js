const chai = require('chai');
const { expect } = require('chai');
const GarminStrategy = require('../lib/strategy');

describe('Strategy', () => {
  describe('constructed', () => {
    const strategy = new GarminStrategy(
      {
        consumerKey: 'ABC123',
        consumerSecret: 'secret',
      },
      () => {}
    );

    it('should be named garmin', () => {
      expect(strategy.name).to.equal('garmin');
    });
  });

  describe('constructed with undefined options', () => {
    it('should throw', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new GarminStrategy(undefined, () => {});
      }).to.throw(Error);
    });
  });

  describe('error caused by invalid consumer secret sent to request token URL', function () {
    const strategy = new GarminStrategy(
      {
        consumerKey: 'ABC123',
        consumerSecret: 'invalid-secret',
        callbackURL: 'http://www.example.test/callback',
      },
      () => {}
    );

    strategy._oauth.getOAuthAccessToken = (params, callback) => {
      callback({
        statusCode: 401,
        data:
          '{"errors":[{"code":32,"message":"Could not authenticate you."}]}',
      });
    };

    let err;

    before(done => {
      chai.passport
        .use(strategy)
        .error(e => {
          err = e;
          done();
        })
        .req(req => {
          req.session = {};
        })
        .authenticate();
    });

    it('should error', () => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Failed to obtain request token');
    });
  });

  describe('error caused by invalid request token sent to access token URL', function () {
    const strategy = new GarminStrategy(
      {
        consumerKey: 'ABC123',
        consumerSecret: 'secret',
        callbackURL: 'http://www.example.test/callback',
      },
      () => {}
    );

    strategy._oauth.getOAuthAccessToken = (
      token,
      tokenSecret,
      verifier,
      callback
    ) => {
      callback({ statusCode: 401, data: 'Invalid request token.' });
    };

    let err;

    before(done => {
      chai.passport
        .use(strategy)
        .error(e => {
          err = e;
          done();
        })
        .req(req => {
          req.query = {};
          req.query.oauth_token = 'x-hh5s93j4hdidpola';
          req.query.oauth_verifier = 'hfdp7dh39dks9884';
          req.session = {};
          req.session['oauth:twitter'] = {};
          req.session['oauth:twitter'].oauth_token = 'x-hh5s93j4hdidpola';
          req.session['oauth:twitter'].oauth_token_secret = 'hdhd0244k9j7ao03';
        })
        .authenticate();
    });

    it('should error', function () {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Failed to find request token in session');
    });
  });

  describe('error caused by invalid consumer secret sent to request token URL, formatted as unexpected JSON', function () {
    const strategy = new GarminStrategy(
      {
        consumerKey: 'ABC123',
        consumerSecret: 'invalid-secret',
        callbackURL: 'http://www.example.test/callback',
      },
      () => {}
    );

    strategy._oauth.getOAuthAccessToken = (params, callback) => {
      callback({ statusCode: 401, data: '{"foo":"bar"}' });
    };

    let err;

    before(done => {
      chai.passport
        .use(strategy)
        .error(e => {
          err = e;
          done();
        })
        .req(req => {
          req.session = {};
        })
        .authenticate();
    });

    it('should error', () => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('Failed to obtain request token');
    });
  });

  describe('error caused by invalid callback sent to request token URL', function () {
    const strategy = new GarminStrategy(
      {
        consumerKey: 'ABC123',
        consumerSecret: 'secret',
        callbackURL: 'http://www.example.test/invalid-callback',
      },
      () => {}
    );

    strategy._oauth.getOAuthRequestToken = (params, callback) => {
      callback({
        statusCode: 401,
        data:
          '<?xml version="1.0" encoding="UTF-8"?>\n<hash>\n  <error>This client application\'s callback url has been locked</error>\n  <request>/oauth/request_token</request>\n</hash>\n',
      });
    };

    let err;

    before(done => {
      chai.passport
        .use(strategy)
        .error(e => {
          err = e;
          done();
        })
        .req(req => {
          req.session = {};
        })
        .authenticate();
    });

    it('should error', function () {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Failed to obtain request token');
    });
  });

  describe('error caused by invalid verifier sent to access token URL', function () {
    const strategy = new GarminStrategy(
      {
        consumerKey: 'ABC123',
        consumerSecret: 'secret',
        callbackURL: 'http://www.example.test/callback',
      },
      () => {}
    );

    strategy._oauth.getOAuthAccessToken = (
      token,
      tokenSecret,
      verifier,
      callback
    ) => {
      callback({
        statusCode: 401,
        data:
          'Error processing your OAuth request: Invalid oauth_verifier parameter',
      });
    };

    let err;

    before(done => {
      chai.passport
        .use(strategy)
        .error(e => {
          err = e;
          done();
        })
        .req(req => {
          req.query = {};
          req.query.oauth_token = 'hh5s93j4hdidpola';
          req.query.oauth_verifier = 'x-hfdp7dh39dks9884';
          req.session = {};
          req.session['oauth:garmin'] = {};
          req.session['oauth:garmin'].oauth_token = 'hh5s93j4hdidpola';
          req.session['oauth:garmin'].oauth_token_secret = 'hdhd0244k9j7ao03';
        })
        .authenticate();
    });

    it('should error', function () {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Failed to obtain access token');
    });
  });

  describe('Strategy#userProfile', () => {
    describe('fetched from default endpoint', () => {
      const strategy = new GarminStrategy(
        {
          consumerKey: 'ABC123',
          consumerSecret: 'secret',
        },
        () => {}
      );

      strategy._oauth.get = (url, token, tokenSecret, callback) => {
        if (url !== 'https://healthapi.garmin.com/wellness-api/rest/user/id') {
          return callback(new Error('incorrect url argument'));
        }
        if (token !== 'token') {
          return callback(new Error('incorrect token argument'));
        }
        if (tokenSecret !== 'token-secret') {
          return callback(new Error('incorrect tokenSecret argument'));
        }

        const body = '{"userId":"bf49dc2e-ee69-4098-87f1-3389b94f0607"}';
        callback(null, body, undefined);
      };

      let profile;

      before(done => {
        strategy.userProfile('token', 'token-secret', (err, p) => {
          if (err) {
            return done(err);
          }
          profile = p;
          done();
        });
      });

      it('should parse profile', () => {
        expect(profile.provider).to.equal('garmin');
        expect(profile.id).to.equal('bf49dc2e-ee69-4098-87f1-3389b94f0607');
      });
    });
  });
});
