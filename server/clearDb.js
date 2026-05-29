const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lms-2266a-default-rtdb.firebaseio.com/"
});

const db = admin.database();

const defaultCourses = {
  "-N_course_1": {
    id: "-N_course_1",
    title: "Modern UI/UX Design",
    category: "Design",
    duration: "12h 30m",
    lessons: "8",
    rating: 4.8,
    students: 1248,
    instructor: "Sarah Jenkins",
    progress: 0,
    image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&w=800&q=80",
    quizzes: {
      "1": [
        { "question": "What does UI stand for?", "options": ["User Interface", "User Integration", "Universal Interface", "User Interaction"], "correct": 0 },
        { "question": "Which design principle refers to the distribution of visual weight?", "options": ["Contrast", "Balance", "Alignment", "Proximity"], "correct": 1 }
      ]
    }
  },
  "-N_course_2": {
    id: "-N_course_2",
    title: "Advanced React Architecture",
    category: "Development",
    duration: "18h 45m",
    lessons: "12",
    rating: 4.9,
    students: 856,
    instructor: "Alex Rivers",
    progress: 45,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
    quizzes: {
      "1": [
        { "question": "What is the purpose of React.memo?", "options": ["To cache the value of a function call", "To memoize a component and prevent unnecessary re-renders", "To register context values", "To create mutable references"], "correct": 1 }
      ]
    }
  },
  "-N_course_3": {
    id: "-N_course_3",
    title: "Database Systems & SQL",
    category: "Database",
    duration: "15h 15m",
    lessons: "10",
    rating: 4.7,
    students: 512,
    instructor: "Marcus Stone",
    progress: 0,
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80",
    quizzes: {
      "1": [
        { "question": "Which SQL statement is used to extract data from a database?", "options": ["SELECT", "EXTRACT", "GET", "OPEN"], "correct": 0 }
      ]
    }
  }
};

const defaultStudents = {
  "-N_student_1": {
    id: "-N_student_1",
    name: "Emma Watson",
    email: "emma.watson@gmail.com",
    joinedAt: "2026-01-15",
    courses: 3,
    status: "Active",
    role: "Student",
    password: "Student@123"
  },
  "-N_student_2": {
    id: "-N_student_2",
    name: "Liam Neeson",
    email: "liam@gmail.com",
    joinedAt: "2026-02-10",
    courses: 1,
    status: "Active",
    role: "Student",
    password: "Student@123"
  },
  "-N_student_3": {
    id: "-N_student_3",
    name: "Robert Downey",
    email: "robert@gmail.com",
    joinedAt: "2026-03-05",
    courses: 2,
    status: "Suspended",
    role: "Student",
    password: "Student@123"
  },
  "-N_instructor_1": {
    id: "-N_instructor_1",
    name: "Alex Rivers",
    email: "instructor@sslabs.com",
    joinedAt: "2026-01-10",
    courses: 2,
    status: "Active",
    role: "Instructor",
    password: "Instructor@123"
  },
  "-N_admin_1": {
    id: "-N_admin_1",
    name: "System Admin",
    email: "admin@sslabs.com",
    joinedAt: "2026-01-01",
    courses: 0,
    status: "Active",
    role: "Administrator",
    password: "Admin@123"
  }
};

const defaultEnrollments = {
  "-N_enrollment_1": {
    id: "-N_enrollment_1",
    name: "Emma Watson",
    email: "emma.watson@gmail.com",
    course: "Modern UI/UX Design",
    progress: 85,
    enrolledDate: "2026-01-15"
  },
  "-N_enrollment_2": {
    id: "-N_enrollment_2",
    name: "Liam Neeson",
    email: "liam@gmail.com",
    course: "Advanced React Architecture",
    progress: 45,
    enrolledDate: "2026-02-10"
  }
};

const defaultAdminStats = {
  revenue: '₹28,450',
  activeUsers: '2,618',
  courses: '3',
  systemLoad: '12%'
};

const defaultStudentStats = {
  coursesInProgress: 2,
  learningHours: '42h',
  communityRank: '#24',
  certificatesEarned: 1
};

const defaultInstructorStats = {
  totalStudents: '2,618',
  courseRating: '4.8',
  revenue: '₹18,450',
  activeCourses: '3'
};

const defaultGradingQueue = [
  { id: 1, student: "Emma Watson", course: "Modern UI/UX Design", assignment: "Portfolio Design Review", submitted: "2 hours ago", status: "pending" },
  { id: 2, student: "Liam Neeson", course: "Advanced React Architecture", assignment: "State Management Implementation", submitted: "5 hours ago", status: "pending" }
];

const defaultPlatformHealth = [
  { service: 'Database Server', status: 'Operational', uptime: '99.98%' },
  { service: 'Authentication API', status: 'Operational', uptime: '100%' },
  { service: 'Video CDN', status: 'Operational', uptime: '99.95%' },
  { service: 'Payment Gateway', status: 'Operational', uptime: '100%' }
];

const defaultAdminActivity = [
  { id: 1, action: "User 'Robert Downey' suspended", time: "10 mins ago", type: "system" },
  { id: 2, action: "Course 'Database Systems & SQL' published", time: "1 hour ago", type: "course" }
];

async function seedDatabase() {
  console.log('Clearing Firebase database...');
  await db.ref().remove();
  
  console.log('Seeding courses...');
  await db.ref('courses').set(defaultCourses);
  
  console.log('Seeding students...');
  await db.ref('students').set(defaultStudents);
  
  console.log('Seeding enrollments...');
  await db.ref('enrollments').set(defaultEnrollments);
  
  console.log('Seeding admin statistics...');
  await db.ref('adminStats').set(defaultAdminStats);
  
  console.log('Seeding student statistics...');
  await db.ref('studentStats').set(defaultStudentStats);
  
  console.log('Seeding instructor statistics...');
  await db.ref('instructorStats').set(defaultInstructorStats);
  
  console.log('Seeding grading queue...');
  await db.ref('gradingQueue').set(defaultGradingQueue);
  
  console.log('Seeding platform health...');
  await db.ref('platformHealth').set(defaultPlatformHealth);
  
  console.log('Seeding admin activity logs...');
  await db.ref('adminActivity').set(defaultAdminActivity);
  
  console.log('Firebase Database cleared and successfully seeded with premium default data!');
  process.exit(0);
}

seedDatabase().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
