import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Usuario, Unidade, Sala, Turma, Reserva, Chave,
  Solicitacao, Notificacao, Sessao, Turno, DiaSemana, StatusTurma
} from '@/types';

// Chaves do AsyncStorage
const K = {
  usuarios:     '@sn_usuarios',
  unidades:     '@sn_unidades',
  salas:        '@sn_salas',
  turmas:       '@sn_turmas',
  reservas:     '@sn_reservas',
  chaves:       '@sn_chaves',
  notificacoes: '@sn_notificacoes',
  solicitacoes: '@sn_solicitacoes',
  sessao:       '@sn_sessao',
  init:         '@sn_init_v1',
};

// Cache em memoria — carregado uma vez no boot
type Cache = {
  usuarios: Usuario[]; unidades: Unidade[]; salas: Sala[]; turmas: Turma[];
  reservas: Reserva[]; chaves: Chave[]; notificacoes: Notificacao[];
  solicitacoes: Solicitacao[];
};

const CACHE: Cache = {
  usuarios: [], unidades: [], salas: [], turmas: [],
  reservas: [], chaves: [], notificacoes: [], solicitacoes: [],
};

let loaded = false;

const DIAS_VALIDOS: DiaSemana[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

// ==== Helpers privados ====
async function _load<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch (e) { 
    console.error(`Erro ao carregar ${key}:`, e);
    return []; 
  }
}

// Sanitiza registros corrompidos: remove null/invalidos de arrays de dias
function _sanitizarReservas(reservas: Reserva[]): Reserva[] {
  return reservas.map(r => {
    if (!Array.isArray(r.diasSemana)) return { ...r, diasSemana: [] };
    const dias = r.diasSemana.filter(
      (d): d is DiaSemana => d != null && DIAS_VALIDOS.includes(d as DiaSemana)
    );
    return dias.length === r.diasSemana.length ? r : { ...r, diasSemana: dias };
  });
}

function _sanitizarSolics(solics: Solicitacao[]): Solicitacao[] {
  return solics.map(s => {
    if (!Array.isArray(s.diasSemana)) return s;
    const dias = s.diasSemana.filter(
      (d): d is DiaSemana => d != null && DIAS_VALIDOS.includes(d as DiaSemana)
    );
    return dias.length === (s.diasSemana?.length ?? 0) ? s : { ...s, diasSemana: dias };
  });
}
async function _save<T>(key: string, val: T[]): Promise<void> {
  try { 
    const json = JSON.stringify(val);
    await AsyncStorage.setItem(key, json);
  } catch (e) { 
    console.error(`Erro ao salvar ${key}:`, e);
    throw e;
  }
}
function _nextId<T extends { id: number }>(list: T[]): number {
  return list.reduce((mx, x) => Math.max(mx, x.id || 0), 0) + 1;
}

