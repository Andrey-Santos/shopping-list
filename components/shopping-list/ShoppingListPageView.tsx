"use client";

import { useEffect, useMemo, useState } from "react";

type Item = { id: number; name: string; done: boolean };

const STORAGE_KEY = "shopping-list:v1";

function parseItems(text: string): Item[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim())
    .filter(Boolean)
    .map((name, id) => ({ id, name, done: false }));
}

export default function ShoppingListPageView() {
  const [items, setItems] = useState<Item[]>([]);
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setItems(JSON.parse(saved) as Item[]);
      } catch {}
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const pending = useMemo(() => items.filter((i) => !i.done).length, [items]);

  const build = () => {
    const parsed = parseItems(text);
    if (!parsed.length) return;
    setItems(parsed);
    setText("");
  };

  const toggle = (id: number) =>
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  const remove = (id: number) => setItems((cur) => cur.filter((i) => i.id !== id));

  if (!ready) return null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-bold">Lista de Compras</h1>

      {items.length === 0 ? (
        <section className="mt-6 flex flex-col gap-3">
          <p className="text-sm text-slate-400">
            Cole a lista abaixo, um item por linha.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            placeholder={"Ovo\nLeite\nPão"}
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-4 text-base outline-none focus:border-emerald-400"
          />
          <button
            onClick={build}
            disabled={!text.trim()}
            className="h-12 rounded-xl bg-emerald-400 font-semibold text-slate-900 disabled:opacity-40"
          >
            Montar lista
          </button>
        </section>
      ) : (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
            <span>
              {pending} de {items.length} faltando
            </span>
            <button
              onClick={() => setItems([])}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200"
            >
              Nova lista
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
              >
                <button
                  onClick={() => toggle(item.id)}
                  aria-label={item.done ? "Desmarcar" : "Marcar"}
                  className={`h-6 w-6 shrink-0 rounded-full border-2 ${
                    item.done
                      ? "border-emerald-400 bg-emerald-400"
                      : "border-slate-600"
                  }`}
                />
                <span
                  onClick={() => toggle(item.id)}
                  className={`flex-1 cursor-pointer text-base ${
                    item.done ? "text-slate-500 line-through" : ""
                  }`}
                >
                  {item.name}
                </span>
                <button
                  onClick={() => remove(item.id)}
                  aria-label={`Remover ${item.name}`}
                  className="px-2 text-slate-500"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
