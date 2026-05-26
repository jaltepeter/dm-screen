import './index.css';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import DmScreen from './pages/dm-screen';
import PlayerView from './pages/player-view';

function App() {
  return (
    <Router basename='/dm-screen'>
      <Routes>
        <Route path='/' element={<DmScreen />} />
        <Route path='/players' element={<PlayerView />} />
      </Routes>
    </Router>
  );
}

export default App;
