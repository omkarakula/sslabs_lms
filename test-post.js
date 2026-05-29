const http = require('http');

const data = JSON.stringify({
  title: "Test Course",
  instructor: "Test Instructor",
  price: "1000",
  duration: "10h",
  lessons: "5",
  category: "Development",
  image: "",
  facilities: ["Test"],
  modules: [],
  quiz: [],
  assignment: {}
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/courses',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
