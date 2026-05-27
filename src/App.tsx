import './index.css';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import DmScreen from './pages/dm-screen';
import PlayerView from './pages/player-view';
import PrepScreen from './pages/prep-screen';

function App() {
  return (
    <Router basename='/'>
      <Routes>
        <Route path='/' element={<DmScreen />} />
        <Route path='/players' element={<PlayerView />} />
        <Route path='/prep' element={<PrepScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
