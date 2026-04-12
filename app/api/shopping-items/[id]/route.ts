import { NextResponse } from "next/server";

import {
  ShoppingItemNotFoundError,
  ShoppingListValidationError,
  removeShoppingListItem,
} from "@/lib/shopping-list/commands";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await removeShoppingListItem(Number(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ShoppingListValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error instanceof ShoppingItemNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error("Erro ao remover item da compra:", error);
    return NextResponse.json(
      { message: "Nao foi possivel remover o item agora." },
      { status: 500 },
    );
  }
}
