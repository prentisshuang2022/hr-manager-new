import { AppShell } from "@/shared/AppShell";
import { jobs, candidates, type Candidate, type CandidateStatus } from "@/modules/recruitment/data/recruit";
import { Button } from "@/components/ui/button";
import {
  Upload, Sparkles, Search, SlidersHorizontal, LayoutGrid, List,
  Building2, GraduationCap, ArrowRight, Phone, X, CheckCircle2, AlertCircle, Tag, FolderInput, Download,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

// ===== helpers =====
const matchColor = (m: number) =>
  m >= 85 ? "hsl(var(--success))" : m >= 75 ? "hsl(var(--primary))" : m >= 65 ? "hsl(var(--warning))" : "hsl(var(--muted-foreground))";
const matchLabel = (m: number) => (m >= 85 ? "极高" : m >= 75 ? "高" : m >= 65 ? "一般" : "偏低");

const statusToneClass: Record<CandidateStatus, string> = {
  待复筛: "bg-secondary text-muted-foreground border-border",
  待沟通: "bg-info-soft text-info border-info/20",
  待面试: "bg-warning-soft text-warning border-warning/20",
  已入库: "bg-success-soft text-success border-success/20",
  已淘汰: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_OPTIONS: (CandidateStatus | "全部")[] = ["全部", "待复筛", "待沟通", "待面试", "已入库", "已淘汰"];

// AI insight derived from highlights/risks
const aiInsight = (c: Candidate, jobTitle: string) =>
  c.matchScore >= 85
    ? `与「${jobTitle}」高度匹配，建议优先安排面试`
    : c.matchScore >= 75
    ? `与「${jobTitle}」基本匹配，建议进一步沟通确认`
    : `与「${jobTitle}」匹配度一般，可作为备选`;

// ===== Match ring (SVG, themed) =====
const MatchRing = ({ value, size = 48 }: { value: number; size?: number }) => {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = matchColor(value);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--secondary))" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[13px] font-bold tabular-nums"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
};

