const express = require("express");
const router = express.Router();
const authenticateUser = require("../utils/authMiddleware");

router.get("/", authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
        .select("notifications")
        .lean();

        const unread = user.notifications
        .filter(n => !n.read)
        .sort((a,b) => b.timestamp - a.timestamp);

        res.json({ data: unread });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

router.patch("/:id/read", authenticateUser, async (req, res) => {
    try {
        await User.updateOne(
        { _id: req.user.userId, "notifications._id": req.params.id },
        { $set: { "notifications.$.read": true } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to mark notification" });
    }
});

module.exports = router;