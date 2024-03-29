const router = require("express").Router();
const multer = require("multer");
const secureAPI = require("../../utils/secure");
const controller = require("./movie.controller");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/movies");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "." + file.originalname.split(".")[1];
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/",
  secureAPI(["admin"]),

  upload.array("images", 4),
  async (req, res, next) => {
    try {
      if (req.files) {
        req.body.images = [];
        req.files.map((file) =>
          req.body.images.push("movies/".concat(file.filename))
        );
      }
      if (req.body.images && req.body.images.length > 0) {
        req.files = req.body.images;
        req.body.images = [];
        req.files.map((file) => req.body.images.push(file));
      }

      req.body.created_by = req.currentUser;

      const result = await controller.create(req.body);
      res.json({ data: result, msg: "success" });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    const { limit, page, name, isArchive } = req.query;
    const search = { name, isArchive };
    const result = await controller.list(limit, page, search);
    res.json({ data: result, msg: "success" });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await controller.getById(req.params.id);
    res.json({ data: result, msg: "success" });
  } catch (e) {
    next(e);
  }
});

router.put(
  "/:id",
  secureAPI(["admin"]),
  upload.array("images", 4),
  async (req, res, next) => {
    try {
      if (req.files) {
        req.body.images = [];
        req.files.map((file) =>
          req.body.images.push("products/".concat(file.filename))
        );
      }

      req.body.updated_by = req.currentUser;
      const result = await controller.updateById(req.params.id, req.body);
      res.json({ data: result, msg: "success" });
    } catch (e) {
      next(e);
    }
  }
);

router.delete("/:id", secureAPI(["admin"]), async (req, res, next) => {
  try {
    req.body.updated_by = req.currentUser;
    const result = await controller.deleteById(req.params.id, req.body);
    res.json({ data: result, msg: "success" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
