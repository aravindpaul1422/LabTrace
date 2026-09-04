export type UserRole = 'manager' | 'staff' | 'client';

export type ClientFacilityType = 
  | 'DSA' 
  | 'Clinic' 
  | 'Hospital' 
  | 'Nursing Home' 
  | 'Diagnostic Centre' 
  | 'Collection Centre' 
  | 'Corporate Wellness' 
  | 'Pharmacy';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string; // Exactly 10 digits
  role: UserRole;
  facilityName?: string;
  facilityType?: ClientFacilityType;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedClientId?: string;
  registrationNumber?: string;
  pincode?: string;
  city?: string;
  state?: string;
  address?: string;
  createdAt: string;
  status: 'active' | 'suspended' | 'pending_approval';
  avatar?: string;
}

export type SampleStatus = 
  | 'Pending Collection'
  | 'Sample Collected'
  | 'In Transit'
  | 'Central Result Verification'
  | 'Verified & Approved'
  | 'Report Dispatched';

export interface TestParameterResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
}

export interface WorkOrder {
  id: string; // e.g. WO-2026-901
  barcode: string; // e.g. SM98273412
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string; // 10-digit block
  patientEmail?: string;
  
  // Mandatory requirement
  collectionDateTime: string; // ISO string with date & time
  
  // Client (Facility / DSA)
  clientId: string;
  clientName: string;
  clientFacilityType: ClientFacilityType;
  
  // Staff revenue attribution requirement
  staffId: string; // The staff member who collected / booked the test
  staffName: string;
  
  testIds: string[];
  testNames: string[];
  
  totalMrp: number;
  b2bAmount: number; // Client payable
  staffRevenueAttributed: number; // Staff credited volume
  staffCommission: number; // Commission / Incentive e.g. 10%
  
  paymentStatus: 'Paid' | 'Credit' | 'Billed to Client';
  paymentMode?: 'Cash' | 'UPI' | 'Bank Transfer' | 'B2B Monthly Credit';
  
  status: SampleStatus;
  
  // Results for Central Result Verification & Diagnostic Reports Desk
  results: TestParameterResult[];
  technicianNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  
  qrVerificationCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffClientMapping {
  id: string;
  staffId: string;
  staffName: string;
  clientId: string;
  clientName: string;
  facilityType: ClientFacilityType;
  assignedDate: string;
  assignedBy: string; // Manager
  notes?: string;
  status: 'active' | 'inactive';
}

export interface CentralAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: 
    | 'MAPPING_ASSIGNED' 
    | 'MAPPING_REMOVED' 
    | 'REVENUE_ATTRIBUTED' 
    | 'RESULT_VERIFIED' 
    | 'REPORT_DISPATCHED' 
    | 'CLIENT_REGISTERED' 
    | 'STAFF_REGISTERED' 
    | 'RATE_LIST_UPDATED'
    | 'SAMPLE_COLLECTED';
  entityType: 'StaffClientMapping' | 'WorkOrder' | 'User' | 'RateCard' | 'ResultVerification';
  entityId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  ipHash: string;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'revenue' | 'verification' | 'alert' | 'mapping' | 'system';
  read: boolean;
  orderId?: string;
  amount?: number;
}

export interface DiagnosticTestItem {
  id: string;
  code: string;
  name: string;
  category: 'Biochemistry' | 'Hematology' | 'Immunology' | 'Thyroid' | 'Preventive Profiles' | 'Microbiology';
  sampleType: 'EDTA Whole Blood' | 'Serum' | 'Fluoride Plasma' | 'Urine Routine' | 'Sodium Heparin';
  mrp: number;
  b2bBaseRate: number;
  dsaSpecialRate: number;
  turnaroundTimeHours: number;
  fastingRequired: boolean;
  parametersCount: number;
}
