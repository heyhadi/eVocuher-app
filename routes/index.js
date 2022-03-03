const router = require("express").Router()
const userRoute = require("./user");
const adminRoute = require("./admin");


router.use("/user", userRoute);
router.use("/admin", adminRoute);
router.get("/", (req, res) => {
  res.send("helooooo");
});

module.exports = router;