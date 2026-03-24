"use client";

import { useState, useEffect, useCallback } from "react";
import { Goal, GoalCategory, GoalPhase, GoalResource, GOAL_CATEGORY_META, TaskColor } from "@/types";
import { TASK_COLORS, getCardBackgroundColor, getCardAccentColor } from "@/lib/colors";
import {
  ArrowLeft,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  Zap,
  ExternalLink,
  Link2,
  Plus,
  X,
} from "lucide-react";

interface CreateGoalProps {
  onBack: () => void;
  onComplete: (goal: Goal) => void;
  hideBack?: boolean;
}

type Step = "detail" | "planning" | "preview";

const COLOR_OPTIONS: TaskColor[] = [
  "coral", "orange", "blue", "green", "purple", "pink", "teal", "yellow",
];

const DURATION_OPTIONS = [
  { value: 30, label: "30天", desc: "短期冲刺" },
  { value: 60, label: "60天", desc: "稳步前进" },
  { value: 90, label: "90天", desc: "深度养成" },
];

const MINUTES_OPTIONS = [
  { value: 10, label: "10分钟", desc: "碎片时间" },
  { value: 15, label: "15分钟", desc: "轻松可达" },
  { value: 20, label: "20分钟", desc: "推荐" },
  { value: 30, label: "30分钟", desc: "充实投入" },
];

const ANCHOR_OPTIONS = [
  { value: "morning",  label: "起床后", icon: "☀️" },
  { value: "brush",    label: "刷牙后", icon: "🪥" },
  { value: "lunch",    label: "午饭后", icon: "🍚" },
  { value: "commute",  label: "通勤时", icon: "🚶" },
  { value: "dinner",   label: "晚饭后", icon: "🍽️" },
  { value: "sleep",    label: "睡觉前", icon: "🌙" },
];

const STEPS: Step[] = ["detail", "planning", "preview"];

/* ===== 动态方案生成系统 ===== */

type SampleTaskDef = { title: string; resource: string; platform: string; url: string };

interface DomainPlan {
  icon?: string;
  phases: { name: string; desc: string; tasks: SampleTaskDef[] }[];
}

// 关键词 → 领域映射（前置关键词优先级更高）
const KEYWORD_DOMAIN_ENTRIES: [string[], string][] = [
  [["声乐", "唱歌", "演唱", "歌唱", "学唱", "唱歌技巧", "唱歌教学", "声乐教学", "学声乐", "练声", "发声"], "vocal"],
  [["钢琴", "piano", "键盘", "钢琴曲", "学钢琴", "弹钢琴"], "piano"],
  [["吉他", "guitar", "民谣", "指弹", "电吉他", "学吉他", "弹吉他", "弹唱"], "guitar"],
  [["摄影", "拍照", "拍摄", "相机", "镜头", "学摄影", "拍人像", "风光摄影"], "photography"],
  [["日语", "日文", "日本语", "にほんご", "日本话", "学日语", "日语口语"], "japanese"],
  [["韩语", "韩文", "한국어", "韩国话", "学韩语"], "korean"],
  [["法语", "法文", "français", "学法语"], "french"],
  [["跑步", "长跑", "马拉松", "晨跑", "健跑", "学跑步", "跑步训练"], "running"],
  [["烹饪", "做饭", "厨艺", "料理", "美食制作", "学做饭", "学厨艺"], "cooking"],
  [["瑜伽", "冥想", "正念", "放松训练", "学瑜伽"], "yoga"],
  [["素描", "速写", "铅笔画", "素描基础", "学素描", "学画画"], "sketch"],
  [["水彩", "水彩画", "水粉", "丙烯", "学水彩"], "watercolor"],
  [["篮球", "足球", "羽毛球", "乒乓球", "网球", "学篮球", "学足球"], "sport"],
];

