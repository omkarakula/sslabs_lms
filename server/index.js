const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Firebase Initialization
// Note: You need to download your serviceAccountKey.json from Firebase Console
let database;
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://lms-2266a-default-rtdb.firebaseio.com/"
  });
  database = admin.database();
  console.log('Firebase connected successfully');
} catch (error) {
  console.error('Firebase connection failed (serviceAccountKey.json missing):', error.message);
  console.log('Running with local mock data instead.');
}

// ----------------------------------------------------
// Mock Data (Fallback)
// ----------------------------------------------------

const DB_FILE = path.join(__dirname, 'db.json');

let localDb = {};

const defaultDb = {
  mockCourses: [],
  mockStudents: [],
  mockEnrollments: [],
  practiceQuestions: [],
  notifications: [],
  mockAdminStats: {
    revenue: '₹0',
    activeUsers: '0',
    courses: '0',
    systemLoad: '0%'
  },
  mockPlatformHealth: [],
  mockStudentStats: {
    coursesInProgress: 0,
    learningHours: '0h',
    communityRank: 'N/A',
    certificatesEarned: 0
  },
  mockAdminActivity: [],
  mockInstructorStats: {
    totalStudents: '0',
    courseRating: '0',
    revenue: '₹0',
    activeCourses: '0'
  },
  mockGradingQueue: [],
  mockFeedback: []
};

if (fs.existsSync(DB_FILE)) {
  try {
    const fileDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    localDb = { ...defaultDb, ...fileDb };
  } catch (err) {
    console.error('Error reading db.json:', err);
    localDb = defaultDb;
  }
} else {
  localDb = defaultDb;
  fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2));
}

const saveLocalDb = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2));
};


// ----------------------------------------------------
// Routes
// ----------------------------------------------------

// Helpers for Firebase mapping
const getFirebaseData = async (path, fallback) => {
  if (database) {
    try {
      const firebasePromise = database.ref(path).once('value').then(snapshot => {
        const data = snapshot.val();
        if (!data) return fallback;
        return Array.isArray(fallback) ? Object.values(data) : data;
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase timeout')), 2000)
      );

      return await Promise.race([firebasePromise, timeoutPromise]);
    } catch (error) {
      console.warn(`Firebase GET fallback at ${path}:`, error.message);
      console.log('Firebase connection failed, switching to Local Database mode.');
      database = null;
      return fallback;
    }
  }
  return fallback;
};

const runFirebaseWrite = async (writeFn, fallbackFn) => {
  if (database) {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase timeout')), 2000)
      );
      await Promise.race([writeFn(), timeoutPromise]);
    } catch (error) {
      console.warn('Firebase operation failed/timed out, falling back to local DB:', error.message);
      console.log('Firebase connection failed, switching to Local Database mode.');
      database = null;
      await fallbackFn();
    }
  } else {
    await fallbackFn();
  }
};

// Course Routes
app.get('/api/courses', async (req, res) => {
  const data = await getFirebaseData('courses', localDb.mockCourses);
  const coursesArray = Array.isArray(data) ? data : Object.values(data || {});
  res.json(coursesArray);
});

app.get('/api/courses/:id', async (req, res) => {
  const id = req.params.id;
  if (database) {
    const data = await getFirebaseData(`courses/${id}`, null);
    if (data) return res.json(data);
  }
  const course = localDb.mockCourses.find(c => c.id === parseInt(id));
  if (!course) return res.status(404).send('Course not found');
  res.json(course);
});

app.post('/api/courses', async (req, res) => {
  const newCourse = { ...req.body, status: "Pending Review", students: 0, rating: 0 };
  let courseWithId = { ...newCourse };

  const firebaseWrite = async () => {
    const ref = database.ref('courses').push();
    courseWithId.id = ref.key;
    await ref.set(courseWithId);
  };

  const localWrite = async () => {
    courseWithId.id = Date.now();
    localDb.mockCourses.push(courseWithId);
    saveLocalDb();
  };

  await runFirebaseWrite(firebaseWrite, localWrite);
  res.status(201).json(courseWithId);
});

