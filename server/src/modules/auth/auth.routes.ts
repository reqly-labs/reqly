import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import {
    getMe,
    handleGitHubCallback,
    handleGoogleCallback,
    redirectToGitHub,
    redirectToGoogle,
} from "./auth.controller.js";

export const authRouter = Router();

authRouter.get("/google", redirectToGoogle);
authRouter.get("/google/callback", handleGoogleCallback);
authRouter.get("/github", redirectToGitHub);
authRouter.get("/github/callback", handleGitHubCallback);
authRouter.get("/me", authenticate, getMe);
