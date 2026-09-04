import React, { useState } from 'react';
import { User, UserRole, ClientFacilityType } from '../types';
import { Phone10BlockInput } from './Phone10BlockInput';
import { SecondMedicLogo } from './SecondMedicLogo';
import { FACILITY_TYPES } from './ClientManagementDesk';
import { 
  Lock, 
  UserCheck, 
  Building2, 
  Stethoscope, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onRegisterUser: (newUser: User) => void;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSelectUser,
  onRegisterUser,
  initialRole = 'manager',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [copiedLink, setCopiedLink] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState(''); // 10-digit block input
  const [regFacilityName, setRegFacilityName] = useState('');
  const [regFacilityType, setRegFacilityType] = useState<ClientFacilityType>('DSA');
  const [regPassword, setRegPassword] = useState('SecondMedic@2026');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Get demo accounts per role
  const roleUsers = allUsers.filter(u => u.role === selectedRole);

  const handleCopyPortalLink = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('role', selectedRole);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url.toString()).catch(() => {});
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.warn('Could not copy link:', e);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // 1. Validate 10-Digit Phone
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setFormError('Primary Phone must be exactly 10 digits.');
      return;
    }

    if (!regName.trim() || !regEmail.trim()) {
      setFormError('Please fill in all mandatory fields.');
      return;
    }

    // 2. NO DUPLICATE REGISTRATION RULE FOR EACH ROLE
    const normalizedEmail = regEmail.trim().toLowerCase();
    const duplicateEmail = allUsers.some(
      u => u.email.toLowerCase() === normalizedEmail
    );
    if (duplicateEmail) {
      setFormError(
        `Duplicate Registration Forbidden: An account with email "${regEmail}" already exists in the SecondMedic directory.`
      );
      return;
    }

    const duplicatePhone = allUsers.some(u => u.phone === cleanPhone);
    if (duplicatePhone) {
      setFormError(
        `Duplicate Registration Forbidden: Mobile number +91 ${cleanPhone} is already registered.`
      );
      return;
    }

    const newId = `${selectedRole.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`;

    const newUser: User = {
      id: newId,
      name: regName.trim(),
      email: normalizedEmail,
      phone: cleanPhone,
      role: selectedRole,
      facilityName: selectedRole === 'client' ? (regFacilityName.trim() || regName.trim()) : undefined,
      facilityType: selectedRole === 'client' ? regFacilityType : undefined,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    onRegisterUser(newUser);
    setFormSuccess(`Registration approved! Logging in as ${newUser.name}...`);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
          
          <div className="flex justify-center mb-2">
            <SecondMedicLogo size="md" showSubtitle={true} />
          </div>
          <h2 className="text-base font-extrabold text-white mt-2">
            Multi-Role Diagnostic Portal Authentication
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual access portals with strict duplicate registration enforcement
          </p>
        </div>

        {/* Role Selector Tabs (Manager, Staff, Client) */}
        <div className="p-4 bg-slate-900 border-b border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Select Individual Portal Channel:
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'manager', label: 'Manager (Admin)', icon: ShieldCheck, color: 'text-purple-400' },
              { id: 'staff', label: 'Staff / Tech', icon: Stethoscope, color: 'text-emerald-400' },
              { id: 'client', label: 'Client / DSA', icon: Building2, color: 'text-cyan-400' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedRole(tab.id as UserRole);
                    setFormError('');
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${tab.color}`} />
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Individual Portal Link Generator */}
          <div className="flex items-center justify-between mt-3 p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Direct Link: <strong>secondmedic.com?role={selectedRole}</strong></span>
            </div>
            <button
              onClick={handleCopyPortalLink}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Login vs Register Tabs */}
        <div className="flex border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('login');
              setFormError('');
            }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              activeTab === 'login'
                ? 'border-cyan-500 text-cyan-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Quick Sign-In ({selectedRole.toUpperCase()})
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setFormError('');
            }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              activeTab === 'register'
                ? 'border-cyan-500 text-cyan-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Register New {selectedRole === 'client' ? 'Client / DSA' : selectedRole === 'staff' ? 'Staff Phlebotomist' : 'Manager'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {formError && (
            <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{formSuccess}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 mb-2">
                Available active demo accounts for <strong>{selectedRole.toUpperCase()}</strong>:
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {roleUsers.map((user) => {
                  const isCurrent = currentUser.id === user.id;

                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500/30'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-cyan-400 text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.facilityType && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300">
                                {user.facilityType}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{user.email}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Mobile: +91 {user.phone}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          isCurrent
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {isCurrent ? 'Active Now' : 'Switch In'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name / Contact Person <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {selectedRole === 'client' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Facility / Agency Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Metro Diagnostics DSA"
                      value={regFacilityName}
                      onChange={(e) => setRegFacilityName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Facility Classification <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={regFacilityType}
                      onChange={(e) => setRegFacilityType(e.target.value as ClientFacilityType)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      {FACILITY_TYPES.map(t => (
                        <option key={t} value={t}>
                          {t === 'DSA' ? '⭐ DSA (Direct Selling Agent)' : t}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* 10-Digit Block Primary Phone */}
              <Phone10BlockInput
                id="reg-phone-input"
                label="Primary Phone"
                required={true}
                value={regPhone}
                onChange={setRegPhone}
                helperText="Must be unique. Duplicate mobile numbers will be blocked."
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@diagnostics.secondmedic.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  Create & Authenticate {selectedRole.toUpperCase()} Account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
