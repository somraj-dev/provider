import { PrismaClient, TenantType, TenantStatus, UserRole, UserStatus, Gender, BloodGroup, DoctorSpecialization } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AxioVital Enterprise Healthcare OS database...');

  // 1. Create Default Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'main-hospital' },
    update: {},
    create: {
      name: 'AxioVital Central Hospital',
      slug: 'main-hospital',
      type: TenantType.HOSPITAL,
      status: TenantStatus.ACTIVE,
      email: 'info@axiovital.org',
      phone: '+1-800-555-AXIO',
      address: '100 Healthcare Boulevard, Suite 500',
      city: 'Boston',
      state: 'MA',
      country: 'US',
      postalCode: '02115',
    },
  });
  console.log(`✅ Tenant created: ${tenant.name} (${tenant.id})`);

  // 2. Create Roles
  const adminRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Tenant Administrator' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Tenant Administrator',
      description: 'Full administrative access for tenant hospital operations',
      systemRole: UserRole.TENANT_ADMIN,
    },
  });

  const doctorRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Physician / Doctor' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Physician / Doctor',
      description: 'Clinical access for attending physicians',
      systemRole: UserRole.DOCTOR,
    },
  });

  // 3. Create Admin User & Assign Role
  const passwordHash = await argon2.hash('Admin@123456');
  const adminUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@axiovital.org' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@axiovital.org',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      displayName: 'System Admin',
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.userRole2.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });
  console.log(`✅ Admin user created with TENANT_ADMIN role: ${adminUser.email}`);

  // 4. Create Doctor User & Assign Role
  const doctorUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'dr.smith@axiovital.org' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'dr.smith@axiovital.org',
      passwordHash,
      firstName: 'Alexander',
      lastName: 'Smith',
      displayName: 'Dr. Alexander Smith, MD',
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.userRole2.upsert({
    where: { userId_roleId: { userId: doctorUser.id, roleId: doctorRole.id } },
    update: {},
    create: {
      userId: doctorUser.id,
      roleId: doctorRole.id,
    },
  });

  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: doctorUser.id,
      licenseNumber: 'MD-98412-MA',
      npi: '1982736450',
      specialization: DoctorSpecialization.CARDIOLOGY,
      department: 'Cardiology Department',
      consultationFee: 250.00,
      qualifications: ['MD (Harvard Medical)', 'FACC (Fellow of American College of Cardiology)'],
    },
  });
  console.log(`✅ Doctor profile created with DOCTOR role: Dr. ${doctorUser.firstName} ${doctorUser.lastName}`);

  // 5. Create Sample Patient
  const patient = await prisma.patient.upsert({
    where: { tenantId_mrn: { tenantId: tenant.id, mrn: 'MRN-2026-0001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      mrn: 'MRN-2026-0001',
      firstName: 'Eleanor',
      lastName: 'Vance',
      dateOfBirth: new Date('1985-06-15'),
      gender: Gender.FEMALE,
      bloodGroup: BloodGroup.O_POSITIVE,
      phone: '+1-555-019-2834',
      email: 'eleanor.vance@example.com',
      address: '742 Evergreen Terrace',
      city: 'Boston',
      state: 'MA',
      country: 'US',
      postalCode: '02116',
      primaryDoctorId: doctor.id,
    },
  });
  console.log(`✅ Sample patient created: ${patient.firstName} ${patient.lastName} (MRN: ${patient.mrn})`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
