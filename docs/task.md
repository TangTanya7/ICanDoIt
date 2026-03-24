# ICanDoIt 技术方案与开发计划

> 版本：v1.0 | 日期：2026-03-19 | 角色：全栈架构师

---

## 一、技术选型总览

| 层级 | 技术栈 | 说明 |
|---|---|---|
| **框架** | Next.js 16.x（App Router） | 全栈 SSR/API/RSC，Turbopack 默认构建 |
| **语言** | TypeScript 5.x | 全栈类型安全 |
| **React** | React 19.2 | View Transitions、React Compiler |
| **ORM** | Prisma 6.x | 类型安全 ORM，MySQL 适配 |
| **数据库** | MySQL 8.0+ | 主存储，InnoDB 引擎 |
| **缓存** | Redis 7.x | 会话、连续天数热数据、推送队列 |
| **AI** | OpenAI GPT-4o / DeepSeek | 任务拆解、资源策展、链接分析、伙伴对话 |
| **推送** | 微信订阅消息 API + Web Push | 多渠道触达 |
| **对象存储** | 阿里云 OSS / 腾讯 COS | 用户上传的截图、录音、贴纸图片 |
| **定时任务** | node-cron + BullMQ | 资源健康检查、推送调度、进度卡片生成 |
| **部署** | Vercel / 自建 Docker + Nginx | Next.js 原生支持 Vercel |
| **小程序** | Taro 4.x / UniApp（跨端）| 微信小程序 + 未来多端 |
| **客户端通信** | REST API + WebSocket | API 统一，WS 用于实时伙伴对话 |

### 1.1 跨端架构策略

```
┌──────────────────────────────────────────────────────┐
│                    Next.js 16 Backend                 │
│  ┌─────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ API Routes│  │ Server   │  │  Cron / Queue Workers│ │
│  │ /api/*   │  │ Actions  │  │  (BullMQ + Redis)    │ │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘ │
│       │              │                    │             │
│       └──────────────┼────────────────────┘             │
│                      │                                  │
│              ┌───────┴────────┐                         │
│              │  Prisma Client │                         │
│              └───────┬────────┘                         │
│                      │                                  │
│              ┌───────┴────────┐                         │
│              │   MySQL 8.0    │                         │
│              └────────────────┘                         │
└──────────────────────────────────────────────────────┘
        │                    │                  │
   REST API             REST API           WebSocket
        │                    │                  │
┌───────┴──────┐  ┌──────────┴───────┐  ┌──────┴──────┐
│ 微信小程序    │  │  Web H5 / PWA   │  │  iOS/Android │
│ (Taro 4.x)  │  │  (Next.js SSR)   │  │  (React     │
│              │  │                   │  │   Native)   │
└──────────────┘  └───────────────────┘  └─────────────┘
```

**核心原则**：后端 API 是唯一的业务逻辑层，所有客户端都是"薄壳"——只负责 UI 渲染和 API 调用。

### 1.2 API 设计规范

```
所有 API 统一前缀：/api/v1/

认证：JWT（微信 code → 后端换 openid → 签发 JWT）
格式：JSON
命名：RESTful 风格

核心 API 分组：
  /api/v1/auth/*          — M1 认证与登录
  /api/v1/goals/*         — M2 目标设定
  /api/v1/visions/*       — M3 愿景引擎
  /api/v1/paths/*         — M4 路径规划
  /api/v1/anchors/*       — M5 锚点触发
  /api/v1/tasks/*         — M6 每日任务
  /api/v1/companion/*     — M7 伙伴对话
  /api/v1/progress/*      — M8 进度追踪
  /api/v1/streaks/*       — M9 连续天数
  /api/v1/adjustments/*   — M10 动态调整
  /api/v1/resources/*     — 资源管理（AI推荐/用户上传）
```

---

## 二、数据模型设计（Prisma + MySQL）

### 2.1 ER 关系图

