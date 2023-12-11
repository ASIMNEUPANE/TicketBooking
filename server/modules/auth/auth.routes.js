const router = require("express").Router();
const controller = require("./auth.controller");

router.post("/register", async (req, res, next) => {
  try {
    const result = await controller.register(req.body);
    res.json({ data: result, msg: "success" });
  } catch (e) {
    next(e);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) throw new Error("Email or token is missing");
    result = await controller.verifyEmail(email, token);
    res.json({ data: result, msg: "success" });
  } catch (e) {
    next(e);
  }
});

router.post("/regenerate", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Email  is missing");
    result = await controller.regenerateToken(email);
    res.json({ data: result, msg: "success" });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) throw new Error("Email or Password is missing");
    result = await controller.login(email, password);
    res.json({ data: result, msg: "success" });
  } catch (e) {
    next(e);
  }
});
router.put("/generateFPToken", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Email is missing");
    result = await controller.generateFPToken(email);
    res.json({ data: result, msg: "success" });
  } catch (e) {
    next(e);
  }
});
router.put("/forget-password", async (req, res, next) => {
  try {
    const { email, password,token } = req.body;
    if (!email || !password || !token) throw new Error("Email or Password or token is missing");
    result = await controller.forgetPassword(email, password,token);
    res.json({ data: result, msg: "success" });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    result = await controller.deleteById(req.params);
    res.json({ data: result, msg: "success" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
