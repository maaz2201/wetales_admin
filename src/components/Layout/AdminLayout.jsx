import React from 'react';
import {
  Box, AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Avatar, Tooltip
} from '@mui/material';
import {
  Dashboard, Article, ExitToApp, Menu as MenuIcon, AddCircleOutline
} from '@mui/icons-material';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.png'; // Make sure path is correct

const drawerWidth = 260; // Slightly wider for better spacing

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // A placeholder for user data, you would fetch this after login
  const user = { name: 'Admin', avatar: '/path/to/avatar.jpg' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'All Blogs', icon: <Article />, path: '/admin/blogs' },
    { text: 'Create Post', icon: <AddCircleOutline />, path: '/admin/blogs/create' },
  ];

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <img src={logo} alt="Wetales Logo" style={{ height: '40px' }} />
      </Toolbar>
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        <List sx={{ p: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                component={Link}
                to={item.path}
                key={item.text}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  color: isActive ? 'white' : '#4a148c',
                  background: isActive ? 'linear-gradient(90deg, #ec407a, #ab47bc)' : 'transparent',
                  boxShadow: isActive ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
                  '&:hover': {
                    background: isActive ? '' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? '600' : '500', fontFamily: "'Montserrat', sans-serif" }} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ color: '#ec407a' }}><ExitToApp /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontFamily: "'Montserrat', sans-serif" }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'rgba(255, 255, 255, 0.8)', // Glassmorphism
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          color: '#333'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>
            Blog Management
          </Typography>
          <Tooltip title={user.name}>
            <Avatar sx={{ bgcolor: '#ab47bc' }}>{user.name.charAt(0)}</Avatar>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(0,0,0,0.08)' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // Standard AppBar height
        }}
      >
        <motion.div
          key={location.pathname} // Animate on route change
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <Outlet />
        </motion.div>
      </Box>
    </Box>
  );
}

export default AdminLayout;