```mermaid
erDiagram
    User ||--o{ Goal : creates
    User ||--o| CompanionState : has
    User ||--o{ StreakRecord : tracks
    User ||--o{ UserResource : uploads

    Goal ||--o{ TaskPath : generates
    Goal ||--o{ AnchorPoint : binds
    Goal ||--o{ ProgressRecord : records
    Goal ||--o| GoalVision : has

    TaskPath ||--|{ DailyTask : contains
    DailyTask ||--o| Resource : uses
    DailyTask ||--o| VerificationQuiz : has
    DailyTask ||--o{ TaskCompletion : logs

    Resource ||--o{ ResourceFeedback : receives
    UserResource ||--o| Resource : becomes

    User ||--o{ WeeklyReview : submits

    User {
        string id PK
        string wxOpenId UK
        string wxUnionId
        string nickname
        string avatarUrl
        datetime createdAt
        datetime lastActiveAt
    }

    Goal {
        string id PK
        string userId FK
        string category
        string title
        string currentLevel
        int dailyMinutes
        int durationDays
        string status
        datetime startDate
        datetime createdAt
    }

    TaskPath {
        string id PK
        string goalId FK
        int phase
        string phaseTitle
        int startDay
        int endDay
        float learnRatio
        float practiceRatio
        float feedbackRatio
    }

    DailyTask {
        string id PK
        string taskPathId FK
        string goalId FK
        int dayNumber
        string taskType
        string title
        string description
        int estimatedMinutes
        string resourceId FK
        string sourceType
        int sortOrder
    }

    Resource {
        string id PK
        string skillPoint
        string category
        string sourceType
        string platform
        string url
        string title
        int durationSeconds
        float approvalRate
        int voteCount
        string status
        datetime lastCheckedAt
    }

    UserResource {
        string id PK
        string userId FK
        string goalId FK
        string url
        string platform
        string aiAnalysis
        string matchedSkillPoint
        string difficulty
        int estimatedMinutes
        string status
    }

    CompanionState {
        string id PK
        string userId FK
        string stage
        int totalDays
        datetime lastInteractionAt
    }

    StreakRecord {
        string id PK
        string userId FK
        int currentStreak
        int longestStreak
        date lastActiveDate
        int totalCompletedDays
        int totalCompletedTasks
    }

    AnchorPoint {
        string id PK
        string goalId FK
        string userId FK
        string scene
        string time
        string channelType
        boolean isActive
    }

    ProgressRecord {
        string id PK
        string goalId FK
        string userId FK
        string recordType
        int dayNumber
        string content
        string dataSnapshot
        boolean isShared
        datetime createdAt
    }

    GoalVision {
        string id PK
        string goalId FK
        string content
        int weekNumber
        datetime lastRefreshedAt
    }

    TaskCompletion {
        string id PK
        string dailyTaskId FK
        string userId FK
        date completionDate
        boolean quizPassed
        int timeSpentSeconds
        string companionFeedback
        datetime completedAt
    }

    VerificationQuiz {
        string id PK
        string dailyTaskId FK
        string question
        string options
        int correctIndex
    }

    ResourceFeedback {
        string id PK
        string resourceId FK
        string userId FK
        string vote
        string reason
        datetime createdAt
    }

    WeeklyReview {
        string id PK
        string userId FK
        string goalId FK
        int weekNumber
        string difficultyFeedback
        string preferredFormat
        string bestTaskId
        datetime createdAt
    }
```

### 2.2 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ==================== M1: 用户 ====================

model User {
  id           String   @id @default(cuid())
  wxOpenId     String   @unique @map("wx_open_id")
  wxUnionId    String?  @map("wx_union_id")
  nickname     String   @default("")
  avatarUrl    String?  @map("avatar_url") @db.Text
  phone        String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  lastActiveAt DateTime @default(now()) @map("last_active_at")
  isOnboarded  Boolean  @default(false) @map("is_onboarded")

  goals          Goal[]
  companionState CompanionState?
  streakRecord   StreakRecord?
  userResources  UserResource[]
  weeklyReviews  WeeklyReview[]
  completions    TaskCompletion[]
  feedbacks      ResourceFeedback[]
  pushTokens     PushToken[]

  @@map("users")
}

model PushToken {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  channel   String   // "wechat_subscribe" | "web_push" | "app_push"
  token     String   @db.Text
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("push_tokens")
}

// ==================== M2: 目标 ====================

model Goal {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  category      String   // "english" | "design" | "fitness" | "reading" | "finance" | "custom"
  subcategory   String?
  title         String
  description   String?  @db.Text
  currentLevel  String   @map("current_level") // "beginner" | "intermediate" | "advanced"
  dailyMinutes  Int      @map("daily_minutes")
  durationDays  Int      @map("duration_days")
  startDate     DateTime @map("start_date")
  status        String   @default("active") // "active" | "paused" | "completed" | "abandoned"
  colorTag      String   @default("#FF6B6B") @map("color_tag")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  taskPaths       TaskPath[]
  anchorPoints    AnchorPoint[]
  progressRecords ProgressRecord[]
  vision          GoalVision?
  userResources   UserResource[]
  weeklyReviews   WeeklyReview[]

  @@index([userId, status])
  @@map("goals")
}

// ==================== M3: 愿景 ====================

model GoalVision {
  id              String   @id @default(cuid())
  goalId          String   @unique @map("goal_id")
  content         String   @db.Text // 当前愿景文案
  weekNumber      Int      @default(1) @map("week_number")
  lastRefreshedAt DateTime @default(now()) @map("last_refreshed_at")

  goal Goal @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@map("goal_visions")
}

// ==================== M4: 路径与任务 ====================

model TaskPath {
  id            String @id @default(cuid())
  goalId        String @map("goal_id")
  phase         Int    // 阶段序号 1,2,3,4
  phaseTitle    String @map("phase_title")
  startDay      Int    @map("start_day")
  endDay        Int    @map("end_day")
  learnRatio    Float  @default(0.5) @map("learn_ratio")
  practiceRatio Float  @default(0.3) @map("practice_ratio")
  feedbackRatio Float  @default(0.2) @map("feedback_ratio")

  goal  Goal        @relation(fields: [goalId], references: [id], onDelete: Cascade)
  tasks DailyTask[]

  @@index([goalId])
  @@map("task_paths")
}

