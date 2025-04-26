<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kent Konut - Hafriyat</title>
    <style>
        :root {
            --primary-color: #0056a7;
            --secondary-color: #5cb85c;
            --accent-color: #f0ad4e;
            --dark-color: #333;
            --light-color: #f8f9fa;
            --border-radius: 8px;
            --box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        
        header {
            background-color: var(--primary-color);
            color: white;
            padding: 15px 0;
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: white;
            text-decoration: none;
            display: flex;
            align-items: center;
        }
        
        .logo img {
            height: 40px;
            margin-right: 10px;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
        }
        
        .nav-links li {
            margin-left: 20px;
        }
        
        .nav-links a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            padding: 5px 10px;
            border-radius: var(--border-radius);
            transition: background-color 0.3s;
        }
        
        .nav-links a:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
        
        .contact-info {
            display: flex;
            align-items: center;
        }
        
        .contact-info a {
            color: white;
            margin-left: 15px;
            text-decoration: none;
        }
        
        .hero {
            height: 500px;
            background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/api/placeholder/1200/500');
            background-size: cover;
            background-position: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
            position: relative;
        }
        
        .hero-content {
            max-width: 800px;
            padding: 0 20px;
        }
        
        .hero h1 {
            font-size: 48px;
            margin-bottom: 20px;
            font-weight: 700;
        }
        
        .hero p {
            font-size: 18px;
            margin-bottom: 30px;
        }
        
        .btn {
            display: inline-block;
            background-color: var(--secondary-color);
            color: white;
            padding: 12px 30px;
            border-radius: var(--border-radius);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
        }
        
        .btn-sm {
            padding: 8px 15px;
            font-size: 14px;
        }
        
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .breadcrumb {
            background-color: white;
            padding: 15px 0;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .breadcrumb-links {
            display: flex;
            list-style: none;
        }
        
        .breadcrumb-links li {
            margin-right: 10px;
        }
        
        .breadcrumb-links li:after {
            content: '>';
            margin-left: 10px;
        }
        
        .breadcrumb-links li:last-child:after {
            content: '';
        }
        
        .breadcrumb-links a {
            color: var(--primary-color);
            text-decoration: none;
        }
        
        .breadcrumb-links li:last-child a {
            color: var(--dark-color);
            font-weight: 500;
        }
        
        .main-content {
            padding: 50px 0;
        }
        
        .info-card {
            background-color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            padding: 30px;
            margin-bottom: 30px;
        }
        
        .info-card h2 {
            color: var(--primary-color);
            margin-bottom: 20px;
            font-size: 28px;
            border-bottom: 2px solid var(--secondary-color);
            padding-bottom: 10px;
        }
        
        .info-card p {
            margin-bottom: 20px;
        }
        
        .info-features {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 30px 0;
        }
        
        .feature {
            flex: 1;
            min-width: 200px;
            background-color: #f8f9fa;
            border-radius: var(--border-radius);
            padding: 20px;
            text-align: center;
            transition: all 0.3s;
            border-bottom: 3px solid var(--secondary-color);
        }
        
        .feature:hover {
            transform: translateY(-5px);
            box-shadow: var(--box-shadow);
        }
        
        .feature i {
            font-size: 40px;
            color: var(--secondary-color);
            margin-bottom: 15px;
        }
        
        .feature h4 {
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .info-card .date {
            color: #666;
            font-style: italic;
            margin-bottom: 20px;
            display: block;
        }
        
        .progress-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 30px;
        }
        
        .progress-card {
            background-color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            padding: 20px;
            text-align: center;
            transition: transform 0.3s;
        }
        
        .progress-card:hover {
            transform: translateY(-10px);
        }
        
        .progress-card h3 {
            margin-bottom: 20px;
            font-size: 18px;
            color: var(--primary-color);
        }
        
        .progress-card p {
            margin: 15px 0;
            color: #666;
        }
        
        .circular-progress {
            width: 150px;
            height: 150px;
            margin: 0 auto 20px;
            position: relative;
        }
        
        .circular-progress svg {
            width: 100%;
            height: 100%;
        }
        
        .circular-progress circle {
            fill: none;
            stroke-width: 10;
            stroke-linecap: round;
            transform: rotate(-90deg);
            transform-origin: 50% 50%;
        }
        
        .progress-bg {
            stroke: #e6e6e6;
        }
        
        .progress-value {
            stroke: var(--secondary-color);
            stroke-dasharray: 440;
        }
        
        .progress-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            font-weight: bold;
        }
        
        .linear-progress-container {
            margin-top: 50px;
        }
        
        .linear-progress {
            margin-bottom: 30px;
        }
        
        .linear-progress h3 {
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
        }
        
        .progress-bar {
            height: 20px;
            background-color: #e6e6e6;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .progress-bar-fill {
            height: 100%;
            border-radius: 10px;
            background-color: var(--secondary-color);
        }
        
        .quick-links {
            background-color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            padding: 30px;
        }
        
        .quick-links h2 {
            color: var(--primary-color);
            margin-bottom: 20px;
            font-size: 24px;
            border-bottom: 2px solid var(--secondary-color);
            padding-bottom: 10px;
        }
        
        .links-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .links-grid a {
            display: flex;
            align-items: center;
            color: var(--dark-color);
            text-decoration: none;
            padding: 15px;
            border-radius: var(--border-radius);
            background-color: #f5f5f5;
            transition: all 0.3s;
        }
        
        .links-grid a:hover {
            background-color: var(--primary-color);
            color: white;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .links-grid a i {
            margin-right: 10px;
            font-size: 18px;
        }
        
        .services-section {
            margin-bottom: 30px;
        }
        
        .services-section h2 {
            color: var(--primary-color);
            margin-bottom: 20px;
            font-size: 28px;
            border-bottom: 2px solid var(--secondary-color);
            padding-bottom: 10px;
        }
        
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }
        
        .service-card {
            background-color: white;
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--box-shadow);
            transition: transform 0.3s;
        }
        
        .service-card:hover {
            transform: translateY(-10px);
        }
        
        .service-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        
        .service-content {
            padding: 20px;
        }
        
        .service-content h3 {
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .service-content p {
            margin-bottom: 15px;
            color: #666;
        }
        
        footer {
            background-color: var(--dark-color);
            color: white;
            padding: 50px 0 20px;
        }
        
        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .footer-column h3 {
            font-size: 18px;
            margin-bottom: 20px;
            position: relative;
            padding-bottom: 10px;
        }
        
        .footer-column h3:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 50px;
            height: 2px;
            background-color: var(--secondary-color);
        }
        
        .footer-column ul {
            list-style: none;
        }
        
        .footer-column ul li {
            margin-bottom: 10px;
        }
        
        .footer-column ul li a {
            color: #ccc;
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .footer-column ul li a:hover {
            color: var(--secondary-color);
        }
        
        .contact-info-footer {
            margin-bottom: 20px;
        }
        
        .contact-info-footer p {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .contact-info-footer i {
            margin-right: 10px;
            color: var(--secondary-color);
        }
        
        .footer-bottom {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #444;
        }
        
        .social-links {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
        }
        
        .social-links a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background-color: #444;
            color: white;
            border-radius: 50%;
            margin: 0 10px;
            transition: all 0.3s;
        }
        
        .social-links a:hover {
            background-color: var(--secondary-color);
            transform: translateY(-3px);
        }
        
        @media (max-width: 768px) {
            .navbar {
                flex-direction: column;
            }
            
            .nav-links {
                margin-top: 20px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .nav-links li {
                margin: 5px;
            }
            
            .hero h1 {
                font-size: 36px;
            }
            
            .progress-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <header>
        <div class="container">
            <div class="navbar">
                <a href="#" class="logo">
                    <img src="/api/placeholder/40/40" alt="Kent Konut Logo"> KENT KONUT
                </a>
                <ul class="nav-links">
                    <li><a href="#">ANASAYFA</a></li>
                    <li><a href="#">HAKKIMIZDA</a></li>
                    <li><a href="#">KURUMSAL</a></li>
                    <li><a href="#">PROJELERİMİZ</a></li>
                    <li><a href="#" class="active">HAFRİYAT</a></li>
                    <li><a href="#">BİZE ULAŞIN</a></li>
                </ul>
                <div class="contact-info">
                    <a href="tel:02623317073"><i class="fas fa-phone"></i> 0262 331 70 73</a>
                </div>
            </div>
        </div>
    </header>

    <section class="hero">
        <div class="hero-content">
            <h1>HAFRİYAT ve REHABİLİTASYON ÇALIŞMALARIMIZ</h1>
            <p>Kocaeli il sınırları içinde, yapılan yatırımlarla büyüyen inşaat sektöründe çevre dostu ve sürdürülebilir projeler gerçekleştiriyoruz.</p>
            <a href="#projects" class="btn">PROJELER HAKKINDA BİLGİ AL</a>
        </div>
    </section>

    <div class="breadcrumb">
        <div class="container">
            <ul class="breadcrumb-links">
                <li><a href="#"><i class="fas fa-home"></i></a></li>
                <li><a href="#">Anasayfa</a></li>
                <li><a href="#">Hafriyat</a></li>
            </ul>
        </div>
    </div>

    <section class="main-content">
        <div class="container">
            <div class="info-card">
                <h2>MADEN VE KULLANILMAYAN ALANLARIN REHABİLİTASYONU</h2>
                <span class="date">Saha verileri: 26.06.2024 tarihi itibari ile güncellenmiştir.</span>
                <p>Kocaeli il sınırları içinde, yapılan yatırımlarla büyüyen inşaat sektöründe hafriyat atığı miktarı gün geçtikçe artmaktadır. Bu atıkların kontrollü dökülmesi ile yaşanacak çevre ve görüntü kirliliğini önlemek amacıyla, kanun ve yönetmelikler çerçevesinde projelendirilmesi yapılarak vasfını yitirmiş ve kullanılmayan alanlar rehabilite edilmektedir. Bu alanlar doğal topografyaya uygun şekilde hafriyat toprağı ile doldurulduktan sonra ağaçlandırma çalışmaları yapılarak doğal yaşama geri kazandırılmaktadır.</p>
                
                <div class="info-features">
                    <div class="feature">
                        <i class="fas fa-leaf"></i>
                        <h4>Çevre Dostu</h4>
                        <p>Doğal yaşamı koruyarak sürdürülebilir projeler</p>
                    </div>
                    <div class="feature">
                        <i class="fas fa-recycle"></i>
                        <h4>Atık Yönetimi</h4>
                        <p>Etkin atık yönetimi ile çevre kirliliğinin önlenmesi</p>
                    </div>
                    <div class="feature">
                        <i class="fas fa-chart-line"></i>
                        <h4>Rehabilitasyon</h4>
                        <p>Kullanılmayan alanların yeniden kazandırılması</p>
                    </div>
                    <div class="feature">
                        <i class="fas fa-tree"></i>
                        <h4>Ağaçlandırma</h4>
                        <p>Doğal yaşam alanlarını yeniden oluşturma</p>
                    </div>
                </div>
                
                <div class="progress-grid">
                    <div class="progress-card">
                        <h3>KÖRFEZ TAŞOCAĞI</h3>
                        <div class="circular-progress">
                            <svg viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r="70" class="progress-bg"></circle>
                                <circle cx="80" cy="80" r="70" class="progress-value" style="stroke-dashoffset: 44"></circle>
                            </svg>
                            <div class="progress-text">90%</div>
                        </div>
                        <p>Tamamlanma Aşamasında</p>
                        <a href="#" class="btn btn-sm">Detaylı Bilgi</a>
                    </div>
                    <div class="progress-card">
                        <h3>SEPETÇILER 3. ETAP</h3>
                        <div class="circular-progress">
                            <svg viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r="70" class="progress-bg"></circle>
                                <circle cx="80" cy="80" r="70" class="progress-value" style="stroke-dashoffset: 22"></circle>
                            </svg>
                            <div class="progress-text">95%</div>
                        </div>
                        <p>Tamamlanma Aşamasında</p>
                        <a href="#" class="btn btn-sm">Detaylı Bilgi</a>
                    </div>
                    <div class="progress-card">
                        <h3>KETENCİLER REHABİLİTE</h3>
                        <div class="circular-progress">
                            <svg viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r="70" class="progress-bg"></circle>
                                <circle cx="80" cy="80" r="70" class="progress-value" style="stroke-dashoffset: 396"></circle>
                            </svg>
                            <div class="progress-text">10%</div>
                        </div>
                        <p>Başlangıç Aşamasında</p>
                        <a href="#" class="btn btn-sm">Detaylı Bilgi</a>
                    </div>
                    <div class="progress-card">
                        <h3>BALÇIK REHABİLİTE</h3>
                        <div class="circular-progress">
                            <svg viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r="70" class="progress-bg"></circle>
                                <circle cx="80" cy="80" r="70" class="progress-value" style="stroke-dashoffset: 57"></circle>
                            </svg>
                            <div class="progress-text">87%</div>
                        </div>
                        <p>Tamamlanma Aşamasında</p>
                        <a href="#" class="btn btn-sm">Detaylı Bilgi</a>
                    </div>
                    <div class="progress-card">
                        <h3>DİLOVASI LOT ALANI</h3>
                        <div class="circular-progress">
                            <svg viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r="70" class="progress-bg"></circle>
                                <circle cx="80" cy="80" r="70" class="progress-value" style="stroke-dashoffset: 132"></circle>
                            </svg>
                            <div class="progress-text">70%</div>
                        </div>
                        <p>İlerleme Aşamasında</p>
                        <a href="#" class="btn btn-sm">Detaylı Bilgi</a>
                    </div>
                    <div class="progress-card">
                        <h3>MADEN TAŞ OCAĞI</h3>
                        <div class="circular-progress">
                            <svg viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r="70" class="progress-bg"></circle>
                                <circle cx="80" cy="80" r="70" class="progress-value" style="stroke-dashoffset: 220"></circle>
                            </svg>
                            <div class="progress-text">50%</div>
                        </div>
                        <p>İlerleme Aşamasında</p>
                        <a href="#" class="btn btn-sm">Detaylı Bilgi</a>
                    </div>
                </div>
            </div>
            
            <div class="services-section">
                <h2>HİZMETLERİMİZ VE ÇALIŞMALARIMIZ</h2>
                <div class="services-grid">
                    <div class="service-card">
                        <img src="/api/placeholder/500/300" alt="Saha Öncesi ve Sonrası" class="service-image">
                        <div class="service-content">
                            <h3>Saha Rehabilitasyon Projeleri</h3>
                            <p>Taş ocakları ve maden sahaları gibi kullanılmayan alanları rehabilite ederek doğaya kazandırıyoruz.</p>
                            <a href="#" class="btn btn-sm">Detaylı Bilgi</a>
                        </div>
                    </div>
                    <div class="service-card">
                        <img src="/api/placeholder/500/300" alt="Hafriyat Yönetimi" class="service-image">
                        <div class="service-content">
                            <h3>Hafriyat Atık Yönetimi</h3>
                            <p>Hafriyat atıklarının kontrollü ve çevre dostu biçimde yönetimini sağlıyoruz.</p>
                            <a href="#" class="btn btn-sm">Detaylı Bilgi</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="quick-links">
                <h2>HIZLI ERİŞİM</h2>
                <div class="links-grid">
                    <a href="#"><i class="fas fa-file-alt"></i> Hafriyat</a>
                    <a href="#"><i class="fas fa-list"></i> Hafriyat Sahaları</a>
                    <a href="#"><i class="fas fa-id-card"></i> Ucret Tarifeleri</a>
                    <a href="#"><i class="fas fa-file-pdf"></i> Formlar</a>
                    <a href="#"><i class="fas fa-map-marked-alt"></i> Hafriyat Sahaları İletişim</a>
                    <a href="#"><i class="fas fa-cogs"></i> Hafriyat Yönetim Bilgi Sistemi</a>
                    <a href="#"><i class="fas fa-credit-card"></i> Kredi Kartı ile Ödeme ve Satış Pos</a>
                </div>
            </div>
        </div>
    </section>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-column">
                    <h3>KURUMSAL</h3>
                    <ul>
                        <li><a href="#">İhale Yönetimi</a></li>
                        <li><a href="#">Kurumsal Kimlik</a></li>
                        <li><a href="#">Yönetmelikler</a></li>
                        <li><a href="#">Memnuniyet Anketi</a></li>
                        <li><a href="#">Bize Ulaşın</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>HAFRİYAT HİZMETLERİ</h3>
                    <ul>
                        <li><a href="#">Hafriyat Ucret Tarifeleri</a></li>
                        <li><a href="#">Hafriyat Sahaları</a></li>
                        <li><a href="#">Kvkk Hesaplarına</a></li>
                        <li><a href="#">Dökümanlarımız</a></li>
                        <li><a href="#">Video</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>İLETİŞİM</h3>
                    <div class="contact-info-footer">
                        <p><i class="fas fa-map-marker-alt"></i> Körfez Mah. Hafız Binbaşı Cad. No:3 İzmit / Kocaeli</p>
                        <p><i class="fas fa-envelope"></i> halkailiskiler@kentkonut.com.tr</p>
                        <p><i class="fas fa-phone"></i> 0 262 331 0703</p>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <div class="social-links">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-youtube"></i></a>
                </div>
                <p>KENT KONUT İNŞAAT SAN. VE TİC. A.Ş. KOCAELİ BÜYÜKŞEHİR BELEDİYESİ İŞTİRAKİDİR © 2024</p>
            </div>
        </div>
    </footer>
</body>
</html>