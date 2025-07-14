import { createSignal, For } from 'solid-js';
import './ProfileVariantPills.css'; // Optional if you want to style externally

type ProfileVariantPillsProps = {
  options: number[];
  onSelect?: (value: number) => void;
};

export function ProfileVariantPills(props: ProfileVariantPillsProps) {
  const [selected, setSelected] = createSignal<number | null>(null);

  const handleClick = (value: number) => {
    setSelected(value);
    props.onSelect?.(value);
  };

  return (
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      <For each={props.options}>
        {(option) => (
          <div
            class="pill"
            classList={{ selected: selected() === option }}
            onClick={() => handleClick(option)}
          >
            {option} Profiles
          </div>
        )}
      </For>
    </div>
  );
}
