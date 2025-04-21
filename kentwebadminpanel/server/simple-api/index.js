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
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
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