const DOMAIN_PLANS: Record<string, DomainPlan> = {
  vocal: {
    icon: "🎤",
    phases: [
      {
        name: "气息与发声",
        desc: "掌握腹式呼吸，建立正确发声方式",
        tasks: [
          { title: "练习腹式呼吸10分钟", resource: "声乐气息基础训练全集", platform: "B站", url: "https://www.bilibili.com/video/BV1vM4y1L7gR/" },
          { title: "练习音阶发声（1-3-5-8）", resource: "零基础声乐系统课", platform: "网易云课堂", url: "https://study.163.com/" },
          { title: "录音回听检查音准", resource: "唱歌技巧入门教程", platform: "B站", url: "https://www.bilibili.com/" },
        ],
      },
      {
        name: "音色与共鸣",
        desc: "训练共鸣腔体，拓展音域",
        tasks: [
          { title: "练习头腔共鸣哼鸣5分钟", resource: "声乐技巧：共鸣训练详解", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "练习换声区过渡技巧", resource: "声乐进阶：换声区突破", platform: "YouTube", url: "https://www.youtube.com/" },
          { title: "用钢琴/App练习音阶跨度", resource: "唱歌音域拓展训练", platform: "喜马拉雅", url: "https://www.ximalaya.com/" },
        ],
      },
      {
        name: "演唱技巧实战",
        desc: "将技能融入完整歌曲演唱",
        tasks: [
          { title: "选一首适合当前程度的歌练习", resource: "声乐练习曲目推荐", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "分段攻克歌曲的难点部分", resource: "专业声乐演唱技巧", platform: "YouTube", url: "https://www.youtube.com/" },
          { title: "完整演唱并录音存档", resource: "全民K歌 / 唱鸭", platform: "App", url: "https://kg.qq.com/" },
        ],
      },
      {
        name: "风格与自信",
        desc: "形成个人演唱风格，敢于表达",
        tasks: [
          { title: "尝试不同风格演唱同一首歌", resource: "流行/民谣/戏腔演唱风格", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "对比第1天和今天的录音", resource: "声乐成长记录", platform: "App", url: "#" },
          { title: "演唱完整歌曲并发布/分享", resource: "全民K歌", platform: "App", url: "https://kg.qq.com/" },
        ],
      },
    ],
  },
  piano: {
    icon: "🎹",
    phases: [
      {
        name: "认识键盘与乐谱",
        desc: "了解钢琴构造，学习五线谱/简谱",
        tasks: [
          { title: "认识88个键位与音名", resource: "钢琴零基础入门系统课", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "练习五指基础手型（C大调）", resource: "拜厄钢琴基础教程", platform: "网易云课堂", url: "https://study.163.com/" },
          { title: "学会读一段简单的简谱", resource: "看谱弹琴入门", platform: "B站", url: "https://www.bilibili.com/" },
        ],
      },
      {
        name: "基础技巧训练",
        desc: "规范手型，练习音阶和节奏感",
        tasks: [
          { title: "练习哈农1-5号指法练习曲", resource: "哈农钢琴练指法全套", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "双手分开练习一段曲谱", resource: "钢琴初学者必练曲目", platform: "YouTube", url: "https://www.youtube.com/" },
          { title: "用节拍器练习节奏稳定", resource: "节拍器 App", platform: "App", url: "#" },
        ],
      },
      {
        name: "曲目实战",
        desc: "从简单曲目开始完整演奏",
        tasks: [
          { title: "练习《小星星》双手合奏版", resource: "入门钢琴曲目精选", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "慢速练习直到熟练再逐步加速", resource: "钢琴练习方法论", platform: "YouTube", url: "https://www.youtube.com/" },
          { title: "录视频记录演奏进度", resource: "钢琴学习打卡", platform: "App", url: "#" },
        ],
      },
      {
        name: "流畅演奏",
        desc: "能独立完整演奏喜欢的曲子",
        tasks: [
          { title: "选择自己喜欢的曲子练习", resource: "钢琴曲谱大全App", platform: "App", url: "#" },
          { title: "连贯演奏不停顿不看谱", resource: "钢琴表演技巧", platform: "YouTube", url: "https://www.youtube.com/" },
          { title: "录制完整演奏视频", resource: "B站钢琴展示", platform: "B站", url: "https://www.bilibili.com/" },
        ],
      },
    ],
  },
  guitar: {
    icon: "🎸",
    phases: [
      {
        name: "吉他基础",
        desc: "了解构造，学基本手型和和弦",
        tasks: [
          { title: "认识吉他各部位并学习调弦", resource: "吉他零基础入门课", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "练习C、Am、F、G四个基础和弦", resource: "流行吉他和弦入门", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "学习一种基础扫弦节奏型", resource: "吉他扫弦入门教程", platform: "YouTube", url: "https://www.youtube.com/" },
        ],
      },
      {
        name: "和弦切换与节奏",
        desc: "流畅切换和弦，掌握多种节奏型",
        tasks: [
          { title: "每天练习和弦切换直到顺畅", resource: "吉他和弦切换技巧", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "学习一个新的弹唱节奏型", resource: "吉他弹唱技巧进阶", platform: "YouTube", url: "https://www.youtube.com/" },
          { title: "用节拍器练习节奏稳定性", resource: "节拍器 App", platform: "App", url: "#" },
        ],
      },
      {
        name: "歌曲弹唱实战",
        desc: "边弹边唱，完整演奏一首歌",
        tasks: [
          { title: "学习一首入门弹唱歌曲", resource: "入门弹唱曲目精选", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "分段练习到完整连贯", resource: "吉他弹唱练习方法", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "录视频检查手型与坐姿", resource: "吉他姿势自检指南", platform: "YouTube", url: "https://www.youtube.com/" },
        ],
      },
      {
        name: "风格与自由演奏",
        desc: "探索自己的演奏风格",
        tasks: [
          { title: "模仿喜欢的歌手的弹唱方式", resource: "吉他风格模仿练习", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "尝试即兴编配和弦伴奏", resource: "吉他即兴入门", platform: "YouTube", url: "https://www.youtube.com/" },
          { title: "录制弹唱作品并发布", resource: "B站/抖音 弹唱展示", platform: "B站", url: "https://www.bilibili.com/" },
        ],
      },
    ],
  },
  photography: {
    icon: "📷",
    phases: [
      {
        name: "相机与曝光基础",
        desc: "了解相机原理，掌握曝光三角",
        tasks: [
          { title: "学习快门/光圈/ISO的关系", resource: "摄影基础：曝光三角讲解", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "用M档手动拍10张练习", resource: "手动档摄影入门实战", platform: "YouTube", url: "https://www.youtube.com/" },
          { title: "对比不同曝光参数的效果", resource: "曝光参数对比实验", platform: "B站", url: "https://www.bilibili.com/" },
        ],
      },
      {
        name: "构图与光线",
        desc: "学习构图原则，感受不同光线",
        tasks: [
          { title: "练习三分法、对称构图", resource: "摄影构图10大法则", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "在不同时段拍同一场景对比", resource: "光线与时间的关系", platform: "YouTube", url: "https://www.youtube.com/" },
          { title: "选出今日最满意的3张并分析", resource: "照片审美训练课", platform: "知乎", url: "https://www.zhihu.com/" },
        ],
      },
      {
        name: "后期处理",
        desc: "学习修图软件，让照片更出彩",
        tasks: [
          { title: "学习Lightroom基础调色", resource: "Lightroom入门完整教程", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "给10张照片做基础后期", resource: "手机摄影后期技巧", platform: "YouTube", url: "https://www.youtube.com/" },
          { title: "对比修图前后差异", resource: "后期修图前后对比", platform: "B站", url: "https://www.bilibili.com/" },
        ],
      },
      {
        name: "主题创作",
        desc: "有主题地完成一套作品",
        tasks: [
          { title: "确定一个拍摄主题并规划", resource: "摄影主题创作指南", platform: "知乎", url: "https://www.zhihu.com/" },
          { title: "外出拍100张精选10张", resource: "街头摄影实战技巧", platform: "YouTube", url: "https://www.youtube.com/" },
          { title: "整理并发布你的摄影作品集", resource: "图虫/500px展示平台", platform: "App", url: "#" },
        ],
      },
    ],
  },
  japanese: {
    icon: "🇯🇵",
    phases: [
      {
        name: "假名与基础发音",
        desc: "学会平假名、片假名，掌握发音规则",
        tasks: [
          { title: "学习平假名全部46个字符", resource: "日语零基础入门系统课", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "练习基础发音与拼读规则", resource: "日语发音纠正课程", platform: "网易云课堂", url: "https://study.163.com/" },
          { title: "抄写并默写今日学的假名", resource: "假名练习本", platform: "App", url: "#" },
        ],
      },
      {
        name: "词汇与基础句型",
        desc: "积累高频词汇，学习基础句型",
        tasks: [
          { title: "每天学习10个日常生活词汇", resource: "日语N5高频单词", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "练习「です/ます」敬语句型", resource: "日语N5语法入门", platform: "网易云课堂", url: "https://study.163.com/" },
          { title: "用Anki复习今日词汇", resource: "Anki单词记忆卡片", platform: "App", url: "https://apps.ankiweb.net/" },
        ],
      },
      {
        name: "听说综合练习",
        desc: "提升听力和开口表达能力",
        tasks: [
          { title: "听一段3分钟慢速日语对话", resource: "日语慢速听力训练", platform: "YouTube", url: "https://www.youtube.com/" },
          { title: "跟读并模仿日本人的语调", resource: "日语跟读训练合集", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "背一段日常对话情景脚本", resource: "日语情景会话100句", platform: "喜马拉雅", url: "https://www.ximalaya.com/" },
        ],
      },
      {
        name: "综合运用",
        desc: "能用日语表达日常场景",
        tasks: [
          { title: "用日语写一段自我介绍", resource: "日语写作练习", platform: "网易云课堂", url: "https://study.163.com/" },
          { title: "看一集日语节目不看字幕", resource: "日语综艺听力练习", platform: "B站", url: "https://www.bilibili.com/" },
          { title: "尝试用HelloTalk和日本人对话", resource: "HelloTalk语言交换App", platform: "App", url: "https://www.hellotalk.com/" },
        ],
      },
    ],
  },
  korean: {
    icon: "🇰🇷",
    phases: [
      { name: "韩文字母与发音", desc: "学习韩语字母，掌握基础发音", tasks: [
        { title: "学习韩语辅音和元音（40个）", resource: "韩语零基础入门", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "练习韩语基础拼读规则", resource: "韩语发音精讲", platform: "网易云课堂", url: "https://study.163.com/" },
        { title: "听写练习10个韩语单词", resource: "韩语单词记忆法", platform: "App", url: "#" },
      ]},
      { name: "词汇与日常句型", desc: "积累日常词汇，学习基础表达", tasks: [
        { title: "每天学习10个高频韩语词汇", resource: "韩语TOPIK词汇精讲", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "练习「입니다/요」基础句型", resource: "韩语基础语法入门", platform: "网易云课堂", url: "https://study.163.com/" },
        { title: "用App复习今日词汇", resource: "多邻国韩语学习", platform: "App", url: "https://www.duolingo.com/" },
      ]},
      { name: "听力与口语", desc: "提升听力，敢于开口表达", tasks: [
        { title: "听韩剧一段台词并跟读", resource: "韩剧听力精听训练", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "学习一段日常场景对话", resource: "韩语情景会话", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "录音对比自己和原声的发音", resource: "韩语发音纠正", platform: "App", url: "#" },
      ]},
      { name: "综合表达", desc: "能用韩语交流日常场景", tasks: [
        { title: "用韩语写一段自我介绍", resource: "韩语写作入门", platform: "网易云课堂", url: "https://study.163.com/" },
        { title: "看一集韩剧不看字幕", resource: "韩语听力进阶", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "在语言交换App和韩国人对话", resource: "HelloTalk / Tandem", platform: "App", url: "https://www.hellotalk.com/" },
      ]},
    ],
  },
  french: {
    icon: "🇫🇷",
    phases: [
      { name: "法语发音与字母", desc: "掌握法语发音规则，学习基础词汇", tasks: [
        { title: "学习法语字母与特殊符号", resource: "法语零基础入门", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "练习法语鼻音和特殊发音", resource: "法语发音精讲", platform: "网易云课堂", url: "https://study.163.com/" },
        { title: "跟读10个日常用语", resource: "法语日常用语100句", platform: "喜马拉雅", url: "https://www.ximalaya.com/" },
      ]},
      { name: "基础词汇与句型", desc: "积累词汇，学习常用句式", tasks: [
        { title: "每天学习10个高频法语词汇", resource: "法语A1词汇精讲", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "练习être/avoir等基础动词变位", resource: "法语语法入门", platform: "网易云课堂", url: "https://study.163.com/" },
        { title: "用多邻国每天练习", resource: "多邻国法语课程", platform: "App", url: "https://www.duolingo.com/" },
      ]},
      { name: "听说实战", desc: "提升听力，开口表达法语", tasks: [
        { title: "听一段法语慢速对话", resource: "法语慢速听力训练", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "模仿法语原声跟读", resource: "法语跟读训练", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "用法语做自我介绍录音", resource: "法语口语练习", platform: "App", url: "#" },
      ]},
      { name: "综合表达", desc: "能用法语进行日常交流", tasks: [
        { title: "看一段法语电影不看字幕", resource: "法语影视听力训练", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "用法语写一封简单的信", resource: "法语写作练习", platform: "网易云课堂", url: "https://study.163.com/" },
        { title: "在语言交换App找法国人练习", resource: "HelloTalk语言交换", platform: "App", url: "https://www.hellotalk.com/" },
      ]},
    ],
  },
  running: {
    icon: "🏃",
    phases: [
      { name: "建立跑步习惯", desc: "掌握正确姿势，建立稳定的跑步节奏", tasks: [
        { title: "完成20分钟慢跑（心率130以内）", resource: "跑步入门：慢跑训练指南", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "学习正确的跑步姿势与呼吸", resource: "跑姿优化教学", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "用App记录配速和心率", resource: "Keep / 咕咚 跑步记录", platform: "App", url: "https://www.gotokeep.com/" },
      ]},
      { name: "耐力提升", desc: "逐步提升跑量，增强心肺能力", tasks: [
        { title: "完成30分钟连续跑步不中断", resource: "耐力跑训练计划", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "进行一次间歇跑训练", resource: "间歇跑入门教学", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "记录本周总跑量与心率变化", resource: "跑步数据分析", platform: "App", url: "https://www.gotokeep.com/" },
      ]},
      { name: "速度与节奏", desc: "提升配速，找到自己的跑步节奏", tasks: [
        { title: "完成4组400米节奏跑", resource: "速度训练计划", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "尝试以目标配速跑5公里", resource: "配速控制训练指南", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "跑后拉伸放松15分钟", resource: "跑后拉伸全套动作", platform: "B站", url: "https://www.bilibili.com/" },
      ]},
      { name: "挑战目标", desc: "完成你设定的跑步里程目标", tasks: [
        { title: "完成一次5公里/10公里测试", resource: "跑步里程碑挑战", platform: "App", url: "https://www.gotokeep.com/" },
        { title: "参加一场线上跑步活动", resource: "线上马拉松活动报名", platform: "App", url: "#" },
        { title: "对比第1天和今天的数据", resource: "跑步成长数据复盘", platform: "App", url: "#" },
      ]},
    ],
  },
  cooking: {
    icon: "🍳",
    phases: [
      { name: "厨房基础技能", desc: "了解食材，掌握基本刀工与烹饪工具", tasks: [
        { title: "学习3种基础刀工：切丁/丝/片", resource: "厨艺入门：刀工基础教程", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "练习炒一道简单蔬菜", resource: "零基础学做饭合集", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "了解各种调味料的用法", resource: "调味料使用完全指南", platform: "知乎", url: "https://www.zhihu.com/" },
      ]},
      { name: "家常菜技巧", desc: "掌握常用烹饪方法，做出美味家常菜", tasks: [
        { title: "学做一道有代表性的家常菜", resource: "家常菜100道精选教程", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "练习控制油温和火候", resource: "火候与油温控制技巧", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "记录食谱并拍照留存", resource: "下厨房美食记录", platform: "App", url: "https://www.xiachufang.com/" },
      ]},
      { name: "进阶菜式", desc: "尝试更复杂的菜式和搭配", tasks: [
        { title: "学做一道有挑战性的特色菜", resource: "进阶中华料理教程", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "学习荤素搭配与营养均衡", resource: "健康饮食搭配指南", platform: "知乎", url: "https://www.zhihu.com/" },
        { title: "为家人/朋友做一顿完整的饭", resource: "家庭套餐搭配方案", platform: "下厨房", url: "https://www.xiachufang.com/" },
      ]},
      { name: "自由创作", desc: "不靠菜谱，凭感觉做出好菜", tasks: [
        { title: "根据冰箱食材即兴做一道菜", resource: "食材即兴创意料理", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "尝试改良一道自己喜欢的菜", resource: "家庭菜谱创新方法", platform: "下厨房", url: "https://www.xiachufang.com/" },
        { title: "把你的拿手菜录成视频教程", resource: "美食视频制作入门", platform: "B站", url: "https://www.bilibili.com/" },
      ]},
    ],
  },
  yoga: {
    icon: "🧘",
    phases: [
      { name: "呼吸与基础体式", desc: "学习腹式呼吸，掌握基础瑜伽体式", tasks: [
        { title: "练习腹式呼吸和调息10分钟", resource: "瑜伽入门：呼吸与基础体式", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "学习5个基础站立体式", resource: "零基础瑜伽课程", platform: "网易云课堂", url: "https://study.163.com/" },
        { title: "完成10分钟晨间拉伸", resource: "每日晨间瑜伽", platform: "YouTube", url: "https://www.youtube.com/" },
      ]},
      { name: "柔韧与力量", desc: "提升柔韧性，增强核心力量", tasks: [
        { title: "练习深度拉伸5个体式", resource: "瑜伽柔韧性训练", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "完成20分钟核心力量流", resource: "瑜伽核心训练课", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "记录体式进步情况", resource: "瑜伽打卡记录", platform: "App", url: "#" },
      ]},
      { name: "完整流程练习", desc: "完整地完成一套瑜伽流程", tasks: [
        { title: "完成30分钟完整瑜伽流", resource: "30分钟全身瑜伽流", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "学习一个高级挑战体式", resource: "瑜伽进阶体式教学", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "做饭后15分钟恢复性瑜伽", resource: "恢复性瑜伽指南", platform: "YouTube", url: "https://www.youtube.com/" },
      ]},
      { name: "冥想与内化", desc: "将瑜伽融入日常生活与内心状态", tasks: [
        { title: "完成10分钟正念冥想", resource: "冥想入门指南", platform: "喜马拉雅", url: "https://www.ximalaya.com/" },
        { title: "对比第1天和今天的体式变化", resource: "瑜伽成长记录", platform: "App", url: "#" },
        { title: "写一段今日练习的感受", resource: "瑜伽日记模板", platform: "App", url: "#" },
      ]},
    ],
  },
  sketch: {
    icon: "✏️",
    phases: [
      { name: "线条与基础形体", desc: "掌握线条控制，学习基本几何形体", tasks: [
        { title: "练习排线：直线、曲线、交叉线", resource: "素描基础：排线技巧", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "画基础几何体（球体/方体/柱体）", resource: "素描几何体入门", platform: "网易云课堂", url: "https://study.163.com/" },
        { title: "临摹一个简单静物轮廓", resource: "静物素描入门", platform: "B站", url: "https://www.bilibili.com/" },
      ]},
      { name: "光影与体积感", desc: "学习光影表现，让画面有立体感", tasks: [
        { title: "练习不同方向光源的阴影", resource: "素描光影训练", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "完成一个有明暗关系的几何体", resource: "素描明暗五调子", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "临摹一张有光影感的照片", resource: "素描临摹练习", platform: "B站", url: "https://www.bilibili.com/" },
      ]},
      { name: "综合结构练习", desc: "处理复杂对象，提升整体构图能力", tasks: [
        { title: "完成一幅静物组合素描", resource: "静物组合素描教程", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "尝试人物头部结构练习", resource: "头像素描入门", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "对比今天和第一天的作品", resource: "素描成长记录", platform: "App", url: "#" },
      ]},
      { name: "创作与风格", desc: "有想法地创作，形成个人风格", tasks: [
        { title: "从照片或生活中选主题创作", resource: "写生与观察训练", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "尝试不同质感的表现方法", resource: "质感素描技巧", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "整理素描作品集并分享", resource: "作品集整理指南", platform: "知乎", url: "https://www.zhihu.com/" },
      ]},
    ],
  },
  watercolor: {
    icon: "🎨",
    phases: [
      { name: "工具与基础技法", desc: "了解水彩工具，掌握基本涂色技法", tasks: [
        { title: "学习湿画法和干画法的区别", resource: "水彩零基础入门", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "练习渐变色晕染", resource: "水彩渐变技法练习", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "完成一幅色块练习", resource: "水彩色彩基础", platform: "网易云课堂", url: "https://study.163.com/" },
      ]},
      { name: "色彩与混色", desc: "理解色彩关系，学习混色技巧", tasks: [
        { title: "制作个人颜色参考色卡", resource: "水彩混色实验教程", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "练习冷暖色调的对比表现", resource: "水彩色彩理论", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "临摹一幅简单风景水彩", resource: "水彩风景入门", platform: "B站", url: "https://www.bilibili.com/" },
      ]},
      { name: "主题创作入门", desc: "尝试有主题的水彩创作", tasks: [
        { title: "完成一幅花卉或植物水彩", resource: "水彩植物教程", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "学习留白与叠色技法", resource: "水彩进阶技法", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "对比今天和第一天的作品", resource: "水彩成长记录", platform: "App", url: "#" },
      ]},
      { name: "自由创作", desc: "有想法地进行水彩创作表达", tasks: [
        { title: "选择自己喜欢的主题完整创作", resource: "水彩创意表达", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "尝试抽象水彩或情绪表达", resource: "抽象水彩入门", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "整理作品集并分享", resource: "水彩作品展示", platform: "知乎", url: "https://www.zhihu.com/" },
      ]},
    ],
  },
  sport: {
    icon: "⚽",
    phases: [
      { name: "基础技能入门", desc: "掌握基本动作规范和核心技能", tasks: [
        { title: "学习基础动作要领和规则", resource: "运动技巧零基础入门", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "完成基础技能专项练习", resource: "运动基础训练计划", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "记录今日训练数据", resource: "运动打卡记录", platform: "App", url: "#" },
      ]},
      { name: "体能与协调性", desc: "提升相关体能，增强协调配合", tasks: [
        { title: "完成针对性体能训练", resource: "运动专项体能训练", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "练习协调性和反应速度", resource: "运动协调性训练", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "对比上周的训练进步", resource: "运动数据分析", platform: "App", url: "#" },
      ]},
      { name: "技巧提升", desc: "深化技术细节，提升对抗能力", tasks: [
        { title: "针对性练习最薄弱的技术点", resource: "运动进阶技巧教学", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "参加一次实战练习或比赛", resource: "运动实战指南", platform: "YouTube", url: "https://www.youtube.com/" },
        { title: "复盘实战中的不足", resource: "运动复盘方法", platform: "知乎", url: "https://www.zhihu.com/" },
      ]},
      { name: "综合实战", desc: "稳定发挥，享受运动乐趣", tasks: [
        { title: "完成一场完整的比赛或对练", resource: "运动实战技巧", platform: "B站", url: "https://www.bilibili.com/" },
        { title: "对比第1天和今天的技术变化", resource: "运动成长记录", platform: "App", url: "#" },
        { title: "制定下一阶段训练计划", resource: "运动规划指南", platform: "知乎", url: "https://www.zhihu.com/" },
      ]},
    ],
  },
};

