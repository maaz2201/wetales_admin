import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components we'll create
import Login from './components/Auth/Login';
import AdminLayout from './components/Layout/AdminLayout';
import Dashboard from './components/Dashboard/Dashboard';
import BlogList from './components/Blogs/BlogList';
import BlogCreate from './components/Blogs/BlogCreate';
import BlogEdit from './components/Blogs/BlogEdit';

// Your Wetales brand theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#ec407a', // Your pink color
    },
    secondary: {
      main: '#ab47bc', // Your purple color
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: 'Montserrat, Arial, sans-serif',
    h4: {
      fontFamily: 'Playfair Display, serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Playfair Display, serif',
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <>
     <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="blogs" element={<BlogList />} />
            <Route path="blogs/create" element={<BlogCreate />} />
            <Route path="blogs/edit/:id" element={<BlogEdit />} />
          </Route>
          <Route path="/" element={<Login/>} />
        </Routes>
      </Router>
     </ThemeProvider>
    </>
  );
}

export default App;
