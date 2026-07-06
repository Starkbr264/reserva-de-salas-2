import { Sala } from '@/types';
import { SalaInfo, Periodo } from '@/components/SalaCard';
import * as db from '@/services/storage';

// Calcula o status de ocupacao de uma sala hoje (espelha _calcSalaStatus do web)
export function calcSalaInfo(sala: Sala, hoje: string): SalaInfo {
  const rs = db.getReservas().filter(
    r => r.salaId === sala.id && r.dataInicio <= hoje && r.dataFim >= hoje
  );
  const dia = db.diaDaSemana(hoje);
  const periodos: Periodo[] = [];

  rs.forEach(r => {
    if (!r.diasSemana.includes(dia)) return;
    let pStat: 'ocupada' | 'iminente';
    let pTurma: string;
    let pInst: string | null;

    if (r.avulsa || !r.turmaId) {
      pStat = 'ocupada';
      pTurma = 'Sem turma';
      const iA = r.instrutorId ? db.getUserById(r.instrutorId) : null;
      pInst = iA?.nome ?? null;
    } else {
      const turma = db.getTurmaById(r.turmaId);
      const cst = db.calcStatus(turma);
      if (cst === 'encerrada') return;
      pStat = cst === 'ativa' ? 'ocupada' : 'iminente';
      pTurma = turma?.nome ?? '-';
      const inst = r.instrutorId
        ? db.getUserById(r.instrutorId)
        : (turma?.instrutorId ? db.getUserById(turma.instrutorId) : null);
      pInst = inst?.nome ?? null;
    }

    const hora = r.horaInicio && r.horaFim ? `${r.horaInicio} - ${r.horaFim}` : undefined;
    // Deduplica: nao adiciona periodo repetido
    const existe = periodos.some(p => p.turno === r.turno && p.turmaNome === pTurma && p.instNome === pInst);
    if (!existe) periodos.push({ turno: r.turno, turmaNome: pTurma, instNome: pInst, stat: pStat, hora });
  });

  const stat = periodos.some(p => p.stat === 'ocupada')
    ? 'ocupada'
    : periodos.length > 0 ? 'iminente' : 'livre';

  return { stat, periodos };
}
