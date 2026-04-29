import { useMemo, useState } from "react";
import { PageHeader } from "@/modules/performance/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/modules/performance/components/common/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Download, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string;
  name: string;
  position: string;
  department: string;
  selfScore: number;
  leaderScore: number | null;
  status: "已完成" | "上级评分中" | "自评中";
};

const rows: Row[] = [
  { id: "E01", name: "林峰", position: "市场专员", department: "市场营销部", selfScore: 88, leaderScore: 86, status: "已完成" },
  { id: "E02", name: "王芳", position: "市场经理", department: "市场营销部", selfScore: 92, leaderScore: 90, status: "已完成" },
  { id: "E03", name: "周琳", position: "市场策划", department: "市场营销部", selfScore: 85, leaderScore: null, status: "上级评分中" },
  { id: "E04", name: "高峰", position: "区域经理", department: "市场营销部", selfScore: 90, leaderScore: 88, status: "已完成" },
  { id: "E05", name: "杨柳", position: "品牌策划", department: "市场营销部", selfScore: 0, leaderScore: null, status: "自评中" },

  { id: "E06", name: "邵华", position: "生产主管", department: "生产管理部", selfScore: 91, leaderScore: 87, status: "已完成" },
  { id: "E07", name: "孙磊", position: "工艺工程师", department: "生产管理部", selfScore: 84, leaderScore: 82, status: "已完成" },
  { id: "E08", name: "徐涛", position: "设备维护", department: "生产管理部", selfScore: 88, leaderScore: null, status: "上级评分中" },
  { id: "E09", name: "胡军", position: "安全主管", department: "生产管理部", selfScore: 86, leaderScore: 85, status: "已完成" },

  { id: "E10", name: "袁帅", position: "财务核算", department: "财务部", selfScore: 90, leaderScore: 89, status: "已完成" },
  { id: "E11", name: "朱丹", position: "财务核算", department: "财务部", selfScore: 87, leaderScore: null, status: "上级评分中" },

  { id: "E12", name: "马超", position: "采购专员", department: "供应链", selfScore: 86, leaderScore: 84, status: "已完成" },
  { id: "E13", name: "陈昊", position: "仓储专员", department: "供应链", selfScore: 83, leaderScore: 80, status: "已完成" },

  { id: "E14", name: "潘伟", position: "物业主管", department: "行政人事部", selfScore: 79, leaderScore: 78, status: "已完成" },
  { id: "E15", name: "黄丽", position: "招聘专员", department: "行政人事部", selfScore: 88, leaderScore: 88, status: "已完成" },
  { id: "E16", name: "赵磊", position: "品质管理", department: "行政人事部", selfScore: 85, leaderScore: null, status: "上级评分中" },
];

const grade = (s: number) => {
  if (s >= 90) return { label: "A", tone: "success" as const };
  if (s >= 80) return { label: "B+", tone: "success" as const };
  if (s >= 70) return { label: "B", tone: "info" as const };
  if (s >= 60) return { label: "C", tone: "warning" as const };
  return { label: "D", tone: "muted" as const };
};

