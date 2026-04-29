import { useState } from "react";
import { PageHeader } from "@/modules/performance/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/modules/performance/components/common/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, BellRing, ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, Clock, Search, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const nodes = [
  { name: "员工自评", state: "done", who: "本人", date: "04-08" },
  { name: "上级评分", state: "current", who: "张经理", date: "进行中" },
];

type TaskBucket = "overdue" | "today" | "soon" | "later";
const myTasks: { id: number; name: string; node: string; due: string; overdue: boolean; bucket: TaskBucket }[] = [
  { id: 1, name: "林峰 · 市场专员", node: "上级评分", due: "今日到期", overdue: false, bucket: "today" },
  { id: 2, name: "潘伟 · 物业主管", node: "上级评分", due: "已逾期 1 天", overdue: true, bucket: "overdue" },
  { id: 3, name: "袁帅 · 财务", node: "上级评分", due: "还剩 2 天", overdue: false, bucket: "soon" },
  { id: 4, name: "赵磊 · 品质管理部", node: "上级评分", due: "还剩 3 天", overdue: false, bucket: "soon" },
  { id: 5, name: "邵华 · 生产主管", node: "上级评分", due: "已逾期 2 天", overdue: true, bucket: "overdue" },
  { id: 6, name: "王芳 · 人事专员", node: "上级评分", due: "今日到期", overdue: false, bucket: "today" },
  { id: 7, name: "李明 · 销售经理", node: "上级评分", due: "已逾期 3 天", overdue: true, bucket: "overdue" },
  { id: 8, name: "周琳 · 客服主管", node: "上级评分", due: "还剩 1 天", overdue: false, bucket: "soon" },
  { id: 9, name: "陈昊 · 仓储专员", node: "上级评分", due: "还剩 5 天", overdue: false, bucket: "later" },
  { id: 10, name: "吴敏 · 运营专员", node: "上级评分", due: "还剩 4 天", overdue: false, bucket: "soon" },
  { id: 11, name: "孙磊 · 工艺工程师", node: "上级评分", due: "还剩 6 天", overdue: false, bucket: "later" },
  { id: 12, name: "杨柳 · 品牌策划", node: "上级评分", due: "还剩 7 天", overdue: false, bucket: "later" },
  { id: 13, name: "高峰 · 区域经理", node: "上级评分", due: "已逾期 1 天", overdue: true, bucket: "overdue" },
  { id: 14, name: "黄丽 · 招聘专员", node: "上级评分", due: "今日到期", overdue: false, bucket: "today" },
  { id: 15, name: "徐涛 · 设备维护", node: "上级评分", due: "还剩 8 天", overdue: false, bucket: "later" },
  { id: 16, name: "马超 · 采购专员", node: "上级评分", due: "还剩 2 天", overdue: false, bucket: "soon" },
  { id: 17, name: "朱丹 · 财务核算", node: "上级评分", due: "已逾期 2 天", overdue: true, bucket: "overdue" },
  { id: 18, name: "胡军 · 安全主管", node: "上级评分", due: "还剩 9 天", overdue: false, bucket: "later" },
];

const indicators = [
  { name: "销售目标达成率", weight: 30, self: 90, leader: 0 },
  { name: "新客户开发数量", weight: 25, self: 85, leader: 0 },
  { name: "客户满意度", weight: 20, self: 88, leader: 0 },
  { name: "团队协作能力", weight: 15, self: 92, leader: 0 },
  { name: "工作主动性", weight: 10, self: 90, leader: 0 },
];

