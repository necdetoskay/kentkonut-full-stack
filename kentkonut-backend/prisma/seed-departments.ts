/**
 * Seed Data: 5 New Departments with Personnel
 * 
 * This script adds exactly 5 new departments with their directors and chiefs.
 * It does NOT modify or delete any existing data - only adds new records.
 * 
 * Run: npx tsx prisma/seed-departments.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Department data with realistic Turkish names
const departmentsData = [
  {
    name: 'İnsan Kaynakları Müdürlüğü',
    slug: 'insan-kaynaklari-mudurlugu',
    content: 'İnsan kaynakları yönetimi, personel işleri, özlük hakları ve eğitim koordinasyonu ile ilgili tüm süreçleri yürüten müdürlüktür.',
    services: [
      'Personel işleri ve özlük hakları',
      'İşe alım ve yerleştirme süreçleri',
      'Performans değerlendirme',
      'Eğitim ve gelişim programları',
      'İş sağlığı ve güvenliği'
    ],
    order: 100,
    director: {
      name: 'Dr. Ayşe Kaya',
      title: 'İnsan Kaynakları Müdürü',
      slug: 'dr-ayse-kaya',
      content: 'İnsan kaynakları alanında 15 yıllık deneyime sahip, personel yönetimi ve organizasyonel gelişim konularında uzman müdür.',
      email: 'ayse.kaya@kentkonut.gov.tr',
      phone: '+90 312 555 0101',
      order: 1
    },
    chief: {
      name: 'Mehmet Özkan',
      title: 'İnsan Kaynakları Şefi',
      slug: 'mehmet-ozkan',
      content: 'Personel işleri ve özlük hakları konularında 10 yıllık deneyime sahip, detay odaklı çalışma anlayışı ile tanınan şef.',
      email: 'mehmet.ozkan@kentkonut.gov.tr',
      phone: '+90 312 555 0102',
      order: 2
    }
  },
  {
    name: 'Mali İşler Müdürlüğü',
    slug: 'mali-isler-mudurlugu',
    content: 'Kurumun mali kaynaklarının etkin yönetimi, bütçe planlama, muhasebe ve finansal raporlama işlemlerini yürüten müdürlüktür.',
    services: [
      'Bütçe hazırlama ve takibi',
      'Muhasebe ve mali kayıt işlemleri',
      'Finansal raporlama',
      'Harcama yetkilendirme',
      'Mali denetim koordinasyonu'
    ],
    order: 101,
    director: {
      name: 'Fatma Demir',
      title: 'Mali İşler Müdürü',
      slug: 'fatma-demir',
      content: 'Mali işler ve bütçe yönetimi alanında 18 yıllık deneyime sahip, CPA sertifikalı mali işler uzmanı.',
      email: 'fatma.demir@kentkonut.gov.tr',
      phone: '+90 312 555 0201',
      order: 1
    },
    chief: {
      name: 'Ali Yılmaz',
      title: 'Muhasebe Şefi',
      slug: 'ali-yilmaz',
      content: 'Muhasebe ve finansal raporlama konularında 12 yıllık deneyime sahip, detaylı analiz yeteneği ile öne çıkan şef.',
      email: 'ali.yilmaz@kentkonut.gov.tr',
      phone: '+90 312 555 0202',
      order: 2
    }
  },
  {
    name: 'Bilgi İşlem Müdürlüğü',
    slug: 'bilgi-islem-mudurlugu',
    content: 'Kurumun bilgi teknolojileri altyapısı, yazılım geliştirme, sistem yönetimi ve dijital dönüşüm projelerini yöneten müdürlüktür.',
    services: [
      'Sistem yönetimi ve altyapı',
      'Yazılım geliştirme ve bakım',
      'Veri güvenliği ve yedekleme',
      'Dijital dönüşüm projeleri',
      'Teknik destek hizmetleri'
    ],
    order: 102,
    director: {
      name: 'Murat Şahin',
      title: 'Bilgi İşlem Müdürü',
      slug: 'murat-sahin',
      content: 'Bilgi teknolojileri ve yazılım geliştirme alanında 20 yıllık deneyime sahip, dijital dönüşüm projelerinde uzman müdür.',
      email: 'murat.sahin@kentkonut.gov.tr',
      phone: '+90 312 555 0301',
      order: 1
    },
    chief: {
      name: 'Zeynep Arslan',
      title: 'Sistem Yönetimi Şefi',
      slug: 'zeynep-arslan',
      content: 'Sistem yönetimi ve ağ altyapısı konularında 8 yıllık deneyime sahip, problem çözme odaklı yaklaşımı ile tanınan şef.',
      email: 'zeynep.arslan@kentkonut.gov.tr',
      phone: '+90 312 555 0302',
      order: 2
    }
  },
  {
    name: 'Halkla İlişkiler Müdürlüğü',
    slug: 'halkla-iliskiler-mudurlugu',
    content: 'Kurumun iletişim stratejilerini yöneten, basın ilişkileri, sosyal medya yönetimi ve halkla ilişkiler faaliyetlerini koordine eden müdürlüktür.',
    services: [
      'Basın ilişkileri ve medya yönetimi',
      'Sosyal medya stratejileri',
      'Kurumsal iletişim',
      'Etkinlik organizasyonu',
      'Halkla ilişkiler kampanyaları'
    ],
    order: 103,
    director: {
      name: 'Elif Çelik',
      title: 'Halkla İlişkiler Müdürü',
      slug: 'elif-celik',
      content: 'İletişim ve halkla ilişkiler alanında 14 yıllık deneyime sahip, stratejik iletişim planlaması konusunda uzman müdür.',
      email: 'elif.celik@kentkonut.gov.tr',
      phone: '+90 312 555 0401',
      order: 1
    },
    chief: {
      name: 'Burak Kılıç',
      title: 'Medya İlişkileri Şefi',
      slug: 'burak-kilic',
      content: 'Medya ilişkileri ve sosyal medya yönetimi konularında 7 yıllık deneyime sahip, yaratıcı içerik üretimi ile öne çıkan şef.',
      email: 'burak.kilic@kentkonut.gov.tr',
      phone: '+90 312 555 0402',
      order: 2
    }
  },
  {
    name: 'Hukuk İşleri Müdürlüğü',
    slug: 'hukuk-isleri-mudurlugu',
    content: 'Kurumun hukuki süreçlerini yöneten, sözleşme hazırlama, dava takibi ve hukuki danışmanlık hizmetlerini sunan müdürlüktür.',
    services: [
      'Hukuki danışmanlık hizmetleri',
      'Sözleşme hazırlama ve inceleme',
      'Dava takibi ve savunma',
      'Mevzuat analizi',
      'Hukuki uyum süreçleri'
    ],
    order: 104,
    director: {
      name: 'Av. Serkan Aydın',
      title: 'Hukuk İşleri Müdürü',
      slug: 'av-serkan-aydin',
      content: 'Kamu hukuku ve idari hukuk alanında 16 yıllık deneyime sahip, karmaşık hukuki süreçlerin yönetiminde uzman avukat.',
      email: 'serkan.aydin@kentkonut.gov.tr',
      phone: '+90 312 555 0501',
      order: 1
    },
    chief: {
      name: 'Av. Seda Polat',
      title: 'Hukuk İşleri Şefi',
      slug: 'av-seda-polat',
      content: 'Sözleşme hukuku ve dava takibi konularında 9 yıllık deneyime sahip, titiz çalışma anlayışı ile tanınan avukat.',
      email: 'seda.polat@kentkonut.gov.tr',
      phone: '+90 312 555 0502',
      order: 2
    }
  }
]

async function checkExistingData() {
  console.log('🔍 Checking existing data to avoid conflicts...')
  
  const existingDepartments = await prisma.department.findMany({
    select: { name: true, slug: true }
  })
  
  const existingPersonnel = await prisma.personnel.findMany({
    select: { name: true, slug: true }
  })
  
  console.log(`📊 Found ${existingDepartments.length} existing departments`)
  console.log(`👥 Found ${existingPersonnel.length} existing personnel`)
  
  // Check for conflicts
  const conflicts = {
    departments: [],
    personnel: []
  }
  
  for (const dept of departmentsData) {
    if (existingDepartments.some(existing => 
      existing.name === dept.name || existing.slug === dept.slug
    )) {
      conflicts.departments.push(dept.name)
    }
    
    if (existingPersonnel.some(existing => 
      existing.name === dept.director.name || existing.slug === dept.director.slug
    )) {
      conflicts.personnel.push(dept.director.name)
    }
    
    if (existingPersonnel.some(existing => 
      existing.name === dept.chief.name || existing.slug === dept.chief.slug
    )) {
      conflicts.personnel.push(dept.chief.name)
    }
  }
  
  if (conflicts.departments.length > 0 || conflicts.personnel.length > 0) {
    console.log('⚠️ Conflicts detected:')
    if (conflicts.departments.length > 0) {
      console.log('  Departments:', conflicts.departments.join(', '))
    }
    if (conflicts.personnel.length > 0) {
      console.log('  Personnel:', conflicts.personnel.join(', '))
    }
    return false
  }
  
  console.log('✅ No conflicts detected - safe to proceed')
  return true
}

async function seedDepartments() {
  console.log('🏢 Starting to seed 5 new departments...')

  const createdDepartments = []

  for (let i = 0; i < departmentsData.length; i++) {
    const deptData = departmentsData[i]

    try {
      console.log(`\n📝 Creating department ${i + 1}/5: ${deptData.name}`)

      // Create department
      const department = await prisma.department.create({
        data: {
          name: deptData.name,
          slug: deptData.slug,
          content: deptData.content,
          imageUrl: '', // Empty for now
          isActive: true,
          services: deptData.services,
          order: deptData.order
        }
      })

      console.log(`  ✅ Department created: ${department.name} (ID: ${department.id})`)

      // Create director
      console.log(`  👨‍💼 Creating director: ${deptData.director.name}`)
      const director = await prisma.personnel.create({
        data: {
          name: deptData.director.name,
          title: deptData.director.title,
          slug: deptData.director.slug,
          content: deptData.director.content,
          email: deptData.director.email,
          phone: deptData.director.phone,
          imageUrl: '', // Empty for now
          isActive: true,
          type: 'DIRECTOR',
          order: deptData.director.order
        }
      })

      console.log(`    ✅ Director created: ${director.name} (ID: ${director.id})`)

      // Create chief
      console.log(`  👨‍💻 Creating chief: ${deptData.chief.name}`)
      const chief = await prisma.personnel.create({
        data: {
          name: deptData.chief.name,
          title: deptData.chief.title,
          slug: deptData.chief.slug,
          content: deptData.chief.content,
          email: deptData.chief.email,
          phone: deptData.chief.phone,
          imageUrl: '', // Empty for now
          isActive: true,
          type: 'CHIEF',
          order: deptData.chief.order
        }
      })

      console.log(`    ✅ Chief created: ${chief.name} (ID: ${chief.id})`)

      // Link director to department
      console.log(`  🔗 Linking director to department...`)
      await prisma.department.update({
        where: { id: department.id },
        data: { directorId: director.id }
      })

      // Link chief to department
      console.log(`  🔗 Linking chief to department...`)
      await prisma.department.update({
        where: { id: department.id },
        data: {
          chiefs: {
            connect: { id: chief.id }
          }
        }
      })

      console.log(`  ✅ All relationships established for ${department.name}`)

      createdDepartments.push({
        department,
        director,
        chief
      })

    } catch (error) {
      console.error(`❌ Error creating department ${deptData.name}:`, error)
      throw error
    }
  }

  return createdDepartments
}

async function printSummary(createdDepartments: any[]) {
  console.log('\n📊 SEEDING SUMMARY')
  console.log('═'.repeat(50))

  console.log(`✅ Successfully created ${createdDepartments.length} departments:`)

  for (let i = 0; i < createdDepartments.length; i++) {
    const { department, director, chief } = createdDepartments[i]
    console.log(`\n${i + 1}. ${department.name}`)
    console.log(`   📍 Slug: ${department.slug}`)
    console.log(`   👨‍💼 Director: ${director.name} (${director.title})`)
    console.log(`   👨‍💻 Chief: ${chief.name} (${chief.title})`)
    console.log(`   🔗 Department ID: ${department.id}`)
  }

  // Get final counts
  const totalDepartments = await prisma.department.count()
  const totalPersonnel = await prisma.personnel.count()

  console.log('\n📈 DATABASE TOTALS AFTER SEEDING:')
  console.log(`   🏢 Total Departments: ${totalDepartments}`)
  console.log(`   👥 Total Personnel: ${totalPersonnel}`)

  console.log('\n🎯 NEXT STEPS:')
  console.log('   1. Visit: http://localhost:3010/dashboard/kurumsal/birimler')
  console.log('   2. Verify all 5 new departments are visible')
  console.log('   3. Test department detail pages and personnel')
  console.log('   4. Test breadcrumb navigation with new departments')
}

async function main() {
  try {
    console.log('🚀 Starting Department Seeding Process...')
    console.log('═'.repeat(50))

    // Check for conflicts
    const canProceed = await checkExistingData()
    if (!canProceed) {
      console.log('❌ Seeding aborted due to conflicts')
      console.log('💡 Tip: Check existing department and personnel names/slugs')
      process.exit(1)
    }

    // Seed departments
    const createdDepartments = await seedDepartments()

    // Print summary
    await printSummary(createdDepartments)

    console.log('\n🎉 Department seeding completed successfully!')

  } catch (error) {
    console.error('\n❌ Seeding failed:', error)

    if (error.code === 'P2002') {
      console.log('💡 This appears to be a unique constraint violation.')
      console.log('   Some data might already exist. Check the conflicts above.')
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding process
if (require.main === module) {
  main()
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export { main as seedDepartments }
