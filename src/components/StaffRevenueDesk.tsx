import React, { useState } from 'react';
import { User, WorkOrder } from '../types';
import { 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  IndianRupee, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  Users, 
  PieChart, 
  Download,
  Building2,
  Sparkles,
  Search
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface StaffRevenueDeskProps {
  currentUser: User;
  workOrders: WorkOrder[];
  allStaff: User[];
}

export const StaffRevenueDesk: React.FC<StaffRevenueDeskProps> = ({
  currentUser,
  workOrders,
  allStaff,
}) => {
  const isManager = currentUser.role === 'manager';
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    isManager ? 'all' : currentUser.id
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Target staff orders
  const activeOrders = workOrders.filter(wo => {
    if (selectedStaffId !== 'all') {
      return wo.staffId === selectedStaffId;
    }
    return true;
  });

  // Calculate staff-wise aggregation
  const staffMetrics = allStaff.map(staff => {
    const staffOrders = workOrders.filter(w => w.staffId === staff.id);
    const totalRevenue = staffOrders.reduce((sum, w) => sum + w.staffRevenueAttributed, 0);
    const totalCommission = staffOrders.reduce((sum, w) => sum + w.staffCommission, 0);
    const monthlyTarget = 50000;
    const targetProgress = Math.min(100, Math.round((totalRevenue / monthlyTarget) * 100));

    return {
      staffId: staff.id,
      staffName: staff.name,
      email: staff.email,
      phone: staff.phone,
      orderCount: staffOrders.length,
      totalRevenue,
      totalCommission,
      targetProgress,
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Filtered orders for detailed table
  const detailedOrders = activeOrders.filter(wo => {
    return (
      wo.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.staffName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalNetworkRevenue = workOrders.reduce((acc, w) => acc + w.b2bAmount, 0);
  const myTotalRevenue = workOrders
    .filter(w => w.staffId === currentUser.id)
    .reduce((acc, w) => acc + w.staffRevenueAttributed, 0);
  const myCommission = workOrders
    .filter(w => w.staffId === currentUser.id)
    .reduce((acc, w) => acc + w.staffCommission, 0);

  const handleExportStaffRevenue = () => {
    const data = detailedOrders.map(wo => ({
      'Order ID': wo.id,
      'Barcode': wo.barcode,
      'Staff Credited': wo.staffName,
      'Staff ID': wo.staffId,
      'Client Facility': wo.clientName,
      'Facility Type': wo.clientFacilityType,
      'Patient Name': wo.patientName,
      'Collection Timestamp': wo.collectionDateTime,
      'Attributed Revenue (₹)': wo.staffRevenueAttributed,
      'Commission / Incentive (₹)': wo.staffCommission,
      'Status': wo.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff_Revenue_Ledger');
    XLSX.writeFile(workbook, `Staff_Revenue_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {isManager ? 'Central Staff Revenue & Commission Flow' : 'My Attributed Revenue Ledger'}
                </h2>
                <p className="text-xs text-slate-300">
                  Every work order billed immediately routes credited revenue to that specific staff member.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportStaffRevenue}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Revenue Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-800/60 border border-slate-700/70 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{isManager ? 'Total Lab Network Revenue' : 'My Billed Revenue'}</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            ₹{(isManager ? totalNetworkRevenue : myTotalRevenue).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>100% Attributed to Staff Units</span>
          </div>
        </div>

        <div className="p-4 bg-slate-800/60 border border-slate-700/70 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{isManager ? 'Total Samples Processed' : 'My Orders Booked'}</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-cyan-300">
            {isManager ? workOrders.length : workOrders.filter(w => w.staffId === currentUser.id).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active verified orders</div>
        </div>

        <div className="p-4 bg-slate-800/60 border border-slate-700/70 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{isManager ? 'Active Field Staff' : 'Commission Earned (10%)'}</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-300">
            {isManager ? `${allStaff.length} Staff` : `₹${myCommission.toLocaleString('en-IN')}`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Direct incentive credit</div>
        </div>

        <div className="p-4 bg-slate-800/60 border border-slate-700/70 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>DSA B2B Revenue Share</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            ₹{workOrders.filter(w => w.clientFacilityType === 'DSA').reduce((sum, w) => sum + w.b2bAmount, 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1">Direct Selling Agent channel</div>
        </div>
      </div>

      {/* Manager View: Staff Leaderboard & Revenue Breakdown */}
      {isManager && (
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Staff Revenue Attribution Leaderboard</h3>
              <p className="text-xs text-slate-400">Aggregated performance and incentive distribution across staff phlebotomists</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Target Benchmark: ₹50,000 / mo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {staffMetrics.map((staff, index) => (
              <div
                key={staff.staffId}
                onClick={() => setSelectedStaffId(selectedStaffId === staff.staffId ? 'all' : staff.staffId)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedStaffId === staff.staffId
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className="font-bold text-sm text-white">{staff.staffName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                    {staff.staffId}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 my-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Billed Revenue:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">₹{staff.totalRevenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Earned Incentive (10%):</span>
                    <span className="font-mono text-amber-300">₹{staff.totalCommission.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Samples:</span>
                    <span className="font-mono text-slate-200">{staff.orderCount} Samples</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Monthly Target</span>
                    <span>{staff.targetProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                      style={{ width: `${staff.targetProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Granular Orders Breakdown Table */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/90 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">
              Detailed Revenue Transactions
            </h3>
            {selectedStaffId !== 'all' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Filtered: {allStaff.find(s => s.id === selectedStaffId)?.name}
              </span>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 inset-y-0 my-auto pointer-events-none" />
            <input
              type="text"
              placeholder="Search patient, client, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Attributed Staff</th>
                <th className="py-3 px-4">Client Facility (DSA/Clinic)</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Tests Billed</th>
                <th className="py-3 px-4">B2B Revenue Flow</th>
                <th className="py-3 px-4">Staff Commission</th>
                <th className="py-3 px-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200">
              {detailedOrders.length > 0 ? (
                detailedOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-cyan-300">{wo.id}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(wo.collectionDateTime).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-400">{wo.staffName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{wo.staffId}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{wo.clientName}</div>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        wo.clientFacilityType === 'DSA' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {wo.clientFacilityType}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{wo.patientName}</div>
                      <div className="text-[10px] text-slate-400">+91 {wo.patientPhone}</div>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                      {wo.testNames.join(', ')}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                      ₹{wo.staffRevenueAttributed}
                    </td>

                    <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">
                      +₹{wo.staffCommission}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300">
                        {wo.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No revenue transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
