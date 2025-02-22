import { Router } from "express";
import { register, login } from "../../controllers/auth.controller";

const router = Router();

router.post("/user/auth/register", register);
router.post("/user/auth/login", login);

export default router;
