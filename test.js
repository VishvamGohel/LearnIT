fetch('http://localhost:3000/api/generate-roadmap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: "React", transcript: [] })
})
.then(async res => {
  console.log("Status:", res.status);
  console.log("Headers:", Object.fromEntries(res.headers.entries()));
  const text = await res.text();
  console.log("Body:", text);
})
.catch(err => console.error(err));
