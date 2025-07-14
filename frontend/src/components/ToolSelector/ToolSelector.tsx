import { For } from 'solid-js';
import "./ToolSelector.css";

type Tool = {
  id: string;
  name: string;
  icon?: any
};

type ToolSelectorProps = {
  tools: Tool[];
  selectedTool: () => string;
  setSelectedTool: (id: string) => void;
};

export default function ToolSelector({ tools, selectedTool, setSelectedTool }: ToolSelectorProps) {
  return (
    <section class="tool-options">
      <For each={tools}>
        {(tool) => (
          <div
            onClick={() => setSelectedTool(tool.id)}
            class={`tool-pill ${selectedTool() === tool.id ? 'active' : ''}`}
          >
            <div class="icon">{tool.icon}</div>
            <span>{tool.name}</span>
          </div>
        )}
      </For>
    </section>
  );
}
