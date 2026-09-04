import React, { useState } from 'react';
import { WorkOrder, User, TestParameterResult } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Search, 
  Filter, 
  CheckCheck, 
  Send, 
  Eye, 
  Stethoscope,
  Clock,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { ReportPreviewModal } from './ReportPreviewModal';

interface CentralResultVerificationDeskProps {
  currentUser: User;
  workOrders: WorkOrder[];
  onVerifyOrder: (orderId: string, updatedResults: TestParameterResult[], notes: string) => void;
  onDispatchReport: (orderId: string) => void;
}

export const CentralResultVerificationDesk: React.FC<CentralResultVerificationDeskProps> = ({
  currentUser,
  workOrders,
  onVerifyOrder,
  onDispatchReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_verification' | 'verified' | 'dispatched'>('all');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [previewOrder, setPreviewOrder] = useState<WorkOrder | null>(null);

  // Editable parameters during verification
  const [editableResults, setEditableResults] = useState<TestParameterResult[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Open modal/drawer to verify
  const handleOpenVerification = (order: WorkOrder) => {
    setSelectedOrder(order);
    setEditableResults(
      order.results && order.results.length > 0
        ? JSON.parse(JSON.stringify(order.results))
        : [
            { parameter: 'Hemoglobin (Hb)', value: '13.2', unit: 'g/dL', referenceRange: '12.0 - 15.5', status: 'Normal' },
            { parameter: 'Total Leucocyte Count (TLC)', value: '7200', unit: '/cumm', referenceRange: '4000 - 11000', status: 'Normal' },
            { parameter: 'Platelet Count', value: '250000', unit: '/cumm', referenceRange: '150000 - 450000', status: 'Normal' },
            { parameter: 'Fasting Plasma Glucose', value: '96', unit: 'mg/dL', referenceRange: '70 - 100', status: 'Normal' },
          ]
    );
    setClinicalNotes(order.technicianNotes || 'All primary diagnostic parameters analyzed and cross-referenced with quality control standards.');
  };

  const handleUpdateParameterValue = (index: number, field: keyof TestParameterResult, value: string) => {
    setEditableResults(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSaveVerification = () => {
    if (!selectedOrder) return;
    onVerifyOrder(selectedOrder.id, editableResults, clinicalNotes);
    setSelectedOrder(null);
  };

  // Filter list
  const filteredOrders = workOrders.filter(wo => {
    const matchesSearch = 
      wo.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.patientPhone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (statusFilter === 'pending_verification') {
      return wo.status === 'Central Result Verification' || wo.status === 'In Transit' || wo.status === 'Sample Collected';
    }
    if (statusFilter === 'verified') {
      return wo.status === 'Verified & Approved';
    }
    if (statusFilter === 'dispatched') {
      return wo.status === 'Report Dispatched';
    }
    return true;
  });

  const pendingCount = workOrders.filter(w => w.status === 'Central Result Verification').length;
  const verifiedCount = workOrders.filter(w => w.status === 'Verified & Approved').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Accessibility Badge */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Central Result Verification & Diagnostic Reports Desk
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Dual Access: Manager & Staff Authorized</span>
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Centralized medical review desk for clinical parameter validation, abnormal flag verification, pathologist digital signature, and immediate client report dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-center">
              <div className="text-xs text-slate-400 font-medium">Pending Review</div>
              <div className="text-xl font-bold font-mono text-amber-400">{pendingCount}</div>
            </div>
            <div className="px-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-center">
              <div className="text-xs text-slate-400 font-medium">Verified Total</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{verifiedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 inset-y-0 my-auto pointer-events-none" />
          <input
            type="text"
            placeholder="Search patient, barcode, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Orders ({workOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending_verification')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'pending_verification'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Pending Verification ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'verified'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Verified ({verifiedCount})
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Order / Barcode</th>
                <th className="py-3 px-4">Patient Information</th>
                <th className="py-3 px-4">Client Facility</th>
                <th className="py-3 px-4">Attributed Staff</th>
                <th className="py-3 px-4">Collection Date & Time</th>
                <th className="py-3 px-4">Test Profile</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const isReadyForReview = order.status === 'Central Result Verification';
                  const isApproved = order.status === 'Verified & Approved' || order.status === 'Report Dispatched';

                  return (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-slate-750/50 transition-colors ${
                        isReadyForReview ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                        <div>{order.id}</div>
                        <div className="text-[10px] text-slate-400 font-normal">BAR: {order.barcode}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{order.patientName}</div>
                        <div className="text-[11px] text-slate-400">
                          {order.patientAge}y, {order.patientGender} • +91 {order.patientPhone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200 truncate max-w-[160px]">{order.clientName}</div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-700 text-cyan-300 border border-cyan-500/30 mt-0.5">
                          {order.clientFacilityType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-emerald-400">{order.staffName}</div>
                        <div className="text-[10px] text-slate-400">Revenue: ₹{order.staffRevenueAttributed}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Calendar className="w-3 h-3 text-cyan-400" />
                          <span>
                            {new Date(order.collectionDateTime).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 ml-4">
                          {new Date(order.collectionDateTime).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate font-medium text-slate-200">
                          {order.testNames.join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {order.results.length} parameters logged
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          order.status === 'Verified & Approved' || order.status === 'Report Dispatched'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : order.status === 'Central Result Verification'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {order.status === 'Verified & Approved' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : order.status === 'Central Result Verification' ? (
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{order.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Verify / Edit Results button (Staff or Manager) */}
                          <button
                            onClick={() => handleOpenVerification(order)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                            title="Verify and edit diagnostic values"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>{isApproved ? 'Review Results' : 'Verify Desk'}</span>
                          </button>

                          {/* Official PDF Report View */}
                          <button
                            onClick={() => setPreviewOrder(order)}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="View official diagnostic report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Dispatch if verified */}
                          {order.status === 'Verified & Approved' && (
                            <button
                              onClick={() => onDispatchReport(order.id)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                              title="Dispatch Report to Client & Patient"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No work orders found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Editor Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Central Result Verification — {selectedOrder.id}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Barcode: {selectedOrder.barcode}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Patient: <span className="text-slate-200 font-semibold">{selectedOrder.patientName}</span> ({selectedOrder.patientAge}y, {selectedOrder.patientGender}) • Client: <span className="text-slate-200 font-semibold">{selectedOrder.clientName}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Reviewer identity badge */}
              <div className="flex items-center justify-between p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>
                    Logged in as: <strong>{currentUser.name}</strong> ({currentUser.role === 'manager' ? 'Manager' : 'Staff Technician'})
                  </span>
                </div>
                <span className="text-[11px] text-cyan-300">
                  Digital Timestamp: {new Date().toLocaleTimeString()}
                </span>
              </div>

              {/* Parameter Editor Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  Laboratory Test Parameters & Reference Validation
                </h4>
                <div className="border border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-800/90 text-slate-400 font-semibold border-b border-slate-700 text-[10px] uppercase">
                        <th className="py-2.5 px-3">Parameter</th>
                        <th className="py-2.5 px-3">Observed Value</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3">Bio Reference Range</th>
                        <th className="py-2.5 px-3">Interpretation Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {editableResults.map((param, index) => (
                        <tr key={index} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-100">
                            {param.parameter}
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={param.value}
                              onChange={(e) => handleUpdateParameterValue(index, 'value', e.target.value)}
                              className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-400">
                            {param.unit}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {param.referenceRange}
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={param.status}
                              onChange={(e) => handleUpdateParameterValue(index, 'status', e.target.value as any)}
                              className={`px-2 py-1 rounded text-[10px] font-bold border focus:outline-none cursor-pointer ${
                                param.status === 'Critical'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : param.status === 'Abnormal'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              <option value="Normal" className="bg-slate-900 text-slate-100">Normal</option>
                              <option value="Abnormal" className="bg-slate-900 text-amber-300">Abnormal</option>
                              <option value="Critical" className="bg-slate-900 text-rose-300">Critical</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Technician / Pathologist Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pathologist & Technician Clinical Remarks
                </label>
                <textarea
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Enter any clinical correlation or laboratory observations..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleSaveVerification();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Certify & Verify Results</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Diagnostic Report Preview Modal */}
      {previewOrder && (
        <ReportPreviewModal
          order={previewOrder}
          onClose={() => setPreviewOrder(null)}
        />
      )}
    </div>
  );
};
