import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          © {new Date().getFullYear()} ainnect. Tất cả quyền được bảo lưu.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Nền tảng kết nối thông minh được xây dựng với React & TypeScript
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