export default function DepartmentSummary() {
  const [dept, setDept] = useState<string>("全部");
  const [cycle, setCycle] = useState<string>("2025 Q1 季度考核");

  const departments = useMemo(() => Array.from(new Set(rows.map((r) => r.department))), []);

  const summaries = useMemo(() => {
    const map = new Map<string, Row[]>();
    rows.forEach((r) => {
      const arr = map.get(r.department) ?? [];
      arr.push(r);
      map.set(r.department, arr);
    });
    return Array.from(map.entries()).map(([department, list]) => {
      const completed = list.filter((x) => x.status === "已完成");
      const finalScores = completed.map((x) => x.leaderScore ?? 0);
      const avg = finalScores.length
        ? finalScores.reduce((a, b) => a + b, 0) / finalScores.length
        : 0;
      const top = completed.length
        ? completed.reduce((p, c) => ((c.leaderScore ?? 0) > (p.leaderScore ?? 0) ? c : p))
        : null;
      const aGrade = completed.filter((x) => (x.leaderScore ?? 0) >= 90).length;
      const lowGrade = completed.filter((x) => (x.leaderScore ?? 0) < 80 && (x.leaderScore ?? 0) > 0).length;
      return {
        department,
        total: list.length,
        completed: completed.length,
        avg,
        top,
        aGrade,
        lowGrade,
        progress: Math.round((completed.length / list.length) * 100),
      };
    });
  }, []);

  const filteredRows = dept === "全部" ? rows : rows.filter((r) => r.department === dept);
  const filteredSummaries = dept === "全部" ? summaries : summaries.filter((s) => s.department === dept);

  const totalEmployees = filteredRows.length;
  const overallAvg = (() => {
    const completed = filteredRows.filter((r) => r.status === "已完成");
    if (!completed.length) return 0;
    return completed.reduce((a, b) => a + (b.leaderScore ?? 0), 0) / completed.length;
  })();
  const overallProgress = Math.round(
    (filteredRows.filter((r) => r.status === "已完成").length / Math.max(1, filteredRows.length)) * 100,
  );

  const exportCsv = () => {
    const header = ["部门", "姓名", "岗位", "自评分", "上级评分", "最终得分", "等级", "状态"];
    const lines = filteredRows.map((r) => {
      const final = r.leaderScore ?? "";
      const g = r.leaderScore != null ? grade(r.leaderScore).label : "";
      return [r.department, r.name, r.position, r.selfScore || "", final, final, g, r.status].join(",");
    });
    const csv = "\uFEFF" + [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cycle}_${dept}_部门汇总.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("已导出部门汇总 CSV");
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="部门绩效汇总"
        subtitle="按部门汇总评估结果 · 自评与上级评两级流程"
        actions={
          <Button className="gap-2" onClick={exportCsv}>
            <Download className="size-4" /> 导出汇总
          </Button>
        }
      />

      {/* 筛选 */}
      <Card className="p-4 shadow-none border mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">考核周期</span>
            <Select value={cycle} onValueChange={setCycle}>
              <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2025 Q1 季度考核">2025 Q1 季度考核</SelectItem>
                <SelectItem value="2024 年度考核">2024 年度考核</SelectItem>
                <SelectItem value="2025 年 3 月月度考核">2025 年 3 月月度考核</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">部门</span>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部部门</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* 总览指标 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-5 shadow-none border">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground">参评人员</div>
              <div className="text-3xl font-semibold mt-2">{totalEmployees}</div>
              <div className="text-xs text-muted-foreground mt-1">{dept === "全部" ? `覆盖 ${departments.length} 个部门` : dept}</div>
            </div>
            <div className="size-10 rounded-lg grid place-items-center bg-primary-soft text-primary">
              <Users className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5 shadow-none border">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground">完成率</div>
              <div className="text-3xl font-semibold mt-2">{overallProgress}%</div>
              <Progress value={overallProgress} className="h-1.5 mt-2" />
            </div>
            <div className="size-10 rounded-lg grid place-items-center bg-success-soft text-success">
              <TrendingUp className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5 shadow-none border">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground">平均最终得分</div>
              <div className="text-3xl font-semibold mt-2">{overallAvg ? overallAvg.toFixed(1) : "—"}</div>
              <div className="text-xs text-muted-foreground mt-1">仅统计已完成</div>
            </div>
            <div className="size-10 rounded-lg grid place-items-center bg-primary-soft text-primary">
              <Building2 className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5 shadow-none border">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground">A 级人数 / 偏低</div>
              <div className="text-3xl font-semibold mt-2">
                {filteredSummaries.reduce((a, b) => a + b.aGrade, 0)} / {filteredSummaries.reduce((a, b) => a + b.lowGrade, 0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">≥90 / &lt;80</div>
            </div>
            <div className="size-10 rounded-lg grid place-items-center bg-warning-soft text-warning">
              <ArrowUpRight className="size-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* 部门汇总卡片 */}
      <Card className="p-6 shadow-none border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">各部门得分概览</h3>
          <span className="text-xs text-muted-foreground">基于"上级评分"作为最终得分</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSummaries.map((s) => {
            const g = s.avg ? grade(s.avg) : null;
            return (
              <div key={s.department} className="p-4 rounded-xl border hover:border-primary/40 hover:bg-primary-soft/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{s.department}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {s.completed}/{s.total} 完成
                    </div>
                  </div>
                  {g && <StatusBadge tone={g.tone}>等级 {g.label}</StatusBadge>}
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">平均分</div>
                    <div className="text-2xl font-semibold text-primary">{s.avg ? s.avg.toFixed(1) : "—"}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {s.top ? (
                      <>
                        <div>Top：{s.top.name}</div>
                        <div className="text-success font-medium mt-0.5">{s.top.leaderScore} 分</div>
                      </>
                    ) : (
                      <span>暂无完成数据</span>
                    )}
                  </div>
                </div>
                <Progress value={s.progress} className="h-1.5 mt-3" />
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                  <span>完成率 {s.progress}%</span>
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-success"><ArrowUpRight className="size-3" />A {s.aGrade}</span>
                    <span className="inline-flex items-center gap-1 text-warning"><ArrowDownRight className="size-3" />低 {s.lowGrade}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 明细表格 */}
      <Card className="shadow-none border overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">员工评估明细</h3>
          <span className="text-xs text-muted-foreground">共 {filteredRows.length} 条</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead>姓名</TableHead>
              <TableHead>部门 / 岗位</TableHead>
              <TableHead className="text-right">自评分</TableHead>
              <TableHead className="text-right">上级评分</TableHead>
              <TableHead className="text-right">最终得分</TableHead>
              <TableHead>等级</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((r) => {
              const final = r.leaderScore;
              const g = final != null ? grade(final) : null;
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.department} · {r.position}</TableCell>
                  <TableCell className="text-right">{r.selfScore || "—"}</TableCell>
                  <TableCell className="text-right">{r.leaderScore ?? "—"}</TableCell>
                  <TableCell className="text-right font-semibold">{final ?? "—"}</TableCell>
                  <TableCell>{g ? <StatusBadge tone={g.tone}>{g.label}</StatusBadge> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                  <TableCell>
                    <StatusBadge tone={r.status === "已完成" ? "success" : r.status === "上级评分中" ? "info" : "warning"}>
                      {r.status}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
