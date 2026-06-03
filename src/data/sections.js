const palmUniverseUrl = 'https://ma16629312300-blip.github.io/palm-universe-download-site-20260601202734/';
const memoryAlbumUrl = 'https://cosmic-starship-0aed8e.netlify.app/';
const memoryTreeDownloadUrl = `${import.meta.env.BASE_URL}downloads/memory_tree_v3_7_theme_switchable.html`;

export const sections = [
  {
    id: 'intro',
    number: '00',
    title: '首页',
    label: 'INTRO',
    supertitle: 'PERSONAL STAGE',
    subtitle: '个人主页的动态入口',
    copy: '进入 tiaotiao 的个人简介、作品归档与实验玩法。中文是主叙事，英文作为菜单节奏、编号和视觉标签。',
    watermark: 'INTRO',
    layout: 'balanced',
    moonPhase: 'new',
    moonOrbit: 'top',
    tags: ['蓝黑白主调', '月相徽章', '时钟背景', '丝滑转场'],
  },
  {
    id: 'profile',
    number: '01',
    title: '个人简介',
    label: 'PROFILE',
    supertitle: 'WHO I AM',
    subtitle: '作者 tiaotiao',
    copy: '河北工业大学南院最忧郁之人。喜欢把网页做成有情绪的界面，也喜欢把小玩法、小工具和视觉实验塞进自己的宇宙里。',
    watermark: 'PROFILE',
    layout: 'forward',
    moonPhase: 'crescent',
    moonOrbit: 'upper',
    tags: ['作者 tiaotiao', '河北工业大学', '游戏 UI', '交互实验'],
  },
  {
    id: 'works',
    number: '02',
    title: '个人作品',
    label: 'WORKS',
    supertitle: 'SELECT ARCHIVE',
    subtitle: '项目、页面与视觉作品',
    copy: '这里之后会放你的项目入口、截图、完成状态和技术说明。现在先保留海报式占位，让整体结构完整。',
    watermark: 'WORKS',
    layout: 'archive',
    moonPhase: 'half',
    moonOrbit: 'middle',
    cards: [
      {
        meta: 'WEB / PORTFOLIO',
        title: '网页作品占位',
        text: '用于展示页面、应用或个人项目。之后可以替换成真实作品。',
      },
      {
        meta: 'UI / MOTION',
        title: '动效作品占位',
        text: '用于放转场、视觉页面、交互动效或实验性作品。',
      },
    ],
  },
  {
    id: 'playground',
    number: '03',
    title: '有趣功能',
    label: 'PLAYGROUND',
    supertitle: 'PLAY MODE',
    subtitle: '小功能、小玩法与实验',
    copy: '这里会像游戏菜单一样收纳你做过的各种小东西：小游戏、视觉实验、实用工具，以及偶然冒出来的灵感。',
    watermark: 'PLAYGROUND',
    layout: 'arcade',
    moonPhase: 'gibbous',
    moonOrbit: 'lower',
    cards: [
      {
        meta: 'MINI GAME / FEATURED',
        title: '掌中宇宙',
        text: '一个已经完成的小玩法项目入口，像把微型宇宙放进手心里。',
        internalHref: '#palm-universe',
        action: '查看掌中宇宙',
      },
      {
        meta: 'MEMORY / NEW',
        title: '记忆相册',
        text: '新的互动相册项目，收纳碎片、星光和适合慢慢翻看的个人记忆。',
        internalHref: '#memory-album',
        action: '查看记忆相册',
      },
      {
        meta: 'VISUAL LAB',
        title: '视觉特效收藏',
        text: '收集粒子、转场、鼠标互动和图形实验。',
      },
    ],
  },
  {
    id: 'contact',
    number: '04',
    title: '联系我',
    label: 'CONTACT',
    supertitle: 'COMMAND LINE',
    subtitle: '链接与联系入口',
    copy: '这里会放邮箱、GitHub、Bilibili 或其他社交链接。现在先保留命令面板式占位，后续补真实信息。',
    watermark: 'CONTACT',
    layout: 'terminal',
    moonPhase: 'full',
    moonOrbit: 'bottom',
    tags: ['Email', 'GitHub', 'Bilibili', 'Social'],
    links: [
      {
        label: '邮箱 2058194218@qq.com',
        href: 'mailto:2058194218@qq.com',
      },
    ],
  },
];

export const detailPages = [
  {
    id: 'palm-universe',
    parentId: 'playground',
    number: '03-A',
    title: '掌中宇宙',
    label: 'PALM UNIVERSE',
    supertitle: 'PLAYGROUND / SIDE PAGE',
    subtitle: '作者 tiaotiao',
    copy: '掌中宇宙是一个把微型宇宙、星体轨迹和掌心尺度结合起来的小玩法项目。它更像一个轻量互动玩具：打开后可以进入属于自己的小型星空，把视觉实验和一点点浪漫收进页面里。',
    watermark: 'PALM',
    layout: 'detail',
    moonPhase: 'half',
    moonOrbit: 'middle',
    tags: ['作者 tiaotiao', '掌心宇宙', '互动玩法', '在线入口'],
    links: [
      {
        label: '在线预览',
        href: palmUniverseUrl,
      },
      {
        label: '下载页面',
        href: palmUniverseUrl,
      },
    ],
  },
  {
    id: 'memory-album',
    parentId: 'playground',
    number: '03-B',
    title: '记忆相册',
    label: 'MEMORY ALBUM',
    supertitle: 'PLAYGROUND / SIDE PAGE',
    subtitle: '作者 tiaotiao',
    copy: '记忆相册是一个偏梦境感的在线相册项目，用星舰、宇宙和回忆的意象包装个人影像与片段。它适合被当作一个安静的展示空间，也可以作为后续影像作品的入口。',
    watermark: 'MEMORY',
    layout: 'detail',
    moonPhase: 'gibbous',
    moonOrbit: 'bottom',
    tags: ['作者 tiaotiao', '记忆收藏', '在线预览', '文件下载'],
    links: [
      {
        label: '在线预览',
        href: memoryAlbumUrl,
      },
      {
        label: '下载记忆树',
        href: memoryTreeDownloadUrl,
        download: 'memory_tree_v3_7_theme_switchable.html',
      },
    ],
  },
];

export const allSections = [...sections, ...detailPages];
