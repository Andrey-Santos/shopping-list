import { NextRequest, NextResponse } from "next/server";

import {
  ShoppingListValidationError,
  addShoppingListItem,
  getShoppingListItems,
} from "@/lib/shopping-list/commands";

export async function GET() {
  try {
    const items = await getShoppingListItems();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar itens da compra:", error);
    return NextResponse.json(
      { message: "Nao foi possivel listar os itens agora." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as { name?: unknown };

    if (typeof payload.name !== "string") {
      throw new ShoppingListValidationError("O campo name deve ser uma string.");
    }

    const item = await addShoppingListItem(payload.name);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof ShoppingListValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("Erro ao criar item da compra:", error);
    return NextResponse.json(
      { message: "Nao foi possivel criar o item agora." },
      { status: 500 },
    );
  }
}
