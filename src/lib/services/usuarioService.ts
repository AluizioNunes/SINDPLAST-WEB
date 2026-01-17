import { supabase } from '@/lib/supabase';
import { Usuario } from '@/lib/types/usuario';
import { uploadPublicFile } from '@/lib/upload/uploadPublicFile';

interface GetUsuariosParams {
  page?: number;
  limit?: number | 'all';
  search?: string;
  sortBy?: 'id' | 'nome' | 'usuario' | 'email' | 'cpf' | 'perfil' | 'funcao' | 'dataCadastro';
  sortDir?: 'asc' | 'desc';
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
  sortBy = 'id',
  sortDir = 'desc',
}: GetUsuariosParams = {}): Promise<GetUsuariosResponse> {
  const applySearch = (q: any): any => {
    if (!search) return q;
    return q.or(`Nome.ilike.%${search}%,Email.ilike.%${search}%,Usuario.ilike.%${search}%,CPF.ilike.%${search}%,Perfil.ilike.%${search}%,Funcao.ilike.%${search}%`);
  };

  const sortColumnByKey: Record<NonNullable<GetUsuariosParams['sortBy']>, string> = {
    id: 'IdUsuarios',
    nome: 'Nome',
    usuario: 'Usuario',
    email: 'Email',
    cpf: 'CPF',
    perfil: 'Perfil',
    funcao: 'Funcao',
    dataCadastro: 'DataCadastro',
  };

  const primarySortColumn = sortColumnByKey[sortBy] || 'IdUsuarios';
  const primaryAscending = sortDir === 'asc';

  if (limit === 'all') {
    const head = await applySearch(
      supabase.from('Usuarios').select('IdUsuarios', { count: 'exact', head: true })
    );
    if (head.error) {
      console.error('Error counting usuarios:', head.error);
      throw new Error('Erro ao buscar usuários');
    }

    const total = head.count || 0;
    const chunkSize = 1000;
    const chunks = Math.max(1, Math.ceil(total / chunkSize));
    const allRows: any[] = [];

    for (let i = 0; i < chunks; i++) {
      const from = i * chunkSize;
      const to = Math.min(total - 1, from + chunkSize - 1);
      const res = await applySearch(
        supabase.from('Usuarios').select('*')
      )
        .order(primarySortColumn, { ascending: primaryAscending })
        .order('IdUsuarios', { ascending: false })
        .range(from, to);

      if (res.error) {
        console.error('Error fetching usuarios chunk:', res.error);
        throw new Error('Erro ao buscar usuários');
      }
      allRows.push(...(res.data || []));
    }

    return { data: allRows as Usuario[], total, pages: total > 0 ? 1 : 0 };
  }

  const safeLimit = Math.max(1, limit);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const { data, count, error } = await applySearch(
    supabase.from('Usuarios').select('*', { count: 'exact' })
  )
    .order(primarySortColumn, { ascending: primaryAscending })
    .order('IdUsuarios', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching usuarios:', error);
    throw new Error('Erro ao buscar usuários');
  }

  return {
    data: data as Usuario[],
    total: count || 0,
    pages: Math.ceil((count || 0) / safeLimit),
  };
}

export type UsuariosChartsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'range';

