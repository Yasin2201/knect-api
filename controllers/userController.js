require('dotenv').config()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");

//User sign-up
exports.sign_up_post = [
    //validate and sanitize sign-up fields
    body('username', 'Invalid Username').trim().isLength({ min: 1 }).escape(),
    body('password', 'Invalid Password').trim().isLength({ min: 5 }).escape(),

    (req, res, next) => {
        //Errors from req if any
        const errors = validationResult(req)

        //Hash users password input with bcrypt
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {

            //Create new user with validated data and hashed password
            const user = new User({
                username: req.body.username,
                password: hashedPassword,
            });

            if (!errors.isEmpty()) {
                res.json({ title: 'Sign Up', alerts: errors.array(), user: undefined });
                return
            } else {
                // first check if username already exists
                User.findOne({ 'username': req.body.username })
                    .exec(function (err, found_username) {
                        if (err) { return next(err) }

                        // if username exists re-render sign-up with error
                        if (found_username) {
                            res.json({ title: 'Sign Up', user: undefined, alerts: [{ msg: 'Username already exists' }] });
                        } else {
                            user.save(function (err) {
                                if (err) { return next(err) }
                                res.json({ alerts: [{ msg: 'Signed Up Successfully!' }] })
                            });
                        }
                    });
            }
        })
    }
];

exports.sign_in_get = function (req, res, next) {
    res.json({ title: 'Sign In' });
}

// User sign-in
exports.sign_in_post = [

    //validate and sanitize sign-in fields
    body("username").trim().isLength({ min: 1 }).escape(),
    body("password", "Incorrect Password").trim().isLength({ min: 5 }).escape(),

    (req, res, next) => {
        let { username, password } = req.body;

        //Errors from req if any
        const errors = validationResult(req)

        User.findOne({ username: username }, (err, user) => {
            if (err) { return next(err) }

            if (!user) {
                res.status(401).json({
                    alerts: [{ msg: "User not found" }],
                    userAuth: false,
                });
            }

            else {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) { return next(err) }

                    if (result) {
                        // passwords match! log user in
                        const secret = process.env.SECRET_KEY
                        const token = jwt.sign({ _id: user._id }, secret);

                        return res.status(200).json({
                            alerts: [{ msg: "Auth Passed" }],
                            userAuth: true,
                            token
                        });
                    } else {
                        // passwords do not match!
                        return res.status(401).json({
                            userAuth: false,
                            alerts: errors.array()
                        });
                    }
                });
            }
        })
    }
];

//Sign out user
exports.sign_out_get = function (req, res) {
    req.logout();
    res.redirect('/');
};