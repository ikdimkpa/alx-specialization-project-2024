const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const adminLayout = "../views/layouts/admin";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

/*
Auth middleware that verifies a valid user with
access token
*/
const auth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decodedToken = jwt.verify(token, jwtSecret);
        req.userId = decodedToken.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}
/*
GET for admin route
*/
router.get("/search", async(req, res) => {
    res.redirect("admin");
});

/*
GET for admin route
*/
router.get("/admin", async(req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "A Blog Post with Nodejs, Express and Mongodb"
        }
        res.render("admin/login", { locals, layout: adminLayout });
        
    } catch (error) {
        console.log(error);
    }
});

/*
POST for admin route
*/


router.post("/admin", async(req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
    }
});

/*
GET dashboard route
*/
router.get("/dashboard", auth, async(req, res) => {
    try {
        const locals = {
            title: "Dashboard",
            description: "A Blog Post created with NodeJS, Express and Mongodb"
        }
        const data =  await Post.find();
        res.render("admin/dashboard", {
            locals,
            data,
            layout: adminLayout
        });
        
    } catch (error) {
        console.log(error);
    }
});

/*
GET admin create new POST
*/
router.get("/add-post", auth, async(req, res) => {
    try {
        const locals = {
            title: "Add Post",
            description: "A Blog Post created with NodeJS, Express and Mongodb"
        }
        const data = await Post.find();
        res.render("admin/add-post", {
            locals,
            layout: adminLayout
    });
    } catch(error) {
        console.log(error);
        
    }
});


/*
POST admin create new POST
*/
router.post("/add-post", auth, async(req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            body: req.body.body
        });
        await Post.create(newPost);
        res.redirect("/dashboard");
    } catch(error) {
        console.log(error);
    }
});


/*
GET view POST by id
*/
router.get("/edit-post/:id", auth, async(req, res) => {
    try {
        const locals = {
            title: "Edit Post",
            description: "A Blog Post created with NodeJS, Express and Mongodb"
        }
        const data = await Post.findOne({ _id: req.params.id });
        res.render("admin/edit-post", {
            locals,
            data,
            layout: adminLayout
        });
    } catch(error) {
        console.log(error);
    }
});


/*
PUT admin update new POST
*/
router.put("/edit-post/:id", auth, async(req, res) => {
    try {

        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });
        res.redirect(`/edit-post/${req.params.id}`);
        
    } catch(error) {
        console.log(error);
    }
});

/*
GET register
*/
router.get("/register", async(req, res) => {
    res.render("admin/register", {
        currentRoute: "/register"
    });
});


/*
DELETE POST
*/
router.delete("/delete-post/:id", auth, async(req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect("/dashboard");
    } catch(error) {
        console.log(error);
    }
});



/*
POST for register route
*/
router.post("/register", async(req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: "User Created", user });

        } catch(error) {
            if(error.code === 11000) {
                res.status(400).json({ message: "User already in use"} );
            }
            res.status(500).json({ message: "Internal server error" });
        }
    } catch(error) {
        console.log(error);
    }
});


/*
GET Admin logout
*/
router.get("/logout", async(req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});



module.exports = router;