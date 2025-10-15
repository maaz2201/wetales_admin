import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Icon,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Article, CheckCircleOutline, EditOutlined, Add, Edit } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// const BASE_URL = 'http://localhost:5000/api';

const BASE_URL = process.env.REACT_APP_API_URL;

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

const StatCard = ({ icon, title, value, color }) => (
  <Paper
    elevation={4}
    component={motion.div}
    variants={itemVariants}
    sx={{
      p: 3,
      borderRadius: 3,
      display: 'flex',
      alignItems: 'center',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 28px rgba(0,0,0,0.1)'
      }
    }}
  >
    <Icon component={icon} sx={{ fontSize: 40, color, mr: 2 }} />
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#333' }}>
        {value}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontFamily: "'Montserrat', sans-serif" }}>
        {title}
      </Typography>
    </Box>
  </Paper>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('Admin');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
      setUserName(user.name);
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${BASE_URL}/blogs?limit=1000`, { // Fetch all for stats
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const blogs = data.blogs || [];
        const publishedCount = blogs.filter(b => b.status === 'published').length;
        
        setStats({
          total: blogs.length,
          published: publishedCount,
          drafts: blogs.length - publishedCount,
        });

        // Get the 5 most recent posts
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
  const COLORS = ['#1e88e5', '#f57c00'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <Typography variant="h4" gutterBottom sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#4a148c' }}>
          Welcome back, {userName}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontFamily: "'Montserrat', sans-serif" }}>
          Here's a quick overview of your blog's performance.
        </Typography>
      </motion.div>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} sm={4}><StatCard icon={Article} title="Total Posts" value={stats.total} color="#4a148c" /></Grid>
        <Grid item xs={12} sm={4}><StatCard icon={CheckCircleOutline} title="Published" value={stats.published} color="#1e88e5" /></Grid>
        <Grid item xs={12} sm={4}><StatCard icon={EditOutlined} title="Drafts" value={stats.drafts} color="#f57c00" /></Grid>
      </Grid>
      
      <Grid container spacing={4} sx={{ mt: 1 }}>
        <Grid item xs={12} md={7} component={motion.div} variants={itemVariants}>
           <Paper elevation={4} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h5" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#4a148c', mb: 2 }}>
                Recent Posts
              </Typography>
              <List disablePadding>
                {recentPosts.length > 0 ? recentPosts.map((post, index) => (
                  <React.Fragment key={post._id}>
                    <ListItem disableGutters secondaryAction={
                      <Tooltip title="Edit Post">
                        <IconButton component={Link} to={`/admin/blogs/edit/${post._id}`} size="small"><Edit /></IconButton>
                      </Tooltip>
                    }>
                      <ListItemText 
                        primary={post.title} 
                        secondary={`Created on: ${new Date(post.createdAt).toLocaleDateString()}`}
                        primaryTypographyProps={{ noWrap: true, textOverflow: 'ellipsis' }}
                      />
                    </ListItem>
                    {index < recentPosts.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                )) : (
                  <Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>No recent posts found.</Typography>
                )}
              </List>
            </Paper>
        </Grid>
        <Grid item xs={12} md={5} component={motion.div} variants={itemVariants}>
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h5" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#4a148c', mb: 2 }}>
                Post Status
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
               <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[0], mr: 1 }} />
                      <Typography variant="body2">Published</Typography>
                  </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[1], mr: 1 }} />
                      <Typography variant="body2">Drafts</Typography>
                  </Box>
              </Box>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