export async function getUsuariosStats(): Promise<{
  total: number;
  perfis: number;
  comEmail: number;
  comCpf: number;
}> {
  const [totalRes, emailNullRes, emailEmptyRes, cpfNullRes, cpfEmptyRes] = await Promise.all([
    supabase.from('Usuarios').select('IdUsuarios', { count: 'exact', head: true }),
    supabase.from('Usuarios').select('IdUsuarios', { count: 'exact', head: true }).is('Email', null),
    supabase.from('Usuarios').select('IdUsuarios', { count: 'exact', head: true }).eq('Email', ''),
    supabase.from('Usuarios').select('IdUsuarios', { count: 'exact', head: true }).is('CPF', null),
    supabase.from('Usuarios').select('IdUsuarios', { count: 'exact', head: true }).eq('CPF', ''),
  ]);

  if (totalRes.error) throw new Error(totalRes.error.message || 'Erro ao buscar total de usuários');
  if (emailNullRes.error) throw new Error(emailNullRes.error.message || 'Erro ao buscar emails');
  if (emailEmptyRes.error) throw new Error(emailEmptyRes.error.message || 'Erro ao buscar emails');
  if (cpfNullRes.error) throw new Error(cpfNullRes.error.message || 'Erro ao buscar CPF');
  if (cpfEmptyRes.error) throw new Error(cpfEmptyRes.error.message || 'Erro ao buscar CPF');

  const total = totalRes.count || 0;
  const comEmail = total - ((emailNullRes.count || 0) + (emailEmptyRes.count || 0));
  const comCpf = total - ((cpfNullRes.count || 0) + (cpfEmptyRes.count || 0));

  const perfisRes = await supabase.from('Usuarios').select('Perfil');
  if (perfisRes.error) throw new Error(perfisRes.error.message || 'Erro ao buscar perfis');
  const perfisSet = new Set<string>();
  (perfisRes.data || []).forEach((r: any) => {
    const p = String(r?.Perfil || '').toUpperCase().trim();
    if (p) perfisSet.add(p);
  });

  return { total, perfis: perfisSet.size, comEmail, comCpf };
}

