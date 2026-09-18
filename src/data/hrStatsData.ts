// Indicadores Oficiais de Gestão de Pessoas - 60 Anos da Unicamp

export interface AreaDistribution {
  tipoOrgao: string;
  docentes: number;
  pesquisadores: number;
  tecnicos: number;
  total: number;
  percentual: number;
}

export const SERVIDORES_POR_AREA: AreaDistribution[] = [
  { tipoOrgao: 'Faculdades e Institutos', docentes: 1792, pesquisadores: 4, tecnicos: 1829, total: 3625, percentual: 38.5 },
  { tipoOrgao: 'Área da Saúde', docentes: 0, pesquisadores: 1, tecnicos: 3022, total: 3023, percentual: 32.1 },
  { tipoOrgao: 'Administração Central', docentes: 19, pesquisadores: 0, tecnicos: 2069, total: 2088, percentual: 22.2 },
  { tipoOrgao: 'Centros e Núcleos', docentes: 0, pesquisadores: 87, tecnicos: 350, total: 437, percentual: 4.6 },
  { tipoOrgao: 'Colégios', docentes: 181, pesquisadores: 0, tecnicos: 62, total: 243, percentual: 2.6 },
];

export const TOTAL_SERVIDORES_ATIVOS = 9416;

export const GENERO_DATA = {
  total: {
    feminino: 5267,
    masculino: 4149,
    total: 9416,
    pctFeminino: 55.9,
    pctMasculino: 44.1,
  },
  porCarreira: [
    {
      carreira: 'Técnico-administrativos (PAEPE)',
      feminino: 4401,
      masculino: 2931,
      total: 7332,
      pctFeminino: 60.0,
      pctMasculino: 40.0,
    },
    {
      carreira: 'Docentes',
      feminino: 801,
      masculino: 1191,
      total: 1992,
      pctFeminino: 40.2,
      pctMasculino: 59.8,
    },
    {
      carreira: 'Pesquisadores (PQ)',
      feminino: 65,
      masculino: 27,
      total: 92,
      pctFeminino: 70.7,
      pctMasculino: 29.3,
    },
  ],
};

export const FAIXA_ETARIA_DATA = [
  { faixa: '18 a 29 anos', docentes: 6, pesquisadores: 0, tecnicos: 317, total: 323, pct: 3.4 },
  { faixa: '30 a 39 anos', docentes: 226, pesquisadores: 5, tecnicos: 1555, total: 1786, pct: 19.0 },
  { faixa: '40 a 49 anos', docentes: 651, pesquisadores: 25, tecnicos: 2380, total: 3056, pct: 32.5 },
  { faixa: '50 a 59 anos', docentes: 518, pesquisadores: 36, tecnicos: 1703, total: 2257, pct: 24.0 },
  { faixa: '60 a 69 anos', docentes: 469, pesquisadores: 17, tecnicos: 1118, total: 1604, pct: 17.0 },
  { faixa: '70 a 79 anos', docentes: 122, pesquisadores: 9, tecnicos: 246, total: 377, pct: 4.0 },
  { faixa: '80 a 89 anos', docentes: 0, pesquisadores: 0, tecnicos: 13, total: 13, pct: 0.1 },
];

export const DESTAQUE_FAIXA_ETARIA = {
  jovem: 'O servidor mais jovem é PAEPE e tem 18 anos',
  velho: 'O servidor mais experiente também é PAEPE e tem 89 anos',
};

export const RACA_COR_DATA = [
  { raca: 'Branca', total: 10302, pct: 76.0, docentes: 1750, extraQuadro: 3102, tecnicos: 5321, pesquisadores: 84 },
  { raca: 'Parda', total: 1870, pct: 13.8, docentes: 107, extraQuadro: 604, tecnicos: 1151, pesquisadores: 1 },
  { raca: 'Preta', total: 794, pct: 5.9, docentes: 39, extraQuadro: 167, tecnicos: 579, pesquisadores: 0 },
  { raca: 'Amarela', total: 332, pct: 2.5, docentes: 42, extraQuadro: 114, tecnicos: 172, pesquisadores: 3 },
  { raca: 'Não Informado', total: 229, pct: 1.7, docentes: 50, extraQuadro: 134, tecnicos: 41, pesquisadores: 4 },
  { raca: 'Indígena', total: 27, pct: 0.2, docentes: 4, extraQuadro: 16, tecnicos: 7, pesquisadores: 0 },
];

