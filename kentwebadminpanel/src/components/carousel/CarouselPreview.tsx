import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { CarouselItem } from '../../types/carousel.types';

interface CarouselPreviewProps {
  item: CarouselItem;
}

export const CarouselPreview: React.FC<CarouselPreviewProps> = ({ item }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={item.imageUrl || 'https://via.placeholder.com/1920x1080/CCCCCC/FFFFFF?text=No+Image'}
        alt={item.seoMetadata?.altText?.tr || item.title?.tr || 'Carousel görseli'}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {item.title?.tr || 'Başlık'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {item.subtitle?.tr || 'Alt başlık'}
        </Typography>
        {item.button && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="primary">
              Buton: {item.button.text?.tr || ''} ({item.button.url || '#'})
            </Typography>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Sıra: {item.order || 0}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Durum: {item.isActive ? 'Aktif' : 'Pasif'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}; 