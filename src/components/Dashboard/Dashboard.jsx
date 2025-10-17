import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  Article, 
  CheckCircleOutline, 
  EditOutlined, 
  Add, 
  Edit, 
  TrendingUp 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';

const BASE_URL = import.meta.env.VITE_API_URL;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const StatCard = ({ icon: IconComponent, title, value, color, trend }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={3}
      component={motion.div}
      variants={itemVariants}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: { xs: 2, sm: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: `1px solid ${color}20`,
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: { xs: 'auto', sm: 120 },
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 12px 28px ${color}40`
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: { xs: '60px', sm: '100px' },
          height: { xs: '60px', sm: '100px' },
          background: `${color}10`,
          borderRadius: '0 0 0 100%',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1, minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            width: { xs: 45, sm: 56, md: 64 },
            height: { xs: 45, sm: 56, md: 64 },
            borderRadius: 2,
            background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: { xs: 1.5, sm: 2 },
            flexShrink: 0
          }}
        >
          <IconComponent sx={{ fontSize: { xs: 24, sm: 32, md: 36 }, color }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography 
            variant="h4"
            sx={{ 
              fontWeight: 700, 
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}
          >
            {value}
          </Typography>
          <Typography 
            variant="body2"
            color="text.secondary" 
            sx={{ 
              fontFamily: "'Poppins', sans-serif",
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
      {trend && (
        <Box 
          sx={{ 
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 0.5,
            color: color,
            zIndex: 1,
            flexShrink: 0
          }}
        >
          <TrendingUp fontSize="small" />
          <Typography variant="caption" fontWeight={600}>{trend}</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('Admin');
  const token = localStorage.getItem('token');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
      setUserName(user.name);
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${BASE_URL}/blogs?limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const blogs = data.blogs || [];
        const publishedCount = blogs.filter(b => b.status === 'published').length;
        
        setStats({
          total: blogs.length,
          published: publishedCount,
          drafts: blogs.length - publishedCount,
        });

        const sortedPosts = [...blogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentPosts(sortedPosts.slice(0, 5));

      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const chartData = [
    { name: 'Published', value: stats.published },
    { name: 'Drafts', value: stats.drafts },
  ];
  const COLORS = ['#667eea', '#f59e0b'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box 
      component={motion.div} 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      sx={{ 
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        pb: { xs: 2, md: 0 },
        paddingLeft: { xs: 2, md: 3, lg: 4 },
          paddingRight: { xs: 2, md: 3, lg: 4 },
        overflow: 'hidden'
      }}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
          sx={{ 
            mb: { xs: 2, sm: 3, md: 4 },
            width: '100%'
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontFamily: "'Poppins', sans-serif", 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                wordBreak: 'break-word'
              }}
            >
              Welcome back, {userName}!
            </Typography>
            <Typography 
              variant={isMobile ? "body2" : "body1"} 
              color="text.secondary" 
              sx={{ 
                fontFamily: "'Poppins', sans-serif",
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Here's a quick overview of your blog's performance.
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/admin/blogs/create"
            variant="contained"
            startIcon={<Add />}
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              py: { xs: 1.2, sm: 1.3 },
              px: { xs: 2, sm: 3 },
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              whiteSpace: 'nowrap',
              minWidth: { sm: 'auto' },
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Create New Post
          </Button>
        </Stack>
      </motion.div>

      {error && (
        <Alert severity="error" sx={{ mb: { xs: 2, md: 3 }, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid 
        container 
        spacing={{ xs: 2, sm: 2.5, md: 3 }} 
        sx={{ 
          mb: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          m: 0
        }}
      >
        <Grid item xs={12} sm={4} sx={{ pl: '0 !important' }}>
          <StatCard 
            icon={Article} 
            title="Total Posts" 
            value={stats.total} 
            color="#667eea"
            width="100%"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            icon={CheckCircleOutline} 
            title="Published" 
            value={stats.published} 
            color="#10b981"
            
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            icon={EditOutlined} 
            title="Drafts" 
            value={stats.drafts} 
            color="#f59e0b"
           
          />
        </Grid>
      </Grid>
      
      {/* Recent Posts and Chart */}
      <Grid 
        container 
        spacing={{ xs: 2, sm: 2.5, md: 3 }}
        sx={{ 
          width: '100%',
          m: 0
        }}
      >
        {/* Recent Posts */}
        <Grid item xs={12} md={7} sx={{ pl: '0 !important' }}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 2, sm: 2.5, md: 3 }, 
                borderRadius: { xs: 2, sm: 3 }, 
                height: '100%',
                minHeight: { xs: 'auto', md: 400 },
                border: '1px solid rgba(0,0,0,0.05)',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center" 
                sx={{ mb: 2 }}
              >
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  sx={{ 
                    fontFamily: "'Poppins', sans-serif", 
                    fontWeight: 700, 
                    color: '#1e293b',
                    fontSize: { xs: '1.1rem', sm: '1.5rem' }
                  }}
                >
                  Recent Posts
                </Typography>
                <Button 
                  component={Link} 
                  to="/admin/blogs" 
                  size="small"
                  sx={{ 
                    textTransform: 'none',
                    fontFamily: "'Poppins', sans-serif",
                    color: '#667eea',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minWidth: 'auto',
                    p: { xs: 0.5, sm: 1 }
                  }}
                >
                  View All
                </Button>
              </Stack>
              
              <List 
                disablePadding 
                sx={{ 
                  maxHeight: { xs: 'auto', md: 320 }, 
                  overflowY: { xs: 'visible', md: 'auto' },
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#667eea40',
                    borderRadius: '3px',
                  }
                }}
              >
                {recentPosts.length > 0 ? recentPosts.map((post, index) => (
                  <React.Fragment key={post._id}>
                    <ListItem 
                      disableGutters 
                      sx={{ 
                        py: { xs: 1.5, sm: 1.8 },
                        px: 0,
                        alignItems: 'flex-start'
                      }}
                      secondaryAction={
                        <Tooltip title="Edit Post">
                          <IconButton 
                            component={Link} 
                            to={`/admin/blogs/edit/${post._id}`} 
                            size="small"
                            sx={{
                              color: '#667eea',
                              mt: { xs: 0.5, sm: 0 },
                              '&:hover': {
                                background: '#667eea20'
                              }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemText 
                        primary={post.title} 
                        secondary={`Created: ${new Date(post.createdAt).toLocaleDateString()}`}
                        primaryTypographyProps={{ 
                          noWrap: true, 
                          textOverflow: 'ellipsis',
                          fontWeight: 600,
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          pr: { xs: 5, sm: 6 }
                        }}
                        secondaryTypographyProps={{
                          fontSize: { xs: '0.7rem', sm: '0.8rem' }
                        }}
                        sx={{ m: 0 }}
                      />
                    </ListItem>
                    {index < recentPosts.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                )) : (
                  <Box sx={{ 
                    py: { xs: 4, sm: 6 }, 
                    textAlign: 'center',
                    px: 2
                  }}>
                    <Article sx={{ fontSize: { xs: 48, sm: 60 }, color: '#e5e7eb', mb: 2 }} />
                    <Typography 
                      color="text.secondary"
                      sx={{ 
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        mb: 2
                      }}
                    >
                      No recent posts found.
                    </Typography>
                    <Button
                      component={Link}
                      to="/admin/blogs/create"
                      variant="outlined"
                      startIcon={<Add />}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ 
                        textTransform: 'none',
                        fontFamily: "'Poppins', sans-serif",
                        borderColor: '#667eea',
                        color: '#667eea',
                        '&:hover': {
                          borderColor: '#5568d3',
                          background: '#667eea10'
                        }
                      }}
                    >
                      Create First Post
                    </Button>
                  </Box>
                )}
              </List>
            </Paper>
          </motion.div>
        </Grid>

        {/* Chart */}
        <Grid item xs={12} md={5}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 2, sm: 2.5, md: 3 }, 
                borderRadius: { xs: 2, sm: 3 }, 
                height: '100%',
                minHeight: { xs: 300, md: 400 },
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 700, 
                  color: '#1e293b',
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.5rem' }
                }}
              >
                Post Status
              </Typography>
              
              <Box sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '100%',
                minHeight: { xs: 180, sm: 220 }
              }}>
                {stats.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={chartData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={isMobile ? 65 : 90}
                        innerRadius={isMobile ? 40 : 55}
                        fill="#8884d8" 
                        label={!isMobile}
                        paddingAngle={5}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          borderRadius: 8, 
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          fontFamily: "'Poppins', sans-serif"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography 
                    color="text.secondary" 
                    sx={{ 
                      textAlign: 'center',
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    No data available
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 2, 
                gap: { xs: 2, sm: 3 }, 
                flexWrap: 'wrap',
                pt: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: { xs: 10, sm: 12 }, 
                    height: { xs: 10, sm: 12 }, 
                    borderRadius: '50%', 
                    bgcolor: COLORS[0], 
                    mr: 1,
                    flexShrink: 0
                  }} />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: "'Poppins', sans-serif", 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Published ({stats.published})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: { xs: 10, sm: 12 }, 
                    height: { xs: 10, sm: 12 }, 
                    borderRadius: '50%', 
                    bgcolor: COLORS[1], 
                    mr: 1,
                    flexShrink: 0
                  }} />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: "'Poppins', sans-serif", 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Drafts ({stats.drafts})
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
