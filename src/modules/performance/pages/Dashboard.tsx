import { PageHeader } from "@/modules/performance/components/common/PageHeader";
import { StatusBadge } from "@/modules/performance/components/common/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { FilePlus2, BookMarked, ClipboardCheck, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const stats = [
  { label: "进行中考核", value: "3", delta: "+1 本月", icon: ClipboardCheck, tone: "info" as const },
  { label: "待我处理", value: "12", delta: "5 项已逾期", icon: Clock, tone: "warning" as const },
  { label: "本周完成", value: "48", delta: "完成率 92%", icon: CheckCircle2, tone: "success" as const },
  { label: "AI 评估建议", value: "7", delta: "待查看", icon: Sparkles, tone: "info" as const },
];

const ongoing = [
  { name: "2025 Q1 季度考核", scope: "市场营销部 · 32 人", node: "上级评分", progress: 62, status: "进行中" },
  { name: "2025 年 3 月月度考核", scope: "全公司 · 136 人", node: "员工自评", progress: 28, status: "进行中" },
  { name: "2024 年度考核", scope: "管理层 · 18 人", node: "上级评分", progress: 88, status: "即将完成" },
];

export default function Dashboard() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="绩效助手 工作台"
        subtitle="实时跟踪考核进度，AI 协助你高效完成绩效管理"
        actions={
          <Button asChild className="gap-2">
            <Link to="/performance/assessments/new"><FilePlus2 className="size-4" /> 新建考核</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 shadow-none border">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="text-3xl font-semibold mt-2">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.delta}</div>
              </div>
              <div className={`size-10 rounded-lg grid place-items-center ${s.tone === "warning" ? "bg-warning-soft text-warning" : s.tone === "success" ? "bg-success-soft text-success" : "bg-primary-soft text-primary"}`}>
                <s.icon className="size-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-6 shadow-none border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">进行中的考核</h3>
            <Button variant="ghost" size="sm" asChild><Link to="/performance">查看全部</Link></Button>
          </div>
          <div className="space-y-3">
            {ongoing.map((o) => (
              <div key={o.name} className="p-4 rounded-xl border hover:border-primary/40 hover:bg-primary-soft/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{o.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{o.scope} · 当前节点：{o.node}</div>
                  </div>
                  <StatusBadge tone={o.progress > 80 ? "success" : "info"}>{o.status}</StatusBadge>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={o.progress} className="flex-1 h-1.5" />
                  <span className="text-xs text-muted-foreground w-10 text-right">{o.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-none border">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-4 text-primary" />
            <h3 className="font-semibold">AI 助手洞察</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-lg bg-primary-soft/60 border border-primary/10">
              <div className="flex items-start gap-2">
                <TrendingUp className="size-4 text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">市场部业绩波动较大</div>
                  <div className="text-xs text-muted-foreground mt-1">建议优化"销售达成率"指标权重</div>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-warning-soft/60 border border-warning/10">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-warning mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">5 项考核节点逾期</div>
                  <div className="text-xs text-muted-foreground mt-1">系统已自动催办相关责任人</div>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-2" asChild>
              <Link to="/performance/indicators"><BookMarked className="size-4 mr-2" />打开指标库</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
