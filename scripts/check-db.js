
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
    console.log('Checking database connection...');

    // 1. Check Auth User
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error('Error listing auth users:', authError.message);
    } else {
        console.log(`Found ${users.length} auth users.`);
        const admin = users.find(u => u.email === 'admin@sindplast.local');
        if (admin) {
            console.log('✅ Admin user found in auth.users');
        } else {
            console.log('❌ Admin user NOT found in auth.users. Creating...');
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: 'admin@sindplast.local',
                password: 'sindplast_admin', // Temporary password
                email_confirm: true
            });
            if (createError) console.error('Error creating admin:', createError.message);
            else console.log('✅ Admin user created (password: sindplast_admin)');
        }
    }

    // 2. Check Schemas (SINDPLAST vs Sindplast)
    // We can't easily list schemas via JS client without running SQL, but we can try to select from a table in each.

    // Try SINDPLAST
    const { data: dataUP, error: errorUP } = await supabase
        .from('Usuarios')
        .select('count', { count: 'exact', head: true })
        .schema('SINDPLAST');

    if (!errorUP) {
        console.log('✅ Schema "SINDPLAST" is accessible. Count Usuarios:', dataUP);
    } else {
        console.log('⚠️ Schema "SINDPLAST" access error (or empty):', errorUP.message);
    }

    // Try Sindplast
    const { data: dataCamel, error: errorCamel } = await supabase
        .from('Usuarios')
        .select('count', { count: 'exact', head: true })
        .schema('Sindplast');

    if (!errorCamel) {
        console.log('✅ Schema "Sindplast" is accessible. Count Usuarios:', dataCamel);
    } else {
        console.log('⚠️ Schema "Sindplast" access error (or empty):', errorCamel.message);
    }

    console.log('Check complete.');
}

checkDatabase();
