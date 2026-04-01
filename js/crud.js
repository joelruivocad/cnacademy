import { db } from './firebase.js';
import {
  collection, doc, getDocs,
  addDoc, setDoc, updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ── USUARIOS ──────────────────────────────
export async function getUsuarios() {
  const snap = await getDocs(collection(db, 'usuarios'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createUsuario(data) {
  const ref = await addDoc(collection(db, 'usuarios'), {
    ...data, tipo: 'analista', ativo: true,
    criadoEm: serverTimestamp()
  });
  return ref.id;
}

export async function updateUsuario(id, data) {
  await updateDoc(doc(db, 'usuarios', id), data);
}

export async function deleteUsuario(id) {
  await updateDoc(doc(db, 'usuarios', id), { ativo: false });
}

// ── PDI ───────────────────────────────────
export async function getPDI(analistaId) {
  const snap = await getDocs(
    collection(db, 'usuarios', analistaId, 'pdi')
  );
  return snap.docs.map(d => ({ semana: d.id, ...d.data() }));
}

export async function updatePDI(analistaId, semana, data) {
  const ref = doc(db, 'usuarios', analistaId, 'pdi', semana);
  await setDoc(ref, {
    ...data, atualizadoEm: serverTimestamp()
  }, { merge: true });
}

// ── DESAFIOS COMPLETOS ────────────────────
export const DESAFIOS = {

  'Semana 1': {
    modulo: 'M1',
    tema: 'O Funil e os KPIs que Importam',
    sheets: 'SOMASES',
    contexto: 'Em midias pagas, toda campanha existe por um motivo especifico dentro de uma jornada. Entender em qual etapa do funil cada campanha atua e a base de qualquer analise inteligente.',
    objetivo: 'Mapear suas campanhas ativas por etapa do funil e justificar cada classificacao com base nos objetivos configurados e nas metricas acompanhadas.',
    entregas: [
      'PARTE 1 — Tabela com 3 a 5 campanhas que voce opera, contendo: nome da campanha, plataforma, etapa do funil (topo / meio / fundo), objetivo configurado, KPI principal e KPI secundario.',
      'PARTE 2 — Para cada campanha, escreva de 3 a 5 linhas justificando a classificacao no funil. Inclua: por que classificou assim, o que essa campanha faz na jornada do aluno CNA, e se ha alguma metrica que voce acompanha sem saber o motivo.',
      'PARTE 3 — Reflexao pessoal (sem pesquisar): o que e um lead para o CNA? Qual a diferenca entre lead e matricula? Qual etapa do funil e mais critica para o resultado do CNA?'
    ],
    formato: 'Google Docs — 1 documento com as 3 partes bem estruturadas e tituladas.',
    dica: 'Nao existe classificacao 100% errada. O que avaliamos e o raciocinio por tras da sua resposta.'
  },

  'Semana 2': {
    modulo: 'M1',
    tema: 'CPL, CPA e o que os Numeros Dizem',
    sheets: 'Variacao % + Formatacao Condicional',
    contexto: 'CPL e CPA nao sao so numeros — sao sinais. Um CPL alto pode significar muitas coisas: publico errado, criativo fraco, pagina de destino ruim, sazonalidade ou concorrencia. Saber ler esses sinais e o que diferencia uma analista que executa de uma que pensa.',
    objetivo: 'Analisar a variacao de CPL de uma campanha ao longo de 2 semanas, formular hipoteses para a variacao e propor acoes.',
    entregas: [
      'PARTE 1 — Tabela no Google Sheets com: data ou semana, investimento, leads gerados e CPL calculado para as ultimas 2 semanas de uma campanha que voce opera.',
      'PARTE 2 — Calcule a variacao percentual do CPL entre as duas semanas. Escreva sua hipotese para explicar a variacao (minimo 3 linhas) e proponha uma acao com justificativa.',
      'PARTE 3 — Reflexao: existe um CPL ideal para o CNA? Como voce saberia se o CPL esta bom ou ruim? O que e mais preocupante: CPL alto com muitos leads ou CPL baixo com poucos leads?',
      'SHEETS — Use a formula de variacao percentual =(B2-A2)/A2 e configure formatacao condicional para destacar variacoes acima de 20% em vermelho automaticamente.'
    ],
    formato: 'Google Docs com a analise + Google Sheets com a tabela e formatacao condicional.',
    dica: 'O CPL sozinho nao diz nada — sempre contextualize com o volume de leads e o momento do mes.'
  },

  'Semana 3': {
    modulo: 'M1',
    tema: 'Entendendo o Budget e o Pacing',
    sheets: 'CONT.SES',
    contexto: 'Pacing e o ritmo de entrega do investimento ao longo do mes. Se voce tem R$10.000 de budget para abril e estamos no dia 20, o esperado e que ~65% ja tenha sido entregue. Desvios grandes indicam problemas.',
    objetivo: 'Calcular o pacing atual da sua principal campanha, avaliar se esta saudavel e propor correcoes se necessario.',
    entregas: [
      'PARTE 1 — Calcule no Sheets: budget total do mes, dia atual do mes, percentual do mes transcorrido, investimento realizado ate hoje, percentual do budget entregue e comparativo esperado vs entregue.',
      'PARTE 2 — Analise em 4 a 6 linhas: o pacing esta saudavel? Por que? O que pode estar causando o desvio (se houver)? O que voce faria para corrigir?',
      'PARTE 3 — Reflexao: o que acontece com uma campanha que entrega todo o budget nos primeiros 10 dias? E com uma que entrega so 40% ate o dia 25?',
      'SHEETS — Use CONT.SES para contar quantas campanhas estao com pacing abaixo de 50% no meio do mes.'
    ],
    formato: 'Google Docs com a analise + Google Sheets com os calculos de pacing.',
    dica: 'O pacing ideal nao e exatamente linear — considere fins de semana, feriados e sazonalidade.'
  },

  'Semana 4': {
    modulo: 'M1',
    tema: 'Leitura de Resultado e Narrativa',
    sheets: 'SE + E + OU',
    contexto: 'Saber ler um resultado nao e so olhar os numeros — e construir uma narrativa que conecta o que aconteceu com o porque e o que fazer a seguir. Quem apenas reporta numeros executa. Quem constroi narrativas analisa.',
    objetivo: 'Escrever um mini-relatorio de performance de 1 pagina de uma campanha da ultima semana, com estrutura clara de narrativa.',
    entregas: [
      'Slide 1 — O QUE FOI: descreva brevemente a campanha (objetivo, plataforma, periodo).',
      'Slide 2 — O QUE ACONTECEU: os principais numeros — investimento, leads, CPL, variacao em relacao a semana anterior.',
      'Slide 3 — POR QUE: sua hipotese para explicar o resultado — positivo ou negativo.',
      'Slide 4 — PROXIMOS PASSOS: o que voce faria na proxima semana com base nessa analise.',
      'SHEETS — Crie uma coluna de classificacao automatica: CPL menor que R$30 = "Eficiente", entre R$30 e R$50 = "Atencao", acima de R$50 = "Critico". Use SE + E + OU.'
    ],
    formato: 'Google Docs com o mini-relatorio (1 pagina) + Google Sheets com a classificacao automatica.',
    dica: 'Escreva como se fosse apresentar para o cliente. Clareza e objetividade valem mais do que quantidade de texto.'
  },

  'Semana 5': {
    modulo: 'M2',
    tema: 'Comparacao de Periodos',
    sheets: 'PROCV / PROCX',
    contexto: 'Comparar periodos e uma das analises mais comuns e importantes em midias pagas. Mas a comparacao so tem valor quando voce consegue explicar o que mudou e por que.',
    objetivo: 'Comparar a performance de uma campanha em duas semanas diferentes, identificar variacoes significativas e construir uma narrativa explicativa.',
    entregas: [
      'PARTE 1 — Tabela no Sheets com as metricas das duas semanas lado a lado: investimento, leads, CPL, taxa de conversao, e variacao percentual calculada para cada metrica.',
      'PARTE 2 — Para cada metrica que variou mais de 15%, escreva 1 paragrafo explicando o que o numero esta dizendo.',
      'PARTE 3 — Conclusao geral: a campanha esta evoluindo ou regredindo? O que isso significa para a proxima semana?',
      'SHEETS — Use PROCV ou PROCX para cruzar dados de duas abas diferentes — por exemplo, trazer o CPL de referencia de uma aba de metas para comparar com o CPL real.'
    ],
    formato: 'Google Docs com a analise + Google Sheets com a tabela comparativa e PROCV.',
    dica: 'Atencao ao contexto: uma variacao negativa pode ser normal em determinados periodos. Contextualize sempre.'
  },

  'Semana 6': {
    modulo: 'M2',
    tema: 'Analise por Segmento',
    sheets: 'QUERY basico',
    contexto: 'Olhar para os dados agregados esconde informacoes importantes. Segmentar por dispositivo, horario, idade ou audiencia revela padroes de comportamento que guiam otimizacoes precisas.',
    objetivo: 'Analisar a performance de uma campanha segmentada e identificar padroes de comportamento do publico do CNA.',
    entregas: [
      'PARTE 1 — Tabela no Sheets com dados segmentados da sua campanha (por dispositivo, horario ou audiencia): investimento, leads, CPL e participacao percentual de cada segmento.',
      'PARTE 2 — Hipotese sobre o comportamento do usuario baseada nos dados: por que o segmento X performa melhor que o Y? O que isso diz sobre o publico do CNA?',
      'PARTE 3 — Recomendacao de otimizacao com justificativa: o que voce mudaria nas campanhas com base nessa analise?',
      'SHEETS — Use QUERY basico para filtrar apenas as campanhas de uma plataforma e ordenar por CPL do menor para o maior.'
    ],
    formato: 'Google Docs com a analise + Google Sheets com a tabela segmentada e QUERY.',
    dica: 'Nao tire conclusoes com amostras pequenas. Garanta que os dados tenham volume suficiente para serem significativos.'
  },

  'Semana 7': {
    modulo: 'M2',
    tema: 'Identificando Anomalias',
    sheets: 'QUERY intermediario',
    contexto: 'Em qualquer serie historica de dados existem pontos fora da curva — dias ou semanas onde os resultados fugiram do padrao. Identificar e entender essas anomalias e essencial para evitar decisoes erradas.',
    objetivo: 'Analisar os dados dos ultimos 30 dias, identificar anomalias e formular hipoteses para cada uma.',
    entregas: [
      'PARTE 1 — Grafico de linha no Sheets mostrando a serie historica de CPL ou leads dos ultimos 30 dias da sua campanha.',
      'PARTE 2 — Identificacao dos pontos fora da curva: circule ou destaque os dias/semanas anomalos no grafico.',
      'PARTE 3 — Para cada anomalia identificada, escreva uma hipotese: o que pode ter causado esse desvio? (ex: criativo novo, feriado, mudanca de orcamento, concorrencia, sazonalidade)',
      'SHEETS — Use QUERY intermediario para agrupar dados por semana, calcular soma de investimento e media de CPL.'
    ],
    formato: 'Google Docs com a analise + Google Sheets com o grafico e a QUERY de agrupamento.',
    dica: 'Uma anomalia pode ser positiva ou negativa. Entender as duas e igualmente importante.'
  },

  'Semana 8': {
    modulo: 'M2',
    tema: 'Dashboard Pessoal de Acompanhamento',
    sheets: 'QUERY avancado + IMPORTRANGE',
    contexto: 'Um bom dashboard e aquele que voce abre todo dia de manha e em 2 minutos sabe se tudo esta bem. Deve ser simples, visual e automatizado — sem precisar recalcular nada manualmente.',
    objetivo: 'Criar um dashboard funcional no Sheets para acompanhamento diario das campanhas que voce opera.',
    entregas: [
      'Dashboard com visao de pacing: budget mensal, gasto ate hoje, percentual entregue vs esperado.',
      'Dashboard com CPL atual vs CPL de referencia (meta) — com indicador visual de status.',
      'Dashboard com total de leads no mes vs meta mensal — com percentual de atingimento.',
      'Pelo menos 1 QUERY consolidando dados de multiplas campanhas ou plataformas.',
      'Formatacao condicional que destaque automaticamente o que esta fora do esperado (vermelho/amarelo/verde).',
      'SHEETS — Use IMPORTRANGE para trazer dados de outra planilha e QUERY avancado para filtrar, agrupar e calcular automaticamente.'
    ],
    formato: 'Google Sheets — o proprio dashboard e a entrega. Compartilhe o link com permissao de comentario.',
    dica: 'Menos e mais. Um dashboard com 5 metricas claras vale mais do que um com 30 metricas confusas.'
  },

  'Semana 9': {
    modulo: 'M3',
    tema: 'Leitura de Brief e Traducao para Midia',
    sheets: 'IFERROR + SEERRO',
    contexto: 'Um profissional de midia nao espera receber um plano pronto. Ele le um objetivo de negocio e ja sabe que canais ativar, que publico priorizar e qual etapa do funil merece mais atencao. Essa e a habilidade que este desafio desenvolve.',
    objetivo: 'A partir do planejamento P2/26 do CNA, escolher um mes e escrever o racional estrategico de midia — sem usar numeros, so raciocinio.',
    entregas: [
      'Escolha um mes do P2/26 (abril, maio, junho, julho, agosto ou setembro).',
      'Escreva o racional estrategico em 1 pagina respondendo: qual e o contexto do mes escolhido? Quais plataformas priorizar e por que? Qual etapa do funil merece mais investimento? Existe alguma sazonalidade relevante?',
      'Escreva como se estivesse explicando a estrategia para alguem que nao conhece o projeto — sem jargoes e sem numeros.',
      'SHEETS — Adicione IFERROR ou SEERRO nas suas formulas existentes para tratar erros — as celulas devem mostrar "Sem dado" ao inves de #N/A ou #REF!.'
    ],
    formato: 'Google Docs — 1 pagina de racional estrategico.',
    dica: 'Nao use numeros nesse desafio. O objetivo e desenvolver o raciocinio, nao o calculo.'
  },

  'Semana 10': {
    modulo: 'M3',
    tema: 'Distribuicao de Budget',
    sheets: 'Graficos Dinamicos',
    contexto: 'Distribuir budget entre plataformas e uma das decisoes mais importantes de um planejamento de midia. Essa decisao nao pode ser aleatoria — precisa ser baseada em performance historica, objetivos do periodo e comportamento do publico.',
    objetivo: 'Dado um budget hipotetico de R$50.000 para um mes no CNA, montar uma proposta de distribuicao entre plataformas com justificativa para cada decisao.',
    entregas: [
      'PARTE 1 — Planilha no Sheets com: plataforma, campanha/frente, valor proposto, percentual do budget total e justificativa para cada linha.',
      'PARTE 2 — Grafico de pizza mostrando a distribuicao proposta por plataforma.',
      'PARTE 3 — Paragrafo explicando a logica geral da sua distribuicao: por que priorizou essas plataformas? Como a performance historica embasou sua decisao?',
      'SHEETS — Crie um grafico de pizza da distribuicao e um grafico de linha mostrando a evolucao de CPL das ultimas semanas.'
    ],
    formato: 'Google Sheets com a tabela e os graficos + Google Docs com o paragrafo explicativo.',
    dica: 'Justifique cada decisao com base em algo real — CPL historico, volume de leads, sazonalidade do mes escolhido.'
  },

  'Semana 11': {
    modulo: 'M3',
    tema: 'Cenarios de Performance',
    sheets: 'Dashboard Completo',
    contexto: 'Construir cenarios e uma pratica essencial no planejamento de midia. Ter um cenario conservador, base e otimista permite tomar decisoes mais rapidas quando a realidade se afasta da projecao.',
    objetivo: 'Montar 3 cenarios de performance para julho (mes de maior investimento do P2/26) com base nas metas reais do CNA.',
    entregas: [
      'CENARIO CONSERVADOR — Performance abaixo do esperado: investimento, CPL estimado, leads projetados, matriculas projetadas e principal alavanca negativa.',
      'CENARIO BASE — Performance dentro da meta: mesmos campos do conservador, mas alinhados com a meta oficial.',
      'CENARIO OTIMISTA — Performance acima da meta: mesmos campos, com as alavancas que levariam a esse resultado.',
      'Para cada cenario: descreva em 2 a 3 linhas o que precisaria acontecer para chegar nele.',
      'SHEETS — Consolide tudo em um dashboard unico com QUERY, IMPORTRANGE, IFERROR, graficos e formatacao condicional. Este e o seu dashboard final.'
    ],
    formato: 'Google Sheets com os 3 cenarios e o dashboard consolidado.',
    dica: 'O cenario base deve ser realista — nao otimista disfarado. Use os dados historicos do CNA como referencia.'
  },

  'Semana 12': {
    modulo: 'M3',
    tema: 'Apresentacao para o Cliente',
    sheets: 'Apresentacao Final',
    contexto: 'A habilidade de comunicar resultados com clareza e uma das mais valorizadas em qualquer profissional de midia. Nao basta analisar bem — precisa saber apresentar de forma que o cliente entenda, confie e tome decisoes.',
    objetivo: 'Preparar uma apresentacao de 5 slides resumindo a performance de um mes e os proximos passos — como se fosse apresentar sozinha para o cliente CNA.',
    entregas: [
      'Slide 1 — RESULTADO DO MES: os principais numeros do periodo (investimento, leads, CPL, matriculas).',
      'Slide 2 — DESTAQUES POSITIVOS: o que funcionou bem e por que (minimo 2 pontos com justificativa).',
      'Slide 3 — PONTOS DE ATENCAO: o que nao funcionou como esperado e sua hipotese (minimo 2 pontos).',
      'Slide 4 — ACOES EM ANDAMENTO: o que ja esta sendo feito para melhorar a performance.',
      'Slide 5 — PROXIMOS PASSOS: o que vem a seguir no planejamento.',
      'CRITERIO ADICIONAL: os slides devem ser claros o suficiente para que alguem que nao conhece a campanha entenda o que aconteceu — sem voce precisar explicar em voz alta.'
    ],
    formato: 'Google Slides — 5 slides objetivos e visuais.',
    dica: 'Menos texto, mais clareza. Use numeros grandes, setas de variacao e bullets curtos. O slide nao e um relatorio — e um apoio visual.'
  },

};

// ── MODULOS ───────────────────────────────
export const MODULOS = {
  'M1': {
    nome: 'Modulo 1 — Fundamentos de Midias Pagas',
    semanas: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4']
  },
  'M2': {
    nome: 'Modulo 2 — Analise e Leitura de Dados',
    semanas: ['Semana 5', 'Semana 6', 'Semana 7', 'Semana 8']
  },
  'M3': {
    nome: 'Modulo 3 — Planejamento e Estrategia',
    semanas: ['Semana 9', 'Semana 10', 'Semana 11', 'Semana 12']
  },
};

// ── STATUS ────────────────────────────────
export const STATUS_CFG = {
  a_fazer:      { label: 'A Fazer',      color: '#ECECEC', text: '#5E5E5E' },
  em_andamento: { label: 'Em Andamento', color: '#FFFBE6', text: '#D4940E' },
  entregue:     { label: 'Entregue',     color: '#E1F6FF', text: '#007CC5' },
  concluido:    { label: 'Concluido',    color: '#E0FAD0', text: '#00A700' },
};