export default function Performance() {
  const [scores, setScores] = useState<Record<number, number>>({});
  const [comment, setComment] = useState("");
  const [activeTask, setActiveTask] = useState(myTasks[0]);
  const [tab, setTab] = useState("leader");
  const [taskQuery, setTaskQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | TaskBucket>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const counts = {
    all: myTasks.length,
    overdue: myTasks.filter((t) => t.bucket === "overdue").length,
    today: myTasks.filter((t) => t.bucket === "today").length,
    soon: myTasks.filter((t) => t.bucket === "soon").length,
    later: myTasks.filter((t) => t.bucket === "later").length,
  };

  const filteredTasks = myTasks.filter((t) => {
    if (taskFilter !== "all" && t.bucket !== taskFilter) return false;
    if (taskQuery.trim() && !t.name.toLowerCase().includes(taskQuery.trim().toLowerCase())) return false;
    return true;
  });

  const allVisibleSelected = filteredTasks.length > 0 && filteredTasks.every((t) => selected.has(t.id));
  const toggleOne = (id: number) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAllVisible = () => {
    setSelected((s) => {
      const n = new Set(s);
      if (allVisibleSelected) filteredTasks.forEach((t) => n.delete(t.id));
      else filteredTasks.forEach((t) => n.add(t.id));
      return n;
    });
  };
  const bulkRemind = () => {
    if (!selected.size) return toast.error("请先勾选待办");
    toast.success(`已对 ${selected.size} 项待办批量催办`);
    setSelected(new Set());
  };

  const goScore = (t: typeof myTasks[number]) => {
    setActiveTask(t);
    setTab("leader");
    setScores({});
    setComment("");
    toast.success(`已切换到 ${t.name} 的评分面板`);
    setTimeout(() => {
      document.getElementById("score-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const setScore = (idx: number, v: number) => {
    if (v < 0 || v > 100) {
      toast.error("分数必须在 0-100 之间");
      return;
    }
    setScores((s) => ({ ...s, [idx]: v }));
  };

  const total = indicators.reduce((acc, ind, i) => acc + ((scores[i] ?? 0) * ind.weight) / 100, 0);
  const coefficient = total ? (total / 100 * 1.2).toFixed(2) : "—";

  const submit = () => {
    if (Object.keys(scores).length < indicators.length) {
      toast.error("请完成全部指标评分后再提交");
      return;
    }
    toast.success(`已提交评分，绩效系数 ${coefficient} 已推送至薪酬模块`);
  };

  const remind = (name: string) => toast.success(`已向 ${name} 责任人发送催办提醒`);

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="员工绩效管理"
        subtitle="2025 Q1 季度考核 · 市场营销部 · 当前节点：上级评分"
        actions={
          <>
            <Button variant="outline" className="gap-2" onClick={() => toast.success("已对全部逾期节点发起批量催办")}>
              <BellRing className="size-4" />批量催办
            </Button>
            <Button className="gap-2"><ShieldCheck className="size-4" />汇总分数</Button>
          </>
        }
      />

      {/* 流程节点 */}
      <Card className="p-6 shadow-none border mb-6">
        <div className="text-sm font-medium mb-4">考核流程进度</div>
        <div className="flex items-center">
          {nodes.map((n, i) => (
            <div key={n.name} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`size-11 rounded-full grid place-items-center ${
                    n.state === "done" ? "bg-success text-success-foreground"
                    : n.state === "current" ? "bg-primary text-primary-foreground ring-4 ring-primary-soft"
                    : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {n.state === "done" ? <CheckCircle2 className="size-5" />
                    : n.state === "current" ? <Clock className="size-5" />
                    : <span className="text-sm">{i + 1}</span>}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">{n.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{n.who} · {n.date}</div>
                </div>
              </div>
              {i < nodes.length - 1 && (
                <div className={`flex-1 h-px mx-3 mb-7 ${n.state === "done" ? "bg-success" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* 待办列表 */}
        <Card className="col-span-1 shadow-none border overflow-hidden h-fit flex flex-col">
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">我的待办评分</h3>
                <span className="text-xs text-muted-foreground">共 {counts.all} 项</span>
              </div>
              <StatusBadge tone="warning">{counts.overdue} 项逾期</StatusBadge>
            </div>

            <div className="relative">
              <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索员工 / 岗位"
                value={taskQuery}
                onChange={(e) => setTaskQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {([
                ["all", "全部", counts.all],
                ["overdue", "逾期", counts.overdue],
                ["today", "今日", counts.today],
                ["soon", "即将", counts.soon],
                ["later", "未来", counts.later],
              ] as const).map(([key, label, n]) => (
                <button
                  key={key}
                  onClick={() => setTaskFilter(key as "all" | TaskBucket)}
                  className={`px-2.5 h-7 rounded-full text-xs border transition-colors ${
                    taskFilter === key
                      ? "bg-primary text-primary-foreground border-primary"
                      : key === "overdue" && n > 0
                      ? "border-warning/40 text-warning hover:bg-warning-soft/40"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {label} <span className="opacity-70">{n}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 批量操作栏 */}
          <div className="px-4 py-2 border-b bg-secondary/30 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={toggleAllVisible}
              />
              <span className="text-muted-foreground">
                {selected.size > 0 ? `已选 ${selected.size} 项` : "全选当前"}
              </span>
            </label>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs gap-1 disabled:opacity-40"
              disabled={!selected.size}
              onClick={bulkRemind}
            >
              <ListChecks className="size-3.5" />批量催办
            </Button>
          </div>

          <div className="divide-y max-h-[520px] overflow-y-auto">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">没有符合条件的待办</div>
            ) : (
              filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-3 pl-4 transition-colors ${activeTask.id === t.id ? "bg-primary-soft/40" : "hover:bg-secondary/40"}`}
                >
                  <div className="flex items-start gap-2.5">
                    <Checkbox
                      checked={selected.has(t.id)}
                      onCheckedChange={() => toggleOne(t.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{t.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{t.node}</div>
                        </div>
                        {t.overdue && <AlertTriangle className="size-4 text-warning shrink-0" />}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${t.overdue ? "text-destructive" : "text-muted-foreground"}`}>{t.due}</span>
                        <div className="flex gap-1">
                          {t.overdue && (
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => remind(t.name)}>
                              催办
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary" onClick={() => goScore(t)}>
                            去评分 <ArrowRight className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* 评分面板 */}
        <Card id="score-panel" className="col-span-2 shadow-none border">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="px-6 pt-5 border-b">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-base font-semibold">{activeTask.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">当前节点：{activeTask.node} · {activeTask.due}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">当前合计得分</div>
                  <div className="text-2xl font-semibold text-primary">{total ? total.toFixed(1) : "—"}</div>
                </div>
              </div>
              <TabsList className="bg-transparent p-0 h-auto gap-4 border-b-0">
                <TabsTrigger value="self" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-1 pb-3">员工自评</TabsTrigger>
                <TabsTrigger value="leader" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-1 pb-3">上级评分</TabsTrigger>
                <TabsTrigger value="ai" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-1 pb-3 gap-1">
                  <Sparkles className="size-3.5" />AI 评估
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="self" className="p-6 m-0">
              <div className="space-y-3">
                {indicators.map((ind, i) => (
                  <div key={ind.name} className="p-4 rounded-xl border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{ind.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">权重 {ind.weight}%</div>
                      </div>
                      <div className="text-2xl font-semibold text-foreground">{ind.self}</div>
                    </div>
                    <Progress value={ind.self} className="h-1.5 mt-3" />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="leader" className="p-6 m-0">
              <div className="space-y-3">
                {indicators.map((ind, i) => (
                  <div key={ind.name} className="p-4 rounded-xl border">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{ind.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">权重 {ind.weight}% · 自评 {ind.self} 分</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="0-100"
                          className="w-24 text-center"
                          value={scores[i] ?? ""}
                          onChange={(e) => setScore(i, Number(e.target.value))}
                        />
                        <span className="text-xs text-muted-foreground">分</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="space-y-2 pt-2">
                  <div className="text-sm font-medium">评语</div>
                  <Textarea rows={3} placeholder="给员工本季度的整体评语..." value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>

                <div className="p-4 rounded-xl bg-success-soft/60 border border-success/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="size-5 text-success" />
                    <div className="text-sm">
                      <div className="font-medium">分数自动校验：通过</div>
                      <div className="text-xs text-muted-foreground mt-0.5">权重合计 100% · 各项均在 0-100 区间</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">绩效系数</div>
                    <div className="text-xl font-semibold text-success">{coefficient}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline">暂存</Button>
                  <Button onClick={submit} className="gap-2">提交评分 <ArrowRight className="size-4" /></Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="p-6 m-0 space-y-4">
              <div className="p-4 rounded-xl bg-primary-soft/50 border border-primary/15">
                <div className="flex items-start gap-3">
                  <Sparkles className="size-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">AI 综合评估参考</div>
                    <div className="text-muted-foreground mt-2 leading-relaxed">
                      该员工本季度核心销售目标完成率 <b className="text-foreground">112%</b>，超额达成；客户满意度位列部门 <b className="text-foreground">前 20%</b>；建议上级评分区间 <b className="text-foreground">86 - 92 分</b>，绩效等级 B+。注意：新客户开发数量同比下降 8%，可在评语中给出针对性辅导建议。
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-4 border shadow-none">
                  <div className="text-xs text-muted-foreground">AI 推荐总分</div>
                  <div className="text-2xl font-semibold mt-1 text-primary">88.5</div>
                </Card>
                <Card className="p-4 border shadow-none">
                  <div className="text-xs text-muted-foreground">绩效等级</div>
                  <div className="text-2xl font-semibold mt-1">B+</div>
                </Card>
                <Card className="p-4 border shadow-none">
                  <div className="text-xs text-muted-foreground">推荐绩效系数</div>
                  <div className="text-2xl font-semibold mt-1 text-success">1.06</div>
                </Card>
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={() => toast.success("已采纳 AI 推荐分数")}>
                <Sparkles className="size-4 text-primary" />一键采纳到上级评分
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
