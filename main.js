const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/confetti_cuisine", {
    useNewUrlParser: true,
});

const db = mongoose.connection;
mongoose.Promise = global.Promise;
db.once("open", () => {
    console.log("Successfully connected to MongoDB using Mongoose");
});

const express = require("express"),
    app = express(),
    router = express.Router(),
    methodOverride = require("method-override"),
    layouts = require("express-ejs-layouts"),
    passport = require("passport"),
    expressValidator = require("express-validator");

const homeController = require("./controllers/homeController"),
    errorController = require("./controllers/errorController"),
    subscribersController = require("./controllers/subscribersController"),
    usersController = require("./controllers/usersController"),
    User = require("./models/users");

const expressSession = require("express-session"),
    cookieParser = require("cookie-parser"),
    connectFlash = require("connect-flash");

app.use("/", router);

app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);

router.use(layouts);
router.use(express.static("public"));
router.use(
    express.urlencoded({
        extended: false,
    })
);
router.use(express.json());
router.use(
    methodOverride("_method", {
        methods: ["POST", "GET"],
    })
);

router.use(expressValidator());
router.use(
    expressSession({
        secret: "secretCuisine007",
        cookie: {
            maxAge: 4000000,
        },
        resave: false,
        saveUninitialized: false,
    })
);
router.use(cookieParser("secretCuisine007"));
router.use(connectFlash());
router.use(passport.initialize()); // initialize to use passport as middleware
router.use(passport.session()); // instruct passport to use session
passport.use(User.createStrategy()); // creating default strategy
// works only after I set up the User model with passport-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// set up passport to compact, encrypt, decrypt user data
router.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
}); // will be able to access flash messages in the views

router.get("/", homeController.showHome);
router.get("/courses", homeController.showCourses);
router.get(
    "/subscribers",
    subscribersController.index,
    subscribersController.indexView
);

router.get("/users/new", usersController.new);
router.get("/users", usersController.index, usersController.indexView);

router.get("/users/login", usersController.login);
router.post("/users/login", usersController.authenticate);
router.get(
    "/users/logout",
    usersController.logout,
    usersController.redirectView
);

router.get("/users/new", usersController.new);
router.post(
    "/users/create",
    usersController.validate,
    usersController.create,
    usersController.redirectView
);
router.get("/users/:id", usersController.show, usersController.showView);

router.get("/users/:id/edit", usersController.edit);
router.delete(
    "/users/:id/delete",
    usersController.delete,
    usersController.redirectView
);
router.get("/subscribers/new", subscribersController.new);
router.get(
    "/subscribers/:id",
    subscribersController.show,
    subscribersController.showView
);
router.get("/subscribers/:id/edit", subscribersController.edit);

router.put(
    "/subscribers/:id/update",
    subscribersController.update,
    subscribersController.redirectView
);

router.post(
    "/subscribers/create",
    subscribersController.create,
    subscribersController.redirectView
);

router.delete(
    "/subscribers/:id/delete",
    subscribersController.delete,
    subscribersController.redirectView
);

router.use(errorController.pageNotFoundError);
router.use(errorController.internalServerError);

app.listen(app.get("port"), () => {
    console.log(`Server is running at http://localhost:${app.get("port")}`);
});
