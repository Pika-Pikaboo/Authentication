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
  homeController = require("./controllers/homeController"),
  errorController = require("./controllers/errorController"),
  subscribersController = require("./controllers/subscribersController");

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

router.get("/", homeController.showHome);
router.get("/courses", homeController.showCourses);
router.get(
  "/subscribers",
  subscribersController.index,
  subscribersController.indexView
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
