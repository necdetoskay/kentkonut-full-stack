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
  CircularProgress,
  Paper, // Added Paper for better visual separation
  FormControlLabel, // Added for Checkbox
  Switch, // Changed from Checkbox for better toggle UI
  Select, // Added for device visibility
  MenuItem, // Added for Select options
  FormControl, // Added for Select
  InputLabel, // Added for Select
} from '@mui/material';
import { LoadingButton } from '@mui/lab'; // Import LoadingButton
import { CarouselItem } from '../../types/carousel.types'; // Adjusted path
import { ImageUploader } from './ImageUploader';
// import { ImageCropper } from './ImageCropper'; // Assuming ImageCropper is in the same directory - Removed if not used directly here

// Define the validation schema
const validationSchema = yup.object().shape({
  item: yup.object().shape({
    title: yup.object().shape({
      tr: yup.string().required('Başlık (TR) zorunludur'),
      en: yup.string().required('Başlık (EN) zorunludur'),
    }),
    subtitle: yup.object().shape({
      tr: yup.string(),
      en: yup.string(),
    }),
    button: yup.object().shape({
      text: yup.object().shape({
        tr: yup.string(),
        en: yup.string(),
      }),
      url: yup.string().url('Geçerli bir URL giriniz').nullable(), // Allow null URL
    }).nullable(),
    seoMetadata: yup.object().shape({
      title: yup.object().shape({
        tr: yup.string(),
        en: yup.string(),
      }),
      description: yup.object().shape({
        tr: yup.string(),
        en: yup.string(),
      }),
      altText: yup.object().shape({
        tr: yup.string(),
        en: yup.string(),
      }),
    }),
    isActive: yup.boolean(),
    order: yup.number().integer('Sıra tam sayı olmalıdır').min(0, 'Sıra negatif olamaz').typeError('Sıra sayısal bir değer olmalıdır'),
    timing: yup.object().shape({ // Added timing validation
      display_duration: yup.number()
        .integer('Süre tam sayı olmalıdır')
        .min(1000, 'Süre en az 1000ms olmalıdır') // Minimum duration 1 second
        .typeError('Süre sayısal bir değer olmalıdır') // Ensure it's a number
        .required('Gösterilme süresi zorunludur'),
    }),
-   startDate: yup.date().nullable().typeError('Geçerli bir başlangıç tarihi giriniz'),
-   endDate: yup.date().nullable().typeError('Geçerli bir bitiş tarihi giriniz')
+   // Use string for date inputs, allow null or empty string
+   startDate: yup.string().nullable().matches(/^(\d{4}-\d{2}-\d{2})?$/, 'Geçerli bir tarih formatı giriniz (YYYY-MM-DD)').transform((curr, orig) => orig === '' ? null : curr),
+   endDate: yup.string().nullable().matches(/^(\d{4}-\d{2}-\d{2})?$/, 'Geçerli bir tarih formatı giriniz (YYYY-MM-DD)').transform((curr, orig) => orig === '' ? null : curr)
      .min(yup.ref('startDate'), 'Bitiş tarihi başlangıç tarihinden önce olamaz'),
    deviceVisibility: yup.string().oneOf(['all', 'mobile', 'desktop'], 'Geçersiz cihaz görünürlüğü').default('all'),
  }),
});

// Define the form data type based on CarouselItem and potential additions
interface CarouselFormData {
  item: Omit<CarouselItem, 'id' | 'imageUrl'> & { // Omit fields managed outside the form
    timing?: { // Make timing optional initially if needed
      display_duration: number;
    };
    startDate?: Date | null; // Use Date for consistency with yup
    endDate?: Date | null;   // Use Date for consistency with yup
    deviceVisibility?: 'all' | 'mobile' | 'desktop';
  };
  imageFile?: File; // For handling the new image upload
}

interface CarouselFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CarouselFormData) => Promise<void>;
  initialData?: CarouselItem | null;
}

// Helper to format date for input type="date"
const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    // Check if the date is valid before formatting
    if (isNaN(d.getTime())) return '';
    // Format as YYYY-MM-DD
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return '';
  }
};

