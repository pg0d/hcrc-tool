import { createSignal } from 'solid-js';
import './FileUpload.css';

export default function FileUpload(props: { onFileSelect?: (file: File) => void }) {
  const [dragging, setDragging] = createSignal(false);
  const [filename, setFilename] = createSignal<string | null>(null);
  let fileInputRef!: HTMLInputElement;

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer?.files?.length) {
      const file = e.dataTransfer.files[0];
      setFilename(file.name);
      props.onFileSelect?.(file);
    }
  };

  const handleFileChange = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      setFilename(file.name);
      props.onFileSelect?.(file);
    }
  };

  return (
    <div
      class="file-upload"
      classList={{ dragging: dragging() }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragging(false);
      }}
      onDrop={handleDrop}
      onClick={() => fileInputRef.click()}
      style={{ cursor: 'pointer', color: '#007bff' }}
    >
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" viewBox="0 0 256 256"><path d="M44,180c0,13.23,9,24,20,24a18.15,18.15,0,0,0,13.11-5.9,4,4,0,1,1,5.78,5.54A26.11,26.11,0,0,1,64,212c-15.44,0-28-14.36-28-32s12.56-32,28-32a26.11,26.11,0,0,1,18.89,8.36,4,4,0,1,1-5.78,5.54A18.15,18.15,0,0,0,64,156C53,156,44,166.77,44,180Zm82.49-4.85c-10.53-3-15.08-4.91-14.42-10.08a8.51,8.51,0,0,1,3.75-6.49c6.25-4.23,18.77-2.24,23.06-1.11a4,4,0,0,0,2-7.74,61.11,61.11,0,0,0-10.47-1.61c-8.12-.54-14.54.75-19.1,3.82a16.66,16.66,0,0,0-7.22,12.13c-1.58,12.49,10.46,16,20.14,18.77,11.26,3.25,16.47,5.49,15.64,11.94a8.94,8.94,0,0,1-3.91,6.75c-6.27,4.17-18.61,2.05-22.83.88a4,4,0,1,0-2.15,7.7A57.89,57.89,0,0,0,125.19,212c5.18,0,10.83-.86,15.22-3.77a17,17,0,0,0,7.43-12.41C149.64,181.84,136.26,178,126.49,175.15Zm82.85-26.92a4,4,0,0,0-5.11,2.42L188,196.11l-16.23-45.46a4,4,0,1,0-7.54,2.7l20,56a4,4,0,0,0,7.54,0l20-56A4,4,0,0,0,209.34,148.23ZM212,88v24a4,4,0,0,1-8,0V92H152a4,4,0,0,1-4-4V36H56a4,4,0,0,0-4,4v72a4,4,0,0,1-8,0V40A12,12,0,0,1,56,28h96a4,4,0,0,1,2.83,1.17l56,56A4,4,0,0,1,212,88Zm-13.66-4L156,41.65V84Z"></path></svg>
      </div>
      <h4>Drag excel/spreadsheet here to scan</h4>
      <p>
        Alternatively, you can select a file by{' '}
        <a>clicking here</a>
      </p>

      <input
        ref={fileInputRef!}
        type="file"
        accept=".csv,.xlsx"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {filename() && <p>📄 Selected: {filename()}</p>}
    </div>
  );
}
