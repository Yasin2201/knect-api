const FriendRequest = require('../models/friendRequest')
const User = require('../models/user')
const async = require('async');
const user = require('../models/user');

//GET all users friend requests
exports.get_all_requests = function (req, res, next) {
    FriendRequest.find({ recipient: req.params.id, friends: false })
        .exec(function (err, all_requests) {
            if (err) { return next(err) }
            res.json({ all_requests })
        })
}

//GET all users sent friend requests
exports.get_all_sent_requests = function (req, res, next) {
    FriendRequest.find({ requester: req.params.id, friends: false })
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
        if (!results.user || results.friendRequest.length < 1) {
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
            FriendRequest.find({ _id: req.params.requestid, friends: false }).exec(cb)
        }
    }, function (err, results) {
        const friendReqData = results.friendRequest[0]

        if (err) { return next(err) }
        if (!results.user || !friendReqData) {
            res.status(404).json({ alerts: [{ msg: "User or Friend Request Not Found!" }] })
        } else if (friendReqData.recipient.toString() !== results.user._id.toString()) {
            res.status(401).json({ alerts: [{ msg: "Not Authorized!" }] })
        } else {
            const updatedFriendRequest = new FriendRequest({
                _id: friendReqData._id,
                ...friendReqData,
                friends: true
            })

            // Update friend request to true
            FriendRequest.findByIdAndUpdate(friendReqData._id, updatedFriendRequest, {}, function (err) {
                if (err) { return next(err) }
                res.json({ alerts: [{ msg: "Friend Request Accepted" }] })
            })

            //Add friend in users(recipient) friends array
            User.findById(results.user._id)
                .exec(function (err, found_user) {
                    if (err) { return next(err) }
                    found_user.friends.push(friendReqData.requester._id);
                    found_user.save();
                })

            //Add friend in requesters friends array
            User.findById(friendReqData.requester._id)
                .exec(function (err, found_user) {
                    if (err) { return next(err) }
                    found_user.friends.push(friendReqData.recipient._id);
                    found_user.save();
                })
        }
    })
}

// UNFRIEND a user
exports.unfriend_user = function (req, res, next) {
    const { userid, friendid } = req.params
    async.parallel({
        user: function (cb) {
            User.findById(userid).exec(cb)
        },
        friend: function (cb) {
            User.findById(friendid).exec(cb)
        },
        friendRequest: function (cb) {
            FriendRequest.find({
                $or: [
                    { requester: userid, recipient: friendid, friends: true },
                    { requester: friendid, recipient: userid, friends: true }
                ]
            }).exec(cb)
        }
    }, function (err, results) {
        const friendReqData = results.friendRequest[0]
        if (err) { return next(err) }

        if (!friendReqData) {
            res.status(404).json({ alerts: [{ msg: "Friend request not found!" }] })
        } else if (friendReqData.recipient._id.toString() === userid || friendReqData.requester._id.toString() === userid) {

            // //DELETE friend request document
            FriendRequest.findByIdAndRemove(friendReqData._id, function deleteRequest(err) {
                if (err) { return next(err) }
            })

            //Remove friend from users 'friends' array
            User.findById(userid)
                .exec(function (err, found_user) {
                    if (err) { return next(err) }
                    found_user.friends.pull(friendid);
                    found_user.save();
                })

            //Remove user from friend 'friends' array
            User.findById(friendid)
                .exec(function (err, found_user) {
                    if (err) { return next(err) }
                    found_user.friends.pull(userid);
                    found_user.save();
                })

            res.status(200).json({ msg: "Unfriended Successfully" })
        }
    })
}
