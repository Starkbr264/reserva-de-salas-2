# Documentação do Código — SENAC Reservas (Web)

Sistema web de reserva de salas do SENAC GDF. Front-end em HTML/CSS/JS puro, sem frameworks e sem build. Os dados são persistidos no `localStorage` do navegador e a sessão do usuário no `sessionStorage`.

---

## 1. Visão geral da arquitetura

```
Páginas HTML (login, admin, coordenador, instrutor, recepcao)
        │
        ▼
css/main.css ──────────► importa todos os módulos CSS
        │
        ▼
js/storage.js ──────► camada de dados (seed, CRUD, sessão, tema, UI)
js/auth.js ─────────► proteção de rotas por perfil + sidebar
js/search.js ───────► motor de busca/filtros reutilizável
js/calendario_page.js ► calendário mensal/semanal
js/<perfil>_page.js ─► lógica de cada painel (admin, coordenador, instrutor, recepcao)
```

**Fluxo de dados:** a página chama funções globais (via `onclick`) → o `*_page.js` lê/escreve na camada `storage.js` → o `storage.js` sincroniza com o `localStorage` e re-renderiza a tela.

> **Importante:** funções são globais (sem módulos/namespaces), então evitar nomes de função duplicados entre arquivos.

---

## 2. Páginas HTML

| Arquivo | Perfil/Tela | Scripts que carrega |
|---|---|---|
| `login.html` | Login (unidade + e-mail + senha) | `storage.js`, `auth.js`, `login_page.js` |
| `index.html` | Landing page institucional | `storage.js`, `index_page.js` |
| `admin.html` | Painel do administrador | `storage.js`, `calendario_page.js`, `auth.js`, `search.js`, `admin_page.js` |
| `coordenador.html` | Painel do coordenador | `storage.js`, `calendario_page.js`, `auth.js`, `search.js`, `coordenador_page.js` |
| `instrutor.html` | Painel do instrutor | `storage.js`, `calendario_page.js`, `auth.js`, `search.js`, `instrutor_page.js` |
| `recepcao.html` | Painel da recepção | `storage.js`, `calendario_page.js`, `auth.js`, `search.js`, `recepcao_page.js` |
| `dashboard.html` | Painel antigo (legado) | scripts antigos (`salas.js`, `turmas.js`, `reservas.js`, `disponibilidade.js`, `dashboard_page.js`) |

---

## 3. CSS

Todos os HTMLs internos referenciam **apenas** `css/main.css`, que importa os módulos na ordem:

```
main.css → variables → reset → login → layout → components → forms
         → buttons → table → modal → toast → notifications → keys
         → map → search → calendario → dashboard → landing → icons
```

| Arquivo | Responsabilidade |
|---|---|
| `variables.css` | Design tokens: `--primary` (`#1a3a5c`), `--surface`, `--text*`, `--border*`, `--r` (raio), `--t` (transição) e tema escuro via `[data-theme=dark]` |
| `reset.css` | Normalização de navegador + utilitários globais |
| `login.css` | Tela de login: caixa, logo, campos, botão |
| `layout.css` | Sidebar (`.sb-*`), topbar (`.tb-*`), `.main`, `.pg.ativa`, responsividade |
| `components.css` | Cards (`.stat`, `.card`), badges, chips (`.chips .chip`), status |
| `forms.css` | `.fg` (grade), `.ff` (campo), `.fmsg` (mensagem), `.fg.g2/.g3` |
| `buttons.css` | `.btn`, `.btn-primary/-ghost/-danger/-warning/-success`, `.btn-sm`, `.btn-refresh` |
| `table.css` | `.tbl`, `.tw`, linha vazia `.empty-row`, ações em tabela |
| `modal.css` | `.modal-overlay`, `.modal-box`, `.modal-title`, `.modal-foot` |
| `toast.css` | `#toasts .toast` (tipos `ok`, `erro`, `aviso`, `info`) |
| `notifications.css` | `.notif-*`: itens de notificação/solicitação, lidas/não lidas |
| `keys.css` | Cards de chaves físicas (`.key-*`) |
| `map.css` | Mapa de salas: `.mapa-filtros`, `.mapa-legenda`, cards `.sala-card`, `.ic-livre/.ic-ocupada/.ic-iminente` |
| `search.css` | `.search-bar`, `.filter-select`, botão limpar filtros |
| `calendario.css` | `.cal-*`: toolbar, navegação, grade mês/semana, legenda, detalhe do dia |
| `dashboard.css` | Classes exclusivas do `dashboard.html` |
| `landing.css` | Hero, seções, cards de funcionalidades/perfil, steps, footer da `index.html` |
| `icons.css` | Ajustes de ícones Phosphor |

