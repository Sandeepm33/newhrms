// ============================================================
// HRMS — Module Registry
// Defines all 48 business modules and their submodules
// Seeds the Module collection and powers the dynamic sidebar
// ============================================================

export interface ModuleDef {
  slug: string;
  name: string;
  icon: string;
  route: string;
  group: string;
  sortOrder: number;
  submodules?: SubmoduleDef[];
}

export interface SubmoduleDef {
  slug: string;
  name: string;
  icon: string;
  route: string;
  actions: string[];
}

const PERMISSION_ACTIONS = {
  READ: ['VIEW'],
  READWRITE: ['VIEW', 'CREATE', 'EDIT', 'DELETE'],
  FULL: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'IMPORT'],
  APPROVAL: ['VIEW', 'APPROVE', 'REJECT'],
  FINANCIAL: ['VIEW', 'PROCESS', 'FINALIZE', 'LOCK', 'UNLOCK'],
  DOCUMENT: ['VIEW', 'UPLOAD', 'DOWNLOAD', 'DELETE'],
  CONFIGURE: ['VIEW', 'CONFIGURE'],
};

export const MODULES: ModuleDef[] = [
  // ─ CORE HR ──────────────────────────────────────────────────
  {
    slug: 'dashboard',
    name: 'Dashboard',
    icon: 'LayoutDashboard',
    route: '/dashboard',
    group: 'Core HR',
    sortOrder: 1,
  },
  {
    slug: 'organization',
    name: 'Organization',
    icon: 'Building2',
    route: '/dashboard/organization',
    group: 'Core HR',
    sortOrder: 2,
    submodules: [
      { slug: 'org-overview', name: 'Overview', icon: 'Building', route: '/dashboard/organization', actions: PERMISSION_ACTIONS.READWRITE },
      { slug: 'departments', name: 'Departments', icon: 'Network', route: '/dashboard/organization/departments', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'locations', name: 'Locations', icon: 'MapPin', route: '/dashboard/organization/locations', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'business-units', name: 'Business Units', icon: 'Briefcase', route: '/dashboard/organization/business-units', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'legal-entities', name: 'Legal Entities', icon: 'Scale', route: '/dashboard/organization/legal-entities', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'designations', name: 'Designations', icon: 'Badge', route: '/dashboard/organization/designations', actions: PERMISSION_ACTIONS.FULL },
    ],
  },
  {
    slug: 'employees',
    name: 'Employees',
    icon: 'Users',
    route: '/dashboard/employees',
    group: 'Core HR',
    sortOrder: 3,
    submodules: [
      { slug: 'employee-directory', name: 'Directory', icon: 'Users', route: '/dashboard/employees', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'employee-documents', name: 'Documents', icon: 'FileText', route: '/dashboard/employees/documents', actions: PERMISSION_ACTIONS.DOCUMENT },
      { slug: 'employee-compensation', name: 'Compensation', icon: 'DollarSign', route: '/dashboard/employees/compensation', actions: ['VIEW', 'EDIT', 'APPROVE'] },
      { slug: 'employee-bank', name: 'Bank Details', icon: 'CreditCard', route: '/dashboard/employees/bank', actions: ['VIEW', 'EDIT'] },
      { slug: 'org-chart', name: 'Org Chart', icon: 'Network', route: '/dashboard/employees/org-chart', actions: PERMISSION_ACTIONS.READ },
    ],
  },
  {
    slug: 'ess',
    name: 'Self Service',
    icon: 'UserCircle',
    route: '/dashboard/ess',
    group: 'Core HR',
    sortOrder: 4,
    submodules: [
      { slug: 'my-profile', name: 'My Profile', icon: 'User', route: '/dashboard/ess/profile', actions: ['VIEW', 'EDIT'] },
      { slug: 'my-documents', name: 'My Documents', icon: 'File', route: '/dashboard/ess/documents', actions: PERMISSION_ACTIONS.DOCUMENT },
      { slug: 'my-payslips', name: 'My Payslips', icon: 'Receipt', route: '/dashboard/ess/payslips', actions: ['VIEW', 'DOWNLOAD'] },
    ],
  },
  {
    slug: 'documents',
    name: 'Documents',
    icon: 'FolderOpen',
    route: '/dashboard/documents',
    group: 'Core HR',
    sortOrder: 5,
    submodules: [
      { slug: 'company-docs', name: 'Company Documents', icon: 'FileText', route: '/dashboard/documents/company', actions: PERMISSION_ACTIONS.DOCUMENT },
      { slug: 'policies-docs', name: 'Policies', icon: 'ScrollText', route: '/dashboard/documents/policies', actions: PERMISSION_ACTIONS.DOCUMENT },
    ],
  },
  {
    slug: 'lifecycle',
    name: 'Lifecycle',
    icon: 'RefreshCcw',
    route: '/dashboard/lifecycle',
    group: 'Core HR',
    sortOrder: 6,
    submodules: [
      { slug: 'onboarding-tasks', name: 'Onboarding Tasks', icon: 'ClipboardList', route: '/dashboard/lifecycle/onboarding', actions: PERMISSION_ACTIONS.READWRITE },
      { slug: 'transfers', name: 'Transfers', icon: 'ArrowRightLeft', route: '/dashboard/lifecycle/transfers', actions: ['VIEW', 'CREATE', ...PERMISSION_ACTIONS.APPROVAL] },
      { slug: 'promotions', name: 'Promotions', icon: 'TrendingUp', route: '/dashboard/lifecycle/promotions', actions: ['VIEW', 'CREATE', ...PERMISSION_ACTIONS.APPROVAL] },
      { slug: 'exits', name: 'Exits / Separations', icon: 'LogOut', route: '/dashboard/lifecycle/exits', actions: ['VIEW', 'CREATE', ...PERMISSION_ACTIONS.APPROVAL] },
    ],
  },
  {
    slug: 'helpdesk',
    name: 'Help Desk',
    icon: 'Headphones',
    route: '/dashboard/helpdesk',
    group: 'Core HR',
    sortOrder: 7,
    submodules: [
      { slug: 'tickets', name: 'Tickets', icon: 'Ticket', route: '/dashboard/helpdesk/tickets', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'ticket-categories', name: 'Categories', icon: 'Tags', route: '/dashboard/helpdesk/categories', actions: PERMISSION_ACTIONS.CONFIGURE },
    ],
  },
  {
    slug: 'announcements',
    name: 'Announcements',
    icon: 'Megaphone',
    route: '/dashboard/announcements',
    group: 'Core HR',
    sortOrder: 8,
    submodules: [
      { slug: 'company-announcements', name: 'Announcements', icon: 'Bell', route: '/dashboard/announcements', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'PUBLISH'] },
    ],
  },

  // ─ TIME & WORKFORCE ──────────────────────────────────────────
  {
    slug: 'attendance',
    name: 'Attendance',
    icon: 'Clock',
    route: '/dashboard/attendance',
    group: 'Time & Workforce',
    sortOrder: 9,
    submodules: [
      { slug: 'daily-attendance', name: 'Daily Attendance', icon: 'CalendarCheck', route: '/dashboard/attendance/daily', actions: ['VIEW', 'EDIT', 'APPROVE'] },
      { slug: 'regularization', name: 'Regularization', icon: 'ClipboardEdit', route: '/dashboard/attendance/regularization', actions: ['VIEW', 'SUBMIT', ...PERMISSION_ACTIONS.APPROVAL] },
      { slug: 'attendance-reports', name: 'Reports', icon: 'BarChart', route: '/dashboard/attendance/reports', actions: ['VIEW', 'EXPORT'] },
      { slug: 'attendance-policy', name: 'Policies', icon: 'Settings', route: '/dashboard/attendance/policy', actions: PERMISSION_ACTIONS.CONFIGURE },
    ],
  },
  {
    slug: 'leave',
    name: 'Leave',
    icon: 'CalendarOff',
    route: '/dashboard/leave',
    group: 'Time & Workforce',
    sortOrder: 10,
    submodules: [
      { slug: 'my-leave', name: 'My Leave', icon: 'CalendarMinus', route: '/dashboard/leave/my', actions: ['VIEW', 'SUBMIT', 'CANCEL'] },
      { slug: 'team-leave', name: 'Team Leave', icon: 'Users', route: '/dashboard/leave/team', actions: ['VIEW', ...PERMISSION_ACTIONS.APPROVAL] },
      { slug: 'leave-types', name: 'Leave Types', icon: 'Tags', route: '/dashboard/leave/types', actions: PERMISSION_ACTIONS.CONFIGURE },
      { slug: 'leave-policy', name: 'Leave Policies', icon: 'ScrollText', route: '/dashboard/leave/policy', actions: PERMISSION_ACTIONS.CONFIGURE },
      { slug: 'leave-balance', name: 'Balances', icon: 'PieChart', route: '/dashboard/leave/balances', actions: ['VIEW', 'EDIT'] },
    ],
  },
  {
    slug: 'shifts',
    name: 'Shifts & Rosters',
    icon: 'Clock4',
    route: '/dashboard/shifts',
    group: 'Time & Workforce',
    sortOrder: 11,
    submodules: [
      { slug: 'shift-master', name: 'Shift Master', icon: 'Clock', route: '/dashboard/shifts/master', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'shift-roster', name: 'Roster', icon: 'Calendar', route: '/dashboard/shifts/roster', actions: PERMISSION_ACTIONS.FULL },
    ],
  },
  {
    slug: 'overtime',
    name: 'Overtime',
    icon: 'AlarmClock',
    route: '/dashboard/overtime',
    group: 'Time & Workforce',
    sortOrder: 12,
    submodules: [
      { slug: 'overtime-requests', name: 'OT Requests', icon: 'Plus', route: '/dashboard/overtime/requests', actions: ['VIEW', 'SUBMIT', ...PERMISSION_ACTIONS.APPROVAL] },
    ],
  },
  {
    slug: 'timesheets',
    name: 'Timesheets',
    icon: 'ClipboardList',
    route: '/dashboard/timesheets',
    group: 'Time & Workforce',
    sortOrder: 13,
    submodules: [
      { slug: 'my-timesheet', name: 'My Timesheet', icon: 'Clock', route: '/dashboard/timesheets/my', actions: ['VIEW', 'SUBMIT'] },
      { slug: 'team-timesheet', name: 'Team Timesheets', icon: 'Users', route: '/dashboard/timesheets/team', actions: ['VIEW', ...PERMISSION_ACTIONS.APPROVAL] },
    ],
  },
  {
    slug: 'wfh',
    name: 'WFH / On-Duty',
    icon: 'Home',
    route: '/dashboard/wfh',
    group: 'Time & Workforce',
    sortOrder: 14,
    submodules: [
      { slug: 'wfh-requests', name: 'WFH Requests', icon: 'Home', route: '/dashboard/wfh/requests', actions: ['VIEW', 'SUBMIT', ...PERMISSION_ACTIONS.APPROVAL] },
    ],
  },
  {
    slug: 'holidays',
    name: 'Holidays',
    icon: 'CalendarDays',
    route: '/dashboard/holidays',
    group: 'Time & Workforce',
    sortOrder: 15,
    submodules: [
      { slug: 'holiday-calendar', name: 'Holiday Calendar', icon: 'Calendar', route: '/dashboard/holidays', actions: PERMISSION_ACTIONS.FULL },
    ],
  },

  // ─ PAYROLL & FINANCE ────────────────────────────────────────
  {
    slug: 'payroll',
    name: 'Payroll',
    icon: 'Banknote',
    route: '/dashboard/payroll',
    group: 'Payroll & Finance',
    sortOrder: 16,
    submodules: [
      { slug: 'payroll-runs', name: 'Payroll Runs', icon: 'Play', route: '/dashboard/payroll/runs', actions: PERMISSION_ACTIONS.FINANCIAL },
      { slug: 'payslips', name: 'Payslips', icon: 'Receipt', route: '/dashboard/payroll/payslips', actions: ['VIEW', 'DOWNLOAD'] },
      { slug: 'salary-structures', name: 'Salary Structures', icon: 'Layers', route: '/dashboard/payroll/structures', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'salary-components', name: 'Components', icon: 'Puzzle', route: '/dashboard/payroll/components', actions: PERMISSION_ACTIONS.CONFIGURE },
    ],
  },
  {
    slug: 'compensation',
    name: 'Compensation',
    icon: 'TrendingUp',
    route: '/dashboard/compensation',
    group: 'Payroll & Finance',
    sortOrder: 17,
  },
  {
    slug: 'tax',
    name: 'Tax & Statutory',
    icon: 'Scale',
    route: '/dashboard/tax',
    group: 'Payroll & Finance',
    sortOrder: 18,
    submodules: [
      { slug: 'tax-declarations', name: 'Tax Declarations', icon: 'FileText', route: '/dashboard/tax/declarations', actions: ['VIEW', 'SUBMIT', 'APPROVE'] },
      { slug: 'statutory-config', name: 'Statutory Config', icon: 'Settings', route: '/dashboard/tax/statutory', actions: PERMISSION_ACTIONS.CONFIGURE },
    ],
  },
  {
    slug: 'expenses',
    name: 'Expenses',
    icon: 'Receipt',
    route: '/dashboard/expenses',
    group: 'Payroll & Finance',
    sortOrder: 19,
    submodules: [
      { slug: 'expense-claims', name: 'Claims', icon: 'FileText', route: '/dashboard/expenses/claims', actions: ['VIEW', 'SUBMIT', 'CANCEL', ...PERMISSION_ACTIONS.APPROVAL] },
      { slug: 'expense-policy', name: 'Policies', icon: 'ScrollText', route: '/dashboard/expenses/policy', actions: PERMISSION_ACTIONS.CONFIGURE },
      { slug: 'expense-categories', name: 'Categories', icon: 'Tags', route: '/dashboard/expenses/categories', actions: PERMISSION_ACTIONS.FULL },
    ],
  },
  {
    slug: 'loans',
    name: 'Loans & Advances',
    icon: 'PiggyBank',
    route: '/dashboard/loans',
    group: 'Payroll & Finance',
    sortOrder: 20,
    submodules: [
      { slug: 'loan-requests', name: 'Loan Requests', icon: 'HandCoins', route: '/dashboard/loans/requests', actions: ['VIEW', 'SUBMIT', ...PERMISSION_ACTIONS.APPROVAL] },
    ],
  },
  {
    slug: 'reimbursements',
    name: 'Reimbursements',
    icon: 'RefreshCw',
    route: '/dashboard/reimbursements',
    group: 'Payroll & Finance',
    sortOrder: 21,
  },
  {
    slug: 'fnf',
    name: 'Full & Final',
    icon: 'CheckSquare',
    route: '/dashboard/fnf',
    group: 'Payroll & Finance',
    sortOrder: 22,
  },

  // ─ TALENT ACQUISITION ───────────────────────────────────────
  {
    slug: 'recruitment',
    name: 'Recruitment',
    icon: 'UserPlus',
    route: '/dashboard/recruitment',
    group: 'Talent Acquisition',
    sortOrder: 23,
    submodules: [
      { slug: 'requisitions', name: 'Requisitions', icon: 'FilePlus', route: '/dashboard/recruitment/requisitions', actions: ['VIEW', 'CREATE', ...PERMISSION_ACTIONS.APPROVAL] },
      { slug: 'jobs', name: 'Jobs', icon: 'Briefcase', route: '/dashboard/recruitment/jobs', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'candidates', name: 'Candidates', icon: 'Users', route: '/dashboard/recruitment/candidates', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'interviews', name: 'Interviews', icon: 'CalendarCheck', route: '/dashboard/recruitment/interviews', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'offers', name: 'Offers', icon: 'FileSignature', route: '/dashboard/recruitment/offers', actions: ['VIEW', 'CREATE', ...PERMISSION_ACTIONS.APPROVAL] },
    ],
  },
  {
    slug: 'career-portal',
    name: 'Career Portal',
    icon: 'Globe',
    route: '/dashboard/recruitment/portal',
    group: 'Talent Acquisition',
    sortOrder: 24,
  },
  {
    slug: 'referrals',
    name: 'Referrals',
    icon: 'Share2',
    route: '/dashboard/recruitment/referrals',
    group: 'Talent Acquisition',
    sortOrder: 25,
  },
  {
    slug: 'bgv',
    name: 'Background Verification',
    icon: 'ShieldCheck',
    route: '/dashboard/recruitment/bgv',
    group: 'Talent Acquisition',
    sortOrder: 26,
  },

  // ─ TALENT MANAGEMENT ────────────────────────────────────────
  {
    slug: 'onboarding',
    name: 'Onboarding',
    icon: 'Rocket',
    route: '/dashboard/onboarding',
    group: 'Talent Management',
    sortOrder: 27,
    submodules: [
      { slug: 'onboarding-plans', name: 'Onboarding Plans', icon: 'ClipboardList', route: '/dashboard/onboarding/plans', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'onboarding-tasks-list', name: 'Tasks', icon: 'CheckCircle', route: '/dashboard/onboarding/tasks', actions: PERMISSION_ACTIONS.READWRITE },
    ],
  },
  {
    slug: 'performance',
    name: 'Performance',
    icon: 'Target',
    route: '/dashboard/performance',
    group: 'Talent Management',
    sortOrder: 28,
    submodules: [
      { slug: 'perf-cycles', name: 'Cycles', icon: 'RefreshCcw', route: '/dashboard/performance/cycles', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'perf-reviews', name: 'Reviews', icon: 'ClipboardCheck', route: '/dashboard/performance/reviews', actions: ['VIEW', 'SUBMIT', 'APPROVE'] },
      { slug: 'perf-feedback', name: 'Feedback', icon: 'MessageCircle', route: '/dashboard/performance/feedback', actions: PERMISSION_ACTIONS.READWRITE },
    ],
  },
  {
    slug: 'goals',
    name: 'Goals & OKRs',
    icon: 'Crosshair',
    route: '/dashboard/goals',
    group: 'Talent Management',
    sortOrder: 29,
    submodules: [
      { slug: 'my-goals', name: 'My Goals', icon: 'Target', route: '/dashboard/goals/my', actions: PERMISSION_ACTIONS.READWRITE },
      { slug: 'team-goals', name: 'Team Goals', icon: 'Users', route: '/dashboard/goals/team', actions: ['VIEW', 'ASSIGN'] },
    ],
  },
  {
    slug: 'feedback',
    name: 'Feedback & 1:1',
    icon: 'MessageSquare',
    route: '/dashboard/feedback',
    group: 'Talent Management',
    sortOrder: 30,
  },
  {
    slug: 'lms',
    name: 'Learning',
    icon: 'GraduationCap',
    route: '/dashboard/learning',
    group: 'Talent Management',
    sortOrder: 31,
    submodules: [
      { slug: 'courses', name: 'Courses', icon: 'BookOpen', route: '/dashboard/learning/courses', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'learning-paths', name: 'Learning Paths', icon: 'GitBranch', route: '/dashboard/learning/paths', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'my-learning', name: 'My Learning', icon: 'BookMarked', route: '/dashboard/learning/my', actions: ['VIEW'] },
    ],
  },
  {
    slug: 'skills',
    name: 'Skills & Competencies',
    icon: 'Zap',
    route: '/dashboard/skills',
    group: 'Talent Management',
    sortOrder: 32,
  },
  {
    slug: 'career',
    name: 'Career & Succession',
    icon: 'Map',
    route: '/dashboard/career',
    group: 'Talent Management',
    sortOrder: 33,
  },
  {
    slug: 'rewards',
    name: 'Rewards & Recognition',
    icon: 'Award',
    route: '/dashboard/rewards',
    group: 'Talent Management',
    sortOrder: 34,
    submodules: [
      { slug: 'recognition', name: 'Recognition', icon: 'Star', route: '/dashboard/rewards/recognition', actions: PERMISSION_ACTIONS.READWRITE },
      { slug: 'badges', name: 'Badges', icon: 'Medal', route: '/dashboard/rewards/badges', actions: PERMISSION_ACTIONS.CONFIGURE },
    ],
  },

  // ─ ENGAGEMENT & WORKPLACE ───────────────────────────────────
  {
    slug: 'engagement',
    name: 'Engagement',
    icon: 'Heart',
    route: '/dashboard/engagement',
    group: 'Engagement & Workplace',
    sortOrder: 35,
    submodules: [
      { slug: 'surveys', name: 'Surveys', icon: 'ClipboardList', route: '/dashboard/engagement/surveys', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'enps', name: 'eNPS', icon: 'ThumbsUp', route: '/dashboard/engagement/enps', actions: ['VIEW', 'CONFIGURE'] },
    ],
  },
  {
    slug: 'social',
    name: 'Social & Culture',
    icon: 'Users2',
    route: '/dashboard/social',
    group: 'Engagement & Workplace',
    sortOrder: 36,
  },
  {
    slug: 'travel',
    name: 'Travel',
    icon: 'Plane',
    route: '/dashboard/travel',
    group: 'Engagement & Workplace',
    sortOrder: 37,
    submodules: [
      { slug: 'travel-requests', name: 'Travel Requests', icon: 'Luggage', route: '/dashboard/travel/requests', actions: ['VIEW', 'SUBMIT', 'CANCEL', ...PERMISSION_ACTIONS.APPROVAL] },
      { slug: 'travel-policy', name: 'Travel Policy', icon: 'ScrollText', route: '/dashboard/travel/policy', actions: PERMISSION_ACTIONS.CONFIGURE },
    ],
  },
  {
    slug: 'assets',
    name: 'Assets',
    icon: 'Package',
    route: '/dashboard/assets',
    group: 'Engagement & Workplace',
    sortOrder: 38,
    submodules: [
      { slug: 'asset-inventory', name: 'Inventory', icon: 'Box', route: '/dashboard/assets/inventory', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'asset-assignments', name: 'Assignments', icon: 'ArrowRightLeft', route: '/dashboard/assets/assignments', actions: ['VIEW', 'ASSIGN', 'REASSIGN'] },
    ],
  },

  // ─ PROJECTS & PSA ───────────────────────────────────────────
  {
    slug: 'projects',
    name: 'Projects',
    icon: 'FolderKanban',
    route: '/dashboard/projects',
    group: 'Projects & PSA',
    sortOrder: 39,
    submodules: [
      { slug: 'project-list', name: 'Projects', icon: 'FolderOpen', route: '/dashboard/projects', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'clients', name: 'Clients', icon: 'Building', route: '/dashboard/projects/clients', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'project-tasks', name: 'Tasks', icon: 'CheckSquare', route: '/dashboard/projects/tasks', actions: PERMISSION_ACTIONS.READWRITE },
    ],
  },
  {
    slug: 'resources',
    name: 'Resource Management',
    icon: 'UserCog',
    route: '/dashboard/resources',
    group: 'Projects & PSA',
    sortOrder: 40,
    submodules: [
      { slug: 'resource-allocation', name: 'Allocation', icon: 'PieChart', route: '/dashboard/resources/allocation', actions: ['VIEW', 'ASSIGN'] },
      { slug: 'utilization', name: 'Utilization', icon: 'BarChart2', route: '/dashboard/resources/utilization', actions: ['VIEW', 'EXPORT'] },
    ],
  },

  // ─ ANALYTICS & INTELLIGENCE ─────────────────────────────────
  {
    slug: 'analytics',
    name: 'Analytics',
    icon: 'BarChart3',
    route: '/dashboard/analytics',
    group: 'Analytics & Intelligence',
    sortOrder: 41,
    submodules: [
      { slug: 'workforce-analytics', name: 'Workforce', icon: 'Users', route: '/dashboard/analytics/workforce', actions: ['VIEW', 'EXPORT'] },
      { slug: 'payroll-analytics', name: 'Payroll', icon: 'Banknote', route: '/dashboard/analytics/payroll', actions: ['VIEW', 'EXPORT'] },
      { slug: 'recruitment-analytics', name: 'Recruitment', icon: 'UserPlus', route: '/dashboard/analytics/recruitment', actions: ['VIEW', 'EXPORT'] },
      { slug: 'engagement-analytics', name: 'Engagement', icon: 'Heart', route: '/dashboard/analytics/engagement', actions: ['VIEW'] },
    ],
  },
  {
    slug: 'reports',
    name: 'Reports',
    icon: 'FileBarChart',
    route: '/dashboard/reports',
    group: 'Analytics & Intelligence',
    sortOrder: 42,
    submodules: [
      { slug: 'report-builder', name: 'Report Builder', icon: 'PanelLeftOpen', route: '/dashboard/reports/builder', actions: ['VIEW', 'CREATE', 'EXPORT'] },
      { slug: 'saved-reports', name: 'Saved Reports', icon: 'Bookmark', route: '/dashboard/reports/saved', actions: PERMISSION_ACTIONS.READWRITE },
    ],
  },
  {
    slug: 'ai-intelligence',
    name: 'AI Intelligence',
    icon: 'BrainCircuit',
    route: '/dashboard/ai',
    group: 'Analytics & Intelligence',
    sortOrder: 43,
  },

  // ─ PLATFORM ADMIN ───────────────────────────────────────────
  {
    slug: 'roles-permissions',
    name: 'Roles & Permissions',
    icon: 'ShieldCheck',
    route: '/dashboard/roles',
    group: 'Platform Admin',
    sortOrder: 44,
    submodules: [
      { slug: 'role-list', name: 'Roles', icon: 'Shield', route: '/dashboard/roles', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'permission-matrix', name: 'Permissions', icon: 'Key', route: '/dashboard/roles/permissions', actions: PERMISSION_ACTIONS.CONFIGURE },
    ],
  },
  {
    slug: 'workflows-config',
    name: 'Workflows',
    icon: 'GitBranch',
    route: '/dashboard/workflows',
    group: 'Platform Admin',
    sortOrder: 45,
    submodules: [
      { slug: 'workflow-builder', name: 'Workflow Builder', icon: 'Workflow', route: '/dashboard/workflows', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'approval-inbox', name: 'Approval Inbox', icon: 'Inbox', route: '/dashboard/workflows/approvals', actions: ['VIEW', 'APPROVE', 'REJECT'] },
    ],
  },
  {
    slug: 'audit',
    name: 'Audit Logs',
    icon: 'ScrollText',
    route: '/dashboard/audit',
    group: 'Platform Admin',
    sortOrder: 46,
    submodules: [
      { slug: 'audit-trail', name: 'Audit Trail', icon: 'History', route: '/dashboard/audit', actions: ['VIEW', 'EXPORT'] },
    ],
  },
  {
    slug: 'settings',
    name: 'Settings',
    icon: 'Settings',
    route: '/dashboard/settings',
    group: 'Platform Admin',
    sortOrder: 47,
    submodules: [
      { slug: 'org-settings', name: 'Organization', icon: 'Building', route: '/dashboard/settings/organization', actions: PERMISSION_ACTIONS.CONFIGURE },
      { slug: 'user-management', name: 'Users', icon: 'Users', route: '/dashboard/settings/users', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'integration-settings', name: 'Integrations', icon: 'Plug', route: '/dashboard/settings/integrations', actions: PERMISSION_ACTIONS.CONFIGURE },
    ],
  },

  // ─ SUPER ADMIN (platform-level) ─────────────────────────────
  {
    slug: 'super-admin',
    name: 'Super Admin',
    icon: 'Crown',
    route: '/dashboard/super-admin',
    group: 'Super Admin',
    sortOrder: 48,
    submodules: [
      { slug: 'all-organizations', name: 'Organizations', icon: 'Building2', route: '/dashboard/super-admin/organizations', actions: PERMISSION_ACTIONS.FULL },
      { slug: 'platform-stats', name: 'Platform Stats', icon: 'Activity', route: '/dashboard/super-admin/stats', actions: ['VIEW'] },
      { slug: 'subscriptions', name: 'Subscriptions', icon: 'CreditCard', route: '/dashboard/super-admin/subscriptions', actions: PERMISSION_ACTIONS.FULL },
    ],
  },
];
