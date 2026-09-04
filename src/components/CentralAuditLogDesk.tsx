import React, { useState } from 'react';
import { CentralAuditLog, User } from '../types';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  History, 
  CheckCircle, 
  Lock, 
  Hash, 
  Calendar,
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface CentralAuditLogDeskProps {
  currentUser: User;
  auditLogs: CentralAuditLog[];
}

export const CentralAuditLogDesk: React.FC<CentralAuditLogDeskProps> = ({
  currentUser,
  auditLogs,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const handleExportAuditExcel = () => {
    const data = auditLogs.map(log => ({
      'Audit ID': log.id,
      'Timestamp (UTC)': log.timestamp,
      'Actor Name': log.actorName,
      'Actor Role': log.actorRole,
      'Actor ID': log.actorId,
      'Action': log.action,
      'Entity Type': log.entityType,
      'Entity ID': log.entityId,
      'Details': log.details,
      'Previous State': log.previousValue || 'N/A',
      'New State': log.newValue || 'N/A',
      'Cryptographic Checksum': log.ipHash,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Central_Audit_Trail');
    XLSX.writeFile(workbook, `SecondMedic_AuditTrail_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (actionFilter !== 'all') {
      return log.action === actionFilter;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Central Audit Log & Compliance Ledger
              </h2>
              <p className="text-xs text-slate-300">
                Tamper-evident system trail tracking staff-client mappings, revenue adjustments, and result verifications.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportAuditExcel}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Audit Log (XLSX)</span>
        </button>
      </div>

      {/* Filter and Security Indicator */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 inset-y-0 my-auto pointer-events-none" />
          <input
            type="text"
            placeholder="Search action, actor, details, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium shrink-0">Filter Event:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Events ({auditLogs.length})</option>
            <option value="MAPPING_ASSIGNED">MAPPING_ASSIGNED</option>
            <option value="MAPPING_REMOVED">MAPPING_REMOVED</option>
            <option value="REVENUE_ATTRIBUTED">REVENUE_ATTRIBUTED</option>
            <option value="RESULT_VERIFIED">RESULT_VERIFIED</option>
            <option value="REPORT_DISPATCHED">REPORT_DISPATCHED</option>
            <option value="CLIENT_REGISTERED">CLIENT_REGISTERED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details & State Change</th>
                <th className="py-3 px-4 text-right">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200 font-mono text-[11px]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-cyan-300">
                      {log.id}
                    </td>

                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-white">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">
                        {log.actorRole} ({log.actorId})
                      </div>
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'MAPPING_ASSIGNED' || log.action === 'MAPPING_REMOVED'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : log.action === 'REVENUE_ATTRIBUTED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.action === 'RESULT_VERIFIED'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200">{log.entityType}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.entityId}</div>
                    </td>

                    <td className="py-3 px-4 font-sans max-w-sm text-slate-300">
                      <div>{log.details}</div>
                      {(log.previousValue || log.newValue) && (
                        <div className="mt-1 text-[10px] font-mono text-slate-400 bg-slate-900/60 p-1 rounded border border-slate-800">
                          {log.previousValue && <span className="text-rose-400">Old: {log.previousValue} → </span>}
                          {log.newValue && <span className="text-emerald-400">New: {log.newValue}</span>}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        <Lock className="w-3 h-3 text-cyan-400" />
                        <span>{log.ipHash}</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-sans">
                    No audit records match the filter.
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