export async function getUsuariosChartsData(
  opts: { period?: UsuariosChartsPeriod; dateFrom?: string | null; dateTo?: string | null } = {}
): Promise<{
  evolution: { labels: string[]; cadastrados: number[] };
  byPerfil: Array<{ name: string; value: number }>;
  byFuncao: Array<{ name: string; value: number }>;
}> {
  const pick = 'IdUsuarios,DataCadastro,Perfil,Funcao';

  const head = await supabase.from('Usuarios').select('IdUsuarios', { count: 'exact', head: true });
  if (head.error) {
    console.error('Error counting usuarios charts data:', head.error);
    throw new Error('Erro ao buscar gráficos');
  }

  const total = head.count || 0;
  const chunkSize = 1000;
  const chunks = Math.max(1, Math.ceil(total / chunkSize));
  const allRows: any[] = [];

  for (let i = 0; i < chunks; i++) {
    const from = i * chunkSize;
    const to = Math.min(total - 1, from + chunkSize - 1);
    const res = await supabase
      .from('Usuarios')
      .select(pick)
      .order('IdUsuarios', { ascending: false })
      .range(from, to);

    if (res.error) {
      console.error('Error fetching usuarios charts chunk:', res.error);
      throw new Error('Erro ao buscar gráficos');
    }
    allRows.push(...(res.data || []));
  }

  const rows = (allRows || []) as Array<{
    IdUsuarios?: number | null;
    DataCadastro?: string | null;
    Perfil?: string | null;
    Funcao?: string | null;
  }>;

  const period: UsuariosChartsPeriod = opts.period || 'daily';
  const now = new Date();

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const dateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const monthKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
  const clampStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const clampEndOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  const startOfWeek = (d: Date) => {
    const day = d.getDay();
    const diff = (day + 6) % 7;
    const res = new Date(d);
    res.setDate(d.getDate() - diff);
    return clampStartOfDay(res);
  };

  const parseDbTimestamp = (value: string | null | undefined): Date | null => {
    if (!value) return null;
    const s = String(value).trim();
    if (!s) return null;
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (m) {
      const year = Number(m[1]);
      const month = Number(m[2]) - 1;
      const day = Number(m[3]);
      const hh = Number(m[4]);
      const mm = Number(m[5]);
      const ss = Number(m[6] || 0);
      const d2 = new Date(year, month, day, hh, mm, ss);
      return Number.isNaN(d2.getTime()) ? null : d2;
    }
    return null;
  };

  let windowStart: Date | null = null;
  let windowEnd: Date | null = null;
  let bucket: 'day' | 'week' | 'month' | 'year' = 'day';

  if (period === 'range') {
    windowStart = opts.dateFrom ? clampStartOfDay(new Date(opts.dateFrom)) : null;
    windowEnd = opts.dateTo ? clampEndOfDay(new Date(opts.dateTo)) : null;
    bucket = 'day';
  } else if (period === 'daily') {
    windowStart = clampStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13));
    windowEnd = clampEndOfDay(now);
    bucket = 'day';
  } else if (period === 'weekly') {
    windowStart = clampStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7 * 11));
    windowEnd = clampEndOfDay(now);
    bucket = 'week';
  } else if (period === 'monthly') {
    windowStart = clampStartOfDay(new Date(now.getFullYear(), now.getMonth() - 11, 1));
    windowEnd = clampEndOfDay(now);
    bucket = 'month';
  } else {
    windowStart = clampStartOfDay(new Date(now.getFullYear() - 7, 0, 1));
    windowEnd = clampEndOfDay(now);
    bucket = 'year';
  }

  const start = windowStart || clampStartOfDay(now);
  const end = windowEnd || clampEndOfDay(now);

  const slots: Array<{ key: string; label: string }> = [];
  if (bucket === 'year') {
    for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
      slots.push({ key: String(y), label: String(y) });
    }
  } else if (bucket === 'day') {
    for (let t = start.getTime(); t <= end.getTime(); t += 24 * 60 * 60 * 1000) {
      const d = new Date(t);
      slots.push({ key: dateKey(d), label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) });
    }
  } else if (bucket === 'week') {
    const startW = startOfWeek(start);
    for (let t = startW.getTime(); t <= end.getTime(); t += 7 * 24 * 60 * 60 * 1000) {
      const d = new Date(t);
      slots.push({ key: dateKey(d), label: `SEM ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` });
    }
  } else {
    const startM = new Date(start.getFullYear(), start.getMonth(), 1, 0, 0, 0, 0);
    const endM = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 0);
    for (let d = new Date(startM); d <= endM; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      slots.push({
        key: monthKey(d),
        label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      });
    }
  }

  const map = new Map<string, { cadastrados: number }>();
  slots.forEach((s) => map.set(s.key, { cadastrados: 0 }));
  const perfilMap = new Map<string, number>();
  const funcaoMap = new Map<string, number>();

  rows.forEach((r) => {
    const perfil = (r.Perfil || 'SEM PERFIL').toString().toUpperCase().trim();
    const funcao = (r.Funcao || 'SEM FUNÇÃO').toString().toUpperCase().trim();
    perfilMap.set(perfil, (perfilMap.get(perfil) || 0) + 1);
    funcaoMap.set(funcao, (funcaoMap.get(funcao) || 0) + 1);

    if (!r.DataCadastro) return;
    const d = parseDbTimestamp(r.DataCadastro);
    if (!d) return;
    if (windowStart && d < windowStart) return;
    if (windowEnd && d > windowEnd) return;

    let key = '';
    if (bucket === 'day') key = dateKey(d);
    else if (bucket === 'week') key = dateKey(startOfWeek(d));
    else if (bucket === 'month') key = monthKey(d);
    else key = String(d.getFullYear());

    const slot = map.get(key);
    if (!slot) return;
    slot.cadastrados += 1;
  });

  const toSorted = (m: Map<string, number>, top?: number) =>
    Array.from(m.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, top ?? undefined);

  return {
    evolution: {
      labels: slots.map((s) => s.label),
      cadastrados: slots.map((s) => map.get(s.key)?.cadastrados || 0),
    },
    byPerfil: toSorted(perfilMap, 10),
    byFuncao: toSorted(funcaoMap, 10),
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
    const usuarioSemSenha: any = { ...usuarioToSave };
    delete usuarioSemSenha.Senha;
    
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

export async function getUsuarioById(id: number): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from('Usuarios')
    .select('*')
    .eq('IdUsuarios', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as Usuario;
}

export async function uploadUsuarioImage(usuarioId: number, file: Blob): Promise<string> {
  const ext = (file as any).name?.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  const path = `usuarios/${usuarioId}/${Date.now()}.${safeExt}`;

  return uploadPublicFile({
    bucket: 'usuarios-images',
    path,
    file,
    contentType: (file as any).type || 'image/jpeg',
    upsert: true,
  });
}

export async function updateUsuarioImage(id: number, imagem: string | null): Promise<void> {
  const { error } = await supabase
    .from('Usuarios')
    .update({ Imagem: imagem })
    .eq('IdUsuarios', id);
  if (error) throw error;
}
