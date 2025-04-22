const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const morgan = require('morgan');

// Ortam değişkenlerini ve konfigürasyonu görüntüle
console.log('=== ORTAM DEĞİŞKENLERİ ===');
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Ayarlandı' : 'Ayarlanmadı');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

// Configure environment variables
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'xK9#mP2$vL5@nR8*qW3&jH6%tY4^cF7';
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Configure PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'kentwebadmin',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Create Express app
const app = express();

// CORS ayarlarını genişlet
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('combined'));

// Her istek için CORS başlıklarını ekle
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Health check endpoint - HEM ESKİ HEM YENİ ENDPOİNTLER
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Register endpoint - HEM ESKİ HEM YENİ ENDPOİNTLER
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    console.log('===== REGISTER İSTEĞİ ALINDI (ESKİ ENDPOINT) =====');
    console.log('İstek detayları:', {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
    
    const { first_name, last_name, email, password } = req.body;
    
    if (!first_name || !last_name || !email || !password) {
      console.error('HATA: Eksik alanlar -', { 
        first_name: !!first_name, 
        last_name: !!last_name, 
        email: !!email, 
        password: !!password 
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Tüm alanlar gereklidir' 
      });
    }
    
    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('HATA: Email zaten kullanımda -', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Email zaten kullanımda' 
      });
    }
    
    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    
    // Create user in DB
    const createUserQuery = `
      INSERT INTO users (first_name, last_name, email, password, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, first_name, last_name, email, status
    `;
    
    console.log('Kullanıcı tablosunu kontrol ediliyor/oluşturuluyor...');
    // Check if the users table exists, if not, create it
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Kullanıcı oluşturuluyor...');
    const result = await pool.query(createUserQuery, [
      first_name, 
      last_name, 
      email, 
      hashedPassword,
      'active'
    ]);
    
    const user = result.rows[0];
    console.log('BAŞARILI: Kullanıcı oluşturuldu -', {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status
    });
    
    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRATION }
    );
    
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRATION }
    );
    
    return res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla kaydedildi',
      data: {
        accessToken,
        refreshToken,
        user
      }
    });
  } catch (error) {
    console.error('REGISTER HATASI:', error);
    console.error('Hata detayları:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({
      success: false,
      message: 'Kayıt sırasında bir hata oluştu',
      error: error.message
    });
  }
});

// YENİ REGISTER ENDPOINT
app.post('/auth/register', async (req, res) => {
  try {
    console.log('===== REGISTER İSTEĞİ ALINDI (YENİ ENDPOINT) =====');
    console.log('İstek detayları:', {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
    
    const { first_name, last_name, email, password } = req.body;
    
    if (!first_name || !last_name || !email || !password) {
      console.error('HATA: Eksik alanlar -', { 
        first_name: !!first_name, 
        last_name: !!last_name, 
        email: !!email, 
        password: !!password 
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Tüm alanlar gereklidir' 
      });
    }
    
    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('HATA: Email zaten kullanımda -', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Email zaten kullanımda' 
      });
    }
    
    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    
    // Create user in DB
    const createUserQuery = `
      INSERT INTO users (first_name, last_name, email, password, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, first_name, last_name, email, status
    `;
    
    console.log('Kullanıcı tablosunu kontrol ediliyor/oluşturuluyor...');
    // Check if the users table exists, if not, create it
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Kullanıcı oluşturuluyor...');
    const result = await pool.query(createUserQuery, [
      first_name, 
      last_name, 
      email, 
      hashedPassword,
      'active'
    ]);
    
    const user = result.rows[0];
    console.log('BAŞARILI: Kullanıcı oluşturuldu -', {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status
    });
    
    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRATION }
    );
    
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRATION }
    );
    
    return res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla kaydedildi',
      data: {
        accessToken,
        refreshToken,
        user
      }
    });
  } catch (error) {
    console.error('REGISTER HATASI:', error);
    console.error('Hata detayları:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({
      success: false,
      message: 'Kayıt sırasında bir hata oluştu',
      error: error.message
    });
  }
});

// Aynı şekilde login ve me endpointlerini de güncelle
// Login endpoint - HEM ESKİ HEM YENİ ENDPOİNTLER
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    console.log('===== LOGIN İSTEĞİ ALINDI (ESKİ ENDPOINT) =====');
    console.log('İstek detayları:', {
      email: req.body.email,
      // Güvenlik için şifreyi log'a yazmıyoruz
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
    
    const { email, password } = req.body;
    
    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.log('HATA: Kullanıcı bulunamadı -', email);
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kimlik bilgileri'
      });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      console.log('HATA: Geçersiz şifre -', email);
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kimlik bilgileri'
      });
    }
    
    console.log('BAŞARILI: Giriş başarılı -', email);
    console.log('Kullanıcı bilgileri:', {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status
    });
    
    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRATION }
    );
    
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRATION }
    );
    
    // Remove password from response
    delete user.password;
    
    return res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        accessToken,
        refreshToken,
        user
      }
    });
  } catch (error) {
    console.error('LOGIN HATASI:', error);
    console.error('Hata detayları:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu',
      error: error.message
    });
  }
});

