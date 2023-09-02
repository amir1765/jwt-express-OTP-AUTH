const express = require("express");

const { createNewUser, verifyOTP } = require("../controllers/authController");

const router = express.Router();
router.post("/login", createNewUser);
router.post("/verify", verifyOTP);

module.exports = router;
