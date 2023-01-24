const mongoose = require("mongoose"),
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

  login: (req, res) => {
    res.render("users/login");
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

  create: (req, res, next) => {
    let userParams = getUserParams(req.body);
    User.create(userParams)
      .then((user) => {
        req.flash(
          "success",
          `${user.fullName}'s account created successfully!`
        );
        res.locals.user = user;
        res.locals.redirect = "/users";
        next();
      })
      .catch((error) => {
        console.log(`Error saving new user: ${error.message}`);
        res.locals.redirect = "/users/new";
        req.flash(
          "error",
          `Failed to create subscriber account because: ${error.message}`
        );
        next();
      });
  },

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

  authenticate: (req, res, next) => {
    User.findOne({
      email: req.body.email,
    })
      .then((user) => {
        if (user && user.password === req.body.password) {
          res.locals.redirect = `users/${user._id}`;
          req.flash("success", `${user.fullName}'s logged in successfully!`);
          res.locals.user = user;
          next();
        } else {
          req.flash(
            "error",
            "Your account or password is incorrect.\nPlease try again or contact your system administrator!"
          );
        }
      })
      .catch((error) => {
        console.log(`Error loggin in user: ${error.message}`);
        next(error);
      });
  },
};
