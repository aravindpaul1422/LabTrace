import React, { useState } from 'react';
import { WorkOrder, User, DiagnosticTestItem, ClientFacilityType } from '../types';
import { Phone10BlockInput } from './Phone10BlockInput';
import { DIAGNOSTIC_CATALOG } from '../data/mockDatabase';
import { 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Building2, 
  Sparkles,
  QrCode,
  IndianRupee,
  Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ReportPreviewModal } from './ReportPreviewModal';

interface WorkOrdersDeskProps {
  currentUser: User;
  workOrders: WorkOrder[];
  allUsers: User[];
  onAddWorkOrder: (order: WorkOrder) => void;
}

export const WorkOrdersDesk: React.FC<WorkOrdersDeskProps> = ({
  currentUser,
  workOrders,
  allUsers,
  onAddWorkOrder,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFacility, setFilterFacility] = useState<string>('all');
  const [previewOrder, setPreviewOrder] = useState<WorkOrder | null>(null);

  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<string>('35');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState(''); // 10-digit block
  const [patientEmail, setPatientEmail] = useState('');

  // MANDATORY REQUIREMENT: Collection Date & Time
  const [collectionDateTime, setCollectionDateTime] = useState(
    new Date().toISOString().slice(0, 16) // Default current local datetime
  );
  const [collectionDateTimeError, setCollectionDateTimeError] = useState('');

  // Client Selection
  const clients = allUsers.filter(u => u.role === 'client');
  const staffMembers = allUsers.filter(u => u.role === 'staff');

  const [selectedClientId, setSelectedClientId] = useState(
    currentUser.role === 'client' ? currentUser.id : clients[0]?.id || ''
  );

  // Attributed Staff Member: Defaults to current user if staff; or mapped staff for client
  const [selectedStaffId, setSelectedStaffId] = useState(
    currentUser.role === 'staff' 
      ? currentUser.id 
      : currentUser.role === 'client' 
      ? currentUser.assignedStaffId || staffMembers[0]?.id || ''
      : staffMembers[0]?.id || ''
  );

  // Selected Tests
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>(['T-CBC', 'T-THYROID']);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'B2B Monthly Credit'>('UPI');
  const [formError, setFormError] = useState('');

  // Calculations
  const selectedTests = DIAGNOSTIC_CATALOG.filter(t => selectedTestIds.includes(t.id));
  const currentClient = clients.find(c => c.id === selectedClientId) || currentUser;
  const isDsaClient = currentClient?.facilityType === 'DSA';

  const totalMrp = selectedTests.reduce((acc, t) => acc + t.mrp, 0);
  const b2bAmount = selectedTests.reduce((acc, t) => {
    return acc + (isDsaClient ? t.dsaSpecialRate : t.b2bBaseRate);
  }, 0);
  const staffCommission = Math.round(b2bAmount * 0.10); // 10% staff revenue incentive

  const toggleTest = (testId: string) => {
    if (selectedTestIds.includes(testId)) {
      if (selectedTestIds.length === 1) return; // Keep at least one
      setSelectedTestIds(selectedTestIds.filter(id => id !== testId));
    } else {
      setSelectedTestIds([...selectedTestIds, testId]);
    }
  };

  const handleExportExcel = () => {
    const exportData = workOrders.map(wo => ({
      'Order ID': wo.id,
      'Barcode': wo.barcode,
      'Patient Name': wo.patientName,
      'Age': wo.patientAge,
      'Gender': wo.patientGender,
      'Patient Phone (+91)': wo.patientPhone,
      'Collection Date & Time (Mandatory)': wo.collectionDateTime,
      'Client Facility': wo.clientName,
      'Facility Type': wo.clientFacilityType,
      'Attributed Staff': wo.staffName,
      'Staff ID': wo.staffId,
      'Test Names': wo.testNames.join('; '),
      'B2B Revenue (₹)': wo.b2bAmount,
      'Staff Attributed Revenue (₹)': wo.staffRevenueAttributed,
      'Status': wo.status,
      'Payment Status': wo.paymentStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SecondMedic_WorkOrders');
    XLSX.writeFile(workbook, `SecondMedic_WorkOrders_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setCollectionDateTimeError('');

    // 1. Mandatory Collection Date & Time validation
    if (!collectionDateTime || collectionDateTime.trim() === '') {
      setCollectionDateTimeError('Collection Date & Time is strictly mandatory.');
      setFormError('Please select the mandatory Sample Collection Date & Time.');
      return;
    }

    // 2. Primary Phone 10-digit block validation
    const cleanPhone = patientPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setFormError('Patient Primary Phone must be exactly 10 digits.');
      return;
    }

    if (!patientName.trim()) {
      setFormError('Patient Name is required.');
      return;
    }

    if (selectedTestIds.length === 0) {
      setFormError('Please select at least one diagnostic test.');
      return;
    }

    const assignedStaff = staffMembers.find(s => s.id === selectedStaffId) || {
      id: currentUser.id,
      name: currentUser.name,
    };

    const targetClient = clients.find(c => c.id === selectedClientId) || {
      id: currentUser.id,
      name: currentUser.name,
      facilityType: currentUser.facilityType || 'DSA',
    };

    const newOrderNumber = 80 + workOrders.length + 1;
    const newOrderId = `WO-2026-${String(newOrderNumber).padStart(3, '0')}`;
    const newBarcode = `SM${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newWorkOrder: WorkOrder = {
      id: newOrderId,
      barcode: newBarcode,
      patientName: patientName.trim(),
      patientAge: parseInt(patientAge, 10) || 30,
      patientGender,
      patientPhone: cleanPhone,
      patientEmail: patientEmail.trim() || undefined,
      collectionDateTime, // Mandatory field
      clientId: targetClient.id,
      clientName: targetClient.name || targetClient.facilityName || 'Client Facility',
      clientFacilityType: targetClient.facilityType || 'DSA',
      // Revenue Attribution: Flows directly to this staff member
      staffId: assignedStaff.id,
      staffName: assignedStaff.name,
      testIds: selectedTestIds,
      testNames: selectedTests.map(t => t.name),
      totalMrp,
      b2bAmount,
      staffRevenueAttributed: b2bAmount, // Revenue credited to staff
      staffCommission,
      paymentStatus: paymentMode === 'B2B Monthly Credit' ? 'Credit' : 'Paid',
      paymentMode,
      status: 'Sample Collected',
      results: [
        { parameter: 'Routine Analyzer Screen', value: 'Completed', unit: 'Index', referenceRange: 'Negative / Pass', status: 'Normal' },
      ],
      technicianNotes: `Sample collected at ${collectionDateTime} by staff ${assignedStaff.name}. Attributed revenue: ₹${b2bAmount}.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddWorkOrder(newWorkOrder);

    // Reset form
    setPatientName('');
    setPatientPhone('');
    setPatientEmail('');
    setShowCreateModal(false);
  };

  const filteredOrders = workOrders.filter(wo => {
    const matchesSearch =
      wo.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.patientPhone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterFacility !== 'all') {
      return wo.clientFacilityType === filterFacility;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Work Orders & Sample Collection Desk
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {workOrders.length} Active Orders
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Mandatory collection timestamps, 10-digit phone verification, and automatic staff revenue flow attribution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book Sample / Work Order</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 inset-y-0 my-auto pointer-events-none" />
          <input
            type="text"
            placeholder="Search patient, barcode, phone, client, staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Facility Type:</span>
          <select
            value={filterFacility}
            onChange={(e) => setFilterFacility(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Facilities</option>
            <option value="DSA">DSA (Direct Selling Agent)</option>
            <option value="Clinic">Clinic</option>
            <option value="Hospital">Hospital</option>
            <option value="Diagnostic Centre">Diagnostic Centre</option>
          </select>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Order ID & Barcode</th>
                <th className="py-3 px-4">Patient Name & Phone</th>
                <th className="py-3 px-4">Collection Date & Time (Mandatory)</th>
                <th className="py-3 px-4">Client Facility</th>
                <th className="py-3 px-4">Attributed Staff (Revenue Flow)</th>
                <th className="py-3 px-4">B2B Bill</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      <div>{order.id}</div>
                      <div className="text-[10px] text-slate-400 font-normal">BAR: {order.barcode}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{order.patientName}</div>
                      <div className="font-mono text-[11px] text-slate-300">
                        +91 {order.patientPhone}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {order.patientAge}y • {order.patientGender}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>
                          {new Date(order.collectionDateTime).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 ml-5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(order.collectionDateTime).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200 truncate max-w-[150px]">{order.clientName}</div>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        order.clientFacilityType === 'DSA'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {order.clientFacilityType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-emerald-400">{order.staffName}</div>
                      <div className="text-[10px] text-slate-400">
                        Credited: <span className="font-mono text-emerald-300 font-bold">₹{order.staffRevenueAttributed}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white">₹{order.b2bAmount}</div>
                      <div className="text-[10px] text-slate-400 line-through">MRP: ₹{order.totalMrp}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        order.status === 'Verified & Approved' || order.status === 'Report Dispatched'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : order.status === 'Central Result Verification'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setPreviewOrder(order)}
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="View diagnostic report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No work orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Work Order / Sample Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold">
                  WO
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Book New Diagnostic Sample & Work Order</h3>
                  <p className="text-[11px] text-slate-400">Revenue automatically attributes to operating staff member</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Patient Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Patient Demographics</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Patient Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra Mehta"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 10-Digit Block Input for Patient Primary Phone */}
                <Phone10BlockInput
                  id="order-patient-phone"
                  label="Primary Phone"
                  required={true}
                  value={patientPhone}
                  onChange={setPatientPhone}
                  helperText="Exact 10-digit mobile number for report delivery & SMS tracking"
                />
              </div>

              {/* MANDATORY: Collection Date & Time */}
              <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>Collection Date & Time</span>
                    <span className="text-rose-400 font-bold">* (MANDATORY)</span>
                  </label>
                  <span className="text-[10px] uppercase font-bold text-cyan-400/90 tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Audit Requirement
                  </span>
                </div>

                <input
                  type="datetime-local"
                  required
                  value={collectionDateTime}
                  onChange={(e) => {
                    setCollectionDateTime(e.target.value);
                    setCollectionDateTimeError('');
                  }}
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-xs font-mono text-cyan-200 focus:outline-none ${
                    collectionDateTimeError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-cyan-500/50 focus:border-cyan-400'
                  }`}
                />

                {collectionDateTimeError && (
                  <p className="text-[11px] text-rose-400 font-semibold">{collectionDateTimeError}</p>
                )}
                <p className="text-[10px] text-slate-400">
                  Specimen preservation & sample stability timers are benchmarked against this exact timestamp.
                </p>
              </div>

              {/* Facility & Staff Attribution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Client Facility / DSA Partner <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    disabled={currentUser.role === 'client'}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.facilityType})
                      </option>
                    ))}
                  </select>
                  {isDsaClient && (
                    <span className="inline-block text-[10px] text-cyan-400 font-medium mt-1">
                      ⚡ DSA Special Discounted Rate Active
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Operating Staff (Revenue Credited) <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    disabled={currentUser.role === 'staff'}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {staffMembers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                  </select>
                  <span className="inline-block text-[10px] text-emerald-400 font-medium mt-1">
                    Revenue will flow directly to this staff member's ledger
                  </span>
                </div>
              </div>

              {/* Diagnostic Test Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Test Packages
                  </label>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    {selectedTestIds.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {DIAGNOSTIC_CATALOG.map(test => {
                    const isSelected = selectedTestIds.includes(test.id);
                    const appliedRate = isDsaClient ? test.dsaSpecialRate : test.b2bBaseRate;

                    return (
                      <div
                        key={test.id}
                        onClick={() => toggleTest(test.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500/70 shadow-sm'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="font-semibold text-xs text-slate-200 line-clamp-1">
                            {test.name}
                          </div>
                          <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-cyan-500 text-white' : 'border border-slate-600'
                          }`}>
                            {isSelected && '✓'}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[11px]">
                          <span className="text-slate-400">{test.sampleType}</span>
                          <span className="font-mono font-bold text-emerald-400">₹{appliedRate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Mode & Bill Summary */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Payment Mode:</span>
                  <div className="flex items-center gap-2">
                    {(['UPI', 'Cash', 'B2B Monthly Credit'] as const).map(mode => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setPaymentMode(mode)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          paymentMode === mode
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total B2B Payable</div>
                    <div className="text-lg font-mono font-extrabold text-white">₹{b2bAmount}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Staff Revenue Credit</div>
                    <div className="text-base font-mono font-bold text-emerald-400">+₹{b2bAmount}</div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Generate Barcode & Book Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {previewOrder && (
        <ReportPreviewModal
          order={previewOrder}
          onClose={() => setPreviewOrder(null)}
        />
      )}
    </div>
  );
};
