
const axios = require('axios');
const names = ['Socios', 'socios', 'Socio', 'socio'];
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6dGh3eGFjZ3B5cWRlZWF3Z3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMDc0NTYsImV4cCI6MjA4MzU4MzQ1Nn0.SrD6fGfXHBsy96pef5ZcD0pgK2UjqjX3PMN2Hui6vt8';

async function test() {
    for (const name of names) {
        const url = `https://szthwxacgpyqdeeawgqx.supabase.co/rest/v1/${name}?select=count`;
        try {
            const resp = await axios.get(url, {
                headers: {
                    'apikey': apikey,
                    'Authorization': `Bearer ${apikey}`,
                    'Prefer': 'count=exact'
                }
            });
            console.log(`Table ${name} found! Count:`, resp.headers['content-range']);
        } catch (e) {
            console.log(`Table ${name} not found (Status ${e.response ? e.response.status : e.message})`);
        }
    }
}

test();
