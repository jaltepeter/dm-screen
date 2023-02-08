import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DmScreen from './pages/dm-screen.js';
import PlayerView from './pages/player-view.js';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route exact path='/' element={<DmScreen />} />
          <Route path='/players' element={<PlayerView />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
