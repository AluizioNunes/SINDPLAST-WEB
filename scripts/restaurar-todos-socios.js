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

async function restoreAllSocios() {
  try {
    console.log('📁 Lendo arquivo DataSource/Socios.json...');
    const sociosData = JSON.parse(fs.readFileSync('DataSource/Socios.json', 'utf8'));
    
    console.log(`📊 Encontrados ${sociosData.Socio.length} sócios para restaurar`);
    
    // Preparar todos os registros para inserção
    console.log('🔄 Preparando dados para inserção...');
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
    
    console.log('💾 Inserindo todos os registros de uma vez...');
    
    // Tentar inserção direta
    try {
      const { data, error } = await supabase
        .from('Socios')
        .insert(sociosToInsert)
        .select();
      
      if (error) throw error;
      
      console.log(`✅ Restauração concluída! ${data?.length || 0} sócios inseridos`);
      
    } catch (insertError) {
      console.error('❌ Erro na inserção direta:', insertError.message);
      
      // Fallback: inserir em lotes menores
      console.log('🔄 Tentando inserção em lotes de 50...');
      const batchSize = 50;
      let totalInserted = 0;
      
      for (let i = 0; i < sociosToInsert.length; i += batchSize) {
        const batch = sociosToInsert.slice(i, i + batchSize);
        
        try {
          const { data: batchData, error: batchError } = await supabase
            .from('Socios')
            .insert(batch)
            .select();
          
          if (batchError) throw batchError;
          
          totalInserted += batchData?.length || 0;
          console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(sociosToInsert.length/batchSize)} - ${batchData?.length || 0} registros`);
          
        } catch (batchError) {
          console.error(`❌ Erro no lote ${Math.floor(i/batchSize) + 1}:`, batchError.message);
          
          // Fallback final: inserir um por um
          console.log('🔄 Tentando inserção individual...');
          for (const socio of batch) {
            try {
              await supabase.from('Socios').insert(socio);
              totalInserted++;
            } catch (individualError) {
              console.error(`❌ Erro individual sócio ${socio.Matricula}:`, individualError.message);
            }
          }
        }
      }
      
      console.log(`✅ Restauração concluída! ${totalInserted} sócios inseridos`);
    }
    
    // Verificar resultado final
    console.log('🔍 Verificando resultado...');
    const { count } = await supabase.from('Socios').select('*', { count: 'exact', head: true });
    console.log(`📊 Total na tabela: ${count}`);
    
    if (count === sociosData.Socio.length) {
      console.log('🎉 SUCESSO! Todos os sócios foram restaurados!');
    } else {
      console.log(`⚠️ ATENÇÃO: Esperado ${sociosData.Socio.length}, encontrado ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral na restauração:', error);
  }
}

restoreAllSocios();
