import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, DragIndicator } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  fetchCarouselItems,
  createCarouselItem,
  updateCarouselItem,
  deleteCarouselItem,
  updateCarouselOrder,
  uploadCarouselImage,
} from '../../services/carouselService';
import {
  CarouselItem,
  CarouselFormData,
  CreateCarouselItemRequest,
} from '../../types/carousel.types';
import { CarouselForm } from './CarouselForm';

export const CarouselManager: React.FC = () => {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CarouselItem | undefined>(undefined);
  const [reorderMode, setReorderMode] = useState(false);

  // Carousel öğelerini getir
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCarouselItems();
      
      // API'den gelen verileri frontend'in beklediği yapıya dönüştür
      const formattedData = data.map((item: any) => ({
        id: item.id.toString(),
        title: item.title || { tr: '', en: '' },
        subtitle: item.subtitle || { tr: '', en: '' },
        imageUrl: item.image_url || '',
        order: item.order || 0,
        isActive: item.is_active || false,
        button: {
          text: item.button?.text || { tr: '', en: '' },
          url: item.button?.url || '',
        },
        seoMetadata: {
          title: item.seo_metadata?.title || { tr: '', en: '' },
          description: item.seo_metadata?.description || { tr: '', en: '' },
          altText: item.seo_metadata?.altText || { tr: '', en: '' },
        }
      }));
      
      setItems(formattedData.sort((a, b) => a.order - b.order));
    } catch (err) {
      setError('Carousel öğeleri yüklenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Yeni öğe ekle
  const handleAddItem = useCallback(() => {
    setSelectedItem(undefined);
    setFormOpen(true);
  }, []);

  // Öğe düzenle
  const handleEditItem = useCallback((item: CarouselItem) => {
    setSelectedItem(item);
    setFormOpen(true);
  }, []);

  // Form kapatma işleyicisi
  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    // Form kapandıktan sonra seçili öğeyi sıfırla, ama hemen değil
    // Bu, form kapanırken animasyonlarda sorun olmaması için
    setTimeout(() => {
      setSelectedItem(undefined);
    }, 300);
  }, []);

  // Öğe sil
  const handleDeleteItem = useCallback(
    async (id: string) => {
      if (!window.confirm('Bu carousel öğesini silmek istediğinizden emin misiniz?')) {
        return;
      }

      try {
        setLoading(true);
        await deleteCarouselItem(Number(id));
        await loadItems();
      } catch (err) {
        setError('Carousel öğesi silinirken bir hata oluştu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [loadItems]
  );

  // Form gönderimi
  const handleFormSubmit = useCallback(
    async (formData: CarouselFormData) => {
      try {
        setLoading(true);
        setError(null);

        if (selectedItem) {
          // Güncelleme
          const updateData: Partial<CarouselItem> = {
            id: selectedItem.id,
            ...formData.item,
          };
          
          if (formData.imageFile) {
            const uploadResponse = await uploadCarouselImage(formData.imageFile);
            updateData.imageUrl = uploadResponse.imageUrl;
          }
          
          await updateCarouselItem(Number(selectedItem.id), updateData);
        } else {
          // Yeni kayıt
          if (!formData.imageFile) {
            throw new Error('Resim zorunludur');
          }

          const createData: CreateCarouselItemRequest = {
            item: {
              ...formData.item,
            },
            imageFile: formData.imageFile,
          };
          
          await createCarouselItem(createData);
        }

        await loadItems();
        handleFormClose();
      } catch (error) {
        console.error('Form submission error:', error);
        setError(error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    },
    [selectedItem, loadItems, handleFormClose]
  );

  // Sıralama değişikliği
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source } = result;

      // Hedef yok veya kaynak ile aynı
      if (!destination || destination.index === source.index) {
        return;
      }

      // Öğeleri yeniden sırala
      const reorderedItems = Array.from(items);
      const [removed] = reorderedItems.splice(source.index, 1);
      reorderedItems.splice(destination.index, 0, removed);

      // Yeni sıra numaralarını güncelle
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      setItems(updatedItems);

      try {
        // API'yi güncelle
        await updateCarouselOrder(
          updatedItems.map((item) => ({
            id: Number(item.id),
            order: item.order,
          }))
        );
      } catch (err) {
        setError('Sıralama güncellenirken bir hata oluştu.');
        console.error(err);
        await loadItems(); // Hata durumunda listeyi yenile
      }
    },
    [items, loadItems]
  );

  // Yükleniyor durumu için özel bileşen
  const renderLoading = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Carousel Yönetimi
        </Typography>
        <Box>
          {reorderMode ? (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setReorderMode(false)}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Sıralama Modunu Kapat
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setReorderMode(true)}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Sıralama Modu
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            disabled={loading}
          >
            Yeni Öğe Ekle
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && !items.length ? (
        renderLoading()
      ) : (
        <Paper elevation={2} sx={{ overflow: 'hidden' }}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="carousel-items" direction="vertical">
              {(provided) => (
                <List 
                  dense 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}
                >
                  {items.length === 0 ? (
                    <ListItem>
                      <ListItemText 
                        primary="Henüz carousel öğesi yok" 
                        secondary="Carousel öğesi eklemek için 'Yeni Öğe Ekle' butonuna tıklayın" 
                      />
                    </ListItem>
                  ) : (
                    items.map((item, index) => (
                      <Draggable
                        key={item.id?.toString() || `temp-${index}`}
                        draggableId={item.id?.toString() || `temp-${index}`}
                        index={index}
                        isDragDisabled={!reorderMode || loading}
                      >
                        {(provided) => (
                          <React.Fragment>
                            <ListItem
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              secondaryAction={
                                <Box sx={{ display: 'flex' }}>
                                  <Tooltip title="Düzenle">
                                    <IconButton
                                      edge="end"
                                      onClick={() => handleEditItem(item)}
                                      aria-label="düzenle"
                                      disabled={loading}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Sil">
                                    <IconButton
                                      edge="end"
                                      onClick={() => handleDeleteItem(item.id as string)}
                                      aria-label="sil"
                                      color="error"
                                      sx={{ ml: 1 }}
                                      disabled={loading}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              }
                              sx={{ 
                                py: 2,
                                opacity: item.isActive ? 1 : 0.6,
                                '&:hover': {
                                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                                }
                              }}
                            >
                              {reorderMode && (
                                <Box
                                  {...provided.dragHandleProps}
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    mr: 2,
                                    cursor: 'grab'
                                  }}
                                >
                                  <DragIndicator color="action" />
                                </Box>
                              )}
                              <ListItemAvatar>
                                <Avatar 
                                  variant="rounded" 
                                  src={item.imageUrl || 'https://via.placeholder.com/100x100'} 
                                  alt={item.title?.tr || 'Carousel görseli'} 
                                  sx={{ width: 80, height: 60, mr: 1 }}
                                />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {item.title?.tr || 'Başlık yok'}
                                  </Typography>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                      {item.subtitle?.tr || 'Alt başlık yok'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                                        Sıra: {item.order || 0}
                                      </Typography>
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          color: item.isActive ? 'success.main' : 'text.disabled',
                                          fontWeight: 'medium' 
                                        }}
                                      >
                                        {item.isActive ? 'Aktif' : 'Pasif'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < items.length - 1 && <Divider />}
                          </React.Fragment>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </Paper>
      )}

      {/* Carousel Formu */}
      <CarouselForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedItem}
      />
      
      {/* Sayfa üzerinde yükleniyor göstergesi */}
      {loading && items.length > 0 && (
        <Box 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1300,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}
    </Box>
  );
};