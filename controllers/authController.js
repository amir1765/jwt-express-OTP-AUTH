const validate = require("validator");
// const Ghasedak = require("ghasedak");

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/otpUser.model");
const JWTSave = require("../models/jwt.model");
const { signToken } = require("../utils/token.util");
const { generateOTP } = require("../utils/otp.util");
const { promisify } = require("util");
// const ghasedak = new Ghasedak(
// this is my otp sms provider fill free to delete it and use ur provider
// );

// --------------------- create new user ---------------------------------

exports.createNewUser = catchAsync(async (req, res, next) => {
  //check users phone
  const { phone } = req.body;
  //validation
  if (!validate.isMobilePhone(phone, "ir-IR")) {
    return next(new AppError("Incorrect phone", 401));
  }
  // check duplicate phone Number
  const phoneExist = await User.findOne({ phone });
  // generate otp code
  const otp = generateOTP(6);

  if (phoneExist) {
    //check user
    if (phoneExist.active === false) {
      res.status(403).json({
        type: "banned",
        message: "You are temporarily or permanently banned !",
      });
    }
    //otp limit send
    if (phoneExist.OtpCreate) {
      if (Date.now() < Date.parse(phoneExist.OtpCreate) + 120000) {
        res.status(402).json({
          type: "otp limit",
          message: "too many otp request mate our server is on fire ",
        });
      }
    }
    // save otp to user collection
    phoneExist.phoneOtp = otp;
    phoneExist.OtpCreate = Date.now();
    await phoneExist.save();
    res.status(201).json({
      type: "success",
      message: "OTP sent to your registered phone number",
      data: {
        //beware change or delete  phoneExist object because it contains otp code
        userId: phoneExist,
      },
    });

  } else {
    // create new user
    const newUser = await User.create({
      phone: phone,
      phoneOtp: otp,
      OtpCreate: Date.now(),
    });
    res.status(201).json({
      type: "success",
      message: "Account created OTP sent to mobile number",
      data: {
        userId: newUser,
      },
    });
  }
  // send otp to phone number
  // await ghasedak.verification({
  //     receptor: phone,
  //     type: '1',
  //     template: 'otp1',
  //     param1: otp
  // });
});

exports.verifyOTP = catchAsync(async (req, res, next) => {
  //get phone and otp shit
  const { otp, phone } = req.body;
  //find the user
  const user = await User.findOne({ phone });
  //if user does not exist
  if (!user) {
    next({ status: 400, message: "User not found" });
    return;
  }
  //if user fill incorrect
  if (user.phoneOtp !== otp) {
    next({ status: 400, message: " INCORRECT OTP" });
    return;
  }
  //if otp is expired
  if (Date.now() > Date.parse(user.OtpCreate) + 120000) {
    next({ status: 400, message: " otp expired " });
    user.phoneOtp = "";
    user.OtpCreate = "";
    await user.save();
    return;
  }
  //sign jwt token
  const token = signToken({ userId: user._id });
  //null the otp fields
  user.phoneOtp = "";
  user.OtpCreate = "";
  await user.save();
  //save the jwt token for any change or other session game
  await JWTSave.create({
    owner: user._id,
    jwtToken: token,
  });
  //cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  //send cookie
  res.cookie("jwt", token, cookieOptions);
  //send msg
  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});
