import ShoppingListPageView from "@/components/shopping-list/ShoppingListPageView";
import { getShoppingListItems } from "@/lib/shopping-list/commands";

export default async function ShoppingListPage() {
  const items = await getShoppingListItems();

  return <ShoppingListPageView initialItems={items} />;
}
