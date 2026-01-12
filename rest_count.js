
const axios = require('axios');
const url = 'https://szthwxacgpyqdeeawgqx.supabase.co/rest/v1/Socios?select=IdSocio';
const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6dGh3eGFjZ3B5cWRlZWF3Z3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMDc0NTYsImV4cCI6MjA4MzU4MzQ1Nn0.SrD6fGfXHBsy96pef5ZcD0pgK2UjqjX3PMN2Hui6vt8',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6dGh3eGFjZ3B5cWRlZWF3Z3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMDc0NTYsImV4cCI6MjA4MzU4MzQ1Nn0.SrD6fGfXHBsy96pef5ZcD0pgK2UjqjX3PMN2Hui6vt8',
    'Range': '0-0', // Just to check the count header if possible
    'Prefer': 'count=exact'
};

axios.get(url, { headers })
    .then(response => {
        console.log('COUNT:', response.headers['content-range']);
    })
    .catch(err => {
        console.error('Error:', err.response ? err.response.data : err.message);
    });
