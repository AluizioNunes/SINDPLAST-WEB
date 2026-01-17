import type { Empresa } from '@/lib/types/empresa'

function normalizePublicImageUrl(value: unknown): string | null {
    const s = value == null ? '' : String(value).trim();
    if (!s) return null;
    if (s.includes('/storage/v1/object/public/')) return s;
    if (s.includes('/storage/v1/object/') && !s.includes('/storage/v1/object/public/')) {
        return s.replace('/storage/v1/object/', '/storage/v1/object/public/');
    }
    return s;
}

export function mapEmpresaRow(row: Record<string, unknown>): Empresa {
    return {
        id: row.IdEmpresa as number,
        codEmpresa: (row.CodEmpresa as string) ?? '',
        cnpj: (row.CNPJ as string) ?? '',
        razaoSocial: (row.RazaoSocial as string) ?? '',
        nomeFantasia: (row.NomeFantasia as string) ?? '',
        endereco: (row.Endereco as string) ?? '',
        numero: (row.Numero as string) ?? '',
        complemento: (row.Complemento as string) ?? '',
        bairro: (row.Bairro as string) ?? '',
        cep: (row.CEP as string) ?? '',
        cidade: (row.Cidade as string) ?? '',
        uf: (row.UF as string) ?? '',
        telefone01: (row.Telefone01 as string) ?? '',
        telefone02: (row.Telefone02 as string) ?? '',
        fax: (row.Fax as string) ?? '',
        celular: (row.Celular as string) ?? '',
        whatsapp: (row.WhatsApp as string) ?? '',
        instagram: (row.Instagram as string) ?? '',
        linkedin: (row.Linkedin as string) ?? '',
        nFuncionarios: (row.NFuncionarios as number) ?? 0,
        dataContribuicao: (row.DataContribuicao as string) ?? '',
        valorContribuicao: (row.ValorContribuicao as number) ?? 0,
        dataCadastro: (row.DataCadastro as string) ?? '',
        cadastrante: (row.Cadastrante as string) ?? '',
        observacao: (row.Observacao as string) ?? '',
        nSocios: 0, // Will be calculated separately if needed
        imagem: normalizePublicImageUrl(row.Imagem),
    }
}
