# SENAC Reservas — Sistema Web

Sistema de Reserva de Salas do **SENAC GDF**. Aplicação web em HTML/CSS/JS puro com **4 telas por perfil** — Administrador, Coordenador, Instrutor e Recepção — que gerencia a ocupação de salas nas unidades do SENAC no Distrito Federal: cadastro de unidades, usuários, salas, turmas, reservas recorrentes, mapa de ocupação, solicitações de sala e controle de chaves físicas.

Não há servidor nem banco de dados: toda a persistência acontece no próprio navegador via `localStorage` (dados) e `sessionStorage` (sessão do usuário).

---

## Stack

*   **HTML5** + **CSS3 modular** (um `main.css` que importa módulos por responsabilidade)
*   **JavaScript puro** (ES6+) — sem frameworks, sem build, sem dependências
*   **localStorage** — persistência dos dados (unidades, usuários, salas, turmas, reservas, chaves)
*   **sessionStorage** — sessão do usuário logado
*   **Phosphor Icons** — ícones da interface
*   **Tema claro/escuro** — preferência salva automaticamente

---

## Estrutura de pastas

```
reserva-de-salas-2/
├── index.html            — Landing page institucional
├── login.html            — Tela de login (unidade + e-mail + senha)
├── admin.html            — Painel do administrador
├── coordenador.html      — Painel do coordenador
├── instrutor.html        — Painel do instrutor
├── recepcao.html         — Painel da recepção
├── dashboard.html        — Painel antigo (mantido por compatibilidade)
│
├── css/
│   ├── main.css          ← ÚNICO CSS referenciado nos HTMLs
│   │                        (importa os módulos abaixo em ordem)
│   ├── variables.css     — Tokens de design: cores, sombras, tema claro/escuro
│   ├── reset.css         — Normalização base + utilitários globais
│   ├── login.css         — Tela de login
│   ├── layout.css        — Sidebar, topbar e estrutura das páginas internas
│   ├── components.css    — Cards, stats, badges, chips, status
│   ├── forms.css         — Inputs, selects, textareas, mensagens de feedback
│   ├── buttons.css       — Todos os estilos de botão
│   ├── table.css         — Tabelas de dados
│   ├── modal.css         — Modais (overlay, caixa, cabeçalho, rodapé)
│   ├── toast.css         — Pop-ups de feedback breve
│   ├── notifications.css — Itens de notificação e solicitação
│   ├── keys.css          — Cards de chaves físicas
│   ├── map.css           — Mapa de salas (cards por bloco/andar)
│   ├── search.css        — Barras de pesquisa e filtros
│   ├── calendario.css    — Calendário mensal/semanal
│   ├── dashboard.css     — Classes exclusivas do dashboard.html
│   ├── landing.css       — Página inicial institucional
│   └── icons.css         — Ajustes de ícones Phosphor
│
├── js/
│   ├── storage.js          — Camada de dados: seed + CRUD + sessão + tema + UI helpers
│   ├── auth.js             — Proteção de páginas por perfil e sidebar
│   ├── login_page.js       — Lógica da tela de login
│   ├── search.js           — Motor de pesquisa e gerador de filtros
│   ├── calendario_page.js  — Calendário (mês/semana, filtros, detalhe do dia)
│   ├── admin_page.js       — Lógica do painel do administrador
│   ├── coordenador_page.js — Lógica do painel do coordenador
│   ├── instrutor_page.js   — Lógica do painel do instrutor
│   ├── recepcao_page.js    — Lógica do painel da recepção
│   ├── index_page.js       — Landing page
│   ├── dashboard_page.js   — Painel antigo
│   └── (salas.js, turmas.js, reservas.js, disponibilidade.js,
│       admin.js, coordenador.js, instrutor.js, recepcao.js, script.js)
│       — Versões antigas mantidas por compatibilidade; as telas atuais
│         usam os arquivos *_page.js
│
└── img/
    └── senac-logo-sem-fundo.webp
```

---

## Como rodar

Não precisa instalar nada nem rodar build. Basta servir a pasta como site estático:

```
python -m http.server 8080
```

e abrir `http://localhost:8080/login.html` (ou simplesmente abrir `login.html` direto no navegador).

**Primeiro acesso:** os dados de demonstração são criados automaticamente no `localStorage` (10 unidades, 42 usuários, 50 salas, 40 turmas, 41 reservas, 30 chaves).

**Restaurar os dados iniciais:** limpe o `localStorage` do site (DevTools → Application → Local Storage → limpar) e recarregue a página.

---

## Credenciais de teste

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `Senac_GDF@Hotmail.com` | `Senac.DF2007` |
| Coordenador (Asa Norte) | `coord.asanorte@senacdf.com` | `Coord@123` |
| Instrutor (Asa Norte) | `katia.barros@senacdf.com` | `Inst@123` |
| Recepção (Asa Norte) | `recep.asanorte@senacdf.com` | `Recep@123` |

