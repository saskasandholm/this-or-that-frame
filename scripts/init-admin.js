const { PrismaClient } = require('@prisma/client');

// Default super admin permissions
const SUPER_ADMIN_PERMISSIONS = {
  manageTopics: true,
  manageUsers: true,
  manageAdmins: true,
  viewStats: true,
  moderateContent: true,
  manageSettings: true
};

// Your FID
const SUPER_ADMIN_FID = 7806;

async function main() {
  console.log('Initializing admin user...');
  
  // Create a new Prisma client
  const prisma = new PrismaClient();
  
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { fid: SUPER_ADMIN_FID }
    });
    
    if (existingAdmin) {
      console.log(`Admin with FID ${SUPER_ADMIN_FID} already exists.`);
      
      // Update to ensure it has the correct role and permissions
      const updatedAdmin = await prisma.admin.update({
        where: { fid: SUPER_ADMIN_FID },
        data: {
          isActive: true,
          role: 'SUPER_ADMIN',
          permissions: SUPER_ADMIN_PERMISSIONS
        }
      });
      
      console.log(`Updated admin: ${JSON.stringify(updatedAdmin, null, 2)}`);
      return;
    }
    
    // Create super admin
    const admin = await prisma.admin.create({
      data: {
        fid: SUPER_ADMIN_FID,
        isActive: true,
        role: 'SUPER_ADMIN',
        permissions: SUPER_ADMIN_PERMISSIONS
      }
    });
    
    console.log(`Successfully created super admin:`);
    console.log(JSON.stringify(admin, null, 2));
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main(); 