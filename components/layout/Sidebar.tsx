'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown, ChevronRight, Zap, Menu, X,
  LayoutDashboard, Users, Building2, Clock, CalendarOff, Banknote,
  UserPlus, Target, GraduationCap, Heart, Package, FolderKanban,
  BarChart3, Settings, ShieldCheck, ScrollText, Megaphone, Headphones,
  UserCircle, FolderOpen, RefreshCcw, Clock4, AlarmClock, ClipboardList,
  Home, CalendarDays, TrendingUp, Scale, Receipt, PiggyBank, RefreshCw,
  CheckSquare, Globe, Share2, ShieldCheck as ShieldCheckIcon, Rocket, Crosshair,
  MessageSquare, Map, Award, Users2, Plane, UserCog,
  FileBarChart, BrainCircuit, Crown, GitBranch, FileText
} from 'lucide-react';
import type { NavItem } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Users, Building2, Clock, CalendarOff, Banknote,
  UserPlus, Target, GraduationCap, Heart, Package, FolderKanban,
  BarChart3, Settings, ShieldCheck, ScrollText, Megaphone, Headphones,
  UserCircle, FolderOpen, RefreshCcw, Clock4, AlarmClock, ClipboardList,
  Home, CalendarDays, TrendingUp, Scale, Receipt, PiggyBank, RefreshCw,
  CheckSquare, Globe, Share2, Rocket, Crosshair, MessageSquare, Map,
  Award, Users2, Plane, UserCog, FileBarChart, BrainCircuit, Crown,
  GitBranch, FileText, Zap, ShieldCheckIcon: ShieldCheck,
  Network: Building2, MapPin: Building2, Briefcase: FolderKanban,
  Badge: ShieldCheck, CalendarCheck: CalendarOff, ClipboardEdit: ClipboardList,
  CalendarMinus: CalendarOff, Tags: Settings, Layers: BarChart3, Puzzle: Settings,
  Play: Clock, HandCoins: PiggyBank, FilePlus: FileText, FileSignature: FileText,
  FilePlus2: FileText, ClipboardCheck: ClipboardList,
  BookOpen: GraduationCap, BookMarked: GraduationCap, ThumbsUp: Heart,
  Star: Award, Medal: Award, Box: Package, ArrowRightLeft: RefreshCcw,
  Luggage: Plane, PanelLeftOpen: BarChart3, Bookmark: FileText,
  Key: ShieldCheck, Workflow: GitBranch, History: ScrollText, Inbox: Megaphone,
  Activity: BarChart3, CreditCard: Banknote, PieChart: BarChart3,
  BarChart: BarChart3, BarChart2: BarChart3, UserCheck: Users,
  UserMinus: Users, LogOut: Settings,
};

function getIcon(name: string) {
  return ICON_MAP[name] ?? LayoutDashboard;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function loadNav() {
      setLoading(true);
      try {
        const res = await fetch('/api/navigation');
        const data = (await res.json()) as { data?: { items?: NavItem[] } };
        if (data.data?.items && Array.isArray(data.data.items)) {
          setNavItems(data.data.items);
          const currentItem = data.data.items.find((item) =>
            item.children?.some((c) => pathname.startsWith(c.href))
          );
          if (currentItem) {
            setExpandedGroups((prev) => ({ ...prev, [currentItem.id]: true }));
          }
        }
      } catch (err) {
        console.error('Failed to load navigation:', err);
      } finally {
        setLoading(false);
      }
    }
    void loadNav();
  }, [pathname]);

  function toggleGroup(id: string) {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
    const Icon = getIcon(item.icon);
    const hasChildren = item.children && item.children.length > 0;
    const expanded = expandedGroups[item.id];
    const active = isActive(item.href);

    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleGroup(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'space-between',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 10,
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'none';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon size={16} />
              {!collapsed && <span>{item.label}</span>}
            </div>
            {!collapsed && (
              expanded
                ? <ChevronDown size={14} />
                : <ChevronRight size={14} />
            )}
          </button>

          {expanded && !collapsed && (
            <div style={{ paddingLeft: 28 }}>
              {item.children!.map((child) => (
                <NavItemComponent key={child.id} item={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        className={active ? 'nav-item-active' : ''}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? '10px 0' : `10px ${depth > 0 ? 10 : 12}px`,
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 10,
          textDecoration: 'none',
          fontSize: depth > 0 ? 12 : 13,
          fontWeight: active ? 600 : 500,
          color: active ? 'var(--brand-400)' : 'var(--text-secondary)',
          transition: 'all 0.15s ease',
          marginBottom: 2,
          background: active
            ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))'
            : 'transparent',
          borderLeft: active ? '2px solid var(--brand-500)' : '2px solid transparent',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }
        }}
      >
        <Icon size={depth > 0 ? 14 : 16} />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  }

  const sidebarContent = (
    <div style={{
      width: collapsed ? 72 : 260,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-card)',
      borderRight: '1px solid var(--surface-border)',
      transition: 'width 0.25s ease',
      overflow: 'hidden',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 20px',
        borderBottom: '1px solid var(--surface-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" />
          </div>
          {!collapsed && (
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              HRNexus
            </span>
          )}

        </Link>

        {!collapsed && (
          <button
            onClick={onToggle}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
            }}
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '12px 8px' : '12px 12px' }}>
        {loading ? (
          <div style={{ padding: '20px 12px' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton" style={{ height: 36, marginBottom: 8, opacity: 0.5 }} />
            ))}
          </div>
        ) : navItems.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            {!collapsed && (
              <>
                <ShieldCheck size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>No Active Modules</p>
                <p style={{ fontSize: 11, marginTop: 4, opacity: 0.8, color: 'var(--text-secondary)' }}>
                  Contact Super Admin to allocate subscription modules for your organization.
                </p>
              </>
            )}
          </div>
        ) : (
          navItems.map((item) => (
            <NavItemComponent key={item.id} item={item} />
          ))
        )}
      </div>

      {/* Collapse toggle */}
      {collapsed && (
        <div style={{ padding: '16px 0', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onToggle}
            style={{
              background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)',
              borderRadius: 8, padding: '8px', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
            }}
          >
            <Menu size={16} />
          </button>
        </div>
      )}
    </div>
  );

  return sidebarContent;
}
