/* eslint-disable import/no-unresolved */
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GarminStrategy = require('passport-garmin').Strategy;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Strava profile is
//   serialized and deserialized.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Use the StravaStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Strava
//   profile), and invoke a callback with a user object.
passport.use(
  new GarminStrategy(
    {
      consumerKey: process.env.GARMIN_CONSUMER_KEY,
      consumerSecret: process.env.GARMIN_CONSUMER_SECRET,
      callbackURL: process.env.GARMIN_CALLBACK,
    },
    async function (token, tokenSecret, profile, done) {
      console.log(profile);
      return done(null, profile);
    }
  )
);

const app = express();

app.use(
  session({
    secret: 'nice-secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.get('/', function (req, res) {
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account', { user: req.user });
});

app.get('/login', function (req, res) {
  res.render('login', { user: req.user });
});

// GET /auth/garmin
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Garmin authentication will involve
//   redirecting the user to connect.garmin.com.  After authorization, Garmin
//   will redirect the user back to this application at /auth/garmin/callback
app.get('/auth/garmin', passport.authenticate('garmin'));

// GET /auth/garmin/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get(
  '/auth/garmin/callback',
  passport.authenticate('garmin', {
    failureRedirect: '/login',
    successRedirect: '/',
  })
);

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.listen(4000);
