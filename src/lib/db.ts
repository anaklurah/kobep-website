import fs from 'node:fs';
import path from 'node:path';

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  logoText: string;
  faviconUrl: string;
  primaryColor: string; // e.g. #ec4899 or #a855f7
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  author: string;
  headScripts: string;
  telegramLink: string;
  adminPin: string;
  popunderUrl?: string;
  popunderEnabled?: boolean;
  popunderFrequencyHours?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string;
  videoUrl: string;
  thumbUrl: string;
  duration: string;
  category: string;
  views: number;
  likes: number;
  createdAt: string;
  isFeatured?: boolean;
  tags?: string[];
}

export interface AdBanner {
  id: string;
  name: string;
  position: 'header' | 'grid_middle' | 'watch_top' | 'watch_bottom' | 'sticky_bottom';
  type: 'image' | 'script';
  imageUrl?: string;
  targetUrl?: string;
  scriptCode?: string;
  isActive: boolean;
}

export interface Comment {
  id: string;
  videoId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface VideoBrandingSettings {
  enabled: boolean;
  introPath: string;
  outroPath: string;
  watermarkPath: string;
  watermarkText: string;
  watermarkPosition: 'center' | 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  watermarkOpacity: number;
}

export interface DatabaseSchema {
  settings: SiteSettings;
  videoBranding?: VideoBrandingSettings;
  categories: Category[];
  videos: Video[];
  ads: AdBanner[];
  comments: Comment[];
  analytics: {
    totalViews: number;
    dailyViews: Record<string, number>;
  };
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const DEFAULT_DB: DatabaseSchema = {
  settings: {
    siteName: 'KingBokep',
    tagline: 'Streaming Video Terbaru dan Terlengkap Kualitas HD',
    logoUrl: 'https://cdn.kingbokep.video/logo.svg',
    logoText: 'KingBokep',
    faviconUrl: 'https://cdn.kingbokep.video/favicon.ico',
    primaryColor: '#7c3aed', // Dynamic Primary Violet
    metaTitle: 'KingBokep | Streaming Video Bokep Terbaru',
    metaDescription: 'Situs Video Terbaru, Viral dan Update tiap hari bisa ditemukan di website ini KingBokep.',
    metaKeywords: 'video viral, nonton online, streaming lancar, update harian',
    author: 'KingBokep',
    headScripts: '',
    telegramLink: 'https://t.me/kingbokep_tv2',
    adminPin: '123456',
    popunderUrl: 'https://google.com',
    popunderEnabled: false,
    popunderFrequencyHours: 6
  },
  videoBranding: {
    enabled: false,
    introPath: '',
    outroPath: '',
    watermarkPath: '',
    watermarkText: 'Nyalaporn',
    watermarkPosition: 'center',
    watermarkOpacity: 0.35
  },
  categories: [
    { id: 'cat-1', name: 'Bokep Indo', slug: 'bokep-indo', description: 'Koleksi video Indonesia terpopuler' },
    { id: 'cat-2', name: 'Indo Viral', slug: 'indo-viral', description: 'Video skandal viral terupdate' },
    { id: 'cat-3', name: 'Bokep Jepang', slug: 'bokep-jepang', description: 'JAV dan uncensored terbaik' },
    { id: 'cat-4', name: 'JAV Sub Indo', slug: 'jav-sub-indo', description: 'Video subtitle Indonesia' },
    { id: 'cat-5', name: 'Skandal', slug: 'skandal', description: 'Rekaman amatir viral' }
  ],
  videos: [
    {
      id: 'vid-1',
      title: 'Kolpri Kak Anjani Pemain Basket',
      slug: 'kolpri-kak-anjani-pemain-basket',
      description: 'Rekaman video eksklusif Kak Anjani pemain basket viral terbaru.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbUrl: 'https://cdn.kingbokep.video/thumbs/kolpri-kak-anjani-pemain-basket.webp',
      duration: '02:14',
      category: 'Indo Viral',
      views: 14250,
      likes: 890,
      createdAt: '2026-09-10T10:00:00Z',
      tags: ['viral', 'anjani', 'basket']
    },
    {
      id: 'vid-2',
      title: 'Kak Dewi Nugging Demi Pacar',
      slug: 'kak-dewi-nugging-demi-pacar',
      description: 'Video hot Kak Dewi dengan aksi sensual memikat hati.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbUrl: 'https://cdn.kingbokep.video/thumbs/kak-dewi-nugging-demi-pacar.webp',
      duration: '04:20',
      category: 'Bokep Indo',
      views: 18320,
      likes: 1240,
      createdAt: '2026-09-10T12:30:00Z',
      tags: ['indo', 'dewi', 'pacar']
    },
    {
      id: 'vid-3',
      title: 'Ngewe Cewek Fisip Montok',
      slug: 'ngewe-cewek-fisip-montok',
      description: 'Video mahasiswi fisip montok goyang panas di kamar.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbUrl: 'https://cdn.kingbokep.video/thumbs/ngewe-cewek-fisip-montok.webp',
      duration: '03:25',
      category: 'Bokep Indo',
      views: 22100,
      likes: 1650,
      createdAt: '2026-09-09T15:20:00Z',
      tags: ['fisip', 'montok', 'mahasiswi']
    },
    {
      id: 'vid-4',
      title: 'Subuh-Subuh Masuk Kamar Ponakan',
      slug: 'subuh-subuh-masuk-kamar-ponakan',
      description: 'Kisah seru masuk kamar saat subuh bikin tegang.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbUrl: 'https://cdn.kingbokep.video/thumbs/subuh-subuh-masuk-kamar-ponakan.webp',
      duration: '06:04',
      category: 'Skandal',
      views: 31400,
      likes: 2190,
      createdAt: '2026-09-08T08:15:00Z',
      tags: ['subuh', 'ponakan', 'skandal']
    },
    {
      id: 'vid-5',
      title: 'Gen-Z Main Diparkiran Malah Tambah Nafsu',
      slug: 'gen-z-main-diparkiran-malah-tambah-nafsu',
      description: 'Aksi nekat pasangan Gen-Z di area parkiran malam hari.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbUrl: 'https://cdn.kingbokep.video/thumbs/gen-z-main-diparkiran-malah-tambah-nafsu.webp',
      duration: '04:33',
      category: 'Indo Viral',
      views: 19800,
      likes: 1410,
      createdAt: '2026-09-07T21:40:00Z',
      tags: ['gen-z', 'parkiran', 'viral']
    },
    {
      id: 'vid-6',
      title: 'Skandal Hijab Mirip Influencer Terkenal',
      slug: 'skandal-hijab-mirip-influencer-terkenal',
      description: 'Video skandal hijab selebgram viral bikin heboh warganet.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbUrl: 'https://cdn.kingbokep.video/thumbs/skandal-hijab-mirip-influencer-terkenal.webp',
      duration: '04:16',
      category: 'Indo Viral',
      views: 27500,
      likes: 1890,
      createdAt: '2026-09-06T19:10:00Z',
      tags: ['hijab', 'influencer', 'skandal']
    },
    {
      id: 'vid-7',
      title: 'Kolpri Delia Selebgram Cantik',
      slug: 'kolpri-delia-selebgram-cantik',
      description: 'Koleksi pribadi Delia selebgram manis kulit putih mulus.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      thumbUrl: 'https://cdn.kingbokep.video/thumbs/kolpri-delia-selebgram-cantik.webp',
      duration: '05:22',
      category: 'Bokep Indo',
      views: 24300,
      likes: 1730,
      createdAt: '2026-09-05T14:30:00Z',
      tags: ['delia', 'selebgram', 'cantik']
    },
    {
      id: 'vid-8',
      title: 'Bu Guru Jilbab Syumilde Kena Doggy',
      slug: 'bu-guru-jilbab-syumilde-kena-doggy',
      description: 'Video hot bu guru jilbab kena goyang nikmat gaya doggy.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbUrl: 'https://cdn.kingbokep.video/thumbs/bu-guru-jilbab-syumilde-kena-doggy.webp',
      duration: '08:23',
      category: 'Bokep Indo',
      views: 38900,
      likes: 2950,
      createdAt: '2026-09-04T11:00:00Z',
      tags: ['guru', 'jilbab', 'syumilde']
    },
    {
      id: 'vid-9',
      title: 'Desahan Enak Bu Guru Syumilde',
      slug: 'desahan-enak-bu-guru-syumilde',
      description: 'Suara desahan merdu bu guru bikin merinding keenakan.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
      thumbUrl: 'https://cdn.kingbokep.video/thumbs/desahan-enak-bu-guru-syumilde.webp',
      duration: '05:57',
      category: 'Bokep Indo',
      views: 16700,
      likes: 1120,
      createdAt: '2026-09-03T16:45:00Z',
      tags: ['desahan', 'guru']
    },
    {
      id: 'vid-10',
      title: 'Tante Cindo Selingkuh Ngewe Ponakan',
      slug: 'tante-cindo-selingkuh-ngewe-ponakan',
      description: 'Tante cindo montok ajak ponakan ena-ena saat rumah sepi.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbUrl: 'https://cdn.kingbokep.video/thumbs/tante-cindo-selingkuh-ngewe-ponakan.webp',
      duration: '07:08',
      category: 'Skandal',
      views: 34100,
      likes: 2410,
      createdAt: '2026-09-02T13:20:00Z',
      tags: ['tante', 'cindo', 'selingkuh']
    }
  ],
  ads: [
    {
      id: 'ad-1',
      name: 'Banner Header Promo',
      position: 'header',
      type: 'image',
      imageUrl: 'https://cdn.kingbokep.video/thumbs/june_header_penta.webp',
      targetUrl: 'https://google.com',
      isActive: true
    },
    {
      id: 'ad-2',
      name: 'Banner Tengah Grid Video',
      position: 'grid_middle',
      type: 'image',
      imageUrl: 'https://cdn.kingbokep.video/thumbs/june_middle_kaiko.webp',
      targetUrl: 'https://google.com',
      isActive: true
    },
    {
      id: 'ad-3',
      name: 'Banner Footer / Bawah Player',
      position: 'watch_bottom',
      type: 'image',
      imageUrl: 'https://cdn.kingbokep.video/thumbs/june_footer_ratu.webp',
      targetUrl: 'https://google.com',
      isActive: true
    }
  ],
  comments: [
    {
      id: 'comm-1',
      videoId: 'vid-1',
      authorName: 'Rian99',
      authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rian99',
      content: 'Gila mantap banget update-nya min, jernih parah!',
      createdAt: '2026-09-11T09:20:00Z',
      likes: 15
    },
    {
      id: 'comm-2',
      videoId: 'vid-1',
      authorName: 'SultanSange',
      authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SultanSange',
      content: 'Ditunggu part selanjutnya min, jangan lupa durasi panjangnya.',
      createdAt: '2026-09-11T11:45:00Z',
      likes: 8
    },
    {
      id: 'comm-3',
      videoId: 'vid-2',
      authorName: 'Budi_Santoso',
      authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Budi_Santoso',
      content: 'Websitenya enteng banget pas dipake nonton, ga buffering sama sekali.',
      createdAt: '2026-09-11T14:10:00Z',
      likes: 12
    }
  ],
  analytics: {
    totalViews: 207170,
    dailyViews: {
      '2026-09-08': 28400,
      '2026-09-09': 34200,
      '2026-09-10': 39100,
      '2026-09-11': 45200,
      '2026-09-12': 60270
    }
  }
};

function ensureDbFile(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
  }
}

export function getDb(): DatabaseSchema {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading db:', err);
    return DEFAULT_DB;
  }
}

export function saveDb(data: DatabaseSchema): void {
  ensureDbFile();
  const tempPath = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}
