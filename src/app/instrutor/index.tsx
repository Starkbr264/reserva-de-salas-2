import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TextInput,
  TouchableOpacity, Modal, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useRequirePerfil, useAuth } from '@/hooks/useAuth';
import { ScreenShell } from '@/components/ScreenShell';
import { Card, Badge, StatusPill, Button, EmptyState, SearchBar } from '@/components/ui';
import * as db from '@/services/storage';
import { Sala, Turma, Turno, DiaSemana, ModoData, Notificacao } from '@/types';

const TABS = [
  { key: 'turmas',  label: 'Turmas',   icon: 'school-outline' as const },
  { key: 'salas',   label: 'Solicitar',icon: 'add-circle-outline' as const },
  { key: 'chaves',  label: 'Chaves',   icon: 'key-outline' as const },
  { key: 'notifs',  label: 'Avisos',   icon: 'notifications-outline' as const },
];

const matchBusca = (busca: string, ...valores: Array<string | number | null | undefined>) => {
  const q = busca.trim().toLowerCase();
  if (!q) return true;
  return valores.some(v => String(v ?? '').toLowerCase().includes(q));
};

export default function InstrutorPanel() {
  const { sessao, pronto } = useRequirePerfil('instrutor');
  const { sair } = useAuth();
  const [tab, setTab] = useState('turmas');
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  const recarregar = useCallback(async () => {
    setRefreshing(true); await db.initDados(true); setTick(t => t + 1); setRefreshing(false);
  }, []);

  if (!pronto) return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const uid = sessao!.unidadeId;
  const naoLidas = db.countNaoLidas('instrutor', uid, sessao!.id);
  const tabs = TABS.map(t => ({ ...t, badge: t.key === 'notifs' ? naoLidas : undefined }));

  const meta: Record<string, { t: string; s: string }> = {
    turmas: { t: 'Minhas Turmas', s: 'Turmas atribuidas a voce' },
    salas:  { t: 'Solicitar Sala', s: 'Solicite uma sala disponivel' },
    chaves: { t: 'Chaves', s: 'Chaves sob sua responsabilidade' },
    notifs: { t: 'Notificacoes', s: 'Avisos e respostas' },
  };

  return (
    <ScreenShell
      sessao={sessao} perfilLabel="Instrutor"
      title={meta[tab].t} subtitle={meta[tab].s}
      tabs={tabs} activeTab={tab} onTabChange={setTab}
      onLogout={sair} onRefresh={recarregar} refreshing={refreshing}
    >
      {tab === 'turmas' && <MinhasTurmas sessaoId={sessao!.id} key={`t${tick}`} />}
      {tab === 'salas'  && <SolicitarSala sessaoId={sessao!.id} uid={uid} onDone={recarregar} key={`s${tick}`} />}
      {tab === 'chaves' && <MinhasChaves sessaoId={sessao!.id} uid={uid} key={`c${tick}`} />}
      {tab === 'notifs' && <Notifs uid={uid} sessaoId={sessao!.id} key={`n${tick}`} />}
    </ScreenShell>
  );
}