const ResumeLibrary = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | "全部">("全部");
  const [showAdv, setShowAdv] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [quick, setQuick] = useState<string | null>(null);

  const handleUpload = (files: FileList | null) => {
    if (!files || !files.length) return;
    toast.success(`已上传 ${files.length} 份简历，AI 正在解析...`, {
      description: "解析完成后将自动入库并生成候选人卡片",
    });
  };

  const jobMap = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, j])), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter((c) => {
      if (statusFilter !== "全部" && c.status !== statusFilter) return false;
      if (quick === "high" && c.matchScore < 80) return false;
      if (quick === "ai" && !c.source.includes("AI")) return false;
      if (!q) return true;
      const blob = `${c.name}${c.currentCompany}${c.currentTitle}${c.education}${c.skills.join(" ")}${c.city}`.toLowerCase();
      return blob.includes(q);
    });
  }, [search, statusFilter, quick]);

  const statusCount = (s: CandidateStatus | "全部") =>
    s === "全部" ? candidates.length : candidates.filter((c) => c.status === s).length;

  const toggleSel = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const openCandidate = candidates.find((c) => c.id === openId) || null;

  return (
    <AppShell breadcrumbs={[{ label: "招聘管理" }, { label: "简历库" }]}>
      {/* ============== HERO ============== */}
      <section
        className="relative overflow-hidden rounded-2xl text-primary-foreground p-7 mb-6"
        style={{
          background:
            "radial-gradient(1200px 400px at 80% -10%, hsl(var(--purple) / 0.55), transparent 60%), linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 45%, hsl(var(--purple)) 100%)",
        }}
      >
        <div className="relative z-10 flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              AI 智能简历库
            </div>
            <h1 className="text-[28px] font-bold tracking-tight mb-1.5">人才池 · 全量简历资产</h1>
            <p className="text-white/85 text-sm">
              共 <span className="font-semibold tabular-nums">{candidates.length}</span> 份简历 · AI 已自动解析{" "}
              <span className="font-semibold tabular-nums">{candidates.length}</span> 份 · 待匹配岗位{" "}
              <span className="font-semibold tabular-nums">{candidates.filter((c) => c.status === "待沟通" || c.status === "待复筛").length}</span> 人
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="px-4 h-10 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur border border-white/25 text-sm font-medium flex items-center gap-2 transition"
            >
              <Upload className="w-4 h-4" /> 上传简历
            </button>
            <button className="px-4 h-10 rounded-lg bg-white text-primary hover:bg-white/90 text-sm font-semibold flex items-center gap-2 shadow-sm transition">
              <Sparkles className="w-4 h-4" /> AI 智能匹配岗位
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/15 rounded-xl overflow-hidden backdrop-blur-sm">
          {[
            { l: "全量简历", v: candidates.length },
            { l: "本周新增", v: `+${candidates.filter(c => c.uploadedAt >= "2025-04-15").length}` },
            { l: "在招岗位匹配中", v: candidates.filter(c => c.status !== "已淘汰").length },
            { l: "高匹配 (≥85)", v: candidates.filter(c => c.matchScore >= 85).length },
          ].map((s) => (
            <div key={s.l} className="bg-white/10 px-5 py-3.5">
              <div className="text-xs text-white/75">{s.l}</div>
              <div className="text-[22px] font-bold mt-0.5 tabular-nums">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============== SEARCH + FILTERS ============== */}
      <section className="bg-card rounded-2xl border border-border p-5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索姓名、技能、公司、学校(支持 React、字节跳动、华科 等)"
              className="h-11 pl-10 pr-32 rounded-xl"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs text-primary bg-primary-soft rounded-md hover:bg-primary-soft/70 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI 自然语言搜索
            </button>
          </div>
          <button
            onClick={() => setShowAdv((v) => !v)}
            className="h-11 px-4 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-sm flex items-center gap-1.5 text-muted-foreground transition"
          >
            <SlidersHorizontal className="w-4 h-4" /> 高级筛选
            <span className="ml-1 px-1.5 rounded bg-primary-soft text-primary text-[11px]">3</span>
          </button>
        </div>

        {/* quick filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1">快捷筛选</span>
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_OPTIONS.map((s) => {
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition flex items-center gap-1 ${
                    active
                      ? "bg-primary-soft border-primary/30 text-primary font-medium"
                      : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  {s} <span className="tabular-nums opacity-60">{statusCount(s)}</span>
                </button>
              );
            })}
          </div>
          <div className="w-px h-5 bg-border mx-1" />
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { k: "high", label: "在招岗位匹配 ≥80" },
              { k: "week", label: "本周新增" },
              { k: "ai", label: "AI 已解析" },
              { k: "uncontacted", label: "未联系" },
            ].map((c) => (
              <button
                key={c.k}
                onClick={() => setQuick(quick === c.k ? null : c.k)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                  quick === c.k
                    ? "bg-primary-soft border-primary/30 text-primary font-medium"
                    : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {showAdv && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: "岗位匹配", opts: ["全部岗位", ...jobs.map(j => j.title)] },
              { l: "经验年限", opts: ["不限", "1-3 年", "3-5 年", "5-10 年", "10 年以上"] },
              { l: "学历", opts: ["不限", "本科", "硕士", "博士"] },
              { l: "期望地点", opts: ["不限", "武汉", "上海", "深圳", "北京"] },
              { l: "来源", opts: ["全部", "Boss 直聘", "拉勾网", "猎聘", "AI 识别", "内推"] },
              { l: "入库时间", opts: ["近一周", "近一月", "近三月", "不限"] },
            ].map((f) => (
              <div key={f.l}>
                <label className="text-xs text-muted-foreground">{f.l}</label>
                <select className="mt-1 w-full h-9 rounded-lg border border-border bg-background text-sm px-2 focus:outline-none focus:border-primary/40">
                  {f.opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="text-xs text-muted-foreground">技能标签</label>
              <Input className="mt-1 h-9 text-sm" placeholder="React、Node.js..." />
            </div>
            <div className="flex items-end gap-2">
              <Button className="h-9 flex-1" size="sm">应用筛选</Button>
              <Button variant="outline" size="sm" className="h-9" onClick={() => { setQuick(null); setStatusFilter("全部"); setSearch(""); }}>重置</Button>
            </div>
          </div>
        )}
      </section>

      {/* ============== TOOLBAR ============== */}
      <section className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>共 <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span> 条简历</span>
          <span className="text-border">·</span>
          <span>已选 <span className="font-semibold text-primary tabular-nums">{selected.length}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-1">排序</span>
          <select className="h-8 rounded-lg border border-border bg-background text-sm px-2 focus:outline-none focus:border-primary/40">
            <option>AI 匹配度</option><option>入库时间</option><option>经验年限</option>
          </select>
          <div className="w-px h-5 bg-border mx-1" />
          <button onClick={() => setView("grid")} className={`h-8 px-2.5 rounded-lg border text-sm transition ${view === "grid" ? "bg-primary-soft border-primary/30 text-primary" : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView("list")} className={`h-8 px-2.5 rounded-lg border text-sm transition ${view === "list" ? "bg-primary-soft border-primary/30 text-primary" : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ============== CANDIDATE GRID ============== */}
      <section className={`pb-32 ${view === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-3"}`}>
        {filtered.map((c) => {
          const job = jobMap[c.jobId];
          const isSel = selected.includes(c.id);
          const ringColor = matchColor(c.matchScore);
          return (
            <article
              key={c.id}
              onClick={() => setOpenId(c.id)}
              className="group bg-card rounded-2xl border border-border p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start gap-3">
                <div onClick={(e) => e.stopPropagation()} className="mt-1.5">
                  <Checkbox checked={isSel} onCheckedChange={() => toggleSel(c.id)} />
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary font-bold text-base flex items-center justify-center shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-[15px] text-foreground">{c.name}</h3>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded border ${statusToneClass[c.status]}`}>{c.status}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">{c.id}</span>
                  </div>
                  <div className="text-[12.5px] text-muted-foreground mt-0.5">
                    {c.gender} · {c.age}岁 · {c.city} · <span className="tabular-nums">{c.yearsExp}</span>年经验
                  </div>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <MatchRing value={c.matchScore} />
                  <div className="text-[10px] text-muted-foreground mt-0.5">匹配度</div>
                </div>
              </div>

              {/* AI matched job */}
              <div className="mt-3 px-3 py-2 rounded-lg bg-primary-soft/60 border border-primary/15 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" style={{ color: "hsl(var(--purple))" }} />
                <span className="text-xs text-foreground flex-1 truncate">
                  AI 推荐匹配：<span className="font-semibold text-primary">{job?.title || "—"}</span>
                </span>
                <span className="text-[10px] text-muted-foreground" style={{ color: ringColor }}>
                  {matchLabel(c.matchScore)}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-y-1.5 text-[12.5px] text-muted-foreground">
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{c.currentTitle} <span className="opacity-60">@</span> {c.currentCompany}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{c.education}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.skills.slice(0, 5).map((s) => (
                  <span key={s} className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">{s}</span>
                ))}
                {c.skills.length > 5 && <span className="text-[11px] text-muted-foreground self-center">+{c.skills.length - 5}</span>}
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  {c.source.includes("AI") && <Sparkles className="w-3 h-3" style={{ color: "hsl(var(--purple))" }} />}
                  <span>{c.source}</span>
                  <span className="opacity-50">·</span>
                  <span className="tabular-nums">{c.uploadedAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); toast.success(`已推荐 ${c.name} 至匹配岗位`); }} className="p-1 rounded hover:bg-primary-soft hover:text-primary transition" title="一键推荐至岗位">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-primary font-medium group-hover:translate-x-0.5 transition">查看详情 →</span>
                </div>
              </div>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full p-16 text-center text-muted-foreground text-sm bg-card rounded-2xl border border-border">
            没有匹配的简历，调整筛选条件试试
          </div>
        )}
      </section>

      {/* ============== BATCH ACTION BAR ============== */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 md:left-[var(--sidebar-width,16rem)] right-0 bg-card border-t border-border shadow-[0_-8px_24px_-12px_hsl(var(--foreground)/0.18)] z-30">
          <div className="max-w-[1320px] mx-auto px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">已选 <span className="font-bold text-primary tabular-nums">{selected.length}</span> 位候选人</span>
              <button onClick={() => setSelected([])} className="text-muted-foreground hover:text-foreground text-xs">清空</button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9"><Tag className="w-4 h-4 mr-1.5" /> 加标签</Button>
              <Button variant="outline" size="sm" className="h-9" asChild>
                <Link to="/recruitment/ledger"><FolderInput className="w-4 h-4 mr-1.5" /> 转至台账</Link>
              </Button>
              <Button variant="outline" size="sm" className="h-9"><Download className="w-4 h-4 mr-1.5" /> 导出</Button>
              <Button
                size="sm"
                className="h-9"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple)))" }}
                onClick={() => { toast.success(`已推荐 ${selected.length} 位候选人至匹配岗位`); setSelected([]); }}
              >
                <Sparkles className="w-4 h-4 mr-1.5" /> 一键推荐至岗位
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============== DRAWER ============== */}
      <Sheet open={!!openCandidate} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-[560px] p-0 overflow-y-auto">
          {openCandidate && (() => {
            const c = openCandidate;
            const job = jobMap[c.jobId];
            return (
              <>
                <div
                  className="relative text-primary-foreground p-6 pb-10"
                  style={{
                    background:
                      "radial-gradient(800px 300px at 80% -10%, hsl(var(--purple) / 0.55), transparent 60%), linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)) 50%, hsl(var(--purple)))",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur text-white font-bold text-xl flex items-center justify-center">
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-[22px] font-bold">{c.name}</h2>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-white/20 backdrop-blur">{c.status}</span>
                        </div>
                        <div className="text-white/85 text-[13px] mt-1 tabular-nums">{c.id}</div>
                        <div className="text-white/85 text-[13px]">{c.gender} · {c.age}岁 · {c.yearsExp}年经验 · {c.city}</div>
                      </div>
                    </div>
                    <button onClick={() => setOpenId(null)} className="p-1.5 hover:bg-white/15 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <MatchRing value={c.matchScore} size={56} />
                    <div>
                      <div className="text-[11px] text-white/75">JD 匹配度</div>
                      <div className="text-sm font-semibold">{job?.title}</div>
                    </div>
                  </div>
                </div>

                {/* AI insight */}
                <div className="mx-6 -mt-5 relative z-10 rounded-xl bg-card border border-primary/15 p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg text-white flex items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple)))" }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-primary mb-0.5">AI 解析建议</div>
                      <p className="text-[13px] text-foreground leading-relaxed">{aiInsight(c, job?.title || "目标岗位")}</p>
                    </div>
                  </div>
                </div>

                {/* highlights / risks */}
                <div className="px-6 mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-success/20 bg-success-soft/40 p-3.5">
                    <div className="flex items-center gap-1.5 text-success text-[12.5px] font-semibold mb-2">
                      <CheckCircle2 className="w-4 h-4" /> 亮点 <span className="tabular-nums">{c.highlights.length}</span>
                    </div>
                    <ul className="space-y-1.5 text-[12.5px] text-foreground">
                      {c.highlights.map((h) => (
                        <li key={h} className="flex gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-warning/20 bg-warning-soft/40 p-3.5">
                    <div className="flex items-center gap-1.5 text-warning text-[12.5px] font-semibold mb-2">
                      <AlertCircle className="w-4 h-4" /> 风险点 <span className="tabular-nums">{c.risks.length}</span>
                    </div>
                    <ul className="space-y-1.5 text-[12.5px] text-foreground">
                      {c.risks.length ? c.risks.map((r) => (
                        <li key={r} className="flex gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      )) : <li className="text-muted-foreground text-xs">暂无</li>}
                    </ul>
                  </div>
                </div>

                {/* skills */}
                <div className="px-6 mt-5">
                  <div className="text-[12.5px] font-semibold text-muted-foreground mb-2">技能标签</div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.skills.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-md bg-primary-soft text-primary">{s}</span>
                    ))}
                  </div>
                </div>

                {/* basic info */}
                <div className="px-6 mt-5">
                  <div className="text-[12.5px] font-semibold text-muted-foreground mb-2">基本信息</div>
                  <div className="rounded-xl border border-border divide-y divide-border text-[13px]">
                    {[
                      ["现任职位", `${c.currentTitle} @ ${c.currentCompany}`],
                      ["教育背景", `${c.education} · ${c.major}`],
                      ["所在城市", c.city],
                      ["来源", c.source],
                      ["入库时间", c.uploadedAt],
                    ].map(([k, v]) => (
                      <div key={k} className="flex p-3">
                        <span className="w-20 text-muted-foreground">{k}</span>
                        <span className="text-foreground flex-1">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* actions */}
                <div className="px-6 mt-6 mb-8 grid grid-cols-2 gap-2.5">
                  <Button variant="outline" className="h-10" onClick={() => toast.info(`已发起联系：${c.phone}`)}>
                    <Phone className="w-4 h-4 mr-1.5" /> 联系候选人
                  </Button>
                  <Button asChild className="h-10" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple)))" }}>
                    <Link to={`/recruitment/candidates/${c.id}`}>
                      <Sparkles className="w-4 h-4 mr-1.5" /> 查看完整档案
                    </Link>
                  </Button>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
};

export default ResumeLibrary;
