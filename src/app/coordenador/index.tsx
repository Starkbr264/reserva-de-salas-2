import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/constants/colors';
import { useRequirePerfil, useAuth } from '@/hooks/useAuth';
import { ScreenShell } from '@/components/ScreenShell';
import { SalaCard } from '@/components/SalaCard';
import { Card, Badge, StatusPill, Button, EmptyState, SearchBar } from '@/components/ui';
import { calcSalaInfo } from '@/utils/salaStatus';
import * as db from '@/services/storage';
import { Sala, Reserva, Solicitacao, Notificacao } from '@/types';

const TABS = [
  { key: 'dashboard',    label: 'Painel',        icon: 'grid-outline' as const },
  { key: 'mapa',         label: 'Mapa',          icon: 'map-outline' as const },
  { key: 'reservas',     label: 'Reservas',      icon: 'calendar-outline' as const },
  { key: 'solicitacoes', label: 'Solicitacoes',  icon: 'clipboard-outline' as const },
  { key: 'notifs',       label: 'Avisos',        icon: 'notifications-outline' as const },
];

const matchBusca = (busca: string, ...valores: Array<string | number | null | undefined>) => {
  const q = busca.trim().toLowerCase();
  if (!q) return true;
  return valores.some(v => String(v ?? '').toLowerCase().includes(q));
};

export default function CoordenadorPanel() {
  const { sessao, pronto } = useRequirePerfil('coordenador');
  const { sair } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  const uid = sessao?.unidadeId ?? null;
  const recarregar = useCallback(async () => {
    setRefreshing(true);
    await db.initDados(true);
    setTick(t => t + 1);
    setRefreshing(false);
  }, []);

  const pendentes = pronto ? db.getSolics().filter(s => s.unidadeId === uid && s.status === 'pendente').length : 0;
  const naoLidas  = pronto ? db.countNaoLidas('coordenador', uid) : 0;

  const tabs = TABS.map(t => ({
    ...t,
    badge: t.key === 'solicitacoes' ? pendentes : t.key === 'notifs' ? naoLidas : undefined,
  }));

  if (!pronto) return <Loading />;

  const meta: Record<string, { t: string; s: string }> = {
    dashboard:    { t: 'Painel', s: 'Visao geral da unidade' },
    mapa:         { t: 'Mapa de Salas', s: 'Ocupacao atual das salas' },
    reservas:     { t: 'Reservas', s: 'Reservas recorrentes de salas' },
    solicitacoes: { t: 'Solicitacoes', s: 'Pedidos de sala dos instrutores' },
    notifs:       { t: 'Notificacoes', s: 'Avisos recebidos' },
  };

  return (
    <ScreenShell
      sessao={sessao} perfilLabel="Coordenador"
      title={meta[tab].t} subtitle={meta[tab].s}
      tabs={tabs} activeTab={tab} onTabChange={setTab}
      onLogout={sair} onRefresh={recarregar} refreshing={refreshing}
    >
      {tab === 'dashboard'    && <Dashboard uid={uid} key={`d${tick}`} />}
      {tab === 'mapa'         && <Mapa uid={uid} key={`m${tick}`} />}
      {tab === 'reservas'     && <Reservas uid={uid} onChange={recarregar} key={`r${tick}`} />}
      {tab === 'solicitacoes' && <Solicitacoes uid={uid} sessaoId={sessao!.id} onChange={recarregar} key={`s${tick}`} />}
      {tab === 'notifs'       && <Notificacoes uid={uid} key={`n${tick}`} />}
    </ScreenShell>
  );
}

function Loading() {
  return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;
}

