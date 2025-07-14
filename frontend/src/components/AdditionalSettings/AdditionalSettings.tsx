import { createSignal, For } from 'solid-js';
import './AdditionalSettings.css';

type AdditionalSettingsProps = {
  options: string[];
  onChange?: (selected: string[]) => void;
};

export function AdditionalSettings(props: AdditionalSettingsProps) {
  const [selectedOptions, setSelectedOptions] = createSignal<string[]>([]);

  const toggleOption = (option: string) => {
    const current = selectedOptions();
    const isSelected = current.includes(option);
    const updated = isSelected
      ? current.filter((item) => item !== option)
      : [...current, option];

    setSelectedOptions(updated);
    props.onChange?.(updated);
  };

  return (
    <div class="additional-settings">
      <div class="settings-options">
        <For each={props.options}>
          {(option) => (
            <label class="checkbox-wrapper">
              <input
                type="checkbox"
                checked={selectedOptions().includes(option)}
                onChange={() => toggleOption(option)}
              />
              <span class="custom-checkbox" />
              <span class="label-text">{option}</span>
            </label>
          )}
        </For>
      </div>
    </div>
  );
}
