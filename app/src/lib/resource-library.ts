export interface TopicResource {
  title: string;
  platform: string;
  url: string;
}

export interface TopicEntry {
  keywords: string[];
  resources: TopicResource[];
  phaseNames: string[];
  phaseDescs: string[];
}

function matchScore(goalTitle: string, keywords: string[]): number {
  const t = goalTitle.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (t.includes(kw.toLowerCase())) score += kw.length;
  }
  return score;
}

export function findTopicResources(goalTitle: string, goalDesc: string): TopicEntry | null {
  const combined = `${goalTitle} ${goalDesc}`.toLowerCase();
  let best: TopicEntry | null = null;
  let bestScore = 0;

  for (const entry of TOPIC_LIBRARY) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (combined.includes(kw.toLowerCase())) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore >= 2 ? best : null;
}

export function pickResources(entry: TopicEntry, count: number): TopicResource[] {
  const result: TopicResource[] = [];
  for (let i = 0; i < count; i++) {
    result.push(entry.resources[i % entry.resources.length]);
  }
  return result;
}

const TOPIC_LIBRARY: TopicEntry[] = [
  // ===== 语言类 =====
  {
    keywords: ["英语", "english", "口语", "听力", "雅思", "托福"],
    resources: [
      { title: "TED精读合集100集·中英双语", platform: "B站", url: "https://www.bilibili.com/video/BV1vp4y1x7FW/" },
      { title: "英语口语跟读训练金素材", platform: "B站", url: "https://www.bilibili.com/video/BV1dtYqzeEv2/" },
      { title: "Learning How to Learn", platform: "Coursera", url: "https://www.coursera.org/learn/learning-how-to-learn" },
      { title: "BBC Learning English", platform: "YouTube", url: "https://www.youtube.com/@bbclearningenglish" },
      { title: "每日英语听力", platform: "App", url: "https://dict.eudic.net/ting" },
      { title: "英语语法新思维", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    phaseNames: ["听力启蒙", "跟读模仿", "场景对话", "自由表达"],
    phaseDescs: ["培养语感，大量输入", "跟读模仿语调节奏", "模拟场景对话练习", "脱稿自信表达"],
  },
  {
    keywords: ["日语", "日本语", "五十音", "n1", "n2", "jlpt"],
    resources: [
      { title: "零基础日语入门50音全掌握", platform: "B站", url: "https://www.bilibili.com/video/BV1Bp4y1D747/" },
      { title: "新标准日本语精讲", platform: "B站", url: "https://www.bilibili.com/video/BV1EW411u7yw/" },
      { title: "日语听力训练合集", platform: "B站", url: "https://www.bilibili.com/video/BV1qZ4y1K7XG/" },
      { title: "Japanese Pod 101", platform: "YouTube", url: "https://www.youtube.com/@JapanesePod101" },
      { title: "日语语法精解", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    phaseNames: ["五十音入门", "基础语法", "场景会话", "综合运用"],
    phaseDescs: ["掌握假名读写", "学习基本句型", "模拟日常场景", "阅读与听力综合提升"],
  },
  {
    keywords: ["韩语", "韩国语", "topik", "한국어"],
    resources: [
      { title: "零基础韩语40音完整版", platform: "B站", url: "https://www.bilibili.com/video/BV1Hb411c7Dj/" },
      { title: "延世韩国语精讲", platform: "B站", url: "https://www.bilibili.com/video/BV1hW411K7cz/" },
      { title: "Talk To Me In Korean", platform: "YouTube", url: "https://www.youtube.com/@TalkToMeInKorean" },
      { title: "韩语TOPIK备考指南", platform: "网易云课堂", url: "https://study.163.com/" },
    ],
    phaseNames: ["字母发音", "基础会话", "语法进阶", "综合运用"],
    phaseDescs: ["掌握韩语字母和发音规则", "学习日常基础对话", "深入学习语法结构", "听说读写综合提升"],
  },
  {
    keywords: ["法语", "français", "法国"],
    resources: [
      { title: "零基础法语发音入门", platform: "B站", url: "https://www.bilibili.com/video/BV1GJ411q7Fg/" },
      { title: "Français avec Pierre", platform: "YouTube", url: "https://www.youtube.com/@FrancaisavecPierre" },
      { title: "法语A1基础课程", platform: "网易云课堂", url: "https://study.163.com/" },
      { title: "简明法语教程精讲", platform: "B站", url: "https://www.bilibili.com/" },
    ],
    phaseNames: ["发音基础", "基础语法", "日常会话", "阅读写作"],
    phaseDescs: ["掌握法语发音规则", "学习动词变位和句型", "模拟日常场景对话", "阅读简单文章并写短文"],
  },
  {
    keywords: ["西班牙语", "español", "西语"],
    resources: [
      { title: "零基础西班牙语入门", platform: "B站", url: "https://www.bilibili.com/video/BV1yE411c7Pf/" },
      { title: "SpanishPod101", platform: "YouTube", url: "https://www.youtube.com/@SpanishPod101" },
      { title: "现代西班牙语精讲", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "多邻国西班牙语", platform: "App", url: "https://www.duolingo.com/" },
    ],
    phaseNames: ["发音入门", "基础会话", "语法深化", "综合运用"],
    phaseDescs: ["学习西语发音和字母", "掌握基础日常对话", "深入学习时态变位", "阅读听力综合训练"],
  },
  {
    keywords: ["德语", "deutsch"],
    resources: [
      { title: "零基础德语入门", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Learn German with Anja", platform: "YouTube", url: "https://www.youtube.com/@LearnGermanwithAnja" },
      { title: "新求精德语强化教程", platform: "网易云课堂", url: "https://study.163.com/" },
    ],
    phaseNames: ["发音字母", "基础语法", "日常会话", "综合提升"],
    phaseDescs: ["掌握德语发音", "学习名词词性和动词变位", "模拟生活场景", "阅读与听力训练"],
  },

  // ===== 传统文化 =====
  {
    keywords: ["周易", "易经", "八卦", "六十四卦", "占卜", "易学"],
    resources: [
      { title: "曾仕强·易经的奥秘全集", platform: "B站", url: "https://www.bilibili.com/video/BV1Js411o7hP/" },
      { title: "零基础学周易·六十四卦详解", platform: "B站", url: "https://www.bilibili.com/video/BV1xb411H7kS/" },
      { title: "傅佩荣讲易经", platform: "喜马拉雅", url: "https://www.ximalaya.com/album/3028497" },
      { title: "《周易》原文朗读与释义", platform: "喜马拉雅", url: "https://www.ximalaya.com/" },
      { title: "《图解周易大全》", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "易经入门完整版讲解", platform: "网易公开课", url: "https://open.163.com/" },
    ],
    phaseNames: ["基础概念", "八卦入门", "卦辞解读", "综合运用"],
    phaseDescs: ["了解阴阳五行和太极原理", "学习八卦象义和基础卦象", "逐卦学习六十四卦含义", "将易学智慧融入生活决策"],
  },
  {
    keywords: ["国学", "论语", "孟子", "道德经", "老子", "庄子", "儒学", "道家"],
    resources: [
      { title: "于丹·论语心得全集", platform: "B站", url: "https://www.bilibili.com/video/BV1Ws411o7BG/" },
      { title: "道德经精讲", platform: "喜马拉雅", url: "https://www.ximalaya.com/" },
      { title: "庄子·逍遥游精读", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "《论语》全文注释译文", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "中国哲学简史", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    phaseNames: ["经典入门", "精读原典", "思想对比", "学以致用"],
    phaseDescs: ["了解国学体系和核心思想", "精读一部经典原文", "对比儒道不同思想", "在生活中运用国学智慧"],
  },
  {
    keywords: ["书法", "毛笔", "硬笔", "楷书", "行书", "练字"],
    resources: [
      { title: "零基础硬笔书法入门", platform: "B站", url: "https://www.bilibili.com/video/BV1iW411B76k/" },
      { title: "毛笔楷书基础笔画教学", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "田英章硬笔书法教程", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "每日一练·书法字帖", platform: "App", url: "https://apps.apple.com/" },
      { title: "《书法入门》", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    phaseNames: ["基本笔画", "偏旁部首", "结构练习", "作品创作"],
    phaseDescs: ["掌握横竖撇捺基本笔画", "学习偏旁部首组合规律", "练习整字结构和篇章布局", "独立创作书法作品"],
  },
  {
    keywords: ["围棋", "围棋入门", "下棋"],
    resources: [
      { title: "围棋入门教程完整版", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "聂卫平围棋教室", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "围棋TV", platform: "YouTube", url: "https://www.youtube.com/" },
      { title: "弈城围棋", platform: "App", url: "https://www.eweiqi.com/" },
    ],
    phaseNames: ["规则入门", "基本技巧", "布局定式", "实战对弈"],
    phaseDescs: ["学习围棋规则和基本术语", "掌握吃子和做眼技巧", "学习常见布局和定式", "在线对弈提升棋力"],
  },
  {
    keywords: ["象棋", "中国象棋"],
    resources: [
      { title: "象棋入门到精通", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "象棋残局讲解", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "天天象棋", platform: "App", url: "https://chess.qq.com/" },
    ],
    phaseNames: ["走子规则", "开局定式", "中局战术", "残局技巧"],
    phaseDescs: ["掌握棋子走法和基本规则", "学习常见开局套路", "学习攻杀和防守技巧", "练习实用残局"],
  },

  // ===== 音乐类 =====
  {
    keywords: ["吉他", "guitar", "指弹", "弹唱"],
    resources: [
      { title: "零基础吉他入门·完整版", platform: "B站", url: "https://www.bilibili.com/video/BV1ux411b7W1/" },
      { title: "吉他弹唱教学100首", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "JustinGuitar入门课", platform: "YouTube", url: "https://www.youtube.com/@JustinGuitar" },
      { title: "吉他谱·吉他社", platform: "App", url: "https://www.jitashe.org/" },
    ],
    phaseNames: ["基础和弦", "节奏练习", "歌曲弹唱", "指弹进阶"],
    phaseDescs: ["学习C/Am/G/Em基础和弦", "掌握常用节奏型和扫弦", "学会弹唱完整歌曲", "尝试指弹独奏技巧"],
  },
  {
    keywords: ["钢琴", "piano", "键盘"],
    resources: [
      { title: "零基础钢琴入门教程", platform: "B站", url: "https://www.bilibili.com/video/BV1Vp4y1X7WQ/" },
      { title: "Pianote钢琴入门", platform: "YouTube", url: "https://www.youtube.com/@Pianote" },
      { title: "Simply Piano", platform: "App", url: "https://www.joytunes.com/simply-piano" },
      { title: "哈农钢琴练指法讲解", platform: "B站", url: "https://www.bilibili.com/" },
    ],
    phaseNames: ["认识键盘", "基础练习", "曲目学习", "自由弹奏"],
    phaseDescs: ["学习音符和键盘对应", "练习音阶和哈农", "学习一首完整曲目", "即兴伴奏和自由演奏"],
  },
  {
    keywords: ["声乐", "唱歌", "vocal", "发声", "k歌"],
    resources: [
      { title: "零基础学唱歌·发声训练", platform: "B站", url: "https://www.bilibili.com/video/BV1gJ411d7aB/" },
      { title: "声乐课·气息与共鸣", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "30天声乐入门进阶", platform: "喜马拉雅", url: "https://www.ximalaya.com/" },
      { title: "全民K歌", platform: "App", url: "https://kg.qq.com/" },
    ],
    phaseNames: ["呼吸基础", "发声技巧", "歌曲演唱", "风格探索"],
    phaseDescs: ["学习腹式呼吸和气息控制", "练习头声胸声和混声", "完整演唱并录音对比", "尝试不同风格的演唱"],
  },
  {
    keywords: ["尤克里里", "ukulele"],
    resources: [
      { title: "尤克里里零基础入门", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "尤克里里弹唱教学", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "The Ukulele Teacher", platform: "YouTube", url: "https://www.youtube.com/@TheUkuleleTeacher" },
    ],
    phaseNames: ["基础和弦", "节奏弹唱", "歌曲练习", "指弹入门"],
    phaseDescs: ["学习C/Am/F/G四个基础和弦", "掌握基本节奏型", "学会弹唱简单歌曲", "尝试简单指弹曲目"],
  },
  {
    keywords: ["乐理", "音乐理论", "和声"],
    resources: [
      { title: "乐理零基础入门全集", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "12 Tone音乐理论", platform: "YouTube", url: "https://www.youtube.com/@12tonevideos" },
      { title: "和声学基础", platform: "网易云课堂", url: "https://study.163.com/" },
    ],
    phaseNames: ["音符节拍", "音阶调式", "和弦进行", "曲式分析"],
    phaseDescs: ["学习音符时值和节拍", "掌握大小调音阶", "学习和弦构成和进行", "分析简单曲式结构"],
  },

  // ===== 视觉艺术 =====
  {
    keywords: ["摄影", "拍照", "photography", "相机", "手机摄影"],
    resources: [
      { title: "摄影入门·从零到出片", platform: "B站", url: "https://www.bilibili.com/video/BV1Gb411n7LF/" },
      { title: "手机摄影技巧大全", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Peter McKinnon摄影课", platform: "YouTube", url: "https://www.youtube.com/@PeterMcKinnon" },
      { title: "《摄影笔记》", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    phaseNames: ["构图基础", "光线运用", "主题拍摄", "后期修图"],
    phaseDescs: ["学习三分法等构图原则", "理解自然光和人造光", "练习人像/风景/街拍", "学习调色和后期处理"],
  },
  {
    keywords: ["素描", "铅笔画", "速写"],
    resources: [
      { title: "素描零基础入门全集", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Proko素描教程", platform: "YouTube", url: "https://www.youtube.com/@ProkoTV" },
      { title: "速写练习30天", platform: "B站", url: "https://www.bilibili.com/" },
    ],
    phaseNames: ["线条基础", "几何体", "静物素描", "人物速写"],
    phaseDescs: ["练习基本线条和排线", "画几何体理解透视", "完成静物组合素描", "练习人物动态速写"],
  },
  {
    keywords: ["水彩", "水彩画"],
    resources: [
      { title: "水彩入门·零基础教程", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "水彩技法详解", platform: "YouTube", url: "https://www.youtube.com/" },
      { title: "水彩花卉教学", platform: "B站", url: "https://www.bilibili.com/" },
    ],
    phaseNames: ["工具认识", "调色技法", "花卉植物", "风景创作"],
    phaseDescs: ["了解颜料和纸张特性", "练习渐变和叠色", "画简单花卉和植物", "完成风景水彩作品"],
  },
  {
    keywords: ["油画", "丙烯画"],
    resources: [
      { title: "油画入门基础课", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Bob Ross绘画教程", platform: "YouTube", url: "https://www.youtube.com/@BobRoss" },
      { title: "油画技法与材料", platform: "网易云课堂", url: "https://study.163.com/" },
    ],
    phaseNames: ["材料基础", "色彩运用", "主题创作", "风格探索"],
    phaseDescs: ["认识油画工具和材料", "学习调色和笔触技法", "完成一幅完整油画", "发展个人绘画风格"],
  },
  {
    keywords: ["插画", "procreate", "数字绘画", "板绘", "ipad画画"],
    resources: [
      { title: "Procreate零基础入门", platform: "B站", url: "https://www.bilibili.com/video/BV1ZA411A7rP/" },
      { title: "iPad插画入门全攻略", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Art with Flo", platform: "YouTube", url: "https://www.youtube.com/@ArtwithFlo" },
      { title: "数字插画实战教程", platform: "网易云课堂", url: "https://study.163.com/" },
    ],
    phaseNames: ["软件入门", "线稿练习", "上色技法", "作品创作"],
    phaseDescs: ["掌握Procreate基本工具", "练习线稿造型和笔触", "学习平涂渐变和光影", "完成原创插画作品"],
  },

  // ===== 编程技术 =====
  {
    keywords: ["python", "编程入门", "爬虫"],
    resources: [
      { title: "Python零基础入门全集", platform: "B站", url: "https://www.bilibili.com/video/BV1qW4y1a7fU/" },
      { title: "Python for Everybody", platform: "Coursera", url: "https://www.coursera.org/specializations/python" },
      { title: "freeCodeCamp Python", platform: "YouTube", url: "https://www.youtube.com/@freecodecamp" },
      { title: "LeetCode Python题解", platform: "LeetCode", url: "https://leetcode.cn/" },
    ],
    phaseNames: ["语法基础", "函数与模块", "项目实战", "进阶应用"],
    phaseDescs: ["学习变量、循环、条件", "掌握函数和模块化", "完成小型项目", "学习爬虫或数据分析"],
  },
  {
    keywords: ["javascript", "前端", "web", "react", "vue", "html", "css"],
    resources: [
      { title: "前端入门教程·HTML/CSS/JS", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "The Odin Project", platform: "Web", url: "https://www.theodinproject.com/" },
      { title: "JavaScript全栈课程", platform: "YouTube", url: "https://www.youtube.com/@freecodecamp" },
      { title: "React官方教程", platform: "Web", url: "https://react.dev/learn" },
    ],
    phaseNames: ["HTML/CSS", "JavaScript", "框架入门", "项目实战"],
    phaseDescs: ["学习网页结构和样式", "掌握JS核心语法", "学习React或Vue框架", "独立完成Web项目"],
  },
  {
    keywords: ["ai", "人工智能", "机器学习", "深度学习", "chatgpt", "prompt"],
    resources: [
      { title: "吴恩达·机器学习入门", platform: "Coursera", url: "https://www.coursera.org/learn/machine-learning" },
      { title: "AI入门从零开始", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "3Blue1Brown深度学习", platform: "YouTube", url: "https://www.youtube.com/@3blue1brown" },
      { title: "Prompt工程指南", platform: "GitHub", url: "https://github.com/dair-ai/Prompt-Engineering-Guide" },
    ],
    phaseNames: ["概念入门", "数学基础", "模型实践", "项目应用"],
    phaseDescs: ["理解AI核心概念", "补充线性代数概率论", "训练简单模型", "完成AI应用项目"],
  },

  // ===== 生活技能 =====
  {
    keywords: ["烹饪", "做饭", "厨艺", "下厨", "菜谱", "烘焙"],
    resources: [
      { title: "新手做饭100道家常菜", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "王刚美食教程", platform: "B站", url: "https://www.bilibili.com/video/BV1Jx411n7TE/" },
      { title: "下厨房", platform: "App", url: "https://www.xiachufang.com/" },
      { title: "日食记", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "烘焙入门教程", platform: "B站", url: "https://www.bilibili.com/" },
    ],
    phaseNames: ["基础刀工", "家常菜", "进阶菜式", "创意料理"],
    phaseDescs: ["学习切菜调味基础", "掌握10道经典家常菜", "尝试煲汤和复杂菜式", "自创菜谱融合创新"],
  },
  {
    keywords: ["理财", "投资", "基金", "股票", "炒股", "财务自由"],
    resources: [
      { title: "小白理财入门课", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "《小狗钱钱》", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "指数基金定投指南", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "《穷爸爸富爸爸》", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "巴菲特投资哲学", platform: "YouTube", url: "https://www.youtube.com/" },
    ],
    phaseNames: ["理财基础", "投资入门", "资产配置", "长期规划"],
    phaseDescs: ["建立记账和储蓄习惯", "了解基金股票债券", "学习分散投资策略", "制定长期财务计划"],
  },
  {
    keywords: ["冥想", "meditation", "正念", "mindfulness"],
    resources: [
      { title: "冥想入门7天课程", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "潮汐App冥想引导", platform: "App", url: "https://tide.fm/" },
      { title: "Headspace冥想课", platform: "YouTube", url: "https://www.youtube.com/@headspace" },
      { title: "《正念的奇迹》", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    phaseNames: ["呼吸觉察", "身体扫描", "专注练习", "日常正念"],
    phaseDescs: ["学习基础呼吸冥想", "练习身体扫描放松", "提升专注力和觉察力", "将正念融入日常生活"],
  },
  {
    keywords: ["瑜伽", "yoga", "拉伸"],
    resources: [
      { title: "零基础瑜伽入门30天", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Yoga With Adriene", platform: "YouTube", url: "https://www.youtube.com/@yogawithadriene" },
      { title: "Keep瑜伽课程", platform: "App", url: "https://www.gotokeep.com/" },
      { title: "晨间瑜伽唤醒", platform: "B站", url: "https://www.bilibili.com/" },
    ],
    phaseNames: ["基础体式", "力量平衡", "流瑜伽", "冥想融合"],
    phaseDescs: ["学习基本站立和坐姿体式", "练习核心力量和平衡", "学习Vinyasa流动序列", "瑜伽与冥想呼吸结合"],
  },
  {
    keywords: ["跑步", "马拉松", "running", "慢跑"],
    resources: [
      { title: "新手跑步入门全攻略", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Nike Run Club", platform: "App", url: "https://www.nike.com/nrc-app" },
      { title: "《跑步圣经》", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "跑步训练计划", platform: "Keep", url: "https://www.gotokeep.com/" },
    ],
    phaseNames: ["跑走交替", "稳定配速", "距离提升", "速度突破"],
    phaseDescs: ["从跑走交替开始适应", "学习匀速跑和呼吸节奏", "逐步增加跑步距离", "间歇训练提升配速"],
  },

  // ===== 设计与创意 =====
  {
    keywords: ["ps", "photoshop", "修图", "p图"],
    resources: [
      { title: "PS零基础入门全集", platform: "B站", url: "https://www.bilibili.com/video/BV1Lb411n7sG/" },
      { title: "Photoshop入门到精通", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Phlearn修图教程", platform: "YouTube", url: "https://www.youtube.com/@phaboratory" },
    ],
    phaseNames: ["界面工具", "基础操作", "合成修图", "高级技法"],
    phaseDescs: ["熟悉PS界面和基本工具", "学习图层蒙版和调色", "练习合成和人像修图", "掌握高级特效和批处理"],
  },
  {
    keywords: ["剪辑", "视频剪辑", "pr", "premiere", "达芬奇", "剪映", "vlog"],
    resources: [
      { title: "PR视频剪辑入门", platform: "B站", url: "https://www.bilibili.com/video/BV1ht411J7Gm/" },
      { title: "剪映零基础教程", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "达芬奇调色入门", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Peter McKinnon剪辑课", platform: "YouTube", url: "https://www.youtube.com/@PeterMcKinnon" },
    ],
    phaseNames: ["软件基础", "剪辑技巧", "调色转场", "作品产出"],
    phaseDescs: ["熟悉剪辑软件操作", "学习节奏感和叙事结构", "掌握调色和转场效果", "独立完成短视频作品"],
  },
  {
    keywords: ["ui", "设计", "figma", "ux", "交互设计"],
    resources: [
      { title: "UI设计入门全集", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Figma零基础教程", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Google UX Design", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/google-ux-design" },
      { title: "设计原则精讲", platform: "YouTube", url: "https://www.youtube.com/" },
    ],
    phaseNames: ["设计原则", "工具掌握", "组件设计", "完整项目"],
    phaseDescs: ["学习色彩字体布局原则", "熟练使用Figma", "设计按钮卡片等组件", "完成完整App设计稿"],
  },
  {
    keywords: ["ppt", "演示", "幻灯片", "keynote"],
    resources: [
      { title: "PPT设计思维入门", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "旁门左道PPT教程", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "《演说之禅》", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    phaseNames: ["排版基础", "视觉设计", "逻辑结构", "演讲配合"],
    phaseDescs: ["学习PPT排版和配色", "掌握图文排版技巧", "练习内容逻辑结构化", "配合PPT做完整演讲"],
  },
  {
    keywords: ["excel", "表格", "数据分析", "spreadsheet"],
    resources: [
      { title: "Excel零基础入门", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Excel函数大全精讲", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "数据透视表详解", platform: "网易云课堂", url: "https://study.163.com/" },
    ],
    phaseNames: ["基础操作", "公式函数", "数据分析", "报表制作"],
    phaseDescs: ["学习单元格格式和排序筛选", "掌握VLOOKUP/IF等常用函数", "学习数据透视表和图表", "制作专业数据报表"],
  },

  // ===== 个人成长 =====
  {
    keywords: ["演讲", "口才", "表达", "公众演讲"],
    resources: [
      { title: "TED演讲的秘密", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Chris Anderson: TED's secret", platform: "TED", url: "https://www.ted.com/talks/chris_anderson_ted_s_secret_to_great_public_speaking" },
      { title: "100天演讲口才速成", platform: "喜马拉雅", url: "https://www.ximalaya.com/" },
      { title: "《金字塔原理》", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    phaseNames: ["克服紧张", "结构表达", "故事技巧", "即兴演讲"],
    phaseDescs: ["学习放松和自信建立方法", "掌握金字塔结构化表达", "学习用故事打动听众", "练习即兴演讲和临场应变"],
  },
  {
    keywords: ["心理学", "psychology", "情绪管理", "心理"],
    resources: [
      { title: "耶鲁大学·心理学导论", platform: "B站", url: "https://www.bilibili.com/video/BV1cE411c7rp/" },
      { title: "The School of Life", platform: "YouTube", url: "https://www.youtube.com/@TheSchoolofLife" },
      { title: "《心理学与生活》", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "《被讨厌的勇气》", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    phaseNames: ["基础认知", "情绪理解", "关系心理", "自我成长"],
    phaseDescs: ["了解心理学基本概念", "认识和管理自己的情绪", "理解人际关系心理", "建立健康的自我认知"],
  },
  {
    keywords: ["时间管理", "效率", "自律", "习惯"],
    resources: [
      { title: "《掌控习惯》精读", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "番茄工作法详解", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Ali Abdaal效率课", platform: "YouTube", url: "https://www.youtube.com/@aliabdaal" },
      { title: "《深度工作》", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    phaseNames: ["现状审视", "工具方法", "习惯养成", "系统优化"],
    phaseDescs: ["记录和分析时间使用", "学习番茄钟等效率工具", "用21天养成核心习惯", "搭建个人效率系统"],
  },
  {
    keywords: ["思维导图", "笔记", "记忆", "学习方法"],
    resources: [
      { title: "思维导图入门到精通", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "费曼学习法详解", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "《学习之道》", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "Notion笔记系统搭建", platform: "B站", url: "https://www.bilibili.com/" },
    ],
    phaseNames: ["方法论", "工具掌握", "实践应用", "体系建立"],
    phaseDescs: ["了解高效学习方法论", "掌握思维导图和笔记工具", "用新方法学习一个主题", "建立个人知识管理体系"],
  },

  // ===== 更多主题 =====
  {
    keywords: ["化妆", "美妆", "护肤"],
    resources: [
      { title: "新手化妆入门全教程", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "毛戈平化妆技巧", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "护肤基础知识", platform: "B站", url: "https://www.bilibili.com/" },
    ],
    phaseNames: ["护肤基础", "底妆技巧", "眼妆唇妆", "整体造型"],
    phaseDescs: ["了解肤质和护肤步骤", "学习底妆和遮瑕", "掌握眼妆和唇妆画法", "练习不同场合妆容"],
  },
  {
    keywords: ["穿搭", "搭配", "时尚", "衣服"],
    resources: [
      { title: "穿搭入门·找到你的风格", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "色彩搭配原理", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "《穿出你的品味》", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    phaseNames: ["了解身材", "色彩搭配", "风格探索", "衣橱管理"],
    phaseDescs: ["了解自己的身材特点", "学习色彩搭配原理", "找到适合自己的风格", "整理衣橱并高效搭配"],
  },
  {
    keywords: ["花艺", "插花", "花卉"],
    resources: [
      { title: "零基础学插花", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "花艺基础课程", platform: "网易云课堂", url: "https://study.163.com/" },
      { title: "韩式花艺教学", platform: "YouTube", url: "https://www.youtube.com/" },
    ],
    phaseNames: ["认识花材", "基础手法", "造型设计", "作品创作"],
    phaseDescs: ["认识常见花材和工具", "学习螺旋手法和修剪", "练习不同造型设计", "独立完成花艺作品"],
  },
  {
    keywords: ["手帐", "手账", "bullet journal"],
    resources: [
      { title: "手帐入门全攻略", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "手帐排版技巧", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "AmandaRachLee手帐", platform: "YouTube", url: "https://www.youtube.com/@amandarachlee" },
    ],
    phaseNames: ["工具选择", "排版基础", "装饰技巧", "个人系统"],
    phaseDescs: ["选择适合的手帐本和笔", "学习基础排版和字体", "掌握贴纸胶带装饰", "建立个人手帐系统"],
  },
  {
    keywords: ["日语n1", "日语n2", "考级"],
    resources: [
      { title: "JLPT N2备考全攻略", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "N1语法精讲", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "日语能力考真题解析", platform: "网易云课堂", url: "https://study.163.com/" },
    ],
    phaseNames: ["词汇积累", "语法攻克", "阅读强化", "真题冲刺"],
    phaseDescs: ["每日背诵核心词汇", "系统学习考级语法", "提升长文阅读速度", "做真题查漏补缺"],
  },
  {
    keywords: ["配音", "dubbing", "声优"],
    resources: [
      { title: "配音入门基础训练", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "声音训练教程", platform: "喜马拉雅", url: "https://www.ximalaya.com/" },
      { title: "配音秀", platform: "App", url: "https://www.peiyin.com/" },
    ],
    phaseNames: ["声音基础", "情感表达", "角色演绎", "作品创作"],
    phaseDescs: ["练习气息和发声位置", "学习不同情绪的表达", "模仿经典角色配音", "录制完整配音作品"],
  },
  {
    keywords: ["播客", "podcast", "音频节目"],
    resources: [
      { title: "如何做一档播客", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "播客录制与剪辑", platform: "YouTube", url: "https://www.youtube.com/" },
      { title: "小宇宙播客App", platform: "App", url: "https://www.xiaoyuzhoufm.com/" },
    ],
    phaseNames: ["策划选题", "录制技巧", "剪辑制作", "发布推广"],
    phaseDescs: ["确定播客定位和选题", "学习录音设备和技巧", "掌握音频剪辑和后期", "在平台发布并推广"],
  },
  {
    keywords: ["3d", "blender", "建模", "c4d"],
    resources: [
      { title: "Blender零基础入门", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "Blender Guru甜甜圈教程", platform: "YouTube", url: "https://www.youtube.com/@blenderguru" },
      { title: "C4D入门全集", platform: "B站", url: "https://www.bilibili.com/" },
    ],
    phaseNames: ["界面操作", "基础建模", "材质灯光", "渲染输出"],
    phaseDescs: ["熟悉3D软件界面操作", "学习基础建模技巧", "掌握材质和灯光设置", "完成作品渲染"],
  },
  {
    keywords: ["历史", "history", "中国历史", "世界历史"],
    resources: [
      { title: "混子曰·半小时漫画历史", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "《人类简史》", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "Crash Course历史", platform: "YouTube", url: "https://www.youtube.com/@crashcourse" },
      { title: "百家讲坛精选", platform: "喜马拉雅", url: "https://www.ximalaya.com/" },
    ],
    phaseNames: ["时间脉络", "重要事件", "人物传记", "深度思考"],
    phaseDescs: ["梳理历史时间线", "了解关键历史事件", "阅读重要人物传记", "从历史中获得启示"],
  },
  {
    keywords: ["哲学", "philosophy"],
    resources: [
      { title: "哲学入门·从苏格拉底开始", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "《苏菲的世界》", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "Crash Course哲学", platform: "YouTube", url: "https://www.youtube.com/@crashcourse" },
      { title: "哲学100问", platform: "喜马拉雅", url: "https://www.ximalaya.com/" },
    ],
    phaseNames: ["古典哲学", "近代思想", "现代哲学", "哲学实践"],
    phaseDescs: ["了解苏格拉底柏拉图亚里士多德", "学习笛卡尔康德黑格尔", "了解存在主义等现代流派", "用哲学思维审视生活"],
  },
  {
    keywords: ["经济学", "经济", "economics"],
    resources: [
      { title: "经济学原理精讲", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "《薛兆丰经济学讲义》", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "Crash Course经济学", platform: "YouTube", url: "https://www.youtube.com/@crashcourse" },
    ],
    phaseNames: ["微观基础", "宏观经济", "金融市场", "现实应用"],
    phaseDescs: ["学习供需和市场机制", "了解GDP通胀就业", "认识金融市场运作", "用经济学思维分析生活"],
  },
  {
    keywords: ["数学", "高数", "数学思维"],
    resources: [
      { title: "3Blue1Brown数学之美", platform: "YouTube", url: "https://www.youtube.com/@3blue1brown" },
      { title: "数学思维训练", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "《数学之美》", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    phaseNames: ["数感培养", "逻辑推理", "应用实践", "深度探索"],
    phaseDescs: ["建立数学直觉和数感", "训练逻辑推理能力", "数学在生活中的应用", "探索感兴趣的数学领域"],
  },
  {
    keywords: ["茶", "茶道", "品茶", "茶艺"],
    resources: [
      { title: "茶道入门全集", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "六大茶类详解", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "《茶经》精读", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    phaseNames: ["认识茶类", "冲泡方法", "品鉴能力", "茶文化"],
    phaseDescs: ["了解六大茶类特点", "掌握不同茶的冲泡方法", "培养品茶和鉴别能力", "了解茶道文化和历史"],
  },
];
