'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  FolderKanban,
  Search,
  Settings,
  Sparkles,
  Sun,
  UserRound,
  X,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const sidebarGroups = [
  {
    label: 'Operate',
    items: [
      { icon: LayoutDashboard, label: 'Overview', href: '/developer-dashboard', note: 'Monitor and alert flow' },
      { icon: FolderKanban, label: 'My project', href: '/developer-dashboard/projects', note: 'Map APIs to apps' },
      { icon: BarChart3, label: 'Usage analytics', href: '/developer-dashboard/analytics', note: 'Health, quota, and risk trends' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { icon: CreditCard, label: 'Billing', href: '/developer-dashboard/billing', note: 'Workspace plan only' },
      { icon: Settings, label: 'Settings', href: '/developer-dashboard/settings', note: 'Connection defaults' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { icon: HelpCircle, label: 'Documentation', href: '/docs', note: 'Compare guides and examples' },
      { icon: ExternalLink, label: 'Marketplace', href: '/api-marketplace', note: 'Save and evaluate APIs' },
    ],
  },
];

const dashboardSearchItems = [
  { label: 'Dashboard overview', href: '/developer-dashboard' },
  { label: 'My project', href: '/developer-dashboard/projects' },
  { label: 'Usage analytics', href: '/developer-dashboard/analytics' },
  { label: 'Workspace billing', href: '/developer-dashboard/billing' },
  { label: 'Workspace settings', href: '/developer-dashboard/settings' },
  { label: 'API marketplace', href: '/api-marketplace' },
  { label: 'Documentation', href: '/docs' },
];

const notificationItems = [
  {
    title: 'Upload the first owned API',
    detail: 'The dashboard gets useful once one real API is registered with a health endpoint, expiry date, and alert route.',
    href: '/developer-dashboard/projects?newProject=true',
  },
  {
    title: 'Run the first monitoring check',
    detail: 'A registered API only turns into analytics after APIverse captures health, quota, expiry, and safe posture signals.',
    href: '/developer-dashboard/projects',
  },
  {
    title: 'Alerts are driven by checks',
    detail: 'Expiry warnings, low quota, endpoint failures, and vulnerability hints now flow from monitoring checks into the dashboard.',
    href: '/developer-dashboard/analytics',
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    email: string;
    name: string;
  };
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const activeGroupLabel = useMemo(() => {
    for (const group of sidebarGroups) {
      const match = group.items.find((item) => item.href === pathname);
      if (match) {
        return match.label;
      }
    }
    return 'Dashboard';
  }, [pathname]);

  const searchResults = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return [];
    return dashboardSearchItems.filter((item) => item.label.toLowerCase().includes(query)).slice(0, 5);
  }, [searchValue]);

  useEffect(() => {
    setNotificationsOpen(false);
    setProfileOpen(false);
    setMobileOpen(false);
    setSearchValue('');
  }, [pathname]);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      router.push('/login');
      router.refresh();
      setIsLoggingOut(false);
    }
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchValue.trim().toLowerCase();
    if (!query) return;

    const nextItem =
      searchResults[0] ??
      dashboardSearchItems.find((item) => item.label.toLowerCase().includes(query));

    if (nextItem) {
      router.push(nextItem.href);
    }
  }

  function renderSidebar() {
    return (
      <div className="rounded-[28px] border border-stone-300/70 bg-[#fff8ef]/84 p-4 backdrop-blur-xl dark:border-white/8 dark:bg-[#0b1520]/86">
        {!sidebarCollapsed && (
          <div className="border-b border-stone-300/70 px-2 pb-4 dark:border-white/8">
            <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Workspace</p>
            <p className="mt-2 font-display text-2xl text-stone-950 dark:text-stone-50">{activeGroupLabel}</p>
          </div>
        )}

        <div className={`${sidebarCollapsed ? 'mt-0 space-y-4' : 'mt-4 space-y-5'}`}>
          {sidebarGroups.map((group) => (
            <section key={group.label}>
              {!sidebarCollapsed && (
                <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-stone-500">
                  {group.label}
                </p>
              )}
              <div className="mt-2 space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center rounded-[20px] px-3 py-3 transition ${
                        isActive
                          ? 'bg-[#f7ece4] text-[#b8573f] dark:bg-[#211614] dark:text-[#efb28f]'
                          : 'text-stone-700 hover:bg-white/70 dark:text-stone-300 dark:hover:bg-white/5'
                      } ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        isActive ? 'bg-[#f2dfd5] dark:bg-[#2a1815]' : 'bg-white/70 dark:bg-white/5'
                      }`}>
                        <Icon size={16} />
                      </div>
                      {!sidebarCollapsed && (
                        <>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{item.label}</p>
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{item.note}</p>
                          </div>
                          <ChevronRight size={14} className="text-stone-400" />
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`mt-5 flex w-full rounded-[22px] border border-stone-300/70 bg-white/65 p-3 text-left transition hover:bg-white/85 disabled:cursor-not-allowed dark:border-white/8 dark:bg-white/5 dark:hover:bg-white/8 ${
            sidebarCollapsed ? 'justify-center' : 'items-center gap-3'
          }`}
          title={sidebarCollapsed ? 'Sign out' : undefined}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)]">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          {!sidebarCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">{user.name}</p>
                <p className="truncate text-xs text-stone-500 dark:text-stone-400">{user.email}</p>
              </div>
              <LogOut size={15} className="text-stone-400" />
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7efe5] text-stone-900 transition-colors duration-300 dark:bg-[#050d1a] dark:text-[#e2e8f0]">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 md:px-6">
        <div className="mx-auto max-w-screen-2xl rounded-full border border-stone-300/70 bg-[#fff8ef]/85 px-4 shadow-[0_18px_48px_rgba(89,64,39,0.12)] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-[#101c24]/82 dark:shadow-[0_18px_48px_rgba(0,0,0,0.28)] md:px-6">
          <div className="flex h-14 items-center justify-between gap-4">
            <Link href="/developer-dashboard" className="flex items-center gap-3">
              <AppLogo size={30} />
              <div className="leading-none">
                <span className="font-display text-xl tracking-tight text-stone-900 dark:text-stone-100">
                  APIverse
                </span>
                <p className="eyebrow mt-1 text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                  Interface for ambitious teams
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                <input
                  suppressHydrationWarning
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search APIs, endpoints..."
                  className="w-64 rounded-full border border-stone-300/70 bg-white/70 py-2.5 pl-11 pr-4 text-sm text-stone-700 outline-none transition placeholder:text-stone-400 focus:border-stone-900 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:placeholder:text-stone-500 dark:focus:border-white/20"
                />
                {searchResults.length > 0 && (
                  <div className="absolute left-0 top-[calc(100%+10px)] z-20 w-full rounded-[22px] border border-stone-300/70 bg-[#fff8ef]/95 p-2 shadow-[0_22px_40px_rgba(96,70,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1720]/95">
                    {searchResults.map((item) => (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => router.push(item.href)}
                        className="flex w-full items-center justify-between rounded-[16px] px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-white/70 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-white/5 dark:hover:text-stone-50"
                      >
                        <span>{item.label}</span>
                        <ChevronRight size={14} className="text-stone-400" />
                      </button>
                    ))}
                  </div>
                )}
              </form>

              <button
                onClick={toggleTheme}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-700 transition hover:border-stone-900 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-white"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((current) => !current);
                    setProfileOpen(false);
                  }}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-700 transition hover:border-stone-900 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-white"
                  aria-label="Open notifications"
                >
                  <Bell size={16} />
                  <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-[#d85f43]" />
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-[320px] rounded-[24px] border border-stone-300/70 bg-[#fff8ef]/95 p-3 shadow-[0_22px_40px_rgba(96,70,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1720]/95">
                    <div className="mb-2 flex items-center justify-between px-2">
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Notifications</p>
                      <Link href="/developer-dashboard/analytics" className="text-xs font-semibold text-[#d85f43]">
                        View all
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {notificationItems.map((item) => (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => router.push(item.href)}
                          className="w-full rounded-[18px] border border-stone-300/70 bg-white/70 px-4 py-3 text-left transition hover:border-stone-900 dark:border-white/8 dark:bg-white/5 dark:hover:border-white/20"
                        >
                          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-400">{item.detail}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((current) => !current);
                    setNotificationsOpen(false);
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)]"
                  aria-label="Open profile menu"
                >
                  <span className="text-xs font-bold text-white">{initials}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-[270px] rounded-[24px] border border-stone-300/70 bg-[#fff8ef]/95 p-3 shadow-[0_22px_40px_rgba(96,70,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1720]/95">
                    <div className="rounded-[18px] border border-stone-300/70 bg-white/70 p-4 dark:border-white/8 dark:bg-white/5">
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{user.name}</p>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{user.email}</p>
                    </div>
                    <div className="mt-3 space-y-2">
                      <button
                        type="button"
                        onClick={() => router.push('/developer-dashboard/settings')}
                        className="flex w-full items-center gap-3 rounded-[18px] px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-white/70 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-white/5 dark:hover:text-stone-50"
                      >
                        <UserRound size={15} />
                        Workspace settings
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push('/developer-dashboard/billing')}
                        className="flex w-full items-center gap-3 rounded-[18px] px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-white/70 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-white/5 dark:hover:text-stone-50"
                      >
                        <Sparkles size={15} />
                        Billing and plans
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-3 rounded-[18px] px-3 py-2 text-left text-sm text-[#d85f43] transition hover:bg-[#fff0df] disabled:cursor-not-allowed dark:hover:bg-[#2a1815]"
                      >
                        <LogOut size={15} />
                        {isLoggingOut ? 'Signing out...' : 'Sign out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-700 transition dark:border-white/10 dark:bg-white/5 dark:text-stone-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={() => setMobileOpen((current) => !current)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-700 transition dark:border-white/10 dark:bg-white/5 dark:text-stone-200"
                aria-label="Toggle navigation"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 pb-8 pt-24 md:px-6">
        <div className="flex gap-6">
          <aside
            className={`sticky top-24 relative hidden h-fit shrink-0 self-start transition-[width] duration-300 ease-out lg:block ${
              sidebarCollapsed ? 'w-[92px]' : 'w-[290px]'
            }`}
          >
            <button
              type="button"
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="absolute -right-3 top-6 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300/70 bg-[#fff8ef]/92 text-stone-700 shadow-[0_14px_28px_rgba(89,64,39,0.14)] backdrop-blur-xl transition hover:border-stone-900 hover:text-stone-950 dark:border-white/10 dark:bg-[#101c24]/92 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-white"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            {renderSidebar()}
          </aside>

          <div className="min-w-0 flex-1">
            {mobileOpen && (
              <div className="mb-6 rounded-[28px] border border-stone-300/70 bg-[#fff8ef]/88 p-4 backdrop-blur-xl dark:border-white/8 dark:bg-[#0b1520]/90 lg:hidden">
                {renderSidebar()}
              </div>
            )}

            <main>{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
