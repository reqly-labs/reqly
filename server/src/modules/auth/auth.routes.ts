import { rateLimit } from "express-rate-limit";
import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  getMe,
  handleGitHubCallback,
  handleGoogleCallback,
  redirectToGitHub,
  redirectToGoogle,
} from "./auth.controller.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

export const authRouter = Router();

authRouter.use(limiter);
authRouter.get("/google", redirectToGoogle);
authRouter.get("/google/callback", handleGoogleCallback);
authRouter.get("/github", redirectToGitHub);
authRouter.get("/github/callback", handleGitHubCallback);
authRouter.get("/me", authenticate, getMe);
