import { FastifyInstance } from "fastify";
import prisma from "../prisma";

export default async function (app: FastifyInstance) {
  app.get("/tasks", async (req, reply) => {
    const tasks = await prisma.task.findMany();
    reply.send(tasks);
  });

  app.post("/tasks", async (req, reply) => {
    const { title, userId,assignedToId,isMine } = req.body as { title: string; userId: string;assignedToId? : string;isMine:boolean };
    const task = await prisma.task.create({ data: { title, userId, assignedToId, isMine } });
    reply.send(task);
  });
  app.post("/tasks-share", async (req, reply) => {
    const { email, taskId } = req.body as { email: string; taskId: string };
    const existingTask = await prisma.user.findUnique({
      where: { email:email },
    });
    if (!existingTask) {
      return reply.status(404).send({ error: "Task not found." });
    }
    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id:taskId },
      data: {
        ...({isMine: false }),
        ...({ assignedToId:existingTask?.id }),
      },
    });

    return reply.send(updatedTask);
  });
  app.post("/tasks-delete/:taskId", async (req, reply) => {
    const { taskId } = req.params as { taskId: string };
    try {
    const deletedTask = await prisma.task.delete({
    where: { id: taskId },
    });
    return reply.send({ message: "Task deleted successfully", deletedTask });
    } catch (error) {
    return reply.status(500).send({ error: "Task deletion failed." });
    }
    });
}
