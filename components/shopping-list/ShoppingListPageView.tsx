"use client";

import { useState } from "react";

export default function ShoppingListPageView() {
  const [itemName, setItemName] = useState("");
  const [items, setItems] = useState<string[]>([]);

  function handleAddItem() {
    const normalized = itemName.trim();

    if (!normalized) return;

    setItems((current) => [...current, normalized]);
    setItemName("");
  }

  function handleRemoveItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
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
              if (event.key === "Enter") handleAddItem();
            }}
            className="text-gray-900 placeholder-gray-400 border border-gray-300 flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleAddItem}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            +
          </button>
        </div>

        <ul className="mt-4 space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-gray-800">{item}</span>

              <button
                onClick={() => handleRemoveItem(index)}
                className="text-red-500 hover:text-red-700"
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
