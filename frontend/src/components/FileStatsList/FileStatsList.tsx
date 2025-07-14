import { createSignal, For } from 'solid-js';
import './FileStatsList.css';

type FileStat = {
  name: string;
  total: number;
  crawled: number;
  errors: number;
};

type FileStatsListProps = {
  files: FileStat[];
  onSelect?: (file: FileStat) => void;
};

export function FileStatsList(props: FileStatsListProps) {
  const [selectedName, setSelectedName] = createSignal<string | null>(null);

  const handleClick = (file: FileStat) => {
    setSelectedName(file.name);
    props.onSelect?.(file);
  };

  return (
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      <For each={props.files}>
        {(file) => (
          <div
            onClick={() => handleClick(file)}
            class="file-stats__item"
            classList={{ selected: selectedName() === file.name }}
          >
            <div class="file-stats__item-title">
              <div class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M161.66,166.34a8,8,0,1,1-11.32,0A8,8,0,0,1,161.66,166.34Zm-75.32-8a8,8,0,1,0,11.32,0A8,8,0,0,0,86.34,158.34Zm3.32-56a8,8,0,1,0,0,11.32A8,8,0,0,0,89.66,102.34Zm36.68,16a8,8,0,1,0,11.32,0A8,8,0,0,0,126.34,118.34ZM228,128A100,100,0,1,1,128,28a4,4,0,0,1,4,4,44.05,44.05,0,0,0,44,44,4,4,0,0,1,4,4,44.05,44.05,0,0,0,44,44A4,4,0,0,1,228,128Zm-8.08,3.84a52.08,52.08,0,0,1-47.78-48,52.08,52.08,0,0,1-48-47.78,92,92,0,1,0,95.76,95.76Z"></path>
                </svg>
              </div>
              <span class="filename">{file.name}</span>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}