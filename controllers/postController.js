const Post = require('../models/post')
const { body, validationResult } = require('express-validator');

// Handle user new post
exports.new_post = [

    body('text', 'Text Must Not Be Empty').trim().isLength({ min: 1 }),

    (req, res, next) => {
        //Errors from req if any
        const errors = validationResult(req);

        const { text } = req.body;
        const post = new Post({
            userId: req.params.id,
            text
        });

        if (!errors.isEmpty()) {
            //re-render form if any errors
            res.json({ alerts: errors.array() })
            return
        } else {
            //save post to database
            post.save(function (err) {
                if (err) { return next(err) }
                res.json({ alerts: { msg: "Post Saved Successfully" } })
            });
        };
    }
];