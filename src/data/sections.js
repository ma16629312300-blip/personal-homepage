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
  schoolSeasons: {
    spring: asset('school-hill'),
    summer: asset('school-hill-summer'),
    autumn: asset('school-hill-autumn'),
    winter: asset('school-hill-winter'),
  },
  sakuraSeasons: {
    spring: asset('sakura-branch'),
    summer: asset('sakura-branch-summer'),
    autumn: asset('sakura-branch-autumn'),
    winter: asset('sakura-branch-winter'),
  },
  portrait: asset('portrait'),
  monorail: asset('monorail'),
  trainDoors: asset('train-doors'),
  stairwell: asset('stairwell'),
  roofDoor: asset('roof-door'),
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

/* 个人简介里的人物参数（仿 P3 的学力 / 魅力 / 勇气）。数值 1–6，6 为 MAX，随时可以改 */
export const stats = [
  { zh: '学力', en: 'ACADEMICS', lv: 3, note: '勉强及格' },
  { zh: '魅力', en: 'CHARM', lv: 4, note: '有点神秘' },
  { zh: '勇气', en: 'COURAGE', lv: 4, note: '敢在零点出门' },
  { zh: '手艺', en: 'CRAFT', lv: 5, note: '沉迷做网页' },
  { zh: '忧郁', en: 'MELANCHOLY', lv: 6, note: '北辰第一' },
];

/* 每日塔罗：22 张大阿卡纳，每张一句当天的小建议 */
export const majorArcana = [
  ['0', 'THE FOOL', '愚者', '适合说走就走，哪怕只是换一条路回家。'],
  ['I', 'THE MAGICIAN', '魔术师', '手边的工具已经够用了，开始做吧。'],
  ['II', 'THE HIGH PRIESTESS', '女祭司', '安静一会儿，答案会自己浮上来。'],
  ['III', 'THE EMPRESS', '女皇', '好好吃一顿饭，今天的你值得被照顾。'],
  ['IV', 'THE EMPEROR', '皇帝', '定一个小计划，然后真的去执行它。'],
  ['V', 'THE HIEROPHANT', '教皇', '去请教一个比你懂的人，会有收获。'],
  ['VI', 'THE LOVERS', '恋人', '回复那条一直没回的消息吧。'],
  ['VII', 'THE CHARIOT', '战车', '往前冲，犹豫的时间比做的时间还长。'],
  ['VIII', 'STRENGTH', '力量', '温柔一点，也是一种很强的力量。'],
  ['IX', 'THE HERMIT', '隐者', '允许自己一个人待一会儿。'],
  ['X', 'WHEEL OF FORTUNE', '命运之轮', '运气在转，今天可以试试新东西。'],
  ['XI', 'JUSTICE', '正义', '把拖着的小事一件件清掉。'],
  ['XII', 'THE HANGED MAN', '倒吊人', '换个角度看，卡住的地方也许是捷径。'],
  ['XIII', 'DEATH', '死神', '结束一件旧事，给新的东西腾个位置。'],
  ['XIV', 'TEMPERANCE', '节制', '别熬夜，记得多喝水。'],
  ['XV', 'THE DEVIL', '恶魔', '少刷一会儿手机，你知道我在说什么。'],
  ['XVI', 'THE TOWER', '塔', '计划可能会被打乱，没关系，重新搭就好。'],
  ['XVII', 'THE STAR', '星星', '适合许愿，也适合开始一个小项目。'],
  ['XVIII', 'THE MOON', '月亮', '有点迷茫很正常，跟着直觉走一段。'],
  ['XIX', 'THE SUN', '太阳', '出去晒晒太阳，心情会变好。'],
  ['XX', 'JUDGEMENT', '审判', '回头看看，你已经走了很远。'],
  ['XXI', 'THE WORLD', '世界', '一件事终于圆满，奖励一下自己。'],
];

/* 背景音乐：按时段换曲。文件放在 public/audio/ 下，填上文件名即可；
   留空（null）的时段沿用 night 那首。 */
export const bgmTracks = {
  night: 'color-your-night.mp3',
  dawn: null,
  day: null,
  dusk: null,
  darkHour: null,
};

/* 原创守护灵：五张隐藏塔罗各对应一位；任意两位合成得到"零时钟匠" */
export const guardians = {
  home: { name: '潮汐看守', en: 'TIDE KEEPER', skill: ['Moonlit Tide', '月潮回涌'], arcana: ['0', 'THE FOOL', '愚者'], src: asset('guardian-home') },
  about: { name: '末班车掌', en: 'LAST TRAIN CONDUCTOR', skill: ['Last Call', '终点广播'], arcana: ['IX', 'THE HERMIT', '隐者'], src: asset('guardian-about') },
  projects: { name: '樱坡骑手', en: 'SAKURA HILL RIDER', skill: ['Petal Charge', '樱吹雪冲锋'], arcana: ['VII', 'THE CHARIOT', '战车'], src: asset('guardian-projects') },
  playground: { name: '星屑织者', en: 'STARDUST WEAVER', skill: ['Star Loom', '星辰织机'], arcana: ['XVII', 'THE STAR', '星星'], src: asset('guardian-playground') },
  contact: { name: '天台信使', en: 'ROOFTOP MESSENGER', skill: ['Sealed Letter', '封缄之信'], arcana: ['VI', 'THE LOVERS', '恋人'], src: asset('guardian-contact') },
  world: { name: '零时钟匠', en: 'MIDNIGHT CLOCKMAKER', skill: ['Midnight Hand', '零时之针'], arcana: ['XXI', 'THE WORLD', '世界'], src: asset('guardian-world') },
};
export const fusionCircle = asset('fusion-circle');
