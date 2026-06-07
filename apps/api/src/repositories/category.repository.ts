import { prisma } from "../prisma/client";

export class CategoryRepository {
  async listAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async findByName(name: string) {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  async create(data: { name: string }) {
    return prisma.category.create({
      data: {
        name: data.name,
      },
    });
  }

  async update(id: string, data: { name: string }) {
    return prisma.category.update({
      where: { id },
      data: {
        name: data.name,
      },
    });
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}
