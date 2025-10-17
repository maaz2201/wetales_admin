import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Chip,
  Stack,
  CardMedia,
  Paper,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Close as CloseIcon, // Changed from ArrowBackIcon
} from "@mui/icons-material";
// useNavigate is no longer needed for this button
// import { useNavigate } from "react-router-dom";

const SERVER_BASE_URL = import.meta.env.VITE_API_URL_SERVER;

const BlogContent = styled(Box)(({ theme }) => ({
  fontFamily: "'Montserrat', sans-serif",
  lineHeight: 1.8,
  fontSize: "1.1rem",
  color: "#333",
  "& h2, & h3, & h4": {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    color: "#4a148c",
    margin: theme.spacing(4, 0, 2),
  },
  "& p": { marginBottom: theme.spacing(2) },
  "& blockquote": {
    borderLeft: `4px solid #f3e5f5`,
    paddingLeft: theme.spacing(2),
    margin: theme.spacing(3, 0),
    fontStyle: "italic",
    color: theme.palette.text.secondary,
  },
  "& img, & video, & iframe": {
    minWidth: "100%",
    maxWidth: "100%",
    height: "auto",
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(3, "auto"),
    display: "block",

  },
}));

// Helper function to render each content block (remains the same)
const renderContentBlock = (block, index) => {
  // ... (no changes needed in this function)
  const { type, value } = block;

  switch (type) {
    case "heading":
      return (
        <Typography key={index} variant="h4" component="h2">
          {value}
        </Typography>
      );
    case "paragraph":
      return (
        <Typography key={index} paragraph>
          {value}
        </Typography>
      );
    case "quote":
      return (
        <Typography key={index} component="blockquote">
          {value}
        </Typography>
      );
    case "image":
      const imgSrc = value.src.startsWith("data:image")
        ? value.src
        : `${SERVER_BASE_URL}${value.src}`;
      return (
        <Box
          key={index}
          component="figure"
          sx={{ margin: 0, textAlign: "center" }}
        >
          <img src={imgSrc} alt={value.caption || "Blog image"} />
          {value.caption && (
            <Typography
              component="figcaption"
              variant="caption"
              display="block"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {value.caption}
            </Typography>
          )}
        </Box>
      );
    case "video":
      if (value.type === "upload") {
        const videoSrc = value.src.startsWith("data:video")
          ? value.src
          : `${SERVER_BASE_URL}${value.src}`;
return <video key={index} src={videoSrc} controls controlsList="nodownload" autoPlay muted loop playsInline style={{ width: '100%', borderRadius: '8px' }} />;      }
      if (value.type === "embed") {
        let embedUrl = "";
        const url = value.src;
        if (url.includes("youtube.com/watch?v="))
          embedUrl = `https://www.youtube.com/embed/${
            url.split("v=")[1].split("&")[0]
          }`;
        else if (url.includes("youtu.be/"))
          embedUrl = `https://www.youtube.com/embed/${url.split("/").pop()}`;
        else if (url.includes("vimeo.com/"))
          embedUrl = `https://player.vimeo.com/video/${url.split("/").pop()}`;

        return embedUrl ? (
          <Box key={index} sx={{ position: "relative", paddingTop: "56.25%" }}>
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
        ) : null;
      }
      return null;
    default:
      return null;
  }
};

export default function BlogPreview() {
  const [blogData, setBlogData] = useState(null);
  // We don't need useNavigate here anymore
  // const navigate = useNavigate();

  useEffect(() => {
    const dataString = sessionStorage.getItem("blogPreview");
    if (dataString) {
      setBlogData(JSON.parse(dataString));
    }
  }, []);

  if (!blogData) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <Typography variant="h5">No preview data available.</Typography>
        <Typography>
          Please go back to the editor and click "Preview" again.
        </Typography>
      </Box>
    );
  }

  const { blogPost, contentBlocks, featuredImagePreview } = blogData;

  return (
    <Box sx={{ py: 4, backgroundColor: "#f8f9fa" }}>
      <Container maxWidth="md">
        {/* --- BUTTON UPDATED --- */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CloseIcon />}
            onClick={() => window.close()} // This will close the current tab
          >
            Close Preview
          </Button>
        </Box>
        {/* -------------------- */}
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: "#4a148c",
            }}
          >
            {blogPost.title || "[Your Title Here]"}
          </Typography>
          <Stack
            direction="row"
            spacing={3}
            sx={{ my: 2, color: "text.secondary" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon fontSize="small" />
              <Typography variant="body2">Admin (Preview)</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body2">
                {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>

          {featuredImagePreview && (
            <CardMedia
              component="img"
              image={featuredImagePreview}
              alt={blogPost.title}
              sx={{ borderRadius: 2, my: 4,  width: '100%' }}
            />
          )}

          <BlogContent>
            {contentBlocks.map((block, index) =>
              renderContentBlock(block, index)
            )}
          </BlogContent>
        </Paper>
      </Container>
    </Box>
  );
}
