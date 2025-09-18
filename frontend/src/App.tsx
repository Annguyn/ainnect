import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import { authTheme } from './theme/authTheme';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={authTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* All routes now include Layout with Header */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="profile" element={<Profile />} />
            <Route path="auth" element={<Auth />} />
            {/* Legacy routes for backward compatibility */}
            <Route path="login" element={<Auth />} />
            <Route path="register" element={<Auth />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