model DailyTask {
  id               String  @id @default(cuid())
  taskPathId       String  @map("task_path_id")
  goalId           String  @map("goal_id")
  dayNumber        Int     @map("day_number")
  taskType         String  @map("task_type") // "learn" | "practice" | "feedback"
  title            String
  description      String  @db.Text
  estimatedMinutes Int     @map("estimated_minutes")
  resourceId       String? @map("resource_id")
  sourceType       String  @default("ai_recommended") @map("source_type") // "ai_recommended" | "user_uploaded" | "community_top"
  sortOrder        Int     @default(0) @map("sort_order")
  isActive         Boolean @default(true) @map("is_active")

  taskPath    TaskPath           @relation(fields: [taskPathId], references: [id], onDelete: Cascade)
  resource    Resource?          @relation(fields: [resourceId], references: [id])
  quiz        VerificationQuiz?
  completions TaskCompletion[]

  @@index([goalId, dayNumber])
  @@index([taskPathId])
  @@map("daily_tasks")
}

model VerificationQuiz {
  id           String @id @default(cuid())
  dailyTaskId  String @unique @map("daily_task_id")
  question     String @db.Text
  options      Json   // ["选项A", "选项B", "选项C"]
  correctIndex Int    @map("correct_index")

  dailyTask DailyTask @relation(fields: [dailyTaskId], references: [id], onDelete: Cascade)

  @@map("verification_quizzes")
}

// ==================== 资源系统 ====================

model Resource {
  id              String   @id @default(cuid())
  skillPoint      String   @map("skill_point")
  category        String
  sourceType      String   @default("ai_recommended") @map("source_type") // "ai_recommended" | "user_uploaded" | "community_top"
  platform        String   // "bilibili" | "youtube" | "zhihu" | "xiaohongshu" | "podcast" | "web"
  url             String   @db.Text
  title           String
  creator         String?
  durationSeconds Int?     @map("duration_seconds")
  approvalRate    Float    @default(0) @map("approval_rate")
  voteCount       Int      @default(0) @map("vote_count")
  status          String   @default("active") // "active" | "inactive" | "broken"
  lastCheckedAt   DateTime @default(now()) @map("last_checked_at")
  createdAt       DateTime @default(now()) @map("created_at")

  tasks     DailyTask[]
  feedbacks ResourceFeedback[]

  @@index([category, skillPoint, status])
  @@index([approvalRate])
  @@map("resources")
}

model UserResource {
  id                String   @id @default(cuid())
  userId            String   @map("user_id")
  goalId            String?  @map("goal_id")
  url               String   @db.Text
  platform          String?
  originalTitle     String?  @map("original_title")
  aiAnalysis        Json?    @map("ai_analysis") // { topic, difficulty, contentType, estimatedMinutes, skillPoints[] }
  matchedSkillPoint String?  @map("matched_skill_point")
  difficulty        String?  // "beginner" | "intermediate" | "advanced"
  estimatedMinutes  Int?     @map("estimated_minutes")
  status            String   @default("pending") // "pending" | "analyzed" | "scheduled" | "failed"
  scheduledDay      Int?     @map("scheduled_day")
  createdAt         DateTime @default(now()) @map("created_at")

  user User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  goal Goal? @relation(fields: [goalId], references: [id])

  @@index([userId, goalId])
  @@map("user_resources")
}

model ResourceFeedback {
  id         String   @id @default(cuid())
  resourceId String   @map("resource_id")
  userId     String   @map("user_id")
  vote       String   // "up" | "down" | "replace"
  reason     String?  // "too_long" | "too_shallow" | "too_hard" | "broken_link" | "too_many_ads"
  createdAt  DateTime @default(now()) @map("created_at")

  resource Resource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([resourceId, userId])
  @@map("resource_feedbacks")
}

// ==================== M5: 锚点 ====================

model AnchorPoint {
  id          String  @id @default(cuid())
  goalId      String  @map("goal_id")
  userId      String  @map("user_id")
  scene       String  // 场景描述："刷牙后"、"午饭后"、"睡前"
  time        String  // "07:10" 格式
  channelType String  @default("wechat_subscribe") @map("channel_type")
  isActive    Boolean @default(true) @map("is_active")
  stickerUrl  String? @map("sticker_url") @db.Text

  goal Goal @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@index([userId, isActive])
  @@map("anchor_points")
}

// ==================== M7: 伙伴 ====================

model CompanionState {
  id                String   @id @default(cuid())
  userId            String   @unique @map("user_id")
  stage             String   @default("acquaintance") // "acquaintance" | "familiar" | "friend" | "comrade" | "soulmate"
  totalDays         Int      @default(0) @map("total_days")
  lastInteractionAt DateTime @default(now()) @map("last_interaction_at")
  customNickname    String?  @map("custom_nickname")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("companion_states")
}

// ==================== M8: 进度 ====================