// YENİ LOGIN ENDPOINT
app.post('/auth/login', async (req, res) => {
  try {
    console.log('===== LOGIN İSTEĞİ ALINDI (YENİ ENDPOINT) =====');
    console.log('İstek detayları:', {
      email: req.body.email,
      // Güvenlik için şifreyi log'a yazmıyoruz
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
    
    const { email, password } = req.body;
    
    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.log('HATA: Kullanıcı bulunamadı -', email);
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kimlik bilgileri'
      });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      console.log('HATA: Geçersiz şifre -', email);
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kimlik bilgileri'
      });
    }
    
    console.log('BAŞARILI: Giriş başarılı -', email);
    console.log('Kullanıcı bilgileri:', {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status
    });
    
    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRATION }
    );
    
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRATION }
    );
    
    // Remove password from response
    delete user.password;
    
    return res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        accessToken,
        refreshToken,
        user
      }
    });
  } catch (error) {
    console.error('LOGIN HATASI:', error);
    console.error('Hata detayları:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu',
      error: error.message
    });
  }
});

// Get current user - HEM ESKİ HEM YENİ ENDPOİNTLER
app.get('/api/v1/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Kimlik doğrulama hatası'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const result = await pool.query('SELECT id, first_name, last_name, email, status FROM users WHERE id = $1', [decoded.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }
      
      const user = result.rows[0];
      
      return res.json({
        success: true,
        data: {
          user
        }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Me hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Bir hata oluştu',
      error: error.message
    });
  }
});

// YENİ ME ENDPOINT
app.get('/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Kimlik doğrulama hatası'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const result = await pool.query('SELECT id, first_name, last_name, email, status FROM users WHERE id = $1', [decoded.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }
      
      const user = result.rows[0];
      
      return res.json({
        success: true,
        data: {
          user
        }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Me hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Bir hata oluştu',
      error: error.message
    });
  }
});

