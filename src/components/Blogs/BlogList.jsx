import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Button,
  IconButton,
  Chip,
  Pagination,
  Typography,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit, Delete, Add, CalendarToday, Search, Clear } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
const SERVER_BASE_URL = 'http://localhost:5000';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 }
};

export default function BlogList() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  // --- FIX 2: Debounce search term to improve UX ---
  useEffect(() => {
    const timerId = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
    }, 300); // Wait 300ms after user stops typing
    return () => {
        clearTimeout(timerId);
    };
  }, [searchTerm]);


  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  async function fetchBlogs() {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${API_BASE_URL}/blogs?limit=1000`, { // Fetch all blogs for filtering
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setAllBlogs(data.blogs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch blogs.');
    } finally {
      setLoading(false);
    }
  }
  
  const filteredBlogs = useMemo(() => {
    const trimmedSearch = debouncedSearchTerm.trim().toLowerCase();
    return allBlogs
      .filter(blog =>
        blog.title.toLowerCase().includes(trimmedSearch)
      )
      .filter(blog =>
        statusFilter === 'all' ? true : blog.status === statusFilter
      );
  }, [allBlogs, debouncedSearchTerm, statusFilter]);

  // --- FIX 1: Separated state updates from memoization to prevent rendering bugs ---
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage) || 1;

  const blogsOnPage = useMemo(() => {
    return filteredBlogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredBlogs, page]);


  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;
    
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/blogs/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchBlogs(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete blog.');
    }
  }

  return (
    <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#4a148c' }}>
          Manage Blogs
        </Typography>
        <Button
          component={Link}
          to="/admin/blogs/create"
          variant="contained"
          startIcon={<Add />}
          sx={{
            borderRadius: '50px', fontFamily: "'Montserrat', sans-serif", fontWeight: 'bold',
            background: 'linear-gradient(45deg, #ec407a, #ab47bc)',
            transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' }
          }}
        >
          New Post
        </Button>
      </Box>

      {/* Search and Filter Toolbar */}
      <Paper elevation={2} sx={{ p: 2, mb: 4, borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
            label="Search by Title"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: '200px' }}
            InputProps={{
                startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>),
                endAdornment: searchTerm && (
                    <InputAdornment position="end">
                        <IconButton onClick={() => setSearchTerm('')} edge="end"><Clear /></IconButton>
                    </InputAdornment>
                )
            }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
            </Select>
        </FormControl>
      </Paper>


      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
         <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <>
          {blogsOnPage.length > 0 ? (
            <Grid container spacing={4} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
              {blogsOnPage.map((blog) => (
                <Grid item xs={12} sm={6} md={4} key={blog._id} component={motion.div} variants={itemVariants}>
                    <Card sx={{ 
                        height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 28px rgba(0,0,0,0.1)' }
                    }}>
                        <CardMedia component="img" height="180" image={blog.featuredImage ? `${SERVER_BASE_URL}${blog.featuredImage}` : 'https://placehold.co/600x400/faf6fd/ab47bc?text=No+Image'} alt={blog.title} />
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Chip label={blog.status || 'draft'} size="small" sx={{ color: blog.status === 'published' ? '#1e88e5' : (blog.status === 'archived' ? '#757575' : '#f57c00'), backgroundColor: blog.status === 'published' ? 'rgba(30, 136, 229, 0.1)' : (blog.status === 'archived' ? 'rgba(117, 117, 117, 0.1)' : 'rgba(245, 124, 0, 0.1)'), fontWeight: '600' }}/>
                                <Typography variant="caption" color="text.secondary">{blog.category}</Typography>
                            </Box>
                            <Tooltip title={blog.title}>
                                <Typography variant="h6" component="h2" sx={{ 
                                    fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#4a148c',
                                    mb: 2, 
                                    minHeight: '56px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: '2',
                                    WebkitBoxOrient: 'vertical',
                                }}>
                                    {blog.title}
                                </Typography>
                            </Tooltip>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', gap: 1, mb: 1.5 }}>
                                <CalendarToday sx={{ fontSize: '1rem' }} />
                                <Typography variant="body2" sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                                    {new Date(blog.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                             <Box>
                                {blog.tags?.slice(0, 3).map(tag => <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}
                            </Box>
                        </CardContent>
                        <Divider />
                        <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                           <Typography variant="caption" sx={{ pl: 1, color: 'text.secondary' }}>By: {blog.author?.name || 'Admin'}</Typography>
                           <Box>
                                <Tooltip title="Edit Post"><IconButton component={Link} to={`/admin/blogs/edit/${blog._id}`} sx={{ color: '#ab47bc', '&:hover': { color: '#ec407a' } }}><Edit /></IconButton></Tooltip>
                                <Tooltip title="Delete Post"><IconButton onClick={() => handleDelete(blog._id)} sx={{ color: 'grey.500', '&:hover': { color: '#f44336' } }}><Delete /></IconButton></Tooltip>
                           </Box>
                        </CardActions>
                    </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ mb: 2, color: 'text.secondary', fontFamily: "'Montserrat', sans-serif", fontSize: '1.1rem' }}>
                    No blog posts match your search.
                </Typography>
            </Box>
          )}

          {totalPages > 1 && (
             <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
             </Box>
          )}
        </>
      )}
    </Paper>
  );
}