// ==== Seed inicial ====
async function seed(): Promise<void> {
  const done = await AsyncStorage.getItem(K.init);
  if (done) return;

  const hoje = new Date();
  const iso = (d: Date): string => d.toISOString().split('T')[0];
  const addDias = (n: number): string => {
    const d = new Date(hoje); d.setDate(d.getDate() + n); return iso(d);
  };

  const unidades: Unidade[] = [
    { id: 1001, nome: 'SENAC Asa Norte',   cep: '70750-500', cidade: 'Brasilia/DF',   endereco: 'SCS Q.3 Bl.A' },
    { id: 1002, nome: 'SENAC Taguatinga',  cep: '72015-900', cidade: 'Taguatinga/DF', endereco: 'QS 1 Rua 210' },
    { id: 1003, nome: 'SENAC Ceilandia',   cep: '72220-270', cidade: 'Ceilandia/DF',  endereco: 'Setor O Qd.602' },
    { id: 1004, nome: 'SENAC Gama',        cep: '72405-080', cidade: 'Gama/DF',       endereco: 'St. Central' },
    { id: 1005, nome: 'SENAC Sobradinho',  cep: '73025-500', cidade: 'Sobradinho/DF', endereco: 'Conj.7' },
  ];

  const usuarios: Usuario[] = [
    { id: 1,    nome: 'Administrador SENAC', email: 'senac_gdf@hotmail.com',       senha: 'Senac.DF2007', perfil: 'admin',       unidadeId: 1001 },
    { id: 2001, nome: 'Ana Paula Ferreira',  email: 'coord.asanorte@senacdf.com',  senha: 'Coord@123',    perfil: 'coordenador', unidadeId: 1001 },
    { id: 2002, nome: 'Bruno Mendes',        email: 'coord.taguatinga@senacdf.com',senha: 'Coord@123',    perfil: 'coordenador', unidadeId: 1002 },
    { id: 3001, nome: 'Katia Regina Barros', email: 'katia.barros@senacdf.com',    senha: 'Inst@123',     perfil: 'instrutor',   unidadeId: 1001 },
    { id: 3002, nome: 'Leonardo Cruz',       email: 'leonardo.cruz@senacdf.com',   senha: 'Inst@123',     perfil: 'instrutor',   unidadeId: 1002 },
    { id: 3003, nome: 'Aline Moraes',        email: 'aline.moraes@senacdf.com',    senha: 'Inst@123',     perfil: 'instrutor',   unidadeId: 1001 },
    { id: 4001, nome: 'Ursula Campos',       email: 'recep.asanorte@senacdf.com',  senha: 'Recep@123',    perfil: 'recepcao',    unidadeId: 1001 },
    { id: 4002, nome: 'Vinicius Cardoso',    email: 'recep.taguatinga@senacdf.com',senha: 'Recep@123',    perfil: 'recepcao',    unidadeId: 1002 },
  ];

  const turnosAll: Turno[] = ['Matutino', 'Vespertino', 'Noturno'];
  const salas: Sala[] = [
    { id: 5001, nome: 'Lab Informatica 01', tipo: 'Laboratorio', capacidade: 30, andar: '1o Andar', bloco: 'Bloco A', turnosDisponiveis: turnosAll,               unidadeId: 1001 },
    { id: 5002, nome: 'Sala Gastronomia',   tipo: 'Cozinha',     capacidade: 20, andar: 'Terreo',   bloco: 'Bloco B', turnosDisponiveis: ['Matutino','Vespertino'],unidadeId: 1001 },
    { id: 5003, nome: 'Auditorio Principal',tipo: 'Auditorio',   capacidade: 80, andar: 'Terreo',   bloco: 'Bloco A', turnosDisponiveis: turnosAll,               unidadeId: 1001 },
    { id: 5004, nome: 'Sala Maker 01',      tipo: 'Lab Maker',   capacidade: 24, andar: '2o Andar', bloco: 'Bloco C', turnosDisponiveis: ['Matutino','Vespertino'],unidadeId: 1001 },
    { id: 5005, nome: 'Lab Redes 01',       tipo: 'Laboratorio', capacidade: 24, andar: '2o Andar', bloco: 'Bloco B', turnosDisponiveis: turnosAll,               unidadeId: 1002 },
    { id: 5006, nome: 'Sala Idiomas 01',    tipo: 'Sala Comum',  capacidade: 30, andar: '1o Andar', bloco: 'Bloco A', turnosDisponiveis: ['Matutino','Vespertino'],unidadeId: 1002 },
  ];

  const turmas: Turma[] = [
    { id: 6001, codigo: '2025.04.101', nome: '2025.04.101', curso: 'Tecnico em Informatica', turno: 'Matutino',   dataInicio: addDias(-30), dataFim: addDias(150), instrutorId: 3001, unidadeId: 1001 },
    { id: 6002, codigo: '2025.04.102', nome: '2025.04.102', curso: 'Gastronomia Basica',     turno: 'Vespertino', dataInicio: addDias(-10), dataFim: addDias(80),  instrutorId: 3001, unidadeId: 1001 },
    { id: 6003, codigo: '2025.04.103', nome: '2025.04.103', curso: 'Gestao de Pessoas',      turno: 'Noturno',    dataInicio: addDias(5),   dataFim: addDias(120), instrutorId: 3003, unidadeId: 1001 },
    { id: 6004, codigo: '2025.04.104', nome: '2025.04.104', curso: 'Redes de Computadores',  turno: 'Matutino',   dataInicio: addDias(-20), dataFim: addDias(100), instrutorId: 3002, unidadeId: 1002 },
  ];

  const reservas: Reserva[] = [
    { id: 7001, salaId: 5001, turmaId: 6001, turno: 'Matutino',   diasSemana: ['seg','ter','qua','qui','sex'], dataInicio: addDias(-30), dataFim: addDias(150), unidadeId: 1001, instrutorId: 3001 },
    { id: 7002, salaId: 5002, turmaId: 6002, turno: 'Vespertino', diasSemana: ['seg','qua','sex'],             dataInicio: addDias(-10), dataFim: addDias(80),  unidadeId: 1001, instrutorId: 3001 },
    { id: 7003, salaId: 5003, turmaId: 6003, turno: 'Noturno',    diasSemana: ['ter','qui'],                   dataInicio: addDias(5),   dataFim: addDias(120), unidadeId: 1001, instrutorId: 3003 },
    { id: 7004, salaId: 5005, turmaId: 6004, turno: 'Matutino',   diasSemana: ['seg','ter','qua','qui','sex'], dataInicio: addDias(-20), dataFim: addDias(100), unidadeId: 1002, instrutorId: 3002 },
  ];

  const chaves: Chave[] = [
    { id: 8001, codigo: 'CH-001', salaId: 5001, andar: '1o Andar', status: 'disponivel', instrutorId: null, pegaEm: null,                                       unidadeId: 1001 },
    { id: 8002, codigo: 'CH-002', salaId: 5002, andar: 'Terreo',   status: 'pega',       instrutorId: 3001, pegaEm: new Date(Date.now() - 7200000).toISOString(),unidadeId: 1001 },
    { id: 8003, codigo: 'CH-003', salaId: 5003, andar: 'Terreo',   status: 'disponivel', instrutorId: null, pegaEm: null,                                       unidadeId: 1001 },
    { id: 8004, codigo: 'CH-004', salaId: 5004, andar: '2o Andar', status: 'disponivel', instrutorId: null, pegaEm: null,                                       unidadeId: 1001 },
    { id: 8005, codigo: 'CH-005', salaId: 5005, andar: '2o Andar', status: 'disponivel', instrutorId: null, pegaEm: null,                                       unidadeId: 1002 },
  ];

  const notificacoes: Notificacao[] = [
    { id: 9001, tipo: 'info',    titulo: 'Bem-vindo!',            msg: 'Sistema iniciado com sucesso.',              paraPerfil: 'coordenador', paraId: null, unidadeId: 1001, lida: false, criadaEm: new Date().toISOString() },
    { id: 9002, tipo: 'aprovada',titulo: 'Solicitacao aprovada', msg: 'Sua reserva foi aprovada.',                  paraPerfil: 'instrutor',   paraId: 3001, unidadeId: 1001, lida: false, criadaEm: new Date(Date.now() - 3600000).toISOString() },
  ];

  const solicitacoes: Solicitacao[] = [
    { id: 10001, salaId: 5003, instrutorId: 3001, unidadeId: 1001, data: addDias(2), turnos: ['Noturno'], motivo: 'Aula extra de portfolio', status: 'pendente', criadaEm: new Date(Date.now() - 5400000).toISOString() },
  ];

  await Promise.all([
    _save(K.usuarios, usuarios),
    _save(K.unidades, unidades),
    _save(K.salas, salas),
    _save(K.turmas, turmas),
    _save(K.reservas, reservas),
    _save(K.chaves, chaves),
    _save(K.notificacoes, notificacoes),
    _save(K.solicitacoes, solicitacoes),
  ]);
  await AsyncStorage.setItem(K.init, '1');
}

