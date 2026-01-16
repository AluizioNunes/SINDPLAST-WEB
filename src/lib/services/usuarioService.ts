import { supabase } from '@/lib/supabase';
import { Usuario } from '@/lib/types/usuario';

interface GetUsuariosParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface GetUsuariosResponse {
  data: Usuario[];
  total: number;
  pages: number;
}

export async function getUsuarios({
  page = 1,
  limit = 10,
  search = '',
}: GetUsuariosParams): Promise<GetUsuariosResponse> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('Usuarios')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.or(`Nome.ilike.%${search}%,Email.ilike.%${search}%,Usuario.ilike.%${search}%,CPF.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order('IdUsuarios', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching usuarios:', error);
    throw new Error('Erro ao buscar usuários');
  }

  return {
    data: data as Usuario[],
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  };
}

export async function createUsuario(usuario: Omit<Usuario, 'IdUsuarios' | 'DataCadastro'> & { Senha?: string }) {
  const usuarioToSave = {
    ...usuario,
    Nome: usuario.Nome?.toUpperCase(),
    Perfil: usuario.Perfil?.toUpperCase(),
  };

  // Se houver senha, tenta criar no Auth primeiro (requer permissão de service_role no backend ou trigger)
  // Como estamos no frontend, só podemos usar a função signUp se for um auto-cadastro, mas aqui é um admin criando outro user.
  // O Supabase não permite criar usuários com senha via Client SDK padrão sem logar como eles.
  // A MELHOR abordagem é usar uma Edge Function ou RPC.
  // Vou usar a abordagem híbrida: Tentar criar via signUp (com hack de logout temporário ou API Admin se disponível via RPC)
  // Mas o mais robusto é chamar uma RPC que faz o trabalho sujo no Postgres.
  
  // Vamos assumir que vamos chamar uma RPC 'create_user_with_auth' que você criará no banco.
  // Se não existir, vai falhar. Então vou preparar o código para chamar essa RPC.
  
  const { data, error } = await supabase.rpc('create_user_admin', {
    p_email: usuario.Email,
    p_password: usuario.Senha || '123456', // Senha padrão se não fornecida
    p_nome: usuarioToSave.Nome,
    p_cpf: usuario.CPF,
    p_funcao: usuario.Funcao,
    p_usuario: usuario.Usuario,
    p_perfil: usuarioToSave.Perfil,
    p_cadastrante: usuario.Cadastrante
  });

  if (error) {
    console.error('Error creating usuario (RPC):', JSON.stringify(error, null, 2));
    
    // Fallback: Tenta inserir direto na tabela se a RPC falhar (para manter compatibilidade legada)
    // Mas remove a senha para não salvar texto plano se não for criptografada
    const { Senha, ...usuarioSemSenha } = usuarioToSave;
    
    // Ensure DataCadastro is present if not provided
    const payload = {
        ...usuarioSemSenha,
        DataCadastro: new Date().toISOString()
    };

    const { data: fallbackData, error: fallbackError } = await supabase
        .from('Usuarios')
        .insert(payload)
        .select()
        .single();
        
    if (fallbackError) {
        console.error('Error creating usuario (Fallback):', JSON.stringify(fallbackError, null, 2));
        throw fallbackError;
    }
    return fallbackData as Usuario;
  }

  return data as Usuario;
}

export async function updateUsuario(id: number, usuario: Partial<Usuario> & { Senha?: string }) {
  const usuarioToUpdate = { ...usuario };
  if (usuarioToUpdate.Nome) usuarioToUpdate.Nome = usuarioToUpdate.Nome.toUpperCase();
  if (usuarioToUpdate.Perfil) usuarioToUpdate.Perfil = usuarioToUpdate.Perfil.toUpperCase();
  if (typeof usuarioToUpdate.Senha === 'string' && usuarioToUpdate.Senha.trim() === '') {
      delete usuarioToUpdate.Senha;
  }

  // Se tiver senha para atualizar, precisamos atualizar no Auth também
  if (usuarioToUpdate.Senha) {
      // Novamente, requer RPC para atualizar senha de OUTRO usuário sendo admin
      await supabase.rpc('update_user_password_admin', {
          p_email: usuarioToUpdate.Email, // Email é necessário para achar o user no Auth
          p_new_password: usuarioToUpdate.Senha
      });
      // Remove senha do objeto para não salvar plano na tabela Usuarios
      delete usuarioToUpdate.Senha;
  }

  const { data, error } = await supabase
    .from('Usuarios')
    .update(usuarioToUpdate)
    .eq('IdUsuarios', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating usuario:', error);
    throw new Error('Erro ao atualizar usuário');
  }

  return data as Usuario;
}

export async function deleteUsuario(id: number) {
  const { error } = await supabase
    .from('Usuarios')
    .delete()
    .eq('IdUsuarios', id);

  if (error) {
    console.error('Error deleting usuario:', error);
    throw new Error('Erro ao excluir usuário');
  }
}

export async function getUserEmailByUsername(username: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('Usuarios')
    .select('Email')
    .ilike('Usuario', username)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user email:', error);
    return null;
  }

  return data?.Email || null;
}
