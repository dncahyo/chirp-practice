var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Posts = mongoose.model('Post');

//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects

    //allow all get request methods
    if(req.method === "GET"){
        return next();
    }

    if (req.isAuthenticated()){
        return next();
    }

    // if the user is not authenticated then redirect him to the login page
    return res.redirect('/#login');
};

//api for all posts
router.route('/posts', isAuthenticated)

    //create a new post
    .post(function(req, res){
        var post = new Posts();
        post.text = req.body.text;
        post.created_by_user_id = req.user._id;
        post.created_by = req.body.created_by;
        post.save(function(err, post) {
            if (err){
                return res.send(500, err);
            }
            return res.json(post);
        });
    })

    .get(function(req, res){
        Posts.find(function(err, data){
            if(err){
                return res.send(500, err);
            }
            return res.send(data);
        });
    })

//api for a specfic post
router.route('/posts/:id')

    //update
    .put(function(req,res){
        Posts.findById(req.params.id, function(err, post){
            if(err)
                res.send(err);

            post.created_by = req.body.created_by;
            post.text = req.body.text;

            post.save(function(err, post){
                if(err)
                    res.send(err);

                res.json(post);
            });
        });
    })

    //get specified post
    .get(function(req,res){
        Posts.findById(req.params.id, function(err, post){
            if(err)
                res.send(err);
            res.json(post);
        });
    })

    //deletes post
    .delete(function(req,res){
        Posts.remove({
            _id: req.params.id
        }, function(err) {
            if (err)
                res.send(err);
            res.json("deleted :(");
        });
    });

module.exports = router;