// ==== Inicializacao ====
export async function initDados(force = false): Promise<void> {
  if (loaded && !force) return;
  
  if (force) {
    console.log('Carregando dados (force=true)...');
    loaded = false; // Reset do estado carregado
  }
  
  await seed();
  const [us, un, sa, tu, re, ch, no, so] = await Promise.all([
    _load<Usuario>(K.usuarios),
    _load<Unidade>(K.unidades),
    _load<Sala>(K.salas),
    _load<Turma>(K.turmas),
    _load<Reserva>(K.reservas),
    _load<Chave>(K.chaves),
    _load<Notificacao>(K.notificacoes),
    _load<Solicitacao>(K.solicitacoes),
  ]);
  
  CACHE.usuarios     = us.length > 0 ? us : CACHE.usuarios;
  CACHE.unidades     = un.length > 0 ? un : CACHE.unidades;
  CACHE.salas        = sa.length > 0 ? sa : CACHE.salas;
  CACHE.turmas       = tu.length > 0 ? tu : CACHE.turmas;
  CACHE.reservas     = re.length > 0 ? _sanitizarReservas(re) : CACHE.reservas;
  CACHE.chaves       = ch.length > 0 ? ch : CACHE.chaves;
  CACHE.notificacoes = no.length > 0 ? no : CACHE.notificacoes;
  CACHE.solicitacoes = so.length > 0 ? _sanitizarSolics(so) : CACHE.solicitacoes;
  loaded = true;
  
  console.log(`Dados carregados: ${CACHE.usuarios.length} users, ${CACHE.unidades.length} unidades`);
}

