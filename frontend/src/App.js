import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// Components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ItemsList from './pages/ItemsList';
import ItemDetails from './pages/ItemDetails';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Theme settings
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Load theme preference from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  // Save theme preference to local storage
  const handleThemeChange = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Authenticator>
        {({ signOut, user }) => (
          <Layout signOut={signOut} user={user} darkMode={darkMode} handleThemeChange={handleThemeChange}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/items" element={<ItemsList />} />
              <Route path="/items/:id" element={<ItemDetails />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        )}
      </Authenticator>
    </ThemeProvider>
  );
}

export default App;