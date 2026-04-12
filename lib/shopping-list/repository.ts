import "server-only";

import type { ShoppingItem } from "@prisma/client";

import prisma from "@/lib/prisma";

export async function findAllShoppingItems(): Promise<ShoppingItem[]> {
  return prisma.shoppingItem.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function createShoppingItem(name: string): Promise<ShoppingItem> {
  return prisma.shoppingItem.create({
    data: {
      name,
    },
  });
}

export async function deleteShoppingItemById(id: number): Promise<void> {
  await prisma.shoppingItem.delete({
    where: {
      id,
    },
  });
}
