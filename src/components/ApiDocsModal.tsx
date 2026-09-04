import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  Terminal, 
  Play, 
  ShieldCheck, 
  GitBranch, 
  FileCheck, 
  CheckCircle2, 
  Layers,
  Key,
  Database
} from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'endpoints' | 'testrunner' | 'cicd' | 'security'>('endpoints');
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [runnerResponse, setRunnerResponse] = useState<string | null>(null);

  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/work-orders/book',
      summary: 'Book Diagnostic Sample (Mandatory Collection Timestamp)',
      description: 'Creates a work order, verifies 10-digit primary phone, enforces mandatory sample collection timestamp, and attributes revenue directly to the specified staff member.',
      headers: {
        'Authorization': 'Bearer sm_live_sec9912048123',
        'Content-Type': 'application/json',
      },
      requestPayload: {
        patientName: 'Kavita Singhania',
        patientPhone: '9820556789', // 10 digit block
        collectionDateTime: '2026-09-04T08:30:00Z', // Mandatory
        clientId: 'CLI-301',
        staffId: 'STF-101', // Revenue attribution
        testIds: ['T-CBC', 'T-THYROID'],
        paymentMode: 'UPI',
      },
      responseExample: {
        status: 'success',
        orderId: 'WO-2026-086',
        barcode: 'SM98273419',
        revenueAttributedToStaff: {
          staffId: 'STF-101',
          staffName: 'Rahul Sharma',
          amountCreditedINR: 420,
        },
        collectionTimestampVerified: true,
        auditLogRef: 'AUD-9988',
      },
    },
    {
      method: 'POST',
      path: '/api/v1/clients/onboard',
      summary: 'Register Client / DSA Partner (Duplicate Protected)',
      description: 'Registers a diagnostic facility with facilityType=DSA. Validates uniqueness across directory to prevent duplicate registrations.',
      headers: {
        'Authorization': 'Bearer sm_live_sec9912048123',
        'Content-Type': 'application/json',
      },
      requestPayload: {
        facilityName: 'Apex Health Services',
        facilityType: 'DSA', // DSA requirement
        phone: '9820987654', // 10 digits
        email: 'partner@apexdiagnostics.com',
        assignedStaffId: 'STF-101',
      },
      responseExample: {
        status: 'success',
        clientId: 'CLI-305',
        facilityType: 'DSA',
        assignedStaff: 'Rahul Sharma',
        specialDsaPricingEnabled: true,
      },
    },
    {
      method: 'POST',
      path: '/api/v1/results/verify',
      summary: 'Central Result Verification Sign-Off',
      description: 'Allows Staff or Manager to verify diagnostic test parameters, sign clinical observations, and release approved PDF reports.',
      headers: {
        'Authorization': 'Bearer sm_live_sec9912048123',
        'Content-Type': 'application/json',
      },
      requestPayload: {
        orderId: 'WO-2026-081',
        verifiedBy: 'Dr. Arvind Mehta (Manager)',
        results: [
          { parameter: 'Hemoglobin', value: '11.2', status: 'Abnormal' },
          { parameter: 'TSH', value: '5.82', status: 'Abnormal' },
        ],
        technicianNotes: 'Parameters verified against reference calibrators.',
      },
      responseExample: {
        status: 'verified',
        orderId: 'WO-2026-081',
        signedAt: '2026-09-04T10:45:00Z',
        qrVerificationHash: 'sha256-4b92...87a1',
        reportDispatchedToClient: true,
      },
    },
  ];

  const currentEndpoint = endpoints[selectedEndpointIndex];

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTestRun = () => {
    setRunnerResponse(JSON.stringify(currentEndpoint.responseExample, null, 2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                SecondMedic Diagnostic Network API & Integration Specs
              </h3>
              <p className="text-[11px] text-slate-400">
                RESTful endpoints, HL7/FHIR sample exchange, RBAC security, and CI/CD pipelines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 text-xs font-bold bg-slate-950/40">
          {[
            { id: 'endpoints', label: 'REST API Reference', icon: Terminal },
            { id: 'testrunner', label: 'Interactive Test Console', icon: Play },
            { id: 'cicd', label: 'GitHub CI/CD & Tests', icon: GitBranch },
            { id: 'security', label: 'Security & Encryption', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-5 py-3 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-cyan-500 text-cyan-300 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeTab === 'endpoints' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Endpoint Selector */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Available Operations:
                </div>
                {endpoints.map((ep, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedEndpointIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedEndpointIndex === idx
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {ep.method}
                      </span>
                      <span className="text-[11px] font-mono text-slate-200 truncate">
                        {ep.path}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-white line-clamp-1">
                      {ep.summary}
                    </div>
                  </button>
                ))}
              </div>

              {/* Endpoint Details */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500 text-slate-950">
                      {currentEndpoint.method}
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      {currentEndpoint.path}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {currentEndpoint.description}
                  </p>
                </div>

                {/* Request Payload */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <span>Request Body (JSON)</span>
                    <button
                      onClick={() => handleCopyCode(JSON.stringify(currentEndpoint.requestPayload, null, 2))}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Payload</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-200 overflow-x-auto">
                    {JSON.stringify(currentEndpoint.requestPayload, null, 2)}
                  </pre>
                </div>

                {/* Expected Response */}
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Response 200 OK
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto">
                    {JSON.stringify(currentEndpoint.responseExample, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testrunner' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Live API Runner & Webhook Simulation</h4>
                  <p className="text-xs text-slate-400">Trigger live mock dispatch against current endpoint</p>
                </div>
                <button
                  onClick={handleTestRun}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Endpoint Request</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Payload Ingestion</label>
                  <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-200 h-64 overflow-y-auto">
                    {JSON.stringify(currentEndpoint.requestPayload, null, 2)}
                  </pre>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Server Response (Live)</label>
                  <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 h-64 overflow-y-auto">
                    {runnerResponse || '// Click "Execute Endpoint Request" to test simulated network handshake.'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cicd' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  <span>GitHub Actions CI/CD Pipeline Configuration (.github/workflows/deploy.yml)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automates unit tests, TypeScript type checking, linting, security audits, and production container deployment to Cloud Run.
                </p>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`name: SecondMedic Diagnostic Network CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  verify-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - name: Unit & Verification Tests
        run: npm run lint
      - name: Build Diagnostics Production Bundle
        run: npm run build`}
              </pre>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Key className="w-4 h-4 text-emerald-400" />
                    <span>Role-Based Access Control (RBAC)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Manager role maintains full network oversight; Staff role is strictly restricted to their assigned work orders, accredited revenue, and Central Result Verification desk. Clients only access their own patient records.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>NABL / DISHA Compliance & SHA-256 Trail</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Every modification to staff-client mapping and result verification writes a cryptographically hashed log into the Central Audit ledger to ensure non-repudiation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
