import { Router } from "express";
import { getAll } from "../controllers/recipeCategoryController.js";
import { controllerWrapper } from "../controllers/controllerWrapper.js";

export const router = Router();

router.get("/", controllerWrapper(getAll));
