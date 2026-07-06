import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, StyleProp, ViewStyle, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

// ---- Badge (espelha .bdg do web) ----
type BadgeProps = { label: string; tone?: 'primary' | 'green' | 'red' | 'amber' | 'blue' | 'muted'; style?: StyleProp<ViewStyle> };
const TONES: Record<string, { bg: string; text: string }> = {
  primary: { bg: Colors.primaryLight, text: Colors.primary },
  green:   { bg: Colors.greenLight,   text: '#065f46' },
  red:     { bg: Colors.redLight,     text: '#991b1b' },
  amber:   { bg: Colors.amberLight,   text: '#92400e' },
  blue:    { bg: Colors.blueLight,    text: '#1e40af' },
  muted:   { bg: Colors.bg3,          text: Colors.text2 },
};
export function Badge({ label, tone = 'primary', style }: BadgeProps) {
  const c = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.badgeTxt, { color: c.text }]}>{label}</Text>
    </View>
  );
}

// ---- StatusPill (status de turma: ativa/iminente/etc) ----
export function StatusPill({ status }: { status: keyof typeof Colors.turmaStatus }) {
  const c = Colors.turmaStatus[status] ?? Colors.turmaStatus.encerrada;
  const label = { ativa: 'Ativa', iminente: 'Iminente', posterior: 'Posterior', encerrada: 'Encerrada' }[status] ?? status;
  return (
    <View style={[styles.pill, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.pillTxt, { color: c.text }]}>{label}</Text>
    </View>
  );
}

// ---- StatusDot (bolinha colorida do mapa) ----
export function StatusDot({ status, size = 10 }: { status: 'livre' | 'ocupada' | 'iminente'; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: Colors.status[status].dot }} />;
}

// ---- Card (container branco com sombra) ----
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ---- Button (primary / danger / ghost / success) ----
type BtnProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'ghost' | 'success';
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};
export function Button({ title, onPress, variant = 'primary', icon, size = 'md', loading, disabled, style }: BtnProps) {
  const vs = BTN_VARIANTS[variant];
  const small = size === 'sm';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.btn,
        { backgroundColor: vs.bg, borderColor: vs.border, borderWidth: vs.border ? 1 : 0 },
        small && styles.btnSm,
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.text} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={small ? 14 : 16} color={vs.text} style={{ marginRight: 6 }} />}
          <Text style={[styles.btnTxt, { color: vs.text }, small && { fontSize: 13 }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
const BTN_VARIANTS: Record<string, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.primary, text: '#fff' },
  danger:  { bg: Colors.red,     text: '#fff' },
  success: { bg: Colors.green,   text: '#fff' },
  ghost:   { bg: 'transparent',  text: Colors.text2, border: Colors.border2 },
};

// ---- SearchBar ----
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Pesquisar',
  style,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.searchWrap, style]}>
      <Ionicons name="search-outline" size={18} color={Colors.text3} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.text3}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.searchInput}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="close-circle" size={18} color={Colors.text3} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ---- EmptyState (tela vazia) ----
export function EmptyState({ icon = 'file-tray-outline', text }: { icon?: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={40} color={Colors.text3} style={{ marginBottom: 10, opacity: 0.5 }} />
      <Text style={styles.emptyTxt}>{text}</Text>
    </View>
  );
}

// ---- SectionHeader ----
export function SectionHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' },
  pillTxt: { fontSize: 11, fontWeight: '700' },
  card: {
    backgroundColor: Colors.surface, borderRadius: Colors.rLg, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 11, paddingHorizontal: 16, borderRadius: 10,
  },
  btnSm: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8 },
  btnTxt: { fontSize: 14, fontWeight: '700' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 12, minHeight: 44, marginBottom: 12,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14, paddingVertical: 9 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTxt: { color: Colors.text3, fontSize: 14, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  sectionSub: { fontSize: 13, color: Colors.text3, marginTop: 2 },
});
