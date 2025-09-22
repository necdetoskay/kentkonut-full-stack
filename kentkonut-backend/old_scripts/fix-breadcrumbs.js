const fs = require('fs');
const path = require('path');

// Breadcrumb kullanımını düzeltmek için dosyaları listele
const filesToFix = [
  'app/dashboard/kurumsal/highlights/[id]/edit/page.tsx',
  'app/dashboard/kurumsal/highlights/[id]/delete/page.tsx',
  'app/dashboard/pages/[id]/content/[contentId]/edit/page.tsx',
  'app/dashboard/pages/[id]/edit/page.tsx',
  'app/dashboard/pages/components/UnifiedPageCreator.tsx',
  'app/dashboard/pages/new/PageCreateForm.tsx',
  'app/dashboard/projects/[id]/page.tsx',
  'app/dashboard/pages/[id]/edit/content/[contentId]/components/ContentHeader.tsx'
];

const basePath = __dirname;

function fixBreadcrumbImports(content) {
  // Breadcrumb import'unu düzelt
  const oldImport = /import\s*{\s*Breadcrumb\s*}\s*from\s*"@\/components\/ui\/breadcrumb"/g;
  const newImport = 'import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"';
  
  return content.replace(oldImport, newImport);
}

function generateBreadcrumbJSX(segments, homeHref = '/dashboard') {
  let jsx = `<Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="${homeHref}">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>`;

  segments.forEach((segment, index) => {
    jsx += `
          <BreadcrumbSeparator />
          <BreadcrumbItem>`;
    
    if (index === segments.length - 1) {
      // Son segment için BreadcrumbPage kullan
      jsx += `
            <BreadcrumbPage>${segment.name || segment.label}</BreadcrumbPage>`;
    } else {
      // Diğer segmentler için BreadcrumbLink kullan
      jsx += `
            <BreadcrumbLink asChild>
              <Link href="${segment.href}">${segment.name || segment.label}</Link>
            </BreadcrumbLink>`;
    }
    
    jsx += `
          </BreadcrumbItem>`;
  });

  jsx += `
        </BreadcrumbList>
      </Breadcrumb>`;

  return jsx;
}

function fixBreadcrumbUsage(content) {
  // segments ve homeHref prop'larını kullanan Breadcrumb'ları bul ve düzelt
  const breadcrumbRegex = /<Breadcrumb\s+segments=\{([^}]+)\}\s+homeHref="([^"]+)"\s*\/>/g;
  
  return content.replace(breadcrumbRegex, (match, segmentsVar, homeHref) => {
    // Bu basit bir yaklaşım - gerçek segments değerini parse etmek zor
    // Bu yüzden manuel olarak her dosyayı kontrol etmek daha iyi
    return `<!-- BREADCRUMB_TO_FIX: ${match} -->`;
  });
}

function ensureLinkImport(content) {
  // Link import'unun var olup olmadığını kontrol et
  if (!content.includes('import Link from "next/link"')) {
    // İlk import'tan sonra Link import'unu ekle
    const firstImportMatch = content.match(/^import\s+.*from\s+["'][^"']+["'];?\s*$/m);
    if (firstImportMatch) {
      const insertIndex = content.indexOf(firstImportMatch[0]) + firstImportMatch[0].length;
      content = content.slice(0, insertIndex) + '\nimport Link from "next/link"' + content.slice(insertIndex);
    }
  }
  return content;
}

console.log('🔧 Breadcrumb düzeltmeleri başlıyor...');

filesToFix.forEach(filePath => {
  const fullPath = path.join(basePath, filePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`📝 Düzeltiliyor: ${filePath}`);
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Import'ları düzelt
    content = fixBreadcrumbImports(content);
    content = ensureLinkImport(content);
    
    // Breadcrumb kullanımını işaretle (manuel düzeltme için)
    content = fixBreadcrumbUsage(content);
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Tamamlandı: ${filePath}`);
  } else {
    console.log(`⚠️  Dosya bulunamadı: ${filePath}`);
  }
});

console.log('🎉 Breadcrumb düzeltmeleri tamamlandı!');
console.log('📋 Manuel düzeltme gereken yerler "BREADCRUMB_TO_FIX" yorumu ile işaretlendi.');