> Existem **11 coordenadores** (2 na Asa Norte: `coord.asanorte@senacdf.com` e `coord.Paulo@senacdf.com`; 1 nas demais unidades), **20 instrutores** e **10 recepcionistas**. Todos os coordenadores usam `Coord@123`, instrutores `Inst@123` e recepções `Recep@123`.

---

## Funcionalidades por perfil

**Administrador** — controle total do sistema:

* Dashboard com contadores globais (usuários, coordenadores, instrutores, unidades, salas, turmas, reservas, chaves)
* CRUD de **usuários** (coordenador, instrutor, recepção) — criar, editar, redefinir senha, excluir; e-mails únicos
* CRUD de **unidades / CPS** — nome, endereço, CEP; bloqueio de exclusão quando há usuários vinculados
* **Visão global somente-leitura** de salas, turmas, reservas e chaves de todas as unidades, com busca e filtros
* **Calendário** mensal/semanal com filtros por sala e turno

**Coordenador** — gestão da própria unidade:

* Dashboard com salas, turmas ativas, reservas e solicitações pendentes
* CRUD de **salas** (nome, capacidade, tipo, andar, bloco, turnos disponíveis)
* CRUD de **turmas** (código, curso, turno, instrutor, datas) com status automático (ativa / iminente / posterior / encerrada)
* **Reservas recorrentes** — vincula sala + turma por turno e dias da semana, com **detecção automática de conflitos**
* **Instrutores** — atribuir turmas aos instrutores da unidade
* **Mapa de Salas** — cards visuais organizados por bloco/andar com status colorido (livre / ocupada / em breve) e filtros em tempo real
* **Solicitações** — aprova ou recusa pedidos de sala dos instrutores (a aprovação cria a reserva)
* **Calendário** e **notificações** com badges de não lidas

**Instrutor** — painel pessoal:

* **Minhas Turmas** — turmas atribuídas com sala reservada, status e período
* **Solicitar Sala** — modal com data única, período ou datas avulsas, turnos, horários opcionais, verificação de disponibilidade e envio ao coordenador
* **Calendário** e **notificações** (resultado das solicitações, avisos)

**Recepção** — ocupação e chaves da unidade:

* **Mapa de Salas** (somente leitura) com filtros + tabela de **próximas reservas (14 dias)**
* **Gestão de Chaves** — cadastrar chaves, atribuir a instrutores/coordenadores, liberar (devolução) com horário registrado
* **Calendário** e **notificações**

---

## Como funciona (caso de uso típico)

1. **Login** — o usuário seleciona a unidade, informa e-mail e senha. O sistema valida no `localStorage` e redireciona para a tela do perfil.
2. **Administrador** cadastra as unidades e os usuários (coordenadores, instrutores, recepção) de cada unidade.
3. **Coordenador** cadastra as salas (com andar, bloco e turnos), cria as turmas e faz as reservas recorrentes — o sistema impede conflitos de sala/turno/dia.
4. **Coordenador** atribui as turmas aos instrutores e acompanha a ocupação pelo Mapa de Salas.
5. **Instrutor** vê suas turmas com a sala reservada; para uma aula extra, solicita uma sala ao coordenador (data única, período ou datas avulsas).
6. **Coordenador** recebe a solicitação, aprova (a reserva entra no sistema) ou recusa — o instrutor é notificado.
7. **Recepção** acompanha o mapa, cadastra as chaves dos laboratórios e controla retirada/devolução por instrutores.
8. Todos os perfis conferem a ocupação no **calendário** mensal/semanal com detalhes por dia.

### Status das salas no mapa

| Status | Cor | Quando |
|---|---|---|
| Livre | 🟢 Verde | sem reserva para o dia/turno atual |
| Ocupada | 🔴 Vermelho | turma ativa reservada para hoje |
| Em breve | 🟡 Amarelo | turma iminente reservada para hoje |

---

## Design

* **CSS 100% modular** — cada parte visual em um arquivo próprio, importado por `css/main.css`; para mudar um visual específico basta editar o módulo correspondente.
* **Design tokens** em `css/variables.css` — cores, sombras, raios e tema escuro propagam automaticamente para todos os módulos. Cor primária: `#1a3a5c`.
* **Tema claro/escuro** com botão no topo, preferência salva e aplicada em todas as telas.
* **Pesquisa e filtros em todas as listagens** com contador de resultados e botão "Limpar filtros".

---

## Versionamento

Repositório: [Starkbr264/reserva-de-salas-2](https://github.com/Starkbr264/reserva-de-salas-2)

© 2026 SENAC · Distrito Federal — Instrutora: Rayssa Paiva Carvalho · Aluno: Enzo Aragão Lages