**Convenção:** para alterar um visual específico, edite apenas o módulo correspondente — as variáveis do `variables.css` propagam automaticamente (incluindo o tema escuro).

---

## 4. Camada de dados — `js/storage.js`

O "cérebro de dados" do sistema. Simula um backend inteiro em memória + `localStorage`.

### 4.1 Estrutura interna

- `_K` — chaves do `localStorage` (prefixo `sn_v6_`): `usuarios`, `unidades`, `salas`, `turmas`, `reservas`, `chaves`, `notificacoes`, `solicitacoes`, `sessao`, `tema`, `init`.
- `CACHE` — espelho em memória de todas as listas, carregado por `_load()`.
- `_lv(key)` / `_sv(key, val)` — leitura/escrita JSON no `localStorage`.
- `_seedDados()` — popula os dados iniciais no **primeiro acesso** (`_K.init` vazio).

### 4.2 Seed (dados iniciais)

| Entidade | Qtde | IDs |
|---|---|---|
| Unidades | 10 | 1001–1010 (Asa Norte → Águas Claras) |
| Usuários | 42 | 1 (admin) + 11 coordenadores (2001–2011) + 20 instrutores (3001–3020) + 10 recepção (4001–4010) |
| Salas | 50 | 5001–5050 |
| Turmas | 40 | 6001–6040 |
| Reservas | 41 | 7001–7041 (40 ativas + 1 cancelada) |
| Chaves | 30 | 8001–8030 |
| Notificações | 4 | 9001–9004 |
| Solicitações | 4 | 10001–10004 |

Salas 5032 (`manutencao`) e 5047 (`bloqueada`) possuem **status manual** (override) preenchido.

### 4.3 Funções principais

**Leitura (retornam cópias do cache):**
- `getUsuarios()`, `getUnidades()`, `getSalas()`, `getTurmas()`, `getReservas()`, `getChaves()`, `getNotifs()`, `getSolics()`
- `getUsuarioById(id)` / `getUserById(id)`, `getUnidadeById(id)`, `getSalaById(id)`, `getTurmaById(id)`, `getReservaById(id)`, `getChaveById(id)`
- `getUsersByPerfil(p)` / `getUsuariosByPerfil(p)` — filtra por perfil (`coordenador`, `instrutor`, `recepcao`)
- `getSalasByUnidade(uid)`, `getNotifsPara(perfil, unidadeId)`

**CRUD (sempre sincronizam o `CACHE` e o `localStorage`):**
- Usuários: `addUser(dados)`, `updUser(id, dados)`, `delUser(id)` (+ aliases `addUsuario/updUsuario/delUsuario`)
- Unidades: `addUnidade(d)`, `updUnidade(id, d)`, `delUnidade(id)`
- Salas: `addSala(d)`, `updSala(id, d)` (+ aliases `updateSala`, `deleteSala`) — normaliza `turnos` ↔ `turnosDisponiveis`
- Turmas: `addTurma(d)`, `updTurma(id, d)`, `delTurma(id)` — `delTurma` remove as reservas vinculadas
- Reservas: `addReserva(d)` / `addReservaAsync(d)`, `updReserva(id, d)`, `delReserva(id)`
- Chaves: `addChave(d)`, `updChave(id, d)`, `delChave(id)`; `retirarChave(id, instrutorId)` (grava `pegaEm`), `devolverChaveApi(id)` (limpa responsável)
- Solicitações: `addSolic(d)`, `updSolic(id, d)`
- Notificações: `addNotif(d)` — campos `tipo`, `titulo`, `msg`, `paraPerfil`, `paraId`, `unidadeId`, `lida`, `criadaEm`; `countNaoLidas(perfil, unidadeId)`, `marcarTodasLidas(perfil, unidadeId)`

**Autenticação e sessão:**
- `loginUser(email, senha)` — busca usuário por e-mail + senha (case-insensitive no e-mail)
- `getSessao()`, `setSessao(u)`, `clearSessao()` — sessão em `sessionStorage`

**Status manual de sala (override):**
- `getOverride(salaId, unidadeId)`, `setOverride(salaId, unidadeId, status, motivo, por)` — estados `manutencao` / `bloqueada`

**Utilidades e UI:**
- Datas: `hojeISO()`, `newId()`, `fmtData(iso)` (ISO → dd/mm/aaaa), `fmtDateTime(v)`, `calcStatus(turma)` (ativa/iminente/posterior/encerrada — iminente = até 7 dias)
- Segurança de render: `esc(s)` / `escapeHtml(s)` (escape de HTML)
- `iniciais(nome)` — avatar com iniciais
- Feedback: `toast(msg, tipo)`, `showToast`, `fmsg(id, tipo, msg)`, `showMsg(id, tipo, msg)` (+ `fmsgHide`, `hideMsg`)
- Modais: `modalAbrir(id)`, `modalFechar(id)`
- Tema: `initTema()`, `toggleTema()`, `getTema()`
- `atualizarSecao(fnName, btn)` — executa uma função de render com estado "Atualizando..." no botão
- `initDados(force)` / `loadAllData(force)` — inicialização assíncrona (assinatura compatível com `api.js` ausente)

---

## 5. Autenticação — `js/auth.js`

- `requirePerfil(perfil)` — bloqueia a página se a sessão não for do perfil esperado; redireciona para o login (ou para o painel correto se já logado com outro perfil).
- `seJaLogado()` — se já há sessão, redireciona para o painel do perfil.
- `sair()` — limpa a sessão e volta para `login.html`.
- `initSidebar()` — preenche nome, e-mail e perfil do usuário na sidebar.
- `initLogo()` — aplica o logo.

---

## 6. Busca e filtros — `js/search.js`

- `filtrarLista(lista, termo, campos)` — busca textual (case-insensitive) nos campos informados.
- `aplicarFiltros(lista, filtros)` — aplica filtros exatos (`{campo: valor}`).
- `htmlBarraBusca(placeholder, inputId)` — HTML da caixa de busca.
- `htmlFiltroSelect(id, label, opcoes)` — HTML de filtro dropdown.
- `montarBarraPesquisaFiltros(containerId, config, onUpdate)` — monta busca + filtros e chama `onUpdate` a cada mudança.
- `limparFiltros(containerId, buscaId)`, `lerFiltros(config)` — utilitários de estado.

---

## 7. Calendário — `js/calendario_page.js`

Funções globais expostas:
- `calHoje()`, `calAnterior()`, `calProximo()` — navegação
- `calVista('mes'|'semana')` — alterna visualização
- `calFiltrar()` — aplica filtros de sala/turno
- `calDia(iso)` — seleciona um dia e mostra detalhes

Núcleo interno (funções `_*`):
- `_res()` — reservas ativas do período
- `_mes()` / `_sem()` — renderiza grade mensal/semanal
- `_detalhe(dt)` — painel lateral com reservas/ocupação do dia
- `_ocorre(r, dt)` — verifica se a reserva ocorre na data (recorrência + período + dias da semana)

---

## 8. Painel do Administrador — `js/admin_page.js`

| Função | Papel |
|---|---|
| `ir(aba)` | Navega entre abas (dashboard, usuarios, unidades, salas, turmas, reservas, chaves, calendario) |
| `rdDash()` | Contadores globais + últimos usuários |
| `rdUsuarios()` / `_renderTbUsuarios()` | Lista usuários com busca/filtros |
| `abrirUser(id)` / `salvarUser()` / `resetSenha(id)` / `excluirUser(id)` | CRUD de usuários (valida e-mail único) |
| `rdUnidades()` / `_renderTbUnidades()` | Lista unidades |
| `abrirUnid(id)` / `salvarUnid()` / `excluirUnid(id)` | CRUD de unidades (bloqueia exclusão com usuários vinculados) |
| `rdTodasSalas()` / `_renderTbSalasAdmin()` | Visão global de salas (somente leitura) |
| `rdTodasTurmas()` / `_renderTbTurmasAdmin()` | Visão global de turmas |
| `rdTodasReservas()` / `_renderTbResAdmin()` | Visão global de reservas |
| `rdTodasChaves()` / `_renderTbChavAdmin()` | Visão global de chaves |

---

## 9. Painel do Coordenador — `js/coordenador_page.js`

| Função | Papel |
|---|---|
| `ir(aba)` | Navegação (dashboard, salas, turmas, reservas, instrutores, mapa, calendario, solicitacoes, notifs) |
| `rdDash()` | Estatísticas da unidade |
| `rdSalas()` / `abrirSala(id)` / `salvarSala()` / `excluirSala(id)` | CRUD de salas da unidade |
| `rdTurmas()` / `abrirTurma(id)` / `salvarTurma()` / `excluirTurma(id)` | CRUD de turmas da unidade |
| `rdReservas()` / `abrirReserva(id)` / `salvarReserva()` / `excluirReserva(id)` | CRUD de reservas recorrentes |
| `checarConflito(salaId, turno, dias, dataInicio, dataFim, ignorarId)` | **Detecção de conflito** (mesma sala + turno + dia da semana + período sobreposto) |
| `rdInstrutores()` / `abrirAtrib(instId)` / `salvarAtrib()` | Atribuição de turmas a instrutores |
| `_calcSalaStatus(s, hj, turnoFiltro)` / `_buildSalaCard(s, info)` | Status e card do mapa (livre/ocupada/iminente + status manual) |
| `ovClick(btn)` / `_setOverride(salaId, unidadeId, status)` | Define status manual (manutenção/bloqueada) com motivo |
| `rdMapa()` / `_popularFiltrosMapa()` / `_rdMapaFuturas()` | Mapa de salas + próximas reservas (14 dias) |
| `rdSolics()` / `responderSolic(id, status)` | Aprovar/recusar solicitações (aprovar cria reserva + notifica) |
| `rdNotifs()` / `marcarTodasLidasLocal()` / `_atualizarBadges()` | Notificações com contadores |

---

## 10. Painel do Instrutor — `js/instrutor_page.js`

| Função | Papel |
|---|---|
| `ir(aba)` | Navegação (turmas, salas, calendario, notifs) |
| `rdTurmas()` / `_renderTurmasInst()` | Minhas turmas (filtradas por `instrutorId` da sessão) |
| `rdSalas()` | Disponibilidade de salas da unidade |
| `abrirSolic(salaId)` | Abre modal de solicitação |
| `slModoData(modo)` | Alterna entre **data única / período / datas avulsas** |
| `slToggleTurno(el)` / `_getTurnosSolic()` | Seleção de turnos |
| `slAdicionarData()` / `slRemoverData(iso)` / `_renderDatasEspecificas()` | Gerencia datas avulsas |
| `verificarDisponibilidadeSolic()` | Checa conflitos em tempo real e exibe resultado |
| `enviarSolic()` | Valida e cria a solicitação (`addSolic`) + notifica o coordenador |
| `rdNotifs()` / `_atualizarBadge()` | Notificações do instrutor |

Helpers de data: `_dateFromIsoLocal`, `_isoFromDateLocal`, `_diaSemanaIso`, `_datasNoPeriodo`, `_diasSemanaDatas`.

---

## 11. Painel da Recepção — `js/recepcao_page.js`

| Função | Papel |
|---|---|
| `ir(aba)` | Navegação (mapa, calendario, chaves, notifs) |
| `_calcSalaStatusRec(s, hj)` / `_buildSalaCardRec(s, info)` | Mapa de salas (somente leitura) |
| `_popularFiltrosMapaRec()` / `rdMapa()` | Mapa + próximas reservas (14 dias) |
| `rdChaves()` / `_buildChaveCard(c)` / `_renderChavRec()` | Cards das chaves (disponível/retirada) |
| `abrirChave(id)` / `salvarChave()` / `excluirChave(id)` | CRUD de chaves |
| `abrirAtribuir(chaveId)` / `confirmarAtribuir()` | Atribui chave a instrutor/coordenador (grava horário) |
| `devolverChaveRec()` / `liberarChaveRapido(chaveId)` | Libera/devolve a chave |
| `rdNotifs()` / `_atualizarBadge()` | Notificações da recepção |

---

## 12. Telas antigas (legado)

