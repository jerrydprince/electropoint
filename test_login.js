const http = require('http');

const data = JSON.stringify({
  email: 'admin@electropoint.com',
  password: 'password'
});

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let responseBody = '';
  res.on('data', d => {
    responseBody += d;
  });
  res.on('end', () => {
    console.log(responseBody);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
