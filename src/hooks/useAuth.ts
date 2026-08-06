import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Sessao, Perfil } from '@/types';
import * as db from '@/services/storage';

// Rotas de cada perfil apos login
const ROTAS: Record<Perfil, string> = {
  admin:       '/admin',
  coordenador: '/coordenador',
  instrutor:   '/instrutor',
  recepcao:    '/recepcao',
};

// Hook central de autenticacao e sessao
export function useAuth() {
  const [sessao, setSessaoState] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await db.initDados();
      const s = await db.getSessao();
      setSessaoState(s);
      setCarregando(false);
    })();
  }, []);

  const entrar = useCallback(async (email: string, senha: string, unidadeId: number | null) => {
    const u = await db.loginUser(email, senha);
    if (!u) throw new Error('E-mail ou senha incorretos.');
    if (u.perfil !== 'admin') {
      if (!unidadeId) throw new Error('Selecione sua unidade.');
      if (u.unidadeId && unidadeId && u.unidadeId !== unidadeId)
        throw new Error('Unidade incorreta para este usuario.');
    }
    const nova: Sessao = { ...u, unidadeId: u.unidadeId || unidadeId! };
    await db.setSessao(nova);
    setSessaoState(nova);
    router.replace(ROTAS[u.perfil] as never);
    return nova;
  }, [router]);

  const sair = useCallback(async () => {
    await db.clearSessao();
    setSessaoState(null);
    router.replace('/login' as never);
  }, [router]);

  return { sessao, carregando, entrar, sair };
}

// Hook para proteger telas — redireciona se o perfil nao bater
export function useRequirePerfil(perfil: Perfil) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [pronto, setPronto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await db.initDados();
      const s = await db.getSessao();
      if (!s || s.perfil !== perfil) {
        router.replace('/login' as never);
        return;
      }
      setSessao(s);
      setPronto(true);
    })();
  }, [perfil, router]);

  return { sessao, pronto };
}
