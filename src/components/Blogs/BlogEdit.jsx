import React, { useState, useEffect } from "react";
import {
  Box, Paper, TextField, Button, Typography, Alert, Chip, FormControl,
  InputLabel, Select, MenuItem, Stack, IconButton, Tooltip, Divider, Grid,
  CircularProgress, Accordion, AccordionSummary, AccordionDetails, Tabs, Tab
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  PhotoCamera, ExpandMore, Title, Notes, FormatQuote,
  ArrowUpward, ArrowDownward, Delete, OndemandVideo
} from "@mui/icons-material";
import RichTextEditor from "../Blogs/RichTextEditor.jsx";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

const BASE_URL = import.meta.env.VITE_API_URL;
const SERVER_BASE_URL = import.meta.env.VITE_API_URL_SERVER;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const ParagraphBlock = ({ value, onChange }) => (
  <RichTextEditor value={value} onChange={onChange} />
);
const HeadingBlock = ({ value, onChange }) => (
  <TextField
    fullWidth
    variant="standard"
    placeholder="Enter a heading..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
    InputProps={{
      disableUnderline: true,
      style: {
        fontSize: "2rem",
        fontWeight: 700,
        fontFamily: "'Playfair Display', serif",
        color: "#4a148c",
      },
    }}
  />
);
const QuoteBlock = ({ value, onChange }) => (
  <TextField
    fullWidth
    multiline
    variant="standard"
    placeholder="Enter a quote..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
    InputProps={{
      disableUnderline: true,
      style: {
        fontSize: "1.5rem",
        fontStyle: "italic",
        color: "#666",
        borderLeft: "4px solid #ab47bc",
        paddingLeft: "16px",
      },
    }}
  />
);

const ImageBlock = ({ value, onChange, onUpload }) => {
  const [imagePreview, setImagePreview] = useState("");
  useEffect(() => {
    if (value.src) {
      const newPreview = value.src.startsWith("data:image")
        ? value.src
        : `${SERVER_BASE_URL}${value.src}`;
      setImagePreview(newPreview);
    } else {
      setImagePreview("");
    }
  }, [value.src]);
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    const imageUrl = await onUpload(file, "image");
    if (imageUrl) {
      onChange({ src: imageUrl, caption: value.caption || "" });
    }
  };
  return (
    <Stack spacing={2} alignItems="center">
      {imagePreview ? (
        <img
          src={imagePreview}
          alt={value.caption || "blog image"}
          style={{ maxWidth: "100%", borderRadius: "8px" }}
        />
      ) : (
        <Button
          variant="outlined"
          component="label"
          startIcon={<PhotoCamera />}
        >
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Button>
      )}
      <TextField
        fullWidth
        variant="standard"
        placeholder="Add an optional caption..."
        value={value.caption || ""}
        onChange={(e) => onChange({ ...value, caption: e.target.value })}
        size="small"
        sx={{ textAlign: "center" }}
      />
    </Stack>
  );
};

