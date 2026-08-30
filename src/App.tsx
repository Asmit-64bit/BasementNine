import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { LevelSelect } from './pages/LevelSelect';
import './App.css';

// A simple placeholder for the Main Terminal
const MainTerminal = () => (
  <div className="min-h-screen bg-bg-base text-text-main flex flex-col items-center justify-center font-mono gap-8">
    <h1 className="text-4xl text-cyan chromatic-shadow">MAIN TERMINAL</h1>
    <Link 
      to="/levels" 
      className="border border-green px-6 py-2 text-green hover:bg-green/10 transition-colors tracking-widest uppercase"
    >
      Initialize Descent
    </Link>
  </div>
);

// Placeholder for the story/level view
const StoryView = () => (
  <div className="min-h-screen bg-bg-base text-text-main flex flex-col items-center justify-center font-mono gap-8">
    <h1 className="text-2xl text-red">ROOM LOADED</h1>
    <Link to="/levels" className="text-muted hover:text-text-main">← RETURN TO LEVEL SELECT</Link>
  </div>
);

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainTerminal />} />
          <Route path="/levels" element={<LevelSelect />} />
          <Route path="/story/:id" element={<StoryView />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
