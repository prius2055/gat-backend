// const mongoose = require("mongoose");
// const crypto = require("crypto");
// const Donation = require("../models/donateModel");
// const User = require("../models/userModel");

// // const url = "https://globalalliancecampaign.com/donate/verify"

// const url = "http://localhost:3000/donate/verify";

// const initializePayment = async (req, res) => {
//   console.log("=== Initialize Wallet Funding START ===");

//   const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
//   console.log("PAYSTACK_SECRET exists:", !!PAYSTACK_SECRET);

//   try {
//     console.log("Request body:", req.body);

//     const amount = Number(req.body.amount);
//     const emailInput = req.body.email;

//     if (!amount || amount <= 0) {
//       console.log("Invalid amount received:", amount);
//       return res.status(400).json({
//         status: "fail",
//         message: "Invalid amount",
//       });
//     }

//     const email = req.user?.email || emailInput || `guest@globalalliance.com`;

//     console.log("📧 Email resolved:", email ? "present" : "missing");

//     const reference = crypto.randomBytes(10).toString("hex");

//     console.log("🧾 Generated reference:", reference);

//     console.log("💾 Creating pending donation record...");

//     await Donation.create({
//       user: req.user?._id || null,
//       donorEmail: email,
//       amount,
//       reference,
//       status: "pending",
//       campaign: "general",
//     });

//     console.log("✅ Pending record saved");

//     console.log("🚀 Initializing Paystack...");

//     const paymentData = {
//       email,
//       amount: amount * 100,
//       currency: "NGN",
//       callback_url: url,
//       metadata: {
//         userId: req.user?._id.toString() || null,
//       },
//     };

//     console.log("Payment data to Paystack:", paymentData);

//     const response = await fetch(
//       "https://api.paystack.co/transaction/initialize",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(paymentData),
//       },
//     );

//     console.log("Paystack response status:", response.status);
//     console.log("Paystack response ok:", response.ok);

//     const data = await response.json();
//     console.log("Paystack response data:", data);

//     if (!response.ok) {
//       console.error("Paystack returned error:", data);
//       return res.status(response.status).json({
//         status: "fail",
//         message: data.message || "Paystack initialization failed",
//       });
//     }

//     console.log("Authorization URL:", data?.data?.authorization_url);

//     return res.status(200).json({
//       status: "success",
//       authorization_url: data.data.authorization_url,
//     });
//   } catch (error) {
//     console.error("=== Initialize Payment ERROR ===");
//     console.error("Error message:", error.message);
//     console.error("Error stack:", error.stack);

//     return res.status(500).json({
//       status: "fail",
//       message: error.message,
//     });
//   }
// };

// // const verifyPayment = async (req, res) => {
// //   console.log("\n==============================");
// //   console.log("🔍 VERIFY WALLET FUNDING STARTED");
// //   console.log("==============================");

// //   try {
// //     const { reference } = req.query;
// //     console.log("📌 Reference received:", reference);

// //     if (!reference) {
// //       console.log("❌ Missing payment reference");
// //       return res.status(400).json({
// //         status: "fail",
// //         message: "Payment reference missing",
// //       });
// //     }

// //     console.log("🔑 Verifying payment with Paystack...");

// //     const response = await fetch(
// //       `https://api.paystack.co/transaction/verify/${reference}`,
// //       {
// //         headers: {
// //           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
// //         },
// //       },
// //     );

// //     const result = await response.json();
// //     console.log("📦 Paystack raw response:", result);

// //     const payment = result.data;

// //     if (!payment || payment.status !== "success") {
// //       console.log("❌ Payment verification failed:", payment?.status);
// //       return res.status(400).json({
// //         status: "fail",
// //         message: "Payment not successful",
// //       });
// //     }

// //     // ✅ NORMALIZE USER ID (CRITICAL)
// //     const userId = new mongoose.Types.ObjectId(payment.metadata.userId);
// //     const amount = payment.amount / 100;

// //     console.log("✅ Payment verified");
// //     console.log("👤 User ID:", userId.toString());
// //     console.log("💵 Amount:", amount);

// //     // 🔐 CREATE TRANSACTION (ANTI-DUPLICATE HARD STOP)
// //     let transaction;
// //     try {
// //       transaction = await Transaction.create({
// //         user: userId,
// //         type: "wallet_funding",
// //         amount,
// //         reference: `REF-FUNDING-${reference}`,
// //         description: `Wallet funding of ${amount}`,
// //         status: "success",
// //       });
// //       console.log("🧾 Transaction created:", transaction._id);
// //     } catch (err) {
// //       if (err.code === 11000) {
// //         console.log("⚠️ Duplicate transaction detected — exiting safely");
// //         return res.json({
// //           status: "success",
// //           message: "Transaction already processed",
// //         });
// //       }
// //       throw err;
// //     }