/**
 * 从用户输入中提取主题关键词
 * 优先级：领域关键词直接匹配 > 去除常见前后缀 > 原始分词
 */
function extractPrimaryKeyword(title: string, description: string): string {
  const text = `${title} ${description}`.trim();

  // 1. 优先从领域关键词表中直接匹配
  for (const [keywords] of KEYWORD_DOMAIN_ENTRIES) {
    for (const kw of keywords) {
      if (text.includes(kw)) return kw;
    }
  }

  // 2. 去除常见动词前缀和名词后缀，提取核心词
  const cleanTitle = title.trim()
    .replace(/^(我想要?|想要?|我要|我准备|计划|我想学会?|我要学会?|学会?|教|练好?|做好?|掌握|提升|搞定)/u, "")
    .replace(/(教学|课程|训练|学习|技巧|技能|入门|教程|基础|练习|进阶|提升)$/u, "")
    .trim();
  if (cleanTitle.length >= 2) return cleanTitle;

  // 3. 回退：按标点和空格分词，去停用词取第一个有意义的片段
  const stopWords = new Set(["我", "想", "学", "会", "的", "了", "在", "和", "能", "让", "变", "成", "为", "好", "更", "到", "有", "这", "那", "是", "不", "要", "把", "用", "可以", "自己"]);
  const segments = text
    .split(/[\s，。！？、：；]+/)
    .map(s => s.replace(/^(我想要?|想要?|学会?|学好?)/u, "").trim())
    .filter(w => w.length >= 2 && !stopWords.has(w));
  return segments[0] || title.trim().slice(0, 4) || "学习";
}

