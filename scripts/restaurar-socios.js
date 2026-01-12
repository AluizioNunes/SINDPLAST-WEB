require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl ? 'OK' : 'MISSING');
console.log('KEY:', supabaseKey ? 'OK' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Verifique o arquivo .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreSocios() {
  try {
    console.log('Lendo arquivo DataSource/Socios.json...');
    const sociosData = JSON.parse(fs.readFileSync('DataSource/Socios.json', 'utf8'));
    
    console.log(`Encontrados ${sociosData.Socio.length} sócios para restaurar`);
    
    // Limpar tabela atual - REMOVIDO para não apagar tudo
    // console.log('Limpando tabela Socios...');
    // await supabase.from('Socios').delete().neq('IdSocio', -1);
    
    // Inserir dados em lotes de 100 para evitar timeout
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < sociosData.Socio.length; i += batchSize) {
      const batch = sociosData.Socio.slice(i, i + batchSize);
      
      console.log(`Inserindo lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(sociosData.Socio.length/batchSize)} (${batch.length} registros)`);
      
      for (const socio of batch) {
        await supabase.from('Socios').insert({
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
        });
        inserted++;
      }
      
      // Pequena pausa entre lotes
      if (i + batchSize < sociosData.Socio.length) {
        console.log('Pausa de 1 segundo entre lotes...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`✅ Restauração concluída! ${inserted} sócios inseridos`);
    
    // Verificar resultado
    const { count } = await supabase.from('Socios').select('*', { count: 'exact', head: true });
    console.log(`📊 Total na tabela: ${count}`);
    
  } catch (error) {
    console.error('❌ Erro na restauração:', error);
  }
}

restoreSocios();
