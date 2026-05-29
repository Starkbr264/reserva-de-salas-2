// ================================================================
// storage.js — Camada de dados via localStorage (modo frontend)
// Substitui api.js sem quebrar nenhuma assinatura de função.
// ================================================================

const _K = {
  usuarios:      'sn_v6_usuarios',
  unidades:      'sn_v6_unidades',
  salas:         'sn_v6_salas',
  turmas:        'sn_v6_turmas',
  reservas:      'sn_v6_reservas',
  chaves:        'sn_v6_chaves',
  notificacoes:  'sn_v6_notificacoes',
  solicitacoes:  'sn_v6_solicitacoes',
  sessao:        'sn_v6_sessao',
  tema:          'sn_v6_tema',
  init:          'sn_v6_init_v1'
};

// ── Helpers de persistência ──────────────────────────────────────
function _lv(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : []; }
  catch (_) { return []; }
}
function _sv(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
}
function _sessionStore() {
  try { return window.sessionStorage; } catch (_) { return null; }
}
function _getSessaoLocal() {
  try {
    const store = _sessionStore();
    let v = store ? store.getItem(_K.sessao) : localStorage.getItem(_K.sessao);
    if (!v) {
      const legacy = localStorage.getItem(_K.sessao);
      if (legacy && store) {
        store.setItem(_K.sessao, legacy);
        localStorage.removeItem(_K.sessao);
        v = legacy;
      }
    }
    return v ? JSON.parse(v) : null;
  } catch (_) {
    return null;
  }
}
function _setSessaoLocal(sessao) {
  const txt = JSON.stringify(sessao);
  const store = _sessionStore();
  if (store) {
    store.setItem(_K.sessao, txt);
    localStorage.removeItem(_K.sessao);
  } else {
    localStorage.setItem(_K.sessao, txt);
  }
}
function _clearSessaoLocal() {
  const store = _sessionStore();
  if (store) store.removeItem(_K.sessao);
  localStorage.removeItem(_K.sessao);
}
function _nextId(list) {
  return list.reduce((mx, x) => Math.max(mx, Number(x.id) || 0), 0) + 1;
}
function sortById(list) {
  return [...list].sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
}
function lowerPerfil(v) { return String(v || '').toLowerCase(); }

// ── Cache em memória (espelho do localStorage) ───────────────────
const CACHE = {
  usuarios: [], unidades: [], salas: [], turmas: [],
  reservas: [], chaves: [], notificacoes: [], solicitacoes: [],
  loaded: false, loadingPromise: null
};

function _load() {
  CACHE.usuarios     = _lv(_K.usuarios);
  CACHE.unidades     = _lv(_K.unidades);
  CACHE.salas        = _lv(_K.salas);
  CACHE.turmas       = _lv(_K.turmas);
  CACHE.reservas     = _lv(_K.reservas);
  CACHE.chaves       = _lv(_K.chaves);
  CACHE.notificacoes = _lv(_K.notificacoes);
  CACHE.solicitacoes = _lv(_K.solicitacoes);
}
function _persist(key) { _sv(_K[key], CACHE[key]); }

