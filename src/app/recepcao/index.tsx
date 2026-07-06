import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Modal,
  TouchableOpacity, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useRequirePerfil, useAuth } from '@/hooks/useAuth';
import { ScreenShell } from '@/components/ScreenShell';
import { SalaCard } from '@/components/SalaCard';
import { Card, Button, EmptyState, SearchBar } from '@/components/ui';
import { calcSalaInfo } from '@/utils/salaStatus';
import * as db from '@/services/storage';
import { Chave, Notificacao, Usuario } from '@/types';

const TABS = [
  { key: 'mapa',   label: 'Mapa',   icon: 'map-outline' as const },
  { key: 'chaves', label: 'Chaves', icon: 'key-outline' as const },
  { key: 'notifs', label: 'Avisos', icon: 'notifications-outline' as const },
];

const matchBusca = (busca: string, ...valores: Array<string | number | null | undefined>) => {
  const q = busca.trim().toLowerCase();
  if (!q) return true;
  return valores.some(v => String(v ?? '').toLowerCase().includes(q));
};

export default function RecepcaoPanel() {
  const { sessao, pronto } = useRequirePerfil('recepcao');
  const { sair } = useAuth();
  const [tab, setTab] = useState('mapa');
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  const recarregar = useCallback(async () => {
    setRefreshing(true); await db.initDados(true); setTick(t => t + 1); setRefreshing(false);
  }, []);

  if (!pronto) return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const uid = sessao!.unidadeId;
  const naoLidas = db.countNaoLidas('recepcao', uid);
  const tabs = TABS.map(t => ({ ...t, badge: t.key === 'notifs' ? naoLidas : undefined }));

  const meta: Record<string, { t: string; s: string }> = {
    mapa:   { t: 'Mapa de Salas', s: 'Ocupacao atual das salas' },
    chaves: { t: 'Chaves', s: 'Controle de chaves das salas' },
    notifs: { t: 'Notificacoes', s: 'Avisos recebidos' },
  };

  return (
    <ScreenShell
      sessao={sessao} perfilLabel="Recepcao"
      title={meta[tab].t} subtitle={meta[tab].s}
      tabs={tabs} activeTab={tab} onTabChange={setTab}
      onLogout={sair} onRefresh={recarregar} refreshing={refreshing}
    >
      {tab === 'mapa'   && <Mapa uid={uid} key={`m${tick}`} />}
      {tab === 'chaves' && <Chaves uid={uid} onChange={recarregar} key={`c${tick}`} />}
      {tab === 'notifs' && <Notifs uid={uid} key={`n${tick}`} />}
    </ScreenShell>
  );
}

