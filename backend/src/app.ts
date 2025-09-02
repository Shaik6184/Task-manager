import express, { Request, Response } from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.routes";
import { tasksRouter } from "./routes/tasks.routes";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "task-manager-backend" });
  });

  app.use("/auth", authRouter);
  app.use("/tasks", tasksRouter);

  return app;
}