// ── Seed de dados iniciais ───────────────────────────────────────
function _seedDados() {
  if (localStorage.getItem(_K.init)) return;

  // Datas relativas ao dia de hoje
  const hoje = new Date();
  const iso = d => d.toISOString().split('T')[0];
  const addDias = n => { const d = new Date(hoje); d.setDate(d.getDate() + n); return iso(d); };

  // ── UNIDADES ────────────────────────────────────────────────────
  const unidades = [
    { id:1001, nome:'SENAC Asa Norte',    cep:'70750-500', cidade:'Brasília/DF',    endereco:'SCS Q.3 Bl.A - Asa Norte' },
    { id:1002, nome:'SENAC Asa Sul',      cep:'70390-045', cidade:'Brasília/DF',    endereco:'SCS Q.3 Bl.A - Asa Sul' },
    { id:1003, nome:'SENAC Taguatinga',   cep:'72015-900', cidade:'Taguatinga/DF',  endereco:'QS 1 Rua 210 Lote 30' },
    { id:1004, nome:'SENAC Ceilândia',    cep:'72220-270', cidade:'Ceilândia/DF',   endereco:'Setor O, Qd.602 Conj.A' },
    { id:1005, nome:'SENAC Gama',         cep:'72405-080', cidade:'Gama/DF',        endereco:'St. Central Qd.01 Conj.A' },
    { id:1006, nome:'SENAC Sobradinho',   cep:'73025-500', cidade:'Sobradinho/DF',  endereco:'Conj.7 Área Esp. S/N' },
    { id:1007, nome:'SENAC Planaltina',   cep:'73380-100', cidade:'Planaltina/DF',  endereco:'Setor Comercial Lote 1' },
    { id:1008, nome:'SENAC Samambaia',    cep:'72301-080', cidade:'Samambaia/DF',   endereco:'QS 318 Conj.1 Lote 1' },
    { id:1009, nome:'SENAC Santa Maria',  cep:'72503-503', cidade:'Santa Maria/DF', endereco:'Av.Alagados Qd.400' },
    { id:1010, nome:'SENAC Águas Claras', cep:'71907-530', cidade:'Águas Claras/DF',endereco:'Av.Araras Qd.600 Lote 10' },
  ];

  // ── USUÁRIOS ────────────────────────────────────────────────────
  const usuarios = [
    // Admin
    { id:1, nome:'Administrador SENAC', email:'Senac_GDF@Hotmail.com', senha:'Senac.DF2007', perfil:'admin', unidadeId:1001 },
    // Coordenadores
    { id:2001, nome:'Ana Paula Ferreira',   email:'coord.asanorte@senacdf.com',    senha:'Coord@123', perfil:'coordenador', unidadeId:1001 },
    { id:2011, nome:'Joao Paulo Ferreira',   email:'coord.Paulo@senacdf.com',    senha:'Coord@123', perfil:'coordenador', unidadeId:1001 },
    { id:2002, nome:'Bruno Mendes Costa',   email:'coord.asasul@senacdf.com',      senha:'Coord@123', perfil:'coordenador', unidadeId:1002 },
    { id:2003, nome:'Carla Souza Lima',     email:'coord.taguatinga@senacdf.com',  senha:'Coord@123', perfil:'coordenador', unidadeId:1003 },
    { id:2004, nome:'Daniel Rocha Neves',   email:'coord.ceilandia@senacdf.com',   senha:'Coord@123', perfil:'coordenador', unidadeId:1004 },
    { id:2005, nome:'Elaine Cristina Dias', email:'coord.gama@senacdf.com',        senha:'Coord@123', perfil:'coordenador', unidadeId:1005 },
    { id:2006, nome:'Fábio Alves Santos',   email:'coord.sobradinho@senacdf.com',  senha:'Coord@123', perfil:'coordenador', unidadeId:1006 },
    { id:2007, nome:'Gabriela Moura',       email:'coord.planaltina@senacdf.com',  senha:'Coord@123', perfil:'coordenador', unidadeId:1007 },
    { id:2008, nome:'Henrique Lopes',       email:'coord.samambaia@senacdf.com',   senha:'Coord@123', perfil:'coordenador', unidadeId:1008 },
    { id:2009, nome:'Isabela Ramos',        email:'coord.santamaria@senacdf.com',  senha:'Coord@123', perfil:'coordenador', unidadeId:1009 },
    { id:2010, nome:'João Victor Pinto',    email:'coord.aguasclaras@senacdf.com', senha:'Coord@123', perfil:'coordenador', unidadeId:1010 },
    // Instrutores
    { id:3001, nome:'Katia Regina Barros',  email:'katia.barros@senacdf.com',     senha:'Inst@123', perfil:'instrutor', unidadeId:1001 },
    { id:3002, nome:'Leonardo Cruz',        email:'leonardo.cruz@senacdf.com',    senha:'Inst@123', perfil:'instrutor', unidadeId:1002 },
    { id:3003, nome:'Mariana Oliveira',     email:'mariana.oliveira@senacdf.com', senha:'Inst@123', perfil:'instrutor', unidadeId:1003 },
    { id:3004, nome:'Natan Ferreira',       email:'natan.ferreira@senacdf.com',   senha:'Inst@123', perfil:'instrutor', unidadeId:1004 },
    { id:3005, nome:'Olivia Martins',       email:'olivia.martins@senacdf.com',   senha:'Inst@123', perfil:'instrutor', unidadeId:1005 },
    { id:3006, nome:'Pedro Henrique Melo',  email:'pedro.melo@senacdf.com',       senha:'Inst@123', perfil:'instrutor', unidadeId:1006 },
    { id:3007, nome:'Queila Nascimento',    email:'queila.nascimento@senacdf.com',senha:'Inst@123', perfil:'instrutor', unidadeId:1007 },
    { id:3008, nome:'Rafael Torres',        email:'rafael.torres@senacdf.com',    senha:'Inst@123', perfil:'instrutor', unidadeId:1008 },
    { id:3009, nome:'Sabrina Almeida',      email:'sabrina.almeida@senacdf.com',  senha:'Inst@123', perfil:'instrutor', unidadeId:1009 },
    { id:3010, nome:'Thiago Vieira',        email:'thiago.vieira@senacdf.com',    senha:'Inst@123', perfil:'instrutor', unidadeId:1010 },
    { id:3011, nome:'Aline Moraes',         email:'aline.moraes@senacdf.com',     senha:'Inst@123', perfil:'instrutor', unidadeId:1001 },
    { id:3012, nome:'Caio Batista',         email:'caio.batista@senacdf.com',     senha:'Inst@123', perfil:'instrutor', unidadeId:1002 },
    { id:3013, nome:'Diana Castro',         email:'diana.castro@senacdf.com',     senha:'Inst@123', perfil:'instrutor', unidadeId:1003 },
    { id:3014, nome:'Erick Almeida',        email:'erick.almeida@senacdf.com',    senha:'Inst@123', perfil:'instrutor', unidadeId:1004 },
    { id:3015, nome:'Fernanda Lima',        email:'fernanda.lima@senacdf.com',    senha:'Inst@123', perfil:'instrutor', unidadeId:1005 },
    { id:3016, nome:'Gustavo Rocha',        email:'gustavo.rocha@senacdf.com',    senha:'Inst@123', perfil:'instrutor', unidadeId:1006 },
    { id:3017, nome:'Helena Duarte',        email:'helena.duarte@senacdf.com',    senha:'Inst@123', perfil:'instrutor', unidadeId:1007 },
    { id:3018, nome:'Igor Martins',         email:'igor.martins@senacdf.com',     senha:'Inst@123', perfil:'instrutor', unidadeId:1008 },
    { id:3019, nome:'Julia Naves',          email:'julia.naves@senacdf.com',      senha:'Inst@123', perfil:'instrutor', unidadeId:1009 },
    { id:3020, nome:'Lucas Teixeira',       email:'lucas.teixeira@senacdf.com',   senha:'Inst@123', perfil:'instrutor', unidadeId:1010 },
    // Recepcionistas
    { id:4001, nome:'Úrsula Campos',    email:'recep.asanorte@senacdf.com',    senha:'Recep@123', perfil:'recepcao', unidadeId:1001 },
    { id:4002, nome:'Vinícius Cardoso', email:'recep.asasul@senacdf.com',      senha:'Recep@123', perfil:'recepcao', unidadeId:1002 },
    { id:4003, nome:'Wanda Silveira',   email:'recep.taguatinga@senacdf.com',  senha:'Recep@123', perfil:'recepcao', unidadeId:1003 },
    { id:4004, nome:'Xênia Prudente',   email:'recep.ceilandia@senacdf.com',   senha:'Recep@123', perfil:'recepcao', unidadeId:1004 },
    { id:4005, nome:'Yara Gonçalves',   email:'recep.gama@senacdf.com',        senha:'Recep@123', perfil:'recepcao', unidadeId:1005 },
    { id:4006, nome:'Zilda Fonseca',    email:'recep.sobradinho@senacdf.com',  senha:'Recep@123', perfil:'recepcao', unidadeId:1006 },
    { id:4007, nome:'Adriana Pereira',  email:'recep.planaltina@senacdf.com',  senha:'Recep@123', perfil:'recepcao', unidadeId:1007 },
    { id:4008, nome:'Bernardo Castro',  email:'recep.samambaia@senacdf.com',   senha:'Recep@123', perfil:'recepcao', unidadeId:1008 },
    { id:4009, nome:'Cecília Duarte',   email:'recep.santamaria@senacdf.com',  senha:'Recep@123', perfil:'recepcao', unidadeId:1009 },
    { id:4010, nome:'Diego Farias',     email:'recep.aguasclaras@senacdf.com', senha:'Recep@123', perfil:'recepcao', unidadeId:1010 },
  ];

  // ── SALAS (3 por unidade) ────────────────────────────────────────
  const salas = [
    // Asa Norte
    { id:5001, nome:'Lab Informática 01', capacidade:30, tipo:'Laboratório de Informática', andar:'1º Andar', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1001, statusManual:null },
    { id:5002, nome:'Sala Gastronomia 01', capacidade:20, tipo:'Cozinha Didática', andar:'Térreo', bloco:'Bloco B', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1001, statusManual:null },
    { id:5003, nome:'Auditório Principal', capacidade:80, tipo:'Auditório', andar:'Térreo', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1001, statusManual:null },
    // Asa Sul
    { id:5004, nome:'Lab Estética 01', capacidade:16, tipo:'Laboratório de Estética', andar:'1º Andar', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1002, statusManual:null },
    { id:5005, nome:'Sala Comum 01', capacidade:35, tipo:'Sala Comum', andar:'Térreo', bloco:'Bloco B', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1002, statusManual:null },
    { id:5006, nome:'Lab Enfermagem 01', capacidade:20, tipo:'Laboratório de Enfermagem', andar:'2º Andar', bloco:'Bloco A', turnosDisponiveis:['Matutino','Noturno'], unidadeId:1002, statusManual:null },
    // Taguatinga
    { id:5007, nome:'Lab Informática 01', capacidade:30, tipo:'Laboratório de Informática', andar:'1º Andar', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1003, statusManual:null },
    { id:5008, nome:'Sala Comum 01', capacidade:40, tipo:'Sala Comum', andar:'Térreo', bloco:'Bloco B', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1003, statusManual:null },
    { id:5009, nome:'Lab Ciências 01', capacidade:25, tipo:'Laboratório de Ciências', andar:'2º Andar', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1003, statusManual:null },
    // Ceilândia
    { id:5010, nome:'Lab Informática 01', capacidade:30, tipo:'Laboratório de Informática', andar:'Térreo', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1004, statusManual:null },
    { id:5011, nome:'Sala Videoconferência', capacidade:20, tipo:'Sala de Videoconferência', andar:'1º Andar', bloco:'Bloco B', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1004, statusManual:null },
    { id:5012, nome:'Auditório 01', capacidade:60, tipo:'Auditório', andar:'Térreo', bloco:'Bloco C', turnosDisponiveis:['Vespertino','Noturno'], unidadeId:1004, statusManual:null },
    // Gama
    { id:5013, nome:'Lab Gastronomia 01', capacidade:18, tipo:'Cozinha Didática', andar:'Térreo', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1005, statusManual:null },
    { id:5014, nome:'Sala Comum 01', capacidade:35, tipo:'Sala Comum', andar:'1º Andar', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1005, statusManual:null },
    { id:5015, nome:'Lab Informática 01', capacidade:30, tipo:'Laboratório de Informática', andar:'1º Andar', bloco:'Bloco B', turnosDisponiveis:['Matutino','Noturno'], unidadeId:1005, statusManual:null },
    // Sobradinho
    { id:5016, nome:'Lab Estética 01', capacidade:16, tipo:'Laboratório de Estética', andar:'Térreo', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1006, statusManual:null },
    { id:5017, nome:'Sala Comum 01', capacidade:40, tipo:'Sala Comum', andar:'1º Andar', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1006, statusManual:null },
    { id:5018, nome:'Lab Informática 01', capacidade:30, tipo:'Laboratório de Informática', andar:'2º Andar', bloco:'Bloco B', turnosDisponiveis:['Vespertino','Noturno'], unidadeId:1006, statusManual:null },
    // Planaltina
    { id:5019, nome:'Lab Informática 01', capacidade:28, tipo:'Laboratório de Informática', andar:'Térreo', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1007, statusManual:null },
    { id:5020, nome:'Sala Comum 01', capacidade:35, tipo:'Sala Comum', andar:'1º Andar', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1007, statusManual:null },
    { id:5021, nome:'Lab Enfermagem 01', capacidade:20, tipo:'Laboratório de Enfermagem', andar:'2º Andar', bloco:'Bloco B', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1007, statusManual:null },
    // Samambaia
    { id:5022, nome:'Lab Informática 01', capacidade:30, tipo:'Laboratório de Informática', andar:'Térreo', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1008, statusManual:null },
    { id:5023, nome:'Sala Gastronomia 01', capacidade:18, tipo:'Cozinha Didática', andar:'1º Andar', bloco:'Bloco B', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1008, statusManual:null },
    { id:5024, nome:'Sala Comum 01', capacidade:40, tipo:'Sala Comum', andar:'1º Andar', bloco:'Bloco A', turnosDisponiveis:['Vespertino','Noturno'], unidadeId:1008, statusManual:null },
    // Santa Maria
    { id:5025, nome:'Lab Informática 01', capacidade:30, tipo:'Laboratório de Informática', andar:'Térreo', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1009, statusManual:null },
    { id:5026, nome:'Sala Estética 01', capacidade:16, tipo:'Laboratório de Estética', andar:'1º Andar', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1009, statusManual:null },
    { id:5027, nome:'Sala Comum 01', capacidade:35, tipo:'Sala Comum', andar:'2º Andar', bloco:'Bloco B', turnosDisponiveis:['Vespertino','Noturno'], unidadeId:1009, statusManual:null },
    // Águas Claras
    { id:5028, nome:'Lab Informática 01', capacidade:30, tipo:'Laboratório de Informática', andar:'1º Andar', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1010, statusManual:null },
    { id:5029, nome:'Sala Comum 01', capacidade:40, tipo:'Sala Comum', andar:'Térreo', bloco:'Bloco B', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1010, statusManual:null },
    { id:5030, nome:'Auditório 01', capacidade:70, tipo:'Auditório', andar:'Térreo', bloco:'Bloco A', turnosDisponiveis:['Vespertino','Noturno'], unidadeId:1010, statusManual:null },
    // Salas extras para demonstracao
    { id:5031, nome:'Sala Maker 01', capacidade:24, tipo:'Laboratorio Maker', andar:'2o Andar', bloco:'Bloco C', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1001, statusManual:null },
    { id:5032, nome:'Sala Reuniao 01', capacidade:12, tipo:'Sala de Reuniao', andar:'1o Andar', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1001, statusManual:'manutencao', motivoManual:'Projetor em revisao', manualPor:'Administrador SENAC', manualCriadaEm:new Date(Date.now()-86400000).toISOString().slice(0, 19) },
    { id:5033, nome:'Lab Informatica 02', capacidade:28, tipo:'Laboratorio de Informatica', andar:'2o Andar', bloco:'Bloco B', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1002, statusManual:null },
    { id:5034, nome:'Sala Multiuso 01', capacidade:32, tipo:'Sala Multiuso', andar:'1o Andar', bloco:'Bloco C', turnosDisponiveis:['Vespertino','Noturno'], unidadeId:1002, statusManual:null },
    { id:5035, nome:'Lab Fotografia 01', capacidade:18, tipo:'Estudio de Fotografia', andar:'1o Andar', bloco:'Bloco C', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1003, statusManual:null },
    { id:5036, nome:'Sala Coworking 01', capacidade:26, tipo:'Sala Colaborativa', andar:'Terreo', bloco:'Bloco A', turnosDisponiveis:['Matutino','Noturno'], unidadeId:1003, statusManual:null },
    { id:5037, nome:'Lab Redes 01', capacidade:24, tipo:'Laboratorio de Redes', andar:'2o Andar', bloco:'Bloco B', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1004, statusManual:null },
    { id:5038, nome:'Sala Idiomas 01', capacidade:30, tipo:'Sala de Idiomas', andar:'1o Andar', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1004, statusManual:null },
    { id:5039, nome:'Lab Panificacao 01', capacidade:16, tipo:'Cozinha Didatica', andar:'Terreo', bloco:'Bloco B', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1005, statusManual:null },
    { id:5040, nome:'Sala Empreender 01', capacidade:28, tipo:'Sala Comum', andar:'2o Andar', bloco:'Bloco C', turnosDisponiveis:['Vespertino','Noturno'], unidadeId:1005, statusManual:null },
    { id:5041, nome:'Lab Beleza 02', capacidade:18, tipo:'Laboratorio de Estetica', andar:'1o Andar', bloco:'Bloco B', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1006, statusManual:null },
    { id:5042, nome:'Sala Informatizada 02', capacidade:32, tipo:'Laboratorio de Informatica', andar:'2o Andar', bloco:'Bloco C', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1006, statusManual:null },
    { id:5043, nome:'Lab Saude 02', capacidade:22, tipo:'Laboratorio de Enfermagem', andar:'1o Andar', bloco:'Bloco C', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1007, statusManual:null },
    { id:5044, nome:'Sala Projetos 01', capacidade:28, tipo:'Sala Colaborativa', andar:'2o Andar', bloco:'Bloco A', turnosDisponiveis:['Vespertino','Noturno'], unidadeId:1007, statusManual:null },
    { id:5045, nome:'Lab Games 01', capacidade:24, tipo:'Laboratorio de Informatica', andar:'2o Andar', bloco:'Bloco C', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1008, statusManual:null },
    { id:5046, nome:'Sala Eventos 01', capacidade:55, tipo:'Sala Multiuso', andar:'Terreo', bloco:'Bloco B', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1008, statusManual:null },
    { id:5047, nome:'Lab Beleza 02', capacidade:18, tipo:'Laboratorio de Estetica', andar:'2o Andar', bloco:'Bloco A', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1009, statusManual:'bloqueada', motivoManual:'Limpeza tecnica agendada', manualPor:'Isabela Ramos', manualCriadaEm:new Date(Date.now()-43200000).toISOString().slice(0, 19) },
    { id:5048, nome:'Sala Digital 01', capacidade:30, tipo:'Laboratorio de Informatica', andar:'1o Andar', bloco:'Bloco C', turnosDisponiveis:['Matutino','Noturno'], unidadeId:1009, statusManual:null },
    { id:5049, nome:'Lab Marketing 01', capacidade:26, tipo:'Laboratorio Criativo', andar:'2o Andar', bloco:'Bloco C', turnosDisponiveis:['Matutino','Vespertino'], unidadeId:1010, statusManual:null },
    { id:5050, nome:'Sala Mentoria 01', capacidade:14, tipo:'Sala de Reuniao', andar:'1o Andar', bloco:'Bloco B', turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1010, statusManual:null },
  ];
  salas.forEach(s => { s.turnos = s.turnosDisponiveis; });

  // ── TURMAS (3 por unidade) ────────────────────────────────────────
  const turmas = [
    { id:6001, codigo:'2025.04.101', nome:'2025.04.101', curso:'Técnico em Informática', turno:'Matutino',    dataInicio:addDias(-30), dataFim:addDias(150), instrutorId:3001, unidadeId:1001 },
    { id:6002, codigo:'2025.04.102', nome:'2025.04.102', curso:'Gastronomia Básica',     turno:'Vespertino',  dataInicio:addDias(-10), dataFim:addDias(80),  instrutorId:3001, unidadeId:1001 },
    { id:6003, codigo:'2025.04.103', nome:'2025.04.103', curso:'Gestão de Pessoas',      turno:'Noturno',     dataInicio:addDias(5),   dataFim:addDias(120), instrutorId:3001, unidadeId:1001 },
    { id:6004, codigo:'2025.04.104', nome:'2025.04.104', curso:'Técnico em Estética',    turno:'Matutino',    dataInicio:addDias(-20), dataFim:addDias(100), instrutorId:3002, unidadeId:1002 },
    { id:6005, codigo:'2025.04.105', nome:'2025.04.105', curso:'Auxiliar de Enfermagem', turno:'Noturno',     dataInicio:addDias(-5),  dataFim:addDias(90),  instrutorId:3002, unidadeId:1002 },
    { id:6006, codigo:'2025.04.106', nome:'2025.04.106', curso:'Informática Básica',     turno:'Vespertino',  dataInicio:addDias(3),   dataFim:addDias(60),  instrutorId:3002, unidadeId:1002 },
    { id:6007, codigo:'2025.04.107', nome:'2025.04.107', curso:'Técnico em Redes',       turno:'Matutino',    dataInicio:addDias(-15), dataFim:addDias(130), instrutorId:3003, unidadeId:1003 },
    { id:6008, codigo:'2025.04.108', nome:'2025.04.108', curso:'Ciências de Dados',      turno:'Vespertino',  dataInicio:addDias(-8),  dataFim:addDias(70),  instrutorId:3003, unidadeId:1003 },
    { id:6009, codigo:'2025.04.109', nome:'2025.04.109', curso:'Design Gráfico',         turno:'Noturno',     dataInicio:addDias(7),   dataFim:addDias(110), instrutorId:3003, unidadeId:1003 },
    { id:6010, codigo:'2025.04.110', nome:'2025.04.110', curso:'Técnico em Informática', turno:'Matutino',    dataInicio:addDias(-25), dataFim:addDias(90),  instrutorId:3004, unidadeId:1004 },
    { id:6011, codigo:'2025.04.111', nome:'2025.04.111', curso:'Operador de Computador', turno:'Vespertino',  dataInicio:addDias(-3),  dataFim:addDias(60),  instrutorId:3004, unidadeId:1004 },
    { id:6012, codigo:'2025.04.112', nome:'2025.04.112', curso:'Auxiliar Administrativo',turno:'Noturno',     dataInicio:addDias(2),   dataFim:addDias(95),  instrutorId:3004, unidadeId:1004 },
    { id:6013, codigo:'2025.04.113', nome:'2025.04.113', curso:'Confeitaria',            turno:'Matutino',    dataInicio:addDias(-12), dataFim:addDias(80),  instrutorId:3005, unidadeId:1005 },
    { id:6014, codigo:'2025.04.114', nome:'2025.04.114', curso:'Atendimento ao Cliente', turno:'Vespertino',  dataInicio:addDias(-6),  dataFim:addDias(50),  instrutorId:3005, unidadeId:1005 },
    { id:6015, codigo:'2025.04.115', nome:'2025.04.115', curso:'Técnico em Informática', turno:'Noturno',     dataInicio:addDias(4),   dataFim:addDias(140), instrutorId:3005, unidadeId:1005 },
    { id:6016, codigo:'2025.04.116', nome:'2025.04.116', curso:'Técnico em Estética',    turno:'Matutino',    dataInicio:addDias(-18), dataFim:addDias(100), instrutorId:3006, unidadeId:1006 },
    { id:6017, codigo:'2025.04.117', nome:'2025.04.117', curso:'Informática Básica',     turno:'Vespertino',  dataInicio:addDias(-4),  dataFim:addDias(65),  instrutorId:3006, unidadeId:1006 },
    { id:6018, codigo:'2025.04.118', nome:'2025.04.118', curso:'Gestão Financeira',      turno:'Noturno',     dataInicio:addDias(6),   dataFim:addDias(115), instrutorId:3006, unidadeId:1006 },
    { id:6019, codigo:'2025.04.119', nome:'2025.04.119', curso:'Técnico em Informática', turno:'Matutino',    dataInicio:addDias(-22), dataFim:addDias(85),  instrutorId:3007, unidadeId:1007 },
    { id:6020, codigo:'2025.04.120', nome:'2025.04.120', curso:'Auxiliar de Enfermagem', turno:'Vespertino',  dataInicio:addDias(-9),  dataFim:addDias(75),  instrutorId:3007, unidadeId:1007 },
    { id:6021, codigo:'2025.04.121', nome:'2025.04.121', curso:'Excel Avançado',         turno:'Noturno',     dataInicio:addDias(1),   dataFim:addDias(55),  instrutorId:3007, unidadeId:1007 },
    { id:6022, codigo:'2025.04.122', nome:'2025.04.122', curso:'Técnico em Informática', turno:'Matutino',    dataInicio:addDias(-16), dataFim:addDias(95),  instrutorId:3008, unidadeId:1008 },
    { id:6023, codigo:'2025.04.123', nome:'2025.04.123', curso:'Gastronomia Avançada',   turno:'Vespertino',  dataInicio:addDias(-7),  dataFim:addDias(70),  instrutorId:3008, unidadeId:1008 },
    { id:6024, codigo:'2025.04.124', nome:'2025.04.124', curso:'Logística',              turno:'Noturno',     dataInicio:addDias(8),   dataFim:addDias(125), instrutorId:3008, unidadeId:1008 },
    { id:6025, codigo:'2025.04.125', nome:'2025.04.125', curso:'Técnico em Informática', turno:'Matutino',    dataInicio:addDias(-28), dataFim:addDias(110), instrutorId:3009, unidadeId:1009 },
    { id:6026, codigo:'2025.04.126', nome:'2025.04.126', curso:'Técnico em Estética',    turno:'Vespertino',  dataInicio:addDias(-11), dataFim:addDias(80),  instrutorId:3009, unidadeId:1009 },
    { id:6027, codigo:'2025.04.127', nome:'2025.04.127', curso:'Atendimento ao Cliente', turno:'Noturno',     dataInicio:addDias(3),   dataFim:addDias(90),  instrutorId:3009, unidadeId:1009 },
    { id:6028, codigo:'2025.04.128', nome:'2025.04.128', curso:'Técnico em Informática', turno:'Matutino',    dataInicio:addDias(-14), dataFim:addDias(120), instrutorId:3010, unidadeId:1010 },
    { id:6029, codigo:'2025.04.129', nome:'2025.04.129', curso:'Gestão de Projetos',     turno:'Vespertino',  dataInicio:addDias(-6),  dataFim:addDias(60),  instrutorId:3010, unidadeId:1010 },
    { id:6030, codigo:'2025.04.130', nome:'2025.04.130', curso:'Empreendedorismo',       turno:'Noturno',     dataInicio:addDias(5),   dataFim:addDias(100), instrutorId:3010, unidadeId:1010 },
    // Turmas extras para demonstracao
    { id:6031, codigo:'2025.05.201', nome:'2025.05.201', curso:'Design de Servicos',      turno:'Vespertino', dataInicio:addDias(-2),  dataFim:addDias(75),  instrutorId:3011, unidadeId:1001 },
    { id:6032, codigo:'2025.05.202', nome:'2025.05.202', curso:'Marketing Digital',       turno:'Noturno',    dataInicio:addDias(10),  dataFim:addDias(100), instrutorId:3012, unidadeId:1002 },
    { id:6033, codigo:'2025.05.203', nome:'2025.05.203', curso:'Fotografia Comercial',    turno:'Matutino',   dataInicio:addDias(-5),  dataFim:addDias(55),  instrutorId:3013, unidadeId:1003 },
    { id:6034, codigo:'2025.05.204', nome:'2025.05.204', curso:'Redes Corporativas',      turno:'Noturno',    dataInicio:addDias(-1),  dataFim:addDias(90),  instrutorId:3014, unidadeId:1004 },
    { id:6035, codigo:'2025.05.205', nome:'2025.05.205', curso:'Panificacao Artesanal',   turno:'Matutino',   dataInicio:addDias(12),  dataFim:addDias(70),  instrutorId:3015, unidadeId:1005 },
    { id:6036, codigo:'2025.05.206', nome:'2025.05.206', curso:'Maquiagem Profissional',  turno:'Vespertino', dataInicio:addDias(-7),  dataFim:addDias(65),  instrutorId:3016, unidadeId:1006 },
    { id:6037, codigo:'2025.05.207', nome:'2025.05.207', curso:'Cuidador de Idosos',      turno:'Matutino',   dataInicio:addDias(4),   dataFim:addDias(95),  instrutorId:3017, unidadeId:1007 },
    { id:6038, codigo:'2025.05.208', nome:'2025.05.208', curso:'Desenvolvimento de Games',turno:'Vespertino', dataInicio:addDias(-9),  dataFim:addDias(110), instrutorId:3018, unidadeId:1008 },
    { id:6039, codigo:'2025.05.209', nome:'2025.05.209', curso:'Operador de Caixa',       turno:'Noturno',    dataInicio:addDias(15),  dataFim:addDias(75),  instrutorId:3019, unidadeId:1009 },
    { id:6040, codigo:'2025.05.210', nome:'2025.05.210', curso:'Vendas Consultivas',      turno:'Matutino',   dataInicio:addDias(-3),  dataFim:addDias(80),  instrutorId:3020, unidadeId:1010 },
  ];

  // ── RESERVAS (1 por turma) ───────────────────────────────────────
  const reservas = [
    { id:7001, salaId:5001, turmaId:6001, turno:'Matutino',   diasSemana:['seg','ter','qua','qui','sex'], dataInicio:addDias(-30), dataFim:addDias(150), status:'ATIVA', unidadeId:1001, instrutorId:3001 },
    { id:7002, salaId:5002, turmaId:6002, turno:'Vespertino', diasSemana:['seg','qua','sex'],             dataInicio:addDias(-10), dataFim:addDias(80),  status:'ATIVA', unidadeId:1001, instrutorId:3001 },
    { id:7003, salaId:5003, turmaId:6003, turno:'Noturno',    diasSemana:['ter','qui'],                   dataInicio:addDias(5),   dataFim:addDias(120), status:'ATIVA', unidadeId:1001, instrutorId:3001 },
    { id:7004, salaId:5004, turmaId:6004, turno:'Matutino',   diasSemana:['seg','ter','qua','qui','sex'], dataInicio:addDias(-20), dataFim:addDias(100), status:'ATIVA', unidadeId:1002, instrutorId:3002 },
    { id:7005, salaId:5006, turmaId:6005, turno:'Noturno',    diasSemana:['ter','qui','sex'],             dataInicio:addDias(-5),  dataFim:addDias(90),  status:'ATIVA', unidadeId:1002, instrutorId:3002 },
    { id:7006, salaId:5005, turmaId:6006, turno:'Vespertino', diasSemana:['seg','qua'],                   dataInicio:addDias(3),   dataFim:addDias(60),  status:'ATIVA', unidadeId:1002, instrutorId:3002 },
    { id:7007, salaId:5007, turmaId:6007, turno:'Matutino',   diasSemana:['seg','ter','qua','qui','sex'], dataInicio:addDias(-15), dataFim:addDias(130), status:'ATIVA', unidadeId:1003, instrutorId:3003 },
    { id:7008, salaId:5009, turmaId:6008, turno:'Vespertino', diasSemana:['seg','qua','sex'],             dataInicio:addDias(-8),  dataFim:addDias(70),  status:'ATIVA', unidadeId:1003, instrutorId:3003 },
    { id:7009, salaId:5008, turmaId:6009, turno:'Noturno',    diasSemana:['ter','qui'],                   dataInicio:addDias(7),   dataFim:addDias(110), status:'ATIVA', unidadeId:1003, instrutorId:3003 },
    { id:7010, salaId:5010, turmaId:6010, turno:'Matutino',   diasSemana:['seg','ter','qua','qui','sex'], dataInicio:addDias(-25), dataFim:addDias(90),  status:'ATIVA', unidadeId:1004, instrutorId:3004 },
    { id:7011, salaId:5011, turmaId:6011, turno:'Vespertino', diasSemana:['seg','qua','sex'],             dataInicio:addDias(-3),  dataFim:addDias(60),  status:'ATIVA', unidadeId:1004, instrutorId:3004 },
    { id:7012, salaId:5012, turmaId:6012, turno:'Noturno',    diasSemana:['ter','qui'],                   dataInicio:addDias(2),   dataFim:addDias(95),  status:'ATIVA', unidadeId:1004, instrutorId:3004 },
    { id:7013, salaId:5013, turmaId:6013, turno:'Matutino',   diasSemana:['seg','ter','qua','qui'],       dataInicio:addDias(-12), dataFim:addDias(80),  status:'ATIVA', unidadeId:1005, instrutorId:3005 },
    { id:7014, salaId:5014, turmaId:6014, turno:'Vespertino', diasSemana:['seg','qua','sex'],             dataInicio:addDias(-6),  dataFim:addDias(50),  status:'ATIVA', unidadeId:1005, instrutorId:3005 },
    { id:7015, salaId:5015, turmaId:6015, turno:'Noturno',    diasSemana:['ter','qui','sex'],             dataInicio:addDias(4),   dataFim:addDias(140), status:'ATIVA', unidadeId:1005, instrutorId:3005 },
    { id:7016, salaId:5016, turmaId:6016, turno:'Matutino',   diasSemana:['seg','ter','qua','qui','sex'], dataInicio:addDias(-18), dataFim:addDias(100), status:'ATIVA', unidadeId:1006, instrutorId:3006 },
    { id:7017, salaId:5017, turmaId:6017, turno:'Vespertino', diasSemana:['seg','qua'],                   dataInicio:addDias(-4),  dataFim:addDias(65),  status:'ATIVA', unidadeId:1006, instrutorId:3006 },
    { id:7018, salaId:5018, turmaId:6018, turno:'Noturno',    diasSemana:['ter','qui'],                   dataInicio:addDias(6),   dataFim:addDias(115), status:'ATIVA', unidadeId:1006, instrutorId:3006 },
    { id:7019, salaId:5019, turmaId:6019, turno:'Matutino',   diasSemana:['seg','ter','qua','qui','sex'], dataInicio:addDias(-22), dataFim:addDias(85),  status:'ATIVA', unidadeId:1007, instrutorId:3007 },
    { id:7020, salaId:5021, turmaId:6020, turno:'Vespertino', diasSemana:['seg','qua','sex'],             dataInicio:addDias(-9),  dataFim:addDias(75),  status:'ATIVA', unidadeId:1007, instrutorId:3007 },
    { id:7021, salaId:5020, turmaId:6021, turno:'Noturno',    diasSemana:['ter','qui'],                   dataInicio:addDias(1),   dataFim:addDias(55),  status:'ATIVA', unidadeId:1007, instrutorId:3007 },
    { id:7022, salaId:5022, turmaId:6022, turno:'Matutino',   diasSemana:['seg','ter','qua','qui','sex'], dataInicio:addDias(-16), dataFim:addDias(95),  status:'ATIVA', unidadeId:1008, instrutorId:3008 },
    { id:7023, salaId:5023, turmaId:6023, turno:'Vespertino', diasSemana:['seg','qua','sex'],             dataInicio:addDias(-7),  dataFim:addDias(70),  status:'ATIVA', unidadeId:1008, instrutorId:3008 },
    { id:7024, salaId:5024, turmaId:6024, turno:'Noturno',    diasSemana:['ter','qui'],                   dataInicio:addDias(8),   dataFim:addDias(125), status:'ATIVA', unidadeId:1008, instrutorId:3008 },
    { id:7025, salaId:5025, turmaId:6025, turno:'Matutino',   diasSemana:['seg','ter','qua','qui','sex'], dataInicio:addDias(-28), dataFim:addDias(110), status:'ATIVA', unidadeId:1009, instrutorId:3009 },
    { id:7026, salaId:5026, turmaId:6026, turno:'Vespertino', diasSemana:['seg','qua','sex'],             dataInicio:addDias(-11), dataFim:addDias(80),  status:'ATIVA', unidadeId:1009, instrutorId:3009 },
    { id:7027, salaId:5027, turmaId:6027, turno:'Noturno',    diasSemana:['ter','qui'],                   dataInicio:addDias(3),   dataFim:addDias(90),  status:'ATIVA', unidadeId:1009, instrutorId:3009 },
    { id:7028, salaId:5028, turmaId:6028, turno:'Matutino',   diasSemana:['seg','ter','qua','qui','sex'], dataInicio:addDias(-14), dataFim:addDias(120), status:'ATIVA', unidadeId:1010, instrutorId:3010 },
    { id:7029, salaId:5029, turmaId:6029, turno:'Vespertino', diasSemana:['seg','qua','sex'],             dataInicio:addDias(-6),  dataFim:addDias(60),  status:'ATIVA', unidadeId:1010, instrutorId:3010 },
    { id:7030, salaId:5030, turmaId:6030, turno:'Noturno',    diasSemana:['ter','qui'],                   dataInicio:addDias(5),   dataFim:addDias(100), status:'ATIVA', unidadeId:1010, instrutorId:3010 },
    // Reservas extras em salas novas
    { id:7031, salaId:5031, turmaId:6031, turno:'Vespertino', diasSemana:['seg','qua'],                   dataInicio:addDias(-2),  dataFim:addDias(75),  status:'ATIVA', unidadeId:1001, instrutorId:3011 },
    { id:7032, salaId:5034, turmaId:6032, turno:'Noturno',    diasSemana:['ter','qui'],                   dataInicio:addDias(10),  dataFim:addDias(100), status:'ATIVA', unidadeId:1002, instrutorId:3012 },
    { id:7033, salaId:5035, turmaId:6033, turno:'Matutino',   diasSemana:['seg','qua','sex'],             dataInicio:addDias(-5),  dataFim:addDias(55),  status:'ATIVA', unidadeId:1003, instrutorId:3013 },
    { id:7034, salaId:5037, turmaId:6034, turno:'Noturno',    diasSemana:['seg','qua'],                   dataInicio:addDias(-1),  dataFim:addDias(90),  status:'ATIVA', unidadeId:1004, instrutorId:3014 },
    { id:7035, salaId:5039, turmaId:6035, turno:'Matutino',   diasSemana:['ter','qui'],                   dataInicio:addDias(12),  dataFim:addDias(70),  status:'ATIVA', unidadeId:1005, instrutorId:3015 },
    { id:7036, salaId:5041, turmaId:6036, turno:'Vespertino', diasSemana:['seg','qua','sex'],             dataInicio:addDias(-7),  dataFim:addDias(65),  status:'ATIVA', unidadeId:1006, instrutorId:3016 },
    { id:7037, salaId:5043, turmaId:6037, turno:'Matutino',   diasSemana:['ter','qui'],                   dataInicio:addDias(4),   dataFim:addDias(95),  status:'ATIVA', unidadeId:1007, instrutorId:3017 },
    { id:7038, salaId:5045, turmaId:6038, turno:'Vespertino', diasSemana:['seg','ter','qua'],             dataInicio:addDias(-9),  dataFim:addDias(110), status:'ATIVA', unidadeId:1008, instrutorId:3018 },
    { id:7039, salaId:5048, turmaId:6039, turno:'Noturno',    diasSemana:['seg','qua'],                   dataInicio:addDias(15),  dataFim:addDias(75),  status:'ATIVA', unidadeId:1009, instrutorId:3019 },
    { id:7040, salaId:5049, turmaId:6040, turno:'Matutino',   diasSemana:['seg','qua','sex'],             dataInicio:addDias(-3),  dataFim:addDias(80),  status:'ATIVA', unidadeId:1010, instrutorId:3020 },
    { id:7041, salaId:5003, turmaId:6001, turno:'Vespertino', diasSemana:['sab'],                         dataInicio:addDias(20),  dataFim:addDias(20),  status:'CANCELADA', unidadeId:1001, instrutorId:3001 },
  ];

  // ── CHAVES (2 por unidade) ───────────────────────────────────────
  const chaves = [
    { id:8001, codigo:'CH-001', salaId:5001, andar:'1º Andar', status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1001 },
    { id:8002, codigo:'CH-002', salaId:5002, andar:'Térreo',   status:'pega',        instrutorId:3001,  pegaEm:new Date(Date.now()-7200000).toISOString(), unidadeId:1001 },
    { id:8003, codigo:'CH-003', salaId:5004, andar:'1º Andar', status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1002 },
    { id:8004, codigo:'CH-004', salaId:5005, andar:'Térreo',   status:'pega',        instrutorId:3002,  pegaEm:new Date(Date.now()-3600000).toISOString(), unidadeId:1002 },
    { id:8005, codigo:'CH-005', salaId:5007, andar:'1º Andar', status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1003 },
    { id:8006, codigo:'CH-006', salaId:5008, andar:'Térreo',   status:'pega',        instrutorId:3003,  pegaEm:new Date(Date.now()-5400000).toISOString(), unidadeId:1003 },
    { id:8007, codigo:'CH-007', salaId:5010, andar:'Térreo',   status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1004 },
    { id:8008, codigo:'CH-008', salaId:5011, andar:'1º Andar', status:'pega',        instrutorId:3004,  pegaEm:new Date(Date.now()-1800000).toISOString(), unidadeId:1004 },
    { id:8009, codigo:'CH-009', salaId:5013, andar:'Térreo',   status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1005 },
    { id:8010, codigo:'CH-010', salaId:5014, andar:'1º Andar', status:'pega',        instrutorId:3005,  pegaEm:new Date(Date.now()-9000000).toISOString(), unidadeId:1005 },
    { id:8011, codigo:'CH-011', salaId:5016, andar:'Térreo',   status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1006 },
    { id:8012, codigo:'CH-012', salaId:5017, andar:'1º Andar', status:'pega',        instrutorId:3006,  pegaEm:new Date(Date.now()-2700000).toISOString(), unidadeId:1006 },
    { id:8013, codigo:'CH-013', salaId:5019, andar:'Térreo',   status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1007 },
    { id:8014, codigo:'CH-014', salaId:5020, andar:'1º Andar', status:'pega',        instrutorId:3007,  pegaEm:new Date(Date.now()-4500000).toISOString(), unidadeId:1007 },
    { id:8015, codigo:'CH-015', salaId:5022, andar:'Térreo',   status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1008 },
    { id:8016, codigo:'CH-016', salaId:5023, andar:'1º Andar', status:'pega',        instrutorId:3008,  pegaEm:new Date(Date.now()-6300000).toISOString(), unidadeId:1008 },
    { id:8017, codigo:'CH-017', salaId:5025, andar:'Térreo',   status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1009 },
    { id:8018, codigo:'CH-018', salaId:5026, andar:'1º Andar', status:'pega',        instrutorId:3009,  pegaEm:new Date(Date.now()-8100000).toISOString(), unidadeId:1009 },
    { id:8019, codigo:'CH-019', salaId:5028, andar:'1º Andar', status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1010 },
    { id:8020, codigo:'CH-020', salaId:5029, andar:'Térreo',   status:'pega',        instrutorId:3010,  pegaEm:new Date(Date.now()-3000000).toISOString(), unidadeId:1010 },
    { id:8021, codigo:'CH-021', salaId:5031, andar:'2º Andar', status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1001 },
    { id:8022, codigo:'CH-022', salaId:5034, andar:'1º Andar', status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1002 },
    { id:8023, codigo:'CH-023', salaId:5035, andar:'1º Andar', status:'pega',        instrutorId:3013,  pegaEm:new Date(Date.now()-1500000).toISOString(), unidadeId:1003 },
    { id:8024, codigo:'CH-024', salaId:5037, andar:'2º Andar', status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1004 },
    { id:8025, codigo:'CH-025', salaId:5039, andar:'Térreo',   status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1005 },
    { id:8026, codigo:'CH-026', salaId:5041, andar:'1º Andar', status:'pega',        instrutorId:3016,  pegaEm:new Date(Date.now()-2100000).toISOString(), unidadeId:1006 },
    { id:8027, codigo:'CH-027', salaId:5043, andar:'1º Andar', status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1007 },
    { id:8028, codigo:'CH-028', salaId:5045, andar:'2º Andar', status:'pega',        instrutorId:3018,  pegaEm:new Date(Date.now()-4200000).toISOString(), unidadeId:1008 },
    { id:8029, codigo:'CH-029', salaId:5048, andar:'1º Andar', status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1009 },
    { id:8030, codigo:'CH-030', salaId:5049, andar:'2º Andar', status:'disponivel',  instrutorId:null,  pegaEm:null, unidadeId:1010 },
  ];

  const notificacoes = [
    { id:9001, tipo:'info', titulo:'Reserva confirmada', msg:'A turma 2025.05.201 foi vinculada a Sala Maker 01.', mensagem:'', paraPerfil:'coordenador', paraId:null, unidadeId:1001, lida:false, criadaEm:new Date(Date.now()-3600000).toISOString() },
    { id:9002, tipo:'aviso', titulo:'Sala em manutencao', msg:'Sala Reuniao 01 esta temporariamente indisponivel.', mensagem:'', paraPerfil:'recepcao', paraId:null, unidadeId:1001, lida:false, criadaEm:new Date(Date.now()-7200000).toISOString() },
    { id:9003, tipo:'ok', titulo:'Solicitacao aprovada', msg:'Uso do Lab Games 01 aprovado para atividade pratica.', mensagem:'', paraPerfil:'instrutor', paraId:3018, unidadeId:1008, lida:false, criadaEm:new Date(Date.now()-10800000).toISOString() },
    { id:9004, tipo:'info', titulo:'Chave retirada', msg:'A chave CH-026 foi retirada para a aula vespertina.', mensagem:'', paraPerfil:'coordenador', paraId:null, unidadeId:1006, lida:true, criadaEm:new Date(Date.now()-14400000).toISOString() },
  ];

  const solicitacoes = [
    { id:10001, salaId:5036, instrutorId:3013, unidadeId:1003, data:addDias(2), turno:'Noturno', motivo:'Aula extra de portfolio fotografico', status:'pendente', criadaEm:new Date(Date.now()-5400000).toISOString() },
    { id:10002, salaId:5046, instrutorId:3018, unidadeId:1008, data:addDias(5), turno:'Matutino', motivo:'Mostra de projetos integradores', status:'aprovada', criadaEm:new Date(Date.now()-9000000).toISOString(), respondidaEm:new Date(Date.now()-3600000).toISOString() },
    { id:10003, salaId:5050, instrutorId:3020, unidadeId:1010, data:addDias(1), turno:'Vespertino', motivo:'Atendimento de mentoria para turma', status:'pendente', criadaEm:new Date(Date.now()-1800000).toISOString() },
    { id:10004, salaId:5047, instrutorId:3019, unidadeId:1009, data:addDias(3), turno:'Vespertino', motivo:'Reposicao de conteudo pratico', status:'recusada', criadaEm:new Date(Date.now()-12600000).toISOString(), respondidaEm:new Date(Date.now()-7200000).toISOString(), resposta:'Sala bloqueada para limpeza tecnica.' },
  ];

  _sv(_K.usuarios,     usuarios);
  _sv(_K.unidades,     unidades);
  _sv(_K.salas,        salas);
  _sv(_K.turmas,       turmas);
  _sv(_K.reservas,     reservas);
  _sv(_K.chaves,       chaves);
  _sv(_K.notificacoes, notificacoes);
  _sv(_K.solicitacoes, solicitacoes);
  localStorage.setItem(_K.init, '1');
}

