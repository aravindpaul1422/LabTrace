import React, { useState } from 'react';
import { User, StaffClientMapping, CentralAuditLog } from '../types';
import { 
  Users, 
  Building2, 
  ArrowRightLeft, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  History, 
  Plus, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface StaffClientMappingDeskProps {
  currentUser: User;
  mappings: StaffClientMapping[];
  staffMembers: User[];
  clients: User[];
  onAssignMapping: (mapping: StaffClientMapping, reason: string) => void;
  onRemoveMapping: (mappingId: string, reason: string) => void;
}

export const StaffClientMappingDesk: React.FC<StaffClientMappingDeskProps> = ({
  currentUser,
  mappings,
  staffMembers,
  clients,
  onAssignMapping,
  onRemoveMapping,
}) => {
  const isManager = currentUser.role === 'manager';
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [selectedStaffId, setSelectedStaffId] = useState(staffMembers[0]?.id || '');
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [reasonForAudit, setReasonForAudit] = useState('Zone optimization and daily specimen collection route assignment.');
  const [formError, setFormError] = useState('');

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isManager) {
      setFormError('Unauthorized: Only Lab Managers can modify staff-client assignments.');
      return;
    }

    const staff = staffMembers.find(s => s.id === selectedStaffId);
    const client = clients.find(c => c.id === selectedClientId);

    if (!staff || !client) {
      setFormError('Please select a valid staff member and client facility.');
      return;
    }

    // Check if duplicate mapping already active
    const exists = mappings.some(
      m => m.staffId === staff.id && m.clientId === client.id && m.status === 'active'
    );
    if (exists) {
      setFormError(`Staff ${staff.name} is already actively mapped to ${client.facilityName || client.name}.`);
      return;
    }

    const newMapping: StaffClientMapping = {
      id: `MAP-${1000 + mappings.length + 1}`,
      staffId: staff.id,
      staffName: staff.name,
      clientId: client.id,
      clientName: client.facilityName || client.name,
      facilityType: client.facilityType || 'DSA',
      assignedDate: new Date().toISOString(),
      assignedBy: `${currentUser.name} (Manager)`,
      notes: assignmentNotes.trim() || 'Assigned via Manager mapping console.',
      status: 'active',
    };

    onAssignMapping(newMapping, reasonForAudit.trim());
    setShowAssignModal(false);
    setAssignmentNotes('');
  };

  const filteredMappings = mappings.filter(m => {
    return (
      m.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.facilityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Staff vs Client Allocation & Mapping Desk
              </h2>
              <p className="text-xs text-slate-300">
                Managed by Lab Manager with immutable Central Audit Trail logging for transparent accountability.
              </p>
            </div>
          </div>
        </div>

        {isManager && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Map Staff to Client / DSA</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 inset-y-0 my-auto pointer-events-none" />
          <input
            type="text"
            placeholder="Search staff, client facility, DSA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>All allocation edits write cryptographic entries to Audit Log</span>
        </div>
      </div>

      {/* Mappings Table */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Mapping ID</th>
                <th className="py-3 px-4">Assigned Staff Member</th>
                <th className="py-3 px-4">Mapped Client Facility</th>
                <th className="py-3 px-4">Facility Type</th>
                <th className="py-3 px-4">Allocation Date</th>
                <th className="py-3 px-4">Assigned By</th>
                <th className="py-3 px-4">Operational Notes</th>
                {isManager && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200">
              {filteredMappings.length > 0 ? (
                filteredMappings.map((map) => (
                  <tr key={map.id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      {map.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{map.staffName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{map.staffId}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{map.clientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{map.clientId}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        map.facilityType === 'DSA'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {map.facilityType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                      {new Date(map.assignedDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {map.assignedBy}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {map.notes || 'Routine route coverage'}
                    </td>

                    {isManager && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            const reason = prompt('Please enter reason for reassigning / unmapping this facility:', 'Route redistribution');
                            if (reason) {
                              onRemoveMapping(map.id, reason);
                            }
                          }}
                          className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Unmap
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No active mappings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold text-xs">
                  MAP
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create Staff vs Client Allocation</h3>
                  <p className="text-[11px] text-slate-400">Recorded directly in Central Audit Trail</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Staff Member (Phlebotomist / Tech) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {staffMembers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Client Facility (DSA, Clinic, Hospital) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} — [{c.facilityType}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Operational Route / Coverage Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daily morning 7 AM pickup route for Western Sector"
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Allocation Change (Mandatory Audit Reason) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Workload balancing and DSA partner expansion"
                  value={reasonForAudit}
                  onChange={(e) => setReasonForAudit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execute Allocation & Audit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
