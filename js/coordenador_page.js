var _sess;
var _editSalaId = null, _editTurmaId = null, _editReservaId = null;
var _DIAS = [{v:'seg',l:'SEG'},{v:'ter',l:'TER'},{v:'qua',l:'QUA'},{v:'qui',l:'QUI'},{v:'sex',l:'SEX'},{v:'sab',l:'SÁB'}];
var _TURNOS = ['Matutino','Vespertino','Noturno'];

<<<<<<< HEAD
window.addEventListener('DOMContentLoaded', async function() {
  await initDados(); requirePerfil('coordenador'); _sess = getSessao();
=======
window.addEventListener('DOMContentLoaded', function() {
  initDados(); requirePerfil('coordenador'); _sess = getSessao();
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
  initSidebar(); initLogo();
  ir('dashboard');
  _atualizarBadges();
});

/* NAV */
function ir(aba) {
  document.querySelectorAll('.pg').forEach(function(p){ p.classList.remove('ativa'); p.style.display='none'; });
  var pg = document.getElementById('pg-'+aba); if(pg){pg.classList.add('ativa');pg.style.display='block';}
  document.querySelectorAll('.sb-btn').forEach(function(b){ b.classList.remove('ativo'); });
  var btn = document.getElementById('nav-'+aba); if(btn) btn.classList.add('ativo');
  var meta = {
    dashboard:{t:'Dashboard',s:'Visão geral da unidade'},
    salas:{t:'Salas',s:'Cadastre e gerencie as salas'},
    turmas:{t:'Turmas',s:'Cadastre e gerencie turmas'},
    reservas:{t:'Reservas',s:'Reservas recorrentes de salas'},
    instrutores:{t:'Instrutores',s:'Instrutores desta unidade'},
    mapa:{t:'Mapa de Salas',s:'Ocupação atual das salas'},
    solicitacoes:{t:'Solicitações',s:'Pedidos de sala dos instrutores'},
    notifs:{t:'Notificações',s:'Avisos recebidos'},
<<<<<<< HEAD
    calendario:{t:'Calendário de Reservas',s:'Visualize reservas por data e turno'},
=======
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
  };
  var m = meta[aba]||{};
  document.getElementById('tbTitle').textContent = m.t||aba;
  document.getElementById('tbSub').textContent   = m.s||'';
  if(aba==='dashboard')   rdDash();
  if(aba==='salas')       rdSalas();
  if(aba==='turmas')      rdTurmas();
  if(aba==='reservas')    rdReservas();
  if(aba==='instrutores') rdInstrutores();
  if(aba==='mapa'){_popularFiltrosMapa();rdMapa();}
  if(aba==='solicitacoes') rdSolics();
  if(aba==='notifs')      rdNotifs();
<<<<<<< HEAD
  if(aba==='calendario')  rdCalendario();
}

function _uid() { return _sess ? _sess.unidadeId : null; }
function _refreshMapaCoord() {
  if (document.getElementById('mapaSalas')) rdMapa();
}
function _turnosSalaReserva(salaId) {
  var sala = salaId ? getSalaById(parseInt(salaId)) : null;
  var turnos = sala ? (sala.turnos || sala.turnosDisponiveis || []) : [];
  return turnos.length ? turnos : _TURNOS.slice();
}
function _popularTurnosReserva(salaId, preferido) {
  var sel = document.getElementById('mRTurno');
  if (!sel) return;
  var turnos = _turnosSalaReserva(salaId);
  sel.innerHTML = '';
  turnos.forEach(function(t) {
    var o = document.createElement('option');
    o.value = t;
    o.textContent = t;
    sel.appendChild(o);
  });
  _vl('mRTurno', turnos.includes(preferido) ? preferido : turnos[0]);
}
function _diasSemanaDeDatas(datas) {
  var dias = [];
  (datas || []).forEach(function(data) {
    var p = String(data || '').split('-').map(Number);
    if (p.length !== 3 || !p[0] || !p[1] || !p[2]) return;
    var d = ['dom','seg','ter','qua','qui','sex','sab'][new Date(p[0], p[1]-1, p[2]).getDay()];
    if (dias.indexOf(d) === -1) dias.push(d);
  });
  return dias;
}
=======
}

function _uid() { return _sess ? _sess.unidadeId : null; }
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4

/* DASHBOARD */
function rdDash() {
  var salas = getSalasByUnidade(_uid());
  var turmas= getTurmas().filter(function(t){return t.unidadeId===_uid();});
  var res   = getReservas().filter(function(r){return r.unidadeId===_uid();});
  var solic = getSolics().filter(function(s){return s.unidadeId===_uid()&&s.status==='pendente';});
  _tx('stSalas', salas.length);
  _tx('stTurmas', turmas.filter(function(t){return calcStatus(t)==='ativa';}).length);
  _tx('stRes',    res.length);
  _tx('stSol',    solic.length);
  var tb = document.getElementById('tbDash');
  var rec = turmas.slice().sort(function(a,b){return b.id-a.id;}).slice(0,6);
  if(!rec.length){tb.innerHTML='<tr class="empty-row"><td colspan="5">Nenhuma turma cadastrada.</td></tr>';return;}
  tb.innerHTML = rec.map(function(t){
    var inst = t.instrutorId ? getUserById(t.instrutorId) : null;
    return '<tr>'+'<td class="mono"><strong>'+esc(t.nome)+'</strong></td>'
      +'<td>'+esc(t.curso)+'</td>'+'<td>'+esc(inst?inst.nome:'—')+'</td>'
      +'<td>'+htmlStatus(t)+'</td>'
      +'<td style="font-size:.82rem">'+fmtData(t.dataInicio)+' → '+fmtData(t.dataFim)+'</td></tr>';
  }).join('');
}

/* SALAS */
function rdSalas() {
  var list = getSalasByUnidade(_uid()); var tb = document.getElementById('tbSalas');
  if(!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="5">Nenhuma sala cadastrada.</td></tr>';return;}
  tb.innerHTML = list.map(function(s){
    var turnos = (s.turnos||[]).map(function(t){return '<span class="bdg bdg-primary">'+t+'</span>';}).join(' ');
    return '<tr><td><strong>'+esc(s.nome)+'</strong></td><td>'+s.capacidade+' pessoas</td>'
      +'<td>'+esc(s.tipo)+'</td><td>'+turnos+'</td>'
      +'<td><div class="td-actions">'
      +'<button class="btn btn-ghost btn-sm" onclick="abrirSala('+s.id+')">Editar</button>'
      +'<button class="btn btn-danger btn-sm" onclick="excluirSala('+s.id+')">Excluir</button>'
      +'</div></td></tr>';
  }).join('');
}
function abrirSala(id) {
  _editSalaId = id||null; var s = id?getSalaById(id):null;
  _tx('mSTit', id?'Editar Sala':'Nova Sala');
  _vl('mSNome', s?s.nome:''); _vl('mSCap', s?s.capacidade:''); _vl('mSTipo', s?s.tipo:'');
  _vl('mSAndar', s?(s.andar||''):'');
  _vl('mSBloco', s?(s.bloco||''):'');
  var cont = document.getElementById('mSTurnos'); cont.innerHTML='';
  _TURNOS.forEach(function(t){
    var c=document.createElement('div'); c.className='chip'+(s&&(s.turnos||[]).includes(t)?' ativo':'');
    c.dataset.v=t; c.textContent=t;
    c.onclick=function(){this.classList.toggle('ativo');};
    cont.appendChild(c);
  });
  fmsgHide('mSMsg'); modalAbrir('modalSala');
}
function salvarSala() {
  var nome=_gv('mSNome').trim(), cap=parseInt(_gv('mSCap')), tipo=_gv('mSTipo').trim();
  var andar=_gv('mSAndar').trim(), bloco=_gv('mSBloco').trim();
  var turnos=[].slice.call(document.querySelectorAll('#mSTurnos .chip.ativo')).map(function(c){return c.dataset.v;});
  if(!nome||!cap||!tipo){fmsg('mSMsg','erro','Preencha nome, capacidade e tipo.');return;}
  var dados={nome:nome,capacidade:cap,tipo:tipo,andar:andar,bloco:bloco,turnos:turnos,turnosDisponiveis:turnos,unidadeId:_uid()};
  if(_editSalaId){updSala(_editSalaId,dados);toast('Sala atualizada!','ok');}
  else{addSala(dados);toast('Sala cadastrada!','ok');}
  modalFechar('modalSala'); rdSalas(); rdMapa();
}
function excluirSala(id){
  var s=getSalaById(id); if(!s)return;
  if(getReservas().filter(function(r){return r.salaId===id;}).length>0){toast('Sala tem reservas. Remova-as primeiro.','erro');return;}
  if(!confirm('Excluir "'+s.nome+'"?'))return;
  delSala(id); toast('Sala excluída.','aviso'); rdSalas();
}

/* TURMAS */
function rdTurmas() {
  var list=getTurmas().filter(function(t){return t.unidadeId===_uid();}); var tb=document.getElementById('tbTurmas');
  if(!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="8">Nenhuma turma cadastrada.</td></tr>';return;}
  tb.innerHTML=list.slice().sort(function(a,b){return a.dataInicio.localeCompare(b.dataInicio);}).map(function(t){
    var inst=t.instrutorId?getUserById(t.instrutorId):null;
    return '<tr><td class="mono"><strong>'+esc(t.nome)+'</strong></td><td>'+esc(t.curso)+'</td>'
      +'<td><span class="bdg bdg-primary">'+esc(t.turno)+'</span></td>'
      +'<td>'+esc(inst?inst.nome:'—')+'</td>'
      +'<td>'+fmtData(t.dataInicio)+'</td><td>'+fmtData(t.dataFim)+'</td>'
      +'<td>'+htmlStatus(t)+'</td>'
      +'<td><div class="td-actions">'
      +'<button class="btn btn-ghost btn-sm" onclick="abrirTurma('+t.id+')">Editar</button>'
      +'<button class="btn btn-danger btn-sm" onclick="excluirTurma('+t.id+')">Excluir</button>'
      +'</div></td></tr>';
  }).join('');
}
function abrirTurma(id) {
  _editTurmaId=id||null; var t=id?getTurmaById(id):null;
  _tx('mTTit',id?'Editar Turma':'Nova Turma');
  _vl('mTCod',t?t.nome:''); _vl('mTCurso',t?t.curso:'');
  _vl('mTTurno',t?t.turno:'Matutino');
  _vl('mTIni',t?t.dataInicio:''); _vl('mTFim',t?t.dataFim:'');
  var sel=document.getElementById('mTInst'); sel.innerHTML='<option value="">— Sem instrutor —</option>';
  getUsersByPerfil('instrutor').filter(function(u){return u.unidadeId===_uid();}).forEach(function(u){
    var o=document.createElement('option'); o.value=u.id; o.textContent=u.nome;
    if(t&&t.instrutorId===u.id)o.selected=true; sel.appendChild(o);
  });
  fmsgHide('mTMsg'); modalAbrir('modalTurma');
}
function salvarTurma() {
  var nome=_gv('mTCod').trim(), curso=_gv('mTCurso').trim(), turno=_gv('mTTurno');
  var ini=_gv('mTIni'), fim=_gv('mTFim'), instId=parseInt(_gv('mTInst'))||null;
  if(!nome||!curso||!ini||!fim){fmsg('mTMsg','erro','Preencha todos os campos obrigatórios.');return;}
  if(fim<ini){fmsg('mTMsg','erro','Data fim deve ser posterior ao início.');return;}
  var dados={nome:nome,curso:curso,turno:turno,dataInicio:ini,dataFim:fim,instrutorId:instId,unidadeId:_uid()};
  if(_editTurmaId){updTurma(_editTurmaId,dados);toast('Turma atualizada!','ok');}
  else{addTurma(dados);toast('Turma cadastrada!','ok');}
  modalFechar('modalTurma'); rdTurmas();
}
function excluirTurma(id){
  var t=getTurmaById(id); if(!t)return;
  if(!confirm('Excluir turma "'+t.nome+'"?'))return;
  delTurma(id); getReservas().filter(function(r){return r.turmaId===id;}).forEach(function(r){delReserva(r.id);});
  toast('Turma excluída.','aviso'); rdTurmas();
}

/* RESERVAS */
function rdReservas() {
<<<<<<< HEAD
  var list=getReservas().filter(function(r){return r.unidadeId===_uid();});
  var tb=document.getElementById('tbReservas');
  if(!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="8">Nenhuma reserva criada.</td></tr>';return;}
  // Deduplica reservas idênticas (mesmo sala, turno, dataIni, dataFim, turmaId, instrutorId)
  var seen = {};
  list = list.filter(function(r) {
    var key = [r.salaId, r.turno, r.dataInicio, r.dataFim, r.turmaId||'', r.instrutorId||''].join('|');
    if (seen[key]) return false;
    seen[key] = true; return true;
  });
  tb.innerHTML=list.slice().sort(function(a,b){return a.dataInicio.localeCompare(b.dataInicio);}).map(function(r){
    var sala  = getSalaById(r.salaId);
    var turma = r.turmaId ? getTurmaById(r.turmaId) : null;
    var inst  = r.instrutorId ? getUserById(r.instrutorId) :
                (turma && turma.instrutorId ? getUserById(turma.instrutorId) : null);
    var st    = r.avulsa ? 'ativa' : (turma ? calcStatus(turma) : 'encerrada');
    var turmaLabel = r.avulsa
      ? '<span class="bdg bdg-amber">Sem turma</span>'
      : esc(turma ? turma.nome : '—');
    var horario = (r.horaInicio && r.horaFim)
      ? '<div style="font-size:.72rem;color:var(--text3)"><i class="ph ph-clock"></i> ' + r.horaInicio + ' – ' + r.horaFim + '</div>' : '';
    var instLabel = inst ? '<div style="font-size:.72rem;color:var(--text3)"><i class="ph ph-user"></i> ' + esc(inst.nome) + '</div>' : '';
    var diasStr = Array.isArray(r.diasSemana) && r.diasSemana.length
      ? r.diasSemana.map(function(d){return d[0].toUpperCase()+d.slice(1);}).join(', ') : '—';
    var datasEspStr = Array.isArray(r.datasEspecificas) && r.datasEspecificas.length
      ? r.datasEspecificas.map(fmtData).join(', ') : null;
    return '<tr>'
      +'<td><strong>'+esc(sala?sala.nome:'—')+'</strong></td>'
      +'<td class="mono">'+turmaLabel+instLabel+'</td>'
      +'<td><span class="bdg bdg-primary">'+esc(r.turno)+'</span></td>'
      +'<td style="font-size:.78rem">'+(datasEspStr||diasStr)+'</td>'
      +'<td style="font-size:.82rem">'+fmtData(r.dataInicio)+' → '+fmtData(r.dataFim)+horario+'</td>'
      +'<td><span class="st st-'+st+'">'+labelStatus(st)+'</span></td>'
      +'<td><div class="td-actions">'
      +'<button class="btn btn-ghost btn-sm" onclick="abrirReserva('+r.id+')">Editar</button>'
=======
  var list=getReservas().filter(function(r){return r.unidadeId===_uid();}); var tb=document.getElementById('tbReservas');
  if(!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="8">Nenhuma reserva criada.</td></tr>';return;}
  tb.innerHTML=list.slice().sort(function(a,b){return a.dataInicio.localeCompare(b.dataInicio);}).map(function(r){
    var sala=getSalaById(r.salaId);
    var turma=r.turmaId?getTurmaById(r.turmaId):null;
    var st=r.avulsa?'ativa':(turma?calcStatus(turma):'encerrada');
    var turmaLabel=r.avulsa
      ?'<span class="bdg bdg-amber">Avulsa</span>'
      :esc(turma?turma.nome:'—');
    var canEdit = !r.avulsa; // avulsas não têm edição (são geradas automaticamente)
    return '<tr>'
      +'<td><strong>'+esc(sala?sala.nome:'—')+'</strong></td>'
      +'<td class="mono">'+turmaLabel+'</td>'
      +'<td><span class="bdg bdg-primary">'+esc(r.turno)+'</span></td>'
      +'<td style="font-size:.78rem">'+r.diasSemana.map(function(d){return d.toUpperCase();}).join(', ')+'</td>'
      +'<td style="font-size:.82rem">'+fmtData(r.dataInicio)+' → '+fmtData(r.dataFim)+'</td>'
      +'<td><span class="st st-'+st+'">'+labelStatus(st)+'</span></td>'
      +'<td><div class="td-actions">'
      +(canEdit?'<button class="btn btn-ghost btn-sm" onclick="abrirReserva('+r.id+')">Editar</button>':'')
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
      +'<button class="btn btn-danger btn-sm" onclick="excluirReserva('+r.id+')">Excluir</button>'
      +'</div></td></tr>';
  }).join('');
}
function abrirReserva(id) {
  _editReservaId = id || null;
  var reserva = id ? getReservaById(id) : null;

  // Título do modal
  var titulo = document.getElementById('mrTitulo');
  if (titulo) titulo.textContent = id ? 'Editar Reserva' : 'Nova Reserva';

  // Botão de salvar
  var btnSalvar = document.querySelector('#modalRes .btn-primary');
  if (btnSalvar) btnSalvar.textContent = id ? 'Salvar Alterações' : 'Criar Reserva';

  // Popula salas
  var selS=document.getElementById('mRSala');
  selS.innerHTML='<option value="">— Selecione a sala —</option>';
  getSalasByUnidade(_uid()).forEach(function(s){
    var o=document.createElement('option');
    o.value=s.id; o.textContent=s.nome+' ('+s.tipo+')';
    if(reserva && reserva.salaId===s.id) o.selected=true;
    selS.appendChild(o);
  });
<<<<<<< HEAD
  selS.onchange = function() {
    _popularTurnosReserva(this.value, _gv('mRTurno'));
  };

  // Popula turmas
  var selT=document.getElementById('mRTurma');
  var isAvulsa = reserva && reserva.avulsa;
  selT.innerHTML='<option value="">'+(isAvulsa?'— Sem turma vinculada —':'— Selecione a turma —')+'</option>';
  selT.disabled = !!isAvulsa;
  selT.style.opacity = isAvulsa ? '.5' : '';
  if (!isAvulsa) {
    getTurmas().filter(function(t){
      return t.unidadeId===_uid() && (calcStatus(t)!=='encerrada' || (reserva && reserva.turmaId===t.id));
    }).forEach(function(t){
      var o=document.createElement('option');
      o.value=t.id; o.textContent=t.nome+' — '+t.curso;
      o.dataset.ini=t.dataInicio; o.dataset.fim=t.dataFim; o.dataset.turno=t.turno;
      if(reserva && reserva.turmaId===t.id) o.selected=true;
      selT.appendChild(o);
    });
    selT.onchange=function(){
      var o=this.options[this.selectedIndex];
      if(o.dataset.ini){
        _vl('mRIni',o.dataset.ini);
        _vl('mRFim',o.dataset.fim);
        _popularTurnosReserva(_gv('mRSala'), o.dataset.turno);
      }
    };
  }
=======

  // Popula turmas
  var selT=document.getElementById('mRTurma');
  selT.innerHTML='<option value="">— Selecione a turma —</option>';
  getTurmas().filter(function(t){
    return t.unidadeId===_uid() && (calcStatus(t)!=='encerrada' || (reserva && reserva.turmaId===t.id));
  }).forEach(function(t){
    var o=document.createElement('option');
    o.value=t.id; o.textContent=t.nome+' — '+t.curso;
    o.dataset.ini=t.dataInicio; o.dataset.fim=t.dataFim; o.dataset.turno=t.turno;
    if(reserva && reserva.turmaId===t.id) o.selected=true;
    selT.appendChild(o);
  });
  selT.onchange=function(){
    var o=this.options[this.selectedIndex];
    if(o.dataset.ini){_vl('mRIni',o.dataset.ini);_vl('mRFim',o.dataset.fim);_vl('mRTurno',o.dataset.turno);}
  };
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4

  // Dias da semana
  var cont=document.getElementById('mRDias'); cont.innerHTML='';
  _DIAS.forEach(function(d){
    var c=document.createElement('div');
<<<<<<< HEAD
    c.className='chip'+(reserva&&Array.isArray(reserva.diasSemana)&&reserva.diasSemana.includes(d.v)?' ativo':'');
=======
    c.className='chip'+(reserva&&reserva.diasSemana.includes(d.v)?' ativo':'');
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
    c.dataset.v=d.v; c.textContent=d.l;
    c.onclick=function(){this.classList.toggle('ativo');};
    cont.appendChild(c);
  });

  // Preenche campos de data e turno se editando
  if (reserva) {
<<<<<<< HEAD
    _popularTurnosReserva(reserva.salaId, reserva.turno);
    _vl('mRIni',   reserva.dataInicio);
    _vl('mRFim',   reserva.dataFim);
  } else {
    _popularTurnosReserva(_gv('mRSala'), 'Matutino'); _vl('mRIni',''); _vl('mRFim','');
=======
    _vl('mRTurno', reserva.turno);
    _vl('mRIni',   reserva.dataInicio);
    _vl('mRFim',   reserva.dataFim);
  } else {
    _vl('mRTurno','Matutino'); _vl('mRIni',''); _vl('mRFim','');
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
  }

  fmsgHide('mRMsg');
  modalAbrir('modalRes');
}
function salvarReserva() {
  var salaId  = parseInt(_gv('mRSala'));
  var turmaId = parseInt(_gv('mRTurma'));
  var turno   = _gv('mRTurno');
  var ini     = _gv('mRIni');
  var fim     = _gv('mRFim');
  var dias    = [].slice.call(document.querySelectorAll('#mRDias .chip.ativo')).map(function(c){return c.dataset.v;});

<<<<<<< HEAD
  var editando = !!_editReservaId;
  var reservaAtual = editando ? getReservaById(_editReservaId) : null;
  var isAvulsaEdit = reservaAtual && reservaAtual.avulsa;
  if(!salaId||!ini||!fim||!dias.length||(!turmaId&&!isAvulsaEdit)){
    fmsg('mRMsg','erro','Preencha todos os campos e selecione ao menos um dia.'); return;
  }
  var turnosSala = _turnosSalaReserva(salaId);
  if (turnosSala.indexOf(turno) === -1) {
    fmsg('mRMsg','erro','A sala selecionada nao atende o turno '+turno+'.'); return;
  }
  if (turmaId) {
    var turma=getTurmaById(turmaId);
    if(fim>turma.dataFim){
      fmsg('mRMsg','erro','Data fim ('+fmtData(fim)+') ultrapassa o fim da turma ('+fmtData(turma.dataFim)+').'); return;
    }
    if(ini<turma.dataInicio){
      fmsg('mRMsg','erro','Data início ('+fmtData(ini)+') é anterior ao início da turma ('+fmtData(turma.dataInicio)+').'); return;
    }
=======
  if(!salaId||!turmaId||!ini||!fim||!dias.length){
    fmsg('mRMsg','erro','Preencha todos os campos e selecione ao menos um dia.'); return;
  }
  var turma=getTurmaById(turmaId);
  if(fim>turma.dataFim){
    fmsg('mRMsg','erro','Data fim ('+fmtData(fim)+') ultrapassa o fim da turma ('+fmtData(turma.dataFim)+').'); return;
  }
  if(ini<turma.dataInicio){
    fmsg('mRMsg','erro','Data início ('+fmtData(ini)+') é anterior ao início da turma ('+fmtData(turma.dataInicio)+').'); return;
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
  }

  // Verificar conflito (ignora a própria reserva se estiver editando)
  var cf = checarConflito(salaId, turno, dias, ini, fim, _editReservaId);
  if(cf){ fmsg('mRMsg','erro',cf); return; }

  if (_editReservaId) {
    // Editar reserva existente
<<<<<<< HEAD
    var updDados = {
      salaId: salaId, turno: turno,
      diasSemana: dias, dataInicio: ini, dataFim: fim,
      reservadoPorId: _sess.id, unidadeId: _uid()
    };
    if (!isAvulsaEdit) updDados.turmaId = turmaId;
    updReserva(_editReservaId, updDados);
=======
    updReserva(_editReservaId, {
      salaId: salaId, turmaId: turmaId, turno: turno,
      diasSemana: dias, dataInicio: ini, dataFim: fim,
      reservadoPorId: _sess.id, unidadeId: _uid()
    });
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
    toast('Reserva atualizada!', 'ok');
  } else {
    // Nova reserva
    addReserva({
      salaId: salaId, turmaId: turmaId, turno: turno,
      diasSemana: dias, dataInicio: ini, dataFim: fim,
      reservadoPorId: _sess.id, unidadeId: _uid()
    });
    toast('Reserva criada!', 'ok');
  }
  _editReservaId = null;
  modalFechar('modalRes');
  rdReservas();
<<<<<<< HEAD
  _refreshMapaCoord();
=======
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
}
function excluirReserva(id){
  if(!confirm('Excluir esta reserva?'))return;
  var r = getReservaById(id);
<<<<<<< HEAD
  // Se é reserva sem turma de uma solicitação, reverte a solic para "recusada"
=======
  // Se é reserva avulsa de uma solicitação, reverte a solic para "recusada"
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
  if(r && r.avulsa && r.solicId){
    updSolic(r.solicId, {status:'recusada'});
  }
  delReserva(id); toast('Reserva excluída.','aviso'); rdReservas();
}

/* INSTRUTORES */
function rdInstrutores() {
  var list=getUsersByPerfil('instrutor').filter(function(u){return u.unidadeId===_uid();}); var tb=document.getElementById('tbInst');
  if(!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="4">Nenhum instrutor nesta unidade.</td></tr>';return;}
  tb.innerHTML=list.map(function(u){
    var turmas=getTurmas().filter(function(t){return t.instrutorId===u.id&&t.unidadeId===_uid();});
    var tHtml=turmas.length?turmas.map(function(t){return '<span class="st st-'+calcStatus(t)+'" style="margin-right:4px">'+esc(t.nome)+'</span>';}).join(''):'<span class="txt3">Nenhuma</span>';
    return '<tr><td><strong>'+esc(u.nome)+'</strong></td><td class="mono">'+esc(u.email)+'</td>'
      +'<td>'+tHtml+'</td>'
<<<<<<< HEAD
      +'<td><button class="btn btn-ghost btn-sm" onclick="abrirAtrib('+u.id+')">Atribuir Turmas</button></td></tr>';
=======
      +'<td><button class="btn btn-ghost btn-sm" onclick="abrirAtrib('+u.id+')">Atribuir Turma</button></td></tr>';
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
  }).join('');
}
function abrirAtrib(instId) {
  document.getElementById('mAInstId').value=instId;
  var inst=getUserById(instId); _tx('mATit','Atribuir turma a '+(inst?inst.nome:'instrutor'));
  var sel=document.getElementById('mATurma'); sel.innerHTML='<option value="">— Selecione —</option>';
  getTurmas().filter(function(t){return t.unidadeId===_uid();}).forEach(function(t){
    var o=document.createElement('option');o.value=t.id;o.textContent=t.nome+' — '+t.curso;sel.appendChild(o);
  });
  modalAbrir('modalAtrib');
}
function salvarAtrib() {
  var instId=parseInt(document.getElementById('mAInstId').value), turmaId=parseInt(_gv('mATurma'));
  if(!turmaId){toast('Selecione uma turma.','aviso');return;}
  updTurma(turmaId,{instrutorId:instId}); toast('Turma atribuída!','ok'); modalFechar('modalAtrib'); rdInstrutores();
}

<<<<<<< HEAD
abrirAtrib = function(instId) {
  document.getElementById('mAInstId').value=instId;
  var inst=getUserById(instId); _tx('mATit','Atribuir turmas a '+(inst?inst.nome:'instrutor'));
  var cont=document.getElementById('mATurmas');
  if (!cont) return;
  var turmas=getTurmas().filter(function(t){return t.unidadeId===_uid();})
    .sort(function(a,b){return a.nome.localeCompare(b.nome);});
  if(!turmas.length){
    cont.innerHTML='<div class="txt2">Nenhuma turma cadastrada nesta unidade.</div>';
  } else {
    cont.innerHTML=turmas.map(function(t){
      var atual=t.instrutorId?getUserById(t.instrutorId):null;
      var checked=t.instrutorId===instId?' checked':'';
      var atualTxt=atual?(t.instrutorId===instId?'Ja atribuida a este instrutor':'Atual: '+esc(atual.nome)):'Sem instrutor';
      return '<label style="display:flex;align-items:flex-start;gap:10px;border:1px solid var(--line);border-radius:8px;padding:10px 12px;background:var(--surface)">'
        +'<input type="checkbox" value="'+t.id+'"'+checked+' style="margin-top:3px">'
        +'<span style="flex:1">'
          +'<strong>'+esc(t.nome)+'</strong>'
          +'<span style="display:block;font-size:.78rem;color:var(--text2);margin-top:2px">'+esc(t.curso||'')+' - '+esc(t.turno||'')+'</span>'
          +'<span style="display:block;font-size:.72rem;color:var(--text3);margin-top:2px">'+esc(atualTxt)+' - '+esc(labelStatus(calcStatus(t)))+'</span>'
        +'</span>'
      +'</label>';
    }).join('');
  }
  fmsgHide('mAMsg');
  modalAbrir('modalAtrib');
};

salvarAtrib = function() {
  var instId=parseInt(document.getElementById('mAInstId').value);
  var ids=[].slice.call(document.querySelectorAll('#mATurmas input[type="checkbox"]:checked'))
    .map(function(i){return parseInt(i.value);})
    .filter(Boolean);
  if(!ids.length){fmsg('mAMsg','erro','Selecione ao menos uma turma.');return;}
  ids.forEach(function(turmaId){updTurma(turmaId,{instrutorId:instId});});
  toast(ids.length===1?'Turma atribuida!':'Turmas atribuidas!','ok');
  modalFechar('modalAtrib');
  rdInstrutores();
  rdTurmas();
};

=======
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
/* MAPA */
/* Retorna o status completo da sala para HOJE.
   Verifica override manual PRIMEIRO; se houver, usa esse status.
   Caso contrário, calcula dinamicamente pelas reservas do dia.
   info.periodos = [{ turno, turmaNome, instNome, stat }]
   info.stat = 'livre' | 'iminente' | 'ocupada'
   info.override = objeto de override se houver, ou null */
<<<<<<< HEAD
function _calcSalaStatus(s, hj, turnoFiltro) {
=======
function _calcSalaStatus(s, hj) {
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
  // 1. Verificar override manual
  var ov = getOverride(s.id, s.unidadeId);
  if (ov) {
    return {
      stat: ov.status,
      periodos: ov.status !== 'livre' ? [{
        turno: 'Manual',
        turmaNome: ov.motivo || 'Status manual',
        instNome:  ov.por || '',
        stat: ov.status
      }] : [],
      turnosOcupados: ov.status !== 'livre' ? ['Manual'] : [],
      turnoAtivo: ov.status !== 'livre' ? 'Manual' : '',
      turmaNome:  ov.motivo || '',
      instNome:   ov.por || '',
      reserva:    null,
      override:   ov
    };
  }

  // 2. Calcular pelo calendário de reservas
  var rs = getReservas().filter(function(r){
<<<<<<< HEAD
    return r.salaId===s.id && r.unidadeId===s.unidadeId && r.dataInicio<=hj && r.dataFim>=hj && r.status!=='CANCELADA';
=======
    return r.salaId===s.id && r.dataInicio<=hj && r.dataFim>=hj;
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
  });
  var p = hj.split('-').map(Number);
  var diaSem = ['dom','seg','ter','qua','qui','sex','sab'][new Date(p[0],p[1]-1,p[2]).getDay()];

  var periodos = [], turnosOcupados = [];
  rs.forEach(function(r){
<<<<<<< HEAD
    if (turnoFiltro && r.turno !== turnoFiltro) return;
    var temDatasEspecificas = Array.isArray(r.datasEspecificas) && r.datasEspecificas.length;
    if (temDatasEspecificas) {
      if (r.datasEspecificas.indexOf(hj) === -1) return;
    } else if (!Array.isArray(r.diasSemana) || !r.diasSemana.includes(diaSem)) {
      return;
    }
    var pStat, pTurma, pInst, pHora = '';
    if (r.avulsa || !r.turmaId) {
      pStat = 'ocupada'; pTurma = 'Sem turma';
=======
    if (!r.diasSemana.includes(diaSem)) return;
    var pStat, pTurma, pInst;
    if (r.avulsa || !r.turmaId) {
      pStat = 'ocupada'; pTurma = 'Reserva avulsa';
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
      var iA = r.instrutorId ? getUserById(r.instrutorId) : null;
      pInst = iA ? iA.nome : '—';
    } else {
      var turma = getTurmaById(r.turmaId);
      var cst   = turma ? calcStatus(turma) : 'encerrada';
      if (cst === 'encerrada') return;
      pStat  = cst === 'ativa' ? 'ocupada' : 'iminente';
      pTurma = turma ? turma.nome : '—';
<<<<<<< HEAD
      var iT = r.instrutorId ? getUserById(r.instrutorId) :
               (turma&&turma.instrutorId ? getUserById(turma.instrutorId) : null);
      pInst = iT ? iT.nome : '';
    }
    if (r.horaInicio && r.horaFim) pHora = r.horaInicio + ' – ' + r.horaFim;
    // Deduplica: não adiciona se já existe entrada com mesmo turno, turmaNome e inst
    var jaExiste = periodos.some(function(p){
      return p.turno===r.turno && p.turmaNome===pTurma && p.instNome===pInst;
    });
    if (!jaExiste) {
      periodos.push({ turno: r.turno, turmaNome: pTurma, instNome: pInst, stat: pStat, hora: pHora });
    }
=======
      var inst = turma && turma.instrutorId ? getUserById(turma.instrutorId) : null;
      pInst  = inst ? inst.nome : '';
    }
    periodos.push({ turno: r.turno, turmaNome: pTurma, instNome: pInst, stat: pStat });
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
    if (turnosOcupados.indexOf(r.turno) === -1) turnosOcupados.push(r.turno);
  });

  var stat = 'livre';
  if (periodos.some(function(p){ return p.stat==='ocupada'; })) stat = 'ocupada';
  else if (periodos.length > 0) stat = 'iminente';

  return {
    stat: stat,
    periodos: periodos,
    turnosOcupados: turnosOcupados,
    turnoAtivo: periodos.length ? periodos[0].turno : '',
    turmaNome:  periodos.length ? periodos[0].turmaNome : '',
    instNome:   periodos.length ? periodos[0].instNome : '',
    reserva:    null,
    override:   null
  };
}

function _buildSalaCard(s, info) {
  var statusIcon = {livre:'<span class="ic-dot ic-livre"></span>', ocupada:'<span class="ic-dot ic-ocupada"></span>', iminente:'<span class="ic-dot ic-iminente"></span>'}[info.stat]||'<span class="ic-dot ic-livre"></span>';
  var turnos = s.turnos||s.turnosDisponiveis||[];
  var uid = s.unidadeId||_uid();

  // Badges de turno — cor por status de cada período
  var turnosHtml = turnos.map(function(t){
    var per = info.periodos ? info.periodos.find(function(p){return p.turno===t;}) : null;
    var cls = 'mapa-turno';
    if (per) cls += per.stat==='ocupada' ? ' ocupado' : ' iminente-turno';
    return '<span class="'+cls+'" title="'+(per?esc(per.turmaNome):'Livre')+'">'+t[0]+'</span>';
  }).join('');

  // Bloco de ocupações
  var ocupHtml = '';
  if (info.periodos && info.periodos.length) {
    ocupHtml = '<div class="sc-ocupacao">';
    if (info.override) {
      ocupHtml += '<div class="sc-periodo sc-override">'
<<<<<<< HEAD
        +'<span class="sc-periodo-turno '+(info.stat==='ocupada'?'ocp':'imi')+'"><i class="ph ph-gear"></i> Manual</span>'
=======
        +'<span class="sc-periodo-turno '+(info.stat==='ocupada'?'ocp':'imi')+'"><i class="ph ph-gear"></i>️ Manual</span>'
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
        +'<div class="sc-turma">'+esc(info.override.motivo||'Status manual')+'</div>'
        +'<div class="sc-inst">por '+esc(info.override.por)+'</div>'
        +'</div>';
    } else {
      info.periodos.forEach(function(per){
        var ic = per.stat==='ocupada'?'<span class="ic-dot ic-ocupada"></span>':'<span class="ic-dot ic-iminente"></span>';
        ocupHtml += '<div class="sc-periodo">'
          +'<span class="sc-periodo-turno '+(per.stat==='ocupada'?'ocp':'imi')+'">'+ic+' '+esc(per.turno)+'</span>'
<<<<<<< HEAD
          +'<div class="sc-turma">'+(per.turmaNome&&per.turmaNome!=='Sem turma'?'<i class="ph ph-books"></i> '+esc(per.turmaNome):'<span class="bdg bdg-amber" style="font-size:.65rem">Sem turma</span>')+'</div>'
          +(per.instNome?'<div class="sc-inst"><i class="ph ph-user"></i> '+esc(per.instNome)+'</div>':'')
          +(per.hora?'<div class="sc-inst"><i class="ph ph-clock"></i> '+esc(per.hora)+'</div>':'')
=======
          +'<div class="sc-turma"><i class="ph ph-books"></i> '+esc(per.turmaNome)+'</div>'
          +(per.instNome?'<div class="sc-inst"><i class="ph ph-user"></i> '+esc(per.instNome)+'</div>':'')
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
          +'</div>';
      });
    }
    ocupHtml += '</div>';
  } else {
    ocupHtml = '<div class="sc-livre-label">'+statusIcon+' Disponível</div>';
  }

  // Barra de override — usa data-attrs para evitar problemas de quotes
  var sid = s.id;
  var ovOcup  = info.stat==='ocupada'  ? 'ov-active' : '';
  var ovIminn = info.stat==='iminente' ? 'ov-active' : '';
  var ovLivre = (info.stat==='livre' && !info.override) ? 'ov-active' : '';
  var ovBtn = '<div class="sc-override-bar">'
    +'<button class="sc-ov-btn '+ovOcup+'"  data-sid="'+sid+'" data-uid="'+uid+'" data-st="ocupada"   onclick="ovClick(this)" title="Marcar como Ocupada"><span class="ic-dot ic-ocupada"></span></button>'
    +'<button class="sc-ov-btn '+ovIminn+'" data-sid="'+sid+'" data-uid="'+uid+'" data-st="iminente" onclick="ovClick(this)" title="Marcar como Em Breve"><span class="ic-dot ic-iminente"></span></button>'
    +'<button class="sc-ov-btn '+ovLivre+'" data-sid="'+sid+'" data-uid="'+uid+'" data-st="livre"     onclick="ovClick(this)" title="Marcar como Livre"><span class="ic-dot ic-livre"></span></button>'
<<<<<<< HEAD
    +(info.override?'<button class="sc-ov-btn sc-ov-auto" data-sid="'+sid+'" data-uid="'+uid+'" data-st="auto" onclick="ovClick(this)" title="Voltar ao automático"><i class="ph ph-arrows-clockwise"></i> Auto</button>':'')
=======
    +(info.override?'<button class="sc-ov-btn sc-ov-auto" data-sid="'+sid+'" data-uid="'+uid+'" data-st="auto" onclick="ovClick(this)" title="Voltar ao automático">⟳ Auto</button>':'')
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
    +'</div>';

  return '<div class="sala-card-v2 '+info.stat+(info.override?' has-override':'')+'">'
    +'<div class="sc-header">'
<<<<<<< HEAD
      +'<div class="sc-nome">'+esc(s.nome)+(info.override?'<span class="sc-ov-tag"><i class="ph ph-gear"></i></span>':'')+'</div>'
=======
      +'<div class="sc-nome">'+esc(s.nome)+(info.override?'<span class="sc-ov-tag"><i class="ph ph-gear"></i>️</span>':'')+'</div>'
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
      +'<div class="sc-status-dot '+info.stat+'"></div>'
    +'</div>'
    +'<div class="sc-tipo">'+esc(s.tipo)+'</div>'
    +'<div class="sc-meta">'
      +'<div class="sc-meta-item" title="Andar"><span class="sc-meta-icon"><i class="ph ph-buildings"></i></span>'+esc(s.andar||'—')+'</div>'
      +'<div class="sc-meta-item" title="Bloco"><span class="sc-meta-icon"><i class="ph ph-map-pin"></i></span>'+esc(s.bloco||'—')+'</div>'
      +'<div class="sc-meta-item" title="Capacidade"><span class="sc-meta-icon"><i class="ph ph-users"></i></span>'+s.capacidade+' pess.</div>'
    +'</div>'
    +'<div class="sc-turnos">'+turnosHtml+'</div>'
    +ocupHtml
    +ovBtn
    +'</div>';
}

/* Handler global de override — lê data-* do botão clicado */
function ovClick(btn) {
  var salaId    = parseInt(btn.getAttribute('data-sid'));
  var unidadeId = parseInt(btn.getAttribute('data-uid'));
  var status    = btn.getAttribute('data-st');
  _setOverride(salaId, unidadeId, status);
}

/* Aplica ou remove override manual de status de sala */
function _setOverride(salaId, unidadeId, status) {
  var motivo = '';
  if (status === 'ocupada' || status === 'iminente') {
    motivo = prompt(
      status==='ocupada' ? 'Motivo da ocupação manual:' : 'Motivo para "Em Breve":',
      status==='ocupada' ? 'Em uso — fora do horário regular' : 'Preparação de evento'
    );
    if (motivo === null) return; // cancelou
  }
  var sess = getSessao();
  setOverride(salaId, unidadeId, status==='auto' ? null : status, motivo, sess ? sess.nome : '—');
  rdMapa();
}


<<<<<<< HEAD
/* ── wrapper de compatibilidade ── */
function checarConflito(salaId, turno, dias, dataInicio, dataFim, ignorarId) {
  if (typeof verificarConflito === 'function') {
    return verificarConflito(
      { salaId, turno, diasSemana: dias, dataInicio, dataFim },
      ignorarId || null
    );
  }
  return null; // se verificarConflito não estiver disponível, não bloqueia
}

var _mapaTimer = null;
var rdMapaDebounced = function() {
  clearTimeout(_mapaTimer);
  var cont = document.getElementById('mapaSalas');
  if (cont && !cont.querySelector('.mapa-loading')) {
    cont.insertAdjacentHTML('afterbegin',
      '<div class="mapa-loading"><span class="mapa-spinner"></span> Atualizando…</div>');
  }
  _mapaTimer = setTimeout(function() { rdMapa(); }, 280);
};

function rdMapa() {
  var salas=getSalasByUnidade(_uid()); var cont=document.getElementById('mapaSalas');
  if(!cont) return;
=======

function rdMapa() {
  var salas=getSalasByUnidade(_uid()); var cont=document.getElementById('mapaSalas');
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
  if(!salas.length){cont.innerHTML='<p class="txt2">Nenhuma sala cadastrada. Vá em Salas para cadastrar.</p>';return;}
  var hj=hojeISO();

  // Filtros do mapa
  var filtTurno  = document.getElementById('mapaFiltTurno')  ? document.getElementById('mapaFiltTurno').value  : '';
  var filtBloco  = document.getElementById('mapaFiltBloco')  ? document.getElementById('mapaFiltBloco').value  : '';
  var filtAndar  = document.getElementById('mapaFiltAndar')  ? document.getElementById('mapaFiltAndar').value  : '';
  var filtStatus = document.getElementById('mapaFiltStatus') ? document.getElementById('mapaFiltStatus').value : '';
  var buscaNome  = document.getElementById('mapaBusca')      ? document.getElementById('mapaBusca').value.toLowerCase().trim() : '';

  var salasFiltradas = salas.filter(function(s){
    if(buscaNome && !s.nome.toLowerCase().includes(buscaNome) && !s.tipo.toLowerCase().includes(buscaNome)) return false;
    if(filtBloco && (s.bloco||'')!==filtBloco) return false;
    if(filtAndar && (s.andar||'')!==filtAndar) return false;
    if(filtTurno && !(s.turnos||s.turnosDisponiveis||[]).includes(filtTurno)) return false;
    return true;
  });

  var infoMap = {};
<<<<<<< HEAD
  salasFiltradas.forEach(function(s){ infoMap[s.id]=_calcSalaStatus(s,hj,filtTurno); });
=======
  salasFiltradas.forEach(function(s){ infoMap[s.id]=_calcSalaStatus(s,hj); });
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
  if(filtStatus) salasFiltradas=salasFiltradas.filter(function(s){return infoMap[s.id].stat===filtStatus;});

  // Atualiza contadores de legenda
  var total=salasFiltradas.length;
  var livres=salasFiltradas.filter(function(s){return infoMap[s.id].stat==='livre';}).length;
  var ocupadas=salasFiltradas.filter(function(s){return infoMap[s.id].stat==='ocupada';}).length;
  var iminentes=salasFiltradas.filter(function(s){return infoMap[s.id].stat==='iminente';}).length;
  var legEl=document.getElementById('mapaLegenda');
  if(legEl) legEl.innerHTML='<span class="leg-item livre"><span class="ic-dot ic-livre"></span> Livre: '+livres+'</span>'
    +'<span class="leg-item ocupada"><span class="ic-dot ic-ocupada"></span> Ocupada: '+ocupadas+'</span>'
    +'<span class="leg-item iminente"><span class="ic-dot ic-iminente"></span> Em breve: '+iminentes+'</span>'
    +'<span class="leg-total">Total: '+total+' sala(s)</span>';

  if(!salasFiltradas.length){
    cont.innerHTML='<p class="txt2" style="padding:24px">Nenhuma sala encontrada com esses filtros.</p>';
    _rdMapaFuturas(); return;
  }

  // Agrupar por bloco → andar
  var grupos = {};
  salasFiltradas.forEach(function(s){
    var bloco = s.bloco||'Sem Bloco';
    var andar = s.andar||'Sem Andar';
    if(!grupos[bloco]) grupos[bloco]={};
    if(!grupos[bloco][andar]) grupos[bloco][andar]=[];
    grupos[bloco][andar].push(s);
  });

<<<<<<< HEAD
  var html = [];
  Object.keys(grupos).sort().forEach(function(bloco){
    html.push('<div class="mapa-bloco">');
    html.push('<div class="mapa-bloco-titulo"><i class="ph ph-map-pin"></i> '+esc(bloco)+'</div>');
    Object.keys(grupos[bloco]).sort().forEach(function(andar){
      html.push('<div class="mapa-andar">');
      html.push('<div class="mapa-andar-titulo"><i class="ph ph-buildings"></i> '+esc(andar)+'</div>');
      html.push('<div class="mapa-andar-grid">');
      grupos[bloco][andar].forEach(function(s){
        html.push(_buildSalaCard(s, infoMap[s.id]));
      });
      html.push('</div></div>');
    });
    html.push('</div>');
  });
  // Uma única escrita no DOM (evita múltiplos reflows)
  cont.innerHTML = html.join('');
=======
  var html = '';
  Object.keys(grupos).sort().forEach(function(bloco){
    html += '<div class="mapa-bloco">';
    html += '<div class="mapa-bloco-titulo"><i class="ph ph-map-pin"></i> '+esc(bloco)+'</div>';
    Object.keys(grupos[bloco]).sort().forEach(function(andar){
      html += '<div class="mapa-andar">';
      html += '<div class="mapa-andar-titulo"><i class="ph ph-buildings"></i> '+esc(andar)+'</div>';
      html += '<div class="mapa-andar-grid">';
      grupos[bloco][andar].forEach(function(s){
        html += _buildSalaCard(s, infoMap[s.id]);
      });
      html += '</div></div>';
    });
    html += '</div>';
  });
  cont.innerHTML = html;
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
  _rdMapaFuturas();
}

function _rdMapaFuturas() {
  var tb = document.getElementById('tbFuturasCoord');
  if (!tb) return;
  var hj = hojeISO();
  var hoje14 = new Date(); hoje14.setDate(hoje14.getDate()+14);
  var fim14 = hoje14.toISOString().split('T')[0];
  var fut = getReservas().filter(function(r){
    return r.unidadeId===_uid() && r.dataFim>=hj && r.dataInicio<=fim14;
  }).sort(function(a,b){return a.dataInicio.localeCompare(b.dataInicio);}).slice(0,20);
  var sAprov = getSolics().filter(function(s){
    return s.unidadeId===_uid() && s.status==='aprovada' && s.data>=hj && s.data<=fim14;
  });
  if(!fut.length && !sAprov.length){
    tb.innerHTML='<tr class="empty-row"><td colspan="5">Sem reservas nos próximos 14 dias.</td></tr>'; return;
  }
  var rows = fut.map(function(r){
    var sala=getSalaById(r.salaId); var t=getTurmaById(r.turmaId); var inst=t&&t.instrutorId?getUserById(t.instrutorId):null;
<<<<<<< HEAD
    var horario = (r.horaInicio && r.horaFim)
      ? '<div style="font-size:.72rem;color:var(--text3)"><i class="ph ph-clock"></i> ' + r.horaInicio + ' - ' + r.horaFim + '</div>' : '';
=======
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
    return '<tr><td><strong>'+esc(sala?sala.nome:'—')+'</strong>'
      +(sala&&sala.bloco?'<div style="font-size:.75rem;color:var(--text3)">'+esc(sala.bloco)+' · '+esc(sala.andar||'')+'</div>':'')
      +'</td><td class="mono">'+esc(t?t.nome:'—')+'</td>'
      +'<td>'+esc(inst?inst.nome:'—')+'</td>'
<<<<<<< HEAD
      +'<td style="font-size:.82rem">'+fmtData(r.dataInicio)+' → '+fmtData(r.dataFim)+horario+'</td>'
=======
      +'<td style="font-size:.82rem">'+fmtData(r.dataInicio)+' → '+fmtData(r.dataFim)+'</td>'
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
      +'<td style="font-size:.82rem">'+r.diasSemana.map(function(d){return d.toUpperCase();}).join(', ')+' · '+esc(r.turno)+'</td></tr>';
  });
  sAprov.forEach(function(s){
    var sala=getSalaById(s.salaId); var inst=getUserById(s.instrutorId);
<<<<<<< HEAD
    var _t0=Array.isArray(s.turnos)?s.turnos:(s.turno?[s.turno]:[]);
    var turnos=[...new Set(_t0)].join(', ')||'—';
=======
    var turnos=Array.isArray(s.turnos)?s.turnos.join(', '):(s.turno||'—');
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
    rows.push('<tr style="background:var(--green-l)"><td><strong>'+esc(sala?sala.nome:'—')+'</strong>'
      +(sala&&sala.bloco?'<div style="font-size:.75rem;color:var(--text3)">'+esc(sala.bloco)+' · '+esc(sala.andar||'')+'</div>':'')
      +'</td><td class="mono"><span class="bdg bdg-green">Solicitação</span></td>'
      +'<td>'+esc(inst?inst.nome:'—')+'</td>'
      +'<td style="font-size:.82rem">'+fmtData(s.data)+'</td>'
      +'<td style="font-size:.82rem">'+esc(turnos)+'</td></tr>');
  });
  tb.innerHTML = rows.join('');
}

function _popularFiltrosMapa() {
  var salas = getSalasByUnidade(_uid());
  var blocos = [...new Set(salas.map(function(s){return s.bloco||'';}).filter(Boolean))].sort();
  var andares = [...new Set(salas.map(function(s){return s.andar||'';}).filter(Boolean))].sort();
  var selB = document.getElementById('mapaFiltBloco');
  var selA = document.getElementById('mapaFiltAndar');
  if(selB){
    var curB=selB.value;
    selB.innerHTML='<option value="">Todos os blocos</option>'+blocos.map(function(b){return'<option'+(b===curB?' selected':'')+'>'+esc(b)+'</option>';}).join('');
  }
  if(selA){
    var curA=selA.value;
    selA.innerHTML='<option value="">Todos os andares</option>'+andares.map(function(a){return'<option'+(a===curA?' selected':'')+'>'+esc(a)+'</option>';}).join('');
  }
}

/* SOLICITAÇÕES */
function rdSolics() {
<<<<<<< HEAD
  var list = getSolics().filter(function(s){return s.unidadeId===_uid();})
    .slice().sort(function(a,b){
      // Pendentes primeiro, depois por data
      if(a.status==='pendente' && b.status!=='pendente') return -1;
      if(a.status!=='pendente' && b.status==='pendente') return 1;
      return (b.criadaEm||'').localeCompare(a.criadaEm||'');
    });
  var cont = document.getElementById('listaSolics');
  if(!list.length){cont.innerHTML='<p class="txt2">Nenhuma solicitação recebida.</p>';return;}
  cont.innerHTML = list.map(function(s){
    var sala  = getSalaById(s.salaId);
    var inst  = getUserById(s.instrutorId);
    var turma = s.turmaId ? getTurmaById(s.turmaId) : null;
    var _trns = Array.isArray(s.turnos)&&s.turnos.length ? s.turnos : (s.turno?[s.turno]:[]);
    var turnosStr = [...new Set(_trns)].join(', ')||'—';
    var isPendente = s.status === 'pendente';
    var statusBadge = isPendente
      ? '<span class="bdg" style="background:var(--amber-l);color:var(--amber);border:1px solid var(--amber-d)">PENDENTE</span>'
      : '<span class="bdg '+(s.status==='aprovada'?'bdg-green':'bdg-red')+'">'+s.status.toUpperCase()+'</span>';

    // Data/período
    var dataLabel = '';
    if(s.modo==='periodo'||s.dataInicio!==s.dataFim) {
      dataLabel = fmtData(s.dataInicio||s.data) + ' → ' + fmtData(s.dataFim||s.data);
    } else if(s.datasEspecificas && s.datasEspecificas.length>1) {
      dataLabel = s.datasEspecificas.length + ' data(s) específica(s)';
    } else {
      dataLabel = fmtData(s.data||s.dataInicio);
    }

    // Dias da semana
    var diasLabel = Array.isArray(s.diasSemana)&&s.diasSemana.length
      ? s.diasSemana.map(function(d){return d[0].toUpperCase()+d.slice(1);}).join(', ') : '';

    // Horário
    var horLabel = (s.horaInicio&&s.horaFim) ? s.horaInicio+' às '+s.horaFim : '';

    return '<div class="notif-item tipo-solicit" style="border-left:3px solid '+(isPendente?'var(--amber)':s.status==='aprovada'?'var(--green)':'var(--red)')+';">'
      // Cabeçalho
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">'
        +'<div>'
          +'<div class="ni-title">'+esc(inst?inst.nome:'Instrutor')+'</div>'
          +'<div style="font-size:.75rem;color:var(--text3)">'+(fmtDateTime(s.criadaEm)||'')+'</div>'
        +'</div>'
        +statusBadge
      +'</div>'
      // Info sala
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:.82rem;margin-bottom:6px">'
        +'<div><span style="color:var(--text3)">Sala</span><br><strong>'+esc(sala?sala.nome:'—')+'</strong>'
          +(sala?'<span style="font-size:.72rem;color:var(--text3)"> · '+esc(sala.bloco||'')+(sala.andar?' · '+esc(sala.andar):'')+'</span>':'')
        +'</div>'
        +'<div><span style="color:var(--text3)">Data</span><br><strong>'+dataLabel+'</strong>'
          +(diasLabel?'<div style="font-size:.72rem;color:var(--text3)">'+diasLabel+'</div>':'')
        +'</div>'
        +'<div><span style="color:var(--text3)">Turno(s)</span><br><strong>'+esc(turnosStr)+'</strong>'
          +(horLabel?'<div style="font-size:.72rem;color:var(--text3)">'+horLabel+'</div>':'')
        +'</div>'
        +'<div><span style="color:var(--text3)">Turma</span><br>'
          +(turma?'<strong>'+esc(turma.nome)+'</strong><div style="font-size:.72rem;color:var(--text3)">'+esc(turma.curso||'')+'</div>'
                 :'<span style="color:var(--text3)">—</span>')
        +'</div>'
      +'</div>'
      // Motivo
      +(s.motivo?'<div style="font-size:.78rem;color:var(--text2);background:var(--surface2);padding:6px 10px;border-radius:6px;margin-bottom:8px"><i class="ph ph-chat-text"></i> '+esc(s.motivo)+'</div>':'')
      // Botões de ação
      +(isPendente
        ?'<div style="display:flex;gap:8px;margin-top:4px">'
          +'<button class="btn btn-success btn-sm" onclick="responderSolic('+s.id+',\'aprovada\')"><i class="ph ph-check"></i> Aprovar</button>'
          +'<button class="btn btn-danger btn-sm"  onclick="responderSolic('+s.id+',\'recusada\')"><i class="ph ph-x"></i> Recusar</button>'
          +'</div>'
        :'')
      +'</div>';
  }).join('');
}
async function responderSolic(id, status) {
  // Desabilita os botões para evitar duplo clique
  document.querySelectorAll('[onclick*="responderSolic('+id+'"]').forEach(function(b) {
    b.disabled = true; b.style.opacity = '0.5';
  });

  try {
    // 1. Atualiza status da solicitação (async — não bloqueia browser)
    await updSolicAsync(id, { status });

    const s    = getSolics().find(function(x) { return x.id === id; });
    const inst = s ? getUserById(s.instrutorId) : null;
    const sala = s ? getSalaById(s.salaId)      : null;

    // 2. Se aprovada: cria reserva com todos os dados da solicitação
    if (status === 'aprovada' && s) {
      const turnos      = Array.isArray(s.turnos) && s.turnos.length ? s.turnos : [s.turno || 'Matutino'];
      const turnsSala   = sala ? (sala.turnos || sala.turnosDisponiveis || []) : [];
      const finalTurnos = turnos.filter(function(t){return turnsSala.length===0||turnsSala.includes(t);});
      const usarTurnos  = finalTurnos.length ? finalTurnos : turnos;

      // Data: usa período completo se disponível
      const dataIni = s.dataInicio || s.data;
      const dataFim = s.dataFim    || s.data;

      // Dias da semana: usa os selecionados, ou calcula a partir da data
      let diasSemana = Array.isArray(s.diasSemana) && s.diasSemana.length ? s.diasSemana : null;
      if (!diasSemana) {
        // Calcula o dia da semana da data de início
        const p      = dataIni.split('-').map(Number);
        const diaSem = ['dom','seg','ter','qua','qui','sex','sab'][new Date(p[0],p[1]-1,p[2]).getDay()];
        diasSemana = [diaSem];
      }

      // Datas específicas (modo avulso de datas)
      const datasEsp = Array.isArray(s.datasEspecificas) && s.datasEspecificas.length ? s.datasEspecificas : null;

      if (datasEsp && (!Array.isArray(s.diasSemana) || !s.diasSemana.length)) {
        diasSemana = _diasSemanaDeDatas(datasEsp);
      }

      for (const turno of usarTurnos) {
        const conflito = checarConflito(s.salaId, turno, diasSemana, dataIni, dataFim, null);
        if (!conflito) {
          await addReservaAsync({
            salaId:          s.salaId,
            turmaId:         s.turmaId || null,
            turno,
            diasSemana,
            dataInicio:      dataIni,
            dataFim,
            datasEspecificas: datasEsp,
            horaInicio:      s.horaInicio || null,
            horaFim:         s.horaFim    || null,
            instrutorId:     s.instrutorId,
            reservadoPorId:  _sess.id,
            unidadeId:       _uid(),
            avulsa:          !s.turmaId,  // só é avulsa se não tem turma
            solicId:         id,
          });
        }
      }
    }

    // 3. Notificação descritiva para o instrutor
    const salaNome  = sala  ? sala.nome  : 'a sala solicitada';
    const instNome  = inst  ? inst.nome  : 'Instrutor';
    const _tA = s ? (Array.isArray(s.turnos)&&s.turnos.length ? s.turnos : (s.turno?[s.turno]:[])) : [];
    const turnoStr  = [...new Set(_tA)].join(', ');
    const dataIniS  = s ? (s.dataInicio||s.data) : '';
    const dataFimS  = s ? (s.dataFim||s.data)    : '';
    const dataStr   = dataIniS===dataFimS ? fmtData(dataIniS) : fmtData(dataIniS)+' a '+fmtData(dataFimS);
    const horStr    = (s&&s.horaInicio&&s.horaFim) ? ' das '+s.horaInicio+' às '+s.horaFim : '';

    const [tipo, titulo, msgCorpo] = status === 'aprovada'
      ? ['chave',
         'Solicitação aprovada',
         `Sua solicitação de "${salaNome}" foi aprovada para ${dataStr}${horStr} (${turnoStr}). A reserva foi criada automaticamente.`]
      : ['aviso',
         'Solicitação recusada',
         `Sua solicitação de "${salaNome}" para ${dataStr} (${turnoStr}) foi recusada pelo coordenador.`];

    await addNotifAsync({
      tipo, titulo, msg: msgCorpo,
      para:      'instrutor',
      paraId:    s ? s.instrutorId : null,
      unidadeId: _uid(),
    });

    toast('Solicitação ' + status + '!', 'ok');

  } catch (err) {
    console.error('Erro ao responder solicitação:', err);
    toast('Erro ao processar. Tente novamente.', 'erro');
  }

  // 4. Re-renderiza tudo (com dados atualizados no cache)
  rdSolics();
  _atualizarBadges();
  _popularFiltrosMapa();
  rdMapa();
}

/* NOTIFS */
var _NOTIF_ICONS = {
  info:'<i class="ph ph-info"></i>',
  aviso:'<i class="ph ph-warning"></i>',
  chave:'<i class="ph ph-key"></i>',
  solicit:'<i class="ph ph-clipboard-text"></i>',
  reserva:'<i class="ph ph-calendar"></i>',
  aprovada:'<i class="ph ph-check-circle"></i>',
  recusada:'<i class="ph ph-x-circle"></i>',
  erro:'<i class="ph ph-warning-circle"></i>'
};

function rdNotifs() {
  var list = getNotifsPara('coordenador', _uid());
  var cont  = document.getElementById('listaNotifs');
  if (!list.length) {
    cont.innerHTML = '<p class="txt2">Sem notificações.</p>';
    return;
  }

  var naoLidas = list.filter(function(n){ return !n.lida; }).length;
  var header = naoLidas > 0
    ? '<div style="display:flex;justify-content:flex-end;margin-bottom:12px">'
      + '<button class="btn btn-ghost btn-sm" onclick="marcarTodasLidasLocal()">Marcar todas como lidas</button>'
      + '</div>'
    : '';

  cont.innerHTML = header + list.map(function(n) {
    var tipo    = n.tipo   || 'info';
    var titulo  = n.titulo || 'Notificação';
    var msg     = n.msg    || n.mensagem || '';
    var icone   = _NOTIF_ICONS[tipo] || _NOTIF_ICONS.info;

    return '<div class="notif-item tipo-' + tipo + (n.lida ? '' : ' nao-lida') + '">'
      + '<div style="display:flex;align-items:flex-start;gap:10px">'
      +   '<span style="font-size:1.2rem;flex-shrink:0;margin-top:1px">' + icone + '</span>'
      +   '<div style="flex:1">'
      +     '<div class="ni-title">' + esc(titulo) + '</div>'
      +     '<div class="ni-msg">'  + esc(msg)    + '</div>'
      +     '<div class="ni-time">' + fmtDateTime(n.criadaEm) + '</div>'
      +   '</div>'
      + '</div>'
      + '</div>';
  }).join('');

  marcarTodasLidas('coordenador', _uid());
  _atualizarBadges();
}

function marcarTodasLidasLocal() {
  marcarTodasLidas('coordenador', _uid());
  rdNotifs();
=======
  var list=getSolics().filter(function(s){return s.unidadeId===_uid();}); var cont=document.getElementById('listaSolics');
  if(!list.length){cont.innerHTML='<p class="txt2">Nenhuma solicitação.</p>';return;}
  cont.innerHTML=list.map(function(s){
    var sala=getSalaById(s.salaId), inst=getUserById(s.instrutorId);
    var turnosStr = Array.isArray(s.turnos) && s.turnos.length ? s.turnos.join(', ') : (s.turno||'—');
    return '<div class="notif-item tipo-solicit">'
      +'<div class="ni-title">Solicitação — '+esc(inst?inst.nome:'Instrutor')+'</div>'
      +'<div class="ni-msg">Sala: <strong>'+esc(sala?sala.nome:'—')+'</strong>'
      +(sala&&sala.bloco?' <span style="color:var(--text3)">· '+esc(sala.bloco)+' · '+esc(sala.andar||'')+'</span>':'')
      +' · '+fmtData(s.data)+' · <strong>'+esc(turnosStr)+'</strong></div>'
      +(s.motivo?'<div class="ni-msg" style="color:var(--text3)">Motivo: '+esc(s.motivo)+'</div>':'')
      +'<div class="ni-time">'+fmtDateTime(s.criadaEm)+'</div>'
      +(s.status==='pendente'
        ?'<div style="display:flex;gap:8px;margin-top:10px">'
          +'<button class="btn btn-success btn-sm" onclick="responderSolic('+s.id+',\'aprovada\')"><i class="ph ph-check"></i> Aprovar</button>'
          +'<button class="btn btn-danger  btn-sm" onclick="responderSolic('+s.id+',\'recusada\')"><i class="ph ph-x"></i> Recusar</button>'
          +'</div>'
        :'<div class="mt8"><span class="bdg '+(s.status==='aprovada'?'bdg-green':'bdg-red')+'">'+s.status.toUpperCase()+'</span></div>')
      +'</div>';
  }).join('');
}
function responderSolic(id, status) {
  updSolic(id,{status:status});
  var s=getSolics().find(function(x){return x.id===id;});
  var inst=s?getUserById(s.instrutorId):null;

  // Quando aprovada: criar reserva avulsa para o dia solicitado
  if (status==='aprovada' && s) {
    var sala = getSalaById(s.salaId);
    var turnos = Array.isArray(s.turnos) ? s.turnos : [s.turno||'Matutino'];
    // Verificar se a sala tem os turnos disponíveis
    var turnsSala = sala ? (sala.turnos||sala.turnosDisponiveis||[]) : [];
    var turnosValidos = turnos.filter(function(t){ return turnsSala.length===0 || turnsSala.includes(t); });
    if (turnosValidos.length===0) turnosValidos = turnos; // usa mesmo assim, só avisa

    // Cria uma reserva de 1 dia para cada turno solicitado
    var p = s.data.split('-').map(Number);
    var diaSem = ['dom','seg','ter','qua','qui','sex','sab'][new Date(p[0],p[1]-1,p[2]).getDay()];
    turnosValidos.forEach(function(turno){
      // Checar conflito antes de criar
      var conflito = checarConflito(s.salaId, turno, [diaSem], s.data, s.data, null);
      if (!conflito) {
        addReserva({
          salaId:     s.salaId,
          turmaId:    null,            // reserva avulsa, sem turma
          turno:      turno,
          diasSemana: [diaSem],
          dataInicio: s.data,
          dataFim:    s.data,
          instrutorId: s.instrutorId,  // quem solicitou
          reservadoPorId: _sess.id,
          unidadeId:  _uid(),
          avulsa:     true,            // flag para identificar reservas avulsas
          solicId:    id,
        });
      }
    });
  }

  var msg = status==='aprovada'
    ? 'Sua solicitação foi aprovada! A sala foi reservada para você.'
    : 'Sua solicitação foi recusada.';
  addNotif({para:'instrutor',paraId:s?s.instrutorId:null,tipo:'info',titulo:'Solicitação '+status,msg:msg});
  toast('Solicitação '+status+'!','ok'); rdSolics(); _atualizarBadges();
  // Sempre atualiza o mapa para refletir a nova reserva imediatamente
  _popularFiltrosMapa(); rdMapa();
}

/* NOTIFS */
function rdNotifs() {
  var list=getNotifsPara('coordenador',_uid()); var cont=document.getElementById('listaNotifs');
  if(!list.length){cont.innerHTML='<p class="txt2">Sem notificações.</p>';return;}
  cont.innerHTML=list.map(function(n){
    return '<div class="notif-item tipo-'+(n.tipo||'info')+(n.lida?'':' nao-lida')+'">'
      +'<div class="ni-title">'+esc(n.titulo||'Notificação')+'</div>'
      +'<div class="ni-msg">'+esc(n.msg)+'</div>'
      +'<div class="ni-time">'+fmtDateTime(n.criadaEm)+'</div>'
      +'</div>';
  }).join('');
  marcarTodasLidas('coordenador',_uid()); _atualizarBadges();
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
}

function _atualizarBadges() {
  var nc=countNaoLidas('coordenador',_uid()); var bn=document.getElementById('badgeNotif');
  if(bn){bn.textContent=nc;bn.style.display=nc?'':'none';}
  var sp=getSolics().filter(function(s){return s.unidadeId===_uid()&&s.status==='pendente';}).length;
  var bs=document.getElementById('badgeSolic'); if(bs){bs.textContent=sp;bs.style.display=sp?'':'none';}
}

function labelStatus(st){return{ativa:'Ativa',iminente:'Iminente',posterior:'Posterior',encerrada:'Encerrada'}[st]||st;}
function _tx(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
function _vl(id,v){var e=document.getElementById(id);if(e)e.value=v;}
function _gv(id){var e=document.getElementById(id);return e?e.value:'';}

/* ================================================================
   PESQUISA E FILTROS — adicionados à coordenador_page.js (v2)
   ================================================================ */

/* ── Config de busca por seção ── */
var _cfgSalasCoord = {
  busca:{id:'buscarSalaCoord', placeholder:'Pesquisar sala por nome ou tipo…'},
  filtros:[
    {id:'filtTipoSalaC',label:'Tipo',campo:'tipo',opcoes:[
      {value:'Laboratório de Informática',label:'Lab. Informática'},
      {value:'Laboratório de Gastronomia',label:'Lab. Gastronomia'},
      {value:'Laboratório de Enfermagem', label:'Lab. Enfermagem'},
      {value:'Laboratório de Estética',   label:'Lab. Estética'},
      {value:'Laboratório de Ciências',   label:'Lab. Ciências'},
      {value:'Sala de Aula comum',        label:'Sala Comum'},
      {value:'Auditório',                 label:'Auditório'},
      {value:'Sala de Reunião',           label:'Sala Reunião'},
      {value:'Sala de Videoconferência',  label:'Videoconf.'},
    ]},
  ]
};

var _cfgTurmasCoord = {
  busca:{id:'buscarTurmaCoord', placeholder:'Pesquisar por código, curso ou instrutor…'},
  filtros:[
    {id:'filtTurnoTC', label:'Turno',  campo:'turno',   opcoes:[{value:'Matutino',label:'Matutino'},{value:'Vespertino',label:'Vespertino'},{value:'Noturno',label:'Noturno'}]},
    {id:'filtStatusTC',label:'Status', campo:'_status', opcoes:[{value:'ativa',label:'Ativa'},{value:'iminente',label:'Iminente'},{value:'posterior',label:'Posterior'},{value:'encerrada',label:'Encerrada'}]},
  ]
};

var _cfgResCoord = {
  busca:{id:'buscarResCoord', placeholder:'Pesquisar por sala, turma…'},
  filtros:[
    {id:'filtTurnoRC', label:'Turno', campo:'turno', opcoes:[{value:'Matutino',label:'Matutino'},{value:'Vespertino',label:'Vespertino'},{value:'Noturno',label:'Noturno'}]},
  ]
};

var _cfgInstCoord = {
  busca:{id:'buscarInstCoord', placeholder:'Pesquisar instrutor por nome ou e-mail…'},
  filtros:[]
};

/* Wraps das funções originais para adicionar busca */
var _rdSalasOrig = rdSalas;
rdSalas = function() {
  var cont = document.getElementById('searchSalasCoord');
  if (cont && !cont.innerHTML) montarBarraPesquisaFiltros('searchSalasCoord', _cfgSalasCoord, _renderSalasCoord);
  _renderSalasCoord();
};

function _renderSalasCoord() {
  var vals = lerFiltros(_cfgSalasCoord);
  var list = getSalasByUnidade(_uid());
  list = filtrarLista(list, vals._busca, ['nome','tipo','andar','bloco']);
  if (vals.tipo) list = list.filter(function(s){ return s.tipo === vals.tipo; });
  var tb = document.getElementById('tbSalas');
  var cnt = document.getElementById('countSalasCoord');
  if (cnt) cnt.textContent = list.length + ' sala(s)';
  if (!list.length) { tb.innerHTML='<tr class="empty-row"><td colspan="7">Nenhuma sala encontrada.</td></tr>'; return; }
  tb.innerHTML = list.map(function(s){
    var turnos = (s.turnos||s.turnosDisponiveis||[]).map(function(t){return '<span class="bdg bdg-primary">'+t+'</span>';}).join(' ');
    return '<tr>'
      +'<td><strong>'+esc(s.nome)+'</strong></td>'
      +'<td>'+esc(s.andar||'—')+'</td>'
      +'<td>'+esc(s.bloco||'—')+'</td>'
      +'<td>'+s.capacidade+' pess.</td>'
      +'<td>'+esc(s.tipo)+'</td>'
      +'<td>'+turnos+'</td>'
      +'<td><div class="td-actions">'
      +'<button class="btn btn-ghost btn-sm" onclick="abrirSala('+s.id+')">Editar</button>'
      +'<button class="btn btn-danger btn-sm" onclick="excluirSala('+s.id+')">Excluir</button>'
      +'</div></td></tr>';
  }).join('');
}

var _rdTurmasOrig = rdTurmas;
rdTurmas = function() {
  var cont = document.getElementById('searchTurmasCoord');
  if (cont && !cont.innerHTML) montarBarraPesquisaFiltros('searchTurmasCoord', _cfgTurmasCoord, _renderTurmasCoord);
  _renderTurmasCoord();
};

function _renderTurmasCoord() {
  var vals = lerFiltros(_cfgTurmasCoord);
  var list = getTurmas().filter(function(t){return t.unidadeId===_uid();})
    .map(function(t){return Object.assign({},t,{_status:calcStatus(t)});});
  list = filtrarLista(list, vals._busca, ['nome','curso', function(t){var i=getUserById(t.instrutorId);return i?i.nome:'';}]);
  if (vals.turno)     list = list.filter(function(t){return t.turno===vals.turno;});
  if (vals['_status'])list = list.filter(function(t){return t._status===vals['_status'];});
  list.sort(function(a,b){return a.dataInicio.localeCompare(b.dataInicio);});
  var cnt = document.getElementById('countTurmasCoord');
  if (cnt) cnt.textContent = list.length + ' turma(s)';
  var tb = document.getElementById('tbTurmas');
  if (!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="8">Nenhuma turma encontrada.</td></tr>';return;}
  tb.innerHTML = list.map(function(t){
    var inst=t.instrutorId?getUserById(t.instrutorId):null;
    return '<tr><td class="mono"><strong>'+esc(t.nome)+'</strong></td><td>'+esc(t.curso)+'</td>'
      +'<td><span class="bdg bdg-primary">'+esc(t.turno)+'</span></td>'
      +'<td>'+esc(inst?inst.nome:'—')+'</td>'
      +'<td>'+fmtData(t.dataInicio)+'</td><td>'+fmtData(t.dataFim)+'</td>'
      +'<td>'+htmlStatus(t)+'</td>'
      +'<td><div class="td-actions">'
      +'<button class="btn btn-ghost btn-sm" onclick="abrirTurma('+t.id+')">Editar</button>'
      +'<button class="btn btn-danger btn-sm" onclick="excluirTurma('+t.id+')">Excluir</button>'
      +'</div></td></tr>';
  }).join('');
}

var _rdReservasOrig = rdReservas;
rdReservas = function() {
  var cont = document.getElementById('searchResCoord');
  if (cont && !cont.innerHTML) montarBarraPesquisaFiltros('searchResCoord', _cfgResCoord, _renderResCoord);
  _renderResCoord();
};

function _renderResCoord() {
  var vals = lerFiltros(_cfgResCoord);
  var list = getReservas().filter(function(r){return r.unidadeId===_uid();});
  list = filtrarLista(list, vals._busca, [
    function(r){var s=getSalaById(r.salaId);return s?s.nome:'';},
    function(r){var t=getTurmaById(r.turmaId);return t?t.nome:'';},
    'turno'
  ]);
  if (vals.turno) list = list.filter(function(r){return r.turno===vals.turno;});
  list.sort(function(a,b){return a.dataInicio.localeCompare(b.dataInicio);});
  var cnt = document.getElementById('countResCoord');
  if (cnt) cnt.textContent = list.length + ' reserva(s)';
  var tb = document.getElementById('tbReservas');
  if (!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="8">Nenhuma reserva encontrada.</td></tr>';return;}
  tb.innerHTML = list.map(function(r){
    var sala=getSalaById(r.salaId);
    var turma=r.turmaId?getTurmaById(r.turmaId):null;
    var st=r.avulsa?'ativa':(turma?calcStatus(turma):'encerrada');
<<<<<<< HEAD
    var horario = (r.horaInicio && r.horaFim)
      ? '<div style="font-size:.72rem;color:var(--text3)"><i class="ph ph-clock"></i> ' + r.horaInicio + ' - ' + r.horaFim + '</div>' : '';
    var turmaLabel=r.avulsa?'<span class="bdg bdg-amber">Sem turma</span>':esc(turma?turma.nome:'—');
=======
    var turmaLabel=r.avulsa?'<span class="bdg bdg-amber">Avulsa</span>':esc(turma?turma.nome:'—');
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
    return '<tr><td><strong>'+esc(sala?sala.nome:'—')+'</strong></td>'
      +'<td class="mono">'+turmaLabel+'</td>'
      +'<td><span class="bdg bdg-primary">'+esc(r.turno)+'</span></td>'
      +'<td style="font-size:.78rem">'+r.diasSemana.map(function(d){return d.toUpperCase();}).join(', ')+'</td>'
<<<<<<< HEAD
      +'<td style="font-size:.82rem">'+fmtData(r.dataInicio)+' → '+fmtData(r.dataFim)+horario+'</td>'
      +'<td><span class="st st-'+st+'">'+labelStatus(st)+'</span></td>'
      +'<td><div class="td-actions">'
      +'<button class="btn btn-ghost btn-sm" onclick="abrirReserva('+r.id+')">Editar</button>'
=======
      +'<td style="font-size:.82rem">'+fmtData(r.dataInicio)+' → '+fmtData(r.dataFim)+'</td>'
      +'<td><span class="st st-'+st+'">'+labelStatus(st)+'</span></td>'
      +'<td><div class="td-actions">'
      +(!r.avulsa?'<button class="btn btn-ghost btn-sm" onclick="abrirReserva('+r.id+')">Editar</button>':'')
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
      +'<button class="btn btn-danger btn-sm" onclick="excluirReserva('+r.id+')">Excluir</button>'
      +'</div></td></tr>';
  }).join('');
}

var _rdInstOrig = rdInstrutores;
rdInstrutores = function() {
  var cont = document.getElementById('searchInstCoord');
  if (cont && !cont.innerHTML) montarBarraPesquisaFiltros('searchInstCoord', _cfgInstCoord, _renderInstCoord);
  _renderInstCoord();
};

<<<<<<< HEAD
var _excluirReservaCoordOrig = excluirReserva;
excluirReserva = function(id) {
  _excluirReservaCoordOrig(id);
  _refreshMapaCoord();
};

=======
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
function _renderInstCoord() {
  var vals = lerFiltros(_cfgInstCoord);
  var list = getUsersByPerfil('instrutor').filter(function(u){return u.unidadeId===_uid();});
  list = filtrarLista(list, vals._busca, ['nome','email']);
  var cnt = document.getElementById('countInstCoord');
  if (cnt) cnt.textContent = list.length + ' instrutor(es)';
  var tb = document.getElementById('tbInst');
  if (!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="4">Nenhum instrutor encontrado.</td></tr>';return;}
  tb.innerHTML = list.map(function(u){
    var turmas=getTurmas().filter(function(t){return t.instrutorId===u.id&&t.unidadeId===_uid();});
    var tHtml=turmas.length?turmas.map(function(t){return '<span class="st st-'+calcStatus(t)+'" style="margin-right:4px">'+esc(t.nome)+'</span>';}).join(''):'<span class="txt3">Nenhuma</span>';
    return '<tr><td><strong>'+esc(u.nome)+'</strong></td><td class="mono">'+esc(u.email)+'</td>'
      +'<td>'+tHtml+'</td>'
<<<<<<< HEAD
      +'<td><button class="btn btn-ghost btn-sm" onclick="abrirAtrib('+u.id+')">Atribuir Turmas</button></td></tr>';
=======
      +'<td><button class="btn btn-ghost btn-sm" onclick="abrirAtrib('+u.id+')">Atribuir Turma</button></td></tr>';
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
  }).join('');
}
