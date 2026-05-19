async function testPost() {
  try {
    console.log('Sending request to local api to create place...');
    const response = await fetch('http://localhost:3000/api/places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Testing ' + Date.now() }),
    });
    
    const status = response.status;
    const body = await response.json();
    console.log('Response Status:', status);
    console.log('Response Body:', body);
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testPost();