// ---- Mapa (somente leitura) ----
function Mapa({ uid }: { uid: number }) {
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

// ---- Chaves ----
function Chaves({ uid, onChange }: { uid: number; onChange: () => void | Promise<void> }) {
  const carregarChaves = useCallback(
    () => db.getChaves().filter(c => c.unidadeId === uid),
    [uid]
  );
  const [list, setList] = useState<Chave[]>(carregarChaves);
  const [modalChave, setModalChave] = useState<Chave | null>(null);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    setList(carregarChaves());
  }, [carregarChaves]);

  const atualizarChaveNaLista = (atualizada: Chave) => {
    setList(atual => atual.map(c => c.id === atualizada.id ? atualizada : c));
  };

  const liberar = (c: Chave) => {
    Alert.alert('Devolver chave', 'Registrar como devolvida a recepcao?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Devolver', onPress: async () => {
        const atualizada = await db.devolverChave(c.id);
        if (!atualizada) {
          Alert.alert('Erro', 'Nao foi possivel encontrar esta chave.');
          return;
        }
        atualizarChaveNaLista(atualizada);
        if (c.instrutorId) {
          const resp = db.getUserById(c.instrutorId);
          await db.addNotif({ tipo: 'chave', titulo: 'Chave devolvida', msg: `A chave "${c.codigo}" foi registrada como devolvida.`, paraPerfil: resp?.perfil ?? 'instrutor', paraId: c.instrutorId, unidadeId: uid });
        }
        void onChange();
      }},
    ]);
  };

  const filtradas = list.filter(c => {
    const sala = db.getSalaById(c.salaId);
    const resp = c.instrutorId ? db.getUserById(c.instrutorId) : null;
    return matchBusca(busca, c.codigo, c.andar, c.status, sala?.nome, resp?.nome);
  });

  return (
    <View>
      <SearchBar value={busca} onChangeText={setBusca} placeholder="Pesquisar chaves" />
      {filtradas.map(c => {
        const sala = db.getSalaById(c.salaId);
        const pega = c.status === 'pega';
        const resp = pega && c.instrutorId ? db.getUserById(c.instrutorId) : null;
        return (
          <Card key={c.id} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={[styles.keyIcon, { backgroundColor: pega ? Colors.redLight : Colors.greenLight }]}>
                <Ionicons name="key" size={20} color={pega ? Colors.red : Colors.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.salaNome}>{sala?.nome ?? '-'} — {c.codigo}</Text>
                <Text style={styles.turmaMeta}>Andar: {c.andar}</Text>
                {resp ? (
                  <Text style={[styles.turmaMeta, { color: Colors.red }]}>Com: {resp.nome}</Text>
                ) : (
                  <Text style={[styles.turmaMeta, { color: Colors.green }]}>Na recepcao</Text>
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <Button title={pega ? 'Reatribuir' : 'Atribuir'} variant="primary" size="sm" icon="person-outline"
                onPress={() => setModalChave(c)} style={{ flex: 1 }} />
              {pega && <Button title="Liberar" variant="ghost" size="sm" icon="arrow-undo-outline" onPress={() => liberar(c)} style={{ flex: 1 }} />}
            </View>
          </Card>
        );
      })}
      {!filtradas.length && <EmptyState icon="key-outline" text="Nenhuma chave encontrada." />}

      {modalChave && (
        <ModalAtribuir chave={modalChave} uid={uid}
          onClose={() => setModalChave(null)}
          onDone={(atualizada) => {
            atualizarChaveNaLista(atualizada);
            setModalChave(null);
            void onChange();
          }} />
      )}
    </View>
  );
}

function ModalAtribuir({ chave, uid, onClose, onDone }: { chave: Chave; uid: number; onClose: () => void; onDone: (chave: Chave) => void }) {
  const sala = db.getSalaById(chave.salaId);
  const [respId, setRespId] = useState<number | null>(chave.instrutorId ?? null);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState('');
  const instrutores = db.getUsersByPerfil('instrutor').filter(u => u.unidadeId === uid && matchBusca(busca, u.nome, u.email, u.perfil));
  const coords = db.getUsersByPerfil('coordenador').filter(u => u.unidadeId === uid && matchBusca(busca, u.nome, u.email, u.perfil));

  const confirmar = async () => {
    if (!respId) { Alert.alert('Atencao', 'Selecione o responsavel.'); return; }
    const resp = db.getUserById(respId);
    if (!resp || resp.unidadeId !== uid) {
      Alert.alert('Atencao', 'Responsavel invalido para esta unidade.');
      return;
    }
    setSalvando(true);
    const atualizada = await db.retirarChave(chave.id, respId);
    if (!atualizada) {
      setSalvando(false);
      Alert.alert('Erro', 'Nao foi possivel atribuir esta chave.');
      return;
    }
    await db.addNotif({ tipo: 'chave', titulo: `Chave atribuida — ${sala?.nome ?? 'sala'}`, msg: `A chave "${chave.codigo}" foi registrada em seu nome pela recepcao.`, paraPerfil: resp?.perfil ?? 'instrutor', paraId: respId, unidadeId: uid });
    setSalvando(false);
    onDone(atualizada);
  };

  const Grupo = ({ titulo, users }: { titulo: string; users: Usuario[] }) => users.length ? (
    <>
      <Text style={styles.grupoLabel}>{titulo}</Text>
      {users.map(u => (
        <TouchableOpacity key={u.id} style={[styles.userRow, respId === u.id && styles.userRowActive]} onPress={() => setRespId(u.id)}>
          <Text style={[styles.userTxt, respId === u.id && { color: Colors.primary, fontWeight: '700' }]}>{u.nome}</Text>
          {respId === u.id && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
        </TouchableOpacity>
      ))}
    </>
  ) : null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Atribuir {sala?.nome} — {chave.codigo}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.text2} /></TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 400 }}>
            <SearchBar value={busca} onChangeText={setBusca} placeholder="Pesquisar responsavel" />
            <Grupo titulo="Instrutores" users={instrutores} />
            <Grupo titulo="Coordenadores" users={coords} />
            {!instrutores.length && !coords.length && <EmptyState icon="people-outline" text="Nenhum responsavel encontrado." />}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <Button title="Cancelar" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
            <Button title="Confirmar" variant="primary" icon="checkmark" onPress={confirmar} loading={salvando} disabled={salvando} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---- Notifs ----
function Notifs({ uid }: { uid: number }) {
  const [list, setList] = useState<Notificacao[]>([]);
  const [busca, setBusca] = useState('');
  useEffect(() => {
    setList(db.getNotifsPara('recepcao', uid));
    db.marcarTodasLidas('recepcao', uid);
  }, [uid]);
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
  salaNome: { fontSize: 15, fontWeight: '800', color: Colors.text },
  turmaMeta: { fontSize: 12, color: Colors.text3, marginTop: 3 },
  legenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 16, padding: 12, backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legDot: { width: 10, height: 10, borderRadius: 5 },
  legTxt: { fontSize: 12, color: Colors.text2, fontWeight: '600' },
  keyIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  notifMsg: { fontSize: 13, color: Colors.text2, marginTop: 2 },
  notifTime: { fontSize: 11, color: Colors.text3, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, flex: 1 },
  grupoLabel: { fontSize: 12, fontWeight: '700', color: Colors.text3, marginTop: 10, marginBottom: 6, textTransform: 'uppercase' },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, marginBottom: 6 },
  userRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  userTxt: { fontSize: 14, color: Colors.text },
});
