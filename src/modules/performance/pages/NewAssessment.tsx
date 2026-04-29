import { useState } from "react";
import { PageHeader } from "@/modules/performance/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/modules/performance/components/common/StatusBadge";
import { Check, ChevronRight, Sparkles, Users, Target, GitBranch, Send, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const steps = [
  { id: 1, title: "基础信息", icon: Calendar },
  { id: 2, title: "参评人员", icon: Users },
  { id: 3, title: "考核指标", icon: Target },
  { id: 4, title: "审批流程", icon: GitBranch },
  { id: 5, title: "确认发布", icon: Send },
];

const cycles = ["月度", "季度", "年度"];
const positions = [
  { name: "市场营销部", count: 24, posts: ["市场专员", "市场经理"] },
  { name: "生产管理部", count: 38, posts: ["生产主管", "工艺工程师"] },
  { name: "供应链", count: 16, posts: ["采购专员", "供应链经理"] },
  { name: "财务", count: 12, posts: ["会计", "财务主管"] },
];
const aiIndicators = [
  { name: "销售目标达成率", weight: 30, type: "量化", aiRec: true },
  { name: "新客户开发数量", weight: 20, type: "量化", aiRec: true },
  { name: "客户满意度", weight: 20, type: "量化", aiRec: true },
  { name: "团队协作能力", weight: 15, type: "定性" },
  { name: "工作主动性", weight: 15, type: "定性" },
];
const flow = [
  { role: "员工自评", days: 2 },
  { role: "上级评分", days: 3 },
];

export default function NewAssessment() {
  const [step, setStep] = useState(1);
  const [cycle, setCycle] = useState("季度");
  const [name, setName] = useState("2025 Q2 季度考核");
  const [selectedDeps, setSelectedDeps] = useState<string[]>(["市场营销部"]);
  const navigate = useNavigate();

  const toggleDep = (n: string) =>
    setSelectedDeps((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));

  const total = aiIndicators.reduce((a, b) => a + b.weight, 0);

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <PageHeader title="新建考核" subtitle="按 5 个步骤完成考核创建并发布到对应人员" />

      {/* Stepper */}
      <Card className="p-6 mb-6 shadow-none border">
        <div className="flex items-center">
          {steps.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-10 rounded-full grid place-items-center text-sm font-medium transition-colors ${
                      done ? "bg-success text-success-foreground"
                      : active ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="size-5" /> : <s.icon className="size-[18px]" />}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">步骤 {s.id}</div>
                    <div className={`text-sm font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</div>
                  </div>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-px mx-4 ${done ? "bg-success" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-8 shadow-none border min-h-[420px]">
        {step === 1 && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-semibold">基础信息</h3>
            <div className="space-y-2">
              <Label>考核名称</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>考核周期</Label>
              <div className="flex gap-3">
                {cycles.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCycle(c)}
                    className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      cycle === c ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-secondary"
                    }`}
                  >
                    {c}考核
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>开始日期</Label>
                <Input type="date" defaultValue="2025-04-01" />
              </div>
              <div className="space-y-2">
                <Label>结束日期</Label>
                <Input type="date" defaultValue="2025-06-30" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">选择参评部门 / 岗位</h3>
              <span className="text-sm text-muted-foreground">已选 {selectedDeps.length} 个部门</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {positions.map((p) => {
                const sel = selectedDeps.includes(p.name);
                return (
                  <div
                    key={p.name}
                    onClick={() => toggleDep(p.name)}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                      sel ? "border-primary bg-primary-soft" : "hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{p.posts.join(" · ")}</div>
                      </div>
                      <Checkbox checked={sel} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">{p.count} 名在职员工</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">考核指标</h3>
                <div className="text-sm text-muted-foreground mt-1">从指标库自动调用，AI 已智能推荐适配岗位</div>
              </div>
              <Button variant="outline" className="gap-2"><Sparkles className="size-4 text-primary" />AI 优化推荐</Button>
            </div>
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">指标名称</th>
                    <th className="px-4 py-3 font-medium">类型</th>
                    <th className="px-4 py-3 font-medium">权重</th>
                    <th className="px-4 py-3 font-medium">来源</th>
                  </tr>
                </thead>
                <tbody>
                  {aiIndicators.map((i) => (
                    <tr key={i.name} className="border-t">
                      <td className="px-4 py-3 font-medium">{i.name}</td>
                      <td className="px-4 py-3"><StatusBadge tone={i.type === "量化" ? "info" : "muted"}>{i.type}</StatusBadge></td>
                      <td className="px-4 py-3">{i.weight}%</td>
                      <td className="px-4 py-3">
                        {i.aiRec ? <span className="inline-flex items-center gap-1 text-primary text-xs"><Sparkles className="size-3" />AI 推荐</span> : <span className="text-xs text-muted-foreground">指标库</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-secondary/30">
                    <td className="px-4 py-3 font-medium" colSpan={2}>权重合计</td>
                    <td className="px-4 py-3 font-semibold text-success">{total}%</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="text-lg font-semibold mb-1">审批流程节点</h3>
            <div className="text-sm text-muted-foreground mb-6">支持自动催办，节点超时将向责任人发送提醒</div>
            <div className="space-y-3">
              {flow.map((f, i) => (
                <div key={f.role} className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                  <div className="size-9 rounded-full bg-primary-soft text-primary grid place-items-center font-semibold text-sm">{i + 1}</div>
                  <div className="flex-1">
                    <div className="font-medium">{f.role}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">默认时限 {f.days} 个工作日</div>
                  </div>
                  <Input type="number" defaultValue={f.days} className="w-20 text-center" />
                  <span className="text-sm text-muted-foreground">天</span>
                  {i < flow.length - 1 && <ChevronRight className="size-4 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold">确认并发布</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 border shadow-none">
                <div className="text-xs text-muted-foreground">考核名称</div>
                <div className="font-medium mt-1">{name}</div>
              </Card>
              <Card className="p-4 border shadow-none">
                <div className="text-xs text-muted-foreground">考核周期</div>
                <div className="font-medium mt-1">{cycle}考核</div>
              </Card>
              <Card className="p-4 border shadow-none">
                <div className="text-xs text-muted-foreground">参评部门</div>
                <div className="font-medium mt-1">{selectedDeps.join("、") || "—"}</div>
              </Card>
              <Card className="p-4 border shadow-none">
                <div className="text-xs text-muted-foreground">考核指标</div>
                <div className="font-medium mt-1">{aiIndicators.length} 项 · 权重 {total}%</div>
              </Card>
            </div>
            <div className="p-4 rounded-xl bg-primary-soft/60 border border-primary/15 flex items-start gap-3">
              <Sparkles className="size-5 text-primary mt-0.5" />
              <div className="text-sm">
                <div className="font-medium">AI 预检通过</div>
                <div className="text-muted-foreground mt-1">指标权重合计 100%，流程节点完整，可发布。</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>上一步</Button>
        {step < 5 ? (
          <Button onClick={() => setStep((s) => s + 1)} className="gap-2">下一步 <ChevronRight className="size-4" /></Button>
        ) : (
          <Button
            className="gap-2"
            onClick={() => {
              toast.success("考核已发布，已通知 24 名参评人员");
              navigate("/performance");
            }}
          >
            <Send className="size-4" /> 立即发布
          </Button>
        )}
      </div>
    </div>
  );
}