app.post('/api/courses/:id/quiz/:moduleId', async (req, res) => {
  const courseId = parseInt(req.params.id) || req.params.id;
  const moduleId = req.params.moduleId;
  const newQuiz = req.body.quiz || [];

  const course = localDb.mockCourses.find(c => c.id === courseId || c.id.toString() === courseId.toString());
  const courseTitle = course ? course.title : 'Course';

  const notification = {
    id: Date.now().toString(),
    courseId: courseId,
    courseTitle: courseTitle,
    moduleId: moduleId,
    message: `New Quiz uploaded for Module ${moduleId} in ${courseTitle}`,
    createdAt: new Date().toISOString(),
    read: false
  };

  const firebaseWrite = async () => {
    const courseRef = database.ref(`courses/${courseId}`);
    await courseRef.child('quizzes').child(moduleId).set(newQuiz);
    await database.ref('notifications').push(notification);
  };

  const localWrite = async () => {
    const courseIndex = localDb.mockCourses.findIndex(c => c.id === courseId || c.id.toString() === courseId.toString());
    if (courseIndex !== -1) {
      if (!localDb.mockCourses[courseIndex].quizzes) {
        localDb.mockCourses[courseIndex].quizzes = {};
      }
      localDb.mockCourses[courseIndex].quizzes[moduleId] = newQuiz;
    }
    if (!localDb.notifications) {
      localDb.notifications = [];
    }
    localDb.notifications.push(notification);
    saveLocalDb();
  };

  await runFirebaseWrite(firebaseWrite, localWrite);
  res.status(200).json({ success: true, quiz: newQuiz });
});

app.post('/api/courses/:id/quizzes/clear', async (req, res) => {
  const courseId = parseInt(req.params.id) || req.params.id;

  const firebaseWrite = async () => {
    await database.ref(`courses/${courseId}/quizzes`).remove();
  };

  const localWrite = async () => {
    const courseIndex = localDb.mockCourses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      localDb.mockCourses[courseIndex].quizzes = {};
      saveLocalDb();
    }
  };

  await runFirebaseWrite(firebaseWrite, localWrite);
  res.status(200).json({ success: true });
});

app.put('/api/courses/:id', async (req, res) => {
  const courseId = parseInt(req.params.id) || req.params.id;
  const updatedData = req.body;
  let resultCourse;

  const firebaseWrite = async () => {
    await database.ref(`courses/${courseId}`).update(updatedData);
  };

  const localWrite = async () => {
    const courseIndex = localDb.mockCourses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      localDb.mockCourses[courseIndex] = { ...localDb.mockCourses[courseIndex], ...updatedData };
      resultCourse = localDb.mockCourses[courseIndex];
      saveLocalDb();
    }
  };

  await runFirebaseWrite(firebaseWrite, localWrite);
  res.status(200).json(resultCourse || { success: true });
});

app.post('/api/courses/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Expected an array of ids' });

  const firebaseWrite = async () => {
    const updates = {};
    ids.forEach(id => updates[`courses/${id}`] = null);
    await database.ref().update(updates);
  };

  const localWrite = async () => {
    localDb.mockCourses = localDb.mockCourses.filter(c => !ids.includes(c.id));
    saveLocalDb();
  };

  await runFirebaseWrite(firebaseWrite, localWrite);
  res.status(200).json({ success: true, deleted: ids });
});

// Student Routes
app.get('/api/students', async (req, res) => {
  const data = await getFirebaseData('students', localDb.mockStudents);
  res.json(data);
});

