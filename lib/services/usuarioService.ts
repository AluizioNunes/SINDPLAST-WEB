import { createClient } from '@/lib/supabase/server';
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
  const supabase = await createClient();
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

export async function createUsuario(usuario: Omit<Usuario, 'IdUsuarios' | 'DataCadastro'>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Usuarios')
    .insert(usuario)
    .select()
    .single();

  if (error) {
    console.error('Error creating usuario:', error);
    throw new Error('Erro ao criar usuário');
  }

  return data as Usuario;
}

export async function updateUsuario(id: number, usuario: Partial<Usuario>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Usuarios')
    .update(usuario)
    .eq('IdUsuarios', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating usuario:', error);
    throw new Error('Erro ao atualizar usuário');
  }

  return data as Usuario;
}
