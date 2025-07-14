import './App.css';
import Content from './container/Content';
import Header from './container/Header/Header';
import DividerWave from './components/Divider/DividerWave';
import Tools from './container/Tools/Tools';

import { createSignal } from 'solid-js';

function App() {
  const [selectedTool, setSelectedTool] = createSignal('crawler');

  return (
    <>
      <section class="section page-width">
        <Header />
        <Tools selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
        <DividerWave class="marginT" />
        <Content selectedTool={selectedTool} />
      </section>
    </>
  )
}

export default App
