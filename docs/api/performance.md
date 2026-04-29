# Performance API · 绩效

对应前端模块：`src/modules/performance`

## 资源模型

```ts
interface Indicator {
  id: string;
  name: string;
  category: "业绩" | "能力" | "态度" | "OKR";
  weight: number;            // 0-100
  scoreType: "百分制" | "五分制" | "ABCD";
  description: string;
}

interface AssessmentTemplate {
  id: string;
  name: string;
  cycle: "月度" | "季度" | "半年" | "年度";
  scope: { department?: string[]; position?: string[] };
  indicators: { indicatorId: string; weight: number }[];
  flow: ("self" | "leader")[];   // 当前两级：自评 + 上级
}

type ReviewStage = "未开始" | "自评中" | "上级评中" | "已完成" | "已申诉";

interface Review {
  id: string;
  templateId: string;
  employeeId: string;
  period: string;            // "2026-Q1"
  stage: ReviewStage;
  selfScore?: number;
  selfComment?: string;
  selfSubmittedAt?: string;
  leaderScore?: number;
  leaderComment?: string;
  leaderSubmittedAt?: string;
  finalScore?: number;       // 加权计算
  finalGrade?: "S" | "A" | "B" | "C" | "D";
}
```

## 接口列表

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/performance/indicators` | 指标库 | hr_admin |
| POST | `/performance/indicators` | 新建指标 | hr_admin |
| GET | `/performance/templates` | 模板列表 | hr_admin |
| POST | `/performance/assessments` | 发起一轮考核（按模板批量生成 Review） | hr_admin |
| GET | `/performance/reviews` | 评估列表（按周期/部门/状态筛选） | hr_admin / manager / 本人 |
| GET | `/performance/reviews/{id}` | 评估详情 | hr_admin / manager / 本人 |
| POST | `/performance/reviews/{id}/self` | 提交自评 | 本人 |
| POST | `/performance/reviews/{id}/leader` | 提交上级评 | manager |
| POST | `/performance/reviews/{id}/appeal` | 申诉 | 本人 |
| GET | `/performance/department-summary` | 部门汇总（按部门聚合得分/分布） | hr_admin / manager |
| GET | `/performance/dashboard` | 看板（参与率/完成率/分布） | hr_admin |

## 关键接口示例

### `POST /performance/assessments`

Body：

```json
{
  "templateId": "TPL001",
  "period": "2026-Q1",
  "employeeIds": ["EMP00001", "EMP00002"],
  "deadline": "2026-04-30"
}
```

服务端：

1. 按 employeeIds × template 生成 Review，stage = `自评中`
2. 推送钉钉通知到员工
3. 自评截止日自动推进到上级评，并通知直属上级

### `GET /performance/department-summary`

Query：`period`, `department`

响应：

```ts
{
  department: string;
  total: number;            // 应评人数
  completed: number;
  avgScore: number;
  distribution: { grade: "S"|"A"|"B"|"C"|"D"; count: number }[];
  topPerformers: { employeeId: string; name: string; score: number }[];
  needAttention: { employeeId: string; name: string; score: number }[];
}
```

## 流程闭环

```
发起考核 → 自评（员工） → 上级评（直属经理） → 计算最终分 → 部门汇总 → 反馈面谈
```

当前实现两级评估（自评 + 上级评），后续可扩展为加入"隔级 Review"或"360 度"。

## 前后端对接清单

- 前端页面：`Indicators.tsx` / `NewAssessment.tsx` / `Performance.tsx` / `DepartmentSummary.tsx`