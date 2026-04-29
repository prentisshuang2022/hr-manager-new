# Attendance API · 考勤

对应前端模块：`src/modules/attendance`

## 资源模型

```ts
interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;             // YYYY-MM-DD
  checkIn?: string;         // HH:mm
  checkOut?: string;
  status: "正常" | "迟到" | "早退" | "缺卡" | "请假" | "出差" | "加班";
  source: "钉钉" | "门禁" | "手动" | "AI补录";
  remark?: string;
}

interface OvertimeRecord {
  id: string;
  employeeId: string;
  startTime: string;        // ISO
  endTime: string;
  hours: number;
  type: "工作日加班" | "周末加班" | "节假日加班";
  approveStatus: "待审批" | "已批准" | "已拒绝";
}

interface LeaveBalance {
  employeeId: string;
  annual: number;           // 剩余年假
  sick: number;
  personal: number;
  compensatory: number;     // 调休
}

interface AttendanceRule {
  id: string;
  name: string;
  scope: { subsidiary?: string[]; department?: string[]; employee?: string[] };
  workdays: number[];       // 0-6, 周一=1
  workStart: string;        // "09:00"
  workEnd: string;          // "18:00"
  lateGraceMin: number;     // 容迟分钟
  overtimeMinHours: number; // 计加班的最小时长
  enabled: boolean;
}
```

## 接口列表

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/attendance/overview` | 今日总览（应到/实到/异常） | hr_admin / manager |
| GET | `/attendance/records` | 考勤明细（按日期范围） | hr_admin / manager / 本人 |
| POST | `/attendance/records/upload` | 批量上传考勤（Excel） | hr_admin |
| GET | `/attendance/records/{id}/access-log` | 门禁记录回看 | hr_admin |
| GET | `/attendance/exceptions` | 异常列表（迟到/缺卡） | hr_admin / manager |
| POST | `/attendance/exceptions/{id}/notify` | 钉钉提醒员工补卡 | hr_admin / manager |
| GET | `/attendance/overtime` | 加班列表 | hr_admin / manager |
| POST | `/attendance/overtime/{id}/approve` | 审批加班 | manager |
| GET | `/attendance/leave/balance/{employeeId}` | 假期余额 | 本人 / hr_admin |
| POST | `/attendance/leave/apply` | 提交请假 | 本人 |
| GET | `/attendance/rules` | 规则列表 | hr_admin |
| POST | `/attendance/rules` | 新建规则 | hr_admin |
| PUT | `/attendance/rules/{id}` | 更新规则 | hr_admin |
| GET | `/attendance/heatmap` | 部门考勤热力图 | hr_admin / manager |

## 关键接口示例

### `POST /attendance/records/upload`

`multipart/form-data`，字段 `file`（.xlsx）。

服务端职责：

1. 解析 Excel，按"工号 + 日期"匹配员工
2. 与现有规则比对计算异常
3. 返回处理结果：`{ inserted, updated, failed: [{row, reason}] }`

### `GET /attendance/exceptions`

Query：`from`, `to`, `department`, `type`（迟到/缺卡/...）

响应：`PaginatedData<AttendanceRecord>`，附 `exceptionReason` 字段。

### `POST /attendance/exceptions/{id}/notify`

Body：`{ channel: "dingtalk" | "sms"; message?: string }`

服务端调用钉钉工作通知 API；返回 `{ messageId, sentAt }`。

## 前后端对接清单

- 前端 Mock：`src/modules/attendance/mocks/`
- 类型定义：`src/modules/attendance/types/`