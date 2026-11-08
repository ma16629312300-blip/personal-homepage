const base = import.meta.env.BASE_URL;
const asset = (name) => `${base}assets/p3r/${name}.webp`;

export const palmUniverseUrl =
  'https://ma16629312300-blip.github.io/palm-universe-download-site-20260601202734/';
export const memoryAlbumUrl = 'https://cosmic-starship-0aed8e.netlify.app/';
export const memoryTreeDownloadUrl = `${base}downloads/memory_tree_v3_7_theme_switchable.html`;
export const email = '2058194218@qq.com';

export const images = {
  grain: asset('grain'),
  tartarus: asset('tartarus'),
  moon: asset('moon'),
  skyline: asset('skyline'),
  cardBack: asset('card-back'),
  persona: asset('persona'),
  carriage: asset('carriage'),
  sakura: asset('sakura-branch'),
  school: asset('school-hill'),
  portrait: asset('portrait'),
  velvet: asset('velvet-room'),
  door: asset('blue-door'),
};

/* 主栏目：顺序即环形轨道上的站位，每站相隔 72° */
export const sections = [
  {
    id: 'home',
    arcana: ['0', 'THE FOOL', '愚者'],
    number: '00',
    title: '首页',
    label: 'HOME',
    character: { src: asset('char-floating'), mobile: asset('char-halfbody'), alt: '' },
  },
  {
    id: 'about',
    arcana: ['IX', 'THE HERMIT', '隐者'],
    number: '01',
    title: '个人简介',
    label: 'ABOUT',
    character: { src: asset('char-train-seat'), mobile: asset('char-train-seat'), alt: '' },
    inScene: true,
  },
  {
    id: 'projects',
    school: true,
    arcana: ['VII', 'THE CHARIOT', '战车'],
    number: '02',
    title: '个人项目',
    label: 'PROJECTS',
    character: { src: asset('char-climbing'), mobile: asset('char-climbing'), alt: '' },
    inScene: true,
  },
  {
    id: 'playground',
    school: true,
    arcana: ['XVII', 'THE STAR', '星星'],
    number: '03',
    title: '有趣功能',
    label: 'PLAYGROUND',
    character: { src: asset('char-seated'), mobile: asset('char-seated'), alt: '' },
    inScene: true,
  },
  {
    id: 'contact',
    school: true,
    arcana: ['VI', 'THE LOVERS', '恋人'],
    number: '04',
    title: '联系我',
    label: 'CONTACT',
    character: { src: asset('char-lookup'), mobile: asset('char-lookup'), alt: '' },
  },
];

export const playgroundItems = [
  {
    id: 'palm-universe',
    number: '03-A',
    arcana: ['XVII', 'THE STAR', '星星'],
    face: asset('arcana-star'),
    faceKind: 'star',
    title: '掌中宇宙',
    label: 'PALM UNIVERSE',
    teaser: '把微型宇宙放进手心里的小玩法。',
    copy: '掌中宇宙是一个把微型宇宙、星体轨迹和掌心尺度结合起来的小玩法项目。它更像一个轻量互动玩具：打开后可以进入属于自己的小型星空，把视觉实验和一点点浪漫收进页面里。',
    note: '在线预览与下载都在它的介绍页里。',
    links: [{ label: '前往介绍页', sub: '在线预览 · 下载', href: palmUniverseUrl, primary: true }],
  },
  {
    id: 'memory-album',
    number: '03-B',
    arcana: ['XVIII', 'THE MOON', '月亮'],
    face: asset('arcana-moon'),
    faceKind: 'moon',
    title: '记忆相册',
    label: 'MEMORY ALBUM',
    teaser: '收纳碎片与回忆的互动相册。',
    copy: '记忆相册是一个偏梦境感的在线相册项目，用星舰、宇宙和回忆的意象包装个人影像与片段。它适合被当作一个安静的展示空间，也可以作为后续影像作品的入口。',
    links: [
      { label: '在线预览', href: memoryAlbumUrl, primary: true },
      {
        label: '下载记忆树',
        sub: 'HTML 文件',
        href: memoryTreeDownloadUrl,
        download: 'memory_tree_v3_7_theme_switchable.html',
      },
    ],
  },
];

/* 旧链接兼容：#intro #profile #works 仍能打开对应栏目 */
const aliases = { intro: 'home', profile: 'about', works: 'projects' };

export function parseHash(hash) {
  const raw = decodeURIComponent((hash || '').replace(/^#\/?/, ''));
  const id = aliases[raw] ?? raw;
  if (id === 'velvet') return { section: 'home', detail: null, velvet: true };
  const item = playgroundItems.find((p) => p.id === id);
  if (item) return { section: 'playground', detail: item.id };
  if (sections.some((s) => s.id === id)) return { section: id, detail: null };
  return { section: 'home', detail: null };
}

export const sectionIndex = (id) => sections.findIndex((s) => s.id === id);
