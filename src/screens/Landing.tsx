import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from "@mui/material";
import AnuragPic from "../pics/mypic.jpg";
const Landing: React.FC = () => {
  return (
    <>
      {/* Navbar */}
      <AppBar position="sticky" sx={{ bgcolor: "primary.main", boxShadow: 2 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            SparkPro Fire Controls Pvt. Ltd.
          </Typography>
          <Box>
            <Button color="inherit" sx={{ mx: 1 }}>
              About Us
            </Button>
            <Button color="inherit" sx={{ mx: 1 }}>
              Contact Us
            </Button>
            <Button color="inherit" sx={{ mx: 1 }}>
              Join Us
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              href="/login"
              sx={{ ml: 2 }}
            >
              Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        {/* Company Intro */}
        <Card elevation={6} sx={{ mb: 5, borderRadius: 3 }}>
          <CardContent sx={{ textAlign: "center", p: 5 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold" }}>
              SparkPro Fire Controls Pvt. Ltd.
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Innovation. Safety. Commitment.
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body1" sx={{ textAlign: "justify" }}>
              SparkPro Fire Controls Pvt. Ltd. is committed to providing
              world-class fire safety and control solutions to industries,
              businesses, and communities. With innovation at the heart of our
              operations, we design and deploy reliable, cutting-edge fire
              prevention and safety systems...
              <br />
              <br />
              (Dummy 500 words company description continues here. This section
              will describe the company’s vision, mission, services, and
              achievements in detail.)
            </Typography>
          </CardContent>
        </Card>

        {/* Founders */}
        <Card elevation={6} sx={{ mb: 5, borderRadius: 3 }}>
          <CardContent>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ textAlign: "center", fontWeight: "bold" }}
            >
              Our Co-Founders
            </Typography>
            <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
              {[
                {
                  name: "Anurag Kumar",
                  role: "Co-Founder & Managing Director",
                  image: AnuragPic,
                },
                {
                  name: "Ravi Sharma",
                  role: "Co-Founder & Technical Director",
                  image: "https://via.placeholder.com/250",
                },
                {
                  name: "Neha Verma",
                  role: "Co-Founder & Operations Head",
                  image: "https://via.placeholder.com/250",
                },
              ].map((cf, i) => (
                <Grid item xs={12} sm={6} md={4} key={i} {...({} as any)}>
                  <Card sx={{ textAlign: "center", boxShadow: 3 }}>
                    <CardMedia
                      component="img"
                      height="400"
                      image={cf.image || "src/pics/mypic.jpg"}
                      alt={cf.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{cf.name}</Typography>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        gutterBottom
                      >
                        {cf.role}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontStyle: "italic", color: "text.secondary" }}
                      >
                        "Innovation and safety must go hand in hand."
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card elevation={6} sx={{ mb: 5, borderRadius: 3 }}>
          <CardContent>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ textAlign: "center", fontWeight: "bold" }}
            >
              Our Projects
            </Typography>
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {[
                {
                  title: "Smart Fire Alarm System",
                  desc: "Designed and implemented an IoT-enabled fire alarm system for industrial facilities.",
                },
                {
                  title: "Automatic Sprinkler Control",
                  desc: "Deployed intelligent sprinkler systems with AI-based fire detection.",
                },
                {
                  title: "Community Fire Safety Program",
                  desc: "Conducted awareness campaigns and safety solutions for residential areas.",
                },
              ].map((proj, i) => (
                <Grid item xs={12} sm={6} md={4} key={i} {...({} as any)}>
                  <Card sx={{ height: "100%", boxShadow: 2 }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        {proj.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {proj.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Footer-like Card */}
        <Card elevation={4} sx={{ borderRadius: 3, bgcolor: "grey.100", p: 3 }}>
          <Typography align="center" color="text.secondary">
            © {new Date().getFullYear()} SparkPro Fire Controls Pvt. Ltd. | All
            Rights Reserved
          </Typography>
        </Card>
      </Container>
    </>
  );
};

export default Landing;
