import { PrismaClient, TenantType, TenantStatus, UserStatus, UserRole, BedType, BedStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AxioVital database...\n');

  // ============================================
  // 1. CREATE DEFAULT TENANT
  // ============================================
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'axiovital-general-hospital' },
    update: {},
    create: {
      name: 'AxioVital General Hospital',
      slug: 'axiovital-general-hospital',
      type: TenantType.HOSPITAL,
      status: TenantStatus.ACTIVE,
      email: 'admin@axiovital-hospital.com',
      phone: '+91-22-12345678',
      address: '123 Healthcare Boulevard, Medical District',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'IN',
      postalCode: '400001',
      maxUsers: 200,
      timezone: 'Asia/Kolkata',
    },
  });
  console.log(`✅ Tenant: ${tenant.name} (${tenant.id})`);

  // ============================================
  // 2. CREATE ROLES
  // ============================================
  const roleDefinitions: Array<{ name: string; systemRole: UserRole; description: string }> = [
    { name: 'Super Administrator', systemRole: UserRole.SUPER_ADMIN, description: 'Full system access' },
    { name: 'Tenant Administrator', systemRole: UserRole.TENANT_ADMIN, description: 'Hospital administrator' },
    { name: 'Doctor', systemRole: UserRole.DOCTOR, description: 'Physician access' },
    { name: 'Nurse', systemRole: UserRole.NURSE, description: 'Nursing staff access' },
    { name: 'Receptionist', systemRole: UserRole.RECEPTIONIST, description: 'Front desk access' },
    { name: 'Lab Technician', systemRole: UserRole.LAB_TECHNICIAN, description: 'Laboratory access' },
    { name: 'Pharmacist', systemRole: UserRole.PHARMACIST, description: 'Pharmacy access' },
    { name: 'Radiologist', systemRole: UserRole.RADIOLOGIST, description: 'Radiology access' },
    { name: 'Billing Clerk', systemRole: UserRole.BILLING_CLERK, description: 'Billing access' },
  ];

  const roles: Record<string, string> = {};
  for (const def of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: def.name } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: def.name,
        systemRole: def.systemRole,
        description: def.description,
        isActive: true,
      },
    });
    roles[def.systemRole] = role.id;
  }
  console.log(`✅ Roles: ${roleDefinitions.length} created`);

  // ============================================
  // 3. CREATE USERS (matching frontend login dropdown)
  // ============================================
  const passwordHash = await argon2.hash('axiovital2025');

  const userDefinitions = [
    { email: 'administrator@axiovital.com', firstName: 'System', lastName: 'Administrator', role: UserRole.SUPER_ADMIN },
    { email: 'dr.stewart@axiovital.com', firstName: 'Herman', lastName: 'Stewart', role: UserRole.DOCTOR },
    { email: 'dr.sharma@axiovital.com', firstName: 'Rajesh', lastName: 'Sharma', role: UserRole.DOCTOR },
    { email: 'dr.iyer@axiovital.com', firstName: 'Krishnan', lastName: 'Iyer', role: UserRole.DOCTOR },
    { email: 'nurse.jenkins@axiovital.com', firstName: 'Sarah', lastName: 'Jenkins', role: UserRole.NURSE },
  ];

  for (const def of userDefinitions) {
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: def.email } },
      update: {},
      create: {
        tenantId: tenant.id,
        email: def.email,
        passwordHash,
        firstName: def.firstName,
        lastName: def.lastName,
        displayName: `${def.firstName} ${def.lastName}`,
        status: UserStatus.ACTIVE,
      },
    });

    // Assign role
    const roleId = roles[def.role];
    if (roleId) {
      await prisma.userRole2.upsert({
        where: { userId_roleId: { userId: user.id, roleId } },
        update: {},
        create: { userId: user.id, roleId },
      });
    }

    // Create Doctor profile for doctors
    if (def.role === UserRole.DOCTOR) {
      const specializations: Record<string, any> = {
        'Stewart': { spec: 'GENERAL_PRACTICE', dept: 'General Medicine', license: `LIC-${Date.now()}-STW`, fee: 500 },
        'Sharma': { spec: 'CARDIOLOGY', dept: 'Cardiology', license: `LIC-${Date.now()}-SHR`, fee: 800 },
        'Iyer': { spec: 'NEUROLOGY', dept: 'Neurology', license: `LIC-${Date.now()}-IYR`, fee: 750 },
      };
      const spec = specializations[def.lastName];
      if (spec) {
        await prisma.doctor.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            tenantId: tenant.id,
            userId: user.id,
            licenseNumber: spec.license,
            specialization: spec.spec,
            department: spec.dept,
            consultationFee: spec.fee,
            qualifications: ['MD', 'MBBS'],
          },
        });
      }
    }

    console.log(`✅ User: ${def.firstName} ${def.lastName} (${def.email}) → ${def.role}`);
  }

  // ============================================
  // 4. CREATE FACILITY
  // ============================================
  const facility = await prisma.facility.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'AGH-MAIN' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'AxioVital General Hospital — Main Campus',
      code: 'AGH-MAIN',
      address: '123 Healthcare Boulevard',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'IN',
      phone: '+91-22-12345678',
      isActive: true,
    },
  });
  console.log(`✅ Facility: ${facility.name}`);

  // ============================================
  // 5. CREATE DEPARTMENTS
  // ============================================
  const departmentDefs = [
    { name: 'General Medicine', code: 'GEN' },
    { name: 'Cardiology', code: 'CARD' },
    { name: 'Neurology', code: 'NEUR' },
    { name: 'Pulmonology', code: 'PUL' },
    { name: 'Oncology', code: 'ONC' },
    { name: 'Emergency Medicine', code: 'ER' },
    { name: 'ENT', code: 'ENT' },
    { name: 'Orthopedics', code: 'ORTH' },
    { name: 'Pediatrics', code: 'PED' },
    { name: 'Radiology', code: 'RAD' },
  ];

  const departments: Record<string, string> = {};
  for (const def of departmentDefs) {
    const dept = await prisma.department.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: def.code } },
      update: {},
      create: {
        tenantId: tenant.id,
        facilityId: facility.id,
        name: def.name,
        code: def.code,
        isActive: true,
      },
    });
    departments[def.code] = dept.id;
  }
  console.log(`✅ Departments: ${departmentDefs.length} created`);

  // ============================================
  // 6. CREATE WARDS
  // ============================================
  const wardDefs = [
    { name: 'ICU-A (Cardiac)', code: 'ICU-A', deptCode: 'CARD', floor: '2' },
    { name: 'ICU-B (Neuro)', code: 'ICU-B', deptCode: 'NEUR', floor: '2' },
    { name: 'General Ward 1', code: 'GEN-01', deptCode: 'GEN', floor: '3' },
    { name: 'General Ward 2', code: 'GEN-02', deptCode: 'GEN', floor: '3' },
    { name: 'General Ward 3', code: 'GEN-03', deptCode: 'GEN', floor: '4' },
    { name: 'Emergency Bay', code: 'ER-01', deptCode: 'ER', floor: '1' },
    { name: 'Pediatric Ward', code: 'PED-01', deptCode: 'PED', floor: '5' },
    { name: 'Oncology Ward', code: 'ONC-01', deptCode: 'ONC', floor: '4' },
    { name: 'Pulmonology Ward', code: 'PUL-01', deptCode: 'PUL', floor: '3' },
    { name: 'Neurology Ward', code: 'NEU-01', deptCode: 'NEUR', floor: '2' },
  ];

  const wards: Record<string, string> = {};
  for (const def of wardDefs) {
    const ward = await prisma.ward.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: def.code } },
      update: {},
      create: {
        tenantId: tenant.id,
        departmentId: departments[def.deptCode],
        name: def.name,
        code: def.code,
        floor: def.floor,
        isActive: true,
      },
    });
    wards[def.code] = ward.id;
  }
  console.log(`✅ Wards: ${wardDefs.length} created`);

  // ============================================
  // 7. CREATE BEDS
  // ============================================
  const bedDefs: Array<{ bedNumber: string; wardCode: string; wardName: string; type: BedType; rate: number }> = [
    // ICU-A beds
    { bedNumber: 'ICU-A-01', wardCode: 'ICU-A', wardName: 'ICU-A (Cardiac)', type: BedType.PRIVATE_ICU, rate: 8000 },
    { bedNumber: 'ICU-A-02', wardCode: 'ICU-A', wardName: 'ICU-A (Cardiac)', type: BedType.PRIVATE_ICU, rate: 8000 },
    { bedNumber: 'ICU-A-03', wardCode: 'ICU-A', wardName: 'ICU-A (Cardiac)', type: BedType.PRIVATE_ICU, rate: 8000 },
    { bedNumber: 'ICU-A-04', wardCode: 'ICU-A', wardName: 'ICU-A (Cardiac)', type: BedType.PRIVATE_ICU, rate: 8000 },
    // General Ward 1
    { bedNumber: 'GEN-01-01', wardCode: 'GEN-01', wardName: 'General Ward 1', type: BedType.GENERAL_WARD, rate: 2000 },
    { bedNumber: 'GEN-01-02', wardCode: 'GEN-01', wardName: 'General Ward 1', type: BedType.GENERAL_WARD, rate: 2000 },
    { bedNumber: 'GEN-01-03', wardCode: 'GEN-01', wardName: 'General Ward 1', type: BedType.GENERAL_WARD, rate: 2000 },
    { bedNumber: 'GEN-01-04', wardCode: 'GEN-01', wardName: 'General Ward 1', type: BedType.GENERAL_WARD, rate: 2000 },
    { bedNumber: 'GEN-01-05', wardCode: 'GEN-01', wardName: 'General Ward 1', type: BedType.SEMI_PRIVATE, rate: 3500 },
    { bedNumber: 'GEN-01-06', wardCode: 'GEN-01', wardName: 'General Ward 1', type: BedType.SEMI_PRIVATE, rate: 3500 },
    // General Ward 3
    { bedNumber: 'GEN-03-01', wardCode: 'GEN-03', wardName: 'General Ward 3', type: BedType.GENERAL_WARD, rate: 2000 },
    { bedNumber: 'GEN-03-12', wardCode: 'GEN-03', wardName: 'General Ward 3', type: BedType.GENERAL_WARD, rate: 2000 },
    // Emergency
    { bedNumber: 'ER-01', wardCode: 'ER-01', wardName: 'Emergency Bay', type: BedType.EMERGENCY_BAY, rate: 5000 },
    { bedNumber: 'ER-02', wardCode: 'ER-01', wardName: 'Emergency Bay', type: BedType.EMERGENCY_BAY, rate: 5000 },
    { bedNumber: 'ER-03', wardCode: 'ER-01', wardName: 'Emergency Bay', type: BedType.EMERGENCY_BAY, rate: 5000 },
    // Neurology
    { bedNumber: 'NEU-01-01', wardCode: 'NEU-01', wardName: 'Neurology Ward', type: BedType.SEMI_PRIVATE, rate: 4000 },
    { bedNumber: 'NEU-01-02', wardCode: 'NEU-01', wardName: 'Neurology Ward', type: BedType.SEMI_PRIVATE, rate: 4000 },
    // Pulmonology
    { bedNumber: 'PUL-02-08', wardCode: 'PUL-01', wardName: 'Pulmonology Ward', type: BedType.SEMI_PRIVATE, rate: 4000 },
  ];

  for (const def of bedDefs) {
    await prisma.bed.upsert({
      where: { tenantId_bedNumber: { tenantId: tenant.id, bedNumber: def.bedNumber } },
      update: {},
      create: {
        tenantId: tenant.id,
        wardId: wards[def.wardCode],
        bedNumber: def.bedNumber,
        ward: def.wardName,
        type: def.type,
        status: BedStatus.AVAILABLE,
        dailyRate: def.rate,
      },
    });
  }
  console.log(`✅ Beds: ${bedDefs.length} created`);

  // ============================================
  // 8. INITIALIZE MRN SEQUENCE
  // ============================================
  await prisma.mrnSequence.upsert({
    where: { tenantId_prefix: { tenantId: tenant.id, prefix: 'MRN' } },
    update: {},
    create: {
      tenantId: tenant.id,
      prefix: 'MRN',
      lastValue: 0,
    },
  });
  console.log(`✅ MRN Sequence initialized`);

  // ============================================
  // 9. CREATE LAB TEST CATALOG
  // ============================================
  const labTests = [
    { code: 'CBC', name: 'Complete Blood Count', category: 'Hematology', unit: 'cells/mcL', refRange: '4,500-11,000', price: 350 },
    { code: 'BMP', name: 'Basic Metabolic Panel', category: 'Chemistry', unit: 'mmol/L', refRange: 'Varies', price: 500 },
    { code: 'LFT', name: 'Liver Function Test', category: 'Chemistry', unit: 'U/L', refRange: '7-56', price: 600 },
    { code: 'TSH', name: 'Thyroid Stimulating Hormone', category: 'Endocrine', unit: 'mIU/L', refRange: '0.4-4.0', price: 450 },
    { code: 'HBA1C', name: 'Glycated Hemoglobin', category: 'Diabetes', unit: '%', refRange: '<5.7', price: 550 },
    { code: 'LIPID', name: 'Lipid Profile', category: 'Chemistry', unit: 'mg/dL', refRange: '<200 Total', price: 500 },
    { code: 'UA', name: 'Urinalysis', category: 'Urine', unit: null, refRange: 'Normal', price: 200 },
    { code: 'BUN', name: 'Blood Urea Nitrogen', category: 'Renal', unit: 'mg/dL', refRange: '7-20', price: 300 },
    { code: 'CREAT', name: 'Serum Creatinine', category: 'Renal', unit: 'mg/dL', refRange: '0.7-1.3', price: 300 },
    { code: 'TROP', name: 'Troponin I/T', category: 'Cardiac', unit: 'ng/mL', refRange: '<0.04', price: 800 },
  ];

  for (const def of labTests) {
    await prisma.labTestCatalog.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: def.code } },
      update: {},
      create: {
        tenantId: tenant.id,
        code: def.code,
        name: def.name,
        category: def.category,
        unit: def.unit,
        referenceRange: def.refRange,
        price: def.price,
      },
    });
  }
  console.log(`✅ Lab Test Catalog: ${labTests.length} tests created`);

  // ============================================
  // 10. CREATE INVENTORY ITEMS (Medications)
  // ============================================
  const medications = [
    { sku: 'MED-001', name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 500, reorder: 50, price: 12, unit: 'Capsule' },
    { sku: 'MED-002', name: 'Metformin 500mg', category: 'Antidiabetic', stock: 300, reorder: 30, price: 8, unit: 'Tablet' },
    { sku: 'MED-003', name: 'Atorvastatin 20mg', category: 'Lipid Lowering', stock: 200, reorder: 20, price: 15, unit: 'Tablet' },
    { sku: 'MED-004', name: 'Omeprazole 20mg', category: 'Gastric', stock: 400, reorder: 40, price: 10, unit: 'Capsule' },
    { sku: 'MED-005', name: 'Paracetamol 500mg', category: 'Analgesic', stock: 1000, reorder: 100, price: 3, unit: 'Tablet' },
    { sku: 'MED-006', name: 'Amlodipine 5mg', category: 'Antihypertensive', stock: 250, reorder: 25, price: 7, unit: 'Tablet' },
    { sku: 'MED-007', name: 'Clopidogrel 75mg', category: 'Antiplatelet', stock: 150, reorder: 15, price: 20, unit: 'Tablet' },
    { sku: 'MED-008', name: 'Normal Saline 500mL', category: 'IV Fluid', stock: 200, reorder: 30, price: 45, unit: 'Bottle' },
  ];

  for (const def of medications) {
    await prisma.inventoryItem.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: def.sku } },
      update: {},
      create: {
        tenantId: tenant.id,
        sku: def.sku,
        name: def.name,
        category: def.category,
        stockQuantity: def.stock,
        reorderLevel: def.reorder,
        unitPrice: def.price,
        unitOfMeasure: def.unit,
      },
    });
  }
  console.log(`✅ Inventory: ${medications.length} medications created`);

  // ============================================
  // 11. CREATE APPOINTMENT TYPES
  // ============================================
  const apptTypes = [
    { code: 'NEW_CONSULTATION', name: 'New Consultation', durationMinutes: 30, preBufferMin: 0, postBufferMin: 5, color: '#3b82f6', sortOrder: 1 },
    { code: 'FOLLOW_UP', name: 'Follow-up Visit', durationMinutes: 15, preBufferMin: 0, postBufferMin: 5, color: '#10b981', sortOrder: 2 },
    { code: 'POST_OP_REVIEW', name: 'Post-operative Review', durationMinutes: 20, preBufferMin: 0, postBufferMin: 5, color: '#8b5cf6', sortOrder: 3 },
    { code: 'TELECONSULTATION', name: 'Teleconsultation', durationMinutes: 20, preBufferMin: 0, postBufferMin: 0, color: '#ec4899', sortOrder: 4 },
    { code: 'PROCEDURE_CONSULTATION', name: 'Procedure Consultation', durationMinutes: 45, preBufferMin: 10, postBufferMin: 10, color: '#f59e0b', sortOrder: 5 },
  ];

  const createdApptTypes: Record<string, string> = {};
  for (const t of apptTypes) {
    const config = await prisma.appointmentTypeConfig.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: t.code } },
      update: {},
      create: {
        tenantId: tenant.id,
        code: t.code,
        name: t.name,
        durationMinutes: t.durationMinutes,
        preBufferMin: t.preBufferMin,
        postBufferMin: t.postBufferMin,
        color: t.color,
        sortOrder: t.sortOrder,
      },
    });
    createdApptTypes[t.code] = config.id;
  }
  console.log(`✅ Appointment Types: ${apptTypes.length} configured`);

  // ============================================
  // 12. CREATE SCHEDULING POLICY
  // ============================================
  await prisma.schedulingPolicy.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      tenantId: tenant.id,
      facilityId: facility.id,
      slotGranularityMin: 15,
      maxAdvanceBookingDays: 90,
      minAdvanceBookingHours: 1,
      holdDurationSeconds: 300,
      allowDoubleBooking: false,
    },
  });
  console.log(`✅ Scheduling Policy configured`);

  // ============================================
  // 13. SEED DOCTOR SCHEDULE TEMPLATES
  // ============================================
  const doctors = await prisma.doctor.findMany({ where: { tenantId: tenant.id } });
  for (const doc of doctors) {
    const template = await prisma.scheduleTemplate.create({
      data: {
        tenantId: tenant.id,
        doctorId: doc.id,
        facilityId: facility.id,
        name: `Weekly Schedule for Dr. ${doc.id.substring(0, 6)}`,
        effectiveFrom: new Date('2025-01-01T00:00:00Z'),
        slotGranularityMin: 15,
        isActive: true,
        rules: {
          create: [
            { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '13:00' },
            { dayOfWeek: 'MONDAY', startTime: '14:00', endTime: '17:00' },
            { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '13:00' },
            { dayOfWeek: 'TUESDAY', startTime: '14:00', endTime: '17:00' },
            { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '13:00' },
            { dayOfWeek: 'WEDNESDAY', startTime: '14:00', endTime: '17:00' },
            { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '13:00' },
            { dayOfWeek: 'FRIDAY', startTime: '10:00', endTime: '16:00' },
            { dayOfWeek: 'SATURDAY', startTime: '09:00', endTime: '12:00' },
          ],
        },
      },
    });

    // Add Lunch break override
    await prisma.scheduleOverride.create({
      data: {
        tenantId: tenant.id,
        doctorId: doc.id,
        date: new Date('2026-08-05T00:00:00Z'),
        startTime: '13:00',
        endTime: '14:00',
        type: 'BREAK',
        reason: 'Lunch Break',
      },
    });
  }
  console.log(`✅ Schedule Templates & Rules created for ${doctors.length} doctors`);

  // ============================================
  // 14. SEED SAMPLE PATIENTS FOR SCHEDULING
  // ============================================
  const samplePatients = [
    { firstName: 'Rahul', lastName: 'Patel', mrn: '1000245679', phone: '9876543211', dob: '1986-07-22' },
    { firstName: 'Maria', lastName: 'Johnson', mrn: '1000245680', phone: '9876543212', dob: '1990-03-15' },
    { firstName: 'David', lastName: 'Lee', mrn: '1000245681', phone: '9876543213', dob: '1982-11-05' },
    { firstName: 'Lucia', lastName: 'Garcia', mrn: '1000245682', phone: '9876543214', dob: '1995-01-20' },
    { firstName: 'Michael', lastName: 'Thomas', mrn: '1000245683', phone: '9876543215', dob: '1978-08-30' },
    { firstName: 'James', lastName: 'Kim', mrn: '1000245684', phone: '9876543216', dob: '1988-12-12' },
    { firstName: 'Elizabeth', lastName: 'Brown', mrn: '1000245685', phone: '9876543217', dob: '1992-04-18' },
    { firstName: 'Charles', lastName: 'White', mrn: '1000245686', phone: '9876543218', dob: '1970-06-25' },
  ];

  const createdPatients: Record<string, any> = {};
  for (const p of samplePatients) {
    const patient = await prisma.patient.upsert({
      where: { tenantId_mrn: { tenantId: tenant.id, mrn: p.mrn } },
      update: {},
      create: {
        tenantId: tenant.id,
        mrn: p.mrn,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: new Date(p.dob),
        gender: 'MALE',
        phone: p.phone,
        email: `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}@email.com`,
      },
    });
    createdPatients[p.mrn] = patient;
  }
  console.log(`✅ ${samplePatients.length} Patients created for scheduling`);

  // ============================================
  // 15. SEED APPOINTMENTS & RESCHEDULE REQUESTS
  // ============================================
  const docList = await prisma.doctor.findMany({ include: { user: true } });
  const docMap: Record<string, string> = {};
  docList.forEach(d => { docMap[d.user.lastName] = d.id; });

  const primaryDocId = docList[0]?.id || doctors[0].id;
  const adminUser = await prisma.user.findFirst({ where: { email: 'administrator@axiovital.com' } });

  const rescheduleData = [
    { mrn: '1000245679', docName: 'Sharma', currentStart: '2026-08-05T10:30:00Z', priority: 'NORMAL', reqStatus: 'PENDING', notes: 'Patient requested to change the appointment time.' },
    { mrn: '1000245680', docName: 'Stewart', currentStart: '2026-08-05T11:00:00Z', priority: 'NORMAL', reqStatus: 'PENDING', notes: 'Work conflict.' },
    { mrn: '1000245681', docName: 'Iyer', currentStart: '2026-08-05T15:00:00Z', priority: 'HIGH', reqStatus: 'REVIEWING', notes: 'Personal Emergency' },
    { mrn: '1000245682', docName: 'Stewart', currentStart: '2026-08-06T09:00:00Z', priority: 'NORMAL', reqStatus: 'APPROVED', notes: 'Travel conflict.' },
    { mrn: '1000245683', docName: 'Sharma', currentStart: '2026-08-06T11:30:00Z', priority: 'NORMAL', reqStatus: 'DECLINED', notes: 'Schedule conflict.' },
    { mrn: '1000245684', docName: 'Iyer', currentStart: '2026-08-07T14:00:00Z', priority: 'LOW', reqStatus: 'PENDING', notes: 'Not available.' },
    { mrn: '1000245685', docName: 'Sharma', currentStart: '2026-08-07T16:00:00Z', priority: 'NORMAL', reqStatus: 'PENDING', notes: 'Family function.' },
    { mrn: '1000245686', docName: 'Stewart', currentStart: '2026-08-08T10:00:00Z', priority: 'NORMAL', reqStatus: 'PENDING', notes: 'Patient request.' },
  ];

  for (const r of rescheduleData) {
    const patient = createdPatients[r.mrn];
    const docId = docMap[r.docName] || primaryDocId;
    if (!patient) continue;

    const start = new Date(r.currentStart);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const appt = await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        patientId: patient.id,
        doctorId: docId,
        facilityId: facility.id,
        departmentId: departments['GEN'] || null,
        appointmentTypeId: createdApptTypes['FOLLOW_UP'] || null,
        startTime: start,
        endTime: end,
        durationMinutes: 30,
        reason: 'Regular Follow-up Visit',
        status: 'SCHEDULED',
      },
    });

    await prisma.appointmentRequest.create({
      data: {
        tenantId: tenant.id,
        appointmentId: appt.id,
        patientId: patient.id,
        requestType: 'RESCHEDULE',
        status: r.reqStatus as any,
        priority: r.priority,
        reason: r.notes,
        notes: r.notes,
        requestedBy: patient.id,
        requestedNewStart: new Date(start.getTime() + 48 * 3600 * 1000), // +2 days
      },
    });

    await prisma.appointmentStatusHistory.create({
      data: {
        appointmentId: appt.id,
        fromStatus: null,
        toStatus: 'SCHEDULED',
        reason: 'Original appointment scheduled',
        changedBy: adminUser?.id || patient.id,
      },
    });
  }
  console.log(`✅ ${rescheduleData.length} Appointments & Reschedule Requests seeded!`);

  console.log('\n🏥 AxioVital seed complete!');
  console.log(`\n📋 Login credentials:`);
  console.log(`   Tenant ID: ${tenant.id}`);
  console.log(`   Password (all users): axiovital2025`);
  console.log(`   Users:`);
  for (const u of userDefinitions) {
    console.log(`     - ${u.firstName} ${u.lastName} → ${u.email}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
