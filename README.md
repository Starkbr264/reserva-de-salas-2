# SENAC Reservas — App Mobile

Aplicativo mobile do Sistema de Reserva de Salas do SENAC GDF.
Convertido do frontend web (HTML/CSS/JS) para **React Native + Expo**,
seguindo a estrutura do guia StudyTask.

## Stack

- **React Native** + **Expo** (SDK 51)
- **Expo Router** (navegacao baseada em arquivos)
- **TypeScript** (tipagem estrita)
- **AsyncStorage** (persistencia local — substitui o localStorage do web)
- **@expo/vector-icons** (icones)

## Estrutura de pastas (padrao StudyTask)

```
src/
  app/              -> telas (Expo Router)
    _layout.tsx     -> layout raiz
    index.tsx       -> redirect por sessao
    login/          -> tela de login
    admin/          -> painel do administrador
    coordenador/    -> painel do coordenador
    recepcao/       -> painel da recepcao
    instrutor/      -> painel do instrutor
  components/       -> componentes reutilizaveis (ui, SalaCard, ScreenShell)
  hooks/            -> useAuth, useRequirePerfil
  services/         -> storage.ts (CRUD + AsyncStorage + seed)
  types/            -> index.ts (todos os tipos)
  constants/        -> colors.ts (tokens espelhados do CSS web)
  utils/            -> salaStatus.ts (calculo de ocupacao)
```

## Como rodar

```bash
npm install
npx expo start
```

Depois:
- Aperte `a` para abrir no Android
- Aperte `i` para abrir no iOS
- Escaneie o QR code com o app Expo Go no celular

## Credenciais de teste

| Perfil       | Email                          | Senha         |
|--------------|--------------------------------|---------------|
| Admin        | senac_gdf@hotmail.com          | Senac.DF2007  |
| Coordenador  | coord.asanorte@senacdf.com     | Coord@123     |
| Instrutor    | katia.barros@senacdf.com       | Inst@123      |
| Recepcao     | recep.asanorte@senacdf.com     | Recep@123     |

## Funcionalidades por perfil

**Admin** — dashboard, CRUD de usuarios e unidades, visao global de salas/turmas/reservas/chaves, resetar dados.

**Coordenador** — dashboard, mapa de salas, reservas, aprovar/recusar solicitacoes (cria a reserva automaticamente), notificacoes.

**Instrutor** — minhas turmas, solicitar sala (data unica/periodo/datas avulsas + turnos + horario + turma), chaves sob responsabilidade, notificacoes.

**Recepcao** — mapa de salas (somente leitura), controle de chaves (atribuir/reatribuir/liberar), notificacoes.

## Design

As cores e o visual sao espelhados do frontend web original
(ver `src/constants/colors.ts` — tokens identicos ao `variables.css`).
Cor primaria: `#1a3a5c`. Mesma logica de status de salas (livre/ocupada/em breve)
e mesmas cores por turno.

## Diferencas em relacao ao web

- **AsyncStorage** no lugar de `localStorage` (assincrono)
- Navegacao por **abas horizontais** no lugar da sidebar
- **Pull-to-refresh** no lugar do botao "Atualizar"
- **Modais deslizantes** (bottom sheet) no lugar dos modais centrais
- Calendario nao incluido nesta versao (recomendado adicionar depois)
