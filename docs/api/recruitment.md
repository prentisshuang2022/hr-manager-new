# Recruitment API · 招聘

对应前端模块：`src/modules/recruitment`

## 资源模型

```ts
interface Job {
  id: string;
  title: string;
  department: string;
  subsidiary: string;
  location: string;
  headcount: number;
  status: "招聘中" | "已暂停" | "已关闭";
  level: string;             // P5/P6...
  salaryRange: [number, number];
  jd: string;                // markdown
  publishChannels: string[]; // ["BOSS", "猎聘", "内推"]
  createdAt: string;
  owner: string;             // 招聘负责人
}

interface Resume {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: "男" | "女";
  age?: number;
  highestEducation?: string;
  school?: string;
  major?: string;
  yearsOfExp?: number;
  currentCompany?: string;
  currentPosition?: string;
  expectedSalary?: number;
  expectedLocation?: string[];
  tags: string[];            // AI 抽取标签
  rawFileUrl: string;        // 原始简历 OSS 地址
  source: "上传" | "邮箱解析" | "渠道导入" | "内推";
  parseStatus: "待解析" | "已解析" | "解析失败";
  uploadedAt: string;
}

type CandidateStage =
  | "待筛选" | "已邀约" | "面试中" | "Offer" | "已入职" | "已淘汰";

interface Candidate {
  id: string;
  resumeId: string;
  jobId: string;
  stage: CandidateStage;
  matchScore: number;       // AI 匹配分 0-100
  interviews: Interview[];
  notes: { author: string; at: string; content: string }[];
  rejectReason?: string;
}

interface Interview {
  id: string;
  round: number;
  type: "电面" | "现场" | "视频";
  scheduledAt: string;
  interviewer: string;
  result?: "通过" | "不通过" | "待定";
  feedback?: string;
}
```

## 接口列表

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/recruitment/jobs` | JD 列表 | hr_admin / manager |
| POST | `/recruitment/jobs` | 新建 JD（支持 AI 生成） | hr_admin |
| GET | `/recruitment/jobs/{id}` | JD 详情 | hr_admin / manager |
| PUT | `/recruitment/jobs/{id}` | 更新 JD | hr_admin |
| GET | `/recruitment/resumes` | 简历库（分页 + 标签筛选） | hr_admin |
| POST | `/recruitment/resumes/upload` | 上传简历（PDF/Word，支持批量） | hr_admin |
| POST | `/recruitment/resumes/{id}/parse` | 触发/重试 AI 解析 | hr_admin |
| POST | `/recruitment/resumes/{id}/match` | 与某 JD 计算匹配分 | hr_admin |
| GET | `/recruitment/candidates` | 候选人台账（按 JD/阶段筛选） | hr_admin / manager |
| GET | `/recruitment/candidates/{id}` | 候选人详情 | hr_admin / manager |
| POST | `/recruitment/candidates` | 把简历推进到某 JD | hr_admin |
| PUT | `/recruitment/candidates/{id}/stage` | 推进/回退阶段 | hr_admin / manager |
| POST | `/recruitment/candidates/{id}/interviews` | 安排面试 | hr_admin / manager |
| PUT | `/recruitment/interviews/{id}/feedback` | 提交面试反馈 | manager |
| POST | `/recruitment/candidates/{id}/offer` | 发 Offer | hr_admin |
| POST | `/recruitment/candidates/{id}/onboard` | 入职转员工档案 | hr_admin |
| GET | `/recruitment/dashboard` | 招聘看板（漏斗 + 渠道） | hr_admin |

## 关键接口示例

### `POST /recruitment/resumes/upload`

`multipart/form-data`，字段 `files[]`。

服务端职责：

1. 文件落盘 OSS，返回 `rawFileUrl`
2. 异步触发 AI 解析（OCR + LLM 抽取结构化字段）
3. 立即返回 `Resume[]`，`parseStatus = "待解析"`，前端轮询或 WebSocket 通知

### `PUT /recruitment/candidates/{id}/stage`

Body：`{ to: CandidateStage; reason?: string }`

服务端：

- 校验阶段流转合法性（如不可从"已淘汰"回流，需特批）
- 写入阶段流转日志
- 推进到"已入职"时联动 `POST /employees`

## 前后端对接清单

- 前端 Mock：`src/modules/recruitment/data/recruit.ts`