// //     // 🔍 FETCH USER (BEFORE WALLET UPDATE)
// //     const user = await User.findById(userId);
// //     console.log("👤 User before update:", {
// //       id: user?._id,
// //       hasFunded: user?.hasFunded,
// //     });

// //     // ✅ MARK USER AS FUNDED IMMEDIATELY
// //     if (!user.hasFunded) {
// //       await User.findByIdAndUpdate(userId, { hasFunded: true });
// //       console.log("✅ User marked as funded");
// //     }

// //     // 💰 UPDATE WALLET (ATOMIC)
// //     const wallet = await Wallet.findOneAndUpdate(
// //       { user: userId },
// //       {
// //         $inc: {
// //           balance: amount,
// //           totalFunded: amount,
// //         },
// //       },
// //       { new: true, upsert: true },
// //     );

// //     console.log("💰 Wallet after credit:", wallet);

// //     console.log("🏁 VERIFY WALLET FUNDING COMPLETED SUCCESSFULLY");
// //     console.log("==============================\n");

// //     return res.status(200).json({
// //       status: "success",
// //       data: {
// //         wallet,
// //         transaction,
// //       },
// //     });
// //   } catch (error) {
// //     console.error("🔥 VERIFY FUNDING ERROR:", error);
// //     res.status(500).json({
// //       status: "fail",
// //       message: error.message,
// //     });
// //   }
// // };

// const verifyPayment = async (req, res) => {
//   console.log("\n=== VERIFY PAYMENT START ===");

//   try {
//     const { reference } = req.query;

//     if (!reference) {
//       return res.status(400).json({
//         status: "fail",
//         message: "Payment reference missing",
//       });
//     }

//     /* ── 1. Check for duplicate processing ──
//      * If this reference was already verified, return success immediately.
//      * Prevents double-crediting if user refreshes the verify page.
//      * ── */
//     const existing = await Donation.findOne({ reference, status: "success" });
//     if (existing) {
//       console.log("⚠️ Already processed — returning early");
//       return res.status(200).json({
//         status: "success",
//         message: "Payment already verified",
//         data: { donation: existing },
//       });
//     }

//     /* ── 2. Verify with Paystack ── */
//     const response = await fetch(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       }
//     );

//     const result = await response.json();
//     console.log("📦 Paystack response status:", result?.data?.status);

//     const payment = result.data;

//     if (!payment || payment.status !== "success") {
//       // Mark donation as failed
//       await Donation.findOneAndUpdate(
//         { reference },
//         { status: "failed" }
//       );

//       return res.status(400).json({
//         status: "fail",
//         message: "Payment not successful",
//       });
//     }

//     const amount = payment.amount / 100;
//     const donorEmail = payment.customer?.email;

//     /* ── 3. Calculate running total for this donor ──
//      *
//      * Sum all previous successful donations by same email.
//      * Works for both guests and registered users since
//      * we always store donorEmail.
//      * ── */
//     const previousTotal = await Donation.aggregate([
//       {
//         $match: {
//           donorEmail: donorEmail.toLowerCase(),
//           status: "success",
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: "$amount" },
//         },
//       },
//     ]);

//     const previousDonated = previousTotal[0]?.total || 0;
//     const newTotal = previousDonated + amount;

//     console.log("💰 Previous total:", previousDonated);
//     console.log("💰 New total after this donation:", newTotal);

//     /* ── 4. Update donation record to success ── */
//     const donation = await Donation.findOneAndUpdate(
//       { reference },
//       {
//         status: "success",
//         totalDonatedByDonor: newTotal,    // ✅ running total stored
//         paymentMethod: payment.channel,   // card/bank/transfer etc
//       },
//       { new: true }
//     );

//     /* ── 5. If registered user, update User doc too ── */
//     if (donation?.user) {
//       await User.findByIdAndUpdate(donation.user, {
//         $inc: { totalDonated: amount },   // ✅ running total on User model
//       });
//     }

//     console.log("✅ Payment verified and recorded");
//     console.log("=== VERIFY PAYMENT END ===\n");

//     return res.status(200).json({
//       status: "success",
//       data: {
//         donation,
//         totalDonated: newTotal,
//       },
//     });
//   } catch (error) {
//     console.error("🔥 verifyPayment error:", error.message);
//     return res.status(500).json({
//       status: "fail",
//       message: error.message,
//     });
//   }
// };

// module.exports = {

//   initializePayment,
//   verifyPayment,

// };

const crypto = require("crypto");
const Donation = require("../models/donateModel");
const User = require("../models/userModel");

const url =
  process.env.NODE_ENV === "production"
    ? "https://globalalliancecampaign.com/#/donate/verify"
    : "http://localhost:3000/#/donate/verify"; // ✅ add the #

