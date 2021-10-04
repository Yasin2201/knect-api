const FriendRequest = require('../models/friendRequest')
const User = require('../models/user')
const async = require('async');

//POST new friend request
exports.new_friend_request = function (req, res, next) {
    async.parallel({
        user: function (cb) {
            User.findById(req.params.userid).exec(cb)
        },
        recipient: function (cb) {
            User.findById(req.params.recid).exec(cb)
        }
    }, function (err, results) {
        if (err) { return next(err) }

        if (!results.user || !results.recipient) {
            res.status(404).json({ alerts: [{ msg: "User or Recipient Not Found!" }] })
        } else {
            const newFriendRequest = new FriendRequest({
                requester: req.params.userid,
                recipient: req.params.recid
            });

            newFriendRequest.save(function (err) {
                if (err) { return next(err) }
                res.json({ alerts: [{ msg: "Friend Request Sent" }] })
            });
        }
    })
}