/**
 * 根据标题和描述匹配最合适的领域方案
 */
function matchDomainPlan(title: string, description: string): DomainPlan | null {
  const text = `${title} ${description}`;
  for (const [keywords, domain] of KEYWORD_DOMAIN_ENTRIES) {
    if (keywords.some(k => text.includes(k))) {
      return DOMAIN_PLANS[domain] ?? null;
    }
  }
  return null;
}

/**
 * 通用关键词方案生成器（未匹配到具体领域时使用）
 */
function generateGenericPlan(keyword: string): DomainPlan {
  const phaseNames = [`${keyword}基础入门`, `${keyword}技能提升`, `${keyword}综合实践`, `${keyword}自由运用`];
  const phaseDescs = [
    `了解${keyword}的基础知识，建立核心认知`,
    `系统练习${keyword}的关键技能，逐步提升`,
    `将${keyword}技能综合运用到实际场景`,
    `形成个人风格，自信自如地运用${keyword}`,
  ];
  const taskTemplates = [
    [["了解", "的基础概念和核心知识"], ["学习", "的第一个关键技能"], ["记录今日学习内容，写下3个收获"]],
    [["系统练习", "的核心技能"], ["深入学习", "的进阶知识"], ["复习本周内容，找到薄弱点"]],
    [["综合运用", "技能完成一个实际任务"], ["挑战一个有难度的场景练习"], ["对比第1周和今天的进步"]],
    [["独立完成一个完整的", "项目"], ["分享你的学习成果"], ["总结", "学习心得并制定下一步计划"]],
  ];
  return {
    phases: phaseNames.map((name, i) => ({
      name,
      desc: phaseDescs[i],
      tasks: taskTemplates[i].map(([prefix, suffix]) => ({
        title: `${prefix}${keyword}${suffix || ""}`,
        resource: `${keyword}系统学习课程`,
        platform: i % 2 === 0 ? "B站" : "网易云课堂",
        url: i % 2 === 0 ? "https://www.bilibili.com/" : "https://study.163.com/",
      })),
    })),
  };
}

/**
 * 获取最终使用的方案（领域匹配 > 通用生成 > 分类预设）
 */
function resolvePlan(title: string, description: string, category: GoalCategory): {
  phaseNames: string[];
  phaseDescs: string[];
  phaseTasks: SampleTaskDef[][];
} {
  const domainPlan = matchDomainPlan(title, description);
  if (domainPlan) {
    return {
      phaseNames: domainPlan.phases.map(p => p.name),
      phaseDescs: domainPlan.phases.map(p => p.desc),
      phaseTasks: domainPlan.phases.map(p => p.tasks),
    };
  }

  const keyword = extractPrimaryKeyword(title, description);
  // 如果关键词不在预设分类范畴内，使用通用生成器
  const genericKeywords = ["语言", "英语", "学习", "音乐", "阅读", "编程", "写作", "健身", "艺术"];
  const isGenericCategory = genericKeywords.some(k => keyword.includes(k) || title.includes(k));
  if (!isGenericCategory && keyword.length >= 2) {
    const plan = generateGenericPlan(keyword);
    return {
      phaseNames: plan.phases.map(p => p.name),
      phaseDescs: plan.phases.map(p => p.desc),
      phaseTasks: plan.phases.map(p => p.tasks),
    };
  }

  // 回退到分类预设
  const fallbackNames = ["基础入门", "技能提升", "综合实践", "自由运用"];
  const fallbackDescs = [
    "建立基础认知，熟悉核心概念",
    "系统练习，逐步提升关键技能",
    "综合运用所学，挑战实际场景",
    "形成个人风格，自信自如表达",
  ];
  const catTasks = CATEGORY_SAMPLE_TASKS[category] ?? CATEGORY_SAMPLE_TASKS["other"];
  return {
    phaseNames: fallbackNames,
    phaseDescs: fallbackDescs,
    phaseTasks: fallbackNames.map(name => catTasks[name] ?? catTasks["基础入门"] ?? []),
  };
}

function buildGoal(
  category: GoalCategory,
  title: string,
  description: string,
  color: TaskColor,
  duration: number,
  dailyMinutes: number,
  customResources: GoalResource[],
): Goal {
  const phaseCount = Math.min(Math.ceil(duration / 15), 4);
  const perPhase = Math.ceil(duration / phaseCount);
  const { phaseNames, phaseDescs } = resolvePlan(title, description, category);

  const phases: GoalPhase[] = Array.from({ length: phaseCount }, (_, i) => ({
    id: `new-p${i + 1}`,
    phaseNumber: i + 1,
    title: phaseNames[i] ?? `阶段${i + 1}`,
    description: phaseDescs[i] ?? "持续精进",
    skills: [],
    startDay: i * perPhase + 1,
    endDay: Math.min((i + 1) * perPhase, duration),
    totalTasks: perPhase,
    completedTasks: 0,
    status: i === 0 ? "active" : "upcoming",
  }));

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + duration);

  return {
    id: `g-${Date.now()}`,
    title,
    category,
    icon: GOAL_CATEGORY_META[category].icon,
    startDate: today.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
    totalDays: duration,
    completedDays: 0,
    currentStreak: 0,
    bestStreak: 0,
    color,
    description,
    dailyMinutes,
    status: "active",
    phases,
    customResources,
  };
}

function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return url.toString();
  } catch {
    return null;
  }
}

function buildFallbackTitle(url: string): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    return `${hostname} · 加载标题中...`;
  } catch {
    return url;
  }
}

async function fetchResourceTitle(url: string): Promise<string> {
  try {
    const res = await fetch("/api/fetch-title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (data.title) return data.title;
  } catch { /* fall through */ }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    const slug = parsed.pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/[-_]/g, " ")
      .slice(0, 24);
    return slug ? `${hostname} · ${decodeURIComponent(slug)}` : hostname;
  } catch {
    return url;
  }
}

