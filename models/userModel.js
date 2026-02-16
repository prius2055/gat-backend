const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    userImage: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["member", "supporter", "premium_member", "admin"],
      default: "member",
      index: true,
    },

    memberShipNumber: {
      type: String,
      unique: true,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    upgradedAt: Date,

    lastLogin: Date,

    passwordChangedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
