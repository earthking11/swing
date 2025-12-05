import React from 'react';
import GameScene from './components/GameScene';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen bg-gray-900 text-white overflow-hidden select-none">
      <GameScene />
    </div>
  );
};

export default App;