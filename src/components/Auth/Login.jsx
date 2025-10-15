import React, { useState, useEffect } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Container,
  Alert, CircularProgress, InputAdornment, IconButton, Fade
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, AdminPanelSettings } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_URL;

function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in and token is valid
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (token && expiry) {
      const now = new Date().getTime();
      const expiryTime = parseInt(expiry);
      
      if (now < expiryTime) {
        // Token is still valid, redirect to admin
        navigate('/admin');
      } else {
        // Token expired, clear storage
        clearSession();
      }
    }
  };

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
  };
console.log('API URL:', BASE_URL);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        // Calculate expiry time (assuming 1 hour from now)
        const expiryTime = new Date().getTime() + (60 * 60 * 1000); // 1 hour
        
        // Store token and expiry
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set up auto-logout timer
        setTimeout(() => {
          clearSession();
          navigate('/login');
          alert('Session expired. Please login again.');
        }, 60 * 60 * 1000); // 1 hour
        
        navigate('/admin');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', py: 4 }}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Paper 
          elevation={24} 
          sx={{ 
            p: 5, 
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <AdminPanelSettings 
                sx={{ 
                  fontSize: 60, 
                  color: '#667eea',
                  mb: 2,
                  filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))'
                }} 
              />
            </motion.div>
            
            <Typography 
              variant="h3" 
              align="center" 
              gutterBottom 
              sx={{ 
                color: '#333',
                fontWeight: 700,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Wetales Admin
            </Typography>
            
            <Typography 
              variant="body1" 
              align="center" 
              color="textSecondary" 
              sx={{ fontSize: '1.1rem', opacity: 0.8 }}
            >
              Welcome back! Sign in to manage your content
            </Typography>
          </Box>

          <Fade in={!!error} timeout={300}>
            <Box sx={{ mb: 2 }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiAlert-icon': { color: '#f44336' }
                  }}
                >
                  {error}
                </Alert>
              )}
            </Box>
          </Fade>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              margin="normal"
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
            
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              margin="normal"
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                  boxShadow: '0 12px 25px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
}

export default Login;
