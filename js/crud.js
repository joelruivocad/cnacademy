import { db } from './firebase.js';
import {
  collection, doc, getDocs, getDoc,
  addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ── USUARIOS ──────────────────────────────
export async function getUsuarios() {
  const snap = await getDocs(collection(db,'usuarios'));
  return snap.docs.map(d => ({ id:d.id, ...d.data() }));
}

export async function createUsuario(data) {
  const ref = await addDoc(collection(db,'usuarios'), {
    ...data, tipo:'analista', ativo:true,
    criadoEm: serverTimestamp()
  });
  return ref.id;
}

export async function updateUsuario(id, data) {
  await updateDoc(doc(db,'usuarios',id), data);
}

export async function deleteUsuario(id) {
  await updateDoc(doc(db,'usuarios',id), { ativo:false });
}

// ── PDI ───────────────────────────────────
export async function getPDI(analistaId) {
  const snap = await getDocs(
    collection(db, 'usuarios', analistaId, 'pdi')
  );
  return snap.docs.map(d => ({ semana:d.id, ...d.data() }));
}

export async function updatePDI(analistaId, semana, data) {
  const ref = doc(db, 'usuarios', analistaId, 'pdi', semana);
  await setDoc(ref, {
    ...data, atualizadoEm: serverTimestamp()
  }, { merge:true });
}

// ── DESAFIOS ──────────────────────────────
export const DESAFIOS = {
  'Semana 1':  { modulo:'M1', tema:'O Funil e os KPIs que Importam',           sheets:'SOMASES',                          contexto:'Em midias pagas, toda campanha existe por um motivo especifico dentro de uma jornada. Entender em qual etapa do funil cada campanha atua e a base de qualquer analise inteligente.' },
  'Semana 2':  { modulo:'M1', tema:'CPL, CPA e o que os Numeros Dizem',        sheets:'Variacao % + Formatacao Condicional',contexto:'CPL e CPA nao sao so numeros — sao sinais. Saber interpretar esses sinais e o que diferencia uma analista que executa de uma que pensa.' },
  'Semana 3':  { modulo:'M1', tema:'Entendendo o Budget e o Pacing',           sheets:'CONT.SES',                         contexto:'Pacing e o ritmo de entrega do investimento ao longo do mes. Controlar o pacing e garantir que o dinheiro seja investido de forma saudavel.' },
  'Semana 4':  { modulo:'M1', tema:'Leitura de Resultado e Narrativa',         sheets:'SE + E + OU',                      contexto:'Saber ler um resultado nao e so olhar os numeros — e construir uma narrativa que conecta o que aconteceu com o porque e o que fazer.' },
  'Semana 5':  { modulo:'M2', tema:'Comparacao de Periodos',                   sheets:'PROCV / PROCX',                    contexto:'Compare a performance em diferentes periodos e identifique o que melhorou, o que piorou e por que.' },
  'Semana 6':  { modulo:'M2', tema:'Analise por Segmento',                     sheets:'QUERY basico',                     contexto:'Olhe para os resultados segmentados — por dispositivo, horario ou audiencia — e descubra padroes de comportamento.' },
  'Semana 7':  { modulo:'M2', tema:'Identificando Anomalias',                  sheets:'QUERY intermediario',              contexto:'Nos ultimos 30 dias, houve algum ponto fora da curva? Identifique anomalias e formule hipoteses.' },
  'Semana 8':  { modulo:'M2', tema:'Dashboard Pessoal de Acompanhamento',      sheets:'QUERY avancado + IMPORTRANGE',     contexto:'Crie uma visao que te permita abrir todo dia e em 2 minutos saber se esta tudo bem.' },
  'Semana 9':  { modulo:'M3', tema:'Leitura de Brief e Traducao para Midia',   sheets:'IFERROR + SEERRO',                 contexto:'Com base no planejamento P2/26 do CNA, escreva o racional estrategico de um mes sem usar numeros — so raciocinio.' },
  'Semana 10': { modulo:'M3', tema:'Distribuicao de Budget',                   sheets:'Graficos Dinamicos',               contexto:'Dado um budget de R$50.000, como voce distribuiria entre as plataformas? Justifique cada decisao.' },
  'Semana 11': { modulo:'M3', tema:'Cenarios de Performance',                  sheets:'Dashboard Completo',               contexto:'Monte 3 cenarios para julho: conservador, base e otimista. Defina as alavancas de cada um.' },
  'Semana 12': { modulo:'M3', tema:'Apresentacao para o Cliente',              sheets:'Apresentacao Final',               contexto:'Prepare 5 slides resumindo a performance de um mes e os proximos passos — como se fosse apresentar sozinha para o cliente.' },
};

export const MODULOS = {
  'M1': { nome:'Modulo 1 — Fundamentos de Midias Pagas', semanas:['Semana 1','Semana 2','Semana 3','Semana 4'] },
  'M2': { nome:'Modulo 2 — Analise e Leitura de Dados',  semanas:['Semana 5','Semana 6','Semana 7','Semana 8'] },
  'M3': { nome:'Modulo 3 — Planejamento e Estrategia',   semanas:['Semana 9','Semana 10','Semana 11','Semana 12'] },
};

export const STATUS_CFG = {
  a_fazer:      { label:'A Fazer',      color:'#ECECEC', text:'#5E5E5E' },
  em_andamento: { label:'Em Andamento', color:'#FFFBE6', text:'#D4940E' },
  entregue:     { label:'Entregue',     color:'#E1F6FF', text:'#007CC5' },
  concluido:    { label:'Concluido',    color:'#E0FAD0', text:'#00A700' },
};
