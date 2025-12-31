import { Router } from "express";
import User from "../models/User";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "User routes" });
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Error fetching user" });
  }
});
// Send friend request: body { from: string, to: string }
router.post("/friend-request/send", async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to)
      return res.status(400).json({ message: "from and to are required" });

    const fromUser = await User.findById(from).select("+password"); // password not used but ensure doc type
    if (!fromUser) return res.status(404).json({ message: "Sender not found" });

    await fromUser.sendFriendRequest(to);
    res.json({ message: "Friend request sent" });
  } catch (err: any) {
    res
      .status(400)
      .json({ message: err.message || "Error sending friend request" });
  }
});

// Accept friend request: body { from: string, to: string }  (to accepts from)
router.post("/friend-request/accept", async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to)
      return res.status(400).json({ message: "from and to are required" });

    const toUser = await User.findById(to);
    if (!toUser)
      return res.status(404).json({ message: "Recipient not found" });

    await toUser.acceptFriendRequest(from);
    res.json({ message: "Friend request accepted" });
  } catch (err: any) {
    res
      .status(400)
      .json({ message: err.message || "Error accepting friend request" });
  }
});

// Cancel (withdraw) friend request: body { from: string, to: string } (from cancels request to)
router.post("/friend-request/cancel", async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to)
      return res.status(400).json({ message: "from and to are required" });

    const fromUser = await User.findById(from);
    if (!fromUser) return res.status(404).json({ message: "Sender not found" });

    await fromUser.cancelFriendRequest(to);
    res.json({ message: "Friend request canceled" });
  } catch (err: any) {
    res
      .status(400)
      .json({ message: err.message || "Error canceling friend request" });
  }
});

// Remove friend: body { userId: string, friendId: string }
router.post("/friend/remove", async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    if (!userId || !friendId)
      return res
        .status(400)
        .json({ message: "userId and friendId are required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.removeFriend(friendId);
    res.json({ message: "Friend removed" });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Error removing friend" });
  }
});

// Friend suggestions: GET /:userId/suggestions?limit=10
router.get("/:userId/suggestions", async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const suggestions = await User.getFriendSuggestions(userId, limit);
    res.json(suggestions);
  } catch (err: any) {
    res
      .status(400)
      .json({ message: err.message || "Error getting suggestions" });
  }
});

// Get friends: GET /:userId/friends
router.get("/:userId/friends", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("friends", "name email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.friends);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Error getting friends" });
  }
});

// Get friend requests (received & sent): GET /:userId/requests
router.get("/:userId/requests", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate("friendRequestsReceived", "name email")
      .populate("friendRequestsSent", "name email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      received: user.friendRequestsReceived,
      sent: user.friendRequestsSent,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Error getting requests" });
  }
});

export default router;