// Carousel API rotaları
app.get('/api/carousel', async (req, res) => {
  try {
    console.log('Carousel öğeleri alınıyor...');
    
    // Önce mevcut tabloyu düşürelim ve yeniden oluşturalım (geliştirme için)
    try {
      await pool.query('DROP TABLE IF EXISTS carousel_items');
      console.log('Carousel tablosu silindi, yeniden oluşturuluyor...');
    } catch (err) {
      console.error('Tablo düşürülürken hata:', err);
      // Hatayı görmezden gel, yeni tablo oluşturmaya devam et
    }
    
    // Carousel tablosunu oluştur/kontrol et
    await pool.query(`
      CREATE TABLE IF NOT EXISTS carousel_items (
        id SERIAL PRIMARY KEY,
        title JSONB NOT NULL DEFAULT '{"tr": "", "en": ""}',
        subtitle JSONB NOT NULL DEFAULT '{"tr": "", "en": ""}',
        button JSONB NOT NULL DEFAULT '{"text": {"tr": "", "en": ""}, "url": ""}',
        image_url TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        seo_metadata JSONB NOT NULL DEFAULT '{"title": {"tr": "", "en": ""}, "description": {"tr": "", "en": ""}, "altText": {"tr": "", "en": ""}}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Test verisi ekleyelim
    try {
      await pool.query(`
        INSERT INTO carousel_items (title, subtitle, button, image_url, "order", is_active, seo_metadata)
        VALUES 
          ('{"tr": "Örnek Başlık 1", "en": "Sample Title 1"}', 
           '{"tr": "Örnek Altbaşlık 1", "en": "Sample Subtitle 1"}',
           '{"text": {"tr": "Daha Fazla", "en": "Learn More"}, "url": "/sample1"}',
           'https://via.placeholder.com/1920x1080/FF5733/FFFFFF?text=Sample+1',
           1,
           true,
           '{"title": {"tr": "SEO Başlık 1", "en": "SEO Title 1"}, "description": {"tr": "SEO Açıklama 1", "en": "SEO Description 1"}, "altText": {"tr": "Alt Metin 1", "en": "Alt Text 1"}}'),
          
          ('{"tr": "Örnek Başlık 2", "en": "Sample Title 2"}', 
           '{"tr": "Örnek Altbaşlık 2", "en": "Sample Subtitle 2"}',
           '{"text": {"tr": "Keşfet", "en": "Explore"}, "url": "/sample2"}',
           'https://via.placeholder.com/1920x1080/3498DB/FFFFFF?text=Sample+2',
           2,
           true,
           '{"title": {"tr": "SEO Başlık 2", "en": "SEO Title 2"}, "description": {"tr": "SEO Açıklama 2", "en": "SEO Description 2"}, "altText": {"tr": "Alt Metin 2", "en": "Alt Text 2"}}')
      `);
      console.log('Örnek carousel öğeleri eklendi');
    } catch (err) {
      console.error('Örnek veriler eklenirken hata:', err);
      // Hatayı görmezden gel, devam et
    }
    
    const result = await pool.query('SELECT * FROM carousel_items ORDER BY "order" ASC');
    
    return res.json(result.rows);
  } catch (error) {
    console.error('Carousel öğeleri alınırken hata:', error);
    return res.status(500).json({
      success: false,
      message: 'Carousel öğeleri alınırken bir hata oluştu',
      error: error.message
    });
  }
});

app.get('/api/carousel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM carousel_items WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Carousel öğesi bulunamadı'
      });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    console.error(`Carousel öğesi (ID: ${req.params.id}) alınırken hata:`, error);
    return res.status(500).json({
      success: false,
      message: 'Carousel öğesi alınırken bir hata oluştu',
      error: error.message
    });
  }
});

app.post('/api/carousel', async (req, res) => {
  try {
    const { title, subtitle, button, imageUrl, order, isActive, seoMetadata } = req.body;
    
    const query = `
      INSERT INTO carousel_items (title, subtitle, button, image_url, "order", is_active, seo_metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title || {"tr": "", "en": ""},
      subtitle || {"tr": "", "en": ""},
      button || {"text": {"tr": "", "en": ""}, "url": ""},
      imageUrl || "",
      order || 0,
      isActive !== undefined ? isActive : true,
      seoMetadata || {"title": {"tr": "", "en": ""}, "description": {"tr": "", "en": ""}, "altText": {"tr": "", "en": ""}}
    ]);
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Carousel öğesi oluşturulurken hata:', error);
    return res.status(500).json({
      success: false,
      message: 'Carousel öğesi oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
});

app.put('/api/carousel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, button, imageUrl, order, isActive, seoMetadata } = req.body;
    
    // Mevcut öğeyi al
    const currentItem = await pool.query('SELECT * FROM carousel_items WHERE id = $1', [id]);
    
    if (currentItem.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Carousel öğesi bulunamadı'
      });
    }
    
    const current = currentItem.rows[0];
    
    const query = `
      UPDATE carousel_items
      SET 
        title = $1,
        subtitle = $2,
        button = $3,
        image_url = $4,
        "order" = $5,
        is_active = $6,
        seo_metadata = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title || current.title,
      subtitle || current.subtitle,
      button || current.button,
      imageUrl || current.image_url,
      order !== undefined ? order : current.order,
      isActive !== undefined ? isActive : current.is_active,
      seoMetadata || current.seo_metadata,
      id
    ]);
    
    return res.json(result.rows[0]);
  } catch (error) {
    console.error(`Carousel öğesi (ID: ${req.params.id}) güncellenirken hata:`, error);
    return res.status(500).json({
      success: false,
      message: 'Carousel öğesi güncellenirken bir hata oluştu',
      error: error.message
    });
  }
});

app.delete('/api/carousel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM carousel_items WHERE id = $1', [id]);
    
    return res.json({
      success: true,
      message: 'Carousel öğesi başarıyla silindi'
    });
  } catch (error) {
    console.error(`Carousel öğesi (ID: ${req.params.id}) silinirken hata:`, error);
    return res.status(500).json({
      success: false,
      message: 'Carousel öğesi silinirken bir hata oluştu',
      error: error.message
    });
  }
});

app.post('/api/carousel/upload', async (req, res) => {
  try {
    // Bu örnek için dosya yükleme işlemi basitleştirilmiştir
    // Gerçek uygulamada multer veya benzeri bir kütüphane kullanabilirsiniz
    
    return res.json({
      success: true,
      url: 'https://via.placeholder.com/1920x1080', // Örnek URL
      message: 'Resim başarıyla yüklendi'
    });
  } catch (error) {
    console.error('Resim yüklenirken hata:', error);
    return res.status(500).json({
      success: false,
      message: 'Resim yüklenirken bir hata oluştu',
      error: error.message
    });
  }
});

app.put('/api/carousel/order', async (req, res) => {
  try {
    const { items } = req.body;
    
    for (const item of items) {
      await pool.query('UPDATE carousel_items SET "order" = $1 WHERE id = $2', [item.order, item.id]);
    }
    
    return res.json({
      success: true,
      message: 'Carousel sıralaması başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Carousel sıralaması güncellenirken hata:', error);
    return res.status(500).json({
      success: false,
      message: 'Carousel sıralaması güncellenirken bir hata oluştu',
      error: error.message
    });
  }
});

// Catch-all route
app.get('*', (req, res) => {
  console.log('İstek alındı:', req.path);
  return res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found',
    endpoint: req.path
  });
});

// OPTIONS isteklerini ele al
app.options('*', cors());

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);

  // Test DB connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err);
    } else {
      console.log('Successfully connected to PostgreSQL database');
      console.log('Current time from DB:', res.rows[0].now);
    }
  });
}); 