model ProgressRecord {
  id           String   @id @default(cuid())
  goalId       String   @map("goal_id")
  userId       String   @map("user_id")
  recordType   String   @map("record_type") // "milestone_7" | "milestone_14" | "milestone_30" | "milestone_60" | "milestone_90" | "weekly"
  dayNumber    Int      @map("day_number")
  content      String   @db.Text // 伙伴语气的进度文案
  dataSnapshot Json     @map("data_snapshot") // { totalTasks, completionRate, topPlatform, ... }
  isShared     Boolean  @default(false) @map("is_shared")
  createdAt    DateTime @default(now()) @map("created_at")

  goal Goal @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@index([userId, recordType])
  @@map("progress_records")
}

// ==================== M9: 连续天数 ====================

model StreakRecord {
  id                  String   @id @default(cuid())
  userId              String   @unique @map("user_id")
  currentStreak       Int      @default(0) @map("current_streak")
  longestStreak       Int      @default(0) @map("longest_streak")
  lastActiveDate      DateTime @map("last_active_date") @db.Date
  totalCompletedDays  Int      @default(0) @map("total_completed_days")
  totalCompletedTasks Int      @default(0) @map("total_completed_tasks")
  restDaysUsedThisWeek Int     @default(0) @map("rest_days_used_this_week")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("streak_records")
}

model RestDayLog {
  id     String   @id @default(cuid())
  userId String   @map("user_id")
  date   DateTime @db.Date
  reason String?

  @@unique([userId, date])
  @@map("rest_day_logs")
}

// ==================== M6: 任务完成记录 ====================