export default function CreateGoal({ onBack, onComplete, hideBack = false }: CreateGoalProps) {
  const [step, setStep] = useState<Step>("detail");
  const [category, setCategory] = useState<GoalCategory | null>("language");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<TaskColor>("coral");
  const [duration, setDuration] = useState(30);
  const [dailyMinutes, setDailyMinutes] = useState(10);
  const [customResources, setCustomResources] = useState<GoalResource[]>([]);
  const [habitAnchor, setHabitAnchor] = useState<string | null>(null);

  const [titleError, setTitleError] = useState<string | null>(null);

  const canProceedToPlanning = title.trim().length > 0 || customResources.length > 0;
  const stepIndex = STEPS.indexOf(step);
  const showBottomAction = step === "detail" || step === "preview";

  function isMeaningfulTitle(text: string): boolean {
    const t = text.trim();
    if (t.length < 2) return false;
    if (!/[a-zA-Z\u4e00-\u9fa5]/.test(t)) return false;
    if (/^(.)\1+$/u.test(t)) return false;
    if (!/[\u4e00-\u9fa5]/.test(t) && t.length < 4) return false;
    return true;
  }

  const handleConfirm = useCallback(() => {
    let finalTitle = title.trim();
    if (!finalTitle && customResources.length > 0) {
      const resourceTitle = customResources[0].title;
      const cleaned = resourceTitle
        .replace(/^.*?·\s*/, "")
        .replace(/加载标题中\.*$/g, "")
        .trim();
      finalTitle = cleaned ? cleaned.slice(0, 8) : "我的学习计划";
    }
    if (!finalTitle) finalTitle = "我的学习计划";
    const goal = buildGoal(category!, finalTitle, description, color, duration, dailyMinutes, customResources);
    onComplete(goal);
  }, [category, title, description, color, duration, dailyMinutes, customResources, onComplete]);

  const handleAddResource = useCallback((input: string) => {
    const normalizedUrl = normalizeUrl(input);
    if (!normalizedUrl) {
      return { ok: false as const, message: "请输入有效链接" };
    }

    const existed = customResources.some((resource) => resource.url === normalizedUrl);
    if (existed) {
      return { ok: false as const, message: "这个链接已经添加过了" };
    }

    const resourceId = `resource-${Date.now()}-${customResources.length}`;

    setCustomResources((prev) => [
      ...prev,
      {
        id: resourceId,
        url: normalizedUrl,
        title: buildFallbackTitle(normalizedUrl),
        type: "url",
      },
    ]);

    fetchResourceTitle(normalizedUrl).then((realTitle) => {
      setCustomResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, title: realTitle } : r))
      );
    });

    return { ok: true as const, message: "" };
  }, [customResources]);

  const handleRemoveResource = useCallback((id: string) => {
    setCustomResources((prev) => prev.filter((resource) => resource.id !== id));
  }, []);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#FBFBFB] relative">
      <div className="px-5 pt-4 pb-3">
        {!hideBack && (
          <button
            onClick={step === "detail" ? onBack : () => setStep(STEPS[Math.max(0, stepIndex - 1)])}
            className="flex items-center gap-1 text-[13px] font-bold text-black/55 mb-3
                       active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} />
            {step === "detail" ? "返回" : "上一步"}
          </button>
        )}

        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-[14px] flex items-center justify-center text-[12px] font-extrabold transition-all ${
                  step === s
                    ? "bg-[#222222] text-white scale-110"
                    : stepIndex > i
                    ? "bg-white text-[#222222]"
                    : "bg-black/10 text-black/35"
                }`}
              >
                {stepIndex > i ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              {i < 2 && (
                <div className={`w-6 h-[3px] rounded-full ${stepIndex > i ? "bg-[#222222]" : "bg-black/10"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto no-scrollbar ${step === "detail" ? "pb-[110px]" : step === "preview" ? "pb-[80px]" : showBottomAction ? "pb-6" : "pb-28"}`}>
        {step === "detail" && (
          <DetailStep
            category={category!} title={title} description={description}
            color={color} duration={duration} dailyMinutes={dailyMinutes}
            habitAnchor={habitAnchor}
            titleError={titleError}
            onTitleChange={(v) => { setTitle(v); if (titleError) setTitleError(null); }}
            onDescriptionChange={setDescription}
            onColorChange={setColor} onDurationChange={setDuration}
            onDailyMinutesChange={setDailyMinutes}
            onHabitAnchorChange={setHabitAnchor}
            customResources={customResources}
            onAddResource={handleAddResource}
            onRemoveResource={handleRemoveResource}
          />
        )}
        {step === "planning" && (
          <PlanningStep
            title={title} category={category!}
            duration={duration} dailyMinutes={dailyMinutes}
            customResources={customResources}
            onDone={() => setStep("preview")}
          />
        )}
        {step === "preview" && (
          <PreviewStep
            title={title} category={category!} color={color}
            duration={duration} dailyMinutes={dailyMinutes}
            description={description}
            customResources={customResources}
          />
        )}
      </div>

      {step === "detail" && (
        <div className="absolute bottom-5 left-0 right-0 px-6 z-10">
          <button
            onClick={() => {
              if (customResources.length === 0 && !isMeaningfulTitle(title)) {
                setTitleError("请输入有意义的目标，例如「学会日常英语对话」");
                return;
              }
              setTitleError(null);
              setStep("planning");
            }}
            disabled={!canProceedToPlanning}
            className={`w-full py-3.5 rounded-2xl font-extrabold text-[15px] flex items-center justify-center gap-2 transition-all ${canProceedToPlanning ? "active:scale-[0.98] text-white" : "text-black/25"}`}
            style={{ backgroundColor: canProceedToPlanning ? "#222222" : "#E8E8E8" }}
          >
            <Brain size={18} />
            让 AI 规划师帮我规划
          </button>
        </div>
      )}

      {step === "preview" && (
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-2 bg-transparent">
          <button
            onClick={handleConfirm}
            className="w-full py-4 rounded-2xl font-extrabold text-[16px] text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
            style={{ backgroundColor: "#222222" }}
          >
            <Sparkles size={18} />
            开始执行计划！
          </button>
        </div>
      )}
    </div>
  );
}

/* ===== Step 1: Category ===== */
function CategoryStep({ selected, onSelect }: { selected: GoalCategory | null; onSelect: (c: GoalCategory) => void }) {
  const categories = Object.entries(GOAL_CATEGORY_META) as [GoalCategory, { label: string; icon: string }][];
  return (
    <div className="px-4">
      <h2 className="text-[28px] font-extrabold text-[#222222] mb-1 px-1 leading-none">你想培养什么能力？</h2>
      <p className="text-[13px] text-black/55 font-medium mb-4 px-1">选择一个方向，AI 规划师会为你定制专属方案</p>
      <div className="grid grid-cols-2 gap-3">
        {categories.map(([key, meta], i) => (
          <button key={key} onClick={() => onSelect(key)}
            className="p-4 text-left transition-all rounded-[28px]"
            style={{
              animation: `slide-up 0.4s ease-out ${i * 0.05}s both`,
              backgroundColor: getCardBackgroundColor(i),
              transform: selected === key ? "scale(1.02)" : undefined,
            }}>
            <span className="text-3xl block mb-2">{meta.icon}</span>
            <p className="text-[14px] font-extrabold text-[#222222]">{meta.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== Step 2: Detail ===== */
function DetailStep({
  category, title, description, color, duration, dailyMinutes, habitAnchor,
  onTitleChange, onDescriptionChange, onColorChange, onDurationChange, onDailyMinutesChange, onHabitAnchorChange,
  customResources, onAddResource, onRemoveResource, titleError,
}: {
  category: GoalCategory; title: string; description: string; color: TaskColor;
  duration: number; dailyMinutes: number; habitAnchor: string | null;
  titleError?: string | null;
  onTitleChange: (v: string) => void; onDescriptionChange: (v: string) => void;
  onColorChange: (v: TaskColor) => void; onDurationChange: (v: number) => void;
  onDailyMinutesChange: (v: number) => void; onHabitAnchorChange: (v: string | null) => void;
  customResources: GoalResource[];
  onAddResource: (input: string) => { ok: true; message: string } | { ok: false; message: string };
  onRemoveResource: (id: string) => void;
}) {
  const meta = GOAL_CATEGORY_META[category];
  const [activeInputTab, setActiveInputTab] = useState<"ai" | "resource">("ai");

  return (
    <div className="px-4">
      <h2 className="text-[28px] font-extrabold text-[#222222] mb-1 px-1 leading-none">{meta.icon} 设定你的学习目标</h2>
      <p className="text-[13px] text-black/55 font-medium mb-4 px-1">AI帮你拆成每日任务，点击直达学习链接</p>

      <div className="flex rounded-[24px] p-1 mb-4" style={{ backgroundColor: "#F7DFE8" }}>
        <button
          type="button"
          onClick={() => setActiveInputTab("ai")}
          className={`flex-1 py-2.5 rounded-[18px] text-[13px] font-extrabold transition-all ${
            activeInputTab === "ai" ? "bg-white text-[#222222]" : "text-black/55"
          }`}
        >
          🧠 告诉 AI 目标
        </button>
        <button
          type="button"
          onClick={() => setActiveInputTab("resource")}
          className={`flex-1 py-2.5 rounded-[18px] text-[13px] font-extrabold transition-all ${
            activeInputTab === "resource" ? "bg-white text-[#222222]" : "text-black/55"
          }`}
        >
          🔗 学习已有资料
        </button>
      </div>

      {activeInputTab === "ai" ? (
        <div className="rounded-[28px] p-4 mb-4 text-left" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="mb-3">
            <label className="text-[13px] font-extrabold text-[#222222] mb-1.5 block px-1">目标名称</label>
            <input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="例如：学会日常英语对话"
              className={`w-full px-4 py-3 rounded-[24px] bg-white text-[14px] font-semibold text-[#222222] placeholder:text-black/25 focus:outline-none transition-all ${titleError ? "ring-2 ring-[#E85A7A]/60" : ""}`} />
            {titleError && (
              <p className="text-[12px] font-medium text-[#E85A7A] mt-1.5 px-1 flex items-center gap-1">
                <span>⚠️</span>{titleError}
              </p>
            )}
          </div>
          <div>
            <label className="text-[13px] font-extrabold text-[#222222] mb-1.5 block px-1">描述一下你的愿望</label>
            <textarea value={description} onChange={(e) => onDescriptionChange(e.target.value)} placeholder="例如：能够自信地和外国人日常对话" rows={2}
              className="w-full px-4 py-3 rounded-[24px] bg-white text-[13px] font-medium text-[#222222] placeholder:text-black/25 focus:outline-none resize-none" />
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <ResourceUploadSection
            title="🔗 学习已有资料"
            description="直接贴课程、文章、视频或书籍链接。AI 会参考这些资料生成计划"
            placeholder="粘贴链接，例如 bilibili.com / ted.com / weread.qq.com"
            resources={customResources}
            onAdd={onAddResource}
            onRemove={onRemoveResource}
          />
        </div>
      )}

      <div className="mb-4">
        <label className="text-[12px] font-bold text-black/55 mb-1.5 block px-1">⏱ 计划周期</label>
        <div className="flex gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => onDurationChange(opt.value)}
              className="flex-1 py-2.5 rounded-[22px] text-center transition-all"
              style={{ backgroundColor: duration === opt.value ? "#F7DFE8" : "#FFFFFF" }}>
              <p className="text-[13px] font-extrabold text-[#222222]">{opt.label}</p>
              <p className="text-[10px] text-black/55 font-medium">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-[12px] font-bold text-black/55 mb-1.5 block px-1">⏰ 每天投入时间</label>
        <div className="grid grid-cols-4 gap-2">
          {MINUTES_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => onDailyMinutesChange(opt.value)}
              className="py-2 rounded-[18px] text-center transition-all"
              style={{ backgroundColor: dailyMinutes === opt.value ? "#F7DFE8" : "#FFFFFF" }}>
              <p className="text-[12px] font-bold text-[#222222]">{opt.label}</p>
              <p className="text-[9px] text-black/45 font-medium">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="text-[12px] font-bold text-black/55 mb-1 block px-1">🪝 绑定日常习惯</label>
        <p className="text-[10px] text-black/40 font-medium mb-1.5 px-1">选一个你每天都会做的事，学习任务会安排在它之后</p>
        <div className="grid grid-cols-3 gap-2">
          {ANCHOR_OPTIONS.map((opt) => (
            <button key={opt.value}
              onClick={() => onHabitAnchorChange(habitAnchor === opt.value ? null : opt.value)}
              className="py-2.5 rounded-[18px] text-center transition-all"
              style={{ backgroundColor: habitAnchor === opt.value ? "#F7DFE8" : "#FFFFFF" }}>
              <p className="text-[14px] leading-none mb-0.5">{opt.icon}</p>
              <p className="text-[11px] font-bold text-[#222222]">{opt.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== Step 3: AI Planning Animation + Platform Showcase ===== */

const PLATFORMS = [
  { name: "B站", color: "#FB7299", icon: "▶" },
  { name: "TED", color: "#E62B1E", icon: "T" },
  { name: "微信读书", color: "#1AAD19", icon: "W" },
  { name: "网易云课堂", color: "#C20C0C", icon: "N" },
  { name: "知乎", color: "#0066FF", icon: "Z" },
  { name: "得到", color: "#DE9B47", icon: "D" },
  { name: "Coursera", color: "#0056D2", icon: "C" },
  { name: "YouTube", color: "#FF0000", icon: "Y" },
  { name: "豆瓣", color: "#007722", icon: "豆" },
  { name: "喜马拉雅", color: "#F5602E", icon: "X" },
];

const BLOCK_YELLOW = "#F9E6AB";
const BLOCK_PINK = "#F7DFE8";
const BLOCK_BLUE = "#D1DFFA";
const BLOCK_GREEN = "#CAE1AF";

function PlanningStep({
  title, category, duration, dailyMinutes, customResources, onDone,
}: {
  title: string; category: GoalCategory; duration: number; dailyMinutes: number;
  customResources: GoalResource[];
  onDone: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState(0);
  const [showPlatforms, setShowPlatforms] = useState(false);

  const hasCustom = customResources.length > 0;
  const actions = [
    { icon: "🔍", text: "分析你的目标和现有水平..." },
    { icon: "🧠", text: "设计技能成长路径..." },
    { icon: "📐", text: `拆分为 ${Math.ceil(duration / 15)} 个学习阶段...` },
    { icon: "📋", text: `生成 ${duration} 天每日任务...` },
    { icon: "🔗", text: hasCustom ? "从你的资料中拆分课时任务..." : "从专业平台匹配优质资源..." },
    { icon: "✅", text: "生成验证练习题..." },
    { icon: "🎯", text: "规划完成！" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 1.5;
      });
    }, 70);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const idx = Math.min(Math.floor((progress / 100) * actions.length), actions.length - 1);
    setCurrentAction(idx);
    if (idx >= 4) setShowPlatforms(true);
  }, [progress, actions.length]);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(onDone, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress, onDone]);

  return (
    <div className="px-5 py-6 flex flex-col items-center">
      <div className="w-20 h-20 rounded-[24px] bg-[#F7DFE8] flex items-center justify-center mb-4"
        style={{ animation: "float 2s ease-in-out infinite" }}>
        <Brain size={40} className="text-[#222222]" />
      </div>

      <h2 className="text-[28px] font-extrabold text-[#222222] mb-1 leading-none">AI 规划师正在工作</h2>
      <p className="text-[13px] text-black/55 font-medium mb-5">
        正在为「{title}」定制专属方案
      </p>

      <div className="w-full mb-5">
        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: BLOCK_PINK }}>
          <div className="h-full rounded-full transition-all duration-200"
            style={{ width: `${progress}%`, background: "#222222" }} />
        </div>
        <p className="text-[12px] font-bold text-black/55 text-right mt-1">{Math.round(progress)}%</p>
      </div>

      <div className="w-full flex flex-col gap-1.5">
        {actions.map((action, i) => (
          <div key={i}>
            <div className={`flex items-center gap-3 px-3.5 py-2 rounded-[20px] transition-all duration-300 ${
              i < currentAction ? "" : i === currentAction ? "" : "opacity-35"
            }`}
              style={{
                backgroundColor: getCardBackgroundColor(i),
              }}>
              <span className="text-base">{action.icon}</span>
              <span className="text-[13px] font-semibold flex-1 text-[#222222]">{action.text}</span>
              {i < currentAction && <Check size={14} className="text-[#222222]" strokeWidth={3} />}
              {i === currentAction && <div className="w-4 h-4 border-2 border-[#222222] border-t-transparent rounded-full animate-spin" />}
            </div>

            {i === 4 && showPlatforms && (
              <div className="mt-1.5 overflow-hidden rounded-[20px] p-3"
                style={{ backgroundColor: "#FFFFFF", animation: "slide-up 0.5s ease-out" }}>
                {hasCustom ? (
                  <>
                    <p className="text-[11px] font-bold text-black/55 mb-2">📂 正在从你的资料中提取内容并拆分课时</p>
                    <div className="flex flex-col gap-1.5">
                      {customResources.map((res, idx) => (
                        <div key={res.id}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-[14px]"
                          style={{
                            backgroundColor: "#F5F5F5",
                            animation: `slide-up 0.3s ease-out ${idx * 0.1}s both`,
                          }}>
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#F9E6AB] shrink-0">
                            <Link2 size={11} className="text-[#222222]" />
                          </div>
                          <p className="text-[11px] font-bold text-[#222222] flex-1 truncate">{res.title}</p>
                          {currentAction > 4 && <Check size={12} className="text-[#222222] shrink-0" strokeWidth={3} />}
                        </div>
                      ))}
                    </div>
                    {currentAction > 4 && (
                      <p className="text-[10px] text-[#222222] font-bold mt-2"
                        style={{ animation: "slide-up 0.3s ease-out" }}>
                        ✓ 已从 {customResources.length} 条资料中拆分出课时任务
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-bold text-black/55 mb-2">🌐 正在从以下平台汇聚优质内容</p>
                    <div className="flex flex-wrap gap-1.5 rounded-[16px] p-2" style={{ backgroundColor: "#F5F5F5" }}>
                      {PLATFORMS.map((p, idx) => (
                        <span key={p.name}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-white transition-all"
                          style={{
                            backgroundColor: p.color,
                            animation: `slide-up 0.3s ease-out ${idx * 0.07}s both`,
                            opacity: currentAction > 4 ? 1 : undefined,
                          }}>
                          <span className="text-[10px] opacity-80">{p.icon}</span>
                          {p.name}
                        </span>
                      ))}
                    </div>
                    {currentAction > 4 && (
                      <p className="text-[10px] text-[#222222] font-bold mt-2"
                        style={{ animation: "slide-up 0.3s ease-out" }}>
                        ✓ 已从 {PLATFORMS.length} 个平台筛选出最佳资源
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Step 4: Preview with Expandable Phases ===== */

type SampleTask = { title: string; resource: string; platform: string; url: string };
type PhaseTasks = Record<string, SampleTask[]>;

const CATEGORY_SAMPLE_TASKS: Record<GoalCategory, PhaseTasks> = {
  language: {
    "基础入门": [
      { title: "听一段3分钟日常对话", resource: "TED精读合集100集·中英双语", platform: "B站", url: "https://www.bilibili.com/video/BV1vp4y1x7FW/" },
      { title: "学习10个高频场景词汇", resource: "英语零基础五合一", platform: "网易云课堂", url: "https://study.163.com/course/introduction/1213597803.htm" },
      { title: "完成听力小测验", resource: "每日英语听力", platform: "App", url: "https://dict.eudic.net/ting" },
    ],
    "技能提升": [
      { title: "跟读模仿一段对话", resource: "听力&口语跟读金素材", platform: "B站", url: "https://www.bilibili.com/video/BV1dtYqzeEv2/" },
      { title: "学习一个语法点并造句", resource: "Learning How to Learn", platform: "Coursera", url: "https://www.coursera.org/learn/learning-how-to-learn" },
      { title: "用新学词汇写3个句子", resource: "《英语语法新思维》", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    "综合实践": [
      { title: "模拟一个生活场景对话", resource: "100天演讲口才速成", platform: "喜马拉雅", url: "https://www.ximalaya.com/a/6537197698945024" },
      { title: "看一段无字幕视频并复述", resource: "TED Talks", platform: "TED", url: "https://www.ted.com/talks" },
      { title: "录音对比纠正发音", resource: "高效学习法·音频合集", platform: "喜马拉雅", url: "https://m.ximalaya.com/a/6472943706009600" },
    ],
    "自由运用": [
      { title: "与AI进行5分钟自由对话", resource: "ChatGPT口语练习", platform: "App", url: "https://chat.openai.com/" },
      { title: "用英语写一篇短日记", resource: "The first 20 hours", platform: "YouTube", url: "https://www.youtube.com/watch?v=5MgBikgcWnY" },
      { title: "听一期英文播客并总结", resource: "BBC Learning English", platform: "YouTube", url: "https://www.youtube.com/@bbclearningenglish" },
    ],
  },
  music: {
    "基础入门": [
      { title: "学习基础乐理：音阶与音程", resource: "零基础学乐理", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "练习腹式呼吸5分钟", resource: "声乐入门：呼吸训练", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "听辨不同音高并模唱", resource: "声乐基础课程", platform: "网易云课堂", url: "https://study.163.com/" },
    ],
    "技能提升": [
      { title: "练习一首简单歌曲的旋律", resource: "声乐教学：歌曲演唱技巧", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "练习气息控制与换气", resource: "专业声乐训练课", platform: "YouTube", url: "https://www.youtube.com/" },
      { title: "录音回听并标记问题", resource: "声乐自学指南", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    "综合实践": [
      { title: "完整演唱一首歌并录音", resource: "30天声乐进阶", platform: "喜马拉雅", url: "https://www.ximalaya.com/" },
      { title: "练习不同风格的演唱", resource: "流行唱法教程", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "对比Day1和今天的录音", resource: "声乐学习打卡", platform: "App", url: "#" },
    ],
    "自由运用": [
      { title: "自选歌曲完整演绎", resource: "演唱技巧大师课", platform: "YouTube", url: "https://www.youtube.com/" },
      { title: "尝试即兴哼唱旋律", resource: "即兴演唱入门", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "录制作品并分享", resource: "全民K歌", platform: "App", url: "https://kg.qq.com/" },
    ],
  },
  reading: {
    "基础入门": [
      { title: "阅读2页今日书籍内容", resource: "《如何阅读一本书》", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "记录一条阅读感悟", resource: "阅读方法论", platform: "知乎", url: "https://www.zhihu.com/" },
      { title: "了解速读与精读的区别", resource: "高效阅读法", platform: "B站", url: "https://www.bilibili.com/" },
    ],
    "技能提升": [
      { title: "用思维导图梳理章节结构", resource: "思维导图阅读法", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "精读一个段落并做批注", resource: "《深度阅读》", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "写一段100字的章节总结", resource: "写作与阅读", platform: "得到", url: "https://www.dedao.cn/" },
    ],
    "综合实践": [
      { title: "完成一本书并写读后感", resource: "年度推荐书单", platform: "豆瓣", url: "https://book.douban.com/" },
      { title: "与他人讨论书中观点", resource: "读书交流社群", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "将书中方法应用到生活", resource: "实践笔记模板", platform: "知乎", url: "https://www.zhihu.com/" },
    ],
    "自由运用": [
      { title: "为这本书写一篇推荐文", resource: "书评写作指南", platform: "豆瓣", url: "https://book.douban.com/" },
      { title: "制定下一本书的阅读计划", resource: "阅读清单", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "回顾本月阅读收获", resource: "月度复盘模板", platform: "知乎", url: "https://www.zhihu.com/" },
    ],
  },
  art: {
    "基础入门": [
      { title: "学习色彩基础与构图原理", resource: "设计入门课", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "临摹一幅简单作品", resource: "零基础学画画", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "了解常用工具和软件", resource: "Procreate入门", platform: "YouTube", url: "https://www.youtube.com/" },
    ],
    "技能提升": [
      { title: "练习光影和透视表现", resource: "素描基础训练", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "学习一种新的艺术风格", resource: "艺术风格赏析", platform: "YouTube", url: "https://www.youtube.com/" },
      { title: "完成一幅带背景的作品", resource: "数字绘画进阶", platform: "网易云课堂", url: "https://study.163.com/" },
    ],
    "综合实践": [
      { title: "创作一幅原创主题作品", resource: "创意绘画实战", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "尝试不同媒介的混合运用", resource: "混合媒介课程", platform: "Coursera", url: "https://www.coursera.org/" },
      { title: "对比早期作品看进步", resource: "艺术成长记录", platform: "App", url: "#" },
    ],
    "自由运用": [
      { title: "完成个人风格系列作品", resource: "艺术家工作流", platform: "YouTube", url: "https://www.youtube.com/" },
      { title: "参与线上创作挑战", resource: "绘画挑战社区", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "整理作品集并展示", resource: "作品集制作指南", platform: "知乎", url: "https://www.zhihu.com/" },
    ],
  },
  fitness: {
    "基础入门": [
      { title: "完成5分钟热身拉伸", resource: "零基础健身入门", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "学习正确的深蹲姿势", resource: "基础动作教学", platform: "YouTube", url: "https://www.youtube.com/" },
      { title: "记录今日运动数据", resource: "Keep运动记录", platform: "App", url: "https://www.gotokeep.com/" },
    ],
    "技能提升": [
      { title: "完成一组完整训练计划", resource: "居家健身全攻略", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "学习新的训练动作", resource: "HIIT训练课程", platform: "YouTube", url: "https://www.youtube.com/" },
      { title: "对比体能数据看进步", resource: "运动数据分析", platform: "App", url: "https://www.gotokeep.com/" },
    ],
    "综合实践": [
      { title: "完成30分钟综合训练", resource: "进阶健身计划", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "挑战一个新的运动目标", resource: "运动挑战赛", platform: "Keep", url: "https://www.gotokeep.com/" },
      { title: "拍照记录体态变化", resource: "体态对比工具", platform: "App", url: "#" },
    ],
    "自由运用": [
      { title: "制定个人长期训练计划", resource: "《力量训练基础》", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "尝试一项新运动", resource: "运动探索频道", platform: "YouTube", url: "https://www.youtube.com/" },
      { title: "总结健身心得并分享", resource: "健身社区", platform: "Keep", url: "https://www.gotokeep.com/" },
    ],
  },
  coding: {
    "基础入门": [
      { title: "学习变量和数据类型", resource: "编程入门教程", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "写一个Hello World程序", resource: "freeCodeCamp", platform: "YouTube", url: "https://www.youtube.com/@freecodecamp" },
      { title: "完成一道简单编程题", resource: "LeetCode入门", platform: "LeetCode", url: "https://leetcode.cn/" },
    ],
    "技能提升": [
      { title: "学习函数和模块化编程", resource: "Python进阶课", platform: "Coursera", url: "https://www.coursera.org/" },
      { title: "完成一个小型练手项目", resource: "项目实战教程", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "学习调试和排错技巧", resource: "编程调试指南", platform: "知乎", url: "https://www.zhihu.com/" },
    ],
    "综合实践": [
      { title: "独立完成一个完整项目", resource: "全栈项目实战", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "学习版本控制(Git)", resource: "Git入门教程", platform: "YouTube", url: "https://www.youtube.com/" },
      { title: "代码review并优化", resource: "代码质量指南", platform: "知乎", url: "https://www.zhihu.com/" },
    ],
    "自由运用": [
      { title: "开发自己的创意项目", resource: "开源项目参考", platform: "GitHub", url: "https://github.com/" },
      { title: "学习一个新框架或工具", resource: "技术前沿分享", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "写技术博客分享经验", resource: "技术写作指南", platform: "知乎", url: "https://www.zhihu.com/" },
    ],
  },
  writing: {
    "基础入门": [
      { title: "自由写作10分钟", resource: "写作入门课", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "学习基本的文章结构", resource: "《写作这回事》", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "模仿一篇优秀短文", resource: "经典短文赏析", platform: "知乎", url: "https://www.zhihu.com/" },
    ],
    "技能提升": [
      { title: "练习描写一个场景", resource: "文学创作技巧", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "学习修辞和表达手法", resource: "写作进阶课程", platform: "Coursera", url: "https://www.coursera.org/" },
      { title: "写一篇500字的短文", resource: "写作练习社区", platform: "豆瓣", url: "https://www.douban.com/" },
    ],
    "综合实践": [
      { title: "完成一篇完整的文章", resource: "写作工作坊", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "请他人阅读并给反馈", resource: "互评写作社群", platform: "豆瓣", url: "https://www.douban.com/" },
      { title: "修改润色一篇旧作", resource: "自我编辑指南", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    "自由运用": [
      { title: "确定个人写作风格", resource: "风格的要素", platform: "微信读书", url: "https://weread.qq.com/" },
      { title: "开始一个长篇写作项目", resource: "长篇创作指南", platform: "知乎", url: "https://www.zhihu.com/" },
      { title: "发布作品并收集反馈", resource: "写作发布平台", platform: "豆瓣", url: "https://www.douban.com/" },
    ],
  },
  other: {
    "基础入门": [
      { title: "了解核心概念和基本术语", resource: "入门指南合集", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "跟练基础教程第1课", resource: "零基础入门课", platform: "网易云课堂", url: "https://study.163.com/" },
      { title: "完成基础练习测试", resource: "学习方法论", platform: "知乎", url: "https://www.zhihu.com/" },
    ],
    "技能提升": [
      { title: "学习进阶技巧和方法论", resource: "Smash fear, learn anything", platform: "TED", url: "https://www.ted.com/talks/tim_ferriss_smash_fear_learn_anything" },
      { title: "专题深度练习", resource: "Learning How to Learn", platform: "Coursera", url: "https://www.coursera.org/learn/learning-how-to-learn" },
      { title: "输出学习笔记和心得", resource: "《掌控习惯》", platform: "微信读书", url: "https://weread.qq.com/" },
    ],
    "综合实践": [
      { title: "模拟实战场景应用", resource: "实战演练合集", platform: "B站", url: "https://www.bilibili.com/" },
      { title: "完成综合项目挑战", resource: "项目实战", platform: "YouTube", url: "https://www.youtube.com/" },
      { title: "复盘总结关键收获", resource: "高效学习法", platform: "喜马拉雅", url: "https://www.ximalaya.com/" },
    ],
    "自由运用": [
      { title: "创作个人原创作品", resource: "The first 20 hours", platform: "YouTube", url: "https://www.youtube.com/watch?v=5MgBikgcWnY" },
      { title: "挑战高级难度任务", resource: "进阶挑战", platform: "Coursera", url: "https://www.coursera.org/" },
      { title: "分享成果，输出经验", resource: "经验分享社区", platform: "知乎", url: "https://www.zhihu.com/" },
    ],
  },
};

function extractPlatform(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").replace(/^m\./, "");
    const map: Record<string, string> = {
      "bilibili.com": "B站",
      "youtube.com": "YouTube",
      "youtu.be": "YouTube",
      "ted.com": "TED",
      "coursera.org": "Coursera",
      "weread.qq.com": "微信读书",
      "study.163.com": "网易云课堂",
      "ximalaya.com": "喜马拉雅",
      "zhihu.com": "知乎",
      "douban.com": "豆瓣",
      "github.com": "GitHub",
      "leetcode.cn": "LeetCode",
    };
    for (const [domain, name] of Object.entries(map)) {
      if (host.includes(domain)) return name;
    }
    return host;
  } catch {
    return "链接";
  }
}

const PHASE_TASK_TEMPLATES = [
  [
    (n: number) => `学习第${n}课内容`,
    (n: number) => `完成第${n}课笔记`,
    (n: number) => `练习第${n}课要点`,
  ],
  [
    (n: number) => `跟练第${n}课进阶内容`,
    (n: number) => `第${n}课重点技巧专项练习`,
    (n: number) => `总结第${n}课核心方法`,
  ],
  [
    (n: number) => `第${n}课综合实战演练`,
    (n: number) => `模仿第${n}课案例独立完成`,
    (n: number) => `第${n}课成果自我评估`,
  ],
  [
    (n: number) => `基于第${n}课灵感自由创作`,
    (n: number) => `运用第${n}课方法挑战新场景`,
    (n: number) => `第${n}课知识融会贯通练习`,
  ],
];

function buildCustomResourceTasks(
  resources: GoalResource[],
  phaseIndex: number,
  phaseCount: number,
): SampleTask[] {
  const templates = PHASE_TASK_TEMPLATES[phaseIndex] ?? PHASE_TASK_TEMPLATES[0];
  const tasksPerPhase = 3;
  const result: SampleTask[] = [];

  const resourcesPerPhase = Math.max(1, Math.ceil(resources.length / phaseCount));
  const startIdx = phaseIndex * resourcesPerPhase;
  const phaseResources = resources.slice(startIdx, startIdx + resourcesPerPhase);
  const fallbackResource = phaseResources[0] ?? resources[0];

  for (let i = 0; i < tasksPerPhase; i++) {
    const res = phaseResources[i % phaseResources.length] ?? fallbackResource;
    const lessonBase = phaseIndex * tasksPerPhase + i + 1;
    result.push({
      title: templates[i](lessonBase),
      resource: res.title,
      platform: extractPlatform(res.url),
      url: res.url,
    });
  }

  return result;
}

function extractKeyword(resourceTitle: string, maxLen = 8): string {
  let t = resourceTitle
    .replace(/[-_|·—–]+/g, " ")
    .replace(/[\[\]【】《》「」『』""''()（）]/g, " ")
    .replace(/\b(BV\w+|av\d+)\b/gi, "")
    .replace(/(第?\d+[集期课节话章季部]+)/g, " ")
    .replace(/[,，.。!！?？:：;；\s]+/g, " ")
    .trim();

  const segments = t.split(" ").filter((s) => s.length >= 2);
  if (segments.length === 0) return resourceTitle.slice(0, maxLen);

  let result = "";
  for (const seg of segments) {
    if (result.length + seg.length <= maxLen) {
      result += (result ? " " : "") + seg;
    } else if (!result) {
      result = seg.slice(0, maxLen);
    } else {
      break;
    }
  }
  return result || resourceTitle.slice(0, maxLen);
}

function PreviewStep({
  title, category, color, duration, dailyMinutes, customResources, description,
}: {
  title: string; category: GoalCategory; color: TaskColor; duration: number; dailyMinutes: number;
  customResources: GoalResource[]; description: string;
}) {
  const meta = GOAL_CATEGORY_META[category];
  const colors = TASK_COLORS[color];
  const phaseCount = Math.min(Math.ceil(duration / 15), 4);
  const perPhase = Math.ceil(duration / phaseCount);

  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  const { phaseNames, phaseDescs, phaseTasks } = resolvePlan(title, description, category);
  const phases = Array.from({ length: phaseCount }, (_, i) => ({
    number: i + 1,
    title: phaseNames[i] ?? `阶段${i + 1}`,
    desc: phaseDescs[i] ?? "持续精进",
    days: `第${i * perPhase + 1}~${Math.min((i + 1) * perPhase, duration)}天`,
    tasks: perPhase,
    sampleTasks: phaseTasks[i] ?? [],
  }));

  return (
    <div className="px-4" style={{ animation: "slide-up 0.4s ease-out" }}>
      <div className="text-center mb-5">
        <div className="text-5xl mb-2" style={{ animation: "bounce-in 0.6s ease-out" }}>🎉</div>
        <h2 className="text-[28px] font-extrabold text-[#222222] leading-none">你的专属计划已生成！</h2>
        <p className="text-[13px] text-black/55 font-medium mt-1">AI 规划师已为你定制了科学的学习路径</p>
      </div>

      <div className="p-4 mb-4 rounded-[30px]" style={{ backgroundColor: TASK_COLORS[color].light }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.72)" }}>{meta.icon}</div>
          <div>
            <h3 className="text-[16px] font-extrabold text-[#222222]">{title}</h3>
            <p className="text-[12px] text-black/55 font-medium">
              {customResources.length > 0
                ? extractKeyword(customResources[0].title)
                : meta.label}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[12px] font-bold text-black/55">
          <span className="flex items-center gap-1"><Clock size={13} /> {dailyMinutes}分钟/天</span>
          <span className="flex items-center gap-1"><Zap size={13} /> {duration}天</span>
          <span className="flex items-center gap-1"><Sparkles size={13} /> {phaseCount}个阶段</span>
        </div>
      </div>

      {customResources.length > 0 && (
        <div className="p-3 mb-4 rounded-[24px]" style={{ backgroundColor: "#FFFFFF" }}>
          <p className="text-[12px] font-extrabold text-[#222222] mb-2">🔗 你上传的学习资料</p>
          <div className="flex flex-col gap-2">
            {customResources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-[18px] bg-[#FBFBFB]"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#F7DFE8] shrink-0">
                  <Link2 size={14} className="text-[#222222]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-[#222222] truncate">{resource.title}</p>
                  <p className="text-[10px] font-medium text-black/45 truncate">{resource.url}</p>
                </div>
                <ExternalLink size={14} className="text-black/35 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-[13px] font-extrabold text-[#222222] mb-0.5 px-1">📋 学习路径预览</h3>
      <p className="text-[10px] text-black/40 font-medium mb-2 px-1">
        {customResources.length > 0
          ? `资源来自你上传的 ${customResources.length} 条资料`
          : `资源来自 B站、TED、微信读书等 ${PLATFORMS.length} 个平台`}
      </p>
      <div className="flex flex-col gap-2 mb-6">
        {phases.map((phase) => {
          const isExpanded = expandedPhase === phase.number;
          const sampleTasks = customResources.length > 0
            ? buildCustomResourceTasks(customResources, phase.number - 1, phaseCount)
            : phase.sampleTasks;
          const phaseBackgroundColor = getCardBackgroundColor(phase.number - 1);
          const phaseAccentColor = getCardAccentColor(phase.number - 1);

          return (
            <div key={phase.number}>
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase.number)}
                className="w-full flex items-center gap-3 p-3 rounded-[24px] transition-all active:scale-[0.98]"
                style={{ backgroundColor: phaseBackgroundColor }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-extrabold text-white shrink-0 bg-[#222222]">P{phase.number}</div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-bold text-[#222222]">{phase.title}</p>
                  <p className="text-[11px] text-black/55 font-medium">{phase.days} · {phase.tasks}个任务</p>
                </div>
                {isExpanded
                  ? <ChevronUp size={16} className="text-[#222222]" />
                  : <ChevronDown size={16} className="text-black/35" />}
              </button>

              {isExpanded && (
                <div className="mt-1 ml-5 mr-1 flex flex-col gap-1.5 pl-6 border-l-2"
                  style={{ borderColor: colors.border, animation: "slide-up 0.3s ease-out" }}>
                  {sampleTasks.map((task, idx) => (
                    <div key={idx} className="flex items-start gap-2 py-2 px-3 rounded-[18px]" style={{ backgroundColor: "rgba(255,255,255,0.72)" }}>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0"
                        style={{ backgroundColor: colors.light }}>
                        <span className="text-[9px] font-bold" style={{ color: phaseAccentColor }}>
                          {idx + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[#222222]">{task.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <ExternalLink size={10} style={{ color: phaseAccentColor }} />
                          <span className="text-[10px] font-semibold truncate" style={{ color: phaseAccentColor }}>
                            {task.resource}
                          </span>
                          <span className="text-[9px] text-black/35 shrink-0">· {task.platform}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-black/35 font-medium py-1 px-3">
                    还有 {phase.tasks - 3} 个任务...
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-black/35 text-center font-medium">计划可以随时在目标详情中调整</p>
    </div>
  );
}

function ResourceUploadSection({
  title,
  description,
  placeholder,
  resources,
  onAdd,
  onRemove,
  compact = false,
}: {
  title: string;
  description: string;
  placeholder: string;
  resources: GoalResource[];
  onAdd: (input: string) => { ok: true; message: string } | { ok: false; message: string };
  onRemove: (id: string) => void;
  compact?: boolean;
}) {
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAdd = useCallback(() => {
    const result = onAdd(inputValue);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    setInputValue("");
    setErrorMessage("");
  }, [inputValue, onAdd]);

  return (
    <div
      className={`rounded-[24px] ${compact ? "p-3" : "p-3.5"}`}
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <p className="text-[16px] font-extrabold text-[#222222] px-0.5">{title}</p>
      <p className="text-[12px] text-black/60 font-medium mt-1 px-0.5 leading-[1.5]">{description}</p>

      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-[18px] bg-white">
          <Link2 size={14} className="text-black/35 shrink-0" />
          <input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-[13px] font-semibold text-[#222222] placeholder:text-black/25 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="w-10 h-10 rounded-[16px] bg-[#222222] text-white flex items-center justify-center active:scale-95 transition-all shrink-0"
        >
          <Plus size={16} />
        </button>
      </div>

      {errorMessage && (
        <p className="text-[11px] font-medium text-[#E06262] mt-2 px-0.5">{errorMessage}</p>
      )}

      {resources.length > 0 && (
        <div className="flex flex-col gap-2 mt-3">
          <p className="text-[11px] font-bold text-black/45 px-0.5">
            已添加 {resources.length} 条资料
          </p>
          {resources.map((resource) => (
            <div key={resource.id} className="flex items-center gap-2 px-3 py-2.5 rounded-[18px] bg-white">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#FBFBFB] shrink-0">
                <Link2 size={13} className="text-[#222222]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-[#222222] truncate">{resource.title}</p>
                <p className="text-[10px] font-medium text-black/45 truncate">{resource.url}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(resource.id)}
                className="w-7 h-7 rounded-lg bg-[#FBFBFB] flex items-center justify-center text-black/35 active:scale-95 transition-all shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
