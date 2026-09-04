import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, 
  FlaskConical, 
  Stethoscope, 
  Building2, 
  IndianRupee, 
  ArrowRightLeft, 
  History, 
  Code, 
  Pin, 
  PinOff,
  ChevronRight,
  ShieldCheck,
  FileText,
  UserCheck
} from 'lucide-react';
import { SecondMedicLogo } from './SecondMedicLogo';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingVerificationCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  pendingVerificationCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  // SIDE PANEL - EXTENSION ON HOVER REQUIREMENT
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const isExpanded = isHovered || isPinned || isMobileOpen;

  const role = currentUser.role;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
    roles: UserRole[];
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Overview & Metrics',
      icon: LayoutDashboard,
      roles: ['manager', 'staff', 'client'],
    },
    {
      id: 'work_orders',
      label: 'Work Orders & Samples',
      icon: FlaskConical,
      roles: ['manager', 'staff', 'client'],
    },
    {
      // MANDATORY PROMPT REQUIREMENT: Staff login should also have access to Central Result Verification & Diagnostic Reports Desk
      id: 'result_verification',
      label: 'Result Verification Desk',
      icon: Stethoscope,
      badge: pendingVerificationCount > 0 ? pendingVerificationCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
      roles: ['manager', 'staff', 'client'],
    },
    {
      id: 'clients',
      label: 'Client & DSA Facilities',
      icon: Building2,
      roles: ['manager', 'staff'],
    },
    {
      id: 'staff_revenue',
      label: role === 'staff' ? 'My Revenue Flow' : 'Staff Revenue Flow',
      icon: IndianRupee,
      roles: ['manager', 'staff'],
    },
    {
      id: 'staff_mapping',
      label: 'Staff vs Client Mapping',
      icon: ArrowRightLeft,
      roles: ['manager'],
    },
    {
      id: 'audit_logs',
      label: 'Central Audit Log',
      icon: History,
      roles: ['manager'],
    },
    {
      id: 'api_docs',
      label: 'API & Dev Specs',
      icon: Code,
      roles: ['manager', 'staff', 'client'],
    },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Side Panel Container with smooth width extension on hover */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out select-none shadow-2xl ${
          isExpanded ? 'w-64' : 'w-16'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800 shrink-0 overflow-hidden">
          {isExpanded ? (
            <div className="flex items-center justify-between w-full">
              <SecondMedicLogo size="sm" showSubtitle={true} />
              <button
                onClick={() => setIsPinned(!isPinned)}
                className="hidden lg:flex p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title={isPinned ? 'Unpin sidebar (collapse on hover out)' : 'Pin sidebar expanded'}
              >
                {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-cyan-500/20">
                SM
              </div>
            </div>
          )}
        </div>

        {/* User Role Badge in Expanded Mode */}
        {isExpanded && (
          <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Role:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                role === 'manager'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : role === 'staff'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {role === 'manager' ? 'Manager (Admin)' : role === 'staff' ? 'Staff Phlebotomist' : 'Client / DSA'}
              </span>
            </div>
            <div className="font-semibold text-xs text-slate-200 mt-1 truncate">
              {currentUser.name}
            </div>
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`group relative flex items-center w-full px-2.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-md shadow-cyan-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                } ${isExpanded ? 'justify-start gap-3' : 'justify-center'}`}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                }`} />

                {isExpanded && (
                  <span className="truncate flex-1 text-left whitespace-nowrap">
                    {item.label}
                  </span>
                )}

                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                    item.badgeColor || 'bg-cyan-500 text-slate-950'
                  } ${!isExpanded ? 'absolute -top-1 -right-1' : ''}`}>
                    {item.badge}
                  </span>
                )}

                {/* Hover indicator tooltip when collapsed */}
                {!isExpanded && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Extension / Status Indicator */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          {isExpanded ? (
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>SecondMedic Grid Online</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Extension on hover active
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Grid Online" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
