require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

async function main() {
  console.log('🌱 Seeding database with test data...\n');

  // ============================================
  // 1. CREATE ADMIN
  // ============================================
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  // Check if admin already exists first
  let admin = await prisma.user.findUnique({ where: { email: 'admin@compound.com' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@compound.com',
        password: adminPassword,
        role: 'ADMIN'
      }
    });
  }
  console.log('✅ Admin created:', admin.email);

  // ============================================
  // 2. CREATE 20 BUILDINGS
  // ============================================
  const buildingNames = [
    'الفرسان', 'الأندلس', 'غرناطة', 'قرطبة', 'إشبيلية',
    'الزهراء', 'النخيل', 'الواحة', 'الربوة', 'السعادة',
    'المنار', 'الزهور', 'الياسمين', 'الفل', 'الريحان',
    'السرو', 'الأرز', 'الصنوبر', 'البلوط', 'الزيتون'
  ];

  const buildings = [];
  for (let i = 0; i < 20; i++) {
    const number = `B-${i + 1}`;
    let building = await prisma.building.findUnique({ where: { number } });
    if (!building) {
      building = await prisma.building.create({
        data: {
          name: buildingNames[i],
          number
        }
      });
    }
    buildings.push(building);
  }
  console.log('✅ 20 Buildings created');

  // ============================================
  // 3. CREATE 60 APARTMENTS (3 per building)
  // ============================================
  const apartments = [];
  for (let i = 0; i < 20; i++) {
    for (let floor = 1; floor <= 3; floor++) {
      const aptNumber = `${buildings[i].number}-${floor}0${floor}`;
      let apartment = await prisma.apartment.findUnique({ where: { number: aptNumber } });
      if (!apartment) {
        apartment = await prisma.apartment.create({
          data: {
            number: aptNumber,
            floor,
            buildingId: buildings[i].id,
            status: 'EMPTY'
          }
        });
      }
      apartments.push(apartment);
    }
  }
  console.log('✅ 60 Apartments created');

  // ============================================
  // 4. CREATE 40 RESIDENTS
  // ============================================
  const residentPassword = await bcrypt.hash('resident123', 10);
  const residents = [];

  const residentNames = [
    'أحمد', 'محمد', 'علي', 'خالد', 'عمر', 'حسن', 'حسين', 'محمود',
    'إبراهيم', 'يوسف', 'عبدالله', 'سعيد', 'كريم', 'ناصر', 'هاني',
    'طارق', 'مصطفى', 'باسم', 'جمال', 'سامي', 'وائل', 'عادل',
    'أيمن', 'شريف', 'ماجد', 'رامي', 'عمرو', 'زياد', 'لؤي', 'مهند',
    'فادي', 'بسام', 'رائد', 'نضال', 'غسان', 'أنس', 'أوس', 'معاذ',
    'ياسر', 'هشام'
  ];

  for (let i = 0; i < 40; i++) {
    const email = `resident${i + 1}@compound.com`;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) continue;

    const user = await prisma.user.create({
      data: {
        email,
        password: residentPassword,
        role: 'RESIDENT'
      }
    });

    const resident = await prisma.resident.create({
      data: {
        userId: user.id,
        phone: `010${String(10000000 + i).padStart(8, '0')}`,
        nationalId: `290${String(100000000 + i).padStart(9, '0')}`,
        apartmentId: i < 40 ? apartments[i].id : null
      }
    });

    // Mark apartment as OCCUPIED
    if (i < 40) {
      await prisma.apartment.update({
        where: { id: apartments[i].id },
        data: { status: 'OCCUPIED' }
      });
    }

    residents.push(resident);
  }
  console.log('✅ 40 Residents created');

  // ============================================
  // 5. CREATE 39 STAFF
  // ============================================
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staffJobs = [
    'فني كهرباء', 'فني سباكة', 'فني تكييف', 'نجار', 'حداد',
    'نقاش', 'مبلط', 'عامل نظافة', 'بستاني', 'حارس أمن',
    'مشرف أمن', 'محاسب', 'موظف استقبال', 'سكرتير', 'مدير صيانة',
    'فني ألمنيوم', 'فني زجاج', 'دهان', 'عامل بناء', 'سائق',
    'مشرف نظافة', 'فني شبكات', 'فني كاميرات', 'مسؤول مشتريات', 'أمين مستودع',
    'فني أثاث', 'مشرف عمال', 'مراقب جودة', 'مسؤول علاقات', 'مدخل بيانات',
    'فني مياه', 'فني غاز', 'مشرف كهرباء', 'مسؤول مستودع', 'فني أمن',
    'مراقب مباني', 'فني صيانة عامة', 'مساعد إداري', 'مشرف عام'
  ];

  for (let i = 0; i < 39; i++) {
    const email = `staff${i + 1}@compound.com`;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) continue;

    const user = await prisma.user.create({
      data: {
        email,
        password: staffPassword,
        role: 'STAFF'
      }
    });

    await prisma.staff.create({
      data: {
        userId: user.id,
        phone: `011${String(10000000 + i).padStart(8, '0')}`,
        jobTitle: staffJobs[i]
      }
    });
  }
  console.log('✅ 39 Staff created');

  // ============================================
  // 6. CREATE REQUESTS (Complaints & Maintenance)
  // ============================================
  const requestTitles = [
    'تسريب مياه في الحمام', 'انقطاع الكهرباء', 'عطل في التكييف',
    'باب الشقة لا يغلق', 'تسريب غاز', 'مشكلة في السباكة',
    'إضاءة الممر لا تعمل', 'مصعد معطل', 'جرس الباب لا يعمل',
    'تشقق في الجدار', 'نافذة مكسورة', 'تسريب من السقف',
    'مشكلة في التوصيلات الكهربائية', 'سخان الماء لا يعمل', 'مشكلة في الصرف',
    'باب المدخل الرئيسي معطل', 'كاميرات المراقبة لا تعمل', 'إنارة الحديقة معطلة',
    'مشكلة في نظام الإنذار', 'موقف السيارة مسدود'
  ];

  const requestDescriptions = [
    'يوجد تسريب مياه من الحمام العلوي ويحتاج إلى إصلاح عاجل',
    'الكهرباء منقطعة عن الشقة بالكامل منذ الصباح',
    'التكييف لا يبرد بشكل كافي ويحتاج إلى صيانة',
    'باب الشقة الرئيسي لا يغلق بإحكام ويحتاج إلى تعديل',
    'توجد رائحة غاز في المطبخ من فضلكم الإسراع',
    'المياه لا تنزل في الحوض ويحتاج إلى فني سباكة',
    'إضاءة الممر الخارجي لا تعمل منذ يومين',
    'المصعد عالق في الطابق الأرضي ولا يعمل',
    'جرس الباب لا يصدر صوتاً من فضلكم تغييره',
    'يوجد تشقق في جدار غرفة النوم يحتاج إلى معالجة'
  ];

  for (let i = 0; i < 40; i++) {
    const residentId = residents[i % 40].id;
    const staffId = (i < 20) ? (i % 39) + 1 : null;

    await prisma.request.create({
      data: {
        title: requestTitles[i % requestTitles.length],
        description: requestDescriptions[i % requestDescriptions.length],
        type: i % 2 === 0 ? 'MAINTENANCE' : 'COMPLAINT',
        status: i < 10 ? 'OPEN' : i < 20 ? 'IN_PROGRESS' : i < 30 ? 'COMPLETED' : 'CLOSED',
        residentId,
        assignedStaffId: staffId ? (await prisma.staff.findFirst({ skip: staffId - 1 }))?.id : null
      }
    });
  }
  console.log('✅ 40 Requests created');

  // ============================================
  // 7. CREATE VISITORS
  // ============================================
  const visitorNames = [
    'سارة أحمد', 'نور علي', 'مريم خالد', 'هدى عمر', 'دينا محمود',
    'ليلى حسن', 'رنا حسين', 'سلمى إبراهيم', 'ندى يوسف', 'آية عبدالله',
    'شيماء سعيد', 'إيمان كريم', 'منى ناصر', 'هند هاني', 'غادة طارق',
    'ناهد مصطفى', 'إيناس باسم', 'عبير جمال', 'وفاء سامي', 'نوال وائل',
    'فاتن عادل', 'زينب أيمن', 'كوثر شريف', 'رؤى ماجد', 'تسنيم رامي',
    'رحيق عمرو', 'يقين زياد', 'تالا لؤي', 'جود مهند', 'لين فادي'
  ];

  for (let i = 0; i < 30; i++) {
    const residentId = residents[i % 40].id;
    const visitDate = new Date();
    visitDate.setDate(visitDate.getDate() + Math.floor(i / 3));

    await prisma.visitor.create({
      data: {
        residentId,
        name: visitorNames[i],
        phone: `012${String(20000000 + i).padStart(8, '0')}`,
        visitDate,
        status: i < 10 ? 'PENDING' : i < 20 ? 'APPROVED' : 'REJECTED'
      }
    });
  }
  console.log('✅ 30 Visitors created');

  // ============================================
  // 8. CREATE DOCUMENTS
  // ============================================
  for (let i = 0; i < 20; i++) {
    const residentId = residents[i].id;
    const types = ['NATIONAL_ID', 'OWNERSHIP_CONTRACT', 'RENTAL_CONTRACT'];

    await prisma.document.create({
      data: {
        residentId,
        type: types[i % 3],
        fileUrl: `https://res.cloudinary.com/demo/documents/sample_${i + 1}.pdf`
      }
    });
  }
  console.log('✅ 20 Documents created');

  // ============================================
  // 9. CREATE ANNOUNCEMENTS
  // ============================================
  const announcements = [
    { title: 'صيانة دورية للمصاعد', content: 'سيتم إجراء صيانة دورية لجميع المصاعد يوم الجمعة من الساعة ٩ صباحاً حتى ٣ عصراً. نعتذر عن الإزعاج.' },
    { title: 'انقطاع المياه', content: 'سيتم قطع المياه غداً من الساعة ١٠ صباحاً حتى ٢ ظهراً لأعمال الصيانة. يرجى التخزين المؤقت.' },
    { title: 'فعالية اليوم الوطني', content: 'يسر إدارة المجمع دعوتكم لحضور فعالية اليوم الوطني يوم الخميس في الحديقة المركزية. يبدأ البرنامج الساعة ٥ مساءً.' },
    { title: 'تنظيف الخزانات', content: 'سيتم تنظيف خزانات المياه يوم الأحد القادم. يرجى عدم استخدام المياه خلال فترة التنظيف.' },
    { title: 'صيانة شبكة الكهرباء', content: 'سيتم فصل التيار الكهربائي يوم الثلاثاء من الساعة ٨ صباحاً لمدة ٤ ساعات لأعمال الصيانة الدورية.' },
    { title: 'اجتماع مجلس الإدارة', content: 'سيتم عقد اجتماع مجلس الإدارة يوم الأربعاء القادم الساعة ٧ مساءً في قاعة الاجتماعات.' },
    { title: 'تحذير من الاحتيال', content: 'نحذر من التعامل مع أي شخص يدعي تمثيل إدارة المجمع دون إثبات رسمي. يرجى الإبلاغ عن أي اشتباه.' },
    { title: 'عرض خاص للسكان', content: 'خصم ٢٠٪ على خدمات النظافة والصيانة للسكان الجدد. للاستفسار التواصل مع مكتب الإدارة.' },
    { title: 'إغلاق مؤقت للمواقف', content: 'سيتم إغلاق المواقف الجنوبية يوم السبت لأعمال الرصف. يرجى استخدام المواقف الشمالية.' },
    { title: 'ترحيب بالسكان الجدد', content: 'نرحب بالسكان الجدد في مجتمعنا. يرجى زيارة مكتب الإدارة للحصول على بطاقات الدخول.' }
  ];

  for (const ann of announcements) {
    await prisma.announcement.create({
      data: {
        title: ann.title,
        content: ann.content,
        createdById: admin.id
      }
    });
  }
  console.log('✅ 10 Announcements created');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n📊 Seeding Summary:');
  console.log('  👤 Admin: 1');
  console.log('  🏢 Buildings: 20');
  console.log('  🏠 Apartments: 60');
  console.log('  👨‍👩‍👧‍👦 Residents: 40');
  console.log('  👷 Staff: 39');
  console.log('  📋 Requests: 40');
  console.log('  🚶 Visitors: 30');
  console.log('  📄 Documents: 20');
  console.log('  📢 Announcements: 10');
  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n🔑 Login Credentials:');
  console.log('  Admin:    admin@compound.com / admin123');
  console.log('  Resident: resident1@compound.com / resident123');
  console.log('  Staff:    staff1@compound.com / staff123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });