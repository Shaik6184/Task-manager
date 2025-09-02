import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { AuthenticatedRequest, authMiddleware } from "../middleware/auth";

export const tasksRouter = Router();

tasksRouter.use(authMiddleware);

tasksRouter.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

tasksRouter.post("/", async (req: AuthenticatedRequest, res: Response) => {
  const parse = createTaskSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }
  try {
    const task = await prisma.task.create({
      data: {
        title: parse.data.title,
        description: parse.data.description ?? null,
        priority: (parse.data.priority as any) ?? "MEDIUM",
        userId: req.user!.id,
      },
    });
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

tasksRouter.put("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const parse = updateTaskSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }
  try {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.id) {
      return res.status(404).json({ error: "Task not found" });
    }
    const updates: { title?: string; description?: string | null; completed?: boolean; priority?: "LOW"|"MEDIUM"|"HIGH" } = {};
    if (parse.data.title !== undefined) updates.title = parse.data.title;
    if (parse.data.description !== undefined) updates.description = parse.data.description;
    if (parse.data.completed !== undefined) updates.completed = parse.data.completed;
    if (parse.data.priority !== undefined) updates.priority = parse.data.priority as any;
    const task = await prisma.task.update({ where: { id }, data: updates });
    res.json({ task });
  } catch (err) {
    res.status(404).json({ error: "Task not found" });
  }
});

tasksRouter.patch(
  "/:id/toggle",
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    try {
      const existing = await prisma.task.findUnique({ where: { id } });
      if (!existing || existing.userId !== req.user!.id) {
        return res.status(404).json({ error: "Task not found" });
      }
      const task = await prisma.task.update({
        where: { id },
        data: { completed: !existing.completed },
      });
      res.json({ task });
    } catch (err) {
      res.status(500).json({ error: "Failed to toggle task" });
    }
  }
);

tasksRouter.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.id) {
      return res.status(404).json({ error: "Task not found" });
    }
    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});


