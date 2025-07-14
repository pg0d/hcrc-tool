// File: components/ItemList.tsx
import { createSignal, For } from 'solid-js';
import './ItemList.css';

export type ListItem = {
  id: number;
  cookie_url: string;
  date_generated: string;
  account: { id: number; email: string };
  proxy: { id: number; host: string; port: number };
};

type ItemListProps<T extends ListItem> = {
  items: T[];
  onSelect?: (item: T) => void;
};

export function ItemList<T extends ListItem>(props: ItemListProps<T>) {
  const [selectedId, setSelectedId] = createSignal<number | null>(null);

  const handleClick = (item: T) => {
    setSelectedId(item.id);
    props.onSelect?.(item);
  };

  return (
    <div class="item-list__container">
      <For each={props.items}>
        {(item) => (
          <div
            class="item-list__card"
            classList={{ selected: selectedId() === item.id }}
            onClick={() => handleClick(item)}
          >
            <div class="item-list__header">
              <span class="item-id">#ID: {item.id}</span>
              <span class="item-date">
                {new Date(item.date_generated).toLocaleString()}
              </span>
            </div>

            <div class="item-list__details">
              <div><strong>Email:</strong> {item.account.email}</div>
              <div><strong>Proxy:</strong> {item.proxy.host}:{item.proxy.port}</div>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
