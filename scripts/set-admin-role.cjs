/**
 * Script untuk set Firebase Custom Claims
 * Jalankan: node set-admin-role.cjs
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // Atau gunakan service account:
  // credential: admin.credential.cert(require('./service-account.json')),
});

const TARGET_EMAIL = 'aris.22002.priyanto@gmail.com';
const ROLE = 'ketua_rw'; // Changed from 'ketua_rw' to 'ketua_rw'
const RT = '001';
const RW = '01';

async function setCustomClaims() {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(TARGET_EMAIL);
    
    console.log(`Found user: ${user.email} (UID: ${user.uid})`);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      role: ROLE,
      rt: RT,
      rw: RW,
      roleDisplay: 'Ketua RW',
    });
    
    console.log(`✅ Custom claims set successfully!`);
    console.log(`   - role: ${ROLE}`);
    console.log(`   - rt: ${RT}`);
    console.log(`   - rw: ${RW}`);
    console.log(`\nUser will need to re-login to get updated claims.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting custom claims:', error.message);
    process.exit(1);
  }
}

setCustomClaims();
