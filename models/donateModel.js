const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    /* ─────────────────────────────
     OPTIONAL REGISTERED USER
     (nullable for guest donations)
    ───────────────────────────── */
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: false, // ⭐ allow anonymous
      index: true,
    },

    /* ─────────────────────────────
     DONOR INFO (for guests or records)
    ───────────────────────────── */
    donorName: {
      type: String,
      trim: true,
      required: true,
    },

    donorEmail: {
      type: String,
      trim: true,
      lowercase: true,
      required: true, // needed to send receipt + track total by email
      index: true,
    },

    donorPhone: {
      type: String,
    },

    /* ─────────────────────────────
     DONATION DETAILS
    ───────────────────────────── */
    amount: {
      type: Number,
      required: true,
      min: 100, // set your minimum donation
    },

    currency: {
      type: String,
      default: "NGN",
    },

    /* ─────────────────────────────
     TOTAL DONATED (LIFETIME)
     ✅ Added — running total across
     all donations by this donor.

     Updated atomically after each
     successful payment verification.

     Stored on the donation record
     so you always know what their
     cumulative total was at the
     time of each donation.

     To get current total:
       query the most recent
       success record by email/user.
    ───────────────────────────── */
    totalDonatedByDonor: {
      type: Number,
      default: 0,
    },

    /* ─────────────────────────────
     PAYMENT INFO
    ───────────────────────────── */
    reference: {
      type: String,
      required: true,
      unique: true, // from Paystack/Flutterwave
    },

    paymentMethod: {
      type: String,
      enum: ["card", "bank", "transfer", "ussd"],
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Donation", donationSchema);
