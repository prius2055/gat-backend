const User = require("../models/userModel");

const getAllUsers = async (req, res) => {
  try {
    console.log("\n================ USERS FETCH START ================");

    /* --------------------------------------------------
     * 1️⃣ Pagination
     * -------------------------------------------------- */
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    /* --------------------------------------------------
     * 2️⃣ Filters
     * -------------------------------------------------- */
    const { role } = req.query; // ✅ restore this

    const query = {}; // ✅ ALWAYS define query

    if (role) {
      query.role = role;
    }

    console.log("🔍 Raw Query Params:", req.query);
    console.log("🔍 Query Filters:", query);
    console.log("📄 Page:", page, "| Limit:", limit, "| Skip:", skip);

    /* --------------------------------------------------
     * 3️⃣ Fetch users
     * -------------------------------------------------- */
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    console.log(`✅ ${users.length} users fetched`);
    console.log(`📊 Total matching users: ${total}`);

    console.log("================ USERS FETCH END =================\n");

    /* --------------------------------------------------
     * 4️⃣ Response
     * -------------------------------------------------- */
    res.status(200).json({
      status: "success",
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      users,
    });
  } catch (error) {
    console.error("🔥 Fetch users error:", error);

    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getSingleUser,
};
