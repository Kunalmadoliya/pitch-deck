const http = require('http');

http.get('http://localhost:3000/login', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    // Find all error or issue strings
    const lines = data.split('\n');
    for (const l of lines) {
      if (l.includes('error') || l.includes('Error') || l.includes('issue') || l.includes('Issue')) {
        console.log('MATCH:', l.slice(0, 200));
      }
    }
  });
});
