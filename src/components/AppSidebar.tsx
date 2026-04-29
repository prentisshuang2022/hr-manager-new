import { useEffect, useState } from "react";
import { Users, Clock, UserPlus, TrendingUp, GraduationCap, BookOpen, ChevronRight, type LucideIcon } from "lucide-react";
import logo from "@/assets/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavChild = { title: string; url: string };
type NavItem = { title: string; url: string; icon: LucideIcon; children: NavChild[] };

const items: NavItem[] = [
  {
    title: "员工档案助手",
    url: "/employee",
    icon: Users,
    children: [
      { title: "流动看板", url: "/employee" },
      { title: "员工档案", url: "/employee/employees" },
      { title: "新增员工", url: "/employee/employees/new" },
      { title: "预警中心", url: "/employee/alerts" },
      { title: "钉钉同步", url: "/employee/sync" },
    ],
  },
  {
    title: "考勤助手",
    url: "/attendance",
    icon: Clock,
    children: [
      { title: "今日概览", url: "/attendance/overview" },
      { title: "考勤明细", url: "/attendance/detail" },
      { title: "加班与调休", url: "/attendance/overtime" },
      { title: "规则配置", url: "/attendance/rules" },
    ],
  },
  {
    title: "招聘助手",
    url: "/recruitment",
    icon: UserPlus,
    children: [
      { title: "招聘工作台", url: "/recruitment" },
      { title: "岗位与JD", url: "/recruitment/jobs" },
      { title: "新建岗位", url: "/recruitment/jobs/new" },
      { title: "简历库", url: "/recruitment/resumes" },
      { title: "候选人台账", url: "/recruitment/candidates" },
    ],
  },
  {
    title: "绩效助手",
    url: "/performance",
    icon: TrendingUp,
    children: [
      { title: "绩效工作台", url: "/performance" },
      { title: "新建考核", url: "/performance/assessments/new" },
      { title: "指标库管理", url: "/performance/indicators" },
      { title: "员工绩效管理", url: "/performance/reviews" },
      { title: "部门汇总", url: "/performance/department-summary" },
    ],
  },
  {
    title: "培训助手",
    url: "/training",
    icon: GraduationCap,
    children: [
      { title: "培训总览", url: "/training" },
      { title: "题库管理", url: "/training/question-bank" },
      { title: "考试中心", url: "/training/exam-center" },
      { title: "在岗培训", url: "/training/on-job" },
      { title: "培训记录", url: "/training/records" },
    ],
  },
  {
    title: "人资知识库",
    url: "/knowledge/upload",
    icon: BookOpen,
    children: [
      { title: "文档录入", url: "/knowledge/upload" },
      { title: "全文检索", url: "/knowledge/search" },
      { title: "智能问答", url: "/knowledge/qa" },
    ],
  },
];

const isPathInModule = (pathname: string, moduleUrl: string) =>
  pathname === moduleUrl || pathname.startsWith(`${moduleUrl}/`);

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const activeModule = items.find((it) => isPathInModule(location.pathname, it.url))?.url ?? null;
  const [openModule, setOpenModule] = useState<string | null>(activeModule ?? items[0].url);

  // Auto expand the active module on route change
  useEffect(() => {
    if (activeModule) setOpenModule(activeModule);
  }, [activeModule]);

  const handleModuleClick = (e: React.MouseEvent, item: NavItem) => {
    if (collapsed) return; // let NavLink navigate normally in collapsed mode
    e.preventDefault();
    // Toggle: if already open, collapse; otherwise open & navigate to module home
    if (openModule === item.url && isPathInModule(location.pathname, item.url)) {
      setOpenModule(null);
    } else {
      setOpenModule(item.url);
      navigate(item.url);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <img src={logo} alt="人事AI员工 Logo" className="h-9 w-9 shrink-0 rounded-lg object-contain" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">人事AI员工</span>
              <span className="text-xs text-muted-foreground">统一 HR 智能工作台</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const isModuleActive = isPathInModule(location.pathname, item.url);
                const isOpen = !collapsed && openModule === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isModuleActive}
                      className={cn(
                        "group/module h-10 transition-colors",
                        isModuleActive &&
                          "bg-sidebar-accent text-sidebar-accent-foreground font-medium hover:bg-sidebar-accent",
                      )}
                    >
                      <NavLink
                        to={item.url}
                        onClick={(e) => handleModuleClick(e, item)}
                        className="flex items-center gap-2"
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0", isModuleActive && "text-sidebar-accent-foreground")} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.title}</span>
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                                isOpen && "rotate-90",
                              )}
                            />
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>

                    {!collapsed && isOpen && (
                      <div className="mt-1 ml-[18px] border-l border-sidebar-border pl-2">
                        <ul className="space-y-0.5 py-0.5">
                          {item.children.map((child) => (
                            <li key={child.url}>
                              <NavLink
                                to={child.url}
                                end
                                className={cn(
                                  "flex min-h-8 items-center rounded-md px-2.5 text-[13px] text-sidebar-foreground/75",
                                  "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors",
                                )}
                                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              >
                                <span className="truncate">{child.title}</span>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
