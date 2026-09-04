import React, { useState } from 'react';
import { User, UserRole, NotificationItem } from '../types';
import { SecondMedicLogo } from './SecondMedicLogo';
import { 
  Bell, 
  ShieldCheck, 
  Link as LinkIcon, 
  Menu, 
  Check, 
  Copy, 
  IndianRupee, 
  UserCircle, 
  Lock,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
  onOpenAuthModal: (initialRole?: UserRole) => void;
  onOpenSecurityModal: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onToggleMobileMenu: () => void;
  networkRevenueTotal: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  onOpenAuthModal,
  onOpenSecurityModal,
  notifications,
  onMarkNotificationRead,
  onToggleMobileMenu,
  networkRevenueTotal,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [copiedLinkRole, setCopiedLinkRole] = useState<string | null>(null);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const copyRoleLink = (role: UserRole) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('role', role);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url.toString()).catch(() => {});
      }
      setCopiedLinkRole(role);
      setTimeout(() => setCopiedLinkRole(null), 2000);
    } catch (e) {
      console.warn('Clipboard copy error:', e);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <SecondMedicLogo size="sm" showSubtitle={false} />
        </div>

        {/* Live Network Revenue Ticker */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400">Live Lab Revenue:</span>
          <span className="font-mono font-bold text-emerald-400">
            ₹{networkRevenueTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Center: Direct Role Portals with Individual Links */}
      <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
        {(
          [
            { id: 'manager', label: 'Manager Portal', color: 'text-purple-300' },
            { id: 'staff', label: 'Staff Portal', color: 'text-emerald-300' },
            { id: 'client', label: 'Client / DSA Portal', color: 'text-cyan-300' },
          ] as const
        ).map((item) => {
          const isActive = currentUser.role === item.id;
          return (
            <div key={item.id} className="flex items-center">
              <button
                onClick={() => onSwitchRole(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={isActive ? item.color : ''}>{item.label}</span>
              </button>

              <button
                onClick={() => copyRoleLink(item.id)}
                className="p-1 text-slate-500 hover:text-cyan-400 rounded transition-colors cursor-pointer"
                title={`Copy direct link for ${item.label}`}
              >
                {copiedLinkRole === item.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Right Controls: Security, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Security & Audit Protocol Indicator */}
        <button
          onClick={onOpenSecurityModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          title="Security & RBAC Protocol"
        >
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">NABL / RBAC Security</span>
        </button>

        {/* Real-time Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Real-time lab notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-cyan-500 text-slate-950 font-extrabold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between p-3.5 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Live Real-Time Alerts</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {unreadCount} Unread
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className={`p-3.5 text-xs transition-colors cursor-pointer ${
                        notif.read ? 'bg-slate-900/60 opacity-70' : 'bg-slate-800/40 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${
                          notif.type === 'revenue' ? 'text-emerald-400' : 'text-cyan-300'
                        }`}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{notif.timestamp}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{notif.message}</p>
                      {notif.amount && (
                        <div className="mt-1 text-[11px] font-mono font-bold text-emerald-400">
                          Credited: +₹{notif.amount}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No active notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Auth Switcher */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <button
            onClick={() => onOpenAuthModal(currentUser.role)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-600 to-sky-700 flex items-center justify-center text-white text-xs font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-white leading-none truncate max-w-[120px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono capitalize">
                {currentUser.role === 'manager' ? 'Manager (Admin)' : currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
