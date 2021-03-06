const Comment = require('../models/comment')
const User = require('../models/user')
const { body, validationResult } = require('express-validator');
const async = require('async');

//POST new comment under post
exports.new_comment = [
    body('text', 'Text Must Not Be Empty').trim().isLength({ min: 1 }),

    (req, res, next) => {
        const errors = validationResult(req)

        User.findById(req.params.userid)
            .exec(function (err, user) {
                if (err) { return next(err) }

                const comment = new Comment({
                    postId: req.params.postid,
                    userId: user._id,
                    username: user.username,
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
                        res.json({ alerts: [{ msg: "Comment Saved Successfully" }], comment })
                    });
                }
            })
    }
]

//UPDATE users comment
exports.update_comment = [

    body('text', 'Text Must Not Be Empty').trim().isLength({ min: 1 }),

    function (req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            //re-render form if any errors
            res.status(400).json({ alerts: errors.array() })
            return
        } else {
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
                    res.status(404).json({ alerts: [{ msg: "User or Comment Not Found" }] })
                } else if (results.comment.userId.toString() !== results.user._id.toString()) {
                    res.status(401).json({ alerts: [{ msg: "You Can't Edit This Comment!" }] })
                } else {
                    const updatedComment = new Comment({
                        _id: results.comment._id,
                        userId: results.comment.userId,
                        postId: results.comment.postId,
                        username: results.comment.username,
                        text: req.body.text,
                        date: results.comment.date,
                        likes: results.comment.likes
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
    }
]

//GET all posts comments
exports.get_post_comments = async function (req, res, next) {
    const comments = await Comment.find({ postId: req.params.id }).sort({ date: -1 })

    if (!comments) {
        return res.status(404).json({ msg: "comments not found" });
    } else if (comments.length > 0) {
        return res.status(200).json({ comments })
    } else {
        return res.status(200)
    }
}

//DELETE users comment
exports.delete_comment = function (req, res, next) {
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
            res.status(404).json({ alerts: [{ msg: "User or Comment Not Found" }] })
        } else if (results.comment.userId.toString() !== results.user._id.toString()) {
            res.status(401).json({ alerts: [{ msg: "You Can't Delete This Comment!" }] })
        } else {
            Comment.findByIdAndRemove(results.comment._id, function deleteComment(err) {
                if (err) { return next(err) }
                res.json({ alerts: [{ msg: "Deleted Comment" }] })
            })
        }
    })
}

//PUT like/unlike comments
exports.like_comment = function (req, res, next) {
    Comment.findById(req.params.commentid)
        .exec(function (err, foundComment) {
            if (err) { return next(err) }
            if (!foundComment) { res.status(404).json({ alerts: [{ msg: "Comment doesn't exist" }] }) }

            // if post is found and already liked by user filter out user and return likes to "unlike"
            if (foundComment.likes.includes(req.params.userid)) {
                const likesArray = [...foundComment.likes];
                const filteredLikesArray = likesArray.filter(
                    (userId) => userId != req.params.userid
                );

                const newComment = new Comment({
                    _id: foundComment._id,
                    date: foundComment.date,
                    ...foundComment,
                    likes: filteredLikesArray
                })

                Comment.findByIdAndUpdate(req.params.commentid, newComment, {}, function (err) {
                    if (err) { return next(err) }
                    res.status(201).json({
                        alerts: [{ msg: "Unliked Comment" }],
                        newComment
                    })
                })
            } else {
                const newComment = new Comment({
                    _id: foundComment._id,
                    date: foundComment.date,
                    ...foundComment,
                    likes: [...foundComment.likes, req.params.userid]
                })

                Comment.findByIdAndUpdate(req.params.commentid, newComment, {}, function (err) {
                    if (err) { return next(err) }
                    res.status(201).json({
                        alerts: [{ msg: "Liked Comment" }],
                        newComment
                    })
                })
            }
        })
}
