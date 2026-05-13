import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  ChevronRight,
  Settings,
  UserCircle,
  LayoutDashboard,
  ShoppingCart,
  FileText,
  MapPin,
  Truck,
  Building2,
  CreditCard,
  Mail,
  Star,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/orders': 'Orders',
  '/bids': 'Bids',
  '/tracking': 'Tracking',
  '/drivers': 'Drivers',
  '/vehicles': 'Vehicles',
  '/carriers': 'Carriers',
  '/finance': 'Finance',
  '/messages': 'Messages',
  '/notifications': 'Notifications',
  '/reviews': 'Reviews',
  '/users': 'Users',
  '/settings': 'Settings',
};

interface HeaderProps {
  onMenuClick?: () => void;
  sidebarCollapsed?: boolean;
}

export function Header({ onMenuClick, sidebarCollapsed }: HeaderProps) {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Build breadcrumb from pathname
  const segments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label = routeLabels[path] ?? (seg.charAt(0).toUpperCase() + seg.slice(1));
    return { path, label };
  });

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-card border-b border-border flex-shrink-0 gap-4">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150 flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm min-w-0">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors duration-150 flex-shrink-0">
            <LayoutDashboard className="h-3.5 w-3.5" />
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.path}>
              <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              {i === breadcrumbs.length - 1 ? (
                <span className="font-medium text-foreground truncate">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-150 truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: search, notifications, avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <div className="flex items-center">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                autoFocus
                onBlur={() => setSearchOpen(false)}
                placeholder="Search..."
                className="h-8 pl-8 pr-3 text-sm bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring/50 w-52 transition-all"
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Notifications bell */}
        <Link
          to="/notifications"
          className="relative flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
        </Link>

        {/* User avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 h-8 px-2 rounded-md hover:bg-accent transition-colors duration-150"
            aria-label="User menu"
          >
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
              {getInitials('Admin User')}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">Admin</span>
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 top-10 z-50 w-48 rounded-md border border-border bg-popover text-popover-foreground shadow-md py-1"
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <Link
                to="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
              >
                <UserCircle className="h-4 w-4" />
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
