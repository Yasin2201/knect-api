require('dotenv').config()

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;

module.exports = new JwtStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload._id, (err, user) => {
        if (err) { return console.error(err) }
        else if (user) {
            return done(null, true)
        } else {
            return done(null, false)
        }
    })
})