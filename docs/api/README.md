# API 总览与通用约定

## 1. 基础信息

| 项 | 值 |
| --- | --- |
| Base URL（生产） | `https://api.hr-assistant.example.com/v1` |
| Base URL（开发） | `https://api.dev.hr-assistant.example.com/v1` |
| 协议 | HTTPS only |
| 数据格式 | `application/json; charset=utf-8` |
| 时间格式 | ISO-8601（`YYYY-MM-DDTHH:mm:ssZ`），日期为 `YYYY-MM-DD` |
| 认证方式 | `Authorization: Bearer <JWT>` |

## 2. 统一响应结构

所有接口统一返回 `ApiResponse<T>`：

```ts
interface ApiResponse<T> {
  success: boolean;   // 业务是否成功
  data: T | null;     // 成功时的数据
  error: string | null; // 失败时的人类可读信息
  code?: string;      // 失败时的机器可读错误码，如 "AUTH_EXPIRED"
  traceId?: string;   // 链路追踪 ID
}
```

示例：

```json
{ "success": true, "data": { "id": "EMP00001" }, "error": null }
```

## 3. 分页约定

列表类接口统一支持以下 query 参数：

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `page` | number | 1 | 页码，从 1 开始 |
| `pageSize` | number | 20 | 每页大小，最大 100 |
| `keyword` | string | - | 关键字模糊搜索 |
| `sort` | string | - | 例 `joinDate,desc` |

响应：

```ts
interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

## 4. 错误码

| HTTP | code | 含义 |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | 参数错误 |
| 401 | `AUTH_EXPIRED` | 未登录或 token 过期 |
| 403 | `FORBIDDEN` | 权限不足 |
| 404 | `NOT_FOUND` | 资源不存在 |
| 409 | `CONFLICT` | 业务冲突（如重复创建） |
| 422 | `VALIDATION_FAILED` | 字段校验失败 |
| 500 | `INTERNAL_ERROR` | 服务端异常 |

## 5. 角色与权限

| 角色 | 标识 | 数据范围 |
| --- | --- | --- |
| HR / 管理员 | `hr_admin` | 全公司 |
| 部门经理 | `manager` | 本部门及下级 |
| 员工 | `employee` | 仅本人 |

权限粒度按"模块 + 操作"控制，详见各模块 API 文档的 `权限` 列。

## 6. 模块清单

- [Employee 员工档案](./employee.md)
- [Attendance 考勤](./attendance.md)
- [Recruitment 招聘](./recruitment.md)
- [Performance 绩效](./performance.md)
- [Training 培训](./training.md)
- [Knowledge 知识库](./knowledge.md)