app.post('/api/students/bulk', async (req, res) => {
  const students = req.body.students;
  if (!Array.isArray(students)) {
    return res.status(400).json({ error: 'Expected an array of students' });
  }

  const processedStudents = [];
  const processedEnrollments = [];

  students.forEach((student, index) => {
    const id = Date.now() + index;
    processedStudents.push({
      ...student,
      id: id,
      joinedAt: new Date().toISOString().split('T')[0],
      status: student.status || "Active",
      courses: parseInt(student.courses) || 0
    });

    processedEnrollments.push({
      id: id + 10000,
      name: student.name,
      email: student.email,
      course: 'Pending Course Assignment',
      progress: 0,
      enrolledDate: new Date().toISOString().split('T')[0]
    });
  });

  if (database) {
    try {
      const updates = {};
      processedStudents.forEach((student, idx) => {
        const studentKey = database.ref('students').push().key;
        student.id = studentKey;
        updates[`students/${studentKey}`] = student;

        const enrollment = processedEnrollments[idx];
        const enrollmentKey = database.ref('enrollments').push().key;
        enrollment.id = enrollmentKey;
        updates[`enrollments/${enrollmentKey}`] = enrollment;
      });
      await database.ref().update(updates);
      return res.status(201).json(processedStudents);
    } catch (error) {
      console.warn('Firebase bulk students failed, falling back to local DB:', error.message);
    }
  }

  localDb.mockStudents.push(...processedStudents);
  localDb.mockEnrollments.push(...processedEnrollments);
  saveLocalDb();
  res.status(201).json(processedStudents);
});

app.post('/api/students', async (req, res) => {
  const id = Date.now();
  const newStudent = { ...req.body, id, joinedAt: new Date().toISOString().split('T')[0], status: "Active" };
  
  const newEnrollment = {
    id: id + 10000,
    name: newStudent.name,
    email: newStudent.email,
    course: 'Pending Course Assignment',
    progress: 0,
    enrolledDate: new Date().toISOString().split('T')[0]
  };

  if (database) {
    try {
      const studentRef = database.ref('students').push();
      newStudent.id = studentRef.key;
      
      const enrollmentRef = database.ref('enrollments').push();
      newEnrollment.id = enrollmentRef.key;

      const updates = {};
      updates[`students/${studentRef.key}`] = newStudent;
      updates[`enrollments/${enrollmentRef.key}`] = newEnrollment;

      await database.ref().update(updates);
      return res.status(201).json(newStudent);
    } catch (error) {
      console.warn('Firebase POST student failed, falling back to local DB:', error.message);
    }
  }
  
  localDb.mockStudents.push(newStudent);
  localDb.mockEnrollments.push(newEnrollment);
  saveLocalDb();
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  if (database) {
    try {
      await database.ref(`students/${id}`).update(updatedData);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.warn('Firebase PUT student failed, falling back to local DB:', error.message);
    }
  }

  const studentIndex = localDb.mockStudents.findIndex(s => s.id.toString() === id.toString());
  if (studentIndex === -1) return res.status(404).send('Student not found');

  localDb.mockStudents[studentIndex] = { ...localDb.mockStudents[studentIndex], ...updatedData };
  saveLocalDb();
  res.status(200).json(localDb.mockStudents[studentIndex]);
});

// Dashboard Endpoints
app.post('/api/students/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Expected an array of ids' });

  if (database) {
    try {
      const updates = {};
      ids.forEach(id => updates[`students/${id}`] = null);
      await database.ref().update(updates);
      return res.status(200).json({ success: true, deleted: ids });
    } catch (error) {
      console.warn('Firebase bulk-delete students failed, falling back to local DB:', error.message);
    }
  }

  localDb.mockStudents = localDb.mockStudents.filter(s => !ids.includes(s.id));
  saveLocalDb();
  res.status(200).json({ success: true, deleted: ids });
});

app.post('/api/enrollments/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Expected an array of ids' });

  if (database) {
    try {
      const updates = {};
      ids.forEach(id => updates[`enrollments/${id}`] = null);
      await database.ref().update(updates);
      return res.status(200).json({ success: true, deleted: ids });
    } catch (error) {
      console.warn('Firebase bulk-delete enrollments failed, falling back to local DB:', error.message);
    }
  }

  localDb.mockEnrollments = localDb.mockEnrollments.filter(e => !ids.includes(e.id));
  saveLocalDb();
  res.status(200).json({ success: true, deleted: ids });
});

