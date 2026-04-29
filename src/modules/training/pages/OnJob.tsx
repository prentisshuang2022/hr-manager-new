import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/modules/training/components/PageHeader";
import { SectionCard } from "@/modules/training/components/SectionCard";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Workflow, FolderArchive, ArrowRight,
  Plus, X, Trash2, Play, FileText, MessageSquare, Loader2,
  Video, BookOpen, ClipboardList, BellRing, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4;

type Material = "视频" | "操作手册" | "SOP" | "无";
type Node = {
  id: number;
  name: string;
  duration: string;
  owner: string;
  material: Material;
  needConfirm: boolean;
};

type Record = {
  time: string;
  who: string;
  type: "学习记录" | "实操记录" | "节点推进" | "汇总留存" | "学员确认" | "通知提醒";
  text: string;
  ai?: boolean;
};

const defaultNodes: Node[] = [
  { id: 1, name: "导师匹配 & 介绍", duration: "Day 1", owner: "HR", material: "无", needConfirm: false },
  { id: 2, name: "岗位手册学习", duration: "Day 1-3", owner: "员工", material: "操作手册", needConfirm: true },
  { id: 3, name: "业务系统实操", duration: "Day 4-7", owner: "导师", material: "SOP", needConfirm: true },
  { id: 4, name: "高管战略宣导（视频）", duration: "Day 10", owner: "员工", material: "视频", needConfirm: true },
  { id: 5, name: "阶段考核", duration: "Day 14", owner: "HR", material: "无", needConfirm: false },
];

const materialMeta: { [K in Material]: { icon: typeof Video; tone: string; label: string } } = {
  "视频": { icon: Video, tone: "bg-purple-soft text-purple", label: "视频材料（高管/宣导）" },
  "操作手册": { icon: BookOpen, tone: "bg-info-soft text-info", label: "操作手册" },
  "SOP": { icon: ClipboardList, tone: "bg-warning-soft text-warning", label: "SOP 标准流程" },
  "无": { icon: FileText, tone: "bg-muted text-muted-foreground", label: "无材料" },
};

