# Employee API · 员工档案

对应前端模块：`src/modules/employee`

## 资源模型

```ts
type EmployeeStatus = "试用期" | "在职" | "离职";
type ContractType = "劳动合同" | "劳务协议" | "临时工聘用";
type Subsidiary = "光电" | "光电（鄂）" | "国际" | "激光" | "新能源" | "新能源（鄂）" | "其他";

interface Employee {
  id: string;                  // EMPxxxxx
  name: string;
  status: EmployeeStatus;
  subsidiary: Subsidiary;      // 合同归属
  department: string;
  currentHeadcount: Subsidiary;// 现用人编制
  location: string;
  position: string;
  joinDate: string;            // YYYY-MM-DD
  tenure: string;              // "2.3年"
  contractType: ContractType;
  contractStart: string;
  contractEnd: string;
  contractDaysLeft: number;
  gender: "男" | "女";
  birthday: string;
  age: number;
  idNumber: string;
  idStart: string;
  idEnd: string;
  idDaysLeft: number;
  household: string;
  ethnicity: string;
  nativePlace: string;
  political: string;
  marital: string;
  highestEducation: string;
  firstEducation: string;
  educationCategory: "全日制" | "非全日制";
  school: string;
  graduationDate: string;
  major: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  resignDate?: string;
  resignReason?: string;
  materials: { type: string; name: string; uploadedAt: string; verified?: boolean }[];
  source: "钉钉同步" | "手动创建" | "AI识别";
  alerts: ("合同到期" | "身份证到期" | "钉钉数据未上传" | "学信网未认证")[];
}
```

## 接口列表

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/employees` | 员工列表（分页 + 多维筛选） | hr_admin / manager |
| GET | `/employees/{id}` | 员工详情 | hr_admin / manager / 本人 |
| POST | `/employees` | 新建员工 | hr_admin |
| PUT | `/employees/{id}` | 更新员工 | hr_admin |
| DELETE | `/employees/{id}` | 删除员工（软删） | hr_admin |
| POST | `/employees/{id}/materials` | 上传材料（multipart） | hr_admin |
| POST | `/employees/sync/dingtalk` | 触发钉钉同步 | hr_admin |
| GET | `/employees/sync/dingtalk/status` | 查询同步状态 | hr_admin |
| GET | `/employees/alerts` | 警示汇总（合同/证件到期等） | hr_admin |
| GET | `/employees/stats/kpi` | 关键指标卡片数据 | hr_admin |
| GET | `/employees/stats/monthly-flow` | 近 12 月入离职流向 | hr_admin |
| GET | `/employees/stats/dept-distribution` | 部门人数分布 | hr_admin |
| GET | `/employees/stats/subsidiary-distribution` | 公司主体分布 | hr_admin |
| GET | `/employees/stats/location-distribution` | 归属地分布 | hr_admin |
| GET | `/employees/stats/resign-trend` | 离职趋势（含同比） | hr_admin |

## 关键接口示例

### `GET /employees`

Query：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `status` | string | 多选，逗号分隔 |
| `subsidiary` | string | 多选 |
| `department` | string | 多选 |
| `keyword` | string | 姓名 / 工号 / 手机 |
| `alertOnly` | boolean | 仅看有警示的 |
| `page`, `pageSize` | number | 分页 |

响应 `PaginatedData<Employee>`。

### `POST /employees`

Body：`Omit<Employee, "id" | "tenure" | "alerts" | "contractDaysLeft" | "idDaysLeft">`

服务端职责：

- 校验身份证、手机号格式与唯一性
- 自动计算 `tenure`、`contractDaysLeft`、`idDaysLeft`
- 写入审计日志（操作人、时间）

### `GET /employees/alerts`

响应：

```ts
{
  contractExpiring: Employee[];   // 60 天内到期
  idExpiring: Employee[];         // 90 天内到期
  dingTalkMissing: Employee[];    // 钉钉数据缺失
  materialMissing: Employee[];    // 学信网未认证 / 材料缺失
}
```

## 前后端对接清单

- 前端 Mock：`src/modules/employee/data/mockData.ts`
- 接入时：把 `EMPLOYEES` / `getKpis` 等导出函数替换为 `employeeApi.list()` / `employeeApi.kpi()`，结构保持一致。