// Dashboard Endpoints
app.post('/api/enrollments', async (req, res) => {
  const newEnrollment = { ...req.body, enrolledDate: new Date().toISOString().split('T')[0] };
  let enrollmentWithId = { ...newEnrollment };
  
  const firebaseWrite = async () => {
    const ref = database.ref('enrollments').push();
    enrollmentWithId.id = ref.key;
    await ref.set(enrollmentWithId);
  };
  
  const localWrite = () => {
    enrollmentWithId.id = Date.now().toString();
    localDb.mockEnrollments.push(enrollmentWithId);
    saveLocalDb();
  };

  try {
    await runFirebaseWrite(firebaseWrite, localWrite);
    res.status(201).json(enrollmentWithId);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create enrollment' });
  }
});

app.get('/api/enrollments', async (req, res) => {
  const data = await getFirebaseData('enrollments', localDb.mockEnrollments);
  const enrollmentsArray = Array.isArray(data) ? data : Object.values(data || {});
  res.json(enrollmentsArray);
});

app.post('/api/enrollments/complete', async (req, res) => {
  const { email, courseId } = req.body;
  if (!email || !courseId) return res.status(400).json({ error: 'Missing data' });

  const localWrite = () => {
    let found = false;
    localDb.mockEnrollments = localDb.mockEnrollments.map(e => {
      if (String(e.courseId) === String(courseId) && e.email === email) {
        found = true;
        return { ...e, progress: 100 };
      }
      return e;
    });
    
    if (!found) {
      localDb.mockEnrollments.push({
        id: Date.now().toString(),
        courseId,
        email,
        progress: 100,
        enrolledDate: new Date().toISOString().split('T')[0]
      });
    }
    saveLocalDb();
  };

  try {
    // Just run localWrite since Firebase is in fallback mode anyway
    localWrite();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

app.get('/api/metrics/admin', async (req, res) => {
  const allStudents = await getFirebaseData('students', localDb.mockStudents);
  const allCourses = await getFirebaseData('courses', localDb.mockCourses);
  const allEnrollments = await getFirebaseData('enrollments', localDb.mockEnrollments);

  const activeUsersCount = allStudents ? (Array.isArray(allStudents) ? allStudents.length : Object.keys(allStudents).length) : 0;
  const coursesCount = allCourses ? (Array.isArray(allCourses) ? allCourses.length : Object.keys(allCourses).length) : 0;
  const enrollmentsCount = allEnrollments ? (Array.isArray(allEnrollments) ? allEnrollments.length : Object.keys(allEnrollments).length) : 0;
  
  const totalRevenue = enrollmentsCount * 2500; 

  const stats = {
       revenue: '₹' + totalRevenue.toLocaleString(),
       activeUsers: activeUsersCount.toString(),
       courses: coursesCount.toString(),
       systemLoad: '42%'
  };
  
  let activity = [];
  if (allStudents) {
      const studentsList = Array.isArray(allStudents) ? allStudents : Object.values(allStudents);
      const recent = studentsList.slice(-3).reverse();
      recent.forEach((s, idx) => {
         activity.push({
            id: idx + 1,
            user: s.name || 'Unknown User',
            action: "registered on the platform",
            target: "LMS Portal",
            time: "Recently",
            type: "role"
         });
      });
  }
  
  if (activity.length === 0) {
     activity = [
      { id: 1, user: "System", action: "completed automated backup", target: "Database", time: "10 mins ago", type: "security" },
      { id: 2, user: "Alex Rivers", action: "published a new course", target: "React Patterns", time: "2 hours ago", type: "course" }
     ];
  }
  
  let platformHealth = await getFirebaseData('platformHealth', localDb.mockPlatformHealth);
  if (!platformHealth || platformHealth.length === 0 || !platformHealth[0].service) {
     platformHealth = [
      { service: "Database Cluster", status: "Operational", uptime: "99.99%" },
      { service: "Video Streaming", status: "Operational", uptime: "99.95%" },
      { service: "Authentication", status: "Operational", uptime: "100%" }
     ];
  }
  
  res.json({ stats, activity, platformHealth });
});

app.get('/api/metrics/student', async (req, res) => {
  const stats = await getFirebaseData('studentStats', localDb.mockStudentStats);
  res.json({ stats });
});

app.get('/api/metrics/instructor', async (req, res) => {
  const allCourses = await getFirebaseData('courses', localDb.mockCourses);
  const courseList = allCourses ? (Array.isArray(allCourses) ? allCourses : Object.values(allCourses)) : [];
  
  let totalStudents = 0;
  let totalRating = 0;
  let ratingCount = 0;
  
  courseList.forEach(course => {
     totalStudents += parseInt(course.students) || 0;
     if (course.rating && parseFloat(course.rating) > 0) {
        totalRating += parseFloat(course.rating);
        ratingCount++;
     }
  });
  
  const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "0.0";
  const revenue = totalStudents * 1500; // Estimate revenue per student
  
  const stats = {
     totalStudents: totalStudents.toString(),
     courseRating: avgRating,
     revenue: '₹' + revenue.toLocaleString(),
     activeCourses: courseList.length.toString()
  };
  
  let gradingQueue = await getFirebaseData('gradingQueue', localDb.mockGradingQueue);
  if (!gradingQueue || gradingQueue.length === 0) {
     gradingQueue = [
        { id: 1, student: "Liam Neeson", submitted: "2 hours ago", course: "AI Tools", assignment: "Module 1 Quiz" }
     ];
  }
  
  res.json({ stats, gradingQueue });
});

// Feedback Endpoint
app.post('/api/feedback', async (req, res) => {
  const newFeedback = {
    id: Date.now(),
    courseId: req.body.courseId,
    courseName: req.body.courseName,
    studentName: req.body.studentName || 'Anonymous',
    rating: parseInt(req.body.rating) || 5,
    comment: req.body.comment || '',
    date: new Date().toISOString().split('T')[0]
  };

  if (database) {
    try {
      const ref = database.ref('feedback').push();
      newFeedback.id = ref.key;
      await ref.set(newFeedback);
      
      // Update course rating dynamically in Firebase if exists
      const courseRef = database.ref(`courses/${req.body.courseId}`);
      const courseSnap = await courseRef.once('value');
      if (courseSnap.exists()) {
        const feedbackSnap = await database.ref('feedback').once('value');
        const allFeedback = Object.values(feedbackSnap.val() || {});
        const courseFeedbacks = allFeedback.filter(f => f.courseId === req.body.courseId);
        const avg = courseFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / (courseFeedbacks.length || 1);
        await courseRef.update({ rating: parseFloat(avg.toFixed(1)) });
      }
      
      return res.status(201).json(newFeedback);
    } catch (error) {
      console.warn('Firebase POST feedback failed, falling back to local DB:', error.message);
    }
  }

  if (!localDb.mockFeedback) {
    localDb.mockFeedback = [];
  }
  localDb.mockFeedback.push(newFeedback);

  // Update course rating dynamically in local fallback
  const courseIndex = localDb.mockCourses.findIndex(c => c.id.toString() === req.body.courseId.toString());
  if (courseIndex !== -1) {
    const courseFeedbacks = localDb.mockFeedback.filter(f => f.courseId.toString() === req.body.courseId.toString());
    const avg = courseFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / (courseFeedbacks.length || 1);
    localDb.mockCourses[courseIndex].rating = parseFloat(avg.toFixed(1));
  }

  saveLocalDb();
  res.status(201).json(newFeedback);
});

// GET all feedbacks
app.get('/api/feedback', async (req, res) => {
  const data = await getFirebaseData('feedback', localDb.mockFeedback || []);
  res.json(data);
});

// DELETE a feedback
app.delete('/api/feedback/:id', async (req, res) => {
  const id = req.params.id;

  if (database) {
    try {
      await database.ref(`feedback/${id}`).remove();
      return res.status(200).json({ success: true });
    } catch (error) {
      console.warn('Firebase DELETE feedback failed, falling back to local DB:', error.message);
    }
  }

  localDb.mockFeedback = (localDb.mockFeedback || []).filter(f => f.id.toString() !== id.toString());
  saveLocalDb();
  res.status(200).json({ success: true });
});

// DELETE bulk feedbacks
app.post('/api/feedback/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Expected an array of ids' });

  if (database) {
    try {
      const updates = {};
      ids.forEach(id => updates[`feedback/${id}`] = null);
      await database.ref().update(updates);
      return res.status(200).json({ success: true, deleted: ids });
    } catch (error) {
      console.warn('Firebase bulk-delete feedback failed, falling back to local DB:', error.message);
    }
  }

  localDb.mockFeedback = (localDb.mockFeedback || []).filter(f => !ids.includes(f.id));
  saveLocalDb();
  res.status(200).json({ success: true, deleted: ids });
});
// Practice Questions Endpoints
app.get('/api/practice-questions', async (req, res) => {
  const data = await getFirebaseData('practiceQuestions', localDb.practiceQuestions || []);
  const questionsArray = Array.isArray(data) ? data : Object.values(data || {});
  res.json(questionsArray);
});