export default function OnJob() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);

  // Step 1: nodes config
  const [nodes, setNodes] = useState<Node[]>(defaultNodes);
  const [trainee, setTrainee] = useState("李明轩");
  const [post, setPost] = useState("客服岗");

  // Step 2: progression
  const [currentNode, setCurrentNode] = useState(0);
  // 当前节点是否已收到学员确认
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  // Step 3: collected records
  const [records, setRecords] = useState<Record[]>([]);
  const [summarizing, setSummarizing] = useState(false);

  // Manual record input (Step 2)
  const [recordText, setRecordText] = useState("");
  const [recordType, setRecordType] = useState<Record["type"]>("学习记录");
  const [recordWho, setRecordWho] = useState<"员工" | "导师">("员工");

  const addManualRecord = () => {
    const text = recordText.trim();
    if (!text) {
      toast.error("请输入培训过程信息");
      return;
    }
    const who = recordWho === "员工" ? trainee : "导师";
    setRecords((r) => [
      { time: "刚刚", who, type: recordType, text },
      ...r,
    ]);
    setRecordText("");
    toast.success("已记录");
  };

  const addNode = () => {
    setNodes((ns) => [
      ...ns,
      { id: Date.now(), name: "新节点", duration: "Day -", owner: "导师", material: "操作手册", needConfirm: true },
    ]);
  };

  const removeNode = (id: number) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
  };

  const updateNode = (id: number, patch: Partial<Node>) => {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const startProgress = () => {
    if (nodes.length === 0) {
      toast.error("请先配置培训节点");
      return;
    }
    setCurrentNode(0);
    setRecords([]);
    setAwaitingConfirm(nodes[0].needConfirm);
    setStep(2);
    toast.success("AI 已开始按节点推进");
    if (nodes[0].needConfirm) {
      setRecords([{
        time: "刚刚",
        who: "AI 助手",
        type: "通知提醒",
        text: `已通知 ${trainee} 与导师启动「${nodes[0].name}」（${nodes[0].material}），等待学员确认接收`,
        ai: true,
      }]);
    }
  };

  const confirmByTrainee = () => {
    const node = nodes[currentNode];
    setRecords((r) => [
      {
        time: "刚刚",
        who: trainee,
        type: "学员确认",
        text: `已确认收到「${node.name}」的${node.material === "无" ? "通知" : node.material + "材料"}并开始学习`,
      },
      ...r,
    ]);
    setAwaitingConfirm(false);
    toast.success("学员已确认，可继续推进");
  };

  const remindTrainee = () => {
    setRecords((r) => [
      {
        time: "刚刚",
        who: "AI 助手",
        type: "通知提醒",
        text: `已二次提醒 ${trainee} 及导师关注「${nodes[currentNode].name}」节点`,
        ai: true,
      },
      ...r,
    ]);
    toast.info("已发送提醒");
  };

  const advanceNode = () => {
    const node = nodes[currentNode];
    if (node.needConfirm && awaitingConfirm) {
      toast.error("该节点需要学员确认后才能推进");
      return;
    }
    const newRecords: Record[] = [
      {
        time: "刚刚",
        who: trainee,
        type: currentNode === 0 ? "学习记录" : "实操记录",
        text: `完成「${node.name}」相关任务（${node.material}），用时 ${20 + currentNode * 15} 分钟`,
      },
      {
        time: "刚刚",
        who: "AI 助手",
        type: "节点推进",
        text:
          currentNode < nodes.length - 1
            ? `已自动推进 ${trainee} 进入「${nodes[currentNode + 1].name}」节点，并通知导师`
            : `${trainee} 已完成全部节点，进入汇总阶段`,
        ai: true,
      },
    ];
    setRecords((r) => [...newRecords, ...r]);

    if (currentNode < nodes.length - 1) {
      const nextIdx = currentNode + 1;
      setCurrentNode(nextIdx);
      setAwaitingConfirm(nodes[nextIdx].needConfirm);
      if (nodes[nextIdx].needConfirm) {
        setRecords((r) => [{
          time: "刚刚",
          who: "AI 助手",
          type: "通知提醒",
          text: `已通知 ${trainee} 与导师启动「${nodes[nextIdx].name}」（${nodes[nextIdx].material}），等待学员确认接收`,
          ai: true,
        }, ...r]);
      }
    } else {
      setStep(3);
      toast.success("全部节点已完成，请汇总留存");
    }
  };

  const summarize = () => {
    setSummarizing(true);
    toast.info("AI 正在汇总培训记录…");
    setTimeout(() => {
      setRecords((r) => [
        {
          time: "刚刚",
          who: "AI 助手",
          type: "汇总留存",
          text: `已汇总 ${trainee} 全部 ${nodes.length} 个节点的培训记录，归档至员工档案`,
          ai: true,
        },
        ...r,
      ]);
      setSummarizing(false);
      setStep(4);
      toast.success("已归档到员工档案");
    }, 1500);
  };

  const reset = () => {
    setStep(1);
    setNodes(defaultNodes);
    setCurrentNode(0);
    setAwaitingConfirm(false);
    setRecords([]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="在岗培训"
        subtitle="节点配置 · AI 推进 · 收集记录 · 汇总留存"
      />

      {/* Stepper */}
      <div className="flex items-center gap-3">
        {[
          { n: 1, label: "节点配置", icon: Workflow },
          { n: 2, label: "AI 节点推进", icon: Play },
          { n: 3, label: "收集培训记录", icon: MessageSquare },
          { n: 4, label: "汇总留存", icon: FolderArchive },
        ].map((s, i) => {
          const active = step === s.n;
          const done = step > s.n;
          return (
            <div key={s.n} className="flex items-center gap-3 flex-1">
              <div
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border flex-1 transition-colors ${
                  active
                    ? "border-primary bg-primary-soft"
                    : done
                    ? "border-success/40 bg-success-soft"
                    : "border-border bg-card"
                }`}
              >
                <div
                  className={`size-8 rounded-lg grid place-items-center text-sm font-semibold ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <CheckCircle2 className="size-4" /> : s.n}
                </div>
                <div className="flex-1">
                  <div
                    className={`text-sm font-medium ${
                      active ? "text-primary" : done ? "text-success" : "text-foreground"
                    }`}
                  >
                    {s.label}
                  </div>
                </div>
                <s.icon
                  className={`size-4 ${
                    active ? "text-primary" : done ? "text-success" : "text-muted-foreground"
                  }`}
                />
              </div>
              {i < 3 && <ArrowRight className="size-4 text-muted-foreground shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Node config */}
      {step === 1 && (
        <SectionCard
          title="配置培训节点"
          subtitle="为目标员工设定标准培训节点流程，AI 将按此推进"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs text-muted-foreground">培训员工</label>
              <input
                value={trainee}
                onChange={(e) => setTrainee(e.target.value)}
                className="mt-1.5 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">岗位</label>
              <select
                value={post}
                onChange={(e) => setPost(e.target.value)}
                className="mt-1.5 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option>客服岗</option>
                <option>销售岗</option>
                <option>技术岗</option>
                <option>财务岗</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {nodes.map((n, i) => (
              <div
                key={n.id}
                className="p-3 rounded-lg border border-border bg-card space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary-soft text-primary grid place-items-center text-sm font-semibold shrink-0">
                    {i + 1}
                  </div>
                  <input
                    value={n.name}
                    onChange={(e) => updateNode(n.id, { name: e.target.value })}
                    placeholder="节点名称"
                    className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                  <input
                    value={n.duration}
                    onChange={(e) => updateNode(n.id, { duration: e.target.value })}
                    placeholder="时长"
                    className="w-28 h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                  <select
                    value={n.owner}
                    onChange={(e) => updateNode(n.id, { owner: e.target.value })}
                    className="w-24 h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option>HR</option>
                    <option>导师</option>
                    <option>员工</option>
                    <option>经理</option>
                  </select>
                  <button
                    onClick={() => removeNode(n.id)}
                    className="size-8 rounded-md grid place-items-center text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3 pl-11">
                  <label className="text-xs text-muted-foreground shrink-0">材料类型</label>
                  <select
                    value={n.material}
                    onChange={(e) => updateNode(n.id, { material: e.target.value as Material })}
                    className="h-8 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-primary"
                  >
                    <option>视频</option>
                    <option>操作手册</option>
                    <option>SOP</option>
                    <option>无</option>
                  </select>
                  <label className="ml-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={n.needConfirm}
                      onChange={(e) => updateNode(n.id, { needConfirm: e.target.checked })}
                      className="size-3.5 accent-primary"
                    />
                    需学员确认（避免漏通知）
                  </label>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" onClick={addNode} className="mt-3">
            <Plus className="size-4 mr-1.5" />添加节点
          </Button>

          <div className="mt-6 flex justify-end">
            <Button onClick={startProgress} className="bg-primary hover:bg-primary/90">
              启动 AI 节点推进<ArrowRight className="size-4 ml-1.5" />
            </Button>
          </div>
        </SectionCard>
      )}

      {/* Step 2: Progression */}
      {step === 2 && (
        <>
          <SectionCard
            title={`节点推进中 · ${trainee}（${post}）`}
            subtitle={`当前节点 ${currentNode + 1} / ${nodes.length}`}
            actions={
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-info-soft text-info">
                <span className="size-1.5 rounded-full bg-info animate-pulse" />AI 推进中
              </span>
            }
          >
            <div className="overflow-x-auto">
              <div className="flex items-start gap-3 min-w-max pb-2">
                {nodes.map((n, i) => {
                  const status = i < currentNode ? "done" : i === currentNode ? "doing" : "todo";
                  return (
                    <div key={n.id} className="flex items-start gap-3">
                      <div className="w-44">
                        <div
                          className={`size-10 rounded-full grid place-items-center font-semibold ${
                            status === "done"
                              ? "bg-success text-success-foreground"
                              : status === "doing"
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {status === "done" ? <CheckCircle2 className="size-5" /> : i + 1}
                        </div>
                        <div className="mt-3">
                          <div className="text-sm font-semibold text-foreground">{n.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {n.duration} · {n.owner}
                          </div>
                          <div className="flex flex-wrap items-center gap-1 mt-2">
                          <span
                            className={`inline-flex mt-2 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                              status === "done"
                                ? "bg-success-soft text-success"
                                : status === "doing"
                                ? "bg-primary-soft text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {status === "done"
                              ? "已完成"
                              : status === "doing"
                              ? (awaitingConfirm && n.needConfirm ? "待学员确认" : "进行中")
                              : "待开始"}
                          </span>
                          {n.material !== "无" && (() => {
                            const M = materialMeta[n.material];
                            return (
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium ${M.tone}`}>
                                <M.icon className="size-3" />{n.material}
                              </span>
                            );
                          })()}
                          {n.needConfirm && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-warning-soft text-warning">
                              <ShieldCheck className="size-3" />需确认
                            </span>
                          )}
                          </div>
                        </div>
                      </div>
                      {i < nodes.length - 1 && (
                        <div
                          className={`mt-5 h-0.5 w-8 ${
                            i < currentNode ? "bg-success" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {nodes[currentNode]?.needConfirm && awaitingConfirm && (
              <div className="mt-5 rounded-xl border border-warning/40 bg-warning-soft/40 p-4 flex items-start gap-3">
                <div className="size-9 rounded-lg bg-warning/15 text-warning grid place-items-center shrink-0">
                  <BellRing className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">
                    等待 {trainee} 确认接收「{nodes[currentNode].name}」
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    材料：{materialMeta[nodes[currentNode].material].label}。学员未确认前不会推进下一节点，避免导师漏通知。
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={remindTrainee}>
                    <BellRing className="size-3.5 mr-1" />二次提醒
                  </Button>
                  <Button size="sm" onClick={confirmByTrainee} className="bg-warning text-warning-foreground hover:bg-warning/90">
                    <CheckCircle2 className="size-3.5 mr-1" />学员确认
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>返回配置</Button>
              <Button
                onClick={advanceNode}
                disabled={nodes[currentNode]?.needConfirm && awaitingConfirm}
                className="bg-primary hover:bg-primary/90"
              >
                {currentNode < nodes.length - 1
                  ? "完成当前节点，推进下一个"
                  : "完成最后节点"}
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            title="录入培训过程信息"
            subtitle="员工 / 导师可随时补充培训记录，AI 将自动归集"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-muted-foreground">提交人</label>
                <select
                  value={recordWho}
                  onChange={(e) => setRecordWho(e.target.value as "员工" | "导师")}
                  className="mt-1.5 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="员工">员工（{trainee}）</option>
                  <option value="导师">导师</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">记录类型</label>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value as Record["type"])}
                  className="mt-1.5 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="学习记录">学习记录</option>
                  <option value="实操记录">实操记录</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">关联节点</label>
                <input
                  readOnly
                  value={nodes[currentNode]?.name ?? ""}
                  className="mt-1.5 w-full h-10 rounded-lg border border-border bg-muted/40 px-3 text-sm text-muted-foreground"
                />
              </div>
            </div>
            <textarea
              value={recordText}
              onChange={(e) => setRecordText(e.target.value)}
              placeholder="例如：完成《CRM 系统操作手册》第 3 章，遇到的问题及解决方式…"
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={addManualRecord} className="bg-primary hover:bg-primary/90">
                <Plus className="size-4 mr-1.5" />提交记录
              </Button>
            </div>
          </SectionCard>

          {records.length > 0 && (
            <SectionCard
              title="已收集的培训记录"
              subtitle="员工 / 导师录入与 AI 自动采集汇总"
            >
              <RecordList records={records} />
            </SectionCard>
          )}
        </>
      )}

      {/* Step 3: All records collected */}
      {step === 3 && (
        <SectionCard
          title="培训记录已收集"
          subtitle={`共采集 ${records.length} 条记录，可一键汇总至员工档案`}
        >
          <RecordList records={records} />
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>返回查看</Button>
            <Button
              onClick={summarize}
              disabled={summarizing}
              className="bg-primary hover:bg-primary/90"
            >
              {summarizing ? (
                <><Loader2 className="size-4 mr-1.5 animate-spin" />AI 汇总中…</>
              ) : (
                <><FolderArchive className="size-4 mr-1.5" />汇总并留存到档案</>
              )}
            </Button>
          </div>
        </SectionCard>
      )}

      {/* Step 4: Archived */}
      {step === 4 && (
        <SectionCard title="已汇总留存" subtitle="培训档案已归入员工成长记录">
          <div className="rounded-xl border border-border bg-gradient-soft p-6">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-success-soft grid place-items-center">
                <FolderArchive className="size-6 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold text-foreground">
                  {trainee} · {post} 在岗培训档案
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  共 {nodes.length} 个节点 · {records.length} 条培训记录 · 已永久归档
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <Mini label="完成节点" value={`${nodes.length}`} unit="个" />
                  <Mini label="培训天数" value="14" unit="天" />
                  <Mini label="记录条数" value={`${records.length}`} unit="条" />
                  <Mini label="档案状态" value="已归档" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <FileText className="size-4 text-muted-foreground" />培训记录回顾
            </div>
            <RecordList records={records} />
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={reset}>新建培训计划</Button>
            <Button
              onClick={() => navigate("/training/records")}
              className="bg-primary hover:bg-primary/90"
            >
              查看员工档案<ArrowRight className="size-4 ml-1.5" />
            </Button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function RecordList({ records }: { records: Record[] }) {
  return (
    <ul className="space-y-4">
      {records.map((r, i) => (
        <li key={i} className="relative pl-5">
          <span
            className={`absolute left-0 top-1.5 size-2 rounded-full ${
              r.ai ? "bg-primary" : "bg-muted-foreground"
            }`}
          />
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-foreground">{r.who}</span>
            <span className="text-muted-foreground">{r.time}</span>
            <span
              className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium ${
                r.ai ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {r.type}
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground/80 leading-snug">{r.text}</p>
        </li>
      ))}
    </ul>
  );
}

function Mini({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-lg bg-card border border-border px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold text-foreground mt-0.5">
        {value}
        {unit && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}
