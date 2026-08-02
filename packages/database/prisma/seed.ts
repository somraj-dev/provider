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
