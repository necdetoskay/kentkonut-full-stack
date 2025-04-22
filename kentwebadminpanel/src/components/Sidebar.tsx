import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ViewCarousel from '@mui/icons-material/ViewCarousel';
import HomeIcon from '@mui/icons-material/Home';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      open={true}
      sx={{
        display: { xs: 'block' },
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          marginTop: '64px', // AppBar yüksekliği
          height: 'calc(100% - 64px)',
          top: 0,
        },
      }}
    >
      <List>
        <ListItem 
          button 
          onClick={() => handleNavigation('/')}
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Ana Sayfa" />
        </ListItem>
        <ListItem 
          button 
          onClick={() => handleNavigation('/carousel')}
        >
          <ListItemIcon>
            <ViewCarousel />
          </ListItemIcon>
          <ListItemText primary="Carousel" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar; 