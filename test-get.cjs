const http = require('http');

http.get('http://127.0.0.1:5000/api/courses', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`BODY: ${data}`);
  });
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
});
