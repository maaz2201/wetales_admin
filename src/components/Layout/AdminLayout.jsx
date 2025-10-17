import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import {
  Dashboard,
  Article,
  ExitToApp,
  Menu as MenuIcon,
  AddCircleOutline,
} from "@mui/icons-material";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo.png";

const drawerWidth = 280;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const user = useMemo(() => {
    const userData = localStorage.getItem("user");
    try {
      return userData ? JSON.parse(userData) : { name: "Admin" };
    } catch (error) {
      console.error("Failed to parse user data", error);
      return { name: "Admin" };
    }
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogout = () => setOpenLogoutDialog(true);
  const handleConfirmLogout = () => {
    localStorage.clear();
    setOpenLogoutDialog(false);
    navigate("/login");
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      path: "/admin",
      color: "#e2e2e8ff",
    },
    {
      text: "All Blogs",
      icon: <Article />,
      path: "/admin/blogs",
      color: "#e6e2efff",
    },
    {
      text: "Create Post",
      icon: <AddCircleOutline />,
      path: "/admin/blogs/create",
      color: "#efdfe7ff",
    },
  ];

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <motion.img
          src={logo}
          alt="Wetales Logo"
      backgroundColor="transparent"
          style={{ height: "70px", minWidth: "70%" , backgroundColor:"white" , borderRadius:"10px" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      </Box>

      {/* User Profile Card */}
      <Box
        sx={{
          p: 2.5,
          mx: 2,
          mt: 2,
          borderRadius: 3,
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 52,
              height: 52,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "3px solid rgba(255, 255, 255, 0.3)",
              fontSize: "1.3rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user.name?.charAt(0).toUpperCase() || "A"}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "0.95rem",
                mb: 0.5,
              }}
            >
              {user.name}
            </Typography>
            <Chip
              label="Administrator"
              size="small"
              sx={{
                background: "rgba(255, 255, 255, 0.25)",
                color: "white",
                fontSize: "0.7rem",
                height: "20px",
                fontWeight: 600,
              }}
            />
          </Box>
        </Stack>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ overflowY: "auto", flexGrow: 1, px: 2, mt: 2 }}>
        <List sx={{ p: 0 }}>
          <AnimatePresence>
            {menuItems.map((item, index) => {
              const isActive =
                item.path === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.path);
              
              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isActive}
                    onClick={() => setMobileOpen(false)} // Close drawer on mobile after click
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      py: 1.5,
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: "100%",
                        width: "4px",
                        background: item.color,
                        transform: isActive ? "scaleY(1)" : "scaleY(0)",
                        transition: "transform 0.3s ease",
                      },
                      "&.Mui-selected": {
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                        "&:hover": { background: "rgba(255, 255, 255, 0.25)" },
                      },
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.1)",
                        transform: "translateX(5px)",
                        color: "white",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: "white",
                        minWidth: "42px",
                        "& svg": { fontSize: "1.4rem" },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 700 : 500,
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "0.95rem",
                      }}
                    />
                  </ListItemButton>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </List>
      </Box>

      {/* Logout Button */}
      <Box sx={{ p: 2, mt: "auto" }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.5,
            background: "rgba(244, 67, 54, 0.2)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(244, 67, 54, 0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "rgba(244, 67, 54, 0.35)",
              transform: "scale(1.02)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box 
      sx={{ 
        display: "flex", 
        minHeight: "100vh", 
        background: "#f8fafc",
        width: "100%",
        overflow: "hidden"
      }}
    >
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.05)",
          zIndex: (theme) => theme.zIndex.drawer,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { xs: "block", md: "none" },
              color: "#333",
              "&:hover": {
                background: "rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              display: { xs: "none", sm: "block" },
            }}
          >
            Admin Dashboard
          </Typography>

          <Box sx={{ flexGrow: { xs: 1, sm: 0 } }} />

          <Tooltip title={user.name}>
            <Avatar
              sx={{
                bgcolor: "secondary.main",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                cursor: "pointer",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              {user.name?.charAt(0).toUpperCase() || "A"}
            </Avatar>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{
          width: { xs: 0, md: drawerWidth },
          flexShrink: 0,
        }}
      >
        {/* Temporary Drawer for Mobile/Tablet */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "none",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Permanent Drawer for Desktop */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "none",
              boxShadow: "4px 0 24px rgba(0, 0, 0, 0.08)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          minWidth: 0,
          p: { xs: 2, sm: 3, md: 4 },
          mt: "64px",
          minHeight: "calc(100vh - 64px)",
          boxSizing: "border-box",
          overflow: "auto",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: { xs: "85%", sm: "400px" },
            maxWidth: { xs: "90%", sm: "500px" },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: { xs: "1.1rem", sm: "1.3rem" },
          }}
        >
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: "'Poppins', sans-serif" }}>
            Are you sure you want to log out? You will need to login again to
            access the admin panel.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenLogoutDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLogout}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontFamily: "'Poppins', sans-serif",
              background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminLayout;
