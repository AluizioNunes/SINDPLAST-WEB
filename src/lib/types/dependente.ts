export interface Dependente {
    id: number;
    codDependente: number;
    codSocio: number | string;
    socio: string;
    empresa?: string;
    dependente: string;
    nascimento: string;
    parentesco: string;
    carteira: boolean;
    dataCadastro: string;
    cadastrante: string;
    imagem?: string;
    status?: boolean;
    flagOrfao?: boolean;
}
