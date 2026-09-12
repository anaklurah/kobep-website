import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

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
  previewThumbs?: string[];
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
  adminAuth?: {
    username: string;
    passwordHash: string;
  };
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
const SQLITE_FILE = path.join(DB_DIR, 'database.sqlite');
const JSON_BACKUP_FILE = path.join(DB_DIR, 'db.json');

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

let sqliteInstance: Database.Database | null = null;

function initTablesAndSeed(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      siteName TEXT,
      tagline TEXT,
      logoUrl TEXT,
      logoText TEXT,
      faviconUrl TEXT,
      primaryColor TEXT,
      metaTitle TEXT,
      metaDescription TEXT,
      metaKeywords TEXT,
      author TEXT,
      headScripts TEXT,
      telegramLink TEXT,
      adminPin TEXT,
      popunderUrl TEXT,
      popunderEnabled INTEGER,
      popunderFrequencyHours INTEGER
    );

    CREATE TABLE IF NOT EXISTS admin_auth (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      username TEXT NOT NULL,
      passwordHash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS video_branding (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      enabled INTEGER,
      introPath TEXT,
      outroPath TEXT,
      watermarkPath TEXT,
      watermarkText TEXT,
      watermarkPosition TEXT,
      watermarkOpacity REAL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      videoUrl TEXT NOT NULL,
      thumbUrl TEXT,
      duration TEXT,
      category TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      createdAt TEXT,
      isFeatured INTEGER DEFAULT 0,
      tags TEXT,
      previewThumbs TEXT
    );

    CREATE TABLE IF NOT EXISTS ads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      type TEXT NOT NULL,
      imageUrl TEXT,
      targetUrl TEXT,
      scriptCode TEXT,
      isActive INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      videoId TEXT NOT NULL,
      authorName TEXT NOT NULL,
      authorAvatar TEXT,
      content TEXT NOT NULL,
      createdAt TEXT,
      likes INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      totalViews INTEGER DEFAULT 0,
      dailyViews TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
    CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos(slug);
    CREATE INDEX IF NOT EXISTS idx_comments_videoId ON comments(videoId);
  `);

  try {
    db.exec(`ALTER TABLE videos ADD COLUMN previewThumbs TEXT;`);
  } catch {}

  const row = db.prepare('SELECT count(*) as cnt FROM settings').get() as { cnt: number } | undefined;
  if (!row || row.cnt === 0) {
    let seedData = DEFAULT_DB;
    if (fs.existsSync(JSON_BACKUP_FILE)) {
      try {
        const raw = fs.readFileSync(JSON_BACKUP_FILE, 'utf-8');
        seedData = JSON.parse(raw) as DatabaseSchema;
      } catch (err) {
        console.error('Failed to parse existing db.json for SQLite migration, using defaults:', err);
      }
    }

    const migrateTx = db.transaction(() => {
      const s = seedData.settings || DEFAULT_DB.settings;
      db.prepare(`
        INSERT OR REPLACE INTO settings (
          id, siteName, tagline, logoUrl, logoText, faviconUrl, primaryColor,
          metaTitle, metaDescription, metaKeywords, author, headScripts,
          telegramLink, adminPin, popunderUrl, popunderEnabled, popunderFrequencyHours
        ) VALUES (
          1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `).run(
        s.siteName || 'KingBokep',
        s.tagline || '',
        s.logoUrl || '',
        s.logoText || '',
        s.faviconUrl || '',
        s.primaryColor || '#7c3aed',
        s.metaTitle || '',
        s.metaDescription || '',
        s.metaKeywords || '',
        s.author || '',
        s.headScripts || '',
        s.telegramLink || '',
        s.adminPin || '123456',
        s.popunderUrl || '',
        s.popunderEnabled ? 1 : 0,
        s.popunderFrequencyHours || 6
      );

      const auth = seedData.adminAuth || {
        username: 'adminkd',
        passwordHash: '$2a$10$QPiPr/PXmq6YZBGgiT2vWOmCufqECXhQw3/WTC2rhZXBP.iUDkwgS'
      };
      db.prepare(`
        INSERT OR REPLACE INTO admin_auth (id, username, passwordHash)
        VALUES (1, ?, ?)
      `).run(auth.username, auth.passwordHash);

      const vb = seedData.videoBranding || DEFAULT_DB.videoBranding;
      if (vb) {
        db.prepare(`
          INSERT OR REPLACE INTO video_branding (
            id, enabled, introPath, outroPath, watermarkPath, watermarkText, watermarkPosition, watermarkOpacity
          ) VALUES (1, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          vb.enabled ? 1 : 0,
          vb.introPath || '',
          vb.outroPath || '',
          vb.watermarkPath || '',
          vb.watermarkText || 'Nyalaporn',
          vb.watermarkPosition || 'center',
          vb.watermarkOpacity ?? 0.35
        );
      }

      const insertCat = db.prepare(`
        INSERT OR REPLACE INTO categories (id, name, slug, description, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `);
      (seedData.categories || []).forEach((c, idx) => {
        insertCat.run(c.id || `cat-${idx + 1}`, c.name, c.slug, c.description || '', c.order || idx);
      });

      const insertVid = db.prepare(`
        INSERT OR REPLACE INTO videos (
          id, title, slug, description, videoUrl, thumbUrl, duration, category, views, likes, createdAt, isFeatured, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      (seedData.videos || []).forEach((v, idx) => {
        insertVid.run(
          v.id || `vid-${idx + 1}`,
          v.title,
          v.slug,
          v.description || '',
          v.videoUrl,
          v.thumbUrl || '',
          v.duration || '03:00',
          v.category,
          v.views || 0,
          v.likes || 0,
          v.createdAt || new Date().toISOString(),
          v.isFeatured ? 1 : 0,
          JSON.stringify(v.tags || [])
        );
      });

      const insertAd = db.prepare(`
        INSERT OR REPLACE INTO ads (id, name, position, type, imageUrl, targetUrl, scriptCode, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      (seedData.ads || []).forEach((a, idx) => {
        insertAd.run(
          a.id || `ad-${idx + 1}`,
          a.name,
          a.position,
          a.type,
          a.imageUrl || '',
          a.targetUrl || '',
          a.scriptCode || '',
          a.isActive ? 1 : 0
        );
      });

      const insertComm = db.prepare(`
        INSERT OR REPLACE INTO comments (id, videoId, authorName, authorAvatar, content, createdAt, likes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      (seedData.comments || []).forEach((cm, idx) => {
        insertComm.run(
          cm.id || `comm-${idx + 1}`,
          cm.videoId,
          cm.authorName,
          cm.authorAvatar || '',
          cm.content,
          cm.createdAt || new Date().toISOString(),
          cm.likes || 0
        );
      });

      const an = seedData.analytics || DEFAULT_DB.analytics;
      db.prepare(`
        INSERT OR REPLACE INTO analytics (id, totalViews, dailyViews)
        VALUES (1, ?, ?)
      `).run(
        an.totalViews || 0,
        JSON.stringify(an.dailyViews || {})
      );
    });

    migrateTx();
  }
}

export function getSqliteDb(): Database.Database {
  if (!sqliteInstance) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    sqliteInstance = new Database(SQLITE_FILE);
    sqliteInstance.pragma('journal_mode = WAL');
    sqliteInstance.pragma('foreign_keys = ON');
    initTablesAndSeed(sqliteInstance);
  }
  return sqliteInstance;
}

export function getDb(): DatabaseSchema {
  const db = getSqliteDb();

  const sRow = db.prepare('SELECT * FROM settings WHERE id = 1').get() as any;
  const settings: SiteSettings = sRow
    ? {
        siteName: sRow.siteName,
        tagline: sRow.tagline,
        logoUrl: sRow.logoUrl,
        logoText: sRow.logoText,
        faviconUrl: sRow.faviconUrl,
        primaryColor: sRow.primaryColor,
        metaTitle: sRow.metaTitle,
        metaDescription: sRow.metaDescription,
        metaKeywords: sRow.metaKeywords,
        author: sRow.author,
        headScripts: sRow.headScripts,
        telegramLink: sRow.telegramLink,
        adminPin: sRow.adminPin,
        popunderUrl: sRow.popunderUrl,
        popunderEnabled: Boolean(sRow.popunderEnabled),
        popunderFrequencyHours: sRow.popunderFrequencyHours
      }
    : DEFAULT_DB.settings;

  const authRow = db.prepare('SELECT * FROM admin_auth WHERE id = 1').get() as any;
  const adminAuth = authRow
    ? {
        username: authRow.username,
        passwordHash: authRow.passwordHash
      }
    : {
        username: 'adminkd',
        passwordHash: '$2a$10$QPiPr/PXmq6YZBGgiT2vWOmCufqECXhQw3/WTC2rhZXBP.iUDkwgS'
      };

  const vbRow = db.prepare('SELECT * FROM video_branding WHERE id = 1').get() as any;
  const videoBranding: VideoBrandingSettings = vbRow
    ? {
        enabled: Boolean(vbRow.enabled),
        introPath: vbRow.introPath || '',
        outroPath: vbRow.outroPath || '',
        watermarkPath: vbRow.watermarkPath || '',
        watermarkText: vbRow.watermarkText || 'Nyalaporn',
        watermarkPosition: vbRow.watermarkPosition || 'center',
        watermarkOpacity: vbRow.watermarkOpacity ?? 0.35
      }
    : DEFAULT_DB.videoBranding!;

  const catRows = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all() as any[];
  const categories: Category[] = catRows.map(r => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description || '',
    order: r.sort_order
  }));

  const vidRows = db.prepare('SELECT * FROM videos ORDER BY datetime(createdAt) DESC').all() as any[];
  const videos: Video[] = vidRows.map(r => {
    let tags: string[] = [];
    try {
      tags = r.tags ? JSON.parse(r.tags) : [];
    } catch {
      tags = [];
    }
    let previewThumbs: string[] = [];
    try {
      previewThumbs = r.previewThumbs ? JSON.parse(r.previewThumbs) : [];
    } catch {
      previewThumbs = [];
    }
    return {
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description || '',
      videoUrl: r.videoUrl,
      thumbUrl: r.thumbUrl || '',
      duration: r.duration || '03:00',
      category: r.category,
      views: Number(r.views || 0),
      likes: Number(r.likes || 0),
      createdAt: r.createdAt,
      isFeatured: Boolean(r.isFeatured),
      tags,
      previewThumbs
    };
  });

  const adRows = db.prepare('SELECT * FROM ads').all() as any[];
  const ads: AdBanner[] = adRows.map(r => ({
    id: r.id,
    name: r.name,
    position: r.position,
    type: r.type,
    imageUrl: r.imageUrl || '',
    targetUrl: r.targetUrl || '',
    scriptCode: r.scriptCode || '',
    isActive: Boolean(r.isActive)
  }));

  const commRows = db.prepare('SELECT * FROM comments ORDER BY datetime(createdAt) DESC').all() as any[];
  const comments: Comment[] = commRows.map(r => ({
    id: r.id,
    videoId: r.videoId,
    authorName: r.authorName,
    authorAvatar: r.authorAvatar || '',
    content: r.content,
    createdAt: r.createdAt,
    likes: Number(r.likes || 0)
  }));

  const anRow = db.prepare('SELECT * FROM analytics WHERE id = 1').get() as any;
  let dailyViews: Record<string, number> = {};
  if (anRow && anRow.dailyViews) {
    try {
      dailyViews = JSON.parse(anRow.dailyViews);
    } catch {
      dailyViews = {};
    }
  }
  const analytics = {
    totalViews: anRow ? Number(anRow.totalViews || 0) : 0,
    dailyViews
  };

  return {
    settings,
    adminAuth,
    videoBranding,
    categories,
    videos,
    ads,
    comments,
    analytics
  };
}

export function saveDb(data: DatabaseSchema): void {
  const db = getSqliteDb();

  const tx = db.transaction(() => {
    if (data.settings) {
      const s = data.settings;
      db.prepare(`
        INSERT OR REPLACE INTO settings (
          id, siteName, tagline, logoUrl, logoText, faviconUrl, primaryColor,
          metaTitle, metaDescription, metaKeywords, author, headScripts,
          telegramLink, adminPin, popunderUrl, popunderEnabled, popunderFrequencyHours
        ) VALUES (
          1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `).run(
        s.siteName,
        s.tagline || '',
        s.logoUrl || '',
        s.logoText || '',
        s.faviconUrl || '',
        s.primaryColor || '#7c3aed',
        s.metaTitle || '',
        s.metaDescription || '',
        s.metaKeywords || '',
        s.author || '',
        s.headScripts || '',
        s.telegramLink || '',
        s.adminPin || '123456',
        s.popunderUrl || '',
        s.popunderEnabled ? 1 : 0,
        s.popunderFrequencyHours || 6
      );
    }

    if (data.adminAuth) {
      db.prepare(`
        INSERT OR REPLACE INTO admin_auth (id, username, passwordHash)
        VALUES (1, ?, ?)
      `).run(data.adminAuth.username, data.adminAuth.passwordHash);
    }

    if (data.videoBranding) {
      const vb = data.videoBranding;
      db.prepare(`
        INSERT OR REPLACE INTO video_branding (
          id, enabled, introPath, outroPath, watermarkPath, watermarkText, watermarkPosition, watermarkOpacity
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        vb.enabled ? 1 : 0,
        vb.introPath || '',
        vb.outroPath || '',
        vb.watermarkPath || '',
        vb.watermarkText || 'Nyalaporn',
        vb.watermarkPosition || 'center',
        vb.watermarkOpacity ?? 0.35
      );
    }

    if (Array.isArray(data.categories)) {
      db.prepare('DELETE FROM categories').run();
      const insertCat = db.prepare(`
        INSERT INTO categories (id, name, slug, description, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `);
      data.categories.forEach((c, idx) => {
        insertCat.run(c.id || `cat-${idx + 1}`, c.name, c.slug, c.description || '', c.order || idx);
      });
    }

    if (Array.isArray(data.videos)) {
      db.prepare('DELETE FROM videos').run();
      const insertVid = db.prepare(`
        INSERT INTO videos (
          id, title, slug, description, videoUrl, thumbUrl, duration, category, views, likes, createdAt, isFeatured, tags, previewThumbs
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      data.videos.forEach((v, idx) => {
        insertVid.run(
          v.id || `vid-${idx + 1}`,
          v.title,
          v.slug,
          v.description || '',
          v.videoUrl,
          v.thumbUrl || '',
          v.duration || '03:00',
          v.category,
          v.views || 0,
          v.likes || 0,
          v.createdAt || new Date().toISOString(),
          v.isFeatured ? 1 : 0,
          JSON.stringify(v.tags || []),
          JSON.stringify(v.previewThumbs || [])
        );
      });
    }

    if (Array.isArray(data.ads)) {
      db.prepare('DELETE FROM ads').run();
      const insertAd = db.prepare(`
        INSERT INTO ads (id, name, position, type, imageUrl, targetUrl, scriptCode, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      data.ads.forEach((a, idx) => {
        insertAd.run(
          a.id || `ad-${idx + 1}`,
          a.name,
          a.position,
          a.type,
          a.imageUrl || '',
          a.targetUrl || '',
          a.scriptCode || '',
          a.isActive ? 1 : 0
        );
      });
    }

    if (Array.isArray(data.comments)) {
      db.prepare('DELETE FROM comments').run();
      const insertComm = db.prepare(`
        INSERT INTO comments (id, videoId, authorName, authorAvatar, content, createdAt, likes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      data.comments.forEach((cm, idx) => {
        insertComm.run(
          cm.id || `comm-${idx + 1}`,
          cm.videoId,
          cm.authorName,
          cm.authorAvatar || '',
          cm.content,
          cm.createdAt || new Date().toISOString(),
          cm.likes || 0
        );
      });
    }

    if (data.analytics) {
      db.prepare(`
        INSERT OR REPLACE INTO analytics (id, totalViews, dailyViews)
        VALUES (1, ?, ?)
      `).run(
        data.analytics.totalViews || 0,
        JSON.stringify(data.analytics.dailyViews || {})
      );
    }
  });

  tx();

  try {
    const tempPath = `${JSON_BACKUP_FILE}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, JSON_BACKUP_FILE);
  } catch (err) {
    console.error('Failed to write JSON backup:', err);
  }
}

export { SQLITE_FILE };
