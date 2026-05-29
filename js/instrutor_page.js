/* ── AUXILIARES DE LIBERAÇÃO DE SALA ─────────────────────── */
function _dataLiberacao(salaId, hj) {
  // Retorna texto com data de liberação da sala se ocupada hoje
  var rs = getReservas().filter(function(r){
    return r.salaId === salaId && r.dataFim >= hj;
  });
  if (!rs.length) return '';
  // Pega a reserva que termina mais tarde
  var maxFim = rs.reduce(function(acc, r) {
    return r.dataFim > acc ? r.dataFim : acc;
  }, hj);
  // Calcula data seguinte ao fim
  var parts = maxFim.split('-').map(Number);
  var dtFim = new Date(parts[0], parts[1]-1, parts[2]);
  dtFim.setDate(dtFim.getDate() + 1);
  var liberacao = dtFim.toISOString().split('T')[0];
  return ' <span style="color:var(--amber);font-weight:600">&mdash; Livre a partir de ' + fmtData(liberacao) + '</span>';
}

function _dataLiberacaoPorTurnos(salaId, data, turnos) {
  // Retorna a data de liberação mais próxima para os turnos em conflito
  var maxFim = null;
  turnos.forEach(function(turno) {
    var rs = getReservas().filter(function(r) {
      return r.salaId === salaId && r.turno === turno && r.dataFim >= data;
    });
    rs.forEach(function(r) {
      var t = r.turmaId ? getTurmaById(r.turmaId) : null;
      if (t && calcStatus(t) === 'encerrada') return;
      if (!maxFim || r.dataFim > maxFim) maxFim = r.dataFim;
    });
  });
  if (!maxFim) return null;
  // Data seguinte ao fim da última reserva
  var parts = maxFim.split('-').map(Number);
  var dtFim = new Date(parts[0], parts[1]-1, parts[2]);
  dtFim.setDate(dtFim.getDate() + 1);
  var liberacao = dtFim.toISOString().split('T')[0];
  return fmtData(liberacao);
}

<<<<<<< HEAD
function _turnosDaSalaSolic(salaId) {
  var sala = salaId ? getSalaById(parseInt(salaId)) : null;
  var turnos = sala ? (sala.turnos || sala.turnosDisponiveis || []) : [];
  return turnos.length ? turnos : ['Matutino','Vespertino','Noturno'];
}

function _mostrarErroTurno(msg) {
  var erEl = document.getElementById('slTurnoErro');
  if (!erEl) return;
  erEl.innerHTML = '<i class="ph ph-warning-circle"></i> ' + msg;
  erEl.style.cssText = 'display:block;color:var(--red);font-size:.82rem;margin-top:2px;font-weight:600';
}

function _atualizarTurnosSolic(salaId, preferidos) {
  var permitidos = _turnosDaSalaSolic(salaId);
  var prefs = Array.isArray(preferidos) ? preferidos : [];
  document.querySelectorAll('#slTurnosChips .chip').forEach(function(c){
    var permitido = permitidos.indexOf(c.dataset.v) !== -1;
    c.classList.toggle('ativo', permitido && (prefs.length ? prefs.indexOf(c.dataset.v) !== -1 : true));
    c.classList.toggle('disabled', !permitido);
    c.setAttribute('aria-disabled', permitido ? 'false' : 'true');
    c.style.opacity = permitido ? '' : '.38';
    c.style.cursor = permitido ? 'pointer' : 'not-allowed';
    c.title = permitido ? '' : 'Esta sala nao atende o turno ' + c.dataset.v;
  });
}

function slToggleTurno(el) {
  if (!el) return;
  if (el.classList.contains('disabled') || el.getAttribute('aria-disabled') === 'true') {
    _mostrarErroTurno('Esta sala nao atende o turno ' + el.dataset.v + '.');
    return;
  }
  el.classList.toggle('ativo');
  verificarDisponibilidadeSolic();
}

var _sess;

window.addEventListener('DOMContentLoaded', async function() {
  await initDados(); requirePerfil('instrutor'); _sess = getSessao();
=======
var _sess;

window.addEventListener('DOMContentLoaded', function() {
  initDados(); requirePerfil('instrutor'); _sess = getSessao();
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
  initSidebar(); initLogo(); ir('turmas'); _atualizarBadge();
});

function _uid(){ return _sess?_sess.unidadeId:null; }

function ir(aba) {
  document.querySelectorAll('.pg').forEach(function(p){p.classList.remove('ativa');p.style.display='none';});
  var pg=document.getElementById('pg-'+aba); if(pg){pg.classList.add('ativa');pg.style.display='block';}
  document.querySelectorAll('.sb-btn').forEach(function(b){b.classList.remove('ativo');});
  var btn=document.getElementById('nav-'+aba); if(btn)btn.classList.add('ativo');
<<<<<<< HEAD
  var meta={turmas:{t:'Minhas Turmas',s:'Turmas atribuídas a você'},salas:{t:'Solicitar Sala',s:'Solicite uma sala disponível'},notifs:{t:'Notificações',s:'Avisos e respostas'},calendario:{t:'Calendário de Reservas',s:'Visualize suas reservas por data e turno'}};
  var m=meta[aba]||{}; document.getElementById('tbTitle').textContent=m.t||aba; document.getElementById('tbSub').textContent=m.s||'';
  if(aba==='turmas') rdTurmas();
  if(aba==='salas')  rdSalas();
  if(aba==='notifs') rdNotifs();
  if(aba==='calendario')  rdCalendario();
=======
  var meta={turmas:{t:'Minhas Turmas',s:'Turmas atribuídas a você'},salas:{t:'Solicitar Sala',s:'Solicite uma sala disponível'},chaves:{t:'Chaves',s:'Sinalizar retirada e devolução de chaves'},notifs:{t:'Notificações',s:'Avisos e respostas'}};
  var m=meta[aba]||{}; document.getElementById('tbTitle').textContent=m.t||aba; document.getElementById('tbSub').textContent=m.s||'';
  if(aba==='turmas') rdTurmas();
  if(aba==='salas')  rdSalas();
  if(aba==='chaves') rdChaves();
  if(aba==='notifs') rdNotifs();
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
}

function rdTurmas() {
  var list=getTurmas().filter(function(t){return t.instrutorId===_sess.id;});
  var tb=document.getElementById('tbTurmas');
  if(!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="6">Nenhuma turma atribuída a você.</td></tr>';return;}
  tb.innerHTML=list.map(function(t){
    var res=getReservas().filter(function(r){return r.turmaId===t.id;}); var sala=res.length?getSalaById(res[0].salaId):null;
    return '<tr><td class="mono"><strong>'+esc(t.nome)+'</strong></td><td>'+esc(t.curso)+'</td>'
      +'<td><span class="bdg bdg-primary">'+esc(t.turno)+'</span></td>'
      +'<td>'+esc(sala?sala.nome:'Sem sala reservada')+'</td>'
      +'<td>'+htmlStatus(t)+'</td>'
      +'<td style="font-size:.82rem">'+fmtData(t.dataInicio)+' → '+fmtData(t.dataFim)+'</td></tr>';
  }).join('');
}

function rdSalas() {
  var salas=getSalasByUnidade(_uid()); var cont=document.getElementById('listaSalas'); var hj=hojeISO();
  if(!salas.length){cont.innerHTML='<p class="txt2">Nenhuma sala cadastrada na unidade.</p>';return;}
  var pp=hj.split('-').map(Number);
  var dia=['dom','seg','ter','qua','qui','sex','sab'][new Date(pp[0],pp[1]-1,pp[2]).getDay()];
  cont.innerHTML=salas.map(function(s){
    var livre=true; var ocupacoes=[]; var instNome='';
    var rs=getReservas().filter(function(r){return r.salaId===s.id&&r.dataInicio<=hj&&r.dataFim>=hj;});
    for(var i=0;i<rs.length;i++){
      var r=rs[i];
      if(!r.diasSemana.includes(dia)) continue;
      if(r.avulsa||!r.turmaId){livre=false;ocupacoes.push('Reservada ('+r.turno+')');break;}
      var t=getTurmaById(r.turmaId); if(!t||calcStatus(t)==='encerrada')continue;
      livre=false;
      var inst=t&&t.instrutorId?getUserById(t.instrutorId):null; instNome=inst?inst.nome:'';
      ocupacoes.push(r.turno+': '+t.nome);
    }
    var infoHtml=livre
      ?'<span style="color:var(--green);font-weight:600"><span class="ic-dot ic-livre"></span> Disponível hoje</span>'
      :'<span style="color:var(--red);font-weight:600"><span class="ic-dot ic-ocupada"></span> '+ocupacoes.join(' | ')+'</span>';
    var turnosHtml=(s.turnos||s.turnosDisponiveis||[]).map(function(t){
      return '<span class="mapa-turno">'+t[0]+'</span>';
    }).join('');
    return '<div class="sala-card-v2 '+(livre?'livre':'ocupada')+'">'
      +'<div class="sc-header"><div class="sc-nome">'+esc(s.nome)+'</div>'
      +'<div class="sc-status-dot '+(livre?'livre':'ocupada')+'"></div></div>'
      +'<div class="sc-tipo">'+esc(s.tipo)+'</div>'
      +'<div class="sc-meta">'
      +(s.andar?'<div class="sc-meta-item"><span class="sc-meta-icon"><i class="ph ph-buildings"></i></span>'+esc(s.andar)+'</div>':'')
      +(s.bloco?'<div class="sc-meta-item"><span class="sc-meta-icon"><i class="ph ph-map-pin"></i></span>'+esc(s.bloco)+'</div>':'')
      +'<div class="sc-meta-item"><span class="sc-meta-icon"><i class="ph ph-users"></i></span>'+s.capacidade+'</div>'
      +'</div>'
      +'<div class="sc-turnos">'+turnosHtml+'</div>'
      +'<div style="margin-top:6px;font-size:.78rem">'+infoHtml+'</div>'
      +(instNome?'<div style="font-size:.75rem;color:var(--text2);margin-top:3px"><i class="ph ph-user"></i> '+esc(instNome)+'</div>':'')
      +(livre
        ?'<button class="btn btn-primary btn-sm" style="margin-top:10px;width:100%" onclick="abrirSolic('+s.id+')"><i class="ph ph-clipboard-text"></i> Solicitar Sala</button>'
        :'<div style="margin-top:8px">'          +'<div style="font-size:.78rem;color:var(--red);font-weight:600;margin-bottom:4px"><i class="ph ph-lock"></i> Sala ocupada hoje'+_dataLiberacao(s.id,hj)+'</div>'          +'<button class="btn btn-ghost btn-sm" style="width:100%;margin-top:4px" onclick="abrirSolic('+s.id+')"><i class="ph ph-calendar-plus"></i> Solicitar para outra data</button>'          +'</div>')
      +'</div>';
  }).join('');
}

function abrirSolic(salaId) {
<<<<<<< HEAD
  document.getElementById('slSalaId').value = salaId;
  var s = getSalaById(salaId);
  document.getElementById('slNome').textContent = s ? s.nome : '';
  document.getElementById('slData').value    = '';
  document.getElementById('slDataIni').value = '';
  document.getElementById('slDataFim').value = '';
  document.getElementById('slMotivo').value  = '';
  document.getElementById('slHoraIni').value = '';
  document.getElementById('slHoraFim').value = '';
  document.getElementById('slListaDatas').innerHTML = '';
  window._slDatasEspecificas = [];
  var turnsSala = _turnosDaSalaSolic(salaId);

  // Popula turmas do instrutor
  var selT = document.getElementById('slTurma');
  selT.innerHTML = '<option value="">\u2014 Sem turma vinculada \u2014</option>';
  var minhasTurmas = getTurmas().filter(function(t){
    return t.instrutorId === _sess.id && calcStatus(t) !== 'encerrada' && turnsSala.indexOf(t.turno) !== -1;
  });
  minhasTurmas.forEach(function(t){
    var o = document.createElement('option');
    o.value = t.id;
    o.textContent = (t.codigo||t.nome) + (t.curso ? ' \u2014 ' + t.curso : '');
    o.dataset.turno = t.turno || '';
    selT.appendChild(o);
  });

  // Turnos da sala pre-marcados; turnos fora da sala ficam bloqueados.
  _atualizarTurnosSolic(salaId);

  // Reset modo data
  slModoData('unica');

  var erEl = document.getElementById('slTurnoErro');
  if (erEl) erEl.style.display = 'none';
  var divDisp = document.getElementById('slDisponibilidade');
  if (divDisp) divDisp.style.display = 'none';
  modalAbrir('modalSolic');
}

/* Alterna modo de sele\xe7\xe3o de data */
function slModoData(modo) {
  window._slModoData = modo;
  var s1 = document.getElementById('slSecaoUnica');
  var s2 = document.getElementById('slSeaoPeriodo');
  var s3 = document.getElementById('slSecaoEspecificas');
  var b1 = document.getElementById('slBtnUnica');
  var b2 = document.getElementById('slBtnPeriodo');
  var b3 = document.getElementById('slBtnEsp');

  if (s1) s1.style.display = modo === 'unica'       ? '' : 'none';
  if (s2) s2.style.display = modo === 'periodo'     ? '' : 'none';
  if (s3) s3.style.display = modo === 'especificas' ? '' : 'none';

  [b1,b2,b3].forEach(function(b){ if(b) b.classList.remove('sl-tipo-ativo'); });
  var ativo = modo === 'unica' ? b1 : modo === 'periodo' ? b2 : b3;
  if (ativo) ativo.classList.add('sl-tipo-ativo');
}

function _dateFromIsoLocal(iso) {
  var p = (iso || '').split('-').map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
}

function _diaSemanaIso(iso) {
  return ['dom','seg','ter','qua','qui','sex','sab'][_dateFromIsoLocal(iso).getDay()];
}

function _isoFromDateLocal(dt) {
  var y = dt.getFullYear();
  var m = String(dt.getMonth() + 1).padStart(2, '0');
  var d = String(dt.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function _datasNoPeriodo(ini, fim) {
  var datas = [];
  var atual = _dateFromIsoLocal(ini);
  var limite = _dateFromIsoLocal(fim);
  while (atual <= limite) {
    datas.push(_isoFromDateLocal(atual));
    atual.setDate(atual.getDate() + 1);
  }
  return datas;
}

function _diasSemanaDatas(datas) {
  return [].slice.call(new Set((datas || []).map(_diaSemanaIso)));
}

/* Adicionar data espec\xedfica na lista */
function slAdicionarData() {
  var inp = document.getElementById('slDataAvulsa');
  var val = inp ? inp.value : '';
  if (!val) { toast('Selecione uma data para adicionar.', 'aviso'); return; }
  if (!window._slDatasEspecificas) window._slDatasEspecificas = [];
  if (window._slDatasEspecificas.includes(val)) { toast('Data j\xe1 adicionada.', 'aviso'); return; }
  window._slDatasEspecificas.push(val);
  window._slDatasEspecificas.sort();
  _renderDatasEspecificas();
  inp.value = '';
}

function _renderDatasEspecificas() {
  var cont = document.getElementById('slListaDatas');
  if (!cont) return;
  cont.innerHTML = (window._slDatasEspecificas || []).map(function(d){
    var p = d.split('-');
    var label = p[2]+'/'+p[1]+'/'+p[0];
    return '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--primary-l);color:var(--primary);border:1px solid var(--primary-d);border-radius:6px;padding:3px 8px;font-size:.78rem;font-weight:600">'
      + label
      + '<button onclick="slRemoverData(\''+d+'\')" style="background:none;border:none;cursor:pointer;color:var(--primary);font-size:.9rem;padding:0;line-height:1">\xd7</button></span>';
  }).join('');
}

function slRemoverData(iso) {
  window._slDatasEspecificas = (window._slDatasEspecificas||[]).filter(function(d){ return d !== iso; });
  _renderDatasEspecificas();
}

/* Pr\xe9-preenche turno ao selecionar turma */
function slOnTurmaChange() {
  var sel = document.getElementById('slTurma');
  var opt = sel.options[sel.selectedIndex];
  if (!opt || !opt.value) return;
  var turma = getTurmaById(parseInt(opt.value));
  if (!turma) return;
  var salaId = parseInt(document.getElementById('slSalaId').value);
  var turnosSala = _turnosDaSalaSolic(salaId);
  if (turnosSala.indexOf(turma.turno) === -1) {
    _atualizarTurnosSolic(salaId);
    _mostrarErroTurno('A turma e ' + turma.turno + ', mas esta sala atende apenas: ' + turnosSala.join(', ') + '.');
  } else {
    _atualizarTurnosSolic(salaId, [turma.turno]);
  }
  // Pr\xe9-preencher data de in\xedcio da turma no modo per\xedodo
  if (window._slModoData === 'periodo') {
    var ini = document.getElementById('slDataIni');
    var fim = document.getElementById('slDataFim');
    if (ini && !ini.value && turma.dataInicio) ini.value = turma.dataInicio;
    if (fim && !fim.value && turma.dataFim)    fim.value = turma.dataFim;
  }
  verificarDisponibilidadeSolic();
}

/* Verifica disponibilidade em tempo real */
function verificarDisponibilidadeSolic() {
  var salaId  = parseInt(document.getElementById('slSalaId').value);
  var divDisp = document.getElementById('slDisponibilidade');
  var erEl    = document.getElementById('slTurnoErro');
  if (!divDisp) return;

  var modo = window._slModoData || 'unica';
  var data = '', dataFim = '', diasVerif = [];
  if (modo === 'unica') {
    data = document.getElementById('slData').value;
    dataFim = data;
    if (data) diasVerif = [_diaSemanaIso(data)];
  }
  else if (modo === 'periodo') {
    data = document.getElementById('slDataIni').value;
    dataFim = document.getElementById('slDataFim').value || data;
    if (data && dataFim && dataFim >= data) diasVerif = _diasSemanaDatas(_datasNoPeriodo(data, dataFim));
  }
  else { divDisp.style.display='none'; return; }

  if (!data || !salaId || !diasVerif.length) { divDisp.style.display='none'; return; }

  var turnos = [].slice.call(document.querySelectorAll('#slTurnosChips .chip.ativo'))
    .map(function(c){ return c.dataset.v; });
  var turnosSala = _turnosDaSalaSolic(salaId);
  turnos = turnos.filter(function(t){ return turnosSala.indexOf(t) !== -1; });

  var turnosVerif = turnos.length ? turnos : turnosSala;
  var conflitos = [], livres = [];
=======
  document.getElementById('slSalaId').value=salaId;
  var s=getSalaById(salaId);
  document.getElementById('slNome').textContent=s?s.nome:'';
  document.getElementById('slData').value='';
  document.getElementById('slMotivo').value='';
  // Pré-seleciona os turnos disponíveis da sala
  var turnsSala = s ? (s.turnos||s.turnosDisponiveis||[]) : [];
  document.querySelectorAll('#slTurnosChips .chip').forEach(function(c){
    c.classList.remove('ativo');
    // se a sala tem turnos definidos, pré-marca os disponíveis
    if(turnsSala.length && turnsSala.includes(c.dataset.v)) c.classList.add('ativo');
  });
  var erEl=document.getElementById('slTurnoErro');
  if(erEl) erEl.style.display='none';
  var divDisp = document.getElementById('slDisponibilidade');
  if(divDisp) divDisp.style.display='none';
  modalAbrir('modalSolic');
}

/* Verifica disponibilidade em tempo real ao selecionar data/turno */
function verificarDisponibilidadeSolic() {
  var salaId  = parseInt(document.getElementById('slSalaId').value);
  var data    = document.getElementById('slData').value;
  var divDisp = document.getElementById('slDisponibilidade');
  var erEl    = document.getElementById('slTurnoErro');
  if(!divDisp) return;
  if(!data || !salaId) { divDisp.style.display='none'; return; }

  var turnos = [].slice.call(document.querySelectorAll('#slTurnosChips .chip.ativo'))
    .map(function(c){ return c.dataset.v; });

  var p = data.split('-').map(Number);
  var diaSem = ['dom','seg','ter','qua','qui','sex','sab'][new Date(p[0],p[1]-1,p[2]).getDay()];

  // Verificar cada turno selecionado (ou todos se nenhum selecionado)
  var turnosVerif = turnos.length ? turnos : ['Matutino','Vespertino','Noturno'];
  var conflitos = [];
  var livres    = [];
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4

  turnosVerif.forEach(function(turno) {
    var rs = getReservas().filter(function(r) {
      return r.salaId === salaId && r.turno === turno
<<<<<<< HEAD
          && r.dataInicio <= dataFim && r.dataFim >= data
          && r.diasSemana && r.diasSemana.some(function(dia){ return diasVerif.indexOf(dia) !== -1; });
=======
          && r.dataInicio <= data && r.dataFim >= data
          && r.diasSemana.includes(diaSem);
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
    });
    var ocupado = rs.some(function(r) {
      var t = r.turmaId ? getTurmaById(r.turmaId) : null;
      return r.avulsa || (t && calcStatus(t) !== 'encerrada');
    });
    if (ocupado) {
<<<<<<< HEAD
=======
      // Busca quando vai liberar
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
      var maxFim = null;
      getReservas().filter(function(r){
        return r.salaId === salaId && r.turno === turno && r.dataFim >= data;
      }).forEach(function(r){
        var t = r.turmaId ? getTurmaById(r.turmaId) : null;
        if(t && calcStatus(t)==='encerrada') return;
        if(!maxFim || r.dataFim > maxFim) maxFim = r.dataFim;
      });
<<<<<<< HEAD
      var lib = '';
      if (maxFim) {
        var pp = maxFim.split('-').map(Number);
        var dtF = new Date(pp[0],pp[1]-1,pp[2]); dtF.setDate(dtF.getDate()+1);
        lib = ' \u2014 livre a partir de <strong>' + fmtData(dtF.toISOString().split('T')[0]) + '</strong>';
      }
      conflitos.push({ turno: turno, lib: lib });
=======
      var liberacaoStr = '';
      if(maxFim) {
        var dtFim = new Date(maxFim.split('-').map(Number).reduce(function(acc,v,i){
          return i===0?new Date(v,0,1):acc; // placeholder
        }, null));
        var pp = maxFim.split('-').map(Number);
        dtFim = new Date(pp[0], pp[1]-1, pp[2]);
        dtFim.setDate(dtFim.getDate()+1);
        liberacaoStr = ' &mdash; livre a partir de <strong>' + fmtData(dtFim.toISOString().split('T')[0]) + '</strong>';
      }
      conflitos.push({ turno: turno, liberacao: liberacaoStr });
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
    } else {
      livres.push(turno);
    }
  });

  if (!conflitos.length && !livres.length) { divDisp.style.display='none'; return; }
<<<<<<< HEAD
  var html = '';
  if (conflitos.length) {
    html += '<div style="color:var(--red);font-weight:600;margin-bottom:4px"><i class="ph ph-warning-circle"></i> Turno(s) ocupado(s):</div>';
    conflitos.forEach(function(c){
      html += '<div style="margin-left:8px;color:var(--text2)"><i class="ph ph-lock"></i> <strong>'+c.turno+'</strong>'+c.lib+'</div>';
    });
  }
  if (livres.length && turnos.length) {
    html += '<div style="color:var(--green);font-weight:600;margin-top:'+(conflitos.length?'8px':'0')+'"><i class="ph ph-check-circle"></i> Dispon\xedvel:</div>';
=======

  var html = '';
  if (conflitos.length) {
    html += '<div style="color:var(--red);font-weight:600;margin-bottom:4px"><i class="ph ph-warning-circle"></i> Turno(s) ocupado(s) nesta data:</div>';
    conflitos.forEach(function(c){
      html += '<div style="margin-left:8px;color:var(--text2)"><i class="ph ph-lock"></i> <strong>'+c.turno+'</strong>'+c.liberacao+'</div>';
    });
  }
  if (livres.length && turnos.length) {
    html += '<div style="color:var(--green);font-weight:600;margin-top:'+(conflitos.length?'8px':'0')+'"><i class="ph ph-check-circle"></i> Disponível:</div>';
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
    livres.forEach(function(t){
      html += '<div style="margin-left:8px;color:var(--text2)"><i class="ph ph-check"></i> <strong>'+t+'</strong></div>';
    });
  }
  if (conflitos.length) {
    divDisp.style.cssText = 'display:block;padding:10px 14px;border-radius:8px;font-size:.83rem;line-height:1.7;background:var(--red-l);border:1px solid rgba(220,38,38,.25)';
  } else {
    divDisp.style.cssText = 'display:block;padding:10px 14px;border-radius:8px;font-size:.83rem;line-height:1.7;background:var(--green-l);border:1px solid rgba(5,150,105,.25)';
  }
  divDisp.innerHTML = html;
<<<<<<< HEAD
  if (erEl) erEl.style.display='none';
}

function _getTurnosSolic() {
  var salaId = parseInt(document.getElementById('slSalaId').value);
  var turnosSala = _turnosDaSalaSolic(salaId);
  return [].slice.call(document.querySelectorAll('#slTurnosChips .chip.ativo'))
    .map(function(c){return c.dataset.v;})
    .filter(function(t){ return turnosSala.indexOf(t) !== -1; });
}

function enviarSolic() {
  var salaId  = parseInt(document.getElementById('slSalaId').value);
  var turnos  = [...new Set(_getTurnosSolic())];
  var motivo  = document.getElementById('slMotivo').value.trim();
  var erEl    = document.getElementById('slTurnoErro');
  var modo    = window._slModoData || 'unica';
  var horaIni = (document.getElementById('slHoraIni').value||'').trim();
  var horaFim = (document.getElementById('slHoraFim').value||'').trim();
  var turmaId = parseInt(document.getElementById('slTurma').value)||null;
  var diasSel = [];
  var turnosSala = _turnosDaSalaSolic(salaId);
  var turmaSel = turmaId ? getTurmaById(turmaId) : null;

  // Valida modo
  var datasParaEnviar = [];
  var dataIniGlobal = '', dataFimGlobal = '';

  if (modo === 'unica') {
    var d = document.getElementById('slData').value;
    if (!d) { toast('Selecione uma data.','aviso'); return; }
    datasParaEnviar = [d];
    dataIniGlobal = d; dataFimGlobal = d;
  } else if (modo === 'periodo') {
    dataIniGlobal = document.getElementById('slDataIni').value;
    dataFimGlobal = document.getElementById('slDataFim').value;
    if (!dataIniGlobal || !dataFimGlobal) { toast('Informe data de in\xedcio e fim.','aviso'); return; }
    if (dataFimGlobal < dataIniGlobal) { toast('A data fim deve ser ap\xf3s a data in\xedcio.','aviso'); return; }
    datasParaEnviar = _datasNoPeriodo(dataIniGlobal, dataFimGlobal);
  } else {
    if (!window._slDatasEspecificas || !window._slDatasEspecificas.length) {
      toast('Adicione ao menos uma data.','aviso'); return;
    }
    datasParaEnviar = window._slDatasEspecificas;
    dataIniGlobal = datasParaEnviar[0];
    dataFimGlobal = datasParaEnviar[datasParaEnviar.length-1];
  }
  diasSel = _diasSemanaDatas(datasParaEnviar);

  if (!turnos.length) {
    if(erEl){_mostrarErroTurno('Selecione ao menos um turno disponivel para esta sala.');}
    return;
  }
  if(erEl) erEl.style.display='none';
  var invalidos = turnos.filter(function(t){ return turnosSala.indexOf(t) === -1; });
  if (invalidos.length) {
    _mostrarErroTurno('Esta sala atende apenas: ' + turnosSala.join(', ') + '.');
    return;
  }
  if (turmaSel && turnosSala.indexOf(turmaSel.turno) === -1) {
    _mostrarErroTurno('A turma selecionada e ' + turmaSel.turno + ', mas esta sala atende apenas: ' + turnosSala.join(', ') + '.');
    return;
  }
  if (turmaSel && turnos.indexOf(turmaSel.turno) === -1) {
    _mostrarErroTurno('Selecione o turno da turma vinculada: ' + turmaSel.turno + '.');
    return;
  }

  // Verifica conflito na(s) data(s)
  var conflitou = false;
  if (modo === 'periodo') {
    turnos.forEach(function(turno){
      var rs = getReservas().filter(function(r){
        return r.salaId===salaId && r.turno===turno
            && r.dataInicio<=dataFimGlobal && r.dataFim>=dataIniGlobal
            && r.diasSemana && r.diasSemana.some(function(dia){ return diasSel.indexOf(dia) !== -1; });
      });
      rs.forEach(function(r){
        var t = r.turmaId?getTurmaById(r.turmaId):null;
        if(r.avulsa||(t&&calcStatus(t)!=='encerrada')) conflitou=true;
      });
    });
  } else {
    datasParaEnviar.forEach(function(data){
      var diaSem = _diaSemanaIso(data);
      turnos.forEach(function(turno){
        var rs = getReservas().filter(function(r){
          return r.salaId===salaId && r.turno===turno
              && r.dataInicio<=data && r.dataFim>=data
              && r.diasSemana && r.diasSemana.includes(diaSem);
        });
        rs.forEach(function(r){
          var t = r.turmaId?getTurmaById(r.turmaId):null;
          if(r.avulsa||(t&&calcStatus(t)!=='encerrada')) conflitou=true;
        });
      });
    });
  }

  if (conflitou) {
    if(erEl){erEl.innerHTML='<i class="ph ph-warning"></i> Sala j\xe1 reservada em um dos per\xedodos selecionados.';erEl.style.display='block';}
    return;
  }

  // Cria solicita\xe7\xe3o
  var solic = addSolic({
    salaId: salaId, instrutorId: _sess.id,
    turmaId: turmaId,
    data: dataIniGlobal, dataInicio: dataIniGlobal, dataFim: dataFimGlobal,
    datasEspecificas: modo==='especificas' ? datasParaEnviar : null,
    diasSemana: diasSel.length ? diasSel : null,
    turnos: turnos, turno: turnos[0],
    horaInicio: horaIni, horaFim: horaFim,
    motivo: motivo, unidadeId: _uid(), modo: modo
  });
  var sala = getSalaById(salaId);
  var horario = (horaIni && horaFim) ? ' das '+horaIni+' \xe0s '+horaFim : '';
  addNotif({
    paraPerfil:'coordenador', unidadeId:_uid(), tipo:'solic',
    titulo:'Nova Solicita\xe7\xe3o de Sala',
    msg:_sess.nome+' solicitou a sala "'+(sala?sala.nome:'?')+'"'
       +' em '+fmtData(dataIniGlobal)
       +(modo==='periodo'?' até '+fmtData(dataFimGlobal):'')
       +(modo==='especificas'?' ('+datasParaEnviar.length+' data(s))':'')
       +horario+'.'
  });
  toast('Solicita\xe7\xe3o enviada! Aguarde aprova\xe7\xe3o.','ok');
  modalFechar('modalSolic');
}


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
  var list = getNotifsPara('instrutor', _uid()).filter(function(n){return !n.paraId||n.paraId===_sess.id||n.paraId===_uid();});
  var cont  = document.getElementById('listaNotifs');
  if (!list.length) { cont.innerHTML = '<p class="txt2">Sem notificações.</p>'; return; }
  cont.innerHTML = list.map(function(n) {
    var tipo   = n.tipo   || 'info';
    var titulo = n.titulo || 'Notificação';
    var msg    = n.msg    || n.mensagem || '';
    var icone  = _NOTIF_ICONS[tipo] || _NOTIF_ICONS.info;
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
  marcarTodasLidas('instrutor', _uid()); _atualizarBadge();
=======
  if(erEl) erEl.style.display='none';
}
function _getTurnosSolic() {
  return [].slice.call(document.querySelectorAll('#slTurnosChips .chip.ativo'))
    .map(function(c){return c.dataset.v;});
}
function enviarSolic() {
  var salaId=parseInt(document.getElementById('slSalaId').value);
  var data=document.getElementById('slData').value;
  var turnos=_getTurnosSolic();
  var motivo=document.getElementById('slMotivo').value.trim();
  var erEl=document.getElementById('slTurnoErro');
  if(!data){toast('Selecione uma data.','aviso');return;}
  if(!turnos.length){
    if(erEl){erEl.textContent='Selecione ao menos um turno.';erEl.style.display='block';}
    return;
  }
  if(erEl) erEl.style.display='none';

  // Verificar se algum turno já está reservado nessa data
  var p=data.split('-').map(Number);
  var diaSem=['dom','seg','ter','qua','qui','sex','sab'][new Date(p[0],p[1]-1,p[2]).getDay()];
  var conflitos=[];
  turnos.forEach(function(turno){
    var rs=getReservas().filter(function(r){
      return r.salaId===salaId && r.turno===turno && r.dataInicio<=data && r.dataFim>=data && r.diasSemana.includes(diaSem);
    });
    rs.forEach(function(r){
      var t=r.turmaId?getTurmaById(r.turmaId):null;
      var ativo=r.avulsa||(t&&calcStatus(t)!=='encerrada');
      if(ativo) conflitos.push(turno);
    });
  });

  if(conflitos.length){
    if(erEl){
      var liberacao = _dataLiberacaoPorTurnos(salaId, data, conflitos);
      var msgConflito = 'Sala já reservada no(s) turno(s): '+conflitos.join(', ')+'.';
      if(liberacao) msgConflito += ' Será liberada em: '+liberacao+'.';
      else msgConflito += ' Escolha outro turno ou data.';
      erEl.innerHTML = '<i class="ph ph-warning"></i> '+msgConflito;
      erEl.style.display='block';
    }
    return;
  }

  addSolic({salaId:salaId,instrutorId:_sess.id,data:data,turnos:turnos,turno:turnos[0],motivo:motivo,unidadeId:_uid()});
  var sala=getSalaById(salaId);
  var turnosStr=turnos.join(', ');
  addNotif({para:'coordenador',paraId:_uid(),tipo:'solicit',titulo:'Nova solicitação de sala',
    msg:_sess.nome+' solicitou '+(sala?sala.nome:'sala')+' em '+fmtData(data)+' ('+turnosStr+').'});
  toast('Solicitação enviada ao coordenador!','ok'); modalFechar('modalSolic'); rdSalas();
}

function rdChaves() {
  var list=getChaves().filter(function(c){return c.unidadeId===_uid();}); var cont=document.getElementById('listaChaves');
  if(!list.length){cont.innerHTML='<p class="txt2">Nenhuma chave cadastrada na unidade.</p>';return;}
  cont.innerHTML=list.map(function(c){
    var sala=getSalaById(c.salaId); var pega=c.status==='pega'; var minha=c.instrutorId===_sess.id;
    var quem=pega&&c.instrutorId?getUserById(c.instrutorId):null;
    return '<div class="chave-card '+(c.status||'disponivel')+'">'
      +'<div class="ch-icon">'+(pega?'<i class="ph ph-key"></i>':'<i class="ph ph-key"></i>️')+'</div>'
      +'<div class="ch-info"><div class="ch-nome">'+esc(sala?sala.nome:'—')+' — '+esc(c.codigo||'Chave')+'</div>'
      +'<div class="ch-det">Andar: '+esc(c.andar||'—')+' · '+(pega?'Retirada':'Disponível')+'</div>'
      +(quem?'<div class="ch-det">Retirada por: '+esc(quem.nome)+(c.pegaEm?' em '+fmtDateTime(c.pegaEm):'')+'</div>':'')
      +'</div>'
      +(!pega?'<button class="btn btn-warning btn-sm" onclick="pegarChave('+c.id+')">Retirar</button>':
         minha?'<button class="btn btn-success btn-sm" onclick="devolverChave('+c.id+')">Devolver</button>':'')
      +'</div>';
  }).join('');
}
function pegarChave(id) {
  updChave(id,{status:'pega',instrutorId:_sess.id,pegaEm:new Date().toISOString()});
  var c=getChaveById(id); var sala=getSalaById(c?c.salaId:null);
  addNotif({para:'recepcao',paraId:_uid(),tipo:'chave',titulo:'Chave retirada',msg:_sess.nome+' retirou a chave de "'+(sala?sala.nome:'sala')+'"'+(c?' ('+c.codigo+')':'')+'.'});
  toast('Chave retirada. Recepção notificada.','ok'); rdChaves();
}
function devolverChave(id) {
  updChave(id,{status:'disponivel',instrutorId:null,pegaEm:null});
  var c=getChaveById(id); var sala=getSalaById(c?c.salaId:null);
  addNotif({para:'recepcao',paraId:_uid(),tipo:'chave',titulo:'Chave devolvida',msg:_sess.nome+' devolveu a chave de "'+(sala?sala.nome:'sala')+'".'});
  toast('Chave devolvida!','ok'); rdChaves();
}

function rdNotifs() {
  var list=getNotifsPara('instrutor',_uid()).filter(function(n){return !n.paraId||n.paraId===_sess.id||n.paraId===_uid();});
  var cont=document.getElementById('listaNotifs');
  if(!list.length){cont.innerHTML='<p class="txt2">Sem notificações.</p>';return;}
  cont.innerHTML=list.map(function(n){
    return '<div class="notif-item tipo-'+(n.tipo||'info')+(n.lida?'':' nao-lida')+'">'
      +'<div class="ni-title">'+esc(n.titulo||'Notificação')+'</div>'
      +'<div class="ni-msg">'+esc(n.msg)+'</div>'
      +'<div class="ni-time">'+fmtDateTime(n.criadaEm)+'</div>'+'</div>';
  }).join('');
  marcarTodasLidas('instrutor',_uid()); _atualizarBadge();
>>>>>>> 02f7ebd2e56a757cb8c77350bffac62559285cc4
}

function _atualizarBadge(){var n=countNaoLidas('instrutor',_uid());var b=document.getElementById('badgeNotif');if(b){b.textContent=n;b.style.display=n?'':'none';}}
function labelStatus(st){return{ativa:'Ativa',iminente:'Iminente',posterior:'Posterior',encerrada:'Encerrada'}[st]||st;}

/* ── PESQUISA TURMAS INSTRUTOR ── */
var _cfgTurmasInst = {
  busca:{id:'buscarTurmaInst', placeholder:'Pesquisar por código ou curso…'},
  filtros:[
    {id:'filtStatusTI', label:'Status', campo:'_status', opcoes:[{value:'ativa',label:'Ativa'},{value:'iminente',label:'Iminente'},{value:'posterior',label:'Posterior'},{value:'encerrada',label:'Encerrada'}]},
  ]
};

var _rdTurmasInstOrig = rdTurmas;
rdTurmas = function() {
  var cont = document.getElementById('searchTurmasInst');
  if (cont && !cont.innerHTML) montarBarraPesquisaFiltros('searchTurmasInst', _cfgTurmasInst, _renderTurmasInst);
  _renderTurmasInst();
};

function _renderTurmasInst() {
  var vals = lerFiltros(_cfgTurmasInst);
  var list = getTurmas().filter(function(t){return t.instrutorId===_sess.id;})
    .map(function(t){return Object.assign({},t,{_status:calcStatus(t)});});
  list = filtrarLista(list, vals._busca, ['nome','curso']);
  if (vals['_status']) list = list.filter(function(t){return t._status===vals['_status'];});
  var cnt = document.getElementById('countTurmasInst'); if (cnt) cnt.textContent = list.length+' turma(s)';
  var tb = document.getElementById('tbTurmas');
  if (!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="6">Nenhuma turma encontrada.</td></tr>';return;}
  tb.innerHTML = list.map(function(t){
    var res=getReservas().filter(function(r){return r.turmaId===t.id;}); var sala=res.length?getSalaById(res[0].salaId):null;
    return '<tr><td class="mono"><strong>'+esc(t.nome)+'</strong></td><td>'+esc(t.curso)+'</td>'
      +'<td><span class="bdg bdg-primary">'+esc(t.turno)+'</span></td>'
      +'<td>'+esc(sala?sala.nome:'Sem sala reservada')+'</td>'
      +'<td>'+htmlStatus(t)+'</td>'
      +'<td style="font-size:.82rem">'+fmtData(t.dataInicio)+' → '+fmtData(t.dataFim)+'</td></tr>';
  }).join('');
}
