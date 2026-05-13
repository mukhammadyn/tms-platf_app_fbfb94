import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  MapPin,
  Users,
  Truck,
  Building2,
  CreditCard,
  Mail,
  Star,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  Package,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types/common';

interface NavGroupItem extends NavItem {
  children?: NavGroupItem[];
}

const mainNavItems: NavGroupItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
  },
  {
    label: 'Bids',
    href: '/bids',
    icon: FileText,
  },
  {
    label: 'Tracking',
    href: '/tracking',
    icon: MapPin,
  },
];

const fleetNavItems: NavGroupItem[] = [
  {
    label: 'Drivers',
    href: '/drivers',
    icon: UserCircle,
  },
  {
    label: 'Vehicles',
    href: '/vehicles',
    icon: Truck,
  },
  {
    label: 'Carriers',
    href: '/carriers',
    icon: Building2,
  },
];

const financeNavItems: NavGroupItem[] = [
  {
    label: 'Finance',
    href: '/finance',
    icon: CreditCard,
  },
];

const commsNavItems: NavGroupItem[] = [
  {
    label: 'Messages',
    href: '/messages',
    icon: Mail,
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    label: 'Reviews',
    href: '/reviews',
    icon: Star,
  },
];

const adminNavItems: NavGroupItem[] = [
  {
    label: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface NavSectionProps {
  title: string;
  items: NavGroupItem[];
  collapsed: boolean;
}

function NavSection({ title, items, collapsed }: NavSectionProps) {
  const location = useLocation();

  return (
    <div className="mb-3">
      {!collapsed && (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 px-3 mb-1">
          {title}
        </p>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon as React.ComponentType<{ className?: string }>;
          const isActive = location.pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                )}
                title={collapsed ? item.label : undefined}
              >
                {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (v: boolean) => void;
  className?: string;
}

export function Sidebar({ collapsed = false, onCollapsedChange, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border transition-all duration-200',
        collapsed ? 'w-14' : 'w-60',
        className
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <Truck className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sidebar-foreground text-base tracking-tight">
              FreightOS
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        <NavSection title="Main" items={mainNavItems} collapsed={collapsed} />
        <div className="my-2 border-t border-sidebar-border" />
        <NavSection title="Fleet" items={fleetNavItems} collapsed={collapsed} />
        <div className="my-2 border-t border-sidebar-border" />
        <NavSection title="Finance" items={financeNavItems} collapsed={collapsed} />
        <div className="my-2 border-t border-sidebar-border" />
        <NavSection title="Communications" items={commsNavItems} collapsed={collapsed} />
        <div className="my-2 border-t border-sidebar-border" />
        <NavSection title="Administration" items={adminNavItems} collapsed={collapsed} />
      </nav>

      {/* Collapse toggle */}
      <div className="flex-shrink-0 border-t border-sidebar-border p-2">
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors duration-150 text-xs"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronDown className="h-4 w-4 rotate-90" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
