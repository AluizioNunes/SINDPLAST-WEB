
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        db: {
            schema: 'SINDPLAST'
        }
    }
);

async function check() {
    const { count, error } = await supabase
        .from('Socios')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.log('ERROR:', error.message);
    } else {
        console.log('SUPABASE_COUNT:', count);
    }
}

check();
