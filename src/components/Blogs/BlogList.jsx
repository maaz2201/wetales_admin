import React, { useState, useEffect, useMemo } from "react";
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
  Dialog,
  DialogContent,
  Stack,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  CalendarToday,
  Search,
  Clear,
  Visibility,
  Person as PersonIcon,
  Close,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { styled } from "@mui/material/styles";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SERVER_BASE_URL = import.meta.env.VITE_API_URL_SERVER;

const BlogPreviewContent = styled(Box)(({ theme }) => ({
  "& .block-heading": {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    color: "#4a148c",
    fontSize: "1.8rem",
    margin: theme.spacing(3, 0, 1.5),
  },
  "& .block-paragraph": {
    fontFamily: "'Montserrat', sans-serif",
    lineHeight: 1.8,
    fontSize: "1rem",
    color: "#333",
    marginBottom: theme.spacing(2),
  },
  "& .block-quote": {
    fontStyle: "italic",
    color: "#666",
    fontSize: "1.1rem",
    borderLeft: `4px solid ${theme.palette.secondary.main}`,
    paddingLeft: theme.spacing(2),
    margin: theme.spacing(3, 0),
  },
  "& .block-image": {
    minWidth: "100%",
    maxWidth: "100%",
    height: "auto",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  "& .block-video": {
    width: "100%",
    borderRadius: theme.shape.borderRadius,
    aspectRatio: "16/9",
  },
}));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

export default function BlogList() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [previewBlog, setPreviewBlog] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  async function fetchBlogs() {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API_BASE_URL}/blogs?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllBlogs(data.blogs || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError(err.response?.data?.message || "Failed to fetch blogs.");
    } finally {
      setLoading(false);
    }
  }

  const filteredBlogs = useMemo(() => {
    const trimmedSearch = debouncedSearchTerm.trim().toLowerCase();
    return allBlogs
      .filter((blog) => blog.title.toLowerCase().includes(trimmedSearch))
      .filter((blog) =>
        statusFilter === "all" ? true : blog.status === statusFilter
      );
  }, [allBlogs, debouncedSearchTerm, statusFilter]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage) || 1;
  const blogsOnPage = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBlogs.slice(startIndex, endIndex);
  }, [filteredBlogs, page, itemsPerPage]);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this blog post?"))
      return;
    setError("");
    try {
      await axios.delete(`${API_BASE_URL}/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBlogs();
    } catch (err) {
      console.error("Error deleting blog:", err);
      setError(err.response?.data?.message || "Failed to delete blog.");
    }
  }

  const getEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      videoId = url.split("/").pop().split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com/")) {
      videoId = url.split("/").pop().split("?")[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return null;
  };

  const renderContentBlocks = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return null;
    return blocks.map((block, index) => {
      switch (block.type) {
        case "heading":
          return (
            <Typography key={index} className="block-heading">
              {block.value}
            </Typography>
          );
        case "paragraph":
          return (
            <Box
              key={index}
              className="block-paragraph"
              sx={{ my: 1.5 }}
              dangerouslySetInnerHTML={{ __html: block.value }}
            />
          );
        case "quote":
          return (
            <Typography
              key={index}
              component="blockquote"
              className="block-quote"
            >
              "{block.value}"
            </Typography>
          );
        case "image":
          return (
            <Box key={index} my={3} textAlign="center">
              <img
                src={`${SERVER_BASE_URL}${block.value.src}`}
                alt={block.value.caption || "Blog image"}
                className="block-image"
              />
              {block.value.caption && (
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: 1, fontStyle: "italic", color: "text.secondary" }}
                >
                  {block.value.caption}
                </Typography>
              )}
            </Box>
          );
        case "video":
          if (block.value.type === "upload") {
            return (
              <Box key={index} my={3}>
                <video
                  src={`${SERVER_BASE_URL}${block.value.src}`}
                  controls
                  autoPlay
                  muted
                  loop
                  className="block-video"
                />
              </Box>
            );
          } else {
            const embedUrl = getEmbedUrl(block.value.src);
            if (!embedUrl) return null;
            return (
              <Box
                key={index}
                sx={{
                  position: "relative",
                  paddingTop: "56.25%",
                  my: 3,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <iframe
                  src={embedUrl}
                  title="Embedded Video"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  frameBorder="0"
                  allowFullScreen
                />
              </Box>
            );
          }
        default:
          return null;
      }
    });
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          background: "rgba(255,255,255,0.95)",
          minHeight: "80vh",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: "#4a148c",
            }}
          >
            Manage Blogs
          </Typography>
          <Button
            component={Link}
            to="/admin/blogs/create"
            variant="contained"
            startIcon={<Add />}
            sx={{
              borderRadius: "50px",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: "bold",
              background: "linear-gradient(45deg, #ec407a, #ab47bc)",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            New Post
          </Button>
        </Box>

        {/* Filters */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 2,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Search by Title"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: "200px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchTerm("")} edge="end">
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            <AnimatePresence mode="wait">
              {blogsOnPage.length > 0 ? (
                <Grid
                  container
                  spacing={4}
                  component={motion.div}
                  key={`page-${page}-${debouncedSearchTerm}-${statusFilter}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: "24px",
                    alignItems: "stretch",
                  }}
                >
                  {blogsOnPage.map((blog) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={blog._id}
                      component={motion.div}
                      variants={itemVariants}
                      layout
                    >
                      <Card
                        sx={{
                          height: "100%",
                          width: "280px",
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: 3,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-8px)",
                            boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={
                            blog.featuredImage
                              ? `${SERVER_BASE_URL}${blog.featuredImage}`
                              : "https://placehold.co/600x400/faf6fd/ab47bc?text=No+Image"
                          }
                          alt={blog.title}
                          sx={{ objectFit: "cover" }}
                        />
                        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1.5,
                            }}
                          >
                            <Chip
                              label={blog.status || "draft"}
                              size="small"
                              sx={{
                                textTransform: "capitalize",
                                fontWeight: 600,
                                color:
                                  blog.status === "published"
                                    ? "#1e88e5"
                                    : blog.status === "archived"
                                    ? "#757575"
                                    : "#f57c00",
                                backgroundColor:
                                  blog.status === "published"
                                    ? "rgba(30, 136, 229, 0.1)"
                                    : blog.status === "archived"
                                    ? "rgba(117, 117, 117, 0.1)"
                                    : "rgba(245, 124, 0, 0.1)",
                              }}
                            />
                            {blog.category && (
                              <Chip
                                label={blog.category}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
                              />
                            )}
                          </Box>

                          <Tooltip title={blog.title} arrow>
                            <Typography
                              variant="h6"
                              component="h2"
                              sx={{
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 700,
                                color: "#4a148c",
                                mb: 1.5,
                                minHeight: "64px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                lineHeight: 1.4,
                              }}
                            >
                              {blog.title}
                            </Typography>
                          </Tooltip>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              color: "text.secondary",
                              gap: 1,
                              mb: 1.5,
                            }}
                          >
                            <CalendarToday sx={{ fontSize: "0.9rem" }} />
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{
                                color: "#64748b",
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {new Date(blog.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </Typography>
                          </Box>

                          {blog.tags && blog.tags.length > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {blog.tags.slice(0, 3).map((tag, idx) => (
                                <Chip
                                  key={idx}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    fontSize: "0.7rem",
                                    height: "22px",
                                    backgroundColor: "rgba(171, 71, 188, 0.08)",
                                    color: "#ab47bc",
                                  }}
                                />
                              ))}
                              {blog.tags.length > 3 && (
                                <Chip
                                  label={`+${blog.tags.length - 3}`}
                                  size="small"
                                  sx={{
                                    fontSize: "0.7rem",
                                    height: "22px",
                                    backgroundColor: "rgba(171, 71, 188, 0.08)",
                                    color: "#ab47bc",
                                  }}
                                />
                              )}
                            </Box>
                          )}
                        </CardContent>

                        <Divider />

                        <CardActions
                          sx={{
                            justifyContent: "space-between",
                            px: 2,
                            py: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <PersonIcon sx={{ fontSize: "0.9rem" }} />
                            {blog.author?.name || "Admin"}
                          </Typography>
                          <Box>
                            <Tooltip title="Quick Preview">
                              <IconButton
                                onClick={() => setPreviewBlog(blog)}
                                sx={{ color: "grey.600" }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Post">
                              <IconButton
                                component={Link}
                                to={`/admin/blogs/edit/${blog._id}`}
                                sx={{ color: "#ab47bc" }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Post">
                              <IconButton
                                onClick={() => handleDelete(blog._id)}
                                sx={{
                                  color: "grey.500",
                                  "&:hover": { color: "#f44336" },
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 10,
                      minHeight: "400px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 2,
                        color: "text.secondary",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      No blog posts found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Get started by creating your first blog post"}
                    </Typography>
                    {!searchTerm && statusFilter === "all" && (
                      <Button
                        component={Link}
                        to="/admin/blogs/create"
                        variant="contained"
                        startIcon={<Add />}
                        sx={{
                          mt: 3,
                          borderRadius: "50px",
                          background:
                            "linear-gradient(45deg, #ec407a, #ab47bc)",
                        }}
                      >
                        Create Your First Post
                      </Button>
                    )}
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {totalPages > 1 && blogsOnPage.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  pt: 5,
                  pb: 2,
                }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Preview Dialog */}
      <Dialog
        open={Boolean(previewBlog)}
        onClose={() => setPreviewBlog(null)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        {previewBlog && (
          <DialogContent dividers sx={{ p: 0 }}>
            {/* Hero Banner */}
            <Box
              sx={{
                minHeight: 250,
                width: "100%",
                background: `linear-gradient(rgba(74, 20, 140, 0.65), rgba(248, 158, 188, 0.35)), url(${
                  previewBlog.featuredImage
                    ? SERVER_BASE_URL + previewBlog.featuredImage
                    : "https://placehold.co/1600x500/faf6fd/ab47bc?text=No+Hero"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                color: "#fff",
              }}
            >
              <Box
                sx={{
                  p: { xs: 3, md: 6 },
                  zIndex: 2,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                {previewBlog.category && (
                  <Chip
                    label={previewBlog.category}
                    sx={{
                      background: "rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontWeight: 600,
                      mb: 2,
                    }}
                  />
                )}
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    textShadow: "2px 2px 6px rgba(0,0,0,0.3)",
                    mb: 2,
                  }}
                >
                  {previewBlog.title}
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ justifyContent: "center", color: "#efe4fb" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    <Typography variant="body2">
                      {previewBlog.author?.name || "Admin"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarToday fontSize="small" />
                    <Typography variant="body2">
                      {new Date(previewBlog.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </Typography>
                  </Box>
                  <Chip
                    label={previewBlog.status}
                    size="small"
                    sx={{
                      textTransform: "capitalize",
                      color: "#fff",
                      bgcolor: "rgba(30,20,60,0.27)",
                    }}
                  />
                </Stack>
              </Box>
              <IconButton
                onClick={() => setPreviewBlog(null)}
                sx={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  color: "#fff",
                }}
              >
                <Close />
              </IconButton>
            </Box>

            {previewBlog.excerpt && (
              <Typography
                variant="subtitle1"
                sx={{
                  fontStyle: "italic",
                  color: "text.secondary",
                  mb: 3,
                  pb: 2,
                  px: 3,
                  borderBottom: "1px solid #ece0f1",
                  background: "#fff",
                }}
              >
                {previewBlog.excerpt}
              </Typography>
            )}

            <Box
              sx={{
                maxWidth: 800,
                mx: "auto",
                bgcolor: "#fff",
                p: { xs: 2, md: 5 },
                borderRadius: 4,
              }}
            >
              <BlogPreviewContent>
                {renderContentBlocks(previewBlog.contentBlocks)}
              </BlogPreviewContent>
              {previewBlog.tags && previewBlog.tags.length > 0 && (
                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, fontWeight: 600 }}
                  >
                    Tags:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {previewBlog.tags.map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(171, 71, 188, 0.1)",
                          color: "#ab47bc",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            {/* SEO Section */}
            <Box
              sx={{
                bgcolor: "#f6f3fa",
                mt: 4,
                px: { xs: 2, md: 6 },
                py: 4,
                borderTop: "1px dashed #e1bee7",
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1.5,
                  fontWeight: 700,
                  color: "#6a1b9a",
                }}
              >
                SEO Details
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    <b>SEO Title:</b>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {previewBlog.seoTitle || previewBlog.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    <b>Description:</b>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {previewBlog.seoDescription || previewBlog.excerpt}
                  </Typography>
                  {previewBlog.seoKeywords &&
                    previewBlog.seoKeywords.length > 0 && (
                      <>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          <b>Keywords:</b>
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            mb: 1,
                          }}
                        >
                          {previewBlog.seoKeywords.map((kw, i) => (
                            <Chip
                              key={i}
                              label={kw}
                              size="small"
                              sx={{ bgcolor: "#ede7f6", color: "#6a1b9a" }}
                            />
                          ))}
                        </Box>
                      </>
                    )}
                </Box>
                <Box
                  sx={{
                    borderLeft: { sm: "1.5px dashed #b39ddb" },
                    pl: { sm: 4 },
                    mt: { xs: 3, sm: 0 },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, mb: 0.5 }}
                  >
                    SERP Preview
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      mt: 1,
                      p: 2,
                      bgcolor: "#fff",
                      minWidth: 320,
                      maxWidth: 400,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#1a0dab",
                        fontSize: "18px",
                        fontWeight: 700,
                        textDecoration: "underline",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        mb: "-2px",
                      }}
                    >
                      {previewBlog.seoTitle ||
                        previewBlog.title ||
                        "Blog Title"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#006621", fontSize: "14px", mb: "2px" }}
                    >
                      https://www.example.com/blog/
                      {previewBlog.slug || "[your-slug]"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#545454",
                        fontSize: "15px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: "2",
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.6,
                      }}
                    >
                      {previewBlog.seoDescription ||
                        previewBlog.excerpt ||
                        "SEO description will appear here, giving a brief summary of your article."}
                    </Typography>
                    {previewBlog.seoKeywords &&
                      previewBlog.seoKeywords.length > 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            pt: 1,
                            color: "#6a1b9a",
                            fontWeight: 500,
                          }}
                        >
                          Keywords: {previewBlog.seoKeywords.join(", ")}
                        </Typography>
                      )}
                  </Paper>
                </Box>
              </Stack>
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
}
