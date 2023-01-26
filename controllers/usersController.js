const mongoose = require("mongoose"),
    passport = require("passport"),
    User = require("../models/users"),
    getUserParams = (body) => {
        return {
            name: {
                first: body.firstName,
                last: body.lastName,
            },
            email: body.email,
            password: body.password,
            zipCode: parseInt(body.zipCode),
        };
    };

module.exports = {
    index: (req, res, next) => {
        User.find({})
            .then((users) => {
                res.locals.users = users;
                next();
            })
            .catch((error) => {
                console.log(`Error fetching users data: ${error.message}`);
                next(error);
            });
    },

    indexView: (req, res) => {
        res.render("users/index", {
            flashMessages: {
                success: "Loaded all users",
            },
        });
    },

    new: (req, res) => {
        res.render("users/new");
    },

    edit: (req, res, next) => {
        let userId = req.params.id;
        User.findById(userId)
            .then((user) => {
                res.render("users/edit", {
                    user: user,
                });
                next();
            })
            .catch((error) => {
                console.log(`Error fetching a user by ID: ${error.message}`);
                next(error);
            });
    },

    show: (req, res, next) => {
        let userId = req.params.id;
        User.findById(userId)
            .then((user) => {
                res.locals.user = user;
                next();
            })
            .catch((error) => {
                console.log(`Error showing a user status: ${error.message}`);
                next(error);
            });
    },

    showView: (req, res) => {
        res.render("users/show");
    },

    new: (req, res) => {
        res.render("users/new");
    },

    login: (req, res) => {
        res.render("users/login");
    },

    logout: (req, res, next) => {
        req.logout((error) => {
            if (error) {
                return next(error);
            }
            res.locals.redirect = "/";
            req.flash("success", "You have been logged out!");
            next();
        });
    },

    validate: (req, res, next) => {
        req
            .sanitizeBody("email")
            .normalizeEmail({
                all_lowercase: true,
            })
            .trim();
        req.check("email", "Email is invalid").isEmail();
        req
            .check("zipCode", "Zipcode is invalid")
            .notEmpty()
            .isInt()
            .isLength({
                min: 5,
                max: 5,
            })
            .equals(req.body.zipCode);
        req.check("password", "Password cannot be empty").notEmpty();
        req.getValidationResult().then((error) => {
            if (!error.isEmpty()) {
                let messages = error.array().map((error) => error.msg);
                req.skip = true;
                req.flash("error", messages.join(" and "));
                res.locals.redirect = "/users/new";
                next();
            } else {
                next();
            }
        });
    },

    create: (req, res, next) => {
        if (req.skip) next();
        let newUser = new User(getUserParams(req.body));
        User.register(newUser, req.body.password, (error, user) => {
            if (user) {
                req.flash(
                    "success",
                    `${user.fullName}'s account created successfully!`
                );
                res.locals.redirect = "/users";
                next();
            } else {
                req.flash(
                    "error",
                    `Failed to create user account because: ${error.message}`
                );
                res.locals.redirect = "/users/new";
                next(error);
            }
        });
    },

    authenticate: passport.authenticate("local", {
        failureRedirect: "/users/login",
        failureFlash: "Failed to login.",
        successRedirect: "/users",
        successFlash: "Successfully logged in!",
    }),

    delete: (req, res, next) => {
        let userId = req.params.id;
        User.findByIdAndRemove(userId)
            .then(() => {
                res.locals.redirect = "/users";
                next();
            })
            .catch((error) => {
                console.log(`Error deleting user from database: ${error.message}`);
                next(error);
            });
    },

    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath) {
            res.redirect(redirectPath); // *****important*****
        } else {
            next();
        }
    },
};
