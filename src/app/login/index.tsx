import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import * as db from '@/services/storage';
import { Unidade } from '@/types';

// Tela de login — valida email/senha/unidade e redireciona por perfil
export default function LoginScreen() {
  const { entrar } = useAuth();
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [unidadeId, setUnidadeId] = useState<number | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState(false);

  useEffect(() => {
    (async () => {
      await db.initDados();
      setUnidades(db.getUnidades());
    })();
  }, []);

  const fazerLogin = async () => {
    setErro('');
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return; }
    setCarregando(true);
    try {
      await entrar(email.trim(), senha, unidadeId);
    } catch (e) {
      setErro((e as Error).message);
      setCarregando(false);
    }
  };

  const unidadeSel = unidades.find(u => u.id === unidadeId);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Cabecalho com logo */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoTxt}>SENAC</Text>
          </View>
          <Text style={styles.headerTitle}>Sistema de Reserva de Salas</Text>
          <Text style={styles.headerSub}>SENAC GDF</Text>
        </View>

        {/* Card do formulario */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar</Text>
          <Text style={styles.cardSub}>Acesse com suas credenciais</Text>

          {/* Email */}
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={Colors.text3} />
            <TextInput
              style={styles.input}
              placeholder="seu.email@senacdf.com"
              placeholderTextColor={Colors.text3}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Senha */}
          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.text3} />
            <TextInput
              style={styles.input}
              placeholder="Sua senha"
              placeholderTextColor={Colors.text3}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(v => !v)}>
              <Ionicons name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.text3} />
            </TouchableOpacity>
          </View>

          {/* Unidade (dropdown simples) */}
          <Text style={styles.label}>Unidade</Text>
          <TouchableOpacity style={styles.inputWrap} onPress={() => setDropdownAberto(v => !v)}>
            <Ionicons name="business-outline" size={18} color={Colors.text3} />
            <Text style={[styles.input, { color: unidadeSel ? Colors.text : Colors.text3 }]}>
              {unidadeSel ? unidadeSel.nome : 'Selecione sua unidade'}
            </Text>
            <Ionicons name={dropdownAberto ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.text3} />
          </TouchableOpacity>
          {dropdownAberto && (
            <View style={styles.dropdown}>
              {unidades.map(u => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.dropdownItem}
                  onPress={() => { setUnidadeId(u.id); setDropdownAberto(false); }}
                >
                  <Text style={styles.dropdownTxt}>{u.nome}</Text>
                  {unidadeId === u.id && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Mensagem de erro */}
          {erro ? (
            <View style={styles.erroBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.red} />
              <Text style={styles.erroTxt}>{erro}</Text>
            </View>
          ) : null}

          {/* Botao */}
          <TouchableOpacity style={styles.btn} onPress={fazerLogin} disabled={carregando} activeOpacity={0.85}>
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color="#fff" />
                <Text style={styles.btnTxt}>Entrar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Rodape com dica de credenciais */}
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Credenciais de teste</Text>
          <Text style={styles.hintTxt}>Admin: senac_gdf@hotmail.com / Senac.DF2007</Text>
          <Text style={styles.hintTxt}>Coordenador: coord.asanorte@senacdf.com / Coord@123</Text>
          <Text style={styles.hintTxt}>Instrutor: katia.barros@senacdf.com / Inst@123</Text>
          <Text style={styles.hintTxt}>Recepcao: recep.asanorte@senacdf.com / Recep@123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 28 },
  logoBox: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 16 },
  logoTxt: { color: Colors.primary, fontWeight: '800', fontSize: 22, letterSpacing: 1 },
  headerTitle: { color: '#fff', fontSize: 19, fontWeight: '800', textAlign: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface, borderRadius: Colors.rLg, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  cardSub: { fontSize: 14, color: Colors.text3, marginTop: 2, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text2, marginBottom: 6, marginTop: 12 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, height: 48,
  },
  input: { flex: 1, fontSize: 15, color: Colors.text },
  dropdown: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    marginTop: 4, overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dropdownTxt: { fontSize: 14, color: Colors.text },
  erroBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.redLight,
    borderRadius: 8, padding: 10, marginTop: 14,
  },
  erroTxt: { color: Colors.red, fontSize: 13, fontWeight: '600', flex: 1 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 10, height: 50, marginTop: 22,
  },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint: { marginTop: 24, padding: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  hintTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  hintTxt: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginBottom: 3 },
});
