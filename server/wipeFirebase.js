const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lms-2266a-default-rtdb.firebaseio.com/"
});

const db = admin.database();

async function wipeDatabase() {
  console.log('Wiping Firebase database...');
  await db.ref().remove();
  console.log('Firebase Database completely wiped of all dummy data!');
  process.exit(0);
}

wipeDatabase().catch(err => {
  console.error('Error wiping database:', err);
  process.exit(1);
});
