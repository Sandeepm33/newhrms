const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'hrms';

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not set in .env.local');
  process.exit(1);
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
  console.log('Connected to MongoDB successfully!');

  const db = mongoose.connection.db;

  // 1. Create Organization
  const orgsCollection = db.collection('organizations');
  let org = await orgsCollection.findOne({ slug: 'acme-corp' });
  if (!org) {
    const orgRes = await orgsCollection.insertOne({
      name: 'Acme Corporation',
      slug: 'acme-corp',
      country: 'IN',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      subscriptionStatus: 'ACTIVE',
      settings: {
        enabledModules: ['dashboard', 'employees', 'attendance', 'leave', 'payroll'],
        maxEmployees: 1000,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        language: 'en',
        fiscalYearStart: 4,
        dateFormat: 'DD/MM/YYYY',
        workingDays: [1, 2, 3, 4, 5],
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00',
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    org = { _id: orgRes.insertedId, name: 'Acme Corporation' };
    console.log('Created Organization: Acme Corporation');
  } else {
    console.log('Found existing Organization: Acme Corporation');
  }

  // 2. Create Superadmin User
  const usersCollection = db.collection('users');
  const email = 'admin@acme.com';
  const password = 'Admin@123456';
  const passwordHash = await bcrypt.hash(password, 12);

  let user = await usersCollection.findOne({ email });
  if (!user) {
    const userRes = await usersCollection.insertOne({
      email,
      passwordHash,
      name: 'Super Admin',
      isSuperAdmin: true,
      isActive: true,
      isEmailVerified: true,
      organizationIds: [org._id],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    user = { _id: userRes.insertedId, email };
    console.log(`Created Super Admin User: ${email}`);
  } else {
    // Update password & superadmin status if existing
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash,
          isSuperAdmin: true,
          isActive: true,
          organizationIds: [org._id],
          updatedAt: new Date(),
        },
      }
    );
    console.log(`Updated Super Admin User password & status for: ${email}`);
  }

  // 3. Seed System Roles
  const rolesCollection = db.collection('roles');
  const systemRoles = [
    { slug: 'super_admin', name: 'Super Admin', sortOrder: 1 },
    { slug: 'global_admin', name: 'Global Admin', sortOrder: 2 },
    { slug: 'hr_admin', name: 'HR Admin', sortOrder: 3 },
    { slug: 'hr_executive', name: 'HR Executive', sortOrder: 4 },
    { slug: 'hr_manager', name: 'HR Manager', sortOrder: 5 },
    { slug: 'payroll_admin', name: 'Payroll Admin', sortOrder: 6 },
    { slug: 'payroll_manager', name: 'Payroll Manager', sortOrder: 7 },
    { slug: 'employee', name: 'Employee', sortOrder: 18 },
  ];

  let globalAdminRoleId = null;
  for (const roleData of systemRoles) {
    let r = await rolesCollection.findOne({ slug: roleData.slug, organizationId: null });
    if (!r) {
      const res = await rolesCollection.insertOne({
        ...roleData,
        isSystem: true,
        organizationId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      if (roleData.slug === 'global_admin') globalAdminRoleId = res.insertedId;
    } else {
      if (roleData.slug === 'global_admin') globalAdminRoleId = r._id;
    }
  }
  console.log('System roles verified!');

  // 4. Assign Global Admin UserRole
  const userRolesCollection = db.collection('userRoles');
  if (globalAdminRoleId) {
    await userRolesCollection.updateOne(
      { userId: user._id, organizationId: org._id },
      {
        $set: {
          userId: user._id,
          organizationId: org._id,
          roleId: globalAdminRoleId,
          scope: 'ORGANIZATION',
          isActive: true,
          assignedBy: user._id,
          assignedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    console.log('Assigned Global Admin role to Super Admin!');
  }

  console.log('\n==================================================');
  console.log('SUCCESS: Superadmin seed completed!');
  console.log('Credentials:');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log('==================================================\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
