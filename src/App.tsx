import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index.tsx";
import EmployeeHome from "@/modules/employee/pages/EmployeeHome";
import Employees from "@/modules/employee/pages/Employees";
import NewEmployee from "@/modules/employee/pages/NewEmployee";
import EmployeeDetail from "@/modules/employee/pages/EmployeeDetail";
import EmployeeAlerts from "@/modules/employee/pages/Alerts";
import EmployeeSync from "@/modules/employee/pages/Sync";
import AttendanceHome from "@/modules/attendance/pages/AttendanceHome";
import AttendanceOverview from "@/modules/attendance/pages/AttendanceOverview";
import AttendanceDetail from "@/modules/attendance/pages/AttendanceDetail";
import AttendanceOvertime from "@/modules/attendance/pages/AttendanceOvertime";
import AttendanceRules from "@/modules/attendance/pages/AttendanceRules";
import AttendanceException from "@/modules/attendance/pages/AttendanceException";
import RecruitmentHome from "@/modules/recruitment/pages/RecruitmentHome";
import JobsList from "@/modules/recruitment/pages/JobsList";
import JobNew from "@/modules/recruitment/pages/JobNew";
import ResumeLibrary from "@/modules/recruitment/pages/ResumeLibrary";
import CandidateList from "@/modules/recruitment/pages/CandidateList";
import CandidateLedger from "@/modules/recruitment/pages/CandidateLedger";
import CandidateDetail from "@/modules/recruitment/pages/CandidateDetail";
import PerformanceHome from "@/modules/performance/pages/PerformanceHome";
import PerformanceNewAssessment from "@/modules/performance/pages/NewAssessment";
import PerformanceIndicators from "@/modules/performance/pages/Indicators";
import PerformancePage from "@/modules/performance/pages/Performance";
import PerformanceDeptSummary from "@/modules/performance/pages/DepartmentSummary";
import TrainingHome from "@/modules/training/pages/TrainingHome";
import QuestionBank from "@/modules/training/pages/QuestionBank";
import ExamCenter from "@/modules/training/pages/ExamCenter";
import OnJob from "@/modules/training/pages/OnJob";
import TrainingRecords from "@/modules/training/pages/Records";
import DocUpload from "@/modules/knowledge/pages/DocUpload";
import FullTextSearch from "@/modules/knowledge/pages/FullTextSearch";
import SmartQA from "@/modules/knowledge/pages/SmartQA";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/employee" element={<EmployeeHome />} />
            <Route path="/employee/employees" element={<Employees />} />
            <Route path="/employee/employees/new" element={<NewEmployee />} />
            <Route path="/employee/employees/:id" element={<EmployeeDetail />} />
            <Route path="/employee/alerts" element={<EmployeeAlerts />} />
            <Route path="/employee/sync" element={<EmployeeSync />} />

            <Route path="/attendance" element={<Navigate to="/attendance/overview" replace />} />
            <Route path="/attendance/overview" element={<AttendanceHome />} />
            <Route path="/attendance/detail" element={<AttendanceDetail />} />
            <Route path="/attendance/overtime" element={<AttendanceOvertime />} />
            <Route path="/attendance/rules" element={<AttendanceRules />} />
            <Route path="/attendance/exception/:id" element={<AttendanceException />} />

            <Route path="/recruitment" element={<RecruitmentHome />} />
            <Route path="/recruitment/jobs" element={<JobsList />} />
            <Route path="/recruitment/jobs/new" element={<JobNew />} />
            <Route path="/recruitment/jobs/:jobId/candidates" element={<CandidateList />} />
            <Route path="/recruitment/resumes" element={<ResumeLibrary />} />
            <Route path="/recruitment/candidates" element={<CandidateLedger />} />
            <Route path="/recruitment/candidates/:id" element={<CandidateDetail />} />

            <Route path="/performance" element={<PerformanceHome />} />
            <Route path="/performance/assessments/new" element={<PerformanceNewAssessment />} />
            <Route path="/performance/indicators" element={<PerformanceIndicators />} />
            <Route path="/performance/reviews" element={<PerformancePage />} />
            <Route path="/performance/department-summary" element={<PerformanceDeptSummary />} />

            <Route path="/training" element={<TrainingHome />} />
            <Route path="/training/question-bank" element={<QuestionBank />} />
            <Route path="/training/exam-center" element={<ExamCenter />} />
            <Route path="/training/on-job" element={<OnJob />} />
            <Route path="/training/records" element={<TrainingRecords />} />

            <Route path="/knowledge" element={<Navigate to="/knowledge/upload" replace />} />
            <Route path="/knowledge/upload" element={<DocUpload />} />
            <Route path="/knowledge/search" element={<FullTextSearch />} />
            <Route path="/knowledge/qa" element={<SmartQA />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
