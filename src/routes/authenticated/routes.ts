import { Router } from "express";
import { authenticateUser } from "../../middleware/auth";

const router = Router();

router.post("/user/profile", authenticateUser, (req, res) => {
  res.status(200).json({ message: "Profile fetched successfully", user: 'hi' });
});

export default router;