// ── Leitura ───────────────────────────────────────────────────────
function getUsuarios()             { return [...CACHE.usuarios]; }
function getUsuarioById(id)        { return CACHE.usuarios.find(u => String(u.id) === String(id)) || null; }
function getUserById(id)           { return getUsuarioById(id); }
function getUsersByPerfil(p)       { return CACHE.usuarios.filter(u => u.perfil === lowerPerfil(p)); }
function getUsuariosByPerfil(p)    { return getUsersByPerfil(p); }

function getUnidades()             { return [...CACHE.unidades]; }
function getUnidadeById(id)        { return CACHE.unidades.find(u => String(u.id) === String(id)) || null; }

function getSalas()                { return [...CACHE.salas]; }
function getSalaById(id)           { return CACHE.salas.find(s => String(s.id) === String(id)) || null; }
function getSalasByUnidade(uid)    { return CACHE.salas.filter(s => String(s.unidadeId) === String(uid)); }

function getTurmas()               { return [...CACHE.turmas]; }
function getTurmaById(id)          { return CACHE.turmas.find(t => String(t.id) === String(id)) || null; }

function getReservas()             { return [...CACHE.reservas]; }
function getReservaById(id)        { return CACHE.reservas.find(r => String(r.id) === String(id)) || null; }

function getChaves()               { return [...CACHE.chaves]; }
function getChaveById(id)          { return CACHE.chaves.find(c => String(c.id) === String(id)) || null; }

function getNotifs()               { return [...CACHE.notificacoes]; }
function getNotifsPara(perfil, unidadeId) {
  const sess = getSessao();
  const pn = lowerPerfil(perfil);
  return CACHE.notificacoes.filter(n => {
    if (sess && n.paraId && String(n.paraId) === String(sess.id)) return true;
    if (n.paraPerfil && n.paraPerfil === pn)
      return !n.unidadeId || !unidadeId || String(n.unidadeId) === String(unidadeId);
    return false;
  });
}
function getSolics()               { return [...CACHE.solicitacoes]; }

// ── Login ────────────────────────────────────────────────────────
async function loginUser(email, senha) {
  const u = CACHE.usuarios.find(u =>
    u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
  );
  return u ? { ...u } : null;
}

// ── CRUD Usuários ─────────────────────────────────────────────────
async function addUser(dados) {
  const item = { ...dados, id: _nextId(CACHE.usuarios), perfil: lowerPerfil(dados.perfil) };
  CACHE.usuarios.push(item); _persist('usuarios'); return item;
}
async function addUsuario(d) { return addUser(d); }

async function updUser(id, dados) {
  const idx = CACHE.usuarios.findIndex(u => String(u.id) === String(id));
  if (idx < 0) return null;
  if (dados.perfil) dados.perfil = lowerPerfil(dados.perfil);
  CACHE.usuarios[idx] = { ...CACHE.usuarios[idx], ...dados };
  _persist('usuarios'); return { ...CACHE.usuarios[idx] };
}
async function updUsuario(id, d) { return updUser(id, d); }

async function delUser(id) {
  CACHE.usuarios = CACHE.usuarios.filter(u => String(u.id) !== String(id));
  _persist('usuarios');
}
async function delUsuario(id) { return delUser(id); }

// ── CRUD Unidades ─────────────────────────────────────────────────
function addUnidade(d) {
  const item = { ...d, id: _nextId(CACHE.unidades) };
  CACHE.unidades.push(item); _persist('unidades'); return item;
}
function updUnidade(id, d) {
  const idx = CACHE.unidades.findIndex(u => String(u.id) === String(id));
  if (idx < 0) return null;
  CACHE.unidades[idx] = { ...CACHE.unidades[idx], ...d };
  _persist('unidades'); return { ...CACHE.unidades[idx] };
}
function delUnidade(id) {
  CACHE.unidades = CACHE.unidades.filter(u => String(u.id) !== String(id));
  _persist('unidades');
}

// ── CRUD Salas ────────────────────────────────────────────────────
function addSala(d) {
  const turnos = d.turnosDisponiveis || d.turnos || [];
  const item = { ...d, id: _nextId(CACHE.salas), turnosDisponiveis: turnos, turnos };
  CACHE.salas.push(item); _persist('salas'); return item;
}
function updSala(id, d) {
  const idx = CACHE.salas.findIndex(s => String(s.id) === String(id));
  if (idx < 0) return null;
  const turnos = d.turnosDisponiveis || d.turnos || CACHE.salas[idx].turnosDisponiveis || [];
  CACHE.salas[idx] = { ...CACHE.salas[idx], ...d, turnosDisponiveis: turnos, turnos };
  _persist('salas'); return { ...CACHE.salas[idx] };
}
function updateSala(id, d) { return updSala(id, d); }
function delSala(id) {
  CACHE.salas = CACHE.salas.filter(s => String(s.id) !== String(id));
  _persist('salas');
}
function deleteSala(id) { return delSala(id); }

// ── CRUD Turmas ───────────────────────────────────────────────────
function addTurma(d) {
  const nome = d.codigo || d.nome || '';
  const item = { ...d, id: _nextId(CACHE.turmas), nome, codigo: nome };
  CACHE.turmas.push(item); _persist('turmas'); return item;
}
function updTurma(id, d) {
  const idx = CACHE.turmas.findIndex(t => String(t.id) === String(id));
  if (idx < 0) return null;
  CACHE.turmas[idx] = { ...CACHE.turmas[idx], ...d };
  _persist('turmas'); return { ...CACHE.turmas[idx] };
}
function updateTurma(id, d) { return updTurma(id, d); }
function delTurma(id) {
  CACHE.turmas = CACHE.turmas.filter(t => String(t.id) !== String(id));
  // Cascade: remove reservas ligadas
  CACHE.reservas = CACHE.reservas.filter(r => String(r.turmaId) !== String(id));
  _persist('turmas'); _persist('reservas');
}
function deleteTurma(id) { return delTurma(id); }

// ── CRUD Reservas ─────────────────────────────────────────────────
function addReserva(d) {
  const item = { ...d, id: _nextId(CACHE.reservas), status: d.status || 'ATIVA' };
  CACHE.reservas.push(item); _persist('reservas'); return item;
}
async function addReservaAsync(d) { return addReserva(d); }

function updReserva(id, d) {
  const idx = CACHE.reservas.findIndex(r => String(r.id) === String(id));
  if (idx < 0) return null;
  CACHE.reservas[idx] = { ...CACHE.reservas[idx], ...d };
  _persist('reservas'); return { ...CACHE.reservas[idx] };
}
function delReserva(id) {
  CACHE.reservas = CACHE.reservas.filter(r => String(r.id) !== String(id));
  _persist('reservas');
}
function deleteReserva(id) { return delReserva(id); }

// ── CRUD Chaves ───────────────────────────────────────────────────
function addChave(d) {
  const item = { ...d, id: _nextId(CACHE.chaves), status: d.status || 'disponivel' };
  CACHE.chaves.push(item); _persist('chaves'); return item;
}
function updChave(id, d) {
  const idx = CACHE.chaves.findIndex(c => String(c.id) === String(id));
  if (idx < 0) return null;
  CACHE.chaves[idx] = { ...CACHE.chaves[idx], ...d };
  _persist('chaves'); return { ...CACHE.chaves[idx] };
}
function delChave(id) {
  CACHE.chaves = CACHE.chaves.filter(c => String(c.id) !== String(id));
  _persist('chaves');
}
function deleteChave(id) { return delChave(id); }
function retirarChave(id, instrutorId) {
  return updChave(id, { status: 'pega', instrutorId: Number(instrutorId), pegaEm: new Date().toISOString() });
}
async function retirarChaveAsync(id, instrutorId) { return retirarChave(id, instrutorId); }
function devolverChaveApi(id) {
  return updChave(id, { status: 'disponivel', instrutorId: null, pegaEm: null });
}
async function devolverChaveAsync(id) { return devolverChaveApi(id); }

// ── CRUD Solicitações ─────────────────────────────────────────────
function addSolic(d) {
  const item = { ...d, id: _nextId(CACHE.solicitacoes), status: d.status || 'pendente' };
  CACHE.solicitacoes.push(item); _persist('solicitacoes'); return item;
}
function updSolic(id, d) {
  const idx = CACHE.solicitacoes.findIndex(s => String(s.id) === String(id));
  if (idx < 0) return null;
  CACHE.solicitacoes[idx] = { ...CACHE.solicitacoes[idx], ...d };
  _persist('solicitacoes'); return { ...CACHE.solicitacoes[idx] };
}
async function updSolicAsync(id, d) { return updSolic(id, d); }

// ── CRUD Notificações ─────────────────────────────────────────────
function addNotif(d) {
  const item = {
    id: _nextId(CACHE.notificacoes),
    tipo:        d.tipo || 'info',
    titulo:      d.titulo || d.title || '',
    msg:         d.msg || d.texto || '',
    mensagem:    d.mensagem || '',
    paraPerfil:  lowerPerfil(d.paraPerfil || d.para || ''),
    paraId:      d.paraId ?? d.paraUsuarioId ?? null,
    unidadeId:   d.unidadeId ?? null,
    lida:        false,
    criadaEm:    new Date().toISOString()
  };
  CACHE.notificacoes.push(item); _persist('notificacoes'); return item;
}
async function addNotifAsync(d) { return addNotif(d); }

function countNaoLidas(perfil, unidadeId) {
  return getNotifsPara(perfil, unidadeId).filter(n => !n.lida).length;
}
function marcarTodasLidas(perfil, unidadeId) {
  getNotifsPara(perfil, unidadeId).forEach(n => { n.lida = true; });
  _persist('notificacoes');
}

