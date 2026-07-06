import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import * as db from '@/services/storage';

// Tela de entrada — decide para onde ir com base na sessao salva
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await db.initDados();
      const s = await db.getSessao();
      const rotas: Record<string, string> = {
        admin: '/admin', coordenador: '/coordenador',
        instrutor: '/instrutor', recepcao: '/recepcao',
      };
      if (s && rotas[s.perfil]) router.replace(rotas[s.perfil] as never);
      else router.replace('/login' as never);
    })();
  }, [router]);

  return (
    <View style={styles.c}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
});
