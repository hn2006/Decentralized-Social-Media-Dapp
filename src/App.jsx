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
import CloseIcon from "@mui/icons-material/Close";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

export default function SocialDapp() {
  const [posts, setPosts] = useState([]);
  const [account, setAccount] = useState("");
  const [content, setContent] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
      const provider = new ethers.JsonRpcProvider(
        process.env.REACT_APP_ALCHEMY_URL
      );
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
      await tx.wait(); // Wait for the transaction to be confirmed
      setContent("");
      loadPosts();
    } catch (err) {
      setError(err.message);
      setOpenSnackbar(true);
    }
  }

  async function likePost(id) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.likePost(id);
      await tx.wait(); // Wait for the transaction to be confirmed
      loadPosts();
    } catch (err) {
      setError(err.message);
      setOpenSnackbar(true);
    }
  }

  function openPostModal(post) {
    setSelectedPost(post);
    setModalOpen(true);
  }

  function closePostModal() {
    setSelectedPost(null);
    setModalOpen(false);
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Outer container taking full width & height */}
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
                  </CardActions>
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
              <Typography variant="body1" gutterBottom>
                {selectedPost.content}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                likePost(selectedPost.id);
                closePostModal();
              }}
              startIcon={<FavoriteIcon />}
              color="primary"
              variant="contained"
            >
              Like ({selectedPost ? selectedPost.likes : 0})
            </Button>
            <Button onClick={closePostModal} color="secondary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* Snackbar for displaying error messages */}
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
