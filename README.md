# Passport Garmin

[Garmin](https://connect.garmin.com/) authentication strategy for [Passport](http://www.passportjs.org/) and Node.js.

As base I used [passport-google-oauth1](https://github.com/jaredhanson/passport-google-oauth1). I just made a few changes to display the data that comes from Strava.

This lib aims to make it easier the Garmin authentication with Nodejs apps. By plugging into Passport, Garmin authentication can be easily and unobtrusively integrated into any application or framework that supports Connect-style middleware, including Express.

## Install

```
$ npm i passport-garmin
```

## Usage

### Configure Strategy

Garmin still uses the OAuth1 strategy in order to authenticate the users. This strategy requires a callback, that receives these credentials and calls ```done``` returning the data of the user logged in as well as options to specify the ```Consumer Key```, ```Consumer Secret``` and ```Callback URL```.

In order to obtain a Consumer Key and Consumer Secret first you have to request the access for the Garmin API.

**Basic config:**
```
const GarminStrategy = require('passport-garmin').Strategy;

passport.use(new GarminStrategy({
    consumerKey: GARMIN_CONSUMER_KEY,
    consumerSecret: GARMIN_CONSUMER_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/garmin/callback"
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate(..., function (err, user) {
      done(err, user);
    });
  }
));
```

**With Typescript:**
```
import strategy from 'passport-garmin';

const GarminStrategy = strategy.Strategy;

passport.use(new GarminStrategy({
    consumerKey: GARMIN_CONSUMER_KEY,
    consumerSecret: GARMIN_CONSUMER_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/garmin/callback"
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate(..., function (err, user) {
      done(err, user);
    });
  }
));
```

## Acknowledgments

- To [Jared Hanson](https://github.com/jaredhanson) for making [Passport](http://www.passportjs.org/) possible.
