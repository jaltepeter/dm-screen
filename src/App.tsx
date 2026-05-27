import './index.css';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import DmScreen from './pages/dm-screen';
import PlayerView from './pages/player-view';
import PrepScreen from './pages/prep-screen';

function App() {
  return (
    <Router basename='/'>
      <Routes>
        <Route path='/' element={<DmScreen />} />
        <Route path='/players/:slug' element={<PlayerView />} />
        <Route path='/prep' element={<PrepScreen />} />
      </Routes>
      <Toaster theme='dark' position='bottom-right' />
    </Router>
  );
}

export default App;
