const { model, Schema } = require('mongoose');
const validator = require('validator');

const OTPUserSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: [validator.isMobilePhone, 'Please provide a valid MobilePhone']
    },

    role: {
      type: String,
      enum: ['ADMIN', 'USER'],
      default: 'USER'
    },
    active: {
      type: Boolean,
      default: true
    },
    phoneOtp: String,
    OtpCreate: Date
  },
  { timestamps: true }
);

module.exports = model('OTPUser', OTPUserSchema);
