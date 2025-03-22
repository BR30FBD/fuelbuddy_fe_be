import { FastifyInstance } from "fastify";
import prisma from "../prisma";

export default async function (app: FastifyInstance) {
  app.post("/signup", async (req, reply) => {
    const { email } = req.body as { email: string };
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({ data: { email } });
    }

    const token = app.jwt.sign({ email });
    reply.send({ token:token,id:user.id });
  });
    app.get("/user-list", async (req, reply) => {
      const user = await prisma.user.findMany();
      reply.send(user);
    });
}
