const router = require("express").Router();
const movieRouter = require("../modules/movies/movie.routes");

router.use("/movies", movieRouter);

module.exports = router;
