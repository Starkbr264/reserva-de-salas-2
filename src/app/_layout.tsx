import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Layout raiz — define a navegacao stack de todo o app
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
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
