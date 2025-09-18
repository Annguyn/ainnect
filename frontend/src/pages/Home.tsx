import React from 'react';
import { Box, Container } from '@mui/material';
import Sidebar from '../components/Sidebar';
import NewsFeed from '../components/NewsFeed';

const Home: React.FC = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb'
    }}>
      {/* Left Sidebar */}
      <Box sx={{ 
        position: 'fixed', 
        left: 0, 
        top: 70, // Height of new AppBar
        width: 280,
        height: 'calc(100vh - 70px)',
        zIndex: 1000,
        overflowY: 'auto'
      }}>
        <Sidebar />
      </Box>

      {/* Main Content Area */}
      <Box sx={{ 
        flexGrow: 1, 
        ml: '280px', // Width of sidebar
        display: 'flex',
        justifyContent: 'center',
        py: 3
      }}>
        <Container maxWidth="lg" sx={{ px: 2 }}>
          <NewsFeed />
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