Mantidos por compatibilidade — **não** são usados pelas telas atuais:
- `js/admin.js`, `js/coordenador.js`, `js/instrutor.js`, `js/recepcao.js` — versões anteriores dos painéis.
- `js/salas.js`, `js/turmas.js`, `js/reservas.js`, `js/disponibilidade.js`, `js/dashboard_page.js`, `js/script.js` — usados pelo `dashboard.html` (painel antigo).

> Antes de remover qualquer arquivo, confirme que nenhum HTML o referencia.

---

## 13. Fluxos de negócio

### Login
`login_page.js` → `loginUser(email, senha)` → `setSessao(usuario)` → redireciona por perfil: `admin.html`, `coordenador.html`, `instrutor.html` ou `recepcao.html`.

### Reserva recorrente (coordenador)
1. `abrirReserva()` abre o modal com salas/turmas da unidade.
2. `_popularTurnosReserva()` restringe turnos aos disponíveis da sala.
3. `salvarReserva()` chama `checarConflito(...)`; se houver conflito, exibe a turma e os dias conflitantes.
4. `addReserva(d)` persiste; a tela re-renderiza (`rdReservas`).

### Solicitação de sala (instrutor → coordenador)
1. `abrirSolic(salaId)` abre o modal com dados da sala.
2. Instrutor define datas (única/período/avulsas) e turnos.
3. `verificarDisponibilidadeSolic()` consulta conflitos em tempo real.
4. `enviarSolic()` → `addSolic({... status:'pendente'})` + `addNotif(paraPerfil:'coordenador')`.
5. `responderSolic(id, 'aprovada')` cria a reserva (via `addReserva`) e notifica o instrutor; `'recusada'` apenas notifica com o motivo.

### Gestão de chaves (recepção)
- `abrirChave(0)` cadastra chave vinculada a uma sala.
- `abrirAtribuir(chaveId)` seleciona responsável; `confirmarAtribuir()` → `retirarChave(id, usuarioId)` (status `pega` + `pegaEm`).
- `devolverChaveRec()` → `devolverChaveApi(id)` (status `disponivel`, limpa responsável e horário).

### Mapa de salas
- `_calcSalaStatus()` cruza: reservas ativas/iminentes da unidade + status manual.
- Ordena e agrupa por **Bloco → Andar**.
- Filtros: busca textual, bloco, andar, turno, status (renderiza `rdMapa()` a cada mudança).
- Status: 🟢 livre · 🔴 ocupada · 🟡 em breve (iminente hoje) + estados manuais `manutencao`/`bloqueada`.

### Override (status manual)
- `ovClick(btn)` abre ação; `_setOverride(salaId, unidadeId, status)` grava via `setOverride` com motivo e autor.
- Solicitações futuras para sala em manutenção são alertadas.

---

## 14. Notificações

Campos: `tipo` (`info` | `ok` | `aviso`), `titulo`, `msg`, `paraPerfil`, `paraId`, `unidadeId`, `lida`, `criadaEm`.

- `addNotif(d)` cria; `countNaoLidas(perfil, unidadeId)` alimenta os badges da sidebar (`badgeNotif`, `badgeSolic`).
- Cada painel renderiza com `rdNotifs()` própria e `marcarTodasLidasLocal()`.

---

## 15. Pontos de atenção

- **Dados locais:** limpar o `localStorage` apaga o "banco". Os dados são recriados no próximo acesso via `_seedDados()`.
- **Multi-aba:** a sessão fica em `sessionStorage`; cada aba tem sessão independente.
- **Sem backend:** usuários em navegadores/computadores diferentes não compartilham dados.
- **Funções globais:** nomes repetidos entre arquivos JS podem causar conflito — evite duplicar.
- **IDs duplicados no HTML** quebram `document.getElementById()`.
- **Legado:** arquivos antigos convivem com `*_page.js`; verifique referências antes de excluir.

---

## 16. Ordem sugerida de leitura

1. `login.html` / `index.html` — entrada do sistema.
2. `js/storage.js` — dados, seed e regras de negócio.
3. `js/auth.js` — sessão e perfis.
4. `js/search.js` — busca/filtros.
5. `js/<perfil>_page.js` + o HTML correspondente — lógica de cada tela.
6. `css/variables.css` e `css/main.css` — entender o visual.