export async function resetarTudo(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(K));
  loaded = false;
  await initDados();
}

// ==== Sessao ====
export async function getSessao(): Promise<Sessao | null> {
  try {
    const raw = await AsyncStorage.getItem(K.sessao);
    return raw ? (JSON.parse(raw) as Sessao) : null;
  } catch { return null; }
}
export async function setSessao(u: Sessao): Promise<void> {
  await AsyncStorage.setItem(K.sessao, JSON.stringify(u));
}
export async function clearSessao(): Promise<void> {
  await AsyncStorage.removeItem(K.sessao);
}

// ==== Login ====
export async function loginUser(email: string, senha: string): Promise<Usuario | null> {
  const u = CACHE.usuarios.find(u =>
    u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
  );
  return u ?? null;
}

// ==== Leituras ====
export const getUnidades   = (): Unidade[] => [...CACHE.unidades];
export const getUnidadeById = (id: number | null | undefined): Unidade | null =>
  id ? (CACHE.unidades.find(u => u.id === id) ?? null) : null;
export const getUsuarios   = (): Usuario[] => [...CACHE.usuarios];
export const getUserById   = (id: number | null | undefined): Usuario | null =>
  id ? (CACHE.usuarios.find(u => u.id === id) ?? null) : null;
export const getUsersByPerfil = (p: string): Usuario[] =>
  CACHE.usuarios.filter(u => u.perfil === p);
export const getSalas         = (): Sala[] => [...CACHE.salas];
export const getSalaById      = (id: number | null): Sala | null =>
  id ? (CACHE.salas.find(s => s.id === id) ?? null) : null;
export const getSalasByUnidade = (uid: number | null): Sala[] =>
  uid ? CACHE.salas.filter(s => s.unidadeId === uid) : [];
export const getTurmas    = (): Turma[] => [...CACHE.turmas];
export const getTurmaById = (id: number | null | undefined): Turma | null =>
  id ? (CACHE.turmas.find(t => t.id === id) ?? null) : null;
export const getReservas  = (): Reserva[] => [...CACHE.reservas];
export const getReservaById = (id: number | null | undefined): Reserva | null =>
  id ? (CACHE.reservas.find(r => r.id === id) ?? null) : null;
export const getChaves    = (): Chave[] => [...CACHE.chaves];
export const getChaveById = (id: number): Chave | null =>
  CACHE.chaves.find(c => c.id === id) ?? null;
export const getSolics    = (): Solicitacao[] => [...CACHE.solicitacoes];
export const getNotifs    = (): Notificacao[] => [...CACHE.notificacoes];

export function getNotifsPara(perfil: string, unidadeId: number | null, userId?: number): Notificacao[] {
  return CACHE.notificacoes.filter(n => {
    if (userId && n.paraId && n.paraId === userId) return true;
    if (n.paraPerfil === perfil)
      return !n.unidadeId || !unidadeId || n.unidadeId === unidadeId;
    return false;
  });
}
export function countNaoLidas(perfil: string, unidadeId: number | null, userId?: number): number {
  return getNotifsPara(perfil, unidadeId, userId).filter(n => !n.lida).length;
}

// ==== CRUD Usuarios ====
export async function addUser(d: Omit<Usuario, 'id'>): Promise<Usuario> {
  const item: Usuario = { ...d, id: _nextId(CACHE.usuarios) };
  CACHE.usuarios.push(item);
  await _save(K.usuarios, CACHE.usuarios);
  return item;
}
export async function updUser(id: number, d: Partial<Usuario>): Promise<Usuario | null> {
  const idx = CACHE.usuarios.findIndex(u => u.id === id);
  if (idx < 0) return null;
  CACHE.usuarios[idx] = { ...CACHE.usuarios[idx], ...d };
  await _save(K.usuarios, CACHE.usuarios);
  return CACHE.usuarios[idx];
}
export async function delUser(id: number): Promise<void> {
  const antes = CACHE.usuarios.length;
  CACHE.usuarios = CACHE.usuarios.filter(u => u.id !== id);
  const depois = CACHE.usuarios.length;
  console.log(`Deletado user ${id}: ${antes} → ${depois}`);
  await _save(K.usuarios, CACHE.usuarios);
}

