import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TemaProvider, useTema } from '@/theme/TemaContext';
import { ConfirmProvider } from '@/components/ConfirmProvider';

// Layout raiz — define a navegacao stack de todo o app
export default function RootLayout() {
  return (
    <TemaProvider>
      <ConfirmProvider>
        <RaizComTema />
      </ConfirmProvider>
    </TemaProvider>
  );
}

function RaizComTema() {
  const { tema, pronto } = useTema();

  if (!pronto) return null;

  return (
    <Tela key={tema} />
  );
}

function Tela() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login/index" />
        <Stack.Screen name="admin/index" />
        <Stack.Screen name="coordenador/index" />
        <Stack.Screen name="recepcao/index" />
        <Stack.Screen name="instrutor/index" />
      </Stack>
    </>
  );
}
