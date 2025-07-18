# Tiptap HTML Render CSS Entegrasyonu

## 1. CSS Dosyasını Projeye Dahil Etme

### React/Next.js
```javascript
// components/TiptapContent.js
import './tiptap-render.css'; // CSS dosyasını import et

// veya global olarak
// pages/_app.js
import '../styles/tiptap-render.css';
```

### Vue.js/Nuxt.js
```javascript
// components/TiptapContent.vue
<style>
@import './tiptap-render.css';
</style>

// veya global olarak
// main.js
import './assets/css/tiptap-render.css';
```

### Angular
```typescript
// angular.json
"styles": [
  "src/assets/css/tiptap-render.css"
]

// veya component'te
// component.ts
styleUrls: ['./tiptap-render.css']
```

### Vanilla JS
```html
<!-- HTML head'e ekle -->
<link rel="stylesheet" href="./css/tiptap-render.css">
```

## 2. CDN Üzerinden Kullanım

```html
<!-- HTML head'e ekle -->
<link rel="stylesheet" href="https://your-cdn.com/tiptap-render.css">
```

## 3. Tailwind CSS ile Entegrasyon

Eğer Tailwind CSS kullanıyorsanız:

```css
/* tailwind.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Tiptap render stillerini component layer'a ekle */
@layer components {
  .tiptap-render {
    @apply leading-relaxed text-gray-700 overflow-hidden;
  }
  
  .tiptap-render::after {
    @apply table clear-both;
    content: "";
  }
  
  .tiptap-render p {
    @apply mb-4 text-justify overflow-hidden;
  }
  
  .tiptap-render h2 {
    @apply text-2xl font-semibold mb-4 mt-6 clear-both;
  }
  
  .tiptap-render img[data-float="left"] {
    @apply float-left mr-5 mb-2 rounded max-w-full;
    vertical-align: top;
  }
  
  .tiptap-render img[data-float="right"] {
    @apply float-right ml-5 mb-2 rounded max-w-full;
    vertical-align: top;
  }
  
  .tiptap-render img[data-float="none"] {
    @apply block mx-auto my-4 rounded max-w-full;
  }
}
```

## 4. Styled-Components ile Entegrasyon

```javascript
import styled from 'styled-components';

const TiptapContainer = styled.div`
  line-height: 1.6;
  color: #374151;
  overflow: hidden;
  
  &::after {
    content: "";
    display: table;
    clear: both;
  }
  
  p {
    margin: 0 0 16px 0;
    text-align: justify;
    overflow: hidden;
  }
  
  h2 {
    margin: 24px 0 16px 0;
    font-size: 1.5em;
    font-weight: 600;
    clear: both;
  }
  
  img[data-float="left"] {
    float: left;
    margin: 0 20px 10px 0;
    vertical-align: top;
    height: auto;
    border-radius: 4px;
    max-width: 100%;
  }
  
  img[data-float="right"] {
    float: right;
    margin: 0 0 10px 20px;
    vertical-align: top;
    height: auto;
    border-radius: 4px;
    max-width: 100%;
  }
  
  img[data-float="none"] {
    float: none;
    margin: 16px auto;
    display: block;
    height: auto;
    border-radius: 4px;
    max-width: 100%;
  }
`;

const TiptapContent = ({ htmlContent }) => (
  <TiptapContainer dangerouslySetInnerHTML={{ __html: htmlContent }} />
);
```

## 5. CSS-in-JS ile Entegrasyon

```javascript
// Emotion veya styled-components
const tiptapStyles = css`
  line-height: 1.6;
  color: #374151;
  overflow: hidden;
  
  &::after {
    content: "";
    display: table;
    clear: both;
  }
  
  /* Diğer stiller... */
`;

const TiptapContent = ({ htmlContent }) => (
  <div 
    css={tiptapStyles}
    dangerouslySetInnerHTML={{ __html: htmlContent }}
  />
);
```

## 6. Özelleştirme

CSS değişkenlerini kullanarak kolayca özelleştirme:

```css
.tiptap-render {
  --text-color: #374151;
  --link-color: #3b82f6;
  --bg-color: #ffffff;
  --border-color: #e5e7eb;
  --spacing: 16px;
  
  color: var(--text-color);
  background: var(--bg-color);
}

.tiptap-render p {
  margin: 0 0 var(--spacing) 0;
}

.tiptap-render a {
  color: var(--link-color);
}
```

## 7. Responsive Ayarlar

```css
/* Küçük ekranlar için */
@media (max-width: 768px) {
  .tiptap-render img[data-float="left"],
  .tiptap-render img[data-float="right"] {
    float: none;
    display: block;
    margin: 16px auto;
    max-width: 100%;
  }
  
  .tiptap-render {
    font-size: 14px;
  }
}
```

## 8. Dark Mode Desteği

```css
@media (prefers-color-scheme: dark) {
  .tiptap-render {
    color: #f3f4f6;
    background: #1f2937;
  }
  
  .tiptap-render blockquote {
    border-left-color: #4b5563;
    background: #374151;
  }
}
```

## Kullanım Notları

1. **CSS dosyası önceliği**: CSS dosyasını diğer stillerden sonra yükleyin
2. **Specificity**: Gerekirse `!important` kullanın
3. **Namespace**: Çakışmaları önlemek için `.tiptap-render` class'ını kullanın
4. **Testing**: Farklı cihazlarda test edin
5. **Performance**: CSS dosyasını minify edin

Bu entegrasyon ile Tiptap editöründen gelen HTML, hangi kütüphanede olursa olsun aynı görünümde render edilecektir!