import { useLanguage } from '../context/LanguageContext';

const en = {
  nav: {
    about: 'About Us',
    packages: 'Packages',
    whyUs: 'Why Us',
    portfolio: 'Portfolio',
    testimonials: 'Testimonials',
    contact: 'Contact',
    projects: 'Projects',
    skills: 'Skills',
    letsTalk: "Let's Talk",
    companyWeb: 'Company Web',
    orderNow: 'Order Now',
  },
  hero: {
    greeting: 'Hi I am',
    viewProjects: 'View Projects',
    downloadCV: 'Download CV',
    availability: 'Available for freelance projects',
    projectsShipped: 'Projects shipped',
    badge: 'Available for New Project',
    headline: 'Web Dev & AI Engineer',
    description1: 'GabzDev is a one-person studio that helps small businesses, students, and startups look professional online, with websites that are fast, clean, and easy to use.',
    description2: 'Every project is built directly, not from a copy-pasted template. Clean code, design tailored to your brand, and honest communication all the way through.',
    bullets: {
      direct: 'Built directly, not template',
      tailored: 'Design tailored to your brand',
      support: '24/7 support on WhatsApp',
      transparent: 'Transparent, no hidden fees',
    },
    ctaOrder: 'Order Now',
    ctaPortfolio: 'See Portfolio',
  },
  stats: {
    clientRating: 'Client Rating',
    happyClients: 'Happy Clients',
    websitesDelivered: 'Websites Delivered',
    whatsappSupport: 'WhatsApp Support',
    freeRevisions: 'Free Revisions',
  },
  whatsappFloating: {
    label: 'Chat on WhatsApp',
    aria: 'Chat on WhatsApp',
    defaultMessage: 'Halo GabzDev, saya tertarik dengan jasa pembuatan website.',
  },
  packages: {
    label: 'Pricing',
    title: 'Website Packages',
    subtitle: 'Pick the package that fits your needs. Every tier includes unlimited revisions and 24/7 WhatsApp support.',
    ctaDetail: 'Order This Package',
    perPackage: '/package',
    popular: 'Most Popular',
    items: [
      {
        badge: 'Basic',
        rating: '4.8',
        name: 'Starter Package',
        description: 'A budget-friendly solution for small businesses just going digital. A professional landing page with full features.',
        price: 'Rp 100,000',
        features: [
          '1-Page Landing Page',
          'Mobile & Desktop Responsive Design',
          'WhatsApp & Social Media Integration',
          'Free .my.id or .biz.id Domain',
        ],
      },
      {
        badge: 'Standard',
        rating: '4.9',
        name: 'Growth Package',
        description: 'Perfect for businesses that need a more complete website with a product gallery and a modern look.',
        price: 'Rp 450,000',
        features: [
          'Up to 3 Main Pages',
          'Interactive Product Gallery',
          'Modern UI/UX Design',
          'Free .com Domain (1 Year)',
        ],
      },
      {
        badge: 'Premium',
        rating: '5.0',
        name: 'Success Package',
        description: 'The most complete features for e-commerce, with a cart system, payment gateway, and admin dashboard.',
        price: 'Rp 1,000,000',
        features: [
          'Full Multipage Website (7 Pages)',
          'Cart & Checkout System',
          'Payment Gateway Integration',
          'Admin Dashboard + Basic SEO',
        ],
      },
    ],
  },
  about: {
    label: 'About Me',
    title: 'About Me',
    subtitle:
      'Freelance full-stack developer with hands-on experience building top-up and e-commerce web apps on Vercel, Supabase, and Firebase, school payment systems, and projects for clients abroad. I move fast by vibecoding with AI tools without cutting corners on quality.',
    skills: [
      'Web Development (Full-Stack)',
      'DevOps & Cloud Infrastructure',
      'AI Automation Engineering',
      'AI Engineering & Data',
    ],
  },
  services: {
    label: 'Services',
    title: 'Website & App Development Services',
    subtitle:
      'From development to deployment. Websites and apps built to run fast, stay stable, and keep working after launch.',
    readMore: 'Read more',
    items: [
      {
        title: 'Website Development',
        description:
          'Building fast, responsive websites, from landing pages and company profiles to e-commerce and custom dashboards, all coded from scratch.',
      },
      {
        title: 'App Development',
        description:
          'Building mobile and web applications tailored to your business needs, from concept to deployment.',
      },
      {
        title: 'Performance Optimization',
        description:
          'Making sure every website and app loads fast, runs smoothly, and stays stable under real-world traffic.',
      },
      {
        title: 'Bug-Fix Guarantee',
        description:
          'Every project ships with a bug-fix guarantee after launch. If something breaks, I fix it at no extra charge.',
      },
    ],
  },
  portfolio: {
    label: 'Portfolio',
    title: 'My Portfolio',
    subtitle:
      'A collection of real projects built with dedication, coding skill, and a passion for exploring technology.',
    filters: { all: 'All', uiux: 'UI/UX', web: 'Website Design', app: 'App Design', graphic: 'Graphic Design' },
    viewDetail: 'View Detail',
    livePreview: 'Live Preview',
    close: 'Close',
    techStack: 'Tech Stack',
    empty: 'No projects in this category yet.',
    swipeHint: 'Scroll to see more projects',
    viewAll: 'View All Projects',
    caseStudy: 'Case Study',
    liveDemo: 'Live Demo',
    repository: 'Repository',
    otherProjects: 'Other Projects',
    thatsIt: "That's the highlight reel.",
    moreOnGithub: 'More on GitHub',
    pinnedLabel: 'Featured',
    zoomImage: 'Zoom image',
    galleryHint: 'Click the image to zoom fullscreen',
  },
  allProjects: {
    label: 'Project Archive',
    title: 'All Projects',
    subtitle: "Every project I've built so far. Filter by category to find what you're looking for.",
    back: 'Back to Home',
    countSuffix: 'projects',
  },
  testimonials: {
    label: 'Collaboration',
    title: 'Collaboration Testimonials',
    subtitle: 'What clients and partners who have collaborated with GabzDev have to say.',
    readFull: 'Read full testimonial',
    detailTitle: 'Testimonial Detail',
    chatWa: 'Chat on WhatsApp',
    close: 'Close',
  },
  trustedBy: {
    label: 'Trusted By',
    title: 'Trusted By',
    subtitle: 'Brands, schools, and clients whose digital products I have helped build and maintain.',
  },
  aiWorkflow: {
    label: 'How I Work',
    title: 'Why I Build With AI',
    body: "I use AI tools to move faster, not to skip thinking things through. AI handles the repetitive parts (boilerplate, first-draft code, quick research) so I can spend more time on architecture, edge cases, and actually understanding what a client needs. Every line still gets reviewed and tested before it ships. That's how I hit tight freelance timelines without cutting corners on quality.",
  },
  whyHire: {
    label: 'Why Hire Me',
    title: 'Why Work With Me',
    subtitle: 'Not just clean code, but someone easy to work with who keeps things moving.',
    items: [
      {
        title: 'Fast & Efficient',
        description: 'Built with a modern stack and AI-assisted workflow, so things ship quickly without cutting corners.',
      },
      {
        title: 'Flexible Stack',
        description: 'Comfortable across frontend, backend, and databases. The solution fits your needs, not the other way around.',
      },
      {
        title: 'Easy to Reach',
        description: 'Direct communication over WhatsApp, Telegram, or email. Clear progress from start to finish.',
      },
      {
        title: 'Clean & Reliable',
        description: 'Readable, secure, well-documented code that stays easy to maintain and extend later.',
      },
    ],
  },
  contact: {
    label: 'Contact',
    title: 'Order? Contact Us.',
    subtitle: 'Pick a channel below to start a conversation.',
    clickToOrder: 'Click an icon to start your order',
    testimonialsLabel: 'What clients say',
  },
  footer: {
    tagline:
      'Web Developer & Tech Enthusiast. Building functional, responsive, and impactful digital solutions.',
    navigation: 'Navigation',
    connect: 'Connect',
    sendMessage: 'Send a Message',
    namePlaceholder: 'Your Name',
    messagePlaceholder: 'Your Message',
    sendWA: 'Send via WhatsApp',
    poweredBy: 'Powered by Passion & React',
    rights: 'GabzDev. All rights reserved.',
  },
};

