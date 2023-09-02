const { model, Schema } = require('mongoose');
const validator = require('validator');
const mongoose = require('mongoose');

const JWTSaveSchema = new Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OTPUser'
    },
    jwtToken: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isJWT, 'this is not a valid jwt token']
    }
  },
  { timestamps: true }
);

module.exports = model('JWTSave', JWTSaveSchema);