// ---- Minhas Turmas ----
function MinhasTurmas({ sessaoId }: { sessaoId: number }) {
  const [busca, setBusca] = useState('');
  const list = db.getTurmas().filter(t => t.instrutorId === sessaoId && matchBusca(busca, t.nome, t.codigo, t.curso, t.turno, t.dataInicio, t.dataFim, db.calcStatus(t)));
  return (
    <View>
      <SearchBar value={busca} onChangeText={setBusca} placeholder="Pesquisar turmas" />
      {list.map(t => (
        <Card key={t.id} style={{ marginBottom: 10 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.turmaCodigo}>{t.nome}</Text>
            <StatusPill status={db.calcStatus(t)} />
          </View>
          <Text style={styles.turmaCurso}>{t.curso}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' }}>
            <Badge label={t.turno} tone="primary" />
            <Text style={styles.turmaMeta}>{db.fmtData(t.dataInicio)} a {db.fmtData(t.dataFim)}</Text>
          </View>
        </Card>
      ))}
      {!list.length && <EmptyState icon="school-outline" text="Nenhuma turma encontrada." />}
    </View>
  );
}

// ---- Solicitar Sala ----
function SolicitarSala({ sessaoId, uid, onDone }: { sessaoId: number; uid: number; onDone: () => void }) {
  const [busca, setBusca] = useState('');
  const salas = db.getSalasByUnidade(uid).filter(s => matchBusca(busca, s.nome, s.tipo, s.andar, s.bloco, s.capacidade, s.turnosDisponiveis.join(' ')));
  const [modalSala, setModalSala] = useState<Sala | null>(null);

  return (
    <View>
      <SearchBar value={busca} onChangeText={setBusca} placeholder="Pesquisar salas" />
      {salas.map(s => (
        <Card key={s.id} style={{ marginBottom: 10 }}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.salaNome}>{s.nome}</Text>
              <Text style={styles.turmaCurso}>{s.tipo}</Text>
            </View>
          </View>
          <Text style={styles.turmaMeta}>{s.bloco} · {s.andar} · {s.capacidade} lugares</Text>
          <View style={{ flexDirection: 'row', gap: 5, marginTop: 8 }}>
            {s.turnosDisponiveis.map(t => (
              <View key={t} style={styles.turnoChip}><Text style={styles.turnoChipTxt}>{t[0]}</Text></View>
            ))}
          </View>
          <Button title="Solicitar" variant="primary" size="sm" icon="paper-plane-outline"
            onPress={() => setModalSala(s)} style={{ marginTop: 10 }} />
        </Card>
      ))}
      {!salas.length && <EmptyState icon="business-outline" text="Nenhuma sala encontrada." />}

      {modalSala && (
        <ModalSolicitar
          sala={modalSala} sessaoId={sessaoId} uid={uid}
          onClose={() => setModalSala(null)}
          onDone={() => { setModalSala(null); onDone(); }}
        />
      )}
    </View>
  );
}

const DIAS: { v: DiaSemana; l: string }[] = [
  { v: 'seg', l: 'Seg' }, { v: 'ter', l: 'Ter' }, { v: 'qua', l: 'Qua' },
  { v: 'qui', l: 'Qui' }, { v: 'sex', l: 'Sex' }, { v: 'sab', l: 'Sab' },
];

