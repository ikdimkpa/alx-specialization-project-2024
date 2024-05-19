const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// Requesting endpoints
router.get("/", async (req, res) => {
    try {
        const locals = {
            title: "EJS Tutorial",
            description: "EJS Tutorial using node, express and mongodb"
        }
        //Setting pagination
        let perPage = 5;
        let page = req.query.page || 1;
        const data = await Post.aggregate([ { $sort: { createdAt: -1 } }])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        //const data = await Post.find();
        res.render("index", {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: "/"
        });
    } catch (error) {
        console.log(error);
    }
});


/*
GET post by id
*/
router.get("/post/:id", async (req, res) => {
    try {
        let postId = req.params.id;
        let data = await Post.findById({ _id: postId});
        const locals = {
            title: data.title,
            description: "Simple blog post with NodeJs, Express & MongoDB",
        }
        // res.render("post", { locals, data } );
        res.render("post", { locals, data, currentRoute: `/post/${postId}`} );
        } catch (error) {
            console.log(error);
    }
});


/*
GET about page
*/
router.get("/about", (req, res) => {
    res.render("about", {
        currentRoute: "/about"
    });
    // res.render("/about")
});


/*
GET contact page
*/
router.get("/contact", (req, res) => {
    res.render("contact", {
        currentRoute: "/contact"
    });
    // res.render("/contact");
});

module.exports = router;