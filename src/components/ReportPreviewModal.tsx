import React from 'react';
import { WorkOrder } from '../types';
import { SecondMedicLogo } from './SecondMedicLogo';
import { X, Printer, Download, CheckCircle, ShieldCheck, QrCode, Building2, User, Phone, Calendar } from 'lucide-react';

interface ReportPreviewModalProps {
  order: WorkOrder | null;
  onClose: () => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-200">
        {/* Action Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <SecondMedicLogo size="sm" showSubtitle={false} />
            <span className="text-sm font-bold text-slate-200">
              Official Diagnostic Report — {order.id}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              order.status === 'Verified & Approved' || order.status === 'Report Dispatched'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {order.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={() => alert(`Downloading signed PDF for ${order.id}...`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document (White styled background like genuine lab report) */}
        <div className="p-8 bg-white text-slate-900 font-sans text-xs select-text overflow-x-auto print:p-0">
          {/* Diagnostic Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold text-base">
                  SM
                </div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Second<span className="text-cyan-600">Medic</span> Diagnostics Network
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                ISO 15189 & NABL Accredited Reference Laboratory Network
              </p>
              <p className="text-[10px] text-slate-400">
                HQ: SecondMedic Central Towers, Bandra Kurla Complex, Mumbai • support@secondmedic.com
              </p>
            </div>

            <div className="text-right sm:text-right flex flex-col items-end">
              <div className="font-mono font-bold text-sm bg-slate-100 px-3 py-1 rounded border border-slate-300">
                BARCODE: {order.barcode}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Order ID: <span className="font-semibold text-slate-800">{order.id}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Report Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Patient Demographics & Collection Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 px-4 bg-slate-50 border border-slate-200 rounded-lg my-4 text-[11px]">
            <div className="space-y-1">
              <div className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Patient Details</div>
              <div className="font-bold text-sm text-slate-900">{order.patientName}</div>
              <div className="text-slate-600">
                Age / Gender: <span className="font-semibold text-slate-800">{order.patientAge} Yrs / {order.patientGender}</span>
              </div>
              <div className="text-slate-600">
                Primary Phone: <span className="font-mono font-semibold text-slate-800">+91 {order.patientPhone}</span>
              </div>
            </div>

            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
              <div className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Collection & Tracking</div>
              <div className="text-slate-700">
                Collection Date & Time (Mandatory):
                <div className="font-bold text-slate-900 text-xs">
                  {new Date(order.collectionDateTime).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
              <div className="text-slate-600">
                Collected By Staff: <span className="font-semibold text-cyan-700">{order.staffName} ({order.staffId})</span>
              </div>
              <div className="text-slate-600">
                Sample Status: <span className="font-semibold text-slate-800">{order.status}</span>
              </div>
            </div>

            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
              <div className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Client Facility</div>
              <div className="font-semibold text-slate-900">{order.clientName}</div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span>Type:</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                  {order.clientFacilityType}
                </span>
              </div>
              <div className="text-slate-600">
                Payment Status: <span className="font-semibold text-emerald-700">{order.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Test Parameter Results Table */}
          <div className="my-6">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-300">
              Investigation Results
            </h4>

            {order.results && order.results.length > 0 ? (
              <table className="w-full text-left mt-3 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold text-slate-700 border-y border-slate-200">
                    <th className="py-2.5 px-3">Parameter Description</th>
                    <th className="py-2.5 px-3">Observed Value</th>
                    <th className="py-2.5 px-3">Biological Reference Interval</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3 text-right">Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {order.results.map((res, i) => (
                    <tr key={i} className={res.status === 'Critical' ? 'bg-rose-50/60' : res.status === 'Abnormal' ? 'bg-amber-50/40' : ''}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{res.parameter}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        <span className={res.status === 'Critical' ? 'text-rose-700 font-extrabold' : res.status === 'Abnormal' ? 'text-amber-700 font-bold' : ''}>
                          {res.value}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{res.referenceRange}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{res.unit}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          res.status === 'Critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : res.status === 'Abnormal'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-lg my-3">
                <p className="text-slate-500 font-medium">
                  Sample received in lab. Results are undergoing automated analyzer processing and calibration.
                </p>
                <span className="text-[11px] text-cyan-600 font-semibold mt-1 inline-block">
                  Expected completion in 4-6 hours.
                </span>
              </div>
            )}
          </div>

          {/* Technician / Pathologist Clinical Notes */}
          {order.technicianNotes && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 my-4">
              <div className="font-bold text-[10px] uppercase text-slate-500 mb-1">Clinical Remarks & Observations</div>
              <p className="text-[11px] leading-relaxed">{order.technicianNotes}</p>
            </div>
          )}

          {/* Verification Sign-offs & Barcode validation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t-2 border-slate-200 mt-8 items-end">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-slate-100 border border-slate-300 p-1 flex items-center justify-center rounded">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div className="text-[10px] text-slate-500">
                <div className="font-bold text-slate-700">Digital QR Verification</div>
                <div>Scan to verify authenticity at secondmedic.com/verify</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-[11px] font-semibold text-slate-700">Verified by Medical Staff</div>
              <div className="font-bold text-slate-900 mt-1">{order.staffName}</div>
              <div className="text-[10px] text-slate-500">Certified Phlebotomist / Lab Technologist</div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-600 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ID: {order.staffId} (Verified)</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-700">Chief Pathologist Sign-off</div>
              <div className="font-bold text-slate-900 mt-1">
                {order.verifiedBy || 'Dr. Arvind Mehta (MD, Pathologist)'}
              </div>
              <div className="text-[10px] text-slate-500">KMC Reg: 44291 • Quality Assurance Head</div>
              <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 mt-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Digitally Signed & Released</span>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] text-slate-400 mt-8 pt-3 border-t border-slate-200">
            *** End of Diagnostic Report • SecondMedic Network OS • Not Valid for Medico-legal Purposes Without Physical Signature ***
          </div>
        </div>
      </div>
    </div>
  );
};
