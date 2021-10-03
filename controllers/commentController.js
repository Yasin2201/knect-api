const Comment = require('../models/comment')
const User = require('../models/user')
const { body, validationResult } = require('express-validator');
const async = require('async');

//POST new comment under post
exports.new_comment = [
    body('text', 'Text Must Not Be Empty').trim().isLength({ min: 1 }),

    (req, res, next) => {
        const errors = validationResult(req)

        const comment = new Comment({
            postId: req.params.postid,
            userId: req.params.userid,
            text: req.body.text
        })

        if (!errors.isEmpty()) {
            //re-render form if any errors
            res.json({ alerts: errors.array() })
            return
        } else {
            //save comment to database
            comment.save(function (err) {
                if (err) { return next(err) }
                res.json({ alerts: { msg: "Comment Saved Successfully" } })
            });
        }
    }
]

//UPDATE users comment
exports.update_comment = [

    body('text', 'Text Must Not Be Empty').trim().isLength({ min: 1 }),

    function (req, res, next) {
        async.parallel({
            user: function (cb) {
                User.findById(req.params.userid).exec(cb)
            },
            comment: function (cb) {
                Comment.findById(req.params.commentid).exec(cb)
            },
        }, function (err, results) {
            if (err) {
                return next(err)
            } else if (!results.user || !results.comment) {
                res.status(404).json({ alert: { msg: "User or Comment Not Found" } })
            } else if (results.comment.userId.toString() !== results.user._id.toString()) {
                res.status(401).json({ alert: { msg: "You Can't Edit This Comment!" } })
            } else {
                const updatedComment = new Comment({
                    _id: results.comment._id,
                    userId: results.comment.userId,
                    postId: results.comment.postId,
                    text: req.body.text,
                    date: results.comment.date
                })

                Comment.findByIdAndUpdate(results.comment._id, updatedComment, {}, function (err) {
                    if (err) { return next(err) }
                    res.json({
                        alerts: [{ msg: "Comment Updated Successfully" }],
                        updatedComment
                    });
                })
            }
        })
    }
]

//GET all posts comments
exports.get_post_comments = function (req, res, next) {
    Comment.find({ postId: req.params.id })
        .sort({ date: -1 })
        .exec(function (err, post_comments) {
            if (err) { return next(err) }
            res.status(200).json({ post_comments })
        })
}
