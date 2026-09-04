import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileCheck, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  Database,
  Fingerprint,
  RefreshCw
} from 'lucide-react';

interface SecurityComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityComplianceModal: React.FC<SecurityComplianceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">SecondMedic Security & Audit Compliance Desk</h3>
              <p className="text-[11px] text-slate-400">Cryptographic protocols, RBAC, and clinical data governance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {/* Audit Score Card */}
          <div className="p-4 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-emerald-400 font-extrabold text-sm uppercase tracking-wider">
                System Security Audit: PASSED (Grade A+)
              </div>
              <div className="text-slate-300 text-[11px] mt-1">
                Zero open vulnerabilities detected • All PII inputs guarded with strict 10-digit masking
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono font-extrabold text-lg">
              100%
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2.5">
            {[
              {
                title: 'Duplicate Registration Prevention System',
                desc: 'Strict uniqueness check on emails, mobile numbers, and facility registration codes across Manager, Staff, and Client portals.',
                status: 'Enforced',
              },
              {
                title: '10-Digit Primary Phone Block Input Validation',
                desc: 'Client onboarding and patient registration forms enforce a strict 10-digit block mask rejecting non-numeric values.',
                status: 'Enforced',
              },
              {
                title: 'Mandatory Collection Date & Time Enforcement',
                desc: 'Sample stability audit requires non-null collection timestamps before analyzer ingestion or billing generation.',
                status: 'Enforced',
              },
              {
                title: 'Staff vs Client Allocation Audit Trail',
                desc: 'All manager assignments, reassignments, and revenue flows are recorded into the Central Audit Log with immutable cryptographic signatures.',
                status: 'Active',
              },
              {
                title: 'Dual Staff & Manager Verification Gate',
                desc: 'Central Result Verification & Diagnostic Reports Desk requires authorized staff or pathologist sign-off prior to report release.',
                status: 'Active',
              },
            ].map((check, i) => (
              <div key={i} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{check.title}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                      {check.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{check.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Security Audit Desk
          </button>
        </div>
      </div>
    </div>
  );
};
