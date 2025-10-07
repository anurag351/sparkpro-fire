import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// If using react-router, uncomment below
// import { Link as RouterLink } from "react-router-dom";

export default function ResponsiveNavBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Collapse at md
  const [open, setOpen] = useState(false);

  const toggleDrawer = (state: boolean) => () => setOpen(state);

  const menuItems = [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Join Us", href: "/join" },
    { label: "Login", href: "/login", outlined: true },
  ];

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: "primary.main", boxShadow: 2 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo / Company Name */}
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
          >
            SparkPro Fire Controls Pvt. Ltd.
          </Typography>

          {/* Desktop navigation */}
          {!isMobile && (
            <Box>
              {menuItems.map((item) =>
                item.outlined ? (
                  <Button
                    key={item.href}
                    variant="outlined"
                    color="inherit"
                    href={item.href} // or component={RouterLink} to={item.href}
                    sx={{ ml: 2 }}
                  >
                    {item.label}
                  </Button>
                ) : (
                  <Button
                    key={item.href}
                    color="inherit"
                    href={item.href} // or component={RouterLink} to={item.href}
                    sx={{ mx: 1 }}
                  >
                    {item.label}
                  </Button>
                )
              )}
            </Box>
          )}

          {/* Mobile hamburger menu */}
          {isMobile && (
            <IconButton color="inherit" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile menu */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        transitionDuration={400}
      >
        <Box
          sx={{ width: 250, p: 2 }}
          role="presentation"
          onClick={toggleDrawer(false)}
        >
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component="a" // or component={RouterLink} to={item.href}
                  href={item.href}
                  sx={{ textAlign: "center" }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: item.outlined ? "bold" : undefined,
                      color: item.outlined ? "primary" : "text.primary",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
