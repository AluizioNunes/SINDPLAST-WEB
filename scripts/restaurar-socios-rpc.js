require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreSocios() {
  try {
    console.log('Lendo arquivo DataSource/Socios.json...');
    const sociosData = JSON.parse(fs.readFileSync('DataSource/Socios.json', 'utf8'));
    
    console.log(`Encontrados ${sociosData.Socio.length} sócios para restaurar`);
    
    // Preparar todos os registros para inserção
    const sociosToInsert = sociosData.Socio.map(socio => ({
      Matricula: String(socio.SMAT),
      Nome: socio.SNOME,
      RG: socio.SRG || null,
      Emissor: socio.SEMISSOR || null,
      CPF: socio.SCPF || null,
      Nascimento: socio.SDTNASC || null,
      Sexo: socio.SSEXO || null,
      CodEmpresa: socio.ECODIG ? String(socio.ECODIG) : null,
      RazaoSocial: socio.ENOME || null,
      DataCadastro: new Date().toISOString(),
      Cadastrante: 'Sincronização Automática'
    }));
    
    console.log('Inserindo todos os registros de uma vez...');
    
    // Usar RPC para inserir diretamente na tabela SINDPLAST
    const { data, error } = await supabase.rpc('insert_socios_sindplast', { 
      socios_data: sociosToInsert 
    });
    
    if (error) {
      console.error('❌ Erro na inserção via RPC:', error);
      
      // Fallback: tentar inserção normal
      console.log('Tentando inserção normal...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('Socios')
        .insert(sociosToInsert)
        .select();
      
      if (fallbackError) {
        console.error('❌ Erro no fallback:', fallbackError);
        throw fallbackError;
      }
      
      console.log(`✅ Restauração concluída via fallback! ${fallbackData?.length || 0} sócios inseridos`);
    } else {
      console.log(`✅ Restauração concluída via RPC! ${data?.length || 0} sócios inseridos`);
    }
    
    // Verificar resultado
    const { count } = await supabase.from('Socios').select('*', { count: 'exact', head: true });
    console.log(`📊 Total na tabela: ${count}`);
    
  } catch (error) {
    console.error('❌ Erro na restauração:', error);
  }
}

restoreSocios();
