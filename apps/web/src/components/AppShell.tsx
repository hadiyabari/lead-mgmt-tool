import Link from 'next/link';
import type { ReactNode } from 'react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/sources', label: 'Sources' },
  { href: '/dashboard/outbox', label: 'Outbox' },
  { href: '/dashboard/runs', label: 'Runs' },
  { href: '/dashboard/campaigns', label: 'Campaigns' },
  { href: '/dashboard/ledger', label: 'Contact ledger' },
  { href: '/settings', label: 'Settings' },
];

export function AppShell({
  children,
  title,
  userEmail,
  userRole,
}: {
  children: ReactNode;
  title: string;
  userEmail?: string | null;
  userRole?: string | null;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          LeadPilot
          <span>Threezero Agency</span>
        </div>
        <ul className="nav-list">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          {userEmail && <div>{userEmail}</div>}
          {userRole && (
            <div style={{ marginTop: 4 }}>
              <span className="badge badge-muted">{userRole}</span>
            </div>
          )}
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">{title}</div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