const VideoBlock = ({ value, onChange, onUpload }) => {
  const [tab, setTab] = useState(value.type || "embed");
  const [uploading, setUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState("");
  useEffect(() => {
    if (value.type === "upload" && value.src) {
      const newPreview = value.src.startsWith("data:video")
        ? value.src
        : `${SERVER_BASE_URL}${value.src}`;
      setVideoPreview(newPreview);
    } else {
      setVideoPreview("");
    }
    if (value.type && value.type !== tab) {
      setTab(value.type);
    }
  }, [value.src, value.type]);
  const getEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      videoId = url.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com/")) {
      videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return null;
  };
  const embedUrl = value.type === "embed" ? getEmbedUrl(value.src) : null;
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => setVideoPreview(reader.result);
    reader.readAsDataURL(file);
    const videoUrl = await onUpload(file, "video");
    if (videoUrl) {
      onChange({ src: videoUrl, type: "upload" });
    }
    setUploading(false);
  };
  return (
    <Stack spacing={2}>
      <Tabs
        value={tab}
        onChange={(e, newTab) => {
          setTab(newTab);
          onChange({ src: "", type: newTab });
        }}
        centered
      >
        <Tab label="Embed URL" value="embed" />
        <Tab label="Upload Video" value="upload" />
      </Tabs>
      {tab === "embed" && (
        <TextField
          fullWidth
          label="Video URL (YouTube or Vimeo)"
          value={value.type === "embed" ? value.src : ""}
          onChange={(e) => onChange({ src: e.target.value, type: "embed" })}
          placeholder="Paste your video link here..."
        />
      )}
      {tab === "upload" && (
        <Box sx={{ textAlign: "center" }}>
          <Button variant="outlined" component="label" disabled={uploading}>
            {uploading ? <CircularProgress size={24} /> : "Select Video File"}
            <input
              type="file"
              hidden
              accept="video/*"
              onChange={handleVideoUpload}
            />
          </Button>
        </Box>
      )}
      {value.type === "embed" && embedUrl ? (
        <Box
          sx={{
            position: "relative",
            paddingTop: "56.25%",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <iframe
            src={embedUrl}
            frameBorder="0"
            allowFullScreen
            title="Embedded video"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </Box>
      ) : (
        value.type === "upload" &&
        videoPreview && (
          <video
            src={videoPreview}
            controls
            style={{ width: "100%", borderRadius: "8px" }}
          />
        )
      )}
    </Stack>
  );
};

const SERPPreview = ({ title, description }) => (
  <Box
    sx={{
      p: 2,
      border: "1px solid #ddd",
      borderRadius: 1,
      bgcolor: "#fff",
      fontSize: "0.9rem",
    }}
  >
    <Typography
      variant="body2"
      sx={{
        color: "#1a0dab",
        fontSize: "18px",
        textDecoration: "underline",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {title || "Your Blog Title Will Appear Here"}
    </Typography>
    <Typography variant="body2" sx={{ color: "#006621", fontSize: "14px" }}>
      https://www.wetales.in/blog/your-slug
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: "#545454",
        fontSize: "14px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: "2",
        WebkitBoxOrient: "vertical",
      }}
    >
      {description ||
        "Your SEO description will appear here, giving a brief summary of your amazing article."}
    </Typography>
  </Box>
);

export default function BlogEdit() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "",
    tags: [],
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
    featuredImage: "",
  });
  const [contentBlocks, setContentBlocks] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (id) {
      const fetchBlog = async () => {
        try {
          const { data } = await axios.get(`${BASE_URL}/blogs/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData({
            title: data.title || "",
            excerpt: data.excerpt || "",
            category: data.category || "",
            tags: data.tags || [],
            status: data.status || "draft",
            seoTitle: data.seoTitle || "",
            seoDescription: data.seoDescription || "",
            seoKeywords: data.seoKeywords || [],
            featuredImage: data.featuredImage || "",
          });
          setContentBlocks(data.contentBlocks || []);
          if (data.featuredImage) {
            setFeaturedImagePreview(`${SERVER_BASE_URL}${data.featuredImage}`);
          } else {
            setFeaturedImagePreview("");
          }
        } catch (err) {
          setError("Failed to load blog post.");
        } finally {
          setLoading(false);
        }
      };
      fetchBlog();
    } else {
      setLoading(false);
      setError("Invalid blog post ID for editing. Please select a post to edit.");
    }
  }, [id, token, navigate]);

  const handleBlockChange = (index, newValue) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index].value = newValue;
    setContentBlocks(newBlocks);
  };
  const addBlock = (type) => {
    let defaultValue = "";
    if (type === "image") defaultValue = { src: "", caption: "" };
    if (type === "video") defaultValue = { src: "", type: "embed" };
    setContentBlocks([...contentBlocks, { type, value: defaultValue }]);
  };
  const moveBlock = (index, direction) => {
    const newBlocks = [...contentBlocks];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];
    setContentBlocks(newBlocks);
  };
  const deleteBlock = (index) => {
    const newBlocks = contentBlocks.filter((_, i) => i !== index);
    setContentBlocks(newBlocks);
  };

  const uploadFile = async (file, fileType = "image") => {
    const uploadFormData = new FormData();
    uploadFormData.append(fileType, file);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/upload/${fileType}`,
        uploadFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.data.filePath;
    } catch (err) {
      setError(
        `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} upload failed.`
      );
      return null;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFeaturedImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (publishStatus) => {
    setError("");
    setSaving(true);
    let featuredImageUrl = formData.featuredImage;
    if (featuredImageFile) {
      featuredImageUrl = await uploadFile(featuredImageFile, "image");
      if (!featuredImageUrl) {
        setSaving(false);
        return null;
      }
    }
    try {
      const blogPostData = {
        ...formData,
        contentBlocks,
        featuredImage: featuredImageUrl,
        status: publishStatus,
      };
      const { data } = await axios.put(
        `${BASE_URL}/blogs/${id}`,
        blogPostData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save the post.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave(formData.status).then((savedBlog) => {
      if (savedBlog) navigate("/admin/blogs");
    });
  };

  const handlePreview = () => {
    const previewData = {
      blogPost: formData,
      contentBlocks: contentBlocks,
      featuredImagePreview: featuredImagePreview,
    };
    sessionStorage.setItem("blogPreview", JSON.stringify(previewData));
    window.open("/admin/blogs/preview", "_blank");
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };
  const handleDeleteTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  // --- SEO KEYWORDS ---
  const handleAddKeyword = () => {
    if (
      keywordInput.trim() &&
      !(formData.seoKeywords || []).includes(keywordInput.trim())
    ) {
      setFormData({
        ...formData,
        seoKeywords: [...(formData.seoKeywords || []), keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };
  const handleDeleteKeyword = (keyword) => {
    setFormData({
      ...formData,
      seoKeywords: (formData.seoKeywords || []).filter((k) => k !== keyword),
    });
  };
  const handleAISuggestions = async () => {
    setIsFetchingSuggestions(true);
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        seoTitle: prev.seoTitle || "Update Your Blog SEO Title",
        seoDescription:
          prev.seoDescription ||
          "This is an example suggested SEO description for your blog. Use real AI for dynamic text.",
        seoKeywords: prev.seoKeywords.length
          ? prev.seoKeywords
          : ["example", "seo", "keywords"],
      }));
      setIsFetchingSuggestions(false);
    }, 1800);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "100vw", mx: "auto" }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
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
              Edit Blog Post
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" size="large" onClick={handlePreview}>
                Preview
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={saving}
                sx={{
                  py: 1,
                  borderRadius: "50px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: "bold",
                  background: "linear-gradient(45deg, #ec407a, #ab47bc)",
                  "&:hover": { transform: "scale(1.02)" },
                }}
              >
                {saving ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Update Post"
                )}
              </Button>
            </Stack>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={4}>
            <Grid xs={12} md={8}>
              <Stack spacing={3}>
                <Paper
                  component={motion.div}
                  variants={itemVariants}
                  elevation={2}
                  sx={{ p: 3, borderRadius: 2 }}
                >
                  <TextField
                    label="Blog Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Paper>
                <Paper
                  component={motion.div}
                  variants={itemVariants}
                  elevation={2}
                  sx={{ p: 3, borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    Content
                  </Typography>
                  <Stack spacing={3}>
                    {contentBlocks.map((block, index) => (
                      <Paper
                        key={index}
                        variant="outlined"
                        sx={{ p: 2, position: "relative" }}
                      >
                        {block.type === "paragraph" && (
                          <ParagraphBlock
                            value={block.value}
                            onChange={(val) => handleBlockChange(index, val)}
                          />
                        )}
                        {block.type === "heading" && (
                          <HeadingBlock
                            value={block.value}
                            onChange={(val) => handleBlockChange(index, val)}
                          />
                        )}
                        {block.type === "quote" && (
                          <QuoteBlock
                            value={block.value}
                            onChange={(val) => handleBlockChange(index, val)}
                          />
                        )}
                        {block.type === "image" && (
                          <ImageBlock
                            value={block.value}
                            onChange={(val) => handleBlockChange(index, val)}
                            onUpload={uploadFile}
                          />
                        )}
                        {block.type === "video" && (
                          <VideoBlock
                            value={block.value}
                            onChange={(val) => handleBlockChange(index, val)}
                            onUpload={uploadFile}
                          />
                        )}
                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{
                            position: "absolute",
                            top: -15,
                            right: 8,
                            background: "white",
                            borderRadius: "50px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => moveBlock(index, -1)}
                            disabled={index === 0}
                          >
                            <ArrowUpward fontSize="inherit" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => moveBlock(index, 1)}
                            disabled={index === contentBlocks.length - 1}
                          >
                            <ArrowDownward fontSize="inherit" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => deleteBlock(index)}
                            color="error"
                          >
                            <Delete fontSize="inherit" />
                          </IconButton>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 3, flexWrap: "wrap" }}
                  >
                    <Button
                      startIcon={<Notes />}
                      onClick={() => addBlock("paragraph")}
                    >
                      Paragraph
                    </Button>
                    <Button
                      startIcon={<Title />}
                      onClick={() => addBlock("heading")}
                    >
                      Heading
                    </Button>
                    <Button
                      startIcon={<FormatQuote />}
                      onClick={() => addBlock("quote")}
                    >
                      Quote
                    </Button>
                    <Button
                      startIcon={<PhotoCamera />}
                      onClick={() => addBlock("image")}
                    >
                      Image
                    </Button>
                    <Button
                      startIcon={<OndemandVideo />}
                      onClick={() => addBlock("video")}
                    >
                      Video
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
            <Grid xs={12} md={4}>
              <Stack spacing={3}>
                <Paper
                  component={motion.div}
                  variants={itemVariants}
                  elevation={2}
                  sx={{ p: 3, borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Publish Settings
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      label="Status"
                      onChange={handleChange}
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                    </Select>
                  </FormControl>
                </Paper>
                <Paper
                  component={motion.div}
                  variants={itemVariants}
                  elevation={2}
                  sx={{ p: 3, borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Organization
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      fullWidth
                    />
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          label="Add a Tag"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          size="small"
                          fullWidth
                        />
                        <Button variant="outlined" onClick={handleAddTag}>
                          Add
                        </Button>
                      </Stack>
                      <Box sx={{ mt: 2 }}>
                        {formData.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            onDelete={() => handleDeleteTag(tag)}
                            sx={{
                              mr: 1,
                              mb: 1,
                              background: "rgba(171, 71, 188, 0.1)",
                              color: "#ab47bc",
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
                <Paper
                  component={motion.div}
                  variants={itemVariants}
                  elevation={2}
                  sx={{ p: 3, borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Featured Image
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                  >
                    {" "}
                    Change Image{" "}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFeaturedImageChange}
                    />{" "}
                  </Button>
                  {featuredImagePreview && (
                    <Box
                      sx={{
                        mt: 2,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "1px solid #ddd",
                      }}
                    >
                      {" "}
                      <img
                        src={featuredImagePreview}
                        alt="Preview"
                        style={{ width: "100%", display: "block" }}
                      />{" "}
                    </Box>
                  )}
                </Paper>
                {/* SEO Section */}
                <Paper
                  component={motion.div}
                  variants={itemVariants}
                  elevation={2}
                  sx={{ p: 3, borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    SEO Settings
                    <Tooltip
                      title={
                        <span>
                          <b>SEO Title:</b> Main link shown on Google<br />
                          <b>Description:</b> Summary for search results<br />
                          <b>Best Practices:</b> Use keywords, keep title &lt; 60 chars, desc &lt; 160 chars
                        </span>
                      }
                      arrow
                    >
                      <InfoOutlinedIcon color="primary" sx={{ fontSize: 20 }} />
                    </Tooltip>
                    {/* <Button
                      size="small"
                      variant="outlined"
                      startIcon={<SmartToyOutlinedIcon />}
                      onClick={handleAISuggestions}
                      disabled={isFetchingSuggestions}
                      sx={{
                        ml: "auto",
                        fontWeight: 500,
                        borderRadius: 4,
                        minWidth: 0,
                        px: 1.3,
                      }}
                    >
                      {isFetchingSuggestions ? "Loading..." : "AI Suggestions"}
                    </Button> */}
                  </Typography>
                  <Accordion
                    sx={{
                      boxShadow: 2,
                      borderRadius: 2,
                      "&.Mui-expanded": { margin: 0, "&:before": { opacity: 0 } },
                      mb: 0,
                      background: "#fbf7fd",
                    }}
                    defaultExpanded
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        Optimize SEO
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <TextField
                          label="SEO Title"
                          name="seoTitle"
                          value={formData.seoTitle}
                          onChange={handleChange}
                          fullWidth
                          helperText={
                            <>
                              <span
                                style={{
                                  color:
                                    formData.seoTitle.length > 60
                                      ? "#c62828"
                                      : "#757575",
                                }}
                              >
                                {formData.seoTitle.length} / 60
                              </span>
                              <span style={{ marginLeft: 8 }}>
                                {formData.seoTitle.length > 60 && " Too long"}
                              </span>
                            </>
                          }
                          inputProps={{ maxLength: 70 }}
                        />
                        <TextField
                          label="SEO Description"
                          name="seoDescription"
                          value={formData.seoDescription}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={3}
                          helperText={
                            <>
                              <span
                                style={{
                                  color:
                                    formData.seoDescription.length > 160
                                      ? "#c62828"
                                      : "#757575",
                                }}
                              >
                                {formData.seoDescription.length} / 160
                              </span>
                              <span style={{ marginLeft: 8 }}>
                                {formData.seoDescription.length > 160 &&
                                  " Too long"}
                              </span>
                            </>
                          }
                          inputProps={{ maxLength: 180 }}
                        />
                        {/* Keyword UI */}
                        <Stack spacing={1}>
                          <TextField
                            label="SEO Keyword"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddKeyword();
                              }
                            }}
                            disabled={isFetchingSuggestions}
                            helperText="Press enter or 'Add' to add multiple keywords"
                            InputProps={{
                              endAdornment: (
                                <Button
                                  size="small"
                                  onClick={handleAddKeyword}
                                  disabled={isFetchingSuggestions}
                                >
                                  Add
                                </Button>
                              ),
                            }}
                            fullWidth
                          />
                          <Box sx={{ mt: 0.5 }}>
                            {(formData.seoKeywords || []).map((kw) => (
                              <Chip
                                key={kw}
                                label={kw}
                                onDelete={() => handleDeleteKeyword(kw)}
                                color="secondary"
                                sx={{
                                  m: 0.3,
                                  bgcolor: "rgba(186,104,200,0.08)",
                                  color: "#6a1b9a",
                                  fontWeight: 500,
                                }}
                              />
                            ))}
                          </Box>
                        </Stack>
                        <Divider sx={{ my: 1 }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: "#7b1fa2",
                            mb: 1,
                            textTransform: "uppercase",
                          }}
                        >
                          SERP Preview
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            bgcolor: "#fff",
                            borderRadius: 1,
                            border: "1px solid #eee",
                            maxWidth: 450,
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#1a0dab",
                              fontSize: "20px",
                              fontWeight: 700,
                              textDecoration: "underline",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              mb: "-2px",
                            }}
                          >
                            {formData.seoTitle ||
                              formData.title ||
                              "Your Blog Title Will Appear Here"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#006621",
                              fontSize: "14px",
                              mb: "2px",
                            }}
                          >
                            https://www.wetales.in/blog/your-slug
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
                            {formData.seoDescription ||
                              formData.excerpt ||
                              "Your SEO description will appear here, giving a brief summary of your amazing article."}
                          </Typography>
                          {!!(formData.seoKeywords || []).length && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                pt: 1,
                                color: "#6a1b9a",
                                fontWeight: 500,
                              }}
                            >
                              Keywords:{" "}
                              {(formData.seoKeywords || []).join(", ")}
                            </Typography>
                          )}
                        </Paper>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </Box>
  );
}
