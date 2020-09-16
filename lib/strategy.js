const { inherits } = require('util');
const OAuth1Strategy = require('passport-oauth1');
const { InternalOAuthError } = require('passport-oauth1');

/**
 * `Strategy` constructor.
 *
 * The Garmin authentication strategy authenticates requests by delegating to
 * Google using the OAuth protocol.
 *
 * Applications must supply a `verify` callback which accepts a `token`,
 * `tokenSecret` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `consumerKey`     identifies client to Garmin
 *   - `consumerSecret`  secret used to establish ownership of the consumer key
 *   - `callbackURL`     URL to which Garmin will redirect the user after obtaining authorization
 *
 * Examples:
 *
 *     passport.use(new GarminStrategy({
 *         consumerKey: '123-456-789',
 *         consumerSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/garmin/callback'
 *       },
 *       function(token, tokenSecret, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {Object} options
 * @param {Function} verify
 * @access public
 */
function Strategy(options, verify) {
  options = options || {};
  options.requestTokenURL =
    options.requestTokenURL ||
    'https://connectapi.garmin.com/oauth-service/oauth/request_token';
  options.accessTokenURL =
    options.accessTokenURL ||
    'https://connectapi.garmin.com/oauth-service/oauth/access_token';
  options.userAuthorizationURL =
    options.userAuthorizationURL || 'https://connect.garmin.com/oauthConfirm';
  options.sessionKey = options.sessionKey || 'oauth:garmin';

  OAuth1Strategy.call(this, options, verify);
  this.name = 'garmin';
}

// Inherit from `OAuthStrategy`.
inherits(Strategy, OAuth1Strategy);

/**
 * Retrieve user id from Garmin.
 *
 * This function gets the user id on Garmin.
 *
 *
 * @param {String} token
 * @param {String} tokenSecret
 * @param {Object} params
 * @param {Function} done
 * @access protected
 */
Strategy.prototype.userProfile = function (token, tokenSecret, params, done) {
  this._oauth.get(
    'https://healthapi.garmin.com/wellness-api/rest/user/id',
    token,
    tokenSecret,
    function (err, body, _) {
      if (err) {
        return done(
          new InternalOAuthError('Failed to fetch user profile', err)
        );
      }

      try {
        const json = JSON.parse(body);

        const profile = { provider: 'garmin' };
        profile.id = json.userId;

        done(null, profile);
      } catch (error) {
        return done(new Error('Failed to parse user profile'));
      }
    }
  );
};

// Expose constructor
module.exports = Strategy;
