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
  Close as CloseIcon,
} from "@mui/icons-material";

const SERVER_BASE_URL = import.meta.env.VITE_API_URL_SERVER;

// Hero Banner Section
const HeroBanner = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  minHeight: "300px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 1,
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 2,
  textAlign: "center",
  color: "#fff",
  padding: theme.spacing(4),
  maxWidth: "900px",
}));

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

// Helper function to render each content block based on its type
const renderContentBlock = (block, index) => {
  const { type, value } = block;

  const getFullSrc = (src) => {
    if (!src) return "";
    if (src.startsWith("http") || src.startsWith("blob:")) {
      return src;
    }
    return `${SERVER_BASE_URL}${src}`;
  };

  switch (type) {
    case "heading":
      return (
        <Typography
          key={index}
          variant="h4"
          component="h2"
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            color: "#4a148c",
            my: 3,
          }}
        >
          {value}
        </Typography>
      );
    case "paragraph":
      return (
        <Typography
          key={index}
          paragraph
          sx={{ fontFamily: "'Montserrat', sans-serif", lineHeight: 1.8 }}
        >
          {value}
        </Typography>
      );
    case "quote":
      return (
        <Typography
          key={index}
          component="blockquote"
          sx={{
            fontStyle: "italic",
            color: "text.secondary",
            borderLeft: `4px solid #ab47bc`,
            pl: 2,
            my: 3,
          }}
        >
          {value}
        </Typography>
      );
    case "image":
      const imgSrc = getFullSrc(value.src);
      return (
        <Box
          key={index}
          component="figure"
          sx={{ m: 0, textAlign: "center", my: 3 }}
        >
          <img
            src={imgSrc}
            alt={value.caption || "Blog image"}
            style={{ maxWidth: "100%", borderRadius: "8px" }}
          />
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
        const videoSrc = getFullSrc(value.src);
        return (
          <video
            key={index}
            src={videoSrc}
            controls
            controlsList="nodownload"
            autoPlay
            muted
            loop
            playsInline
            style={{ width: "100%", borderRadius: "8px" }}
          />
        );
      }
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

  const getFullSrc = (src) => {
    if (!src) return "";
    if (src.startsWith("http") || src.startsWith("blob:")) {
      return src;
    }
    return `${SERVER_BASE_URL}${src}`;
  };

  const heroImage = featuredImagePreview
    ? getFullSrc(featuredImagePreview)
    : "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600";

  return (
    <Box sx={{ backgroundColor: "#fff" }}>
      {/* Close Button - Fixed Position */}
      <Box
        sx={{
          position: "absolute",
          top: 100,
          right: 20,
          zIndex: 1500,
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          startIcon={<CloseIcon />}
          onClick={() => window.close()}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            color: "#4a148c",
            "&:hover": {
              backgroundColor: "#fff",
            },
          }}
        >
          Close Preview
        </Button>
      </Box>

      {/* Hero Banner with Title */}
      <HeroBanner
        sx={{
          // backgroundImage: `url(${heroImage})`,
            backgroundImage: `linear-gradient(rgba(74, 20, 140, 0.6), rgba(236, 64, 122, 0.6)), url(${heroImage})`,
 

        }}
      >
        <HeroContent>
          {/* Category Badge */}
          {blogPost.category && (
            <Chip
              label={blogPost.category}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#fff",
                backdropFilter: "blur(10px)",
                fontWeight: 600,
                mb: 2,
              }}
            />
          )}

          {/* Title */}
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: { xs: "1.5rem", md: "2rem" },
              mb: 3,
              textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {blogPost.title || "[Your Title Here]"}
          </Typography>

          {/* Meta Information */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon fontSize="small" />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {blogPost.author || "Admin"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          </Stack>
        </HeroContent>
      </HeroBanner>

      {/* Blog Content */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        {/* Excerpt/Summary */}
        {blogPost.excerpt && (
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontStyle: "italic",
              color: "text.secondary",
              mb: 5,
              fontSize: "1.25rem",
              lineHeight: 1.8,
            }}
          >
            {blogPost.excerpt}
          </Typography>
        )}

        {/* Content Blocks */}
        <BlogContent>
          {contentBlocks.map((block, index) =>
            renderContentBlock(block, index)
          )}
        </BlogContent>

        {/* Tags */}
        {blogPost.tags && blogPost.tags.length > 0 && (
          <Box sx={{ mt: 6, pt: 4, borderTop: "1px solid #e0e0e0" }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, fontWeight: 600, color: "#4a148c" }}
            >
              Tags:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {blogPost.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  sx={{
                    backgroundColor: "#f3e5f5",
                    color: "#4a148c",
                    mb: 1,
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}
