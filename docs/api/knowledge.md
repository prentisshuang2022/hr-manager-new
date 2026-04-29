# Knowledge API · 知识库

对应前端模块：`src/modules/knowledge`

## 资源模型

```ts
interface KnowledgeDoc {
  id: string;
  title: string;
  category: "制度" | "流程" | "FAQ" | "模板" | "其他";
  fileUrl: string;
  size: number;
  version: string;
  effectiveDate: string;
  uploadedBy: string;
  uploadedAt: string;
  parseStatus: "待解析" | "已索引" | "失败";
  tags: string[];
}

interface SearchHit {
  docId: string;
  title: string;
  snippet: string;       // 高亮片段
  score: number;
  page?: number;
}

interface QAResponse {
  question: string;
  answer: string;        // LLM 生成
  citations: { docId: string; title: string; page?: number; snippet: string }[];
  confidence: number;    // 0-1
}
```

## 接口列表

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/knowledge/docs` | 文档列表 | 全员 |
| POST | `/knowledge/docs` | 上传文档 | hr_admin |
| DELETE | `/knowledge/docs/{id}` | 删除（软删 + 重建索引） | hr_admin |
| POST | `/knowledge/docs/{id}/reindex` | 重建索引 | hr_admin |
| GET | `/knowledge/search` | 全文检索 | 全员 |
| POST | `/knowledge/qa` | 智能问答（RAG） | 全员 |

## 关键接口示例

### `POST /knowledge/docs`

`multipart/form-data`：`file`, `category`, `title`, `effectiveDate`

服务端流程：

1. 文件入 OSS
2. 解析为文本（PDF/Word/MD）
3. 切片 + Embedding 入向量库
4. 索引完成后 `parseStatus = 已索引`

### `POST /knowledge/qa`

Body：`{ question: string; topK?: number; categoryFilter?: string[] }`

服务端：检索 → 重排 → LLM 生成回答，必须返回 `citations`，禁止无来源回答。

## 前后端对接清单

- 上传：`DocUpload.tsx`
- 全文检索：`FullTextSearch.tsx`
- 智能问答：`SmartQA.tsx`