import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { getCollections, syncCollections } from "./collections.controller.js";

export const collectionsRouter = Router();

collectionsRouter.use(authenticate);
collectionsRouter.get("/", getCollections);
collectionsRouter.put("/", syncCollections);