model TaskCompletion {
  id                String   @id @default(cuid())
  dailyTaskId       String   @map("daily_task_id")
  userId            String   @map("user_id")
  completionDate    DateTime @map("completion_date") @db.Date
  quizPassed        Boolean? @map("quiz_passed")
  timeSpentSeconds  Int?     @map("time_spent_seconds")
  companionFeedback String?  @map("companion_feedback") @db.Text
  completedAt       DateTime @default(now()) @map("completed_at")

  dailyTask DailyTask @relation(fields: [dailyTaskId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([dailyTaskId, userId, completionDate])
  @@index([userId, completionDate])
  @@map("task_completions")
}

// ==================== M10: 周回顾 ====================

model WeeklyReview {
  id                 String   @id @default(cuid())
  userId             String   @map("user_id")
  goalId             String   @map("goal_id")
  weekNumber         Int      @map("week_number")
  difficultyFeedback String   @map("difficulty_feedback") // "too_easy" | "just_right" | "too_hard"
  preferredFormat    String   @map("preferred_format")    // "video" | "article" | "hands_on"
  bestTaskId         String?  @map("best_task_id")
  createdAt          DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  goal Goal @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@unique([userId, goalId, weekNumber])
  @@map("weekly_reviews")
}

// ==================== 埋点事件 ====================

model AnalyticsEvent {
  id        String   @id @default(cuid())
  userId    String?  @map("user_id")
  eventName String   @map("event_name")
  eventData Json?    @map("event_data")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([eventName, createdAt])
  @@index([userId, createdAt])
  @@map("analytics_events")
}
```

---

## 三、核心业务流程

### 3.1 新用户首次使用流程

```mermaid
sequenceDiagram
    participant U as 用户(小程序/H5/App)
    participant API as Next.js API
    participant AI as AI 大模型
    participant DB as MySQL
    participant R as Redis

    U->>API: 微信授权 code
    API->>API: code → openid（微信API）
    API->>DB: 查找/创建 User
    API->>R: 缓存 JWT Session
    API-->>U: JWT Token

    U->>API: 选择目标模板 / 输入自定义目标
    API->>DB: 创建 Goal

    U->>API: 回答3个问题（水平/时长/有无资源）
    API->>DB: 更新 Goal（level/minutes/duration）

    alt 用户有自己的资源
        U->>API: 上传链接列表
        API->>AI: 分析链接内容（批量）
        AI-->>API: 返回分析结果（主题/难度/时长）
        API->>DB: 存储 UserResource
    end

    API->>AI: 生成任务路径（Goal + UserResource）
    AI-->>API: 返回结构化路径 JSON
    API->>DB: 批量写入 TaskPath + DailyTask

    API->>AI: 为每个学习任务匹配/搜索资源
    AI-->>API: 返回资源列表
    API->>DB: 批量写入 Resource

    API->>AI: 生成首条愿景文案
    AI-->>API: 愿景内容
    API->>DB: 写入 GoalVision

    U->>API: 设定锚点（对话式）
    API->>DB: 创建 AnchorPoint
    API->>DB: 创建 CompanionState（初识阶段）
    API->>DB: 创建 StreakRecord

    API-->>U: 引导完成 → 跳转任务中心
```

### 3.2 每日核心循环

```mermaid
sequenceDiagram
    participant Cron as 定时任务
    participant Push as 推送服务
    participant U as 用户
    participant API as Next.js API
    participant AI as AI 大模型
    participant DB as MySQL
    participant R as Redis

    Cron->>DB: 查询到达锚点时间的用户
    Cron->>AI: 生成推送文案（伙伴语气）
    Cron->>Push: 发送微信订阅消息（含深度链接）
    Push-->>U: 推送到达

    U->>API: 点击推送 → 深度链接直达任务页
    API->>DB: 查询今日任务 + 愿景
    API->>R: 读取连续天数（热数据）
    API-->>U: 返回愿景(3秒) + 任务列表

    U->>U: 点击任务 → 跳转外部资源
    Note over U: 在B站/Keep等完成学习

    U->>API: 回到App → 提交完成
    API->>DB: 查询验证题
    API-->>U: 展示验证选择题

    U->>API: 提交答案
    API->>DB: 写入 TaskCompletion
    API->>R: 更新今日完成数

    API->>AI: 生成伙伴反馈（基于上下文）
    AI-->>API: 伙伴评语
    API-->>U: ✅ 动画 + 进度更新 + 伙伴评语

    alt 今日全部完成
        API->>R: 更新连续天数 +1
        API->>DB: 同步 StreakRecord
        API->>AI: 生成庆祝文案
        API-->>U: 🎯 全部完成 + 伙伴庆祝
    end
```

### 3.3 AI 任务拆解流程

```mermaid
flowchart TD
    A["用户提交目标<br/>(品类+水平+时长)"] --> B{有用户自传资源?}

    B -->|是| C["AI 分析用户链接<br/>识别主题/难度/时长"]
    B -->|否| D["加载领域知识框架<br/>(品类对应的技能树)"]

    C --> E["合并：用户资源 + 技能框架"]
    D --> E

    E --> F["AI 生成阶段划分<br/>Phase 1~4 + 每阶段技能点"]

    F --> G["AI 生成每日任务<br/>遵循6条规则"]

    G --> H{"任务有资源?<br/>(用户上传的)"}
    H -->|有| I["直接使用用户资源"]
    H -->|无| J["AI 搜索匹配资源<br/>Top 1 默认 + 2 备选"]

    I --> K["AI 生成验证题<br/>每个学习任务1道"]
    J --> K

    K --> L["写入 DB<br/>TaskPath + DailyTask<br/>+ Resource + Quiz"]

    L --> M["返回计划预览<br/>伙伴语气介绍"]

    style A fill:#e1f5fe
    style M fill:#e8f5e9
```

### 3.4 用户自传链接处理流程

```mermaid
flowchart TD
    A["用户粘贴 URL / 分享链接"] --> B["API 接收"]
    B --> C["URL 解析<br/>识别平台(B站/知乎/...)"]
    C --> D["AI 分析链接内容"]

    D --> E["提取元信息<br/>标题/时长/主题/难度"]

    E --> F{能匹配现有技能点?}
    F -->|是| G["自动排入对应天数的任务"]
    F -->|否| H["AI 判断最佳插入位置"]
    H --> G

    G --> I["更新 DailyTask<br/>sourceType = user_uploaded"]
    I --> J["伙伴反馈<br/>'已排入第N天的计划'"]

    style A fill:#fff3e0
    style J fill:#e8f5e9
```

### 3.5 资源质量闭环

```mermaid
flowchart TD
    subgraph ai_search ["AI 搜索层"]
        A1["大模型搜索资源"] --> A2["硬指标过滤<br/>播放量/评分/时长"]
        A2 --> A3["AI 内容分析<br/>标题党/广告/深度"]
        A3 --> A4["入库<br/>status=active"]
    end

    subgraph user_vote ["用户投票层"]
        B1["用户完成任务后"] --> B2["👍 / 👎 / 🔄"]
        B2 --> B3["更新 approvalRate"]
        B3 --> B4{好评率 < 50%?}
        B4 -->|是| B5["触发 AI 搜索替代"]
        B4 -->|否| B6["保持"]
    end

    subgraph auto_monitor ["AI 监控层"]
        C1["每日 Cron"] --> C2["检查链接可用性"]
        C2 --> C3{链接失效?}
        C3 -->|是| C4["标记 broken<br/>切换备选"]
        C3 -->|否| C5["pass"]

        C6["每周 Cron"] --> C7{某技能点资源 < 2?}
        C7 -->|是| C8["AI 自动补充搜索"]
        C7 -->|否| C9["pass"]
    end

    A4 --> B1
    B5 --> A1
    C4 --> A1
    C8 --> A1
```

---

## 四、存储设计

### 4.1 MySQL 表分区与索引策略

```
热数据表（高频读写）：
  - task_completions  → 按 completion_date 分区（月分区）
  - analytics_events  → 按 created_at 分区（月分区），定期归档

核心索引：
  - users: wx_open_id (UNIQUE)
  - goals: (user_id, status) 复合索引
  - daily_tasks: (goal_id, day_number) 复合索引，命中"今日任务查询"
  - task_completions: (user_id, completion_date) 复合索引，命中"今日完成状态"
  - resources: (category, skill_point, status) 复合索引，命中"资源匹配"
```

### 4.2 Redis 缓存策略

```
Key 设计：

1. 会话缓存
   session:{userId}  → JWT payload（TTL: 7d）

2. 连续天数热数据
   streak:{userId}   → { current, longest, lastDate }（TTL: 48h，写回DB）

3. 今日任务缓存
   tasks:{userId}:{date} → 今日任务列表 JSON（TTL: 当日结束）

4. 今日完成状态
   done:{userId}:{date}  → Set<taskId>（TTL: 当日结束）

5. 推送队列
   queue:push:{channel}  → BullMQ 队列（锚点推送调度）

6. AI 调用限流
   ratelimit:ai:{userId} → 计数器（防止滥用）
```

### 4.3 对象存储

```
OSS 目录结构：

icandoit/
  ├── stickers/           → 场景贴纸图片
  │     └── {goalId}/{anchorId}.png
  ├── progress/           → 用户进度截图/录音
  │     └── {userId}/{goalId}/day{N}.{ext}
  ├── avatars/            → 用户头像
  │     └── {userId}.jpg
  └── share-cards/        → 进度分享卡片
        └── {progressRecordId}.png
```

---

## 五、项目目录结构

```
icandoit/
├── prisma/
│   ├── schema.prisma            # 数据模型定义
│   ├── migrations/              # 数据库迁移文件
│   └── seed.ts                  # 种子数据（目标模板、初始资源库）
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/v1/              # API Routes（后端）
│   │   │   ├── auth/
│   │   │   │   └── wechat/route.ts      # 微信登录
│   │   │   ├── goals/
│   │   │   │   ├── route.ts             # CRUD 目标
│   │   │   │   └── [goalId]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── vision/route.ts  # 愿景
│   │   │   │       └── path/route.ts    # 路径生成
│   │   │   ├── tasks/
│   │   │   │   ├── today/route.ts       # 今日任务
│   │   │   │   └── [taskId]/
│   │   │   │       ├── complete/route.ts
│   │   │   │       └── quiz/route.ts
│   │   │   ├── resources/
│   │   │   │   ├── route.ts             # AI 资源搜索
│   │   │   │   ├── upload/route.ts      # 用户自传链接
│   │   │   │   └── [resourceId]/
│   │   │   │       └── feedback/route.ts
│   │   │   ├── companion/
│   │   │   │   └── dialogue/route.ts    # 伙伴对话
│   │   │   ├── anchors/route.ts         # 锚点设定
│   │   │   ├── streaks/route.ts         # 连续天数
│   │   │   ├── progress/route.ts        # 进度记录
│   │   │   └── reviews/route.ts         # 周回顾
│   │   │
│   │   ├── (web)/               # Web H5 前端页面（Next.js SSR）
│   │   │   ├── page.tsx                 # 首页/任务中心
│   │   │   ├── onboard/page.tsx         # 引导流
│   │   │   ├── goal/setup/page.tsx      # 目标设定
│   │   │   ├── tasks/page.tsx           # 任务中心
│   │   │   ├── progress/page.tsx        # 进度面板
│   │   │   └── profile/page.tsx         # 个人中心
│   │   │
│   │   └── layout.tsx
│   │
│   ├── lib/                     # 核心业务逻辑（跨端复用）
│   │   ├── db.ts                        # Prisma Client 单例
│   │   ├── redis.ts                     # Redis 客户端
│   │   ├── auth.ts                      # JWT 签发/验证
│   │   ├── ai/
│   │   │   ├── client.ts               # AI 大模型客户端
│   │   │   ├── task-decomposer.ts      # 任务拆解引擎
│   │   │   ├── resource-curator.ts     # 资源策展引擎
│   │   │   ├── link-analyzer.ts        # 用户链接分析
│   │   │   ├── companion-engine.ts     # 伙伴对话引擎
│   │   │   ├── vision-generator.ts     # 愿景生成
│   │   │   └── quiz-generator.ts       # 验证题生成
│   │   ├── push/
│   │   │   ├── wechat.ts               # 微信订阅消息
│   │   │   ├── web-push.ts             # Web Push
│   │   │   └── scheduler.ts            # 推送调度器
│   │   ├── services/
│   │   │   ├── goal.service.ts
│   │   │   ├── task.service.ts
│   │   │   ├── resource.service.ts
│   │   │   ├── streak.service.ts
│   │   │   ├── progress.service.ts
│   │   │   └── companion.service.ts
│   │   └── utils/
│   │       ├── deep-link.ts            # 深度链接生成
│   │       └── sticker-generator.ts    # 贴纸图片生成
│   │
│   ├── workers/                 # 后台任务（BullMQ Workers）
│   │   ├── push-worker.ts              # 推送发送
│   │   ├── resource-health-worker.ts   # 资源健康检查
│   │   ├── resource-replenish-worker.ts# 资源自动补充
│   │   ├── progress-card-worker.ts     # 进度卡片生成
│   │   └── vision-refresh-worker.ts    # 愿景刷新
│   │
│   └── types/                   # 全局类型定义
│       ├── api.ts
│       ├── goal.ts
│       ├── task.ts
│       └── companion.ts
│
├── miniapp/                     # 微信小程序（Taro 4.x）
│   ├── src/
│   │   ├── app.config.ts
│   │   ├── pages/
│   │   │   ├── index/           # 任务中心（tabBar）
│   │   │   ├── progress/        # 进度（tabBar）
│   │   │   ├── profile/         # 我的（tabBar）
│   │   │   ├── onboard/         # 引导流
│   │   │   ├── goal-setup/      # 目标设定
│   │   │   └── task-detail/     # 任务详情
│   │   ├── services/
│   │   │   └── api.ts           # API 封装（调用 Next.js 后端）
│   │   └── components/
│   │       ├── TaskCard/
│   │       ├── CompanionBubble/
│   │       └── StreakCounter/
│   └── project.config.json
│
├── package.json
├── next.config.ts
├── tsconfig.json
├── .env.local                   # 环境变量
└── docker-compose.yml           # MySQL + Redis 本地开发
```

---

## 六、关键技术实现要点

### 6.1 AI 任务拆解引擎（核心 Prompt 设计）

```typescript
// src/lib/ai/task-decomposer.ts

const SYSTEM_PROMPT = `你是一个专业的学习路径规划师。
根据用户的目标信息，生成科学的每日任务计划。

规则：
1. 每日任务 2-3 个，总时长不超过 {dailyMinutes} 分钟
2. 任务分三种类型：learn（看/听/读）、practice（动手做）、feedback（记录/自评）
3. 前期 learn 多，后期 practice 多
4. 每个任务的第一个永远是最轻量的（2 分钟法则）
5. 每个 learn 任务附带一道选择验证题（3 选项）
6. 同一技能点 3-7 天内至少出现 2 次（间隔重复）

输出格式：严格 JSON，结构如下...`
```

### 6.2 伙伴对话引擎（变量插值 + AI 兜底）

```typescript
// src/lib/ai/companion-engine.ts

// MVP: 模板矩阵 + 变量插值
// 维度: 场景(10种) × 关系深度(5级) × 时段(4段) = 200+ 模板

interface CompanionContext {
  scene: 'app_open' | 'task_complete' | 'all_done' | 'streak_break_return' | ...
  stage: 'acquaintance' | 'familiar' | 'friend' | 'comrade' | 'soulmate'
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  vars: {
    streakDays: number
    hoursSinceLastVisit: number
    totalTasks: number
    todayCompleted: number
    todayTotal: number
    userName: string
    // ...
  }
}
```

### 6.3 深度链接方案

```
微信小程序：
  页面路径: /pages/task-detail/index?taskId={id}&goalId={gid}
  场景值: scene=push_anchor

H5 / PWA：
  URL: https://icandoit.app/tasks/{taskId}?from=push

App (React Native)：
  Universal Link: https://icandoit.app/tasks/{taskId}
  App Scheme: icandoit://task/{taskId}

统一深度链接生成器：
  /api/v1/deeplink?target=task&id={taskId}&channel={wechat|h5|app}
  → 根据 User-Agent 返回对应平台的链接
```

### 6.4 推送调度架构

```typescript
// 每分钟执行，检查当前时间是否命中某用户的锚点
// src/workers/push-worker.ts

// BullMQ 定时任务：每天凌晨生成当日推送计划
// 1. 查询所有 active 锚点
// 2. 按 time 分桶（精确到分钟）
// 3. 投入 BullMQ delayed job
// 4. 到时间时：查询今日任务 → AI 生成推送文案 → 发送

// 渐进脱离逻辑：
// 检查用户最近 14 天是否都在锚点时间前主动打开
// 如果是 → 降低推送频率 → 隔天推送 → 伙伴说"你已经不需要我了"
```

---

## 七、MVP 开发计划（6 周）

### Sprint 1（Week 1-2）：基础设施 + M1 + M2

| 任务 | 优先级 | 预估 | 交付物 |
|---|---|---|---|
| 项目初始化（Next.js 16 + Prisma + MySQL + Redis） | P0 | 0.5d | 可运行的空项目 |
| Docker Compose（MySQL + Redis 本地开发环境） | P0 | 0.5d | docker-compose.yml |
| Prisma Schema 全量编写 + 首次迁移 | P0 | 1d | 数据库表结构 |
| 种子数据（5 个热门目标模板 + 初始资源库） | P0 | 1d | seed.ts |
| M1 微信登录 API + JWT 签发 | P0 | 1d | /api/v1/auth/wechat |
| M1 引导流前端页面（Web H5） | P0 | 1d | 引导页面 |
| M2 目标设定 API（CRUD + 模板库） | P0 | 1.5d | /api/v1/goals |
| M2 对话式目标设定前端 | P0 | 1.5d | 目标设定页 |
| M2 用户自传链接上传 API | P0 | 1d | /api/v1/resources/upload |

### Sprint 2（Week 3-4）：M3 + M4 + M7（AI 核心）

| 任务 | 优先级 | 预估 | 交付物 |
|---|---|---|---|
| AI 客户端封装（OpenAI/DeepSeek） | P0 | 0.5d | ai/client.ts |
| M4 AI 任务拆解引擎 | P0 | 2d | task-decomposer.ts |
| M4 AI 资源策展引擎（搜索+筛选） | P0 | 2d | resource-curator.ts |
| M4 用户链接 AI 分析器 | P0 | 1d | link-analyzer.ts |
| M4 验证题 AI 生成器 | P1 | 0.5d | quiz-generator.ts |
| M3 愿景生成 API + AI Prompt | P0 | 1d | vision-generator.ts |
| M7 伙伴对话引擎（模板矩阵 + 插值） | P0 | 2d | companion-engine.ts |
| M7 全触点文案库编写 | P0 | 1d | 200+ 模板 |

### Sprint 3（Week 5）：M5 + M6 + M9（每日循环）

| 任务 | 优先级 | 预估 | 交付物 |
|---|---|---|---|
| M6 今日任务 API + 缓存策略 | P0 | 1d | /api/v1/tasks/today |
| M6 任务完成 + 验证流程 API | P0 | 1d | /api/v1/tasks/[id]/complete |
| M6 换资源 / 用户自传替换 API | P0 | 0.5d | /api/v1/tasks/[id]/replace-resource |
| M6 任务中心前端页面 | P0 | 1.5d | 核心页面 |
| M5 锚点设定 API | P0 | 0.5d | /api/v1/anchors |
| M5 推送调度器 + 微信订阅消息 | P0 | 1.5d | push scheduler |
| M5 深度链接生成器 | P0 | 0.5d | deep-link.ts |
| M9 连续天数计算 + Redis 缓存 | P0 | 1d | streak.service.ts |
| M9 休息日 API | P1 | 0.5d | rest-day API |

### Sprint 4（Week 6）：M8 + M10 + 小程序 + 联调

| 任务 | 优先级 | 预估 | 交付物 |
|---|---|---|---|
| M8 进度数据面板 API | P0 | 1d | /api/v1/progress |
| M8 进度卡片自动生成（Worker） | P0 | 1d | progress-card-worker.ts |
| M8 每日/每周回顾前端 | P1 | 1d | 回顾页面 |
| M10 周回顾问卷 API | P1 | 0.5d | /api/v1/reviews |
| 资源健康检查 Worker | P1 | 0.5d | resource-health-worker.ts |
| 微信小程序核心页面（Taro） | P0 | 2d | 小程序 3 个 tab 页 |
| 小程序 ↔ 后端 API 联调 | P0 | 1d | 全链路通跑 |
| 场景贴纸生成 | P1 | 0.5d | sticker-generator.ts |
| E2E 测试 + Bug 修复 | P0 | 1.5d | 上线就绪 |

---

## 八、环境与部署

### 8.1 环境变量

```env
# .env.local

# MySQL
DATABASE_URL="mysql://root:password@localhost:3306/icandoit"

# Redis
REDIS_URL="redis://localhost:6379"

# 微信小程序
WECHAT_APP_ID="wx..."
WECHAT_APP_SECRET="..."

# AI
OPENAI_API_KEY="sk-..."
OPENAI_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o"

# 对象存储
OSS_ACCESS_KEY="..."
OSS_ACCESS_SECRET="..."
OSS_BUCKET="icandoit"
OSS_REGION="oss-cn-hangzhou"

# JWT
JWT_SECRET="..."
JWT_EXPIRES_IN="7d"

# 推送
WEB_PUSH_VAPID_PUBLIC="..."
WEB_PUSH_VAPID_PRIVATE="..."
```

### 8.2 Docker Compose（本地开发）

```yaml
# docker-compose.yml
services:
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: icandoit
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

### 8.3 生产部署拓扑

```
                   ┌──────────────┐
                   │   CDN/SSL    │
                   │  (Cloudflare)│
                   └──────┬───────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
       ┌──────┴──┐  ┌─────┴────┐  ┌──┴──────┐
       │ Vercel  │  │ Vercel   │  │ Worker  │
       │ (SSR)   │  │ (API)    │  │ (Cron)  │
       └────┬────┘  └────┬─────┘  └────┬────┘
            │             │             │
            └─────────────┼─────────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
       ┌──────┴──┐  ┌─────┴────┐  ┌──┴──────┐
       │ MySQL   │  │  Redis   │  │   OSS   │
       │ (RDS)   │  │ (Cloud)  │  │ (Cloud) │
       └─────────┘  └──────────┘  └─────────┘
```

---

## 九、技术风险与应对

| 风险 | 影响 | 应对方案 |
|---|---|---|
| AI 生成任务质量不稳定 | 用户体验差 | Prompt 工程迭代 + 结构化输出校验 + 人工 Fallback 到预设模板 |
| AI API 调用延迟（首次拆解 10s+） | 用户等待流失 | 异步处理 + 加载动画 + 拆解完成后推送通知 |
| 外部资源链接大量失效 | 任务无法执行 | 每日健康检查 + 自动切换备选 + 冗余备选数 ≥ 2 |
| 微信订阅消息模板审核 | 推送功能受限 | 提前申请多个模板 + 降级为服务通知 |
| 多端 UI 一致性 | 开发成本高 | 设计 Token 系统 + 共享业务逻辑层（service/lib） |
| MySQL 单表数据量增长 | 查询变慢 | task_completions 按月分区 + analytics 定期归档 |

---

*文档版本：v1.0*
*最后更新：2026-03-19*
