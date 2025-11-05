import React, { useState, useEffect } from "react";
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
  Chip,
  Container,
} from "@mui/material";
import {
  Article,
  CheckCircleOutline,
  EditOutlined,
  Add,
  Edit,
  ArrowUpward,
  EventNoteOutlined,
  Description,
  Archive,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

const BASE_URL = import.meta.env.VITE_API_URL;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const StatCard = ({ icon: IconComponent, title, value, color, trend }) => {
  return (
    <Paper
      component={motion.div}
      variants={itemVariants}
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 2.5,
        background: `linear-gradient(135deg, ${color}08 0%, ${color}02 100%)`,
        border: `2px solid ${color}15`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        minHeight: { xs: 130, md: 150 },
        "&::before": {
          content: '""',
          position: "absolute",
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          background: `${color}05`,
          borderRadius: "50%",
          zIndex: 0,
        },
        "&:hover": {
          transform: "translateY(-6px)",
          border: `2px solid ${color}30`,
          boxShadow: `0 10px 30px ${color}15`,
        },
      }}
    >
      <Stack spacing={1.5} sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box
            sx={{
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              borderRadius: 1.5,
              background: `linear-gradient(135deg, ${color}25 0%, ${color}40 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {IconComponent && (
              <IconComponent
                sx={{ fontSize: { xs: 28, md: 32 }, color: color }}
              />
            )}
          </Box>

          {trend && (
            <Stack
              direction="row"
              spacing={0.3}
              alignItems="center"
              sx={{
                background: `${color}10`,
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              <ArrowUpward sx={{ fontSize: 14, color: color }} />
              <Typography
                variant="caption"
                sx={{
                  color: color,
                  fontWeight: 700,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {trend}%
              </Typography>
            </Stack>
          )}
        </Stack>

        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              mt: 0.5,
            }}
          >
            {title}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    archived: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("Admin");

  const token = localStorage.getItem("token");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.name) {
      setUserName(user.name);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get(`${BASE_URL}/blogs?limit=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const blogs = data.blogs || [];
        const publishedCount = blogs.filter(
          (b) => b.status === "published"
        ).length;
        const archivedCount = blogs.filter(
          (b) => b.status === "archived"
        ).length;
        const draftsCount = blogs.length - publishedCount - archivedCount;

        setStats({
          total: blogs.length,
          published: publishedCount,
          drafts: draftsCount,
          archived: archivedCount,
        });

        const sortedPosts = blogs
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 8);

        setRecentPosts(sortedPosts);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const chartData = [
    { name: "Published", value: stats.published, fill: "#10b981" },
    { name: "Drafts", value: stats.drafts, fill: "#f59e0b" },
    { name: "Archived", value: stats.archived, fill: "#ef4444" },
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#667eea" }} />
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return { bg: "#d1fae5", text: "#065f46" };
      case "draft":
        return { bg: "#fef3c7", text: "#92400e" };
      case "archived":
        return { bg: "#fee2e2", text: "#7f1d1d" };
      default:
        return { bg: "#e5e7eb", text: "#374151" };
    }
  };

  return (
    <Container width="100%" minWidth="100vw" sx={{ p: { xs: 2, md: 3 } }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: "100%", maxWidth: "100vw", padding: "0 16px" }}
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: { xs: 3, md: 4 }, mt: { xs: 2, md: 0 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 800,
                    color: "#0f172a",
                    mb: 0.5,
                    fontSize: { xs: "1.75rem", md: "2.25rem" },
                  }}
                >
                  Welcome back, {userName}!
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: { xs: "0.875rem", md: "1rem" },
                  }}
                >
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
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
                  py: 1.3,
                  px: 3,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 12px 30px rgba(102, 126, 234, 0.4)",
                  },
                }}
              >
                Create New Post
              </Button>
            </Stack>
          </Box>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{ mb: 3, borderRadius: 2, fontFamily: "'Inter', sans-serif" }}
          >
            {error}
          </Alert>
        )}

        {/* Stats Grid */}
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          sx={{ mb: { xs: 3, md: 4 } }}
        >
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={Article}
              title="Total Posts"
              value={stats.total}
              color="#667eea"
              // trend={stats.total > 0 ? '12' : undefined}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={CheckCircleOutline}
              title="Published"
              value={stats.published}
              color="#10b981"
              // trend={stats.published > 0 ? '8' : undefined}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={EditOutlined}
              title="Drafts"
              value={stats.drafts}
              color="#f59e0b"
              // trend={stats.drafts > 0 ? '5' : undefined}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={Archive}
              title="Archived"
              value={stats.archived}
              color="#ef4444"
              // trend={undefined}
            />
          </Grid>
        </Grid>

        {/* Main Content: Recent Posts + Chart */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Recent Posts */}
          <Grid item xs={12} md={7}>
            <motion.div variants={itemVariants} style={{ height: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2.5,
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  background: "#ffffff",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    p: { xs: 2, md: 3 },
                    background:
                      "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 700,
                          color: "#0f172a",
                          mb: 0.3,
                        }}
                      >
                        Recent Posts
                      </Typography>
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{
                          color: "#64748b",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {recentPosts.length} of {stats.total} posts
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      to="/admin/blogs"
                      size="small"
                      sx={{
                        textTransform: "none",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        color: "#667eea",
                        fontSize: "0.875rem",
                        "&:hover": { background: "#667eea10" },
                      }}
                    >
                      View All →
                    </Button>
                  </Stack>
                </Box>
                ``
                {/* Posts List */}
                <List disablePadding sx={{ flex: 1, overflow: "auto" }}>
                  {recentPosts.length > 0 ? (
                    recentPosts.map((post, index) => {
                      const statusColor = getStatusColor(post.status);
                      return (
                        <React.Fragment key={post._id}>
                          <ListItem
                            disableGutters
                            sx={{
                              px: { xs: 2, md: 3 },
                              py: 2,
                              transition: "background 0.2s ease",
                              "&:hover": { background: "#f8fafc" },
                              alignItems: "flex-start",
                            }}
                            secondaryAction={
                              <Tooltip title="Edit Post">
                                <IconButton
                                  component={Link}
                                  to={`/admin/blogs/edit/${post._id}`}
                                  size="small"
                                  sx={{
                                    color: "#667eea",
                                    "&:hover": { background: "#667eea15" },
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            }
                          >
                            <ListItemText
                              primary={post.title}
                              secondary={
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 2,
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                    mt: 0.5,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <EventNoteOutlined
                                      sx={{ fontSize: 14, color: "#94a3b8" }}
                                    />
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      sx={{
                                        color: "#64748b",
                                        fontFamily: "'Inter', sans-serif",
                                      }}
                                    >
                                      {new Date(
                                        post.createdAt
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </Typography>
                                  </Box>
                                  {post.category && (
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      sx={{
                                        color: "#64748b",
                                        fontFamily: "'Inter', sans-serif",
                                      }}
                                    >
                                      📌 {post.category}
                                    </Typography>
                                  )}
                                </Box>
                              }
                              primaryTypographyProps={{
                                sx: {
                                  fontWeight: 600,
                                  color: "#0f172a",
                                  fontFamily: "'Inter', sans-serif",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  pr: 2,
                                },
                              }}
                              secondaryTypographyProps={{
                                component: "div",
                                sx: {
                                  m: 0,
                                  display: "flex",
                                  gap: 1,
                                  mt: 0.5,
                                  alignItems: "center",
                                },
                              }}
                            />
                            {/* Status Chip */}
                            <Chip
                              label={post.status || "draft"}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "0.7rem",
                                height: 24,
                                background: statusColor.bg,
                                color: statusColor.text,
                                textTransform: "capitalize",
                                ml: "auto",
                              }}
                            />
                          </ListItem>
                          {index < recentPosts.length - 1 && (
                            <Divider sx={{ my: 0 }} />
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <Box
                      sx={{
                        py: { xs: 6, md: 8 },
                        px: 3,
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Description
                        sx={{
                          fontSize: { xs: 56, md: 64 },
                          color: "#e2e8f0",
                          mb: 2,
                        }}
                      />
                      <Typography
                        sx={{
                          color: "#64748b",
                          fontFamily: "'Inter', sans-serif",
                          mb: 2,
                        }}
                      >
                        No posts yet. Start creating your first blog post!
                      </Typography>
                      <Button
                        component={Link}
                        to="/admin/blogs/create"
                        variant="outlined"
                        startIcon={<Add />}
                        sx={{
                          textTransform: "none",
                          fontFamily: "'Inter', sans-serif",
                          borderColor: "#667eea",
                          color: "#667eea",
                          "&:hover": {
                            borderColor: "#667eea",
                            background: "#667eea10",
                          },
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

          {/* Chart Section */}
          <Grid item xs={12} md={5}>
            <motion.div variants={itemVariants} style={{ height: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2.5,
                  border: "1px solid #e2e8f0",
                  p: { xs: 2, md: 3 },
                  background: "#ffffff",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      color: "#0f172a",
                      mb: 0.3,
                    }}
                  >
                    Post Distribution
                  </Typography>
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{
                      color: "#64748b",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Status breakdown of your posts
                  </Typography>
                </Box>

                {stats.total > 0 && chartData.length > 0 ? (
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 40 : 50}
                          outerRadius={isMobile ? 70 : 85}
                          paddingAngle={3}
                          dataKey="value"
                          label={!isMobile}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            fontFamily: "'Inter', sans-serif",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <Stack
                      direction={isMobile ? "column" : "row"}
                      spacing={1.5}
                      sx={{
                        mt: 2,
                        width: "100%",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {chartData.map((item, idx) => (
                        <Stack
                          key={idx}
                          direction="row"
                          spacing={0.8}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: item.fill,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            {item.name} ({item.value})
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Create your first post to see analytics
                    </Typography>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
}
