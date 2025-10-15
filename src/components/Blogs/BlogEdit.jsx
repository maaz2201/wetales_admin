import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Grid,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  Title,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  PhotoCamera,
  ExpandMore,
} from "@mui/icons-material";

const API_BASE_URL = import.meta.env.VITE_API_URL;;
// or fallback: process.env.REACT_APP_API_URL || "your-default"

// const SERVER_BASE_URL = "http://localhost:5000";
const SERVER_BASE_URL = import.meta.env.VITE_API_URL_SERVER;
// or fallback: process.env.REACT_APP_API_URL || "your-default"

const MenuBar = ({ editor }) => {
  if (!editor) return null;
  const menuItems = [
    { action: () => editor.chain().focus().toggleBold().run(), icon: FormatBold, label: "Bold", active: editor.isActive("bold") },
    { action: () => editor.chain().focus().toggleItalic().run(), icon: FormatItalic, label: "Italic", active: editor.isActive("italic") },
    { action: () => editor.chain().focus().toggleStrike().run(), icon: FormatStrikethrough, label: "Strike", active: editor.isActive("strike") },
    { type: "divider" },
    { action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), icon: Title, label: "H2", active: editor.isActive("heading", { level: 2 }) },
    { action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), icon: Title, label: "H3", active: editor.isActive("heading", { level: 3 }), sx: { transform: "scale(0.8)" } },
    { type: "divider" },
    { action: () => editor.chain().focus().toggleBulletList().run(), icon: FormatListBulleted, label: "Bullet List", active: editor.isActive("bulletList") },
    { action: () => editor.chain().focus().toggleOrderedList().run(), icon: FormatListNumbered, label: "Numbered List", active: editor.isActive("orderedList") },
    { action: () => editor.chain().focus().toggleBlockquote().run(), icon: FormatQuote, label: "Blockquote", active: editor.isActive("blockquote") },
  ];

  return (
    <Paper elevation={0} sx={{ display: "flex", flexWrap: "wrap", p: 1, borderBottom: "1px solid #ddd", borderRadius: "4px 4px 0 0" }}>
      {menuItems.map((item, index) =>
        item.type === "divider" ? (<Divider key={index} orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />) : (
          <Tooltip key={item.label} title={item.label}>
            <IconButton onClick={item.action} size="small" sx={{ color: item.active ? "primary.main" : "text.secondary", backgroundColor: item.active ? "rgba(171, 71, 188, 0.1)" : "transparent" }}>
              <item.icon sx={item.sx} />
            </IconButton>
          </Tooltip>
        )
      )}
    </Paper>
  );
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

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
    featuredImage: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/blogs/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setFormData({
          title: data.title || '',
          excerpt: data.excerpt || '',
          category: data.category || '',
          tags: data.tags || [],
          status: data.status || 'draft',
          seoTitle: data.seoTitle || '',
          seoDescription: data.seoDescription || '',
          featuredImage: data.featuredImage || '',
        });
        if (data.featuredImage) {
          setImagePreview(`${SERVER_BASE_URL}${data.featuredImage}`);
        }
        if (editor) {
          editor.commands.setContent(data.content || '');
        }
      } catch (err) {
        setError('Failed to load blog post.');
      } finally {
        setLoading(false);
      }
    };
    if (editor) {
        fetchBlog();
    }
  }, [id, token, navigate, editor]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    let imageUrl = formData.featuredImage;
    if (imageFile) {
      const uploadFormData = new FormData();
      uploadFormData.append("image", imageFile);
      try {
        const { data } = await axios.post(`${API_BASE_URL}/upload/image`, uploadFormData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        imageUrl = data.data.filePath;
      } catch (err) {
        setError("Image upload failed. Please try again.");
        setSaving(false);
        return;
      }
    }

    try {
      const blogPostData = {
        ...formData,
        content: editor.getHTML(),
        featuredImage: imageUrl,
      };
      await axios.put(`${API_BASE_URL}/blogs/${id}`, blogPostData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/admin/blogs");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update the post.");
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h4" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#4a148c" }}>
              Edit Blog Post
            </Typography>
            <Button type="submit" variant="contained" size="large" disabled={saving} sx={{ py: 1, borderRadius: "50px", fontFamily: "'Montserrat', sans-serif", fontWeight: "bold", background: "linear-gradient(45deg, #ec407a, #ab47bc)", "&:hover": { transform: "scale(1.02)" } }}>
              {saving ? <CircularProgress size={24} color="inherit" /> : "Update Post"}
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Grid container spacing={4}>
            {/* Main Content Column */}
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <Paper component={motion.div} variants={itemVariants} elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <TextField label="Blog Title" name="title" value={formData.title} onChange={handleChange} fullWidth required />
                </Paper>
                <Paper component={motion.div} variants={itemVariants} elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 500, fontFamily: "'Montserrat', sans-serif" }}>Content</Typography>
                  <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                    <MenuBar editor={editor} />
                    <Box sx={{ p: 1.5, minHeight: 400, "& .ProseMirror": { outline: "none" } }}>
                      <EditorContent editor={editor} />
                    </Box>
                  </Paper>
                </Paper>
                <Paper component={motion.div} variants={itemVariants} elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <TextField label="Excerpt" name="excerpt" value={formData.excerpt} onChange={handleChange} fullWidth multiline rows={4} helperText="A short summary of the post for previews." />
                </Paper>
              </Stack>
            </Grid>

            {/* Sidebar Column */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <Paper component={motion.div} variants={itemVariants} elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>Publish Settings</Typography>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select name="status" value={formData.status} label="Status" onChange={handleChange}>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                    </Select>
                  </FormControl>
                </Paper>
                <Paper component={motion.div} variants={itemVariants} elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>Organization</Typography>
                  <Stack spacing={2}>
                    <TextField label="Category" name="category" value={formData.category} onChange={handleChange} fullWidth />
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField label="Add a Tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }} size="small" fullWidth />
                        <Button variant="outlined" onClick={handleAddTag}>Add</Button>
                      </Stack>
                      <Box sx={{ mt: 2 }}>
                        {formData.tags.map((tag) => (
                          <Chip key={tag} label={tag} onDelete={() => handleDeleteTag(tag)} sx={{ mr: 1, mb: 1, background: "rgba(171, 71, 188, 0.1)", color: "#ab47bc", fontWeight: 500 }} />
                        ))}
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
                <Paper component={motion.div} variants={itemVariants} elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>Featured Image</Typography>
                  <Button variant="outlined" component="label" startIcon={<PhotoCamera />}>
                    Change Image
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </Button>
                  {imagePreview && (
                    <Box sx={{ mt: 2, borderRadius: 1, overflow: "hidden", border: "1px solid #ddd" }}>
                      <img src={imagePreview} alt="Preview" style={{ width: "100%", display: "block" }} />
                    </Box>
                  )}
                </Paper>
                <Accordion component={motion.div} variants={itemVariants} sx={{ boxShadow: 2, borderRadius: 2, "&.Mui-expanded": { margin: 0 } }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>SEO Settings</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <TextField label="SEO Title" name="seoTitle" value={formData.seoTitle} onChange={handleChange} fullWidth helperText="Leave blank to use the main title." />
                      <TextField label="SEO Description" name="seoDescription" value={formData.seoDescription} onChange={handleChange} fullWidth multiline rows={3} helperText="A short description for search engine results." />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </Box>
  );
}

