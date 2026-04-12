import "server-only";

import { Prisma } from "@prisma/client";

import {
  createShoppingItem,
  deleteShoppingItemById,
  findAllShoppingItems,
} from "@/lib/shopping-list/repository";
import type { ShoppingItemDto } from "@/lib/shopping-list/types";

const MAX_ITEM_NAME_LENGTH = 80;

export class ShoppingListValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShoppingListValidationError";
  }
}

export class ShoppingItemNotFoundError extends Error {
  constructor(message = "Item nao encontrado.") {
    super(message);
    this.name = "ShoppingItemNotFoundError";
  }
}

function toDto(item: { id: number; name: string; createdAt: Date }): ShoppingItemDto {
  return {
    id: item.id,
    name: item.name,
    createdAt: item.createdAt.toISOString(),
  };
}

function normalizeItemName(rawName: string): string {
  const normalized = rawName.trim();

  if (!normalized) {
    throw new ShoppingListValidationError("O nome do item e obrigatorio.");
  }

  if (normalized.length > MAX_ITEM_NAME_LENGTH) {
    throw new ShoppingListValidationError(
      `O nome do item deve ter no maximo ${MAX_ITEM_NAME_LENGTH} caracteres.`,
    );
  }

  const lowerCased = normalized.toLocaleLowerCase("pt-BR");
  return (
    lowerCased.charAt(0).toLocaleUpperCase("pt-BR") + lowerCased.slice(1)
  );
}

function assertValidId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ShoppingListValidationError("ID do item invalido.");
  }
}

export async function getShoppingListItems(): Promise<ShoppingItemDto[]> {
  const items = await findAllShoppingItems();

  return items.map(toDto);
}

export async function addShoppingListItem(rawName: string): Promise<ShoppingItemDto> {
  const name = normalizeItemName(rawName);
  const item = await createShoppingItem(name);

  return toDto(item);
}

export async function removeShoppingListItem(id: number): Promise<void> {
  assertValidId(id);

  try {
    await deleteShoppingItemById(id);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new ShoppingItemNotFoundError();
    }

    throw error;
  }
}
