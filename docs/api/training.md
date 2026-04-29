# Training API · 培训

对应前端模块：`src/modules/training`

## 资源模型

```ts
type MaterialType = "视频" | "操作手册" | "SOP" | "文档";

interface Material {
  id: string;
  name: string;
  type: MaterialType;
  fileUrl: string;             // OSS
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  status: "待解析" | "待转写" | "已就绪" | "失败";
  audience?: "全员" | "高管" | "新员工" | "部门定向";
  tags?: string[];
}

interface Question {
  id: string;
  materialId?: string;        // 来源材料
  type: "单选" | "多选" | "判断" | "简答";
  stem: string;
  options?: { key: string; text: string }[];
  answer: string | string[];
  difficulty: "易" | "中" | "难";
  knowledgePoint?: string;
}

interface Exam {
  id: string;
  name: string;
  paperId: string;
  audience: { department?: string[]; employeeIds?: string[] };
  startAt: string;
  endAt: string;
  passScore: number;
  status: "未开始" | "进行中" | "已结束";
}

interface ExamRecord {
  id: string;
  examId: string;
  employeeId: string;
  score?: number;
  passed?: boolean;
  submittedAt?: string;
  durationSec?: number;
}

// 在岗培训链
type OnJobMaterial = "视频" | "操作手册" | "SOP" | "无";

interface OnJobNode {
  id: number;
  name: string;
  duration: string;            // "2h" / "1d"
  owner: string;               // 导师
  material: OnJobMaterial;
  needConfirm: boolean;        // 是否需要学员确认
}

interface OnJobPlan {
  id: string;
  traineeId: string;
  mentorId: string;
  nodes: OnJobNode[];
  currentNodeIndex: number;
  awaitingConfirm: boolean;
  status: "进行中" | "已完成" | "已中止";
}
```

## 接口列表

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/training/materials` | 材料列表 | hr_admin / manager |
| POST | `/training/materials` | 上传材料（含类型） | hr_admin |
| POST | `/training/materials/{id}/transcribe` | 视频转写（高管视频） | hr_admin |
| POST | `/training/materials/{id}/generate-questions` | AI 出题 | hr_admin |
| GET | `/training/questions` | 题库 | hr_admin |
| POST | `/training/questions` | 新建题目 | hr_admin |
| GET | `/training/exams` | 考试列表 | hr_admin / 本人 |
| POST | `/training/exams` | 创建考试 | hr_admin |
| POST | `/training/exams/{id}/submit` | 提交答题 | 本人 |
| GET | `/training/records` | 培训/考试记录 | hr_admin / manager / 本人 |
| GET | `/training/onjob/plans` | 在岗培训计划列表 | hr_admin / manager |
| POST | `/training/onjob/plans` | 创建在岗培训计划 | hr_admin / manager |
| POST | `/training/onjob/plans/{id}/advance` | 推进到下一节点 | mentor |
| POST | `/training/onjob/plans/{id}/confirm` | 学员确认当前节点 | 本人 |
| POST | `/training/onjob/plans/{id}/remind` | 二次提醒（钉钉） | mentor / hr_admin |

## 关键接口示例

### `POST /training/materials`

`multipart/form-data`：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `file` | 是 | 文件本体 |
| `type` | 是 | `视频` / `操作手册` / `SOP` / `文档` |
| `audience` | 否 | 默认 `全员`；`视频` 类型默认 `高管` |
| `tags` | 否 | 逗号分隔 |

服务端按 `type` 分流处理：

- `视频`：调用 ASR 转写 → 生成字幕 → 由 LLM 抽取知识点
- `操作手册` / `SOP`：按章节切片 → 生成判断/单选题
- `文档`：通用解析

### `POST /training/onjob/plans/{id}/advance`

服务端规则：

- 若当前节点 `needConfirm = true` 且 `awaitingConfirm = true`，返回 `409 CONFLICT`，提示"该节点需学员确认后才能推进"。
- 否则推进 `currentNodeIndex`，若新节点 `needConfirm`，置 `awaitingConfirm = true` 并推送学员钉钉通知。

### `POST /training/onjob/plans/{id}/confirm`

只有该计划的学员（`traineeId === auth.userId`）可调用。
服务端置 `awaitingConfirm = false`，写入确认日志。

## 流程闭环

```
材料上传(分类) → AI 出题 → 组卷考试 → 自动判分 → 不及格补考
        ↘ 在岗培训链：节点 → (需确认?) → 学员确认 → 下一节点 → 完成归档
```

## 前后端对接清单

- 题库与材料：`QuestionBank.tsx`
- 在岗培训：`OnJob.tsx`（含 `awaitingConfirm` 暂停逻辑）
- 考试中心：`ExamCenter.tsx`
- 记录：`Records.tsx`