// ==== CRUD Unidades ====
export async function addUnidade(d: Omit<Unidade, 'id'>): Promise<Unidade> {
  const item: Unidade = { ...d, id: _nextId(CACHE.unidades) };
  CACHE.unidades.push(item);
  await _save(K.unidades, CACHE.unidades);
  return item;
}
export async function updUnidade(id: number, d: Partial<Unidade>): Promise<void> {
  const idx = CACHE.unidades.findIndex(u => u.id === id);
  if (idx < 0) return;
  CACHE.unidades[idx] = { ...CACHE.unidades[idx], ...d };
  await _save(K.unidades, CACHE.unidades);
}
export async function delUnidade(id: number): Promise<void> {
  const antes = CACHE.unidades.length;
  CACHE.unidades = CACHE.unidades.filter(u => u.id !== id);
  const depois = CACHE.unidades.length;
  console.log(`Deletada unidade ${id}: ${antes} → ${depois}`);
  await _save(K.unidades, CACHE.unidades);
}

// ==== CRUD Salas ====
export async function addSala(d: Omit<Sala, 'id'>): Promise<Sala> {
  const item: Sala = { ...d, id: _nextId(CACHE.salas) };
  CACHE.salas.push(item);
  await _save(K.salas, CACHE.salas);
  return item;
}
export async function updSala(id: number, d: Partial<Sala>): Promise<void> {
  const idx = CACHE.salas.findIndex(s => s.id === id);
  if (idx < 0) return;
  CACHE.salas[idx] = { ...CACHE.salas[idx], ...d };
  await _save(K.salas, CACHE.salas);
}
export async function delSala(id: number): Promise<void> {
  CACHE.salas = CACHE.salas.filter(s => s.id !== id);
  await _save(K.salas, CACHE.salas);
}

// ==== CRUD Turmas ====
export async function addTurma(d: Omit<Turma, 'id'>): Promise<Turma> {
  const item: Turma = { ...d, id: _nextId(CACHE.turmas) };
  CACHE.turmas.push(item);
  await _save(K.turmas, CACHE.turmas);
  return item;
}
export async function updTurma(id: number, d: Partial<Turma>): Promise<void> {
  const idx = CACHE.turmas.findIndex(t => t.id === id);
  if (idx < 0) return;
  CACHE.turmas[idx] = { ...CACHE.turmas[idx], ...d };
  await _save(K.turmas, CACHE.turmas);
}
export async function delTurma(id: number): Promise<void> {
  CACHE.turmas = CACHE.turmas.filter(t => t.id !== id);
  CACHE.reservas = CACHE.reservas.filter(r => r.turmaId !== id);
  await _save(K.turmas, CACHE.turmas);
  await _save(K.reservas, CACHE.reservas);
}

// ==== CRUD Reservas ====
export async function addReserva(d: Omit<Reserva, 'id'>): Promise<Reserva> {
  const item: Reserva = { ...d, id: _nextId(CACHE.reservas) };
  CACHE.reservas.push(item);
  await _save(K.reservas, CACHE.reservas);
  return item;
}
export async function updReserva(id: number, d: Partial<Reserva>): Promise<void> {
  const idx = CACHE.reservas.findIndex(r => r.id === id);
  if (idx < 0) return;
  CACHE.reservas[idx] = { ...CACHE.reservas[idx], ...d };
  await _save(K.reservas, CACHE.reservas);
}
export async function delReserva(id: number): Promise<void> {
  CACHE.reservas = CACHE.reservas.filter(r => r.id !== id);
  await _save(K.reservas, CACHE.reservas);
}

// ==== Conflito de reservas (espelha verificarConflito do web) ====
export function verificarConflito(
  nova: { salaId: number; turno: Turno; diasSemana: DiaSemana[]; dataInicio: string; dataFim: string },
  ignorarId: number | null = null
): string | null {
  const reservas = CACHE.reservas.filter(r => r.id !== ignorarId);
  for (const r of reservas) {
    if (r.salaId !== nova.salaId) continue;
    if (r.turno !== nova.turno) continue;

    const semSobreposicao = nova.dataFim < r.dataInicio || r.dataFim < nova.dataInicio;
    if (semSobreposicao) continue;

    const diasComuns = nova.diasSemana.filter(d => r.diasSemana.includes(d));
    if (diasComuns.length > 0) {
      const sala = getSalaById(r.salaId);
      const turma = r.turmaId ? getTurmaById(r.turmaId) : null;
      const diasStr = diasComuns.map(d => d.toUpperCase()).join(', ');
      return `Conflito! "${sala?.nome ?? '?'}" ja esta ocupada no ${r.turno} (${diasStr}) por "${turma?.nome ?? 'Sem turma'}".`;
    }
  }
  return null;
}