// Helper to parse date string into Date object
- // Helper to parse date string into Date object
- const parseDateString = (dateString: string | null | undefined): Date | null => {
-   if (!dateString) return null;
-   try {
-     const date = new Date(dateString);
-     return isNaN(date.getTime()) ? null : date;
-   } catch (e) {
-     return null;
-   }
- };
-
export const CarouselForm: React.FC<CarouselFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [cropperImgSrc, setCropperImgSrc] = useState<string | null>(null);
  const [showCropTool, setShowCropTool] = useState(false);
  const [croppedImageData, setCroppedImageData] = useState<{ file: File; url: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control, // Add control for Select component
    watch // Watch values if needed
  } = useForm<CarouselFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      item: {
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
        isActive: true,
        order: 0,
        timing: { // Added default timing
          display_duration: 5000, // Default to 5 seconds (5000ms)
        },
        startDate: null,
        endDate: null,
        deviceVisibility: 'all',
      },
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        item: {
          ...initialData,
          button: initialData.button || { text: { tr: '', en: '' }, url: '' },
          timing: initialData.timing || { display_duration: 5000 }, // Reset timing
          seoMetadata: initialData.seoMetadata || { title: { tr: '', en: '' }, description: { tr: '', en: '' }, altText: { tr: '', en: '' } },
          // Parse string dates from initialData into Date objects
          startDate: parseDateString(initialData.startDate),
          endDate: parseDateString(initialData.endDate),
          deviceVisibility: initialData.deviceVisibility || 'all',
        },
      });
      if (initialData.imageUrl) {
        setCropperImgSrc(initialData.imageUrl);
        setCroppedImageData(null); // Reset cropped image data when initial data loads
      } else {
        setCropperImgSrc(null);
        setCroppedImageData(null);
      }
    } else {
      // Reset form to default values when adding a new item
      reset({
        item: {
          title: { tr: '', en: '' },
          subtitle: { tr: '', en: '' },
          button: { text: { tr: '', en: '' }, url: '' },
          seoMetadata: { title: { tr: '', en: '' }, description: { tr: '', en: '' }, altText: { tr: '', en: '' } },
          isActive: true,
          order: 0,
          timing: { display_duration: 5000 },
          startDate: null,
          endDate: null,
          deviceVisibility: 'all',
        },
      });
      setCropperImgSrc(null);
      setCroppedImageData(null);
    }
  }, [initialData, reset]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleImageCropped = (imageData: { file: File; url: string } | null) => {
    if (imageData) {
      setCroppedImageData(imageData);
      setCropperImgSrc(imageData.url); // Update preview with cropped image URL
      setShowCropTool(false);
    } else {
      // Handle case where cropping is cancelled or fails
      setCroppedImageData(null);
      // Optionally revert cropperImgSrc if needed, or keep the original upload
    }
  };

  const handleFormSubmit = async (data: CarouselFormData) => {
    try {
      setIsLoading(true);
      // Ensure dates are null if empty string, otherwise keep as string for API
      const submissionData: CarouselFormData = {
        ...data,
        item: {
          ...data.item,
          // Convert Date objects back to string format if needed by API, or pass as Date
          // Assuming API expects YYYY-MM-DD string or null
          startDate: data.item.startDate ? formatDateForInput(data.item.startDate) : null,
          endDate: data.item.endDate ? formatDateForInput(data.item.endDate) : null,
        },
        imageFile: croppedImageData?.file,
      };
      await onSubmit(submissionData);
      onClose(); // Close dialog on success
    } catch (error) {
      console.error('Form submission error:', error);
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle closing the dialog
  const handleCloseDialog = () => {
    reset(); // Reset form state
    setCropperImgSrc(null);
    setCroppedImageData(null);
    setShowCropTool(false);
    setActiveTab(0);
    onClose(); // Call the original onClose handler
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData ? t('carousel.editItem', 'Karusel Öğesi Düzenle') : t('carousel.addItem', 'Karusel Öğesi Ekle')}
      </DialogTitle>
      <DialogContent>
        {/* Added Paper for better tab container styling */}
        <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
            <Tab label={t('carousel.generalInfoTab', 'Genel Bilgiler')} />
            <Tab label={t('carousel.seoTab', 'SEO')} />
            <Tab label={t('carousel.imageTab', 'Görsel')} />
            <Tab label={t('carousel.settingsTab', 'Ayarlar')} /> {/* Updated Tab Label */}
          </Tabs>
        </Paper>
        <Box sx={{ pt: 2, pb: 2 }}> {/* Added padding top and bottom */}
          {activeTab === 0 && (
            <Grid container spacing={3}> {/* Increased spacing */}
              <Grid item xs={12} md={6}> {/* Use md for medium screens */}
                <Typography variant="h6" gutterBottom>{t('carousel.title', 'Başlık')}</Typography> {/* Use h6 for section title */}
                <TextField
                  fullWidth
                  variant="outlined" // Explicitly set variant
                  label={t('carousel.titleTr', 'Başlık (TR)')}
                  {...register('item.title.tr')}
                  error={!!errors.item?.title?.tr}
                  helperText={errors.item?.title?.tr?.message}
                  sx={{ mb: 2 }} // Increased margin bottom
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  label={t('carousel.titleEn', 'Başlık (EN)')}
                  {...register('item.title.en')}
                  error={!!errors.item?.title?.en}
                  helperText={errors.item?.title?.en?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>{t('carousel.subtitle', 'Alt Başlık')}</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  label={t('carousel.subtitleTr', 'Alt Başlık (TR)')}
                  {...register('item.subtitle.tr')}
                  error={!!errors.item?.subtitle?.tr}
                  helperText={errors.item?.subtitle?.tr?.message}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  label={t('carousel.subtitleEn', 'Alt Başlık (EN)')}
                  {...register('item.subtitle.en')}
                  error={!!errors.item?.subtitle?.en}
                  helperText={errors.item?.subtitle?.en?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>{t('carousel.button', 'Buton')}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label={t('carousel.buttonTextTr', 'Buton Metni (TR)')}
                  {...register('item.button.text.tr')}
                  error={!!errors.item?.button?.text?.tr}
                  helperText={errors.item?.button?.text?.tr?.message}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  label={t('carousel.buttonTextEn', 'Buton Metni (EN)')}
                  {...register('item.button.text.en')}
                  error={!!errors.item?.button?.text?.en}
                  helperText={errors.item?.button?.text?.en?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label={t('carousel.buttonUrl', 'Buton URL')}
                  {...register('item.button.url')}
                  error={!!errors.item?.button?.url}
                  helperText={errors.item?.button?.url?.message}
                />
              </Grid>
            </Grid>
          )}
          {activeTab === 1 && (
            <Grid container spacing={3}> {/* Increased spacing */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>{t('carousel.seoTitle', 'SEO Başlık')}</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  label={t('carousel.seoTitleTr', 'SEO Başlık (TR)')}
                  {...register('item.seoMetadata.title.tr')}
                  error={!!errors.item?.seoMetadata?.title?.tr}
                  helperText={errors.item?.seoMetadata?.title?.tr?.message}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  label={t('carousel.seoTitleEn', 'SEO Başlık (EN)')}
                  {...register('item.seoMetadata.title.en')}
                  error={!!errors.item?.seoMetadata?.title?.en}
                  helperText={errors.item?.seoMetadata?.title?.en?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>{t('carousel.seoDescription', 'SEO Açıklama')}</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4} // Adjusted rows
                  variant="outlined"
                  label={t('carousel.seoDescriptionTr', 'SEO Açıklama (TR)')}
                  {...register('item.seoMetadata.description.tr')}
                  error={!!errors.item?.seoMetadata?.description?.tr}
                  helperText={errors.item?.seoMetadata?.description?.tr?.message}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4} // Adjusted rows
                  variant="outlined"
                  label={t('carousel.seoDescriptionEn', 'SEO Açıklama (EN)')}
                  {...register('item.seoMetadata.description.en')}
                  error={!!errors.item?.seoMetadata?.description?.en}
                  helperText={errors.item?.seoMetadata?.description?.en?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>{t('carousel.altText', 'Alternatif Metin (Görsel için)')}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label={t('carousel.altTextTr', 'Alternatif Metin (TR)')}
                  {...register('item.seoMetadata.altText.tr')}
                  error={!!errors.item?.seoMetadata?.altText?.tr}
                  helperText={errors.item?.seoMetadata?.altText?.tr?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label={t('carousel.altTextEn', 'Alternatif Metin (EN)')}
                  {...register('item.seoMetadata.altText.en')}
                  error={!!errors.item?.seoMetadata?.altText?.en}
                  helperText={errors.item?.seoMetadata?.altText?.en?.message}
                />
              </Grid>
            </Grid>
          )}
          {activeTab === 2 && (
            <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 1 }}> {/* Added padding and border */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>{t('carousel.imageUpload', 'Görsel Yükleme')}</Typography>
              <ImageUploader
                cropperImgSrc={cropperImgSrc}
                displayImageUrl={croppedImageData?.url || initialData?.imageUrl || null}
                showCropTool={showCropTool}
                onImageCropped={handleImageCropped}
                onSetCropperImgSrc={setCropperImgSrc}
                onSetShowCropTool={setShowCropTool}
                onSetCroppedImageData={setCroppedImageData} // Pass setter for reset
                aspectRatio={16 / 9}
              />
              {/* Display error if image is required and not provided */} 
              {/* {!initialData && !croppedImageData && errors.imageFile && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {errors.imageFile.message}
                </Typography>
              )} */} 
            </Box>
          )}
          {/* Updated Settings Tab Content */} 
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}> {/* Adjusted grid size */}
                <Typography variant="h6" gutterBottom>{t('carousel.order', 'Sıra')}</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  label={t('carousel.order', 'Sıra')}
                  type="number"
                  {...register('item.order')}
                  error={!!errors.item?.order}
                  helperText={errors.item?.order?.message}
                  InputProps={{ inputProps: { min: 0 } }} // Ensure non-negative in UI
                />
              </Grid>
              <Grid item xs={12} md={4}> {/* Adjusted grid size */}
                <Typography variant="h6" gutterBottom>{t('carousel.displayDuration', 'Gösterilme Süresi (ms)')}</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  label={t('carousel.displayDuration', 'Gösterilme Süresi (ms)')} // New Field
                  type="number"
                  {...register('item.timing.display_duration')}
                  error={!!errors.item?.timing?.display_duration}
                  helperText={errors.item?.timing?.display_duration?.message}
                  InputProps={{ inputProps: { min: 1000, step: 100 } }} // Ensure min 1000ms
                />
              </Grid>
              <Grid item xs={12} md={4}> {/* Adjusted grid size */}
                <Typography variant="h6" gutterBottom>{t('carousel.deviceVisibility', 'Cihaz Görünürlüğü')}</Typography>
                <FormControl fullWidth variant="outlined" error={!!errors.item?.deviceVisibility}>
                  <InputLabel id="device-visibility-label">{t('carousel.deviceVisibility', 'Cihaz Görünürlüğü')}</InputLabel>
                  <Select
                    labelId="device-visibility-label"
                    label={t('carousel.deviceVisibility', 'Cihaz Görünürlüğü')}
                    defaultValue="all" // Set default value
                    {...register('item.deviceVisibility')}
                  >
                    <MenuItem value="all">{t('carousel.visibilityAll', 'Tümü')}</MenuItem>
                    <MenuItem value="mobile">{t('carousel.visibilityMobile', 'Sadece Mobil')}</MenuItem>
                    <MenuItem value="desktop">{t('carousel.visibilityDesktop', 'Sadece Masaüstü')}</MenuItem>
                  </Select>
                  {errors.item?.deviceVisibility && <Typography color="error" variant="caption">{errors.item.deviceVisibility.message}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>{t('carousel.startDate', 'Başlangıç Tarihi')}</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  // label={t('carousel.startDate', 'Başlangıç Tarihi')} // Label provided by type="date"
                  type="date"
                  InputLabelProps={{ shrink: true }} // Keep label shrunk for date type
                  {...register('item.startDate')}
                  error={!!errors.item?.startDate}
                  helperText={errors.item?.startDate?.message}
                  // Convert Date object to YYYY-MM-DD string for input value
                  value={watch('item.startDate') ? formatDateForInput(watch('item.startDate')) : ''}
                  onChange={(e) => {
                    const date = parseDateString(e.target.value);
                    // Need setValue from useForm to update the form state correctly
                    // This requires adding setValue to the useForm destructuring
                    // setValue('item.startDate', date);
                    // For now, let react-hook-form handle it via register
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>{t('carousel.endDate', 'Bitiş Tarihi')}</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  // label={t('carousel.endDate', 'Bitiş Tarihi')} // Label provided by type="date"
                  type="date"
                  InputLabelProps={{ shrink: true }} // Keep label shrunk for date type
                  {...register('item.endDate')}
                  error={!!errors.item?.endDate}
                  helperText={errors.item?.endDate?.message}
                  // Convert Date object to YYYY-MM-DD string for input value
                  value={watch('item.endDate') ? formatDateForInput(watch('item.endDate')) : ''}
                  onChange={(e) => {
                    const date = parseDateString(e.target.value);
                    // Need setValue from useForm to update the form state correctly
                    // setValue('item.endDate', date);
                     // For now, let react-hook-form handle it via register
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch {...register('item.isActive')} defaultChecked={initialData?.isActive ?? true} />}
                  label={t('carousel.active', 'Aktif')}
                />
              </Grid>
            </Grid>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px' }}> {/* Added padding */}
        <Button onClick={handleCloseDialog} color="secondary" variant="outlined">{t('common.cancel', 'İptal')}</Button> {/* Use common key */}
        <LoadingButton
          onClick={handleSubmit(handleFormSubmit)}
          loading={isLoading}
          variant="contained"
          color="primary"
        >
          {initialData ? t('common.saveChanges', 'Değişiklikleri Kaydet') : t('common.save', 'Kaydet')} {/* Differentiate button text */}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};