// ── Override de sala ──────────────────────────────────────────────
function getOverride(salaId, unidadeId) {
  const sala = getSalaById(salaId);
  if (!sala || !sala.statusManual) return null;
  if (unidadeId && sala.unidadeId && String(sala.unidadeId) !== String(unidadeId)) return null;
  return { status: sala.statusManual, motivo: sala.motivoManual || '', por: sala.manualPor || '', criadaEm: sala.manualCriadaEm || null };
}
function setOverride(salaId, unidadeId, status, motivo, por) {
  return updSala(salaId, {
    statusManual: status || null,
    motivoManual: status ? (motivo || '') : '',
    manualPor:    status ? (por || '') : '',
    manualCriadaEm: status ? new Date().toISOString().slice(0, 19) : null,
    unidadeId: unidadeId || undefined
  });
}

// ── Sessão e tema ─────────────────────────────────────────────────
function getSessao() {
  return _getSessaoLocal();
}
function setSessao(u)  { _setSessaoLocal(u); }
function clearSessao() { _clearSessaoLocal(); }

function getTema()  { return localStorage.getItem(_K.tema) || 'light'; }
function initTema() { const t = getTema(); document.documentElement.setAttribute('data-theme', t); return t; }
function toggleTema() {
  const curr = document.documentElement.getAttribute('data-theme') || getTema();
  const next = curr === 'dark' ? 'light' : 'dark';
  localStorage.setItem(_K.tema, next);
  document.documentElement.setAttribute('data-theme', next);
  return next;
}


// ── Utilitários ───────────────────────────────────────────────────
function newId()         { return Date.now() + Math.floor(Math.random() * 9999); }
function hojeISO()       { return new Date().toISOString().split('T')[0]; }
function fmtData(iso)    { if (!iso) return '—'; const p = String(iso).split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : String(iso); }
function formatDate(iso) { return fmtData(iso); }
function esc(s)          { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escapeHtml(s)   { return esc(s); }
function iniciais(nome)  { return String(nome||'').trim().split(/\s+/).slice(0,2).map(p=>p.charAt(0).toUpperCase()).join('')||'SN'; }
function fmtDateTime(v) {
  if (!v) return '—';
  const d = new Date(v); if (isNaN(d.getTime())) return String(v);
  return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}
function calcStatus(turma) {
  if (!turma) return 'encerrada';
  const hoje = hojeISO();
  if (turma.dataFim && hoje > turma.dataFim) return 'encerrada';
  if (turma.dataInicio && hoje < turma.dataInicio) {
    const diff = Math.ceil((new Date(turma.dataInicio+'T00:00:00') - new Date(hoje+'T00:00:00')) / 86400000);
    if (diff >= 0 && diff <= 7) return 'iminente';
    return 'posterior';
  }
  return 'ativa';
}
function labelStatus(st) { return {ativa:'Ativa',iminente:'Iminente',posterior:'Posterior',encerrada:'Encerrada',ocupada:'Ocupada',livre:'Livre'}[st]||String(st||''); }
function htmlStatus(turma) { const st=calcStatus(turma); return '<span class="st st-'+esc(st)+'">'+esc(labelStatus(st))+'</span>'; }

// ── UI helpers ────────────────────────────────────────────────────
function toast(msg, tipo) {
  tipo = tipo || 'info';
  let box = document.getElementById('toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const el = document.createElement('div');
  el.className = 'toast ' + tipo; el.textContent = String(msg || '');
  box.appendChild(el); setTimeout(() => el.remove(), 3200); return el;
}
function showToast(msg, tipo) { return toast(msg, tipo === 'success' ? 'ok' : tipo); }
function fmsg(id, tipo, msg) {
  const el = document.getElementById(id); if (!el) return;
  const css = tipo === 'success' ? 'ok' : (tipo === 'warning' ? 'aviso' : (tipo || 'erro'));
  el.className = (el.className || '').replace(/\b(erro|ok|aviso|error|warning|success)\b/g, '').trim();
  el.classList.add('fmsg', css); el.textContent = String(msg||''); el.style.display = 'block';
}
function fmsgHide(id) {
  const el = document.getElementById(id); if (!el) return;
  el.textContent = ''; el.style.display = 'none';
  el.className = (el.className || '').replace(/\b(erro|ok|aviso|error|warning|success)\b/g, '').trim();
  if (!el.classList.contains('fmsg')) el.classList.add('fmsg');
}
function showMsg(id, tipo, msg) {
  const el = document.getElementById(id); if (!el) return;
  const map = {erro:'error',ok:'success',aviso:'warning',warning:'warning',success:'success',error:'error'};
  el.className = 'form-msg ' + (map[tipo]||'error'); el.textContent = String(msg||''); el.style.display = 'block';
}
function hideMsg(id) {
  const el = document.getElementById(id); if (!el) return;
  el.className = 'form-msg'; el.textContent = ''; el.style.display = 'none';
}
function modalAbrir(id) { const el = document.getElementById(id); if (el) { el.style.display = 'flex'; el.classList.add('on'); } }
function modalFechar(id) { const el = document.getElementById(id); if (el) { el.style.display = 'none'; el.classList.remove('on'); } }

function atualizarSecao(fnName, btn) {
  const acao = window[fnName];
  if (typeof acao !== 'function') {
    toast('Atualizacao indisponivel nesta tela.', 'erro');
    console.warn('[Atualizar] Funcao nao encontrada:', fnName);
    return false;
  }

  const labelOriginal = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.classList.add('is-refreshing');
    btn.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Atualizando';
  }

  const finalizar = () => {
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove('is-refreshing');
    btn.innerHTML = labelOriginal;
  };
  const atualizarIndicadores = () => {
    try {
      if (typeof window._atualizarBadge === 'function') window._atualizarBadge();
      if (typeof window._atualizarBadges === 'function') window._atualizarBadges();
    } catch (err) {
      console.warn('[Atualizar] Indicadores nao atualizados:', err);
    }
  };

  try {
    _load();
    const result = acao();
    if (result && typeof result.then === 'function') {
      result
        .then(() => {
          atualizarIndicadores();
          toast('Dados atualizados.', 'ok');
        })
        .catch(err => {
          console.error('[Atualizar]', err);
          toast('Nao foi possivel atualizar.', 'erro');
        })
        .finally(finalizar);
    } else {
      atualizarIndicadores();
      toast('Dados atualizados.', 'ok');
      setTimeout(finalizar, 220);
    }
  } catch (err) {
    console.error('[Atualizar]', err);
    toast('Nao foi possivel atualizar.', 'erro');
    finalizar();
  }

  return false;
}

// ── initDados e loadAllData (mantém assinatura async) ────────────
async function loadAllData(force = false) {
  if (!CACHE.loaded || force) {
    _seedDados();
    _load();
    CACHE.loaded = true;
  }
  return CACHE;
}
async function initDados(force = false) {
  await loadAllData(force);
  console.log('%c<i class="ph ph-check-circle"></i> storage.js — dados carregados do localStorage', 'color:#10b981;font-weight:bold');
  return CACHE;
}

// ── Expor tudo no window (igual ao api.js) ────────────────────────
Object.assign(window, {
  // Usuários
  getUsuarios, getUsuarioById, getUserById, getUsersByPerfil, getUsuariosByPerfil,
  addUser, addUsuario, updUser, updUsuario, delUser, delUsuario,
  // Unidades
  getUnidades, getUnidadeById, addUnidade, updUnidade, delUnidade,
  // Salas
  getSalas, getSalaById, getSalasByUnidade, addSala, updSala, updateSala, delSala, deleteSala,
  // Turmas
  getTurmas, getTurmaById, addTurma, updTurma, updateTurma, delTurma, deleteTurma,
  // Reservas
  getReservas, getReservaById, addReserva, addReservaAsync, updReserva, delReserva, deleteReserva,
  // Chaves
  getChaves, getChaveById, addChave, updChave, delChave, deleteChave, retirarChave, retirarChaveAsync, devolverChaveApi, devolverChaveAsync,
  // Solicitações
  getSolics, addSolic, updSolic, updSolicAsync,
  // Notificações
  getNotifs, getNotifsPara, addNotif, addNotifAsync, countNaoLidas, marcarTodasLidas,
  // Override
  getOverride, setOverride,
  // Sessão e tema
  getSessao, setSessao, clearSessao, getTema, initTema, toggleTema,
  // Init
  initDados, loadAllData,
  // Utilitários
  newId, hojeISO, fmtData, formatDate, esc, escapeHtml, iniciais, fmtDateTime,
  calcStatus, labelStatus, htmlStatus,
  // UI
  toast, showToast, fmsg, fmsgHide, showMsg, hideMsg, modalAbrir, modalFechar,
  atualizarSecao,
  // CACHE (para leitura de depuração)
  CACHE
});

console.log('%c<i class="ph ph-check-circle"></i> storage.js carregado — modo localStorage ativo', 'color:#10b981;font-weight:bold');
