import React, { useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  WorkOrder, 
  StaffClientMapping, 
  CentralAuditLog, 
  NotificationItem,
  TestParameterResult 
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_WORK_ORDERS, 
  INITIAL_STAFF_CLIENT_MAPPINGS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS 
} from './data/mockDatabase';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { WorkOrdersDesk } from './components/WorkOrdersDesk';
import { CentralResultVerificationDesk } from './components/CentralResultVerificationDesk';
import { ClientManagementDesk } from './components/ClientManagementDesk';
import { StaffRevenueDesk } from './components/StaffRevenueDesk';
import { StaffClientMappingDesk } from './components/StaffClientMappingDesk';
import { CentralAuditLogDesk } from './components/CentralAuditLogDesk';
import { AuthModal } from './components/AuthModal';
import { SecurityComplianceModal } from './components/SecurityComplianceModal';
import { ApiDocsModal } from './components/ApiDocsModal';

export default function App() {
  // App States
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [mappings, setMappings] = useState<StaffClientMapping[]>(INITIAL_STAFF_CLIENT_MAPPINGS);
  const [auditLogs, setAuditLogs] = useState<CentralAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('manager');
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [apiDocsModalOpen, setApiDocsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Parse Role from URL Query Parameter (e.g. ?role=manager or ?role=staff or ?role=client)
  const getInitialUser = (): User => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'staff') {
        return INITIAL_USERS.find(u => u.role === 'staff') || INITIAL_USERS[1];
      }
      if (urlRole === 'client') {
        return INITIAL_USERS.find(u => u.role === 'client') || INITIAL_USERS[4];
      }
      if (urlRole === 'manager') {
        return INITIAL_USERS.find(u => u.role === 'manager') || INITIAL_USERS[0];
      }
    } catch {
      // Fallback
    }
    return INITIAL_USERS[0]; // Unified Manager (Admin)
  };

  const [currentUser, setCurrentUser] = useState<User>(getInitialUser);

  // Sync role changes to URL search params seamlessly
  const switchRole = (role: UserRole) => {
    const targetUser = allUsers.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      const url = new URL(window.location.href);
      url.searchParams.set('role', role);
      window.history.replaceState({}, '', url.toString());

      // If active tab is manager-only and user switches to staff or client, fall back to dashboard
      if (['staff_mapping', 'audit_logs'].includes(activeTab) && role !== 'manager') {
        setActiveTab('dashboard');
      }
    }
  };

  // 1. ADD WORK ORDER & ATTRIBUTE REVENUE
  const handleAddWorkOrder = (newOrder: WorkOrder) => {
    setWorkOrders(prev => [newOrder, ...prev]);

    // Real-Time Notification for Revenue Update
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      timestamp: 'Just now',
      title: 'Revenue Attributed to Staff',
      message: `Work Order ${newOrder.id} created. ₹${newOrder.staffRevenueAttributed} credited directly to staff ${newOrder.staffName}.`,
      type: 'revenue',
      read: false,
      orderId: newOrder.id,
      amount: newOrder.staffRevenueAttributed,
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Cryptographic Central Audit Log Entry
    const auditEntry: CentralAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'REVENUE_ATTRIBUTED',
      entityType: 'WorkOrder',
      entityId: newOrder.id,
      details: `Work order booked for ${newOrder.patientName}. Revenue of ₹${newOrder.staffRevenueAttributed} credited to Staff ${newOrder.staffName}. Collection: ${newOrder.collectionDateTime}`,
      newValue: `₹${newOrder.staffRevenueAttributed}.00 (Staff: ${newOrder.staffId})`,
      ipHash: `sha256-${Math.random().toString(36).slice(2, 8)}...${Math.random().toString(36).slice(2, 6)}`,
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // 2. CENTRAL RESULT VERIFICATION SIGN-OFF (Accessible by Staff & Manager)
  const handleVerifyOrder = (orderId: string, updatedResults: TestParameterResult[], notes: string) => {
    setWorkOrders(prev =>
      prev.map(wo => {
        if (wo.id === orderId) {
          return {
            ...wo,
            results: updatedResults,
            technicianNotes: notes,
            status: 'Verified & Approved',
            verifiedBy: `${currentUser.name} (${currentUser.role === 'manager' ? 'Manager Pathologist' : 'Staff Technologist'})`,
            verifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return wo;
      })
    );

    // Notification
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      timestamp: 'Just now',
      title: 'Results Certified & Approved',
      message: `Diagnostic results for ${orderId} verified by ${currentUser.name}. Ready for client dispatch.`,
      type: 'verification',
      read: false,
      orderId,
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Audit Log
    const auditEntry: CentralAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'RESULT_VERIFIED',
      entityType: 'ResultVerification',
      entityId: orderId,
      details: `Laboratory parameters verified and certified by ${currentUser.name}.`,
      previousValue: 'Central Result Verification',
      newValue: 'Verified & Approved',
      ipHash: `sha256-${Math.random().toString(36).slice(2, 8)}...verified`,
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // 3. DISPATCH REPORT
  const handleDispatchReport = (orderId: string) => {
    setWorkOrders(prev =>
      prev.map(wo => {
        if (wo.id === orderId) {
          return {
            ...wo,
            status: 'Report Dispatched',
            updatedAt: new Date().toISOString(),
          };
        }
        return wo;
      })
    );

    const auditEntry: CentralAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'REPORT_DISPATCHED',
      entityType: 'WorkOrder',
      entityId: orderId,
      details: `Digitally signed diagnostic report dispatched to patient and client facility.`,
      newValue: 'Report Dispatched',
      ipHash: `sha256-dispatch...${Math.random().toString(36).slice(2, 6)}`,
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // 4. ONBOARD CLIENT (WITH DSA SUPPORT & DUPLICATE PROTECTION)
  const handleAddClient = (newClient: User) => {
    setAllUsers(prev => [...prev, newClient]);

    const auditEntry: CentralAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'CLIENT_REGISTERED',
      entityType: 'User',
      entityId: newClient.id,
      details: `New facility registered. Facility Type: ${newClient.facilityType}, Name: ${newClient.name}. Uniqueness verification passed.`,
      newValue: `Facility: ${newClient.facilityType} (${newClient.id})`,
      ipHash: `sha256-reg...${Math.random().toString(36).slice(2, 6)}`,
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // 5. UPDATE CLIENT MAPPED STAFF
  const handleUpdateClientStaff = (clientId: string, staffId: string, staffName: string) => {
    const prevClient = allUsers.find(u => u.id === clientId);
    const prevStaff = prevClient?.assignedStaffName || 'Unassigned';

    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === clientId) {
          return {
            ...u,
            assignedStaffId: staffId,
            assignedStaffName: staffName,
          };
        }
        return u;
      })
    );

    // Audit log
    const auditEntry: CentralAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'MAPPING_ASSIGNED',
      entityType: 'StaffClientMapping',
      entityId: clientId,
      details: `Manager reassigned staff for client ${prevClient?.name || clientId}.`,
      previousValue: prevStaff,
      newValue: `${staffName} (${staffId})`,
      ipHash: `sha256-map...${Math.random().toString(36).slice(2, 6)}`,
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // 6. ASSIGN STAFF CLIENT MAPPING
  const handleAssignMapping = (newMapping: StaffClientMapping, reason: string) => {
    setMappings(prev => [newMapping, ...prev]);

    // Also update client object
    handleUpdateClientStaff(newMapping.clientId, newMapping.staffId, newMapping.staffName);

    const auditEntry: CentralAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'MAPPING_ASSIGNED',
      entityType: 'StaffClientMapping',
      entityId: newMapping.id,
      details: `Manager mapped ${newMapping.staffName} to ${newMapping.clientName} (${newMapping.facilityType}). Reason: ${reason}`,
      newValue: `Active mapping ${newMapping.id}`,
      ipHash: `sha256-map-alloc...${Math.random().toString(36).slice(2, 6)}`,
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // 7. REMOVE / UNMAP
  const handleRemoveMapping = (mappingId: string, reason: string) => {
    const target = mappings.find(m => m.id === mappingId);
    setMappings(prev => prev.filter(m => m.id !== mappingId));

    const auditEntry: CentralAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'MAPPING_REMOVED',
      entityType: 'StaffClientMapping',
      entityId: mappingId,
      details: `Manager unmapped allocation ${mappingId} between ${target?.staffName} and ${target?.clientName}. Reason: ${reason}`,
      previousValue: 'active',
      newValue: 'unmapped',
      ipHash: `sha256-unmap...${Math.random().toString(36).slice(2, 6)}`,
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // 8. USER REGISTRATION HANDLER (FROM AUTH MODAL)
  const handleRegisterUser = (newUser: User) => {
    setAllUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);

    const auditEntry: CentralAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      action: newUser.role === 'staff' ? 'STAFF_REGISTERED' : 'CLIENT_REGISTERED',
      entityType: 'User',
      entityId: newUser.id,
      details: `New user registration completed. Role: ${newUser.role}, Mobile: +91 ${newUser.phone}. No duplicate collision detected.`,
      newValue: `${newUser.role} user created`,
      ipHash: `sha256-auth...${Math.random().toString(36).slice(2, 6)}`,
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  const clients = allUsers.filter(u => u.role === 'client');
  const staffMembers = allUsers.filter(u => u.role === 'staff');
  const totalNetworkRevenue = workOrders.reduce((acc, w) => acc + w.b2bAmount, 0);
  const pendingVerificationCount = workOrders.filter(
    w => w.status === 'Central Result Verification'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={switchRole}
        onOpenAuthModal={(role) => {
          setAuthInitialRole(role || currentUser.role);
          setAuthModalOpen(true);
        }}
        onOpenSecurityModal={() => setSecurityModalOpen(true)}
        notifications={notifications}
        onMarkNotificationRead={(id) => {
          setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
          );
        }}
        onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        networkRevenueTotal={totalNetworkRevenue}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex relative">
        {/* Hover-Extending Side Panel (Collapsed 64px, expands to 256px on hover) */}
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingVerificationCount={pendingVerificationCount}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Area (offset by 64px / pl-16 on desktop to accommodate icon-rail) */}
        <main className="flex-1 w-full pl-0 lg:pl-16 transition-all duration-300 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <OverviewDashboard
              currentUser={currentUser}
              workOrders={workOrders}
              clients={clients}
              staffMembers={staffMembers}
              mappings={mappings}
              onNavigateTab={setActiveTab}
              onOpenNewOrderModal={() => setActiveTab('work_orders')}
            />
          )}

          {activeTab === 'work_orders' && (
            <WorkOrdersDesk
              currentUser={currentUser}
              workOrders={workOrders}
              allUsers={allUsers}
              onAddWorkOrder={handleAddWorkOrder}
            />
          )}

          {activeTab === 'result_verification' && (
            <CentralResultVerificationDesk
              currentUser={currentUser}
              workOrders={workOrders}
              onVerifyOrder={handleVerifyOrder}
              onDispatchReport={handleDispatchReport}
            />
          )}

          {activeTab === 'clients' && (
            <ClientManagementDesk
              currentUser={currentUser}
              clients={clients}
              staffMembers={staffMembers}
              onAddClient={handleAddClient}
              onUpdateClientStaff={handleUpdateClientStaff}
            />
          )}

          {activeTab === 'staff_revenue' && (
            <StaffRevenueDesk
              currentUser={currentUser}
              workOrders={workOrders}
              allStaff={staffMembers}
            />
          )}

          {activeTab === 'staff_mapping' && (
            <StaffClientMappingDesk
              currentUser={currentUser}
              mappings={mappings}
              staffMembers={staffMembers}
              clients={clients}
              onAssignMapping={handleAssignMapping}
              onRemoveMapping={handleRemoveMapping}
            />
          )}

          {activeTab === 'audit_logs' && (
            <CentralAuditLogDesk
              currentUser={currentUser}
              auditLogs={auditLogs}
            />
          )}

          {activeTab === 'api_docs' && (
            <div className="space-y-4">
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Developer API & HL7/FHIR Integration Specs</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect laboratory analyzers, third-party LIS, and DSA portals via RESTful webhooks.
                  </p>
                </div>
                <button
                  onClick={() => setApiDocsModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  Open Interactive API Console
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                  <h3 className="font-bold text-sm text-cyan-300">DSA & Client B2B Ingestion API</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Allows DSA partners to submit bulk work orders programmatically. Enforces mandatory 10-digit primary phone block and sample collection timestamp validation before sample reception.
                  </p>
                  <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto">
                    POST /api/v1/work-orders/book
                  </pre>
                </div>

                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                  <h3 className="font-bold text-sm text-emerald-300">Staff Revenue Attribution Webhook</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Automated event stream broadcasting revenue credits to operating staff in real time. Emits cryptographically verifiable audit events to the Central Audit Trail.
                  </p>
                  <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto">
                    EVENT: staff.revenue.credited
                  </pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={setCurrentUser}
        onRegisterUser={handleRegisterUser}
        initialRole={authInitialRole}
      />

      <SecurityComplianceModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />

      <ApiDocsModal
        isOpen={apiDocsModalOpen}
        onClose={() => setApiDocsModalOpen(false)}
      />
    </div>
  );
}
