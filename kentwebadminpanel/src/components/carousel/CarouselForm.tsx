import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { LocalizedText, CarouselItem, CreateCarouselItemRequest, UpdateCarouselItemRequest } from '../../types/carousel.types';
import { ImageUploader } from './ImageUploader';
import { ImageCropper } from './ImageCropper';
import { CropConfig } from '../../types/carousel.types';

const validationSchema = yup.object().shape({
  title: yup.object().shape({
    tr: yup.string().required('Başlık (TR) zorunludur'),
    en: yup.string().required('Başlık (EN) zorunludur'),
  }),
  subtitle: yup.object().shape({
    tr: yup.string().required('Alt başlık (TR) zorunludur'),
    en: yup.string().required('Alt başlık (EN) zorunludur'),
  }),
  button: yup.object().shape({
    text: yup.object().shape({
      tr: yup.string().required('Buton metni (TR) zorunludur'),
      en: yup.string().required('Buton metni (EN) zorunludur'),
    }),
    url: yup.string().required('Buton URL zorunludur'),
  }),
  seoMetadata: yup.object().shape({
    title: yup.object().shape({
      tr: yup.string().required('SEO Başlık (TR) zorunludur'),
      en: yup.string().required('SEO Başlık (EN) zorunludur'),
    }),
    description: yup.object().shape({
      tr: yup.string().required('SEO Açıklama (TR) zorunludur'),
      en: yup.string().required('SEO Açıklama (EN) zorunludur'),
    }),
    altText: yup.object().shape({
      tr: yup.string().required('Alt Metin (TR) zorunludur'),
      en: yup.string().required('Alt Metin (EN) zorunludur'),
    }),
  }),
});

interface CarouselFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCarouselItemRequest | UpdateCarouselItemRequest) => Promise<void>;
  initialData?: CarouselItem;
}

export const CarouselForm: React.FC<CarouselFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCarouselItemRequest | UpdateCarouselItemRequest>({
    resolver: yupResolver(validationSchema),
    defaultValues: initialData || {
      title: { tr: '', en: '' },
      subtitle: { tr: '', en: '' },
      button: {
        text: { tr: '', en: '' },
        url: '',
      },
      seoMetadata: {
        title: { tr: '', en: '' },
        description: { tr: '', en: '' },
        altText: { tr: '', en: '' },
      },
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl);
  };

  const handleFormSubmit = async (data: CreateCarouselItemRequest | UpdateCarouselItemRequest) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData ? t('carousel.editItem') : t('carousel.addItem')}
      </DialogTitle>
      <DialogContent>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={t('carousel.generalInfo')} />
          <Tab label={t('carousel.seo')} />
          <Tab label={t('carousel.image')} />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">{t('carousel.title')}</Typography>
                <TextField
                  fullWidth
                  label={t('carousel.titleTr')}
                  {...register('title.tr')}
                  error={!!errors.title?.tr}
                  helperText={errors.title?.tr?.message}
                />
                <TextField
                  fullWidth
                  label={t('carousel.titleEn')}
                  {...register('title.en')}
                  error={!!errors.title?.en}
                  helperText={errors.title?.en?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">{t('carousel.subtitle')}</Typography>
                <TextField
                  fullWidth
                  label={t('carousel.subtitleTr')}
                  {...register('subtitle.tr')}
                  error={!!errors.subtitle?.tr}
                  helperText={errors.subtitle?.tr?.message}
                />
                <TextField
                  fullWidth
                  label={t('carousel.subtitleEn')}
                  {...register('subtitle.en')}
                  error={!!errors.subtitle?.en}
                  helperText={errors.subtitle?.en?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">{t('carousel.button')}</Typography>
                <TextField
                  fullWidth
                  label={t('carousel.buttonTextTr')}
                  {...register('button.text.tr')}
                  error={!!errors.button?.text?.tr}
                  helperText={errors.button?.text?.tr?.message}
                />
                <TextField
                  fullWidth
                  label={t('carousel.buttonTextEn')}
                  {...register('button.text.en')}
                  error={!!errors.button?.text?.en}
                  helperText={errors.button?.text?.en?.message}
                />
                <TextField
                  fullWidth
                  label={t('carousel.buttonUrl')}
                  {...register('button.url')}
                  error={!!errors.button?.url}
                  helperText={errors.button?.url?.message}
                />
              </Grid>
            </Grid>
          )}
          {activeTab === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">{t('carousel.seoTitle')}</Typography>
                <TextField
                  fullWidth
                  label={t('carousel.seoTitleTr')}
                  {...register('seoMetadata.title.tr')}
                  error={!!errors.seoMetadata?.title?.tr}
                  helperText={errors.seoMetadata?.title?.tr?.message}
                />
                <TextField
                  fullWidth
                  label={t('carousel.seoTitleEn')}
                  {...register('seoMetadata.title.en')}
                  error={!!errors.seoMetadata?.title?.en}
                  helperText={errors.seoMetadata?.title?.en?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">{t('carousel.seoDescription')}</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t('carousel.seoDescriptionTr')}
                  {...register('seoMetadata.description.tr')}
                  error={!!errors.seoMetadata?.description?.tr}
                  helperText={errors.seoMetadata?.description?.tr?.message}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t('carousel.seoDescriptionEn')}
                  {...register('seoMetadata.description.en')}
                  error={!!errors.seoMetadata?.description?.en}
                  helperText={errors.seoMetadata?.description?.en?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">{t('carousel.altText')}</Typography>
                <TextField
                  fullWidth
                  label={t('carousel.altTextTr')}
                  {...register('seoMetadata.altText.tr')}
                  error={!!errors.seoMetadata?.altText?.tr}
                  helperText={errors.seoMetadata?.altText?.tr?.message}
                />
                <TextField
                  fullWidth
                  label={t('carousel.altTextEn')}
                  {...register('seoMetadata.altText.en')}
                  error={!!errors.seoMetadata?.altText?.en}
                  helperText={errors.seoMetadata?.altText?.en?.message}
                />
              </Grid>
            </Grid>
          )}
          {activeTab === 2 && (
            <Box>
              {!selectedImage ? (
                <ImageUploader onImageSelect={handleImageSelect} />
              ) : (
                <ImageCropper
                  image={selectedImage}
                  onCropComplete={handleCropComplete}
                  aspectRatio={16 / 9}
                />
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 