import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paleta, paletaClara, paletaEscura } from './paletas';
import { aplicarPaleta, K_TEMA } from './theme';

// Tema claro/escuro espelhado do web (css/variables.css com [data-theme="dark"])
export type Tema = 'claro' | 'escuro';

type TemaContexto = {
  tema: Tema;
  paleta: Paleta;
  pronto: boolean;
  alternar: () => void;
  setTema: (t: Tema) => void;
};

const Contexto = createContext<TemaContexto | null>(null);

const PALETAS: Record<Tema, Paleta> = {
  claro: paletaClara,
  escuro: paletaEscura,
};

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTemaState] = useState<Tema>('claro');
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem(K_TEMA);
        const proximo: Tema = t === 'escuro' ? 'escuro' : 'claro';
        setTemaState(proximo);
        aplicarPaleta(PALETAS[proximo]);
      } catch {
        aplicarPaleta(PALETAS.claro);
      } finally {
        setPronto(true);
      }
    })();
  }, []);

  const aplicar = useCallback((t: Tema) => {
    setTemaState(t);
    aplicarPaleta(PALETAS[t]);
    AsyncStorage.setItem(K_TEMA, t).catch(() => {});
  }, []);

  const alternar = useCallback(() => {
    setTemaState(prev => {
      const proximo: Tema = prev === 'escuro' ? 'claro' : 'escuro';
      aplicarPaleta(PALETAS[proximo]);
      AsyncStorage.setItem(K_TEMA, proximo).catch(() => {});
      return proximo;
    });
  }, []);

  const paleta = useMemo(() => PALETAS[tema], [tema]);

  const valor = useMemo(
    () => ({ tema, paleta, pronto, alternar, setTema: aplicar }),
    [tema, paleta, pronto, alternar, aplicar]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTema(): TemaContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useTema deve ser usado dentro de <TemaProvider>.');
  return ctx;
}
