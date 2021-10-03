const Comment = require('../models/comment')
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

//GET all posts comments
exports.get_post_comments = function (req, res, next) {
    Comment.find({ postId: req.params.id })
        .sort({ date: -1 })
        .exec(function (err, post_comments) {
            if (err) { return next(err) }
            res.status(200).json({ post_comments })
        })
}