app.post('/api/practice-questions', async (req, res) => {
  const newQuestion = { ...req.body };
  let questionWithId = { ...newQuestion };

  const firebaseWrite = async () => {
    const ref = database.ref('practiceQuestions').push();
    questionWithId.id = ref.key;
    await ref.set(questionWithId);
  };

  const localWrite = async () => {
    questionWithId.id = Date.now();
    if (!localDb.practiceQuestions) {
      localDb.practiceQuestions = [];
    }
    localDb.practiceQuestions.push(questionWithId);
    saveLocalDb();
  };

  await runFirebaseWrite(firebaseWrite, localWrite);
  res.status(201).json(questionWithId);
});

app.post('/api/practice-questions/bulk', async (req, res) => {
  const questions = req.body.questions;
  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: 'Expected an array of questions' });
  }

  const processedQuestions = questions.map((q, index) => ({
    ...q,
    id: q.id || (Date.now() + index)
  }));

  if (database) {
    try {
      const updates = {};
      processedQuestions.forEach(q => {
        const key = database.ref('practiceQuestions').push().key;
        q.id = key;
        updates[`practiceQuestions/${key}`] = q;
      });
      await database.ref().update(updates);
      return res.status(201).json(processedQuestions);
    } catch (error) {
      console.warn('Firebase bulk practice questions failed, falling back to local DB:', error.message);
    }
  }

  if (!localDb.practiceQuestions) {
    localDb.practiceQuestions = [];
  }
  localDb.practiceQuestions.push(...processedQuestions);
  saveLocalDb();
  res.status(201).json(processedQuestions);
});

