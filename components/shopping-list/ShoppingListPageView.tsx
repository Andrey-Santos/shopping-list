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
    <div className="relative min-h-screen overflow-hidden bg-[#f6f2e8] px-4 py-10">
      <div className="pointer-events-none absolute -left-20 top-[-120px] h-72 w-72 rounded-full bg-[#ff9f1c]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-[-120px] h-72 w-72 rounded-full bg-[#2ec4b6]/25 blur-3xl" />

      <main className="relative mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-[28px] border border-[#1f2d3d]/15 bg-white/75 p-5 shadow-[0_24px_80px_-35px_rgba(15,23,42,0.55)] backdrop-blur md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1f2d3d]/70">
              Pantry Flow
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-[#0f172a]">
              Lista de compras
            </h1>
          </div>
          <div className="rounded-full border border-[#1f2d3d]/15 bg-[#f8fafc] px-4 py-2 text-sm font-medium text-[#1f2d3d]">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </div>
        </header>

        <section className="rounded-2xl border border-[#f59e0b]/25 bg-gradient-to-r from-[#fff5dc] to-[#eefcf9] p-3 md:p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Banana, Arroz, Leite..."
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isSubmitting) {
                  void handleAddItem();
                }
              }}
              className="flex-1 rounded-xl border border-[#1f2d3d]/20 bg-white px-4 py-3 text-[#0f172a] placeholder:text-[#64748b] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#2ec4b6]/25"
              disabled={isSubmitting}
            />

            <button
              onClick={() => {
                void handleAddItem();
              }}
              disabled={isSubmitting}
              className="rounded-xl bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>

          {errorMessage && (
            <p className="mt-3 text-sm text-[#b42318]" role="alert">
              {errorMessage}
            </p>
          )}
        </section>

        {items.length === 0 ? (
          <section className="rounded-2xl border-2 border-dashed border-[#1f2d3d]/20 bg-white/60 p-8 text-center">
            <p className="text-sm font-medium text-[#475569]">
              Nenhum item ainda. Adicione o primeiro para começar.
            </p>
          </section>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="animate-[itemIn_260ms_ease-out] rounded-2xl border border-[#1f2d3d]/12 bg-white p-3 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.8)] transition hover:border-[#0f766e]/40 hover:shadow-[0_20px_40px_-24px_rgba(15,23,42,0.8)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-[#0f172a]">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#64748b]">
                      {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      void handleRemoveItem(item.id);
                    }}
                    disabled={isSubmitting}
                    className="rounded-lg border border-[#ef4444]/35 bg-[#fff1f2] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#b91c1c] transition hover:bg-[#ffe4e6] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Remover ${item.name}`}
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
