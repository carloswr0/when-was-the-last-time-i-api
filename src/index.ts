import express, { type Request, type Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import cors from "cors";
import ENVIRONTMENT from "./config/environment.config.ts";
import { sendSuccess } from "./helpers/response.helper.ts";
import connectToMongoDB from "./config/mongodb.config.ts";
import healthRouter from "./routers/health.router.ts";
import authRouter from "./routers/auth.router.ts";
import authMiddleware from "./middlewares/auth.middleware.ts";
import groupsRouter from "./routers/groups.router.ts";

connectToMongoDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/groups", authMiddleware, groupsRouter);

app.use("/api/test", authMiddleware, (req: Request, res: Response) => {
  const { user } = req as Request & { user?: JwtPayload };
  sendSuccess(
    res,
    200,
    null,
    `Auth token is valid and active, also the test endpoint is working! ${user?.name ?? "Guest"}`,
  );
});

app.listen(ENVIRONTMENT.PORT, () => {
  console.log("Express server is running on port: ", ENVIRONTMENT.PORT);
});