app.post('/api/practice-questions/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Expected an array of ids' });

  if (database) {
    try {
      const updates = {};
      ids.forEach(id => updates[`practiceQuestions/${id}`] = null);
      await database.ref().update(updates);
      return res.status(200).json({ success: true, deleted: ids });
    } catch (error) {
      console.warn('Firebase bulk-delete practice questions failed, falling back to local DB:', error.message);
    }
  }

  if (localDb.practiceQuestions) {
    localDb.practiceQuestions = localDb.practiceQuestions.filter(q => !ids.includes(q.id) && !ids.includes(q.id.toString()));
  }
  saveLocalDb();
  res.status(200).json({ success: true, deleted: ids });
});

// Notifications Endpoints
app.get('/api/notifications', async (req, res) => {
  const data = await getFirebaseData('notifications', localDb.notifications || []);
  const notificationsArray = Array.isArray(data) ? data : Object.values(data || {});
  res.json(notificationsArray);
});

app.post('/api/notifications/read-all', async (req, res) => {
  const firebaseWrite = async () => {
    const snapshot = await database.ref('notifications').once('value');
    const data = snapshot.val() || {};
    const updates = {};
    Object.keys(data).forEach(key => {
      updates[`notifications/${key}/read`] = true;
    });
    await database.ref().update(updates);
  };

  const localWrite = async () => {
    if (localDb.notifications) {
      localDb.notifications = localDb.notifications.map(n => ({ ...n, read: true }));
    }
    saveLocalDb();
  };

  await runFirebaseWrite(firebaseWrite, localWrite);
  res.status(200).json({ success: true });
});

app.post('/api/notifications/clear-all', async (req, res) => {
  const firebaseWrite = async () => {
    await database.ref('notifications').remove();
  };

  const localWrite = async () => {
    localDb.notifications = [];
    saveLocalDb();
  };

  await runFirebaseWrite(firebaseWrite, localWrite);
  res.status(200).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


