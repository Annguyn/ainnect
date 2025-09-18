import React from 'react';
import { Container, Typography, Box, Grid, Avatar, Card, CardContent } from '@mui/material';

const About: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h2" component="h1" textAlign="center" gutterBottom>
          Giới thiệu về ainnect
        </Typography>
        
        <Typography variant="h5" color="text.secondary" textAlign="center" paragraph>
          Chúng tôi đang xây dựng tương lai của việc kết nối thông minh
        </Typography>

        <Box sx={{ mt: 6, mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Tầm nhìn
          </Typography>
          <Typography variant="body1" paragraph>
            ainnect được sinh ra với mục tiêu tạo ra một nền tảng kết nối thông minh,
            sử dụng sức mạnh của trí tuệ nhân tạo để giúp mọi người tìm thấy những
            kết nối ý nghĩa trong cuộc sống và công việc.
          </Typography>
        </Box>

        <Box sx={{ mt: 6, mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Sứ mệnh
          </Typography>
          <Typography variant="body1" paragraph>
            Chúng tôi tin rằng mỗi người đều có những giá trị độc đáo. Sứ mệnh của 
            chúng tôi là sử dụng công nghệ AI tiên tiến để phân tích, hiểu và kết nối 
            những người có chung quan điểm, sở thích và mục tiêu.
          </Typography>
        </Box>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
            Đội ngũ phát triển
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ textAlign: 'center' }}>
                <CardContent>
                  <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
                    A
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    Thành viên 1
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Frontend Developer
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ textAlign: 'center' }}>
                <CardContent>
                  <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
                    B
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    Thành viên 2
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Backend Developer
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ textAlign: 'center' }}>
                <CardContent>
                  <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
                    C
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    Thành viên 3
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI Engineer
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ textAlign: 'center' }}>
                <CardContent>
                  <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
                    D
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    Thành viên 4
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    UI/UX Designer
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default About;
