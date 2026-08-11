# Caso de Uso — Sistema de Reserva de Salas SENAC-GDF

**Versão:** 5 (4 painéis por perfil + Calendário + Status Manual)
**Tecnologias:** HTML5 · CSS3 modular · JavaScript puro · localStorage/sessionStorage

---

## 1. Visão Geral do Sistema

O **Sistema de Reserva de Salas SENAC-GDF** é uma aplicação web front-end que gerencia a ocupação de salas nas 10 unidades do SENAC no Distrito Federal. Não há servidor nem banco de dados — toda a persistência é feita via `localStorage` (dados) e `sessionStorage` (sessão).

### Principais características da versão atual

- **4 painéis por perfil**: `admin.html`, `coordenador.html`, `instrutor.html` e `recepcao.html`
- **Dados seed completos** carregados automaticamente no primeiro acesso (10 unidades, 42 usuários, 50 salas, 40 turmas, 41 reservas, 30 chaves)
- **Reservas recorrentes** por turno e dias da semana, com **detecção automática de conflitos**
- **Mapa de Salas** com cards organizados por **Bloco → Andar**, status colorido (livre/ocupada/em breve) e filtros em tempo real
- **Status manual (override)** de salas — manutenção / bloqueada, com motivo e autor
- **Solicitações de sala** do instrutor com aprovação/recusa do coordenador (aprovação cria a reserva)
- **Controle de chaves** pela recepção com horário de retirada/devolução
- **Calendário mensal/semanal** com filtros e detalhe do dia, em todos os painéis
- **Pesquisa e filtros** em todas as listagens
- **CSS 100% modular** e **tema claro/escuro**

---

## 2. Atores

| Ator | Login de exemplo | Senha |
|---|---|---|
| **Administrador** | `Senac_GDF@Hotmail.com` | `Senac.DF2007` |
| **Coordenador** (Asa Norte) | `coord.asanorte@senacdf.com` | `Coord@123` |
| **Instrutor** (Asa Norte) | `katia.barros@senacdf.com` | `Inst@123` |
| **Recepção** (Asa Norte) | `recep.asanorte@senacdf.com` | `Recep@123` |

> Todos os demais usuários seguem o mesmo padrão: **11 coordenadores** (2 na Asa Norte — `coord.asanorte@senacdf.com` e `coord.Paulo@senacdf.com` — e 1 nas demais unidades), **20 instrutores** e **10 recepcionistas**. Senhas por perfil: `Coord@123`, `Inst@123`, `Recep@123`. Para restaurar o estado inicial, limpe o `localStorage` do site e recarregue.

---

## 3. Dados Seed (carregados automaticamente no 1º acesso)

| Entidade | Quantidade | Detalhes |
|---|---|---|
| Unidades | 10 | Asa Norte, Asa Sul, Taguatinga, Ceilândia, Gama, Sobradinho, Planaltina, Samambaia, Santa Maria, Águas Claras — com endereço e CEP reais do DF |
| Usuários | 42 | 1 administrador + 11 coordenadores (2001–2011) + 20 instrutores (3001–3020) + 10 recepção (4001–4010) |
| Salas | 50 | 5 por unidade, com **andar** e **bloco** — labs de informática, gastronomia, estética, enfermagem, ciências, salas comuns, auditórios, videoconferência, maker, coworking, idiomas, games, marketing… |
| Turmas | 40 | 4 por unidade — cursos técnicos e livres com datas relativas ao dia atual (ativas, iminentes, posteriores) |
| Reservas | 41 | 40 ativas (1 por turma) + 1 cancelada — dias da semana variados e turnos correspondentes |
| Chaves | 30 | 3 por unidade — disponíveis e retiradas por instrutores, com horário registrado |
| Notificações | 4 | Exemplos de info/aviso/ok com lidas e não lidas |
| Solicitações | 4 | Pendentes, aprovada e recusada, com motivo de recusa |

**Status manuais de exemplo:** sala 5032 em `manutencao` ("Projetor em revisão") e sala 5047 `bloqueada` ("Limpeza técnica agendada").

---

## 4. Casos de Uso

### UC-01 — Login
**Atores:** Todos
**Fluxo principal:** o usuário acessa `login.html`, seleciona a **unidade**, informa e-mail e senha e clica em "Entrar". O sistema valida as credenciais no `localStorage`, grava a sessão em `sessionStorage` e redireciona para o painel do perfil.
**Fluxo alternativo:** credenciais inválidas exibem mensagem de erro sem redirecionar.
**Tela:** `login.html`

---