// ==== CRUD Chaves ====
export async function addChave(d: Omit<Chave, 'id'>): Promise<Chave> {
  const item: Chave = { ...d, id: _nextId(CACHE.chaves) };
  CACHE.chaves.push(item);
  await _save(K.chaves, CACHE.chaves);
  return item;
}
export async function updChave(id: number, d: Partial<Chave>): Promise<Chave | null> {
  const idx = CACHE.chaves.findIndex(c => c.id === id);
  if (idx < 0) return null;
  CACHE.chaves[idx] = { ...CACHE.chaves[idx], ...d };
  await _save(K.chaves, CACHE.chaves);
  return CACHE.chaves[idx];
}
export async function delChave(id: number): Promise<void> {
  CACHE.chaves = CACHE.chaves.filter(c => c.id !== id);
  await _save(K.chaves, CACHE.chaves);
}
export async function retirarChave(id: number, instrutorId: number): Promise<Chave | null> {
  const resp = getUserById(instrutorId);
  const chave = getChaveById(id);
  if (!resp || !chave || resp.unidadeId !== chave.unidadeId) return null;
  return updChave(id, { status: 'pega', instrutorId, pegaEm: new Date().toISOString() });
}
export async function devolverChave(id: number): Promise<Chave | null> {
  return updChave(id, { status: 'disponivel', instrutorId: null, pegaEm: null });
}

// ==== CRUD Solicitacoes ====
export async function addSolic(d: Omit<Solicitacao, 'id'>): Promise<Solicitacao> {
  const item: Solicitacao = { ...d, id: _nextId(CACHE.solicitacoes) };
  CACHE.solicitacoes.push(item);
  await _save(K.solicitacoes, CACHE.solicitacoes);
  return item;
}
export async function updSolic(id: number, d: Partial<Solicitacao>): Promise<void> {
  const idx = CACHE.solicitacoes.findIndex(s => s.id === id);
  if (idx < 0) return;
  CACHE.solicitacoes[idx] = { ...CACHE.solicitacoes[idx], ...d };
  await _save(K.solicitacoes, CACHE.solicitacoes);
}

// ==== CRUD Notificacoes ====
export async function addNotif(d: Omit<Notificacao, 'id' | 'lida' | 'criadaEm'>): Promise<Notificacao> {
  const item: Notificacao = {
    ...d,
    id: _nextId(CACHE.notificacoes),
    lida: false,
    criadaEm: new Date().toISOString(),
  };
  CACHE.notificacoes.push(item);
  await _save(K.notificacoes, CACHE.notificacoes);
  return item;
}
export async function marcarTodasLidas(perfil: string, unidadeId: number | null, userId?: number): Promise<void> {
  getNotifsPara(perfil, unidadeId, userId).forEach(n => { n.lida = true; });
  await _save(K.notificacoes, CACHE.notificacoes);
}

// ==== Utilitarios ====
export function calcStatus(turma: Turma | null): StatusTurma {
  if (!turma) return 'encerrada';
  const hoje = new Date().toISOString().split('T')[0];
  if (turma.dataFim && hoje > turma.dataFim) return 'encerrada';
  if (turma.dataInicio && hoje < turma.dataInicio) {
    const diff = Math.ceil(
      (new Date(turma.dataInicio + 'T00:00:00').getTime() -
       new Date(hoje + 'T00:00:00').getTime()) / 86400000
    );
    if (diff >= 0 && diff <= 7) return 'iminente';
    return 'posterior';
  }
  return 'ativa';
}
export function fmtData(iso: string | null | undefined): string {
  if (!iso) return '-';
  const p = iso.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
}
export function fmtDiasSemana(dias: Array<string | null | undefined> | null | undefined): string {
  if (!Array.isArray(dias)) return '';
  const validos = dias.filter((d): d is string => d != null && d.trim() !== '');
  return validos.map(d => d.toUpperCase()).join(', ');
}
export function fmtDateTime(v: string | null | undefined): string {
  if (!v) return '-';
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
export function iniciais(nome: string): string {
  return nome.trim().split(/\s+/).slice(0, 2)
    .map(p => p.charAt(0).toUpperCase()).join('') || 'SN';
}
export function diaDaSemana(iso: string): DiaSemana {
  const p = iso.split('-').map(Number);
  return (['dom','seg','ter','qua','qui','sex','sab'] as DiaSemana[])[
    new Date(p[0], p[1] - 1, p[2]).getDay()
  ];
}
export function hojeISO(): string {
  return new Date().toISOString().split('T')[0];
}