type Dict = typeof en;

const id: Dict = {
  nav: {
    about: 'Tentang',
    packages: 'Paket',
    whyUs: 'Kenapa Kami',
    portfolio: 'Portofolio',
    testimonials: 'Testimoni',
    contact: 'Kontak',
    projects: 'Proyek',
    skills: 'Keahlian',
    letsTalk: 'Hubungi',
    companyWeb: 'Web Perusahaan',
    orderNow: 'Pesan Sekarang',
  },
  hero: {
    greeting: 'Halo saya',
    viewProjects: 'Lihat Proyek',
    downloadCV: 'Unduh CV',
    availability: 'Terbuka untuk proyek freelance',
    projectsShipped: 'Proyek selesai',
    badge: 'Terbuka untuk Proyek Baru',
    headline: 'Web Dev & AI Engineer',
    description1: 'GabzDev adalah studio satu orang yang fokus bantu bisnis kecil, pelajar, dan startup tampil profesional online lewat website yang cepat, bersih, dan enak dipakai.',
    description2: 'Setiap proyek digarap langsung, bukan copy-paste template. Kode rapi, desain nyesuain karakter brand, dan komunikasi terbuka dari awal sampai selesai.',
    bullets: {
      direct: 'Digarap langsung, bukan template',
      tailored: 'Desain nyesuain karakter brand',
      support: 'Dukungan 24/7 lewat WhatsApp',
      transparent: 'Transparan, tanpa biaya tersembunyi',
    },
    ctaOrder: 'Pesan Sekarang',
    ctaPortfolio: 'Lihat Portofolio',
  },
  stats: {
    clientRating: 'Rating Klien',
    happyClients: 'Klien Puas',
    websitesDelivered: 'Website Selesai',
    whatsappSupport: 'Dukungan WhatsApp',
    freeRevisions: 'Revisi Gratis',
  },
  whatsappFloating: {
    label: 'Chat WhatsApp',
    aria: 'Chat via WhatsApp',
    defaultMessage: 'Halo GabzDev, saya tertarik dengan jasa pembuatan website.',
  },
  packages: {
    label: 'Harga',
    title: 'Paket Website',
    subtitle: 'Pilih paket yang sesuai kebutuhan kamu. Semua paket dapat revisi unlimited dan support WhatsApp 24/7.',
    ctaDetail: 'Pesan Paket Ini',
    perPackage: '/paket',
    popular: 'Terpopuler',
    items: [
      {
        badge: 'Basic',
        rating: '4.8',
        name: 'Paket Rintisan',
        description: 'Solusi hemat untuk UMKM pemula yang baru go-digital. Landing page profesional dengan fitur lengkap.',
        price: 'Rp 100.000',
        features: [
          'Landing Page 1 Halaman',
          'Desain Responsif Mobile & Desktop',
          'Integrasi WhatsApp & Sosmed',
          'Gratis Domain .my.id atau .biz.id',
        ],
      },
      {
        badge: 'Standard',
        rating: '4.9',
        name: 'Paket Berkembang',
        description: 'Sempurna untuk bisnis yang butuh website lebih lengkap dengan galeri produk dan tampilan modern.',
        price: 'Rp 450.000',
        features: [
          'Hingga 3 Halaman Utama',
          'Galeri Produk Interaktif',
          'Desain UI/UX Modern',
          'Gratis Domain .com (1 Tahun)',
        ],
      },
      {
        badge: 'Premium',
        rating: '5.0',
        name: 'Paket Sukses',
        description: 'Fitur terlengkap untuk e-commerce dengan sistem keranjang, payment gateway, dan dashboard admin.',
        price: 'Rp 1.000.000',
        features: [
          'Full Website Multipage (7 Halaman)',
          'Sistem Keranjang & Checkout',
          'Payment Gateway Integration',
          'Dashboard Admin + SEO Basic',
        ],
      },
    ],
  },
  about: {
    label: 'Tentang Saya',
    title: 'Tentang Saya',
    subtitle: 'Punya pengalaman freelance bikin web topup dan e-commerce pakai Vercel, Supabase, dan Firebase, proyek sistem pembayaran sekolah, sampai kerja bareng klien dari luar negeri. Terbiasa gerak cepat lewat vibecoding pakai AI tanpa ngorbanin kualitas.',
    skills: [
      'Web Development (Full-Stack)',
      'DevOps & Cloud Infrastructure',
      'AI Automation Engineering',
      'AI Engineering & Data',
    ],
  },
  services: {
    label: 'Layanan',
    title: 'Layanan Pengembangan Aplikasi & Website',
    subtitle: 'Dari development sampai deployment. Website dan aplikasi yang dibangun buat loading cepat, stabil, dan tetap jalan setelah rilis.',
    readMore: 'Selengkapnya',
    items: [
      {
        title: 'Pengembangan Website',
        description:
          'Bangun website yang cepat dan responsif, mulai dari landing page, company profile, e-commerce, sampai dashboard custom, semua di-coding dari nol.',
      },
      {
        title: 'Pengembangan Aplikasi',
        description:
          'Bangun aplikasi mobile dan web yang disesuaikan sama kebutuhan bisnis kamu, dari konsep sampai deployment.',
      },
      {
        title: 'Optimasi Performa',
        description:
          'Memastikan tiap website dan aplikasi loading cepat, jalan mulus, dan tetap stabil meski trafiknya lagi tinggi.',
      },
      {
        title: 'Garansi Bebas Bug',
        description:
          'Setiap project dapat garansi perbaikan bug setelah rilis. Kalau ada yang error, langsung gue benerin, tanpa biaya tambahan.',
      },
    ],
  },
  portfolio: {
    label: 'Portofolio',
    title: 'Portofolio Saya',
    subtitle: 'Kumpulan proyek nyata yang dibangun dengan dedikasi, keterampilan coding, dan semangat eksplorasi teknologi.',
    filters: { all: 'Semua', uiux: 'UI/UX', web: 'Website Design', app: 'App Design', graphic: 'Graphic Design' },
    viewDetail: 'Lihat Detail',
    livePreview: 'Live Preview',
    close: 'Tutup',
    techStack: 'Tech Stack',
    empty: 'Belum ada proyek dalam kategori ini.',
    swipeHint: 'Scroll buat lihat proyek lainnya',
    viewAll: 'Lihat Semua Proyek',
    caseStudy: 'Case Study',
    liveDemo: 'Live Demo',
    repository: 'Repository',
    otherProjects: 'Proyek Lainnya',
    thatsIt: 'Itu highlight-nya.',
    moreOnGithub: 'Selengkapnya di GitHub',
    pinnedLabel: 'Unggulan',
    zoomImage: 'Perbesar gambar',
    galleryHint: 'Klik gambarnya untuk zoom fullscreen',
  },
  allProjects: {
    label: 'Arsip Proyek',
    title: 'Semua Proyek',
    subtitle: 'Semua proyek yang pernah gue bangun. Filter berdasarkan kategori buat nemuin yang kamu cari.',
    back: 'Kembali ke Beranda',
    countSuffix: 'proyek',
  },
  testimonials: {
    label: 'Kolaborasi',
    title: 'Testimoni Kolaborasi',
    subtitle: 'Apa yang dikatakan oleh klien dan mitra yang pernah berkolaborasi bersama GabzDev.',
    readFull: 'Baca testimoni lengkap',
    detailTitle: 'Detail Testimoni',
    chatWa: 'Chat WhatsApp',
    close: 'Tutup',
  },
  trustedBy: {
    label: 'Dipercaya Oleh',
    title: 'Dipercaya Oleh',
    subtitle: 'Brand, sekolah, dan klien yang produk digitalnya pernah saya bangun dan rawat.',
  },
  aiWorkflow: {
    label: 'Cara Kerja Saya',
    title: 'Kenapa Saya Pakai AI Buat Kerjaan',
    body: 'Gue pakai tools AI buat gerak lebih cepat, bukan buat ngelewatin proses mikir. AI yang ngerjain bagian repetitif kayak boilerplate, draft kode awal, riset cepat, jadi gue bisa fokus lebih banyak ke arsitektur, edge case, dan bener-bener paham kebutuhan client. Semua kode tetep di-review dan ditest sebelum rilis. Ini caranya gue bisa ngejar deadline freelance yang ketat tanpa ngorbanin kualitas.',
  },
  whyHire: {
    label: 'Kenapa Rekrut Saya',
    title: 'Kenapa Kerja Bareng Saya',
    subtitle: 'Bukan cuma kode yang rapi, tapi juga enak diajak kerja dan bikin progres terus jalan.',
    items: [
      {
        title: 'Cepat & Efisien',
        description: 'Dibangun pakai stack modern dan alur kerja AI, jadi cepat kelar tanpa asal jadi.',
      },
      {
        title: 'Stack Fleksibel',
        description: 'Nyaman di frontend, backend, maupun database. Solusinya nyesuain kebutuhanmu, bukan sebaliknya.',
      },
      {
        title: 'Gampang Dihubungi',
        description: 'Komunikasi langsung lewat WhatsApp, Telegram, atau email. Progres jelas dari awal sampai selesai.',
      },
      {
        title: 'Rapi & Bisa Diandalkan',
        description: 'Kode bersih, aman, terdokumentasi, jadi gampang dirawat dan dikembangin nanti.',
      },
    ],
  },
  contact: {
    label: 'Kontak',
    title: 'Order? Contact Us.',
    subtitle: 'Pilih salah satu channel di bawah buat mulai ngobrol.',
    clickToOrder: 'Klik salah satu ikon buat mulai pesan',
    testimonialsLabel: 'Kata klien',
  },
  footer: {
    tagline:
      'Web Developer & Tech Enthusiast. Membangun solusi digital yang fungsional, responsif, dan berdampak.',
    navigation: 'Navigasi',
    connect: 'Terhubung',
    sendMessage: 'Kirim Pesan',
    namePlaceholder: 'Nama Anda',
    messagePlaceholder: 'Pesan Anda',
    sendWA: 'Kirim via WhatsApp',
    poweredBy: 'Powered by Passion & React',
    rights: 'GabzDev. Hak cipta dilindungi.',
  },
};

const dictionaries = { en, id };

export function useTranslation() {
  const { language, setLanguage } = useLanguage();
  return { t: dictionaries[language], language, setLanguage };
}
