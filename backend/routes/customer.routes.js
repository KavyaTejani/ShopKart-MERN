const express = require("express");
const {registerCustomer, loginCustomer, getProfile, logoutCustomer, changePassword} = require("../controllers/customer.controller.js");
const protect = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/me", protect, getProfile); // what does protect do?
router.post("/logout", logoutCustomer);
router.patch("/change-password", protect, changePassword);

module.exports = router;