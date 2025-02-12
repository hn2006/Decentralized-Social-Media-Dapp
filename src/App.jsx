import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./contracts/SocialMediaABI.json";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  TextField,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CssBaseline,
  Box,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import SendIcon from "@mui/icons-material/Send";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import CloseIcon from "@mui/icons-material/Close";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

export default function SocialDapp() {
  // State variables
  const [posts, setPosts] = useState([]);
  const [account, setAccount] = useState("");
  const [content, setContent] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  // Used to toggle the comments section in the modal
  const [showComments, setShowComments] = useState(false);
  // Used to toggle inline comments on each post card
  const [expandedComments, setExpandedComments] = useState({});

  // Error handling states
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Material UI theme configuration
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#007bff",
      },
      secondary: {
        main: "#28a745",
      },
    },
  });

  // Update the selected post details if posts get refreshed
  useEffect(() => {
    if (selectedPost) {
      const updated = posts.find((post) => post.id === selectedPost.id);
      if (updated) setSelectedPost(updated);
    }
  }, [posts, selectedPost]);

  useEffect(() => {
    loadPosts();
  }, []);

  async function connectWallet() {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
        setAccount(await signer.getAddress());
      }
    } catch (err) {
      setError(err.message);
      setOpenSnackbar(true);
    }
  }

  async function loadPosts() {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_ALCHEMY_URL);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const data = await contract.getAllPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message);
      setOpenSnackbar(true);
    }
  }

  async function createPost() {
    try {
      if (!content) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.createPost(content);
      await tx.wait();
      setContent("");
      loadPosts();
    } catch (err) {
      setError(err.message);
      setOpenSnackbar(true);
    }
  }

  async function likePost(postId) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.likePost(postId);
      await tx.wait();
      loadPosts();
    } catch (err) {
      setError(err.message);
      setOpenSnackbar(true);
    }
  }

  async function dislikePost(postId) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.dislikePost(postId);
      await tx.wait();
      loadPosts();
    } catch (err) {
      setError(err.message);
      setOpenSnackbar(true);
    }
  }

  async function addCommentToPost(postId, content) {
    try {
      if (!content) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.addComment(postId, content);
      await tx.wait();
      loadPosts();
    } catch (err) {
      setError(err.message);
      setOpenSnackbar(true);
    }
  }

  async function likeComment(postId, commentId) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.likeComment(postId, commentId);
      await tx.wait();
      loadPosts();
    } catch (err) {
      setError(err.message);
      setOpenSnackbar(true);
    }
  }

  async function dislikeComment(postId, commentId) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.dislikeComment(postId, commentId);
      await tx.wait();
      loadPosts();
    } catch (err) {
      setError(err.message);
      setOpenSnackbar(true);
    }
  }

  function openPostModal(post) {
    setSelectedPost(post);
    setModalOpen(true);
    setShowComments(false); // Reset the modal's comments view when opening
  }

  function closePostModal() {
    setSelectedPost(null);
    setModalOpen(false);
    setCommentContent("");
    setShowComments(false);
  }

  async function handleAddComment(postId) {
    await addCommentToPost(postId, commentContent);
    setCommentContent("");
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Social Media Dapp
            </Typography>
            <Button variant="contained" color="primary" onClick={connectWallet} sx={{ mr: 2 }}>
              Connect Wallet
            </Button>
            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container sx={{ flex: 1, py: 4, overflowY: "auto", width: "100%" }}>
          <Typography variant="body2" gutterBottom>
            Connected Account: {account || "Not connected"}
          </Typography>

          {/* Post Creation Area */}
          <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="secondary" onClick={createPost} startIcon={<SendIcon />}>
              Post
            </Button>
          </Paper>

          {/* Posts List */}
          <Typography variant="h5" gutterBottom>
            Recent Posts
          </Typography>
          <Grid container spacing={3}>
            {posts.map((post, idx) => (
              <Grid item xs={12} md={6} lg={4} key={idx}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.02)" },
                  }}
                  onClick={() => openPostModal(post)}
                >
                  <CardContent>
                    <Typography variant="body1">{post.content}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<FavoriteIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        likePost(post.id);
                      }}
                    >
                      {`Like (${post.likes})`}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ThumbDownAltIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        dislikePost(post.id);
                      }}
                    >
                      {`Dislike (${post.dislikes})`}
                    </Button>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedComments((prev) => ({
                          ...prev,
                          [post.id]: !prev[post.id],
                        }));
                      }}
                    >
                      {expandedComments[post.id] ? "Hide Comments" : "Show Comments"}
                    </Button>
                  </CardActions>
                  {expandedComments[post.id] && (
                    <Box sx={{ p: 2, borderTop: "1px solid #ccc" }}>
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                          <Box key={comment.id} sx={{ mb: 1 }}>
                            <Typography variant="caption" color="textSecondary">
                              {comment.commenter}
                            </Typography>
                            <Typography variant="body2">{comment.content}</Typography>
                            <Typography variant="caption">
                              {`Likes: ${comment.likes} Dislikes: ${comment.dislikes}`}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2">No comments yet</Typography>
                      )}
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Post Details Modal */}
        <Dialog open={modalOpen} onClose={closePostModal} fullWidth maxWidth="sm">
          <DialogTitle>
            Post Details
            <IconButton
              aria-label="close"
              onClick={closePostModal}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedPost && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  {selectedPost.content}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <Button variant="contained" color="primary" onClick={() => likePost(selectedPost.id)}>
                    Like ({selectedPost.likes})
                  </Button>
                  <Button variant="contained" color="error" onClick={() => dislikePost(selectedPost.id)}>
                    Dislike ({selectedPost.dislikes})
                  </Button>
                </Box>

                {/* Toggle Show/Hide Comments in the Modal */}
                <Button variant="text" color="secondary" onClick={() => setShowComments(!showComments)}>
                  {showComments ? "Hide Comments" : "Show Comments"}
                </Button>

                {showComments && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6">Comments</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Write a comment..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleAddComment(selectedPost.id)}
                        sx={{ ml: 2 }}
                      >
                        Add Comment
                      </Button>
                    </Box>
                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                      selectedPost.comments.map((comment) => (
                        <Paper key={comment.id} sx={{ p: 2, mt: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            {comment.commenter}
                          </Typography>
                          <Typography variant="body1">{comment.content}</Typography>
                          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                            <Button
                              variant="text"
                              color="primary"
                              onClick={() => likeComment(selectedPost.id, comment.id)}
                            >
                              Like ({comment.likes})
                            </Button>
                            <Button
                              variant="text"
                              color="error"
                              onClick={() => dislikeComment(selectedPost.id, comment.id)}
                            >
                              Dislike ({comment.dislikes})
                            </Button>
                          </Box>
                        </Paper>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        No comments yet.
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closePostModal} color="secondary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Snackbar for error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
