import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Toolbar, 
  Typography, 
  useTheme 
} from '@mui/material';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const SIDEBAR_WIDTH = 240; // Sidebar genişliği

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Üst menü - Tam genişlikte */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: '100%',
          left: 0,
          right: 0,
          zIndex: theme.zIndex.drawer + 2,
          boxShadow: 3
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            onClick={() => navigate('/')}
            sx={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Kent Konut Yönetim Paneli
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* Sol menü - Kalıcı olarak gösteriliyor */}
      <Sidebar />
      
      {/* Ana içerik - Sidebar'ın yanında */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          marginLeft: { xs: 0, sm: `${SIDEBAR_WIDTH}px` },
          marginTop: '64px', // AppBar yüksekliği
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 