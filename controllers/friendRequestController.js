const FriendRequest = require('../models/friendRequest')
const User = require('../models/user')
const async = require('async');
const friendRequest = require('../models/friendRequest');

//GET all users friend requests
exports.get_all_requests = function (req, res, next) {
    FriendRequest.find({ recipient: req.params.id, friends: false })
        .exec(function (err, all_requests) {
            if (err) { return next(err) }
            res.json({ all_requests })
        })
}

//POST new friend request
exports.new_friend_request = function (req, res, next) {
    const { userid, recid } = req.params

    async.parallel({
        user: function (cb) {
            User.findById(userid).exec(cb)
        },
        recipient: function (cb) {
            User.findById(recid).exec(cb)
        },
        friendRequest: function (cb) {
            FriendRequest.find({ requester: userid, recipient: recid, friends: false }).exec(cb)
        }
    }, function (err, results) {
        if (err) { return next(err) }

        if (!results.user || !results.recipient) {
            res.status(404).json({ alerts: [{ msg: "User or Recipient Not Found!" }] })
        } else if (results.friendRequest.length > 0) {
            res.status(400).json({ alerts: [{ msg: "Already requested" }] })
        } else {
            const newFriendRequest = new FriendRequest({
                requester: userid,
                recipient: recid
            });

            newFriendRequest.save(function (err) {
                if (err) { return next(err) }
                res.json({ alerts: [{ msg: "Friend Request Sent" }] })
            });
        }
    })
}

//DELETE friend request on decline
exports.decline_friend_Request = function (req, res, next) {
    async.parallel({
        user: function (cb) {
            User.findById(req.params.userid).exec(cb)
        },
        friendRequest: function (cb) {
            FriendRequest.findById(req.params.requestid).exec(cb)
        }
    }, function (err, results) {
        if (err) { return next(err) }
        if (!results.user || !results.friendRequest) {
            res.status(404).json({ alerts: [{ msg: "User or Friend Request Not Found!" }] })
        } else if (results.friendRequest.recipient.toString() !== results.user._id.toString()) {
            res.status(401).json({ alerts: [{ msg: "Not Authorized!" }] })
        } else {
            FriendRequest.findByIdAndRemove(results.friendRequest._id, function deleteRequest(err) {
                if (err) { return next(err) }
                res.json({ alerts: [{ msg: "Friend Request Declined" }] })
            })
        }
    })
}

//UPDATE friend-request recipient and requesters friends array and friend request document to TRUE  if recipient accepts
exports.accept_friend_request = function (req, res, next) {
    async.parallel({
        user: function (cb) {
            User.findById(req.params.userid).exec(cb)
        },
        friendRequest: function (cb) {
            FriendRequest.findById(req.params.requestid).exec(cb)
        }
    }, function (err, results) {
        if (err) { return next(err) }
        if (!results.user || !results.friendRequest) {
            res.status(404).json({ alerts: [{ msg: "User or Friend Request Not Found!" }] })
        } else if (results.friendRequest.recipient.toString() !== results.user._id.toString()) {
            res.status(401).json({ alerts: [{ msg: "Not Authorized!" }] })
        } else {
            const updatedFriendRequest = new FriendRequest({
                _id: results.friendRequest._id,
                ...results.friendRequest,
                friends: true
            })
            //Update friend request to true
            FriendRequest.findByIdAndUpdate(results.friendRequest._id, updatedFriendRequest, {}, function (err) {
                if (err) { return next(err) }
                res.json({ alerts: [{ msg: "Friend Request Accepted" }] })
            })
            //Add friend in users(recipient) friends array
            User.findById(results.user._id)
                .exec(function (err, found_user) {
                    if (err) { return next(err) }
                    found_user.friends.push(results.friendRequest.requester._id);
                    found_user.save();
                })

            //Add friend in requesters friends array
            User.findById(results.friendRequest.requester._id)
                .exec(function (err, found_user) {
                    if (err) { return next(err) }
                    found_user.friends.push(results.friendRequest.recipient._id);
                    found_user.save();
                })
        }
    })
}