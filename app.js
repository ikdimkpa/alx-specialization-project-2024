require("dotenv").config();

const express = require("express");
const app = express();
const expressLayout = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const methodOveride = require("method-override");
const mongoStore = require("connect-mongo");
const connectDB = require("./server/config/db");
const { isActiveRoute } = require("./server/helpers/routerHelpers");

const PORT = 5000 || process.env.PORT;

// Connect to database
connectDB();
// Load and set middlewares

// Parse the url parameters
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOveride("_method"));
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: mongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
}));

app.use(express.static("public"));
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.locals.isActiveRoute = isActiveRoute;

app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));

app.listen(PORT, () => {
    console.log(`Server running on port -> ${PORT}`);
});