export const ESCOLARIDADE_EVOLUCAO = {
  anos: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
  series: [
    { nivel: 'Superior', valores: [2775, 2676, 2564, 2433, 2376, 2325, 2283, 2322, 2425, 2520, 2479], cor: '#105e7b' },
    { nivel: 'Médio', valores: [2807, 2624, 2443, 2290, 2226, 2129, 2065, 2059, 2176, 2269, 2179], cor: '#b8801d' },
    { nivel: 'Especialização', valores: [1139, 1105, 1120, 1119, 1107, 1120, 1263, 1330, 1441, 1599, 1697], cor: '#16a34a' },
    { nivel: 'Mestrado', valores: [396, 374, 382, 382, 388, 390, 407, 429, 430, 446, 463], cor: '#b43a2b' },
    { nivel: 'Doutorado', valores: [221, 219, 230, 225, 232, 242, 262, 263, 276, 302, 325], cor: '#7c3aed' },
    { nivel: 'Fundamental', valores: [312, 270, 246, 218, 195, 185, 164, 144, 122, 114, 110], cor: '#64748b' },
    { nivel: 'Fundamental Incompleto', valores: [152, 134, 125, 107, 96, 87, 77, 66, 60, 53, 52], cor: '#94a3b8' },
    { nivel: 'Pós-Doutorado (Maior que Doutorado)', valores: [9, 8, 9, 10, 10, 14, 20, 25, 23, 26, 28], cor: '#0ea5e9' },
  ],
};

export const GRANDES_AREAS_EVOLUCAO = {
  anos: ['2022', '2023', '2024', '2025', '2026'],
  areas: [
    { area: 'Saúde', valores: [2687, 2770, 2879, 3053, 3042], cor: '#b43a2b' },
    { area: 'Educação, Pesquisa e Ciência', valores: [2798, 2839, 2871, 2887, 2882], cor: '#105e7b' },
    { area: 'Administração e RH', valores: [1752, 1786, 1923, 2082, 2087], cor: '#e5a93a' },
    { area: 'Tecnologia da Informação (TI)', valores: [500, 504, 570, 583, 586], cor: '#0284c7' },
    { area: 'Manutenção e Serviços Operacionais', valores: [263, 249, 245, 252, 251], cor: '#d97706' },
    { area: 'Comunicação, Cultura e Arte', valores: [183, 184, 184, 200, 204], cor: '#9333ea' },
    { area: 'Engenharia e Arquitetura', valores: [164, 163, 176, 190, 196], cor: '#059669' },
    { area: 'Serviços Gerais e Segurança', valores: [169, 160, 152, 145, 143], cor: '#475569' },
  ],
};

export const TOP_CARGOS_2026 = [
  { cargo: 'Técnico em Administração (PAEPE)', quantidade: 1430, categoria: 'Técnico-Administrativo' },
  { cargo: 'Técnico de Enfermagem (PAEPE)', quantidade: 1322, categoria: 'Saúde' },
  { cargo: 'Professor Associado', quantidade: 818, categoria: 'Docente' },
  { cargo: 'Professor Doutor', quantidade: 563, categoria: 'Docente' },
  { cargo: 'Enfermeiro (PAEPE)', quantidade: 554, categoria: 'Saúde' },
  { cargo: 'Médico (PAEPE)', quantidade: 432, categoria: 'Saúde' },
  { cargo: 'Professor Titular', quantidade: 394, categoria: 'Docente' },
  { cargo: 'Profissional de Administração (PAEPE)', quantidade: 330, categoria: 'Técnico-Administrativo' },
  { cargo: 'Analista de Desenv. de Sistemas (PAEPE)', quantidade: 228, categoria: 'Tecnologia' },
  { cargo: 'Prof. Magistério Secundário Técnico', quantidade: 181, categoria: 'Docente' },
  { cargo: 'Técnico de Laboratório (PAEPE)', quantidade: 162, categoria: 'Técnico-Administrativo' },
  { cargo: 'Biologista (PAEPE)', quantidade: 132, categoria: 'Saúde' },
  { cargo: 'Prof. Educação Infantil e Fundamental', quantidade: 129, categoria: 'Educação' },
  { cargo: 'Analista de Suporte Computacional', quantidade: 103, categoria: 'Tecnologia' },
  { cargo: 'Bibliotecário (PAEPE)', quantidade: 97, categoria: 'Educação' },
  { cargo: 'Pesquisador (PQ)', quantidade: 92, categoria: 'Pesquisa' },
  { cargo: 'Profissional de Pesquisa', quantidade: 79, categoria: 'Pesquisa' },
  { cargo: 'Técnico em Biblioteconomia', quantidade: 72, categoria: 'Educação' },
  { cargo: 'Biólogo (PAEPE)', quantidade: 65, categoria: 'Saúde' },
  { cargo: 'Assistente Social (PAEPE)', quantidade: 63, categoria: 'Saúde' },
];

export const NACIONALIDADES_DATA = {
  totalNatoOuNaturalizado: 1978,
  totalEstrangeiro: 106,
  pctEstrangeiros: 5.1,
  regioesEstrangeiros: [
    { regiao: 'América Latina', docentes: 45, pesquisadores: 3, total: 48, pct: 45.3 },
    { regiao: 'Europa', docentes: 40, pesquisadores: 5, total: 45, pct: 42.5 },
    { regiao: 'América do Norte', docentes: 5, pesquisadores: 0, total: 5, pct: 4.7 },
    { regiao: 'Ásia', docentes: 5, pesquisadores: 0, total: 5, pct: 4.7 },
    { regiao: 'Outros', docentes: 3, pesquisadores: 0, total: 3, pct: 2.8 },
  ],
};
