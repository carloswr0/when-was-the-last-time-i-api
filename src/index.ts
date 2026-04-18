import express from "express";
import cors from "cors";
import ENVIRONTMENT from "./config/environment.config.ts";
import connectToMongoDB from "./config/mongodb.config.ts";
import healthRouter from "./routers/health.router.ts";
import authRouter from "./routers/auth.router.ts";
// import authMiddleware from "./middlewares/authMiddleware.js";
// import workspaceRouter from "./routers/workspace.router.js";

connectToMongoDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
//app.use(
//  "/api/workspaces",
//  authMiddleware,
//  workspaceRouter,
//);

//app.use("/api/test", authMiddleware, (req, res) => {
//  res.json({
//    message: `Test endpoint is working! ${req.user ? req.user.name : "Guest"}`,
//  });
//});

app.listen(ENVIRONTMENT.PORT, () => {
  console.log("Express server is running on port: ", ENVIRONTMENT.PORT);
});

// https://github.com/Matu-Dev-JS/2026_UTN_TT_ENERO_LUN_MIE_PWA
