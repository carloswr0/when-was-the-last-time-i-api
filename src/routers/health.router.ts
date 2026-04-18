import express from "express";
import HealthController from "../controllers/health.controller.js";

const healthRouter = express.Router();

const healthController = new HealthController();

healthRouter.get("/", healthController.getApiHealth);
healthRouter.get("/db", healthController.getDbHealth);

export default healthRouter;
