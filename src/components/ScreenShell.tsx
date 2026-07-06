import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, RefreshControl, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Sessao } from '@/types';
import { iniciais } from '@/services/storage';

type TabItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number;
};

type Props = {
  sessao: Sessao | null;
  perfilLabel: string;
  title: string;
  subtitle?: string;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  onLogout: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  children: React.ReactNode;
};

// Casca de tela: topbar com logo/perfil + tabs horizontais + conteudo rolavel.
// Espelha a sidebar/topbar do web adaptada para mobile.
export function ScreenShell({
  sessao, perfilLabel, title, subtitle, tabs, activeTab,
  onTabChange, onLogout, onRefresh, refreshing, children,
}: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Topbar */}
      <View style={styles.topbar}>
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Text style={styles.logoTxt}>SENAC</Text>
          </View>
          <View>
            <Text style={styles.brandName}>Reservas</Text>
            <View style={styles.perfilBadge}>
              <Text style={styles.perfilBadgeTxt}>{perfilLabel}</Text>
            </View>
          </View>
        </View>
        <View style={styles.brandRight}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{iniciais(sessao?.nome ?? 'SN')}</Text>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs horizontais */}
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {tabs.map(t => {
            const active = t.key === activeTab;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => onTabChange(t.key)}
                style={[styles.tab, active && styles.tabActive]}
                activeOpacity={0.7}
              >
                <Ionicons name={t.icon} size={17} color={active ? Colors.primary : Colors.text3} />
                <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>{t.label}</Text>
                {t.badge ? (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeTxt}>{t.badge}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Conteudo */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={Colors.primary} /> : undefined}
      >
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topbar: {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  logoTxt: { color: Colors.primary, fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  brandName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  perfilBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1, alignSelf: 'flex-start', marginTop: 2 },
  perfilBadgeTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  brandRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  logoutBtn: { padding: 4 },
  tabsWrap: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabsRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8, backgroundColor: 'transparent',
  },
  tabActive: { backgroundColor: Colors.primaryLight },
  tabTxt: { fontSize: 13, fontWeight: '600', color: Colors.text3 },
  tabTxtActive: { color: Colors.primary, fontWeight: '700' },
  tabBadge: { backgroundColor: Colors.red, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabBadgeTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  content: { flex: 1 },
  contentInner: { padding: 16 },
  titleBlock: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.text3, marginTop: 2 },
});
