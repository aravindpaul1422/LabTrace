import React, { useState } from 'react';
import { User, ClientFacilityType } from '../types';
import { Phone10BlockInput } from './Phone10BlockInput';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  MapPin, 
  UserCheck, 
  FileText,
  BadgePercent,
  Sparkles
} from 'lucide-react';

interface ClientManagementDeskProps {
  currentUser: User;
  clients: User[];
  staffMembers: User[];
  onAddClient: (client: User) => void;
  onUpdateClientStaff: (clientId: string, staffId: string, staffName: string) => void;
}

export const FACILITY_TYPES: ClientFacilityType[] = [
  'DSA', // Required prompt addition
  'Clinic',
  'Hospital',
  'Nursing Home',
  'Diagnostic Centre',
  'Collection Centre',
  'Corporate Wellness',
  'Pharmacy',
];

export const ClientManagementDesk: React.FC<ClientManagementDeskProps> = ({
  currentUser,
  clients,
  staffMembers,
  onAddClient,
  onUpdateClientStaff,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>('all');

  // New Client Form
  const [facilityName, setFacilityName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // 10-digit block input
  const [facilityType, setFacilityType] = useState<ClientFacilityType>('DSA'); // Default to DSA
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400001');
  const [address, setAddress] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState(staffMembers[0]?.id || '');
  
  // Validation / Duplicate warning
  const [formError, setFormError] = useState('');

  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // 1. Mandatory 10-digit phone validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setFormError('Primary Phone must be exactly 10 digits.');
      return;
    }

    // 2. NO DUPLICATE REGISTRATION RULE
    const normalizedEmail = email.trim().toLowerCase();
    const emailExists = clients.some(c => c.email.toLowerCase() === normalizedEmail);
    if (emailExists) {
      setFormError(`Duplicate registration rejected: An account with email "${email}" is already registered.`);
      return;
    }

    const phoneExists = clients.some(c => c.phone === cleanPhone);
    if (phoneExists) {
      setFormError(`Duplicate registration rejected: Mobile number +91 ${cleanPhone} is already registered.`);
      return;
    }

    if (registrationNumber.trim()) {
      const regExists = clients.some(c => c.registrationNumber?.toLowerCase() === registrationNumber.trim().toLowerCase());
      if (regExists) {
        setFormError(`Duplicate registration rejected: Facility Registration No "${registrationNumber}" already exists.`);
        return;
      }
    }

    const assignedStaff = staffMembers.find(s => s.id === assignedStaffId);

    const newClientId = `CLI-${300 + clients.length + 1}`;
    const newClient: User = {
      id: newClientId,
      name: `${contactPerson.trim()} (${facilityName.trim()})`,
      email: normalizedEmail,
      phone: cleanPhone,
      role: 'client',
      facilityName: facilityName.trim(),
      facilityType,
      assignedStaffId: assignedStaff?.id,
      assignedStaffName: assignedStaff?.name,
      registrationNumber: registrationNumber.trim() || `${facilityType.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      address: address.trim(),
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    onAddClient(newClient);
    setShowAddModal(false);

    // Reset
    setFacilityName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
    setRegistrationNumber('');
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.facilityName && c.facilityName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.registrationNumber && c.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (facilityTypeFilter !== 'all') {
      return c.facilityType === facilityTypeFilter;
    }
    return true;
  });

  const dsaCount = clients.filter(c => c.facilityType === 'DSA').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Client & DSA Facility Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {clients.length} Registered Partners
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {dsaCount} Active DSAs
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Register diagnostic clients with full facility classification including DSA (Direct Selling Agent) and strict duplicate prevention.
          </p>
        </div>

        {currentUser.role === 'manager' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Client / DSA</span>
          </button>
        )}
      </div>

      {/* Search and Facility Type Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 inset-y-0 my-auto pointer-events-none" />
          <input
            type="text"
            placeholder="Search facility name, DSA, reg no, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium shrink-0">Filter by Type:</span>
          <select
            value={facilityTypeFilter}
            onChange={(e) => setFacilityTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Types ({clients.length})</option>
            {FACILITY_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const isDSA = client.facilityType === 'DSA';

          return (
            <div
              key={client.id}
              className={`p-5 rounded-2xl border transition-all ${
                isDSA
                  ? 'bg-gradient-to-br from-slate-900/95 via-slate-900 to-cyan-950/20 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                  : 'bg-slate-800/60 border-slate-700/80 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase ${
                      isDSA
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-slate-700 text-slate-200'
                    }`}>
                      {client.facilityType || 'DSA'}
                    </span>
                    {isDSA && (
                      <span className="flex items-center gap-0.5 text-[10px] text-cyan-300 font-semibold">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Direct Selling Agent</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-white mt-1.5 line-clamp-1">
                    {client.facilityName || client.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Contact: {client.name}
                  </p>
                </div>

                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2 text-xs py-3 border-y border-slate-700/50">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Primary Phone:</span>
                  <span className="font-mono font-semibold text-slate-100">+91 {client.phone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[160px]">{client.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Reg Number:</span>
                  <span className="font-mono text-cyan-300">{client.registrationNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-200">{client.city || 'Mumbai'}, {client.state || 'MH'}</span>
                </div>
              </div>

              {/* Mapped Staff Member */}
              <div className="mt-3.5 pt-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400 text-[11px]">Mapped Staff:</span>
                  <span className="font-semibold text-emerald-300">
                    {client.assignedStaffName || 'Rahul Sharma'}
                  </span>
                </div>

                {currentUser.role === 'manager' && (
                  <select
                    value={client.assignedStaffId || ''}
                    onChange={(e) => {
                      const staff = staffMembers.find(s => s.id === e.target.value);
                      if (staff) {
                        onUpdateClientStaff(client.id, staff.id, staff.name);
                      }
                    }}
                    className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {staffMembers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Onboard Client / DSA Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold text-xs">
                  DSA
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Register Facility / DSA Partner</h3>
                  <p className="text-[11px] text-slate-400">Duplicate registrations are strictly prohibited</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterClient} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Facility Type Selector with DSA prominent */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Facility Type <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FACILITY_TYPES.map((type) => {
                    const isSelected = facilityType === type;
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setFacilityType(type)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                          isSelected
                            ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {type === 'DSA' ? '⭐ DSA' : type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Facility / Agency Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Diagnostics (DSA)"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Person Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunil Nair"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* 10-Digit Block Primary Phone */}
              <Phone10BlockInput
                id="client-reg-phone"
                label="Primary Phone"
                required={true}
                value={phone}
                onChange={setPhone}
                helperText="Must be a unique 10-digit mobile number for portal authentication"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Email (Login ID) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="partner@secondmedic-network.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registration / Trade License No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DSA-MH-2025-01"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Assigned Staff */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assign Staff Member (Phlebotomist / Ops Lead)
                </label>
                <select
                  value={assignedStaffId}
                  onChange={(e) => setAssignedStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {staffMembers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Manager can later change this mapping; every change is recorded in the central audit log.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Facility</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
