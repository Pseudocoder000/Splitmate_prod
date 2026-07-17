import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
  Plus,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  Activity,
  X,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  User,
  Menu,
  Wallet,
  LayoutDashboard,
  Eye,
  EyeOff,
  Mail,
  Lock,
  MoreHorizontal,
  UserPlus,
  ArrowRight,
  Zap,
  Home,
  Utensils,
  Plane,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

type View = "dashboard" | "groups" | "group-detail" | "activity";
type AuthMode = "login" | "signup";

interface UserData {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
}

interface Group {
  id: string;
  name: string;
  emoji: string;
  category: string;
  memberIds: string[];
  totalExpenses: number;
  myBalance: number;
  lastActivity: string;
}

interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidById: string;
  date: string;
  icon: string;
  splits: Record<string, number>;
}

interface ActivityEntry {
  id: string;
  type: "expense_added" | "settlement" | "member_added" | "group_created";
  userId: string;
  groupId: string;
  description: string;
  time: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const CURRENT_USER_ID = "u1";

const USERS: UserData[] = [
  { id: "u1", name: "Alex Chen", email: "alex@example.com", initials: "AC", color: "#4ade80" },
  { id: "u2", name: "Jordan Smith", email: "jordan@example.com", initials: "JS", color: "#818cf8" },
  { id: "u3", name: "Morgan Lee", email: "morgan@example.com", initials: "ML", color: "#fb923c" },
  { id: "u4", name: "Casey Park", email: "casey@example.com", initials: "CP", color: "#38bdf8" },
  { id: "u5", name: "Riley Davis", email: "riley@example.com", initials: "RD", color: "#f472b6" },
  { id: "u6", name: "Sam Wilson", email: "sam@example.com", initials: "SW", color: "#a78bfa" },
];

const GROUPS: Group[] = [
  {
    id: "g1",
    name: "Tokyo Trip 2025",
    emoji: "✈️",
    category: "Trip",
    memberIds: ["u1", "u2", "u3", "u4"],
    totalExpenses: 4280.5,
    myBalance: 340.25,
    lastActivity: "2 hours ago",
  },
  {
    id: "g2",
    name: "Apartment — 14B",
    emoji: "🏠",
    category: "Home",
    memberIds: ["u1", "u3", "u5"],
    totalExpenses: 8920.0,
    myBalance: -180.0,
    lastActivity: "1 day ago",
  },
  {
    id: "g3",
    name: "Team Lunch Collective",
    emoji: "🍜",
    category: "Food",
    memberIds: ["u1", "u2", "u4", "u5", "u6"],
    totalExpenses: 1240.0,
    myBalance: 95.4,
    lastActivity: "3 days ago",
  },
  {
    id: "g4",
    name: "Ski Weekend 2025",
    emoji: "🎿",
    category: "Trip",
    memberIds: ["u1", "u2", "u6"],
    totalExpenses: 2100.0,
    myBalance: -420.0,
    lastActivity: "1 week ago",
  },
];

const EXPENSES: Expense[] = [
  { id: "e1", groupId: "g1", description: "Hotel — Shinjuku Washington", amount: 1240.0, paidById: "u1", date: "2025-07-12", icon: "🏨", splits: { u1: 310, u2: 310, u3: 310, u4: 310 } },
  { id: "e2", groupId: "g1", description: "Bullet Train (Tokyo → Kyoto)", amount: 640.0, paidById: "u2", date: "2025-07-13", icon: "🚄", splits: { u1: 160, u2: 160, u3: 160, u4: 160 } },
  { id: "e3", groupId: "g1", description: "Tsukiji Market breakfast", amount: 128.0, paidById: "u3", date: "2025-07-14", icon: "🍣", splits: { u1: 32, u2: 32, u3: 32, u4: 32 } },
  { id: "e4", groupId: "g1", description: "Arashiyama bamboo tour", amount: 280.0, paidById: "u1", date: "2025-07-14", icon: "🎋", splits: { u1: 70, u2: 70, u3: 70, u4: 70 } },
  { id: "e5", groupId: "g1", description: "Ramen — Ichiran Shinjuku", amount: 96.5, paidById: "u4", date: "2025-07-15", icon: "🍜", splits: { u1: 24.13, u2: 24.13, u3: 24.12, u4: 24.12 } },
  { id: "e6", groupId: "g1", description: "Shibuya shopping (shared items)", amount: 340.0, paidById: "u2", date: "2025-07-15", icon: "🛍️", splits: { u1: 85, u2: 85, u3: 85, u4: 85 } },
  { id: "e7", groupId: "g1", description: "TeamLab Borderless tickets", amount: 320.0, paidById: "u1", date: "2025-07-16", icon: "🎨", splits: { u1: 80, u2: 80, u3: 80, u4: 80 } },
  { id: "e8", groupId: "g1", description: "Airport transfer (shared taxi)", amount: 78.0, paidById: "u3", date: "2025-07-16", icon: "🚕", splits: { u1: 19.5, u2: 19.5, u3: 19.5, u4: 19.5 } },
  { id: "e9", groupId: "g2", description: "Electricity bill — June", amount: 360.0, paidById: "u3", date: "2025-07-01", icon: "⚡", splits: { u1: 120, u3: 120, u5: 120 } },
  { id: "e10", groupId: "g2", description: "Internet & streaming", amount: 90.0, paidById: "u1", date: "2025-07-01", icon: "📡", splits: { u1: 30, u3: 30, u5: 30 } },
  { id: "e11", groupId: "g2", description: "Groceries — Trader Joes run", amount: 186.0, paidById: "u5", date: "2025-07-08", icon: "🛒", splits: { u1: 62, u3: 62, u5: 62 } },
  { id: "e12", groupId: "g3", description: "Postmates order — Thai food", amount: 84.0, paidById: "u2", date: "2025-07-10", icon: "🍲", splits: { u1: 16.8, u2: 16.8, u4: 16.8, u5: 16.8, u6: 16.8 } },
  { id: "e13", groupId: "g3", description: "Sushi Yasuda — team lunch", amount: 310.0, paidById: "u1", date: "2025-07-03", icon: "🍱", splits: { u1: 62, u2: 62, u4: 62, u5: 62, u6: 62 } },
  { id: "e14", groupId: "g4", description: "Ski equipment rental", amount: 630.0, paidById: "u2", date: "2025-06-28", icon: "🎿", splits: { u1: 210, u2: 210, u6: 210 } },
  { id: "e15", groupId: "g4", description: "Mountain View Lodge — 2 nights", amount: 840.0, paidById: "u1", date: "2025-06-28", icon: "🏔️", splits: { u1: 280, u2: 280, u6: 280 } },
];

const ACTIVITY_LOG: ActivityEntry[] = [
  { id: "a1", type: "expense_added", userId: "u1", groupId: "g1", description: "Added \"Hotel — Shinjuku Washington\" ($1,240.00) in Tokyo Trip 2025", time: "2 hours ago" },
  { id: "a2", type: "settlement", userId: "u2", groupId: "g1", description: "Jordan settled $160.00 with Alex in Tokyo Trip 2025", time: "4 hours ago" },
  { id: "a3", type: "expense_added", userId: "u3", groupId: "g2", description: "Added \"Electricity bill — June\" ($360.00) in Apartment — 14B", time: "1 day ago" },
  { id: "a4", type: "member_added", userId: "u5", groupId: "g3", description: "Riley Davis joined Team Lunch Collective", time: "2 days ago" },
  { id: "a5", type: "expense_added", userId: "u2", groupId: "g3", description: "Added \"Postmates order — Thai food\" ($84.00) in Team Lunch Collective", time: "3 days ago" },
  { id: "a6", type: "expense_added", userId: "u1", groupId: "g3", description: "Added \"Sushi Yasuda — team lunch\" ($310.00) in Team Lunch Collective", time: "4 days ago" },
  { id: "a7", type: "settlement", userId: "u1", groupId: "g4", description: "Alex settled $420.00 with Sam in Ski Weekend 2025", time: "1 week ago" },
  { id: "a8", type: "group_created", userId: "u1", groupId: "g4", description: "Alex created Ski Weekend 2025", time: "2 weeks ago" },
];

const BALANCE_CHART = [
  { month: "Feb", owed: 420, owes: 180 },
  { month: "Mar", owed: 680, owes: 340 },
  { month: "Apr", owed: 290, owes: 520 },
  { month: "May", owed: 840, owes: 210 },
  { month: "Jun", owed: 560, owes: 380 },
  { month: "Jul", owed: 435, owes: 600 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) => {
  const abs = Math.abs(n);
  const str = abs.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return n < 0 ? `-$${str}` : `$${str}`;
};

const getUser = (id: string) => USERS.find((u) => u.id === id)!;
const getGroup = (id: string) => GROUPS.find((g) => g.id === id)!;

// ─── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({ userId, size = "md" }: { userId: string; size?: "xs" | "sm" | "md" | "lg" }) {
  const user = getUser(userId);
  const cls = {
    xs: "w-5 h-5 text-[9px]",
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  }[size];
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center font-bold shrink-0 select-none`}
      style={{ backgroundColor: user.color, color: "#052e16" }}
    >
      {user.initials}
    </div>
  );
}

// ─── Auth Screen ─────────────────────────────────────────────────────────────

function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "signup" && !name.trim()) e.name = "Name is required";
    if (!email.includes("@")) e.email = "Enter a valid email";
    if (password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  };

  const features = [
    { icon: "💸", text: "Real-time balance sync across all your groups" },
    { icon: "🧮", text: "Precise splitting — rounding handled so no cent is lost" },
    { icon: "⚡", text: "Instant notifications when expenses are added or settled" },
    { icon: "🔐", text: "JWT auth with automatic token refresh and secure sessions" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] shrink-0 bg-card border-r border-border p-12">
        <div>
          <div className="flex items-center gap-3 mb-14">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">SplitMate</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground leading-tight mb-5">
            Split expenses.<br />Not friendships.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-10">
            Track shared costs, settle up fairly, and keep relationships intact — whether you share an apartment, a trip, or a lunch.
          </p>
          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.text} className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{f.icon}</span>
                <span className="text-muted-foreground text-sm leading-relaxed">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial card */}
        <div className="border border-border rounded-xl p-5 bg-secondary/30">
          <div className="flex items-center gap-3 mb-3">
            <Avatar userId="u2" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Jordan Smith</p>
              <p className="text-xs text-muted-foreground">Tokyo Trip 2025</p>
            </div>
            <span className="text-primary font-mono text-sm font-semibold">+$310.00</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            "Finally, everyone pays their fair share. No more awkward spreadsheets or forgotten debts."
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">SplitMate</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to see your latest balances and groups."
                : "Start tracking shared expenses in under a minute."}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-secondary/40 rounded-lg p-1 mb-6 border border-border">
            {(["login", "signup"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  mode === m
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Chen"
                    className={`w-full pl-10 pr-4 py-2.5 bg-input-background border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors ${errors.name ? "border-destructive" : "border-border"}`}
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-input-background border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors ${errors.email ? "border-destructive" : "border-border"}`}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-input-background border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors ${errors.password ? "border-destructive" : "border-border"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            {mode === "login" && (
              <div className="text-right -mt-1">
                <button type="button" className="text-xs text-accent hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? "Authenticating..."
                : mode === "login"
                ? "Sign in to SplitMate"
                : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            {mode === "login" ? "No account yet? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErrors({}); }}
              className="text-accent hover:underline font-semibold"
            >
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({
  view,
  onNavigate,
  onLogout,
  onSelectGroup,
  mobileOpen,
  onCloseMobile,
}: {
  view: View;
  onNavigate: (v: View) => void;
  onLogout: () => void;
  onSelectGroup: (id: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const me = getUser(CURRENT_USER_ID);

  const nav = [
    { id: "dashboard" as View, label: "Dashboard", Icon: LayoutDashboard },
    { id: "groups" as View, label: "Groups", Icon: Users },
    { id: "activity" as View, label: "Activity", Icon: Activity },
  ];

  const Content = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Wallet className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-base font-bold tracking-tight text-foreground flex-1">SplitMate</span>
        <button
          onClick={onCloseMobile}
          className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 space-y-0.5 shrink-0">
        {nav.map(({ id, label, Icon }) => {
          const active = view === id || (view === "group-detail" && id === "groups");
          return (
            <button
              key={id}
              onClick={() => { onNavigate(id); onCloseMobile(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Groups quick links */}
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
          Your Groups
        </p>
        <div className="space-y-0.5">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => { onSelectGroup(g.id); onCloseMobile(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors group text-left"
            >
              <span className="text-sm shrink-0">{g.emoji}</span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground truncate flex-1 transition-colors">
                {g.name}
              </span>
              <span
                className={`text-[11px] font-mono font-semibold shrink-0 ${
                  g.myBalance >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {g.myBalance >= 0 ? "+" : ""}
                {fmt(g.myBalance)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/50 transition-colors">
          <Avatar userId={CURRENT_USER_ID} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{me.name}</p>
            <p className="text-xs text-muted-foreground truncate">{me.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-border bg-card flex-col h-screen sticky top-0">
        <Content />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col shadow-2xl">
            <Content />
          </aside>
        </div>
      )}
    </>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────────────────

function Topbar({
  title,
  subtitle,
  onMenuClick,
}: {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 h-16 flex items-center gap-3 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-foreground leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground leading-tight">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

function DashboardView({
  onNavigate,
  onSelectGroup,
}: {
  onNavigate: (v: View) => void;
  onSelectGroup: (id: string) => void;
}) {
  const totalOwed = GROUPS.filter((g) => g.myBalance > 0).reduce((s, g) => s + g.myBalance, 0);
  const totalOwes = GROUPS.filter((g) => g.myBalance < 0).reduce((s, g) => s + Math.abs(g.myBalance), 0);
  const net = totalOwed - totalOwes;

  const recentExpenses = useMemo(
    () =>
      EXPENSES.filter((e) => e.splits[CURRENT_USER_ID] !== undefined)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6),
    []
  );

  const highestDebtGroup = GROUPS.reduce(
    (worst, g) => (g.myBalance < worst.myBalance ? g : worst),
    GROUPS[0]
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-2xl">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
            {p.dataKey === "owed" ? "Owed to you" : "You owe"}: {fmt(p.value)}
          </p>
        ))}
      </div>
    );
  };

  const stats = [
    {
      label: "Owed to you",
      value: fmt(totalOwed),
      raw: totalOwed,
      positive: true,
      Icon: ArrowDownLeft,
      sub: `${GROUPS.filter((g) => g.myBalance > 0).length} groups`,
    },
    {
      label: "You owe",
      value: fmt(totalOwes),
      raw: totalOwes,
      positive: false,
      Icon: ArrowUpRight,
      sub: `${GROUPS.filter((g) => g.myBalance < 0).length} groups`,
    },
    {
      label: "Net balance",
      value: (net >= 0 ? "+" : "") + fmt(net),
      raw: net,
      positive: net >= 0,
      Icon: net >= 0 ? TrendingUp : TrendingDown,
      sub: "your overall position",
    },
    {
      label: "Active groups",
      value: String(GROUPS.length),
      raw: GROUPS.length,
      positive: true,
      Icon: Users,
      sub: "you are a member",
      isCount: true,
    },
  ];

  return (
    <div className="p-5 lg:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((s) => {
          const { Icon } = s;
          return (
            <div
              key={s.label}
              className="bg-card border border-border rounded-xl p-4 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    s.positive ? "bg-primary/10" : "bg-destructive/10"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${s.positive ? "text-primary" : "text-destructive"}`}
                  />
                </div>
              </div>
              <p
                className={`text-xl font-bold font-mono leading-none mb-1 ${
                  s.isCount
                    ? "text-foreground"
                    : s.positive
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Chart + Settle split */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Balance trend */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Balance Trend</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-primary inline-block" />
                Owed to you
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-destructive inline-block" />
                You owe
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={BALANCE_CHART} barSize={10} barGap={3} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "Plus Jakarta Sans" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }}
                tickFormatter={(v) => `$${v}`}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="owed" name="owed" fill="#4ade80" radius={[3, 3, 0, 0]} />
              <Bar dataKey="owes" name="owes" fill="#f87171" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Settle up suggestions */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Settle Up</h3>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-3">
            {[
              { fromId: "u3", toId: "u1", amount: 120, groupName: "Apartment — 14B", groupId: "g2", dir: "receive" as const },
              { fromId: "u2", toId: "u1", amount: 95, groupName: "Tokyo Trip 2025", groupId: "g1", dir: "receive" as const },
              { fromId: "u1", toId: "u6", amount: 420, groupName: "Ski Weekend 2025", groupId: "g4", dir: "pay" as const },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Avatar userId={s.dir === "receive" ? s.fromId : s.toId} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight">
                    {s.dir === "receive"
                      ? getUser(s.fromId).name.split(" ")[0]
                      : getUser(s.toId).name.split(" ")[0]}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{s.groupName}</p>
                </div>
                <button
                  onClick={() => onSelectGroup(s.groupId)}
                  className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-md transition-colors ${
                    s.dir === "receive"
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  }`}
                >
                  {s.dir === "receive" ? "+" : "-"}{fmt(s.amount)}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Highest debt group</span>
              <button
                onClick={() => onSelectGroup(highestDebtGroup.id)}
                className="flex items-center gap-1 text-accent hover:underline font-medium"
              >
                {highestDebtGroup.emoji} {highestDebtGroup.name.split(" ")[0]}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent expenses */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground">Recent Expenses</h3>
            <p className="text-xs text-muted-foreground">Across all your groups</p>
          </div>
          <button
            onClick={() => onNavigate("groups")}
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div>
          {recentExpenses.map((expense, idx) => {
            const payer = getUser(expense.paidById);
            const myShare = expense.splits[CURRENT_USER_ID] || 0;
            const iPaid = expense.paidById === CURRENT_USER_ID;
            const group = getGroup(expense.groupId);
            return (
              <div
                key={expense.id}
                className={`flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/20 transition-colors ${
                  idx < recentExpenses.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="text-lg w-7 text-center shrink-0 select-none">{expense.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{expense.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {group.emoji} {group.name} ·{" "}
                    {iPaid ? "You paid" : `${payer.name.split(" ")[0]} paid`} · {expense.date}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-sm font-mono font-bold text-foreground">{fmt(expense.amount)}</p>
                  <p
                    className={`text-xs font-mono ${iPaid ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {iPaid
                      ? `+${fmt(expense.amount - myShare)} lent`
                      : `${fmt(myShare)} your share`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Groups View ──────────────────────────────────────────────────────────────

function GroupsView({
  onSelectGroup,
}: {
  onSelectGroup: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const filtered = GROUPS.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalOwed = GROUPS.filter((g) => g.myBalance > 0).reduce((s, g) => s + g.myBalance, 0);
  const totalOwes = GROUPS.filter((g) => g.myBalance < 0).reduce((s, g) => s + Math.abs(g.myBalance), 0);

  return (
    <div className="p-5 lg:p-6 max-w-4xl mx-auto space-y-5">
      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
          <ArrowDownLeft className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">Owed to you</span>
          <span className="text-sm font-mono font-bold text-primary">{fmt(totalOwed)}</span>
        </div>
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2">
          <ArrowUpRight className="w-3.5 h-3.5 text-destructive" />
          <span className="text-xs text-muted-foreground">You owe</span>
          <span className="text-sm font-mono font-bold text-destructive">{fmt(totalOwes)}</span>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups..."
            className="w-full pl-9 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <button
          onClick={() => setShowNewGroup(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Group
        </button>
      </div>

      {/* New group inline form */}
      {showNewGroup && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-primary/30 rounded-xl p-5"
        >
          <h3 className="text-sm font-bold text-foreground mb-4">Create a new group</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. Bali Trip 2025"
              autoFocus
              className="flex-1 px-3 py-2.5 bg-input-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            <button
              onClick={() => setShowNewGroup(false)}
              className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={!newGroupName.trim()}
            >
              Create
            </button>
            <button
              onClick={() => setShowNewGroup(false)}
              className="px-3 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Groups grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((group) => {
          const members = group.memberIds.map(getUser);
          return (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className="bg-card border border-border rounded-xl p-5 text-left hover:border-white/15 hover:shadow-xl hover:shadow-black/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">{group.emoji}</span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {group.name}
                    </h3>
                    <span className="text-[11px] font-medium text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">
                      {group.category}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
              </div>

              {/* Avatars */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex -space-x-2">
                  {members.slice(0, 5).map((m) => (
                    <div
                      key={m.id}
                      title={m.name}
                      className="w-6 h-6 rounded-full border-[1.5px] border-card flex items-center justify-center text-[9px] font-bold"
                      style={{ backgroundColor: m.color, color: "#052e16" }}
                    >
                      {m.initials[0]}
                    </div>
                  ))}
                  {members.length > 5 && (
                    <div className="w-6 h-6 rounded-full border-[1.5px] border-card bg-secondary flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                      +{members.length - 5}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{members.length} members</span>
                <span className="text-xs text-muted-foreground ml-auto">{group.lastActivity}</span>
              </div>

              {/* Balance footer */}
              <div className="flex items-end justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Total expenses</p>
                  <p className="text-sm font-mono font-bold text-foreground">
                    {fmt(group.totalExpenses)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground mb-0.5">Your balance</p>
                  <p
                    className={`text-sm font-mono font-bold ${
                      group.myBalance >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {group.myBalance >= 0 ? "+" : ""}
                    {fmt(group.myBalance)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No groups match your search</p>
          <p className="text-xs mt-1">Try a different term or create a new group</p>
        </div>
      )}
    </div>
  );
}

// ─── Add Expense Modal ────────────────────────────────────────────────────────

function AddExpenseModal({
  groupId,
  onClose,
  onAdd,
}: {
  groupId: string;
  onClose: () => void;
  onAdd: () => void;
}) {
  const group = getGroup(groupId);
  const members = group.memberIds.map(getUser);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(CURRENT_USER_ID);
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  const parsedAmount = parseFloat(amount) || 0;
  const perPerson = parsedAmount / members.length;

  const totalCustom = Object.values(customSplits).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const customValid = Math.abs(totalCustom - parsedAmount) < 0.01;

  const canSubmit = description.trim() && parsedAmount > 0 && (splitMode === "equal" || customValid);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h3 className="font-bold text-foreground text-sm">Add expense</h3>
            <p className="text-xs text-muted-foreground">
              {group.emoji} {group.name}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner at Nobu"
              autoFocus
              className="w-full px-3 py-2.5 bg-input-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono pointer-events-none">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="w-full pl-7 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
              Paid by
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                  {m.id === CURRENT_USER_ID ? " (you)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
              Split method
            </label>
            <div className="flex bg-secondary/40 rounded-lg p-1 border border-border mb-3">
              {(["equal", "custom"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSplitMode(m)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    splitMode === m
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "equal" ? "Split equally" : "Custom amounts"}
                </button>
              ))}
            </div>

            {splitMode === "equal" && parsedAmount > 0 && (
              <div className="space-y-2 bg-secondary/20 rounded-lg p-3 border border-border">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2.5">
                    <Avatar userId={m.id} size="xs" />
                    <span className="text-xs text-foreground flex-1">
                      {m.name}
                      {m.id === CURRENT_USER_ID ? " (you)" : ""}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{fmt(perPerson)}</span>
                  </div>
                ))}
              </div>
            )}

            {splitMode === "custom" && (
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2.5">
                    <Avatar userId={m.id} size="xs" />
                    <span className="text-xs text-foreground flex-1 truncate">
                      {m.name}
                      {m.id === CURRENT_USER_ID ? " (you)" : ""}
                    </span>
                    <div className="relative w-24">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono pointer-events-none">
                        $
                      </span>
                      <input
                        type="number"
                        value={customSplits[m.id] || ""}
                        onChange={(e) =>
                          setCustomSplits((prev) => ({ ...prev, [m.id]: e.target.value }))
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-5 pr-2 py-1.5 bg-input-background border border-border rounded-md text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/40"
                      />
                    </div>
                  </div>
                ))}
                {parsedAmount > 0 && (
                  <div className={`flex items-center justify-between text-xs mt-2 pt-2 border-t border-border font-mono ${customValid ? "text-primary" : "text-destructive"}`}>
                    <span>Total assigned</span>
                    <span>{fmt(totalCustom)} / {fmt(parsedAmount)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3 shrink-0 border-t border-border pt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-white/15 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            disabled={!canSubmit}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add expense
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Settle Up Modal ──────────────────────────────────────────────────────────

function SettleUpModal({
  groupId,
  suggestions,
  onClose,
}: {
  groupId: string;
  suggestions: { from: UserData; to: UserData; amount: number }[];
  onClose: () => void;
}) {
  const group = getGroup(groupId);
  const others = group.memberIds.filter((id) => id !== CURRENT_USER_ID).map(getUser);
  const [selectedUserId, setSelectedUserId] = useState(others[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);

  const suggestion = suggestions.find(
    (s) => s.from.id === CURRENT_USER_ID && s.to.id === selectedUserId
  );

  const handleRecord = () => {
    setDone(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground text-sm">Settle up</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <p className="font-semibold text-foreground text-sm">Payment recorded!</p>
            <p className="text-xs text-muted-foreground mt-1">Balances have been updated.</p>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-4">
              <p className="text-xs text-muted-foreground">
                Record a payment to square up your balances in{" "}
                <span className="text-foreground font-medium">{group.name}</span>.
              </p>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Pay to
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    setAmount("");
                  }}
                  className="w-full px-3 py-2.5 bg-input-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {others.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {suggestion && (
                <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-lg px-3 py-2">
                  <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground flex-1">
                    Suggested amount to settle:
                  </p>
                  <button
                    onClick={() => setAmount(suggestion.amount.toFixed(2))}
                    className="text-xs font-mono font-bold text-primary hover:underline"
                  >
                    {fmt(suggestion.amount)}
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="w-full pl-7 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRecord}
                disabled={!selectedUserId || !parseFloat(amount)}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Record payment
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── Group Detail View ────────────────────────────────────────────────────────

function GroupDetailView({
  groupId,
  onBack,
}: {
  groupId: string;
  onBack: () => void;
}) {
  const group = getGroup(groupId);
  const members = group.memberIds.map(getUser);
  const expenses = EXPENSES.filter((e) => e.groupId === groupId).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const [tab, setTab] = useState<"expenses" | "balances" | "members">("expenses");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);

  // Compute per-member net balances from expenses
  const memberBalances = useMemo(
    () =>
      members.map((m) => {
        let balance = 0;
        expenses.forEach((e) => {
          if (e.paidById === m.id) balance += e.amount;
          balance -= e.splits[m.id] || 0;
        });
        return { user: m, balance: Math.round(balance * 100) / 100 };
      }),
    [expenses, members]
  );

  // Greedy settlement algorithm
  const settlements = useMemo(() => {
    const result: { from: UserData; to: UserData; amount: number }[] = [];
    const pos = memberBalances.filter((b) => b.balance > 0.005).map((b) => ({ ...b }));
    const neg = memberBalances.filter((b) => b.balance < -0.005).map((b) => ({ ...b, balance: -b.balance }));
    let pi = 0, ni = 0;
    while (pi < pos.length && ni < neg.length) {
      const amt = Math.min(pos[pi].balance, neg[ni].balance);
      if (amt > 0.005) {
        result.push({ from: neg[ni].user, to: pos[pi].user, amount: Math.round(amt * 100) / 100 });
      }
      pos[pi].balance -= amt;
      neg[ni].balance -= amt;
      if (pos[pi].balance < 0.005) pi++;
      if (neg[ni].balance < 0.005) ni++;
    }
    return result;
  }, [memberBalances]);

  const myBalance = memberBalances.find((b) => b.user.id === CURRENT_USER_ID)?.balance ?? 0;
  const maxAbsBalance = Math.max(...memberBalances.map((b) => Math.abs(b.balance)), 1);

  return (
    <>
      <div className="p-5 lg:p-6 max-w-4xl mx-auto space-y-5">
        {/* Group header */}
        <div className="flex items-start gap-3 justify-between flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Back to groups"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <span className="text-2xl select-none">{group.emoji}</span>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">{group.name}</h2>
              <p className="text-xs text-muted-foreground">
                {members.length} members · {fmt(group.totalExpenses)} total · {expenses.length} expenses
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-10 sm:ml-0">
            <button
              onClick={() => setShowSettleUp(true)}
              className="px-3 py-2 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-white/15 transition-colors"
            >
              Settle up
            </button>
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add expense
            </button>
          </div>
        </div>

        {/* My balance banner */}
        <div
          className={`rounded-xl p-4 flex items-center gap-3 ${
            myBalance >= 0
              ? "bg-primary/8 border border-primary/20"
              : "bg-destructive/8 border border-destructive/20"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              myBalance >= 0 ? "bg-primary/15" : "bg-destructive/15"
            }`}
          >
            {myBalance >= 0 ? (
              <ArrowDownLeft className="w-4 h-4 text-primary" />
            ) : (
              <ArrowUpRight className="w-4 h-4 text-destructive" />
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-bold ${myBalance >= 0 ? "text-primary" : "text-destructive"}`}>
              {myBalance >= 0
                ? `You are owed ${fmt(myBalance)}`
                : `You owe ${fmt(Math.abs(myBalance))}`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {myBalance >= 0
                ? "Others in this group owe you money — settle to clear the balance."
                : "You have an outstanding balance to settle in this group."}
            </p>
          </div>
          <span className={`text-xl font-mono font-bold shrink-0 ${myBalance >= 0 ? "text-primary" : "text-destructive"}`}>
            {myBalance >= 0 ? "+" : ""}{fmt(myBalance)}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border">
          {(["expenses", "balances", "members"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
              {t === "expenses" && (
                <span className="ml-2 text-[10px] font-bold bg-secondary/70 text-muted-foreground px-1.5 py-0.5 rounded-full">
                  {expenses.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Expenses tab */}
        {tab === "expenses" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {addedFlash && (
              <div className="flex items-center gap-2 px-5 py-3 bg-primary/10 border-b border-primary/20">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-semibold">Expense added successfully</span>
              </div>
            )}
            {expenses.map((expense, idx) => {
              const payer = getUser(expense.paidById);
              const myShare = expense.splits[CURRENT_USER_ID] || 0;
              const iPaid = expense.paidById === CURRENT_USER_ID;
              return (
                <div
                  key={expense.id}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors ${
                    idx < expenses.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="text-xl w-7 text-center shrink-0 select-none">{expense.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{expense.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {iPaid ? "You" : payer.name.split(" ")[0]} paid {fmt(expense.amount)} · {expense.date}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-mono font-bold text-foreground">{fmt(expense.amount)}</p>
                    <p
                      className={`text-[11px] font-mono ${iPaid ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {iPaid
                        ? `+${fmt(expense.amount - myShare)} lent`
                        : `${fmt(myShare)} share`}
                    </p>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors ml-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {expenses.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No expenses yet</p>
                <p className="text-xs mt-1">Add your first expense to get started</p>
              </div>
            )}
          </div>
        )}

        {/* Balances tab */}
        {tab === "balances" && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="text-sm font-bold text-foreground mb-4">Member Balances</h4>
              <div className="space-y-4">
                {memberBalances.map(({ user: u, balance }) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <Avatar userId={u.id} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-semibold text-foreground">
                          {u.name}
                          {u.id === CURRENT_USER_ID ? " (you)" : ""}
                        </p>
                        <span
                          className={`text-xs font-mono font-bold ${
                            balance >= 0 ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {balance >= 0 ? "+" : ""}
                          {fmt(balance)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            balance >= 0 ? "bg-primary" : "bg-destructive"
                          }`}
                          style={{
                            width: `${(Math.abs(balance) / maxAbsBalance) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {settlements.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h4 className="text-sm font-bold text-foreground mb-1">Suggested Settlements</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Minimum transactions to clear all balances
                </p>
                <div className="space-y-3">
                  {settlements.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar userId={s.from.id} size="sm" />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground">
                          {s.from.id === CURRENT_USER_ID ? "You" : s.from.name.split(" ")[0]}
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-xs font-semibold text-foreground">
                          {s.to.id === CURRENT_USER_ID ? "You" : s.to.name.split(" ")[0]}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground">
                        {fmt(s.amount)}
                      </span>
                      <button
                        onClick={() => setShowSettleUp(true)}
                        className="text-xs text-primary hover:underline font-semibold shrink-0"
                      >
                        Settle
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Members tab */}
        {tab === "members" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h4 className="text-sm font-bold text-foreground">Members ({members.length})</h4>
              <button className="flex items-center gap-1.5 text-xs text-accent hover:underline font-semibold">
                <UserPlus className="w-3.5 h-3.5" />
                Add by email
              </button>
            </div>
            {members.map((m, idx) => {
              const bal = memberBalances.find((b) => b.user.id === m.id);
              const isOwner = m.id === CURRENT_USER_ID;
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors ${
                    idx < members.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <Avatar userId={m.id} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{m.name}</p>
                      {isOwner && (
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <span
                    className={`text-sm font-mono font-bold ${
                      (bal?.balance ?? 0) >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {(bal?.balance ?? 0) >= 0 ? "+" : ""}
                    {fmt(bal?.balance ?? 0)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddExpense && (
        <AddExpenseModal
          groupId={groupId}
          onClose={() => setShowAddExpense(false)}
          onAdd={() => {
            setShowAddExpense(false);
            setAddedFlash(true);
            setTimeout(() => setAddedFlash(false), 3000);
          }}
        />
      )}
      {showSettleUp && (
        <SettleUpModal
          groupId={groupId}
          suggestions={settlements}
          onClose={() => setShowSettleUp(false)}
        />
      )}
    </>
  );
}

// ─── Activity View ────────────────────────────────────────────────────────────

function ActivityView() {
  const typeConfig = {
    expense_added: { Icon: Receipt, color: "text-accent", bg: "bg-accent/10", label: "Expense" },
    settlement: { Icon: Check, color: "text-primary", bg: "bg-primary/10", label: "Settlement" },
    member_added: { Icon: UserPlus, color: "text-blue-400", bg: "bg-blue-400/10", label: "Member" },
    group_created: { Icon: Users, color: "text-orange-400", bg: "bg-orange-400/10", label: "Group" },
  };

  return (
    <div className="p-5 lg:p-6 max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Activity Log</h3>
          <p className="text-xs text-muted-foreground">All changes across your groups, newest first</p>
        </div>
        <div>
          {ACTIVITY_LOG.map((item, idx) => {
            const cfg = typeConfig[item.type];
            const { Icon } = cfg;
            const group = getGroup(item.groupId);
            const user = getUser(item.userId);
            return (
              <div
                key={item.id}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors ${
                  idx < ACTIVITY_LOG.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}
                >
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">{item.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: user.color }}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {group.emoji} {group.name}
                    </span>
                    <span className="text-muted-foreground text-[11px]">·</span>
                    <span className="text-[11px] text-muted-foreground">{item.time}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide shrink-0 mt-1 ${cfg.color}`}
                >
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("g1");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isLoggedIn) {
    return <AuthScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const handleSelectGroup = (id: string) => {
    setSelectedGroupId(id);
    setView("group-detail");
  };

  const viewMeta: Record<View, { title: string; subtitle?: string }> = {
    dashboard: { title: "Dashboard", subtitle: "Good morning, Alex" },
    groups: { title: "Groups", subtitle: `${GROUPS.length} active groups` },
    "group-detail": {
      title: getGroup(selectedGroupId).name,
      subtitle: `${getGroup(selectedGroupId).memberIds.length} members`,
    },
    activity: { title: "Activity", subtitle: "Recent changes across all groups" },
  };

  const { title, subtitle } = viewMeta[view];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar
        view={view}
        onNavigate={setView}
        onLogout={() => setIsLoggedIn(false)}
        onSelectGroup={handleSelectGroup}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/20">
          {view === "dashboard" && (
            <DashboardView onNavigate={setView} onSelectGroup={handleSelectGroup} />
          )}
          {view === "groups" && <GroupsView onSelectGroup={handleSelectGroup} />}
          {view === "group-detail" && (
            <GroupDetailView
              groupId={selectedGroupId}
              onBack={() => setView("groups")}
            />
          )}
          {view === "activity" && <ActivityView />}
        </main>
      </div>
    </div>
  );
}
