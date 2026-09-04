import React from 'react';
import { User, WorkOrder, StaffClientMapping } from '../types';
import { 
  FlaskConical, 
  Stethoscope, 
  Building2, 
  IndianRupee, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Plus,
  ShieldCheck,
  Calendar,
  Sparkles,
  Phone
} from 'lucide-react';

interface OverviewDashboardProps {
  currentUser: User;
  workOrders: WorkOrder[];
  clients: User[];
  staffMembers: User[];
  mappings: StaffClientMapping[];
  onNavigateTab: (tab: string) => void;
  onOpenNewOrderModal: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  currentUser,
  workOrders,
  clients,
  staffMembers,
  mappings,
  onNavigateTab,
  onOpenNewOrderModal,
}) => {
  const role = currentUser.role;

  // Filter relevant orders
  const myStaffOrders = workOrders.filter(w => w.staffId === currentUser.id);
  const myClientOrders = workOrders.filter(w => w.clientId === currentUser.id);

  const pendingVerificationOrders = workOrders.filter(
    w => w.status === 'Central Result Verification'
  );

  const myRevenue = myStaffOrders.reduce((sum, w) => sum + w.staffRevenueAttributed, 0);
  const totalRevenue = workOrders.reduce((sum, w) => sum + w.b2bAmount, 0);
  const dsaClientsCount = clients.filter(c => c.facilityType === 'DSA').length;

  return (
    <div className="space-y-6">
      {/* Welcome & Role Highlight Card */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-cyan-950/40 border border-slate-800 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                role === 'manager'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : role === 'staff'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {role === 'manager' ? 'Super Admin & Manager Consolidated Console' : role === 'staff' ? 'Staff Phlebotomy & Technical Desk' : 'Client / DSA Partner Desk'}
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Grid Active</span>
              </span>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {role === 'manager'
                ? 'Consolidated operational console managing client onboarding, DSA facility distribution, staff revenue routing, and central result validation.'
                : role === 'staff'
                ? 'Your booked samples and generated revenue are directly attributed to your account. You have full access to the Central Result Verification Desk.'
                : 'Manage patient work orders, track specimen transit in real-time, and download digitally certified diagnostic reports.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewOrderModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book Sample Collection</span>
            </button>

            {/* Staff or Manager access to Verification */}
            <button
              onClick={() => onNavigateTab('result_verification')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>Verification Desk</span>
              {pendingVerificationOrders.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500 text-slate-950 font-extrabold ml-1">
                  {pendingVerificationOrders.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{role === 'manager' ? 'Total Lab Network Revenue' : role === 'staff' ? 'My Attributed Revenue' : 'Total Billed Amount'}</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            ₹{(role === 'manager' ? totalRevenue : role === 'staff' ? myRevenue : myClientOrders.reduce((s, w) => s + w.b2bAmount, 0)).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{role === 'staff' ? 'Credited to your staff ID' : 'Direct B2B Flow'}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{role === 'manager' ? 'Total Work Orders' : role === 'staff' ? 'My Collected Samples' : 'Patient Orders'}</span>
            <FlaskConical className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300">
            {role === 'manager' ? workOrders.length : role === 'staff' ? myStaffOrders.length : myClientOrders.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">100% Mandatory Timestamps</div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Pending Central Verification</span>
            <Stethoscope className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300">
            {pendingVerificationOrders.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting Pathologist / Staff review</div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active DSA Partners</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-300">
            {dsaClientsCount}
          </div>
          <div className="text-[11px] text-purple-400 mt-1 font-medium">Direct Selling Agents active</div>
        </div>
      </div>

      {/* Dual Section: Pending Verification Queue + Recent Work Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Work Orders */}
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-white">Recent Work Orders & Sample Ingestion</h3>
              <p className="text-xs text-slate-400">Real-time status tracking with attributed staff revenue</p>
            </div>
            <button
              onClick={() => onNavigateTab('work_orders')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {workOrders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-cyan-400 text-xs shrink-0">
                    WO
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{order.patientName}</span>
                      <span className="text-[10px] font-mono text-slate-400">({order.id})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Client: <span className="text-slate-300 font-medium">{order.clientName}</span> ({order.clientFacilityType})
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                      <span>Coll: {new Date(order.collectionDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>Staff: <strong className="text-emerald-400">{order.staffName}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                  <div>
                    <div className="font-mono font-bold text-xs text-white">₹{order.b2bAmount}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">+₹{order.staffRevenueAttributed} (Staff)</div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                    order.status === 'Verified & Approved' || order.status === 'Report Dispatched'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : order.status === 'Central Result Verification'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Central Result Verification Quick Desk + Mapping quick view */}
        <div className="space-y-6">
          {/* Quick Result Verification Card */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Pending Verification Desk</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Staff & Manager Authorized
              </span>
            </div>

            {pendingVerificationOrders.length > 0 ? (
              <div className="space-y-2.5">
                {pendingVerificationOrders.slice(0, 2).map(pOrder => (
                  <div key={pOrder.id} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-200">
                      <span>{pOrder.patientName}</span>
                      <span className="font-mono text-cyan-300">{pOrder.id}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {pOrder.testNames.join(', ')}
                    </div>
                    <button
                      onClick={() => onNavigateTab('result_verification')}
                      className="w-full mt-2 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Open in Verification Desk →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-900/60 rounded-xl text-center text-xs text-slate-400">
                All laboratory results up to date.
              </div>
            )}
          </div>

          {/* Quick Staff-Client Mapping Notice */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-white">DSA & Client Field Routing</h3>
              <span className="text-xs text-cyan-400 font-semibold">{mappings.length} Mappings</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              Staff members are dynamically mapped to DSA and clinical collection centers to ensure rapid turnaround times and transparent revenue attribution.
            </p>
            {role === 'manager' && (
              <button
                onClick={() => onNavigateTab('staff_mapping')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Manage Staff Allocations →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