### UC-02 — Gerenciar Unidades *(Administrador)*
**Tela:** `admin.html` → aba **Unidades / CPS**
**Funcionalidades:**
- Criar, editar e excluir unidades (nome, endereço, CEP)
- **Pesquisa em tempo real** por nome, cidade ou CEP

**Restrição:** não é possível excluir uma unidade com usuários vinculados — o sistema exibe quantos usuários estão vinculados.

---

### UC-03 — Gerenciar Usuários *(Administrador)*
**Tela:** `admin.html` → aba **Usuários**
**Funcionalidades:**
- Criar, editar, **redefinir senha** e excluir usuários (coordenador, instrutor, recepção)
- Filtros por perfil e unidade + busca por nome/e-mail + contador de resultados

**Restrição:** e-mails devem ser únicos. Novos usuários exigem senha definida no cadastro.

---

### UC-04 — Visão Global do Sistema *(Administrador)*
**Tela:** `admin.html` → abas **Salas**, **Turmas**, **Reservas**, **Chaves**
**Descrição:** o administrador visualiza e pesquisa registros de **todas as unidades** em uma única tela. Modo somente leitura.

| Aba | Busca textual | Filtros |
|---|---|---|
| Salas | Nome, tipo | Unidade, Tipo |
| Turmas | Código, curso | Unidade, Turno, Status |
| Reservas | Sala, turma, turno | Unidade, Turno, Status |
| Chaves | Código, sala, andar | Unidade, Status |

---

### UC-05 — Calendário de Reservas *(Todos os perfis)*
**Telas:** `admin.html`, `coordenador.html`, `instrutor.html`, `recepcao.html` → aba **Calendário**
**Funcionalidades:**
- Visualização **mensal** e **semanal**
- Navegação por período e botão "Hoje"
- Filtros por **sala** e **turno**
- Painel lateral com **detalhe do dia** (reservas/ocupação)
- Legenda de cores por turno (Matutino / Vespertino / Noturno / Sem turma)

---

### UC-06 — Gerenciar Salas *(Coordenador)*
**Tela:** `coordenador.html` → aba **Salas**
**Funcionalidades:** criar, editar e excluir salas da própria unidade.
**Campos:** nome/número, capacidade, tipo, **andar**, **bloco**, turnos disponíveis (chips).
**Pesquisa e filtros:** busca por nome/tipo/andar/bloco; filtro por tipo.
**Restrição:** não é possível excluir sala com reservas ativas vinculadas.

---

### UC-07 — Gerenciar Turmas *(Coordenador)*
**Tela:** `coordenador.html` → aba **Turmas**
**Funcionalidades:** criar, editar e excluir turmas da própria unidade.
**Campos:** código, curso, turno, instrutor responsável, data de início e fim.
**Status calculado automaticamente:** ativa / iminente / posterior / encerrada.
**Restrição:** ao excluir uma turma, todas as reservas vinculadas são removidas automaticamente.

---

### UC-08 — Criar Reserva Recorrente *(Coordenador)*
**Tela:** `coordenador.html` → aba **Reservas**
**Descrição:** vincula uma sala a uma turma para dias da semana recorrentes dentro de um período.
**Dados:** sala, turma, turno, dias da semana (seg/ter/qua/qui/sex/sáb), data início e fim.
**Validações:**
1. O turno da reserva deve estar disponível na sala selecionada;
2. A data fim não pode ultrapassar a data fim da turma;
3. **Conflito automático**: mesma sala + mesmo turno + dias sobrepostos + períodos que se cruzam → mensagem indicando a turma e os dias conflitantes.

---

### UC-09 — Atribuir Instrutor a Turma *(Coordenador)*
**Tela:** `coordenador.html` → aba **Instrutores**
**Descrição:** o coordenador seleciona um instrutor da unidade e atribui uma ou mais turmas a ele. A turma passa a aparecer no painel do instrutor.

---

### UC-10 — Mapa de Salas *(Coordenador e Recepção)*
**Telas:** `coordenador.html` e `recepcao.html` → aba **Mapa de Salas**
**Descrição:** exibe todas as salas da unidade organizadas por **Bloco → Andar**, com cards ricos:

| Elemento | O que exibe |
|---|---|
| Nome + dot colorido | Identificação e status visual imediato |
| Tipo de sala | Ex: Laboratório de Informática |
| 🏢 Andar / 📍 Bloco / 👥 Capacidade | Localização e lotação |
| Badges M / V / N | Turnos disponíveis — o turno em uso fica destacado |
| Turma + Instrutor + Turno | Quando ocupada ou iminente |
| "🟢 Disponível" | Quando livre |

**Filtros em tempo real:** busca por nome/tipo, bloco, andar, turno e status.
**Legenda dinâmica:** contadores de livres, ocupadas e em breve.
**Recepção:** também vê a **tabela de próximas reservas** (14 dias).

---

### UC-11 — Status Manual de Sala *(Coordenador)*
**Tela:** `coordenador.html` → aba **Mapa de Salas**
**Descrição:** o coordenador pode definir um status manual de **manutenção** ou **bloqueada** para uma sala, informando **motivo**. O sistema armazena autor e horário, exibe o estado no card do mapa e alerta solicitações futuras para essa sala.

---

### UC-12 — Responder Solicitações *(Coordenador)*
**Tela:** `coordenador.html` → aba **Solicitações**
**Descrição:** o coordenador visualiza as solicitações pendentes e as **aprova** ou **recusa** com um clique.
- **Aprovar** → cria a reserva automaticamente e notifica o instrutor;
- **Recusar** → notifica o instrutor com o motivo (quando informado).

---

### UC-13 — Visualizar Minhas Turmas *(Instrutor)*
**Tela:** `instrutor.html` → aba **Minhas Turmas**
**Descrição:** o instrutor vê as turmas atribuídas a ele com sala reservada, status e período.
**Pesquisa e filtros:** busca por código/curso; filtro por status.

---

### UC-14 — Solicitar Sala *(Instrutor)*
**Tela:** `instrutor.html` → aba **Solicitar Sala**
**Descrição:** o instrutor visualiza a disponibilidade das salas da unidade e envia uma solicitação ao coordenador.
**Modal de solicitação:**
- Modos de data: **data única**, **período** ou **datas avulsas**
- Turnos múltiplos (chips), horário de início/fim opcional
- Turma opcional vinculada
- **Verificação de disponibilidade em tempo real** (conflitos)
- Motivo/observação

**Fluxo:** solicitação criada com status `pendente` → coordenador aprova ou recusa → instrutor recebe notificação do resultado.

---

### UC-15 — Gestão de Chaves *(Recepção)*
**Tela:** `recepcao.html` → aba **Chaves**
**Funcionalidades:**
- Cadastrar, editar e excluir chaves (código, sala vinculada, andar)
- **Atribuir** chave a instrutor/coordenador (registra horário automaticamente)
- **Liberar/devolver** chave à recepção
- Cards visuais: 🗝️ disponível / 🔑 retirada (com responsável e horário)
- Busca e filtro por status (disponível / retirada)

---

### UC-16 — Notificações *(Todos os perfis)*
**Telas:** `coordenador.html`, `instrutor.html`, `recepcao.html` → aba **Notificações**
**Descrição:** cada perfil recebe notificações relevantes:
- **Coordenador:** novas solicitações, retiradas de chave;
- **Instrutor:** resultado das solicitações (aprovada/recusada), avisos;
- **Recepção:** avisos de salas.
Badges na sidebar com contador de não lidas e ação "marcar todas como lidas".

---

## 5. Pesquisa e Filtros — Resumo

| Tela / Aba | Busca textual | Filtros |
|---|---|---|
| Admin → Usuários | Nome, e-mail | Perfil, Unidade |
| Admin → Unidades | Nome, cidade, CEP | — |
| Admin → Salas | Nome, tipo | Unidade, Tipo |
| Admin → Turmas | Código, curso | Unidade, Turno, Status |
| Admin → Reservas | Sala, turma, turno | Unidade, Turno, Status |
| Admin → Chaves | Código, sala, andar | Unidade, Status |
| Admin → Calendário | — | Sala, Turno |
| Coordenador → Salas | Nome, tipo, andar, bloco | Tipo |
| Coordenador → Turmas | Código, curso, instrutor | Turno, Status |
| Coordenador → Reservas | Sala, turma | Turno |
| Coordenador → Instrutores | Nome, e-mail | — |
| Coordenador → Mapa | Nome, tipo | Bloco, Andar, Turno, Status |
| Coordenador → Calendário | — | Sala, Turno |
| Recepção → Mapa | Nome, tipo | Bloco, Andar, Turno, Status |
| Recepção → Chaves | Código, sala, andar, instrutor | Status |
| Recepção → Calendário | — | Sala, Turno |
| Instrutor → Turmas | Código, curso | Status |
| Instrutor → Calendário | — | Sala, Turno |

---

## 6. Estrutura de Arquivos