/* ─────────────────────────────────────────────────────────────
 * INITIALIZE PAYMENT
 * ───────────────────────────────────────────────────────────── */
const initializePayment = async (req, res) => {
  console.log("\n=== INITIALIZE PAYMENT START ===");

  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

  try {
    const { amount: rawAmount, fullName, email, phone } = req.body;

    /* ── Validation ── */
    const amount = Number(rawAmount);

    if (!amount || amount < 100) {
      return res.status(400).json({
        status: "fail",
        message: "Minimum donation amount is ₦100.",
      });
    }

    if (!fullName || !email) {
      return res.status(400).json({
        status: "fail",
        message: "Full name and email are required.",
      });
    }

    /* ── Resolve donor identity ──
     * If user is logged in, prefer their account data.
     * If guest, use what they submitted in the form.
     * ── */
    const donorEmail = (req.user?.email || email).toLowerCase().trim();
    const donorName = req.user?.fullName || fullName;
    const donorPhone = req.user?.phone || phone;

    const reference = crypto.randomBytes(10).toString("hex");

    console.log("🧾 Reference:", reference);
    console.log("👤 Donor:", donorName, "|", donorEmail);
    console.log("💵 Amount:", amount);

    /* ── Create pending donation record ── */
    await Donation.create({
      user: req.user?._id || null, // null for guests
      donorName,
      donorEmail,
      donorPhone,
      amount,
      reference,
      status: "pending",
    });

    console.log("✅ Pending donation record saved");

    /* ── Initialize Paystack ── */
    const paymentData = {
      email: donorEmail,
      amount: amount * 100, // kobo
      currency: "NGN",
      callback_url: url,
      metadata: {
        userId: req.user?._id?.toString() || null, // ✅ safe — no crash for guests
        donorName,
        donorPhone,
      },
    };

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Paystack error:", data);
      return res.status(response.status).json({
        status: "fail",
        message: data.message || "Paystack initialization failed.",
      });
    }

    console.log("✅ Paystack initialized");
    console.log("=== INITIALIZE PAYMENT END ===\n");

    return res.status(200).json({
      status: "success",
      authorization_url: data.data.authorization_url,
    });
  } catch (error) {
    console.error("🔥 initializePayment error:", error.message);
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

/* ─────────────────────────────────────────────────────────────
 * VERIFY PAYMENT
 * ───────────────────────────────────────────────────────────── */
const verifyPayment = async (req, res) => {
  console.log("\n=== VERIFY PAYMENT START ===");

  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({
        status: "fail",
        message: "Payment reference missing.",
      });
    }

    /* ── 1. Duplicate check ──
     * Return success immediately if already processed.
     * Handles: user refreshing verify page, double webhook calls.
     * ── */
    const existing = await Donation.findOne({ reference, status: "success" });
    if (existing) {
      console.log("⚠️ Already processed — returning early");
      return res.status(200).json({
        status: "success",
        message: "Payment already verified.",
        data: {
          donation: existing,
          totalDonated: existing.totalDonatedByDonor,
        },
      });
    }

    /* ── 2. Verify with Paystack ── */
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const result = await response.json();
    const payment = result.data;

    console.log("📦 Paystack status:", payment?.status);

    if (!payment || payment.status !== "success") {
      await Donation.findOneAndUpdate({ reference }, { status: "failed" });

      return res.status(400).json({
        status: "fail",
        message: "Payment was not successful.",
      });
    }

    const amount = payment.amount / 100;
    const donorEmail = payment.customer?.email?.toLowerCase();

    /* ── 3. Calculate running total for this donor ──
     * Aggregates all previous successful donations by email.
     * Works for both guests and registered users.
     * ── */
    const previousTotal = await Donation.aggregate([
      {
        $match: {
          donorEmail,
          status: "success",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const previousDonated = previousTotal[0]?.total || 0;
    const newTotal = previousDonated + amount;

    console.log("💰 Previous total donated:", previousDonated);
    console.log("💰 New total after this:", newTotal);

    /* ── 4. Mark donation as successful ── */
    const donation = await Donation.findOneAndUpdate(
      { reference },
      {
        status: "success",
        totalDonatedByDonor: newTotal,
        paymentMethod: payment.channel || null,
      },
      { new: true },
    );

    /* ── 5. Update registered user's total if applicable ── */
    if (donation?.user) {
      await User.findByIdAndUpdate(donation.user, {
        $inc: { totalDonated: amount },
      });
      console.log("✅ User totalDonated incremented");
    }

    console.log("✅ Payment verified and recorded");
    console.log("=== VERIFY PAYMENT END ===\n");

    return res.status(200).json({
      status: "success",
      data: {
        donation,
        totalDonated: newTotal,
      },
    });
  } catch (error) {
    console.error("🔥 verifyPayment error:", error.message);
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
};