// ---- Dashboard ----
function Dashboard({ uid }: { uid: number | null }) {
  const salas  = db.getSalasByUnidade(uid);
  const turmas = db.getTurmas().filter(t => t.unidadeId === uid);
  const res    = db.getReservas().filter(r => r.unidadeId === uid);
  const solic  = db.getSolics().filter(s => s.unidadeId === uid && s.status === 'pendente');
  const ativas = turmas.filter(t => db.calcStatus(t) === 'ativa').length;

  const stats = [
    { label: 'Salas',           valor: salas.length,  icon: 'business' },
    { label: 'Turmas ativas',   valor: ativas,        icon: 'school' },
    { label: 'Reservas',        valor: res.length,    icon: 'calendar' },
    { label: 'Solic. pendentes',valor: solic.length,  icon: 'clipboard' },
  ];

  return (
    <View>
      <View style={styles.statsGrid}>
        {stats.map(s => (
          <Card key={s.label} style={styles.statCard}>
            <Text style={styles.statValor}>{s.valor}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>

      <Text style={styles.blockTitle}>Turmas recentes</Text>
      {turmas.slice(0, 6).map(t => {
        const inst = t.instrutorId ? db.getUserById(t.instrutorId) : null;
        return (
          <Card key={t.id} style={{ marginBottom: 10 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.turmaCodigo}>{t.nome}</Text>
              <StatusPill status={db.calcStatus(t)} />
            </View>
            <Text style={styles.turmaCurso}>{t.curso}</Text>
            <Text style={styles.turmaMeta}>{inst?.nome ?? '-'} · {db.fmtData(t.dataInicio)} a {db.fmtData(t.dataFim)}</Text>
          </Card>
        );
      })}
      {!turmas.length && <EmptyState icon="school-outline" text="Nenhuma turma cadastrada." />}
    </View>
  );
}

// ---- Mapa ----
function Mapa({ uid }: { uid: number | null }) {
  const [busca, setBusca] = useState('');
  const salas = db.getSalasByUnidade(uid).filter(s => matchBusca(busca, s.nome, s.tipo, s.andar, s.bloco, s.capacidade, s.turnosDisponiveis.join(' ')));
  const hoje = db.hojeISO();
  const infos = salas.map(s => ({ sala: s, info: calcSalaInfo(s, hoje) }));
  const livres = infos.filter(i => i.info.stat === 'livre').length;
  const ocupadas = infos.filter(i => i.info.stat === 'ocupada').length;
  const iminentes = infos.filter(i => i.info.stat === 'iminente').length;

  return (
    <View>
      <SearchBar value={busca} onChangeText={setBusca} placeholder="Pesquisar salas" />
      <View style={styles.legenda}>
        <View style={styles.legItem}><View style={[styles.legDot, { backgroundColor: Colors.green }]} /><Text style={styles.legTxt}>Livre: {livres}</Text></View>
        <View style={styles.legItem}><View style={[styles.legDot, { backgroundColor: Colors.red }]} /><Text style={styles.legTxt}>Ocupada: {ocupadas}</Text></View>
        <View style={styles.legItem}><View style={[styles.legDot, { backgroundColor: Colors.amber }]} /><Text style={styles.legTxt}>Em breve: {iminentes}</Text></View>
      </View>
      {infos.map(({ sala, info }) => <SalaCard key={sala.id} sala={sala} info={info} />)}
      {!salas.length && <EmptyState icon="map-outline" text="Nenhuma sala cadastrada." />}
    </View>
  );
}

// ---- Reservas ----
function Reservas({ uid, onChange }: { uid: number | null; onChange: () => void }) {
  const [busca, setBusca] = useState('');
  const list = db.getReservas().filter(r => {
    const sala  = db.getSalaById(r.salaId);
    const turma = r.turmaId ? db.getTurmaById(r.turmaId) : null;
    const inst  = r.instrutorId ? db.getUserById(r.instrutorId) : (turma?.instrutorId ? db.getUserById(turma.instrutorId) : null);
    return r.unidadeId === uid && matchBusca(busca, sala?.nome, turma?.nome, inst?.nome, r.turno, r.diasSemana.join(' '), r.dataInicio, r.dataFim, r.horaInicio, r.horaFim);
  });

  const excluir = (r: Reserva) => {
    Alert.alert('Excluir reserva', 'Tem certeza que deseja excluir esta reserva?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => { await db.delReserva(r.id); onChange(); } },
    ]);
  };

  return (
    <View>
      <SearchBar value={busca} onChangeText={setBusca} placeholder="Pesquisar reservas" />
      {list.map(r => {
        const sala  = db.getSalaById(r.salaId);
        const turma = r.turmaId ? db.getTurmaById(r.turmaId) : null;
        const inst  = r.instrutorId ? db.getUserById(r.instrutorId) : (turma?.instrutorId ? db.getUserById(turma.instrutorId) : null);
        return (
          <Card key={r.id} style={{ marginBottom: 10 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.salaNome}>{sala?.nome ?? '-'}</Text>
              <Badge label={r.turno} tone="primary" />
            </View>
            <View style={styles.reservaMetaRow}>
              {r.avulsa || !turma
                ? <Badge label="Sem turma" tone="amber" />
                : <Text style={styles.turmaCodigo}>{turma.nome}</Text>}
            </View>
            {inst && <Text style={styles.turmaMeta}>Instrutor: {inst.nome}</Text>}
            <Text style={styles.turmaMeta}>
              {r.diasSemana.map(d => d.toUpperCase()).join(', ')}
              {r.horaInicio && r.horaFim ? ` · ${r.horaInicio}-${r.horaFim}` : ''}
            </Text>
            <Text style={styles.turmaMeta}>{db.fmtData(r.dataInicio)} a {db.fmtData(r.dataFim)}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <Button title="Excluir" variant="danger" size="sm" icon="trash-outline" onPress={() => excluir(r)} />
            </View>
          </Card>
        );
      })}
      {!list.length && <EmptyState icon="calendar-outline" text="Nenhuma reserva encontrada." />}
    </View>
  );
}

// ---- Solicitacoes ----
function Solicitacoes({ uid, sessaoId, onChange }: { uid: number | null; sessaoId: number; onChange: () => void }) {
  const [busca, setBusca] = useState('');
  const list = db.getSolics()
    .filter(s => s.unidadeId === uid)
    .filter(s => {
      const sala  = db.getSalaById(s.salaId);
      const inst  = db.getUserById(s.instrutorId);
      const turma = s.turmaId ? db.getTurmaById(s.turmaId) : null;
      return matchBusca(busca, sala?.nome, inst?.nome, turma?.nome, s.status, s.turnos.join(' '), s.data, s.dataInicio, s.dataFim, s.motivo);
    })
    .sort((a, b) => {
      if (a.status === 'pendente' && b.status !== 'pendente') return -1;
      if (a.status !== 'pendente' && b.status === 'pendente') return 1;
      return (b.criadaEm ?? '').localeCompare(a.criadaEm ?? '');
    });

  const responder = async (s: Solicitacao, status: 'aprovada' | 'recusada') => {
    await db.updSolic(s.id, { status });
    const sala = db.getSalaById(s.salaId);
    if (status === 'aprovada') {
      const dataIni = s.dataInicio ?? s.data;
      const dataFim = s.dataFim ?? s.data;
      const dias = s.diasSemana && s.diasSemana.length ? s.diasSemana : [db.diaDaSemana(dataIni)];
      for (const turno of s.turnos) {
        await db.addReserva({
          salaId: s.salaId, turmaId: s.turmaId ?? null, turno,
          diasSemana: dias, dataInicio: dataIni, dataFim,
          horaInicio: s.horaInicio ?? null, horaFim: s.horaFim ?? null,
          instrutorId: s.instrutorId, unidadeId: uid!, avulsa: !s.turmaId,
        });
      }
    }
    await db.addNotif({
      tipo: status === 'aprovada' ? 'aprovada' : 'recusada',
      titulo: status === 'aprovada' ? 'Solicitacao aprovada' : 'Solicitacao recusada',
      msg: `Sua solicitacao da sala "${sala?.nome ?? '?'}" foi ${status}.`,
      paraPerfil: 'instrutor', paraId: s.instrutorId, unidadeId: uid,
    });
    onChange();
  };

  return (
    <View>
      <SearchBar value={busca} onChangeText={setBusca} placeholder="Pesquisar solicitacoes" />
      {list.map(s => {
        const sala  = db.getSalaById(s.salaId);
        const inst  = db.getUserById(s.instrutorId);
        const turma = s.turmaId ? db.getTurmaById(s.turmaId) : null;
        const pend  = s.status === 'pendente';
        const cor   = pend ? Colors.amber : s.status === 'aprovada' ? Colors.green : Colors.red;
        const dataStr = (s.dataInicio && s.dataFim && s.dataInicio !== s.dataFim)
          ? `${db.fmtData(s.dataInicio)} a ${db.fmtData(s.dataFim)}`
          : db.fmtData(s.data ?? s.dataInicio);
        return (
          <Card key={s.id} style={[styles.solicCard, { borderLeftColor: cor }]}>
            <View style={styles.rowBetween}>
              <Text style={styles.salaNome}>{inst?.nome ?? 'Instrutor'}</Text>
              <Badge label={s.status.toUpperCase()} tone={pend ? 'amber' : s.status === 'aprovada' ? 'green' : 'red'} />
            </View>
            <Text style={styles.solicData}>{db.fmtDateTime(s.criadaEm)}</Text>

            <View style={styles.solicGrid}>
              <View style={styles.solicCol}>
                <Text style={styles.solicLabel}>Sala</Text>
                <Text style={styles.solicValor}>{sala?.nome ?? '-'}</Text>
                <Text style={styles.solicSub}>{sala?.bloco} · {sala?.andar}</Text>
              </View>
              <View style={styles.solicCol}>
                <Text style={styles.solicLabel}>Data</Text>
                <Text style={styles.solicValor}>{dataStr}</Text>
                {s.diasSemana?.length ? <Text style={styles.solicSub}>{s.diasSemana.map(d => d.toUpperCase()).join(', ')}</Text> : null}
              </View>
              <View style={styles.solicCol}>
                <Text style={styles.solicLabel}>Turno(s)</Text>
                <Text style={styles.solicValor}>{s.turnos.join(', ')}</Text>
                {s.horaInicio && s.horaFim ? <Text style={styles.solicSub}>{s.horaInicio} as {s.horaFim}</Text> : null}
              </View>
              <View style={styles.solicCol}>
                <Text style={styles.solicLabel}>Turma</Text>
                <Text style={styles.solicValor}>{turma?.nome ?? '-'}</Text>
              </View>
            </View>

            {s.motivo ? (
              <View style={styles.motivoBox}>
                <Text style={styles.motivoTxt}>{s.motivo}</Text>
              </View>
            ) : null}

            {pend && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <Button title="Aprovar" variant="success" size="sm" icon="checkmark" onPress={() => responder(s, 'aprovada')} style={{ flex: 1 }} />
                <Button title="Recusar" variant="danger" size="sm" icon="close" onPress={() => responder(s, 'recusada')} style={{ flex: 1 }} />
              </View>
            )}
          </Card>
        );
      })}
      {!list.length && <EmptyState icon="clipboard-outline" text="Nenhuma solicitacao encontrada." />}
    </View>
  );
}

// ---- Notificacoes ----
function Notificacoes({ uid }: { uid: number | null }) {
  const [list, setList] = useState<Notificacao[]>([]);
  const [busca, setBusca] = useState('');
  useEffect(() => {
    const l = db.getNotifsPara('coordenador', uid);
    setList(l);
    db.marcarTodasLidas('coordenador', uid);
  }, [uid]);

  const icons: Record<string, string> = {
    info: 'information-circle', aviso: 'warning', chave: 'key',
    solicit: 'clipboard', reserva: 'calendar', aprovada: 'checkmark-circle', recusada: 'close-circle',
  };

  if (!list.length) return <EmptyState icon="notifications-outline" text="Sem notificacoes." />;
  const filtradas = list.filter(n => matchBusca(busca, n.titulo, n.msg, n.tipo, n.criadaEm));

  return (
    <View>
      <SearchBar value={busca} onChangeText={setBusca} placeholder="Pesquisar avisos" />
      {filtradas.map(n => (
        <Card key={n.id} style={{ marginBottom: 10, flexDirection: 'row', gap: 12 }}>
          <Text style={{ fontSize: 20 }}>{'•'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifTitle}>{n.titulo}</Text>
            <Text style={styles.notifMsg}>{n.msg}</Text>
            <Text style={styles.notifTime}>{db.fmtDateTime(n.criadaEm)}</Text>
          </View>
        </Card>
      ))}
      {!filtradas.length && <EmptyState icon="notifications-outline" text="Nenhum aviso encontrado." />}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '47%', alignItems: 'flex-start' },
  statValor: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.text3, marginTop: 2 },
  blockTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  turmaCodigo: { fontSize: 14, fontWeight: '700', color: Colors.text },
  turmaCurso: { fontSize: 13, color: Colors.text2, marginTop: 4 },
  turmaMeta: { fontSize: 12, color: Colors.text3, marginTop: 3 },
  salaNome: { fontSize: 15, fontWeight: '800', color: Colors.text },
  reservaMetaRow: { marginTop: 6 },
  legenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 16, padding: 12, backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legDot: { width: 10, height: 10, borderRadius: 5 },
  legTxt: { fontSize: 12, color: Colors.text2, fontWeight: '600' },
  solicCard: { marginBottom: 12, borderLeftWidth: 3 },
  solicData: { fontSize: 11, color: Colors.text3, marginTop: 2 },
  solicGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  solicCol: { width: '50%', marginBottom: 8 },
  solicLabel: { fontSize: 11, color: Colors.text3 },
  solicValor: { fontSize: 13, fontWeight: '700', color: Colors.text, marginTop: 1 },
  solicSub: { fontSize: 11, color: Colors.text3, marginTop: 1 },
  motivoBox: { backgroundColor: Colors.surface2, borderRadius: 8, padding: 10, marginTop: 4 },
  motivoTxt: { fontSize: 12, color: Colors.text2 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  notifMsg: { fontSize: 13, color: Colors.text2, marginTop: 2 },
  notifTime: { fontSize: 11, color: Colors.text3, marginTop: 4 },
});