function ModalSolicitar({ sala, sessaoId, uid, onClose, onDone }: { sala: Sala; sessaoId: number; uid: number; onClose: () => void; onDone: () => void }) {
  const [modo, setModo] = useState<ModoData>('unica');
  const [data, setData] = useState('');
  const [dataIni, setDataIni] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [dias, setDias] = useState<DiaSemana[]>([]);
  const [horaIni, setHoraIni] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [turmaId, setTurmaId] = useState<number | null>(null);
  const [buscaTurma, setBuscaTurma] = useState('');
  const [motivo, setMotivo] = useState('');

  const minhasTurmas = db.getTurmas().filter(t =>
    t.instrutorId === sessaoId &&
    db.calcStatus(t) !== 'encerrada' &&
    matchBusca(buscaTurma, t.nome, t.codigo, t.curso, t.turno)
  );

  const toggleTurno = (t: Turno) => setTurnos(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const toggleDia = (d: DiaSemana) => setDias(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);

  const enviar = async () => {
    if (!turnos.length) { Alert.alert('Atencao', 'Selecione ao menos um turno.'); return; }
    let di = '', df = '';
    if (modo === 'unica') {
      if (!data) { Alert.alert('Atencao', 'Informe a data.'); return; }
      di = df = data;
    } else if (modo === 'periodo') {
      if (!dataIni || !dataFim) { Alert.alert('Atencao', 'Informe inicio e fim.'); return; }
      di = dataIni; df = dataFim;
    } else {
      if (!data) { Alert.alert('Atencao', 'Informe a data.'); return; }
      di = df = data;
    }
    await db.addSolic({
      salaId: sala.id, instrutorId: sessaoId, turmaId, turnos,
      data: di, dataInicio: di, dataFim: df,
      diasSemana: modo === 'especificas' && dias.length ? dias : null,
      horaInicio: horaIni || null, horaFim: horaFim || null, motivo,
      status: 'pendente', unidadeId: uid, modo, criadaEm: new Date().toISOString(),
    });
    await db.addNotif({
      tipo: 'solicit', titulo: 'Nova Solicitacao de Sala',
      msg: `Solicitacao da sala "${sala.nome}" em ${db.fmtData(di)}.`,
      paraPerfil: 'coordenador', paraId: null, unidadeId: uid,
    });
    Alert.alert('Sucesso', 'Solicitacao enviada! Aguarde aprovacao.');
    onDone();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Solicitar {sala.nome}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.text2} /></TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 480 }}>
            {/* Modo de data */}
            <Text style={styles.mLabel}>Tipo de data</Text>
            <View style={styles.segmentRow}>
              {(['unica', 'periodo', 'especificas'] as ModoData[]).map(m => (
                <TouchableOpacity key={m} style={[styles.segment, modo === m && styles.segmentActive]} onPress={() => setModo(m)}>
                  <Text style={[styles.segmentTxt, modo === m && styles.segmentTxtActive]}>
                    {m === 'unica' ? 'Data unica' : m === 'periodo' ? 'Periodo' : 'Datas avulsas'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {modo === 'unica' && (
              <><Text style={styles.mLabel}>Data (AAAA-MM-DD)</Text>
              <TextInput style={styles.mInput} placeholder="2026-07-15" value={data} onChangeText={setData} placeholderTextColor={Colors.text3} /></>
            )}
            {modo === 'periodo' && (
              <>
                <Text style={styles.mLabel}>Data inicio</Text>
                <TextInput style={styles.mInput} placeholder="2026-07-15" value={dataIni} onChangeText={setDataIni} placeholderTextColor={Colors.text3} />
                <Text style={styles.mLabel}>Data fim</Text>
                <TextInput style={styles.mInput} placeholder="2026-07-30" value={dataFim} onChangeText={setDataFim} placeholderTextColor={Colors.text3} />
              </>
            )}
            {modo === 'especificas' && (
              <>
                <Text style={styles.mLabel}>Data (AAAA-MM-DD)</Text>
                <TextInput style={styles.mInput} placeholder="2026-07-15" value={data} onChangeText={setData} placeholderTextColor={Colors.text3} />
                <Text style={styles.mLabel}>Dias da semana</Text>
                <View style={styles.chipsRow}>
                  {DIAS.map(d => (
                    <TouchableOpacity key={d.v} style={[styles.chip, dias.includes(d.v) && styles.chipActive]} onPress={() => toggleDia(d.v)}>
                      <Text style={[styles.chipTxt, dias.includes(d.v) && styles.chipTxtActive]}>{d.l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Turnos */}
            <Text style={styles.mLabel}>Turno(s)</Text>
            <View style={styles.chipsRow}>
              {sala.turnosDisponiveis.map(t => (
                <TouchableOpacity key={t} style={[styles.chip, turnos.includes(t) && styles.chipActive]} onPress={() => toggleTurno(t)}>
                  <Text style={[styles.chipTxt, turnos.includes(t) && styles.chipTxtActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Horario */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mLabel}>Hora inicio</Text>
                <TextInput style={styles.mInput} placeholder="08:00" value={horaIni} onChangeText={setHoraIni} placeholderTextColor={Colors.text3} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mLabel}>Hora fim</Text>
                <TextInput style={styles.mInput} placeholder="10:00" value={horaFim} onChangeText={setHoraFim} placeholderTextColor={Colors.text3} />
              </View>
            </View>

            {/* Turma */}
            <Text style={styles.mLabel}>Turma (opcional)</Text>
            <SearchBar value={buscaTurma} onChangeText={setBuscaTurma} placeholder="Pesquisar turmas" />
            <View style={styles.chipsRow}>
              <TouchableOpacity style={[styles.chip, turmaId === null && styles.chipActive]} onPress={() => setTurmaId(null)}>
                <Text style={[styles.chipTxt, turmaId === null && styles.chipTxtActive]}>Sem turma</Text>
              </TouchableOpacity>
              {minhasTurmas.map(t => (
                <TouchableOpacity key={t.id} style={[styles.chip, turmaId === t.id && styles.chipActive]} onPress={() => setTurmaId(t.id)}>
                  <Text style={[styles.chipTxt, turmaId === t.id && styles.chipTxtActive]}>{t.nome}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {!minhasTurmas.length && buscaTurma ? <EmptyState icon="school-outline" text="Nenhuma turma encontrada." /> : null}

            {/* Motivo */}
            <Text style={styles.mLabel}>Motivo</Text>
            <TextInput style={[styles.mInput, { height: 70, textAlignVertical: 'top' }]} multiline
              placeholder="Descreva o motivo..." value={motivo} onChangeText={setMotivo} placeholderTextColor={Colors.text3} />
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <Button title="Cancelar" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
            <Button title="Enviar" variant="primary" icon="paper-plane-outline" onPress={enviar} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---- Minhas Chaves ----
function MinhasChaves({ sessaoId, uid }: { sessaoId: number; uid: number }) {
  const [busca, setBusca] = useState('');
  const list = db.getChaves().filter(c => {
    const sala = db.getSalaById(c.salaId);
    return c.unidadeId === uid && c.instrutorId === sessaoId && matchBusca(busca, c.codigo, c.andar, c.pegaEm, sala?.nome);
  });
  return (
    <View>
      <SearchBar value={busca} onChangeText={setBusca} placeholder="Pesquisar chaves" />
      {list.map(c => {
        const sala = db.getSalaById(c.salaId);
        return (
          <Card key={c.id} style={{ marginBottom: 10, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={styles.keyIcon}><Ionicons name="key" size={20} color={Colors.amber} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.salaNome}>{sala?.nome ?? '-'} — {c.codigo}</Text>
              <Text style={styles.turmaMeta}>Andar: {c.andar}</Text>
              <Text style={styles.turmaMeta}>Retirada em: {db.fmtDateTime(c.pegaEm)}</Text>
            </View>
          </Card>
        );
      })}
      {!list.length && <EmptyState icon="key-outline" text="Nenhuma chave encontrada." />}
    </View>
  );
}

// ---- Notifs ----
function Notifs({ uid, sessaoId }: { uid: number; sessaoId: number }) {
  const [list, setList] = useState<Notificacao[]>([]);
  const [busca, setBusca] = useState('');
  useEffect(() => {
    setList(db.getNotifsPara('instrutor', uid, sessaoId).filter(n => !n.paraId || n.paraId === sessaoId));
    db.marcarTodasLidas('instrutor', uid, sessaoId);
  }, [uid, sessaoId]);
  if (!list.length) return <EmptyState icon="notifications-outline" text="Sem notificacoes." />;
  const filtradas = list.filter(n => matchBusca(busca, n.titulo, n.msg, n.tipo, n.criadaEm));
  return (
    <View>
      <SearchBar value={busca} onChangeText={setBusca} placeholder="Pesquisar avisos" />
      {filtradas.map(n => (
        <Card key={n.id} style={{ marginBottom: 10 }}>
          <Text style={styles.notifTitle}>{n.titulo}</Text>
          <Text style={styles.notifMsg}>{n.msg}</Text>
          <Text style={styles.notifTime}>{db.fmtDateTime(n.criadaEm)}</Text>
        </Card>
      ))}
      {!filtradas.length && <EmptyState icon="notifications-outline" text="Nenhum aviso encontrado." />}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  turmaCodigo: { fontSize: 14, fontWeight: '700', color: Colors.text },
  turmaCurso: { fontSize: 13, color: Colors.text2, marginTop: 2 },
  turmaMeta: { fontSize: 12, color: Colors.text3, marginTop: 3 },
  salaNome: { fontSize: 15, fontWeight: '800', color: Colors.text },
  turnoChip: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center', justifyContent: 'center' },
  turnoChipTxt: { fontSize: 12, fontWeight: '700', color: Colors.text3 },
  keyIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.amberLight, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  notifMsg: { fontSize: 13, color: Colors.text2, marginTop: 2 },
  notifTime: { fontSize: 11, color: Colors.text3, marginTop: 4 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  mLabel: { fontSize: 12, fontWeight: '700', color: Colors.text2, marginBottom: 5, marginTop: 12 },
  mInput: { backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.text },
  segmentRow: { flexDirection: 'row', backgroundColor: Colors.bg3, borderRadius: 8, padding: 3 },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  segmentActive: { backgroundColor: Colors.surface },
  segmentTxt: { fontSize: 12, fontWeight: '600', color: Colors.text3 },
  segmentTxtActive: { color: Colors.primary, fontWeight: '700' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: Colors.border2, backgroundColor: Colors.surface },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTxt: { fontSize: 12, fontWeight: '600', color: Colors.text2 },
  chipTxtActive: { color: '#fff' },
});