```
reserva-de-salas-2/
├── index.html            — Landing page institucional
├── login.html            — Tela de login (unidade + e-mail + senha)
├── admin.html            — Painel do administrador
├── coordenador.html      — Painel do coordenador
├── instrutor.html        — Painel do instrutor
├── recepcao.html         — Painel da recepção
├── dashboard.html        — Painel antigo (legado)
│
├── css/
│   ├── main.css          ← ÚNICO CSS referenciado (importa os módulos)
│   ├── variables.css · reset.css · login.css · layout.css
│   ├── components.css · forms.css · buttons.css · table.css
│   ├── modal.css · toast.css · notifications.css · keys.css
│   ├── map.css · search.css · calendario.css · dashboard.css
│   ├── landing.css · icons.css · style.css · phosphor.css
│
├── js/
│   ├── storage.js          — Camada de dados + seed (v6)
│   ├── auth.js             — Autenticação e proteção por perfil
│   ├── login_page.js       — Lógica do login
│   ├── search.js           — Motor de pesquisa e filtros
│   ├── calendario_page.js  — Calendário (mês/semana)
│   ├── admin_page.js       — Lógica do painel admin
│   ├── coordenador_page.js — Lógica do painel coordenador
│   ├── instrutor_page.js   — Lógica do painel instrutor
│   ├── recepcao_page.js    — Lógica do painel recepção
│   ├── index_page.js       — Landing page
│   └── (legado) dashboard_page.js · salas.js · turmas.js · reservas.js ·
│       disponibilidade.js · admin.js · coordenador.js · instrutor.js ·
│       recepcao.js · script.js
│
└── img/
    └── senac-logo-sem-fundo.webp
```

---

## 7. Arquitetura CSS Modular

Todos os HTMLs internos referenciam apenas `css/main.css`, que usa `@import` para carregar os módulos na ordem correta. As variáveis de `variables.css` propagam automaticamente, incluindo o **tema escuro** (`[data-theme=dark]`).

---

## 8. Fluxo Completo de Uso Típico

**Cenário:** organização de uma nova turma na unidade Asa Norte.

1. **Admin** (`Senac_GDF@Hotmail.com`) faz login → vê no dashboard os totais globais → pesquisa "Asa Norte" na aba Salas para conferir os cadastros.

2. **Coordenadora** Ana Paula (`coord.asanorte@senacdf.com`) faz login → **Salas** → cadastra "Lab 04" com andar "2º Andar", bloco "Bloco C", tipo "Laboratório de Informática", turnos Matutino e Noturno.

3. Ana Paula vai em **Turmas** → cria a turma "2025.04.104", curso "Técnico em Redes", turno Matutino, e atribui à instrutora Katia Barros (aba **Instrutores**).

4. Em **Reservas**, Ana Paula seleciona Lab 04 + turma 2025.04.104 → marca seg/ter/qua/qui/sex → o sistema valida o turno e confirma ausência de conflito → reserva criada.

5. No **Mapa de Salas**, Ana Paula filtra por "Bloco C" → vê Lab 04 verde (🟢 livre) com badges M e N nos turnos disponíveis e, nas **Próximas Reservas**, a turma com o período e os dias.

6. **Recepcionista** Úrsula (`recep.asanorte@senacdf.com`) faz login → vê o mapa → cadastra a chave "CH-021" para Lab 04 no 2º Andar.

7. **Instrutora** Katia (`katia.barros@senacdf.com`) faz login → **Minhas Turmas** → vê a turma 2025.04.104 com Lab 04 reservado e status Iminente → **Solicitar Sala** não é necessário (sala já vinculada).

8. No dia seguinte, o mapa atualiza: Lab 04 fica 🔴 (ocupada) no turno Matutino, com nome da turma e da instrutora no card. Úrsula retira/controla a chave pelo painel da recepção.

9. Katia precisa de uma aula extra → **Solicitar Sala** → escolhe Lab 03, modo "Período", turno Vespertino, motivo → envia. Ana Paula recebe a notificação, **aprova** → a reserva é criada e Katia é notificada.

---

## 9. Logins de Teste Rápido

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | Senac_GDF@Hotmail.com | Senac.DF2007 |
| Coord. Asa Norte | coord.asanorte@senacdf.com | Coord@123 |
| Coord. Taguatinga | coord.taguatinga@senacdf.com | Coord@123 |
| Coord. Águas Claras | coord.aguasclaras@senacdf.com | Coord@123 |
| Instrutor Asa Norte | katia.barros@senacdf.com | Inst@123 |
| Instrutor Gama | olivia.martins@senacdf.com | Inst@123 |
| Recepção Asa Norte | recep.asanorte@senacdf.com | Recep@123 |
| Recepção Águas Claras | recep.aguasclaras@senacdf.com | Recep@123 |
