"use client";

import { useState } from "react";

import type { ShoppingItemDto } from "@/lib/shopping-list/types";

type ShoppingListPageViewProps = {
  initialItems: ShoppingItemDto[];
};

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const payload = (await response.json()) as { message?: unknown };
    return typeof payload.message === "string" ? payload.message : null;
  } catch {
    return null;
  }
}

export default function ShoppingListPageView({
  initialItems,
}: ShoppingListPageViewProps) {
  const [itemName, setItemName] = useState("");
  const [items, setItems] = useState<ShoppingItemDto[]>(initialItems);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAddItem() {
    const normalized = itemName.trim();

    if (!normalized) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/shopping-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: normalized }),
      });

      if (!response.ok) {
        const message =
          (await readErrorMessage(response)) ?? "Nao foi possivel criar o item.";
        throw new Error(message);
      }

      const createdItem = (await response.json()) as ShoppingItemDto;

      setItems((current) => [createdItem, ...current]);
      setItemName("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro inesperado ao criar item.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveItem(id: number) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/shopping-items/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message =
          (await readErrorMessage(response)) ??
          "Nao foi possivel remover o item.";
        throw new Error(message);
      }

      setItems((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro inesperado ao remover item.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-md">
        <h1 className="text-xl text-gray-900 font-bold text-center">
          Lista de compras
        </h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite um item"
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !isSubmitting) {
                void handleAddItem();
              }
            }}
            className="text-gray-900 placeholder-gray-400 border border-gray-300 flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />

          <button
            onClick={() => {
              void handleAddItem();
            }}
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        {errorMessage && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        )}

        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-gray-800">{item.name}</span>

              <button
                onClick={() => {
                  void handleRemoveItem(item.id);
                }}
                disabled={isSubmitting}
                className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
