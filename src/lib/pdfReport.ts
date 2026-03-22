import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getPatient, getNotes, getGoals, getABCRecords, getSessions, getAssessment, calculateAge, formatDate, getStatusLabel } from './data';
import { getAllMedia } from './mediaStore';
import {
  getAllTestResults, PORTAGE_AREAS, EOCA_MODALIDADES,
  EOCA_TEMATICA, EOCA_DINAMICA, EOCA_PRODUTO,
  AUTONOMY_ITEMS, MCHAT_QUESTIONS,
} from './testsData';

export async function generatePatientReport(patientId: string, startDate?: string, endDate?: string): Promise<boolean> {
  const patient = getPatient(patientId);
  if (!patient) return false;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(100, 149, 200);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Evolução Psicopedagógica', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Profissional', pageWidth / 2, 28, { align: 'center' });
  doc.text(`Gerado em: ${formatDate(new Date().toISOString().split('T')[0])}`, pageWidth / 2, 35, { align: 'center' });

  y = 50;
  doc.setTextColor(50, 50, 50);

  // Patient Info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Paciente', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const info = [
    `Nome: ${patient.name}`,
    `Idade: ${calculateAge(patient.birthDate)} anos`,
    `Data de Nascimento: ${formatDate(patient.birthDate)}`,
    `CID: ${patient.cid}`,
    `Responsáveis: ${patient.parentNames || 'Não informado'}`,
    `Telefone: ${patient.phone || 'Não informado'}`,
  ];
  info.forEach(line => {
    doc.text(line, 14, y);
    y += 6;
  });

  if (startDate || endDate) {
    y += 2;
    doc.setFont('helvetica', 'italic');
    const periodText = `Período: ${startDate ? formatDate(startDate) : 'início'} a ${endDate ? formatDate(endDate) : 'atual'}`;
    doc.text(periodText, 14, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
  }

  // Assessment Data
  const assessment = getAssessment(patientId);
  const iarLabels: Record<string, string> = {
    esquemaCorporal: 'Esquema Corporal',
    lateralidade: 'Lateralidade',
    orientacaoEspacialTemporal: 'Orientação Espacial/Temporal',
    discriminacaoVisualAuditiva: 'Discriminação Visual/Auditiva',
    coordenacaoVisomotora: 'Coordenação Visomotora',
    memoria: 'Memória',
  };
  const iarStatusLabels: Record<string, string> = {
    desenvolvido: 'Desenvolvido',
    em_desenvolvimento: 'Em Desenvolvimento',
    dificuldade: 'Dificuldade',
  };
  const hasIAR = Object.values(assessment.iar).some(v => v !== '');
  const hasInstruments = Object.values(assessment.instruments).some(v => v.applied);
  const hasProbes = assessment.probes.writingLevel || assessment.probes.mathNotes || assessment.probes.psychomotorNotes;
  const hasDiagnosis = assessment.diagnosticHypothesis.trim();

  if (hasIAR || hasInstruments || hasProbes || hasDiagnosis) {
    y += 4;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resultados da Avaliação e Sondagens', 14, y);
    y += 4;

    if (hasIAR) {
      const iarRows = Object.entries(assessment.iar)
        .filter(([, v]) => v !== '')
        .map(([k, v]) => [iarLabels[k] || k, iarStatusLabels[v] || v]);
      if (iarRows.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [['Área (IAR)', 'Status']],
          body: iarRows,
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [100, 149, 200], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          margin: { left: 14, right: 14 },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }
    }

    if (hasInstruments) {
      const instrumentLabels: Record<string, string> = {
        eoca: 'EOCA', provasOperatorias: 'Provas Operatórias', tecnicasProjetivas: 'Técnicas Projetivas',
        anamnese: 'Anamnese', cars2: 'CARS-2', mchatR: 'M-CHAT-R', proteaR: 'PROTEA-R',
      };
      const instRows = Object.entries(assessment.instruments)
        .filter(([, v]) => v.applied)
        .map(([k, v]) => [instrumentLabels[k] || k, v.result || '—']);
      if (instRows.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }
        autoTable(doc, {
          startY: y,
          head: [['Instrumento / Teste', 'Resultado']],
          body: instRows,
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [100, 149, 200], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          margin: { left: 14, right: 14 },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }
    }

    if (hasProbes) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Sondagens Pedagógicas', 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const writingLabels: Record<string, string> = {
        pre_silabico: 'Pré-silábico', silabico: 'Silábico',
        silabico_alfabetico: 'Silábico-Alfabético', alfabetico: 'Alfabético',
      };
      if (assessment.probes.writingLevel) {
        doc.text(`Escrita: ${writingLabels[assessment.probes.writingLevel] || assessment.probes.writingLevel}`, 14, y);
        y += 6;
      }
      if (assessment.probes.mathNotes) {
        doc.text('Matemática:', 14, y); y += 5;
        const ml = doc.splitTextToSize(assessment.probes.mathNotes, pageWidth - 28);
        doc.text(ml, 14, y); y += ml.length * 5 + 4;
      }
      if (assessment.probes.psychomotorNotes) {
        doc.text('Psicomotora:', 14, y); y += 5;
        const pl = doc.splitTextToSize(assessment.probes.psychomotorNotes, pageWidth - 28);
        doc.text(pl, 14, y); y += pl.length * 5 + 4;
      }
    }

    if (hasDiagnosis) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Hipótese Diagnóstica', 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const dl = doc.splitTextToSize(assessment.diagnosticHypothesis, pageWidth - 28);
      doc.text(dl, 14, y); y += dl.length * 5 + 6;
    }
  }

  // ===== TEST RESULTS =====
  const testResults = getAllTestResults(patientId);

  // Portage
  const portageAnswered = Object.keys(testResults.portage.data.answers).filter(k => testResults.portage.data.answers[k] !== undefined).length;
  if (portageAnswered > 0) {
    if (y > 200) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Escala Portage — Perfil de Desenvolvimento', 14, y);
    y += 4;
    const portageRows = PORTAGE_AREAS.map(a => [
      a.label,
      `${testResults.portage.results[a.key]?.devAge || 0} meses`,
      `${testResults.portage.results[a.key]?.percentage || 0}%`,
    ]);
    autoTable(doc, {
      startY: y,
      head: [['Área', 'Idade de Desenvolvimento', 'Desempenho']],
      body: portageRows,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [100, 149, 200], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // M-CHAT
  if (testResults.mchat.results.answered > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('M-CHAT-R — Rastreio para TEA', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const mr = testResults.mchat.results;
    doc.text(`Perguntas respondidas: ${mr.answered}/23`, 14, y); y += 5;
    doc.text(`Falhas totais: ${mr.totalFails} | Falhas em itens críticos: ${mr.criticalFails}`, 14, y); y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Resultado: ${mr.risk ? '⚠ RISCO PARA TEA — encaminhamento recomendado' : '✔ Sem risco identificado'}`, 14, y);
    y += 10;
  }

  // CARS
  if (testResults.cars.results.answered > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CARS — Escala de Avaliação de Autismo', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const cr = testResults.cars.results;
    doc.text(`Itens avaliados: ${cr.answered}/15 | Pontuação total: ${cr.total}`, 14, y); y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Classificação: ${cr.classification}`, 14, y);
    y += 10;
  }

  // EOCA
  const eocaData = testResults.eoca.data;
  const hasEOCA = Object.values(eocaData.tematica).some(v => v) || Object.values(eocaData.dinamica).some(v => v) || Object.values(eocaData.produto).some(v => v) || eocaData.modalidade;
  if (hasEOCA) {
    if (y > 200) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('EOCA — Entrevista Operativa Centrada na Aprendizagem', 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const eocaSections = [
      { label: 'Temática', items: EOCA_TEMATICA, data: eocaData.tematica },
      { label: 'Dinâmica', items: EOCA_DINAMICA, data: eocaData.dinamica },
      { label: 'Produto', items: EOCA_PRODUTO, data: eocaData.produto },
    ];
    for (const sec of eocaSections) {
      const checked = sec.items.filter(i => sec.data[i.id]);
      if (checked.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${sec.label}:`, 14, y); y += 4;
        doc.setFont('helvetica', 'normal');
        checked.forEach(i => { doc.text(`• ${i.text}`, 18, y); y += 4; });
        y += 2;
      }
    }

    if (eocaData.modalidade) {
      const mod = EOCA_MODALIDADES.find(m => m.value === eocaData.modalidade);
      doc.setFont('helvetica', 'bold');
      doc.text(`Modalidade de Aprendizagem: ${mod?.label || eocaData.modalidade}`, 14, y);
      y += 5;
      if (mod) {
        doc.setFont('helvetica', 'normal');
        doc.text(mod.desc, 18, y); y += 5;
      }
      y += 3;
    }

    if (eocaData.conclusao?.trim()) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.text('Conclusão da EOCA:', 14, y); y += 5;
      doc.setFont('helvetica', 'normal');
      const cl = doc.splitTextToSize(eocaData.conclusao, pageWidth - 28);
      doc.text(cl, 14, y); y += cl.length * 5 + 3;
    }

    if (eocaData.observacoes?.trim()) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.text('Observações e Encaminhamentos:', 14, y); y += 5;
      doc.setFont('helvetica', 'normal');
      const ol = doc.splitTextToSize(eocaData.observacoes, pageWidth - 28);
      doc.text(ol, 14, y); y += ol.length * 5 + 3;
    }
    y += 5;
  }

  // Autonomy
  const autonomyScored = Object.keys(testResults.autonomy.data.scores).length;
  if (autonomyScored > 0) {
    if (y > 200) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Avaliação de Autonomia (Humanizzare)', 14, y);
    y += 4;
    const autRows = Object.entries(testResults.autonomy.results).map(([cat, r]) => [cat, `${r.score}/${r.max}`, `${r.percentage}%`]);
    autoTable(doc, {
      startY: y,
      head: [['Categoria', 'Pontuação', 'Percentual']],
      body: autRows,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [100, 149, 200], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Sessions
  y += 4;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Histórico de Sessões', 14, y);
  y += 4;

  let sessions = getSessions()
    .filter(s => s.patientId === patientId)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (startDate) sessions = sessions.filter(s => s.date >= startDate);
  if (endDate) sessions = sessions.filter(s => s.date <= endDate);

  if (sessions.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Data', 'Horário', 'Status', 'Observações']],
      body: sessions.map(s => [
        formatDate(s.date),
        s.time,
        s.completed ? 'Concluída' : 'Agendada',
        s.notes || '—',
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [100, 149, 200], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  } else {
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Nenhuma sessão registrada no período.', 14, y);
    y += 10;
  }

  // PTI Goals
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Plano Terapêutico Individual (PTI)', 14, y);
  y += 4;

  const goals = getGoals(patientId);
  if (goals.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Área', 'Meta', 'Status', 'Progresso']],
      body: goals.map(g => [g.area, g.description, getStatusLabel(g.status), `${g.progress}%`]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [100, 149, 200], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  } else {
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Nenhuma meta cadastrada.', 14, y);
    y += 10;
  }

  // Evolution Notes
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Notas de Evolução', 14, y);
  y += 8;

  let notes = getNotes(patientId).sort((a, b) => b.date.localeCompare(a.date));
  if (startDate) notes = notes.filter(n => n.date >= startDate);
  if (endDate) notes = notes.filter(n => n.date <= endDate);

  if (notes.length > 0) {
    doc.setFontSize(10);
    notes.forEach(note => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.text(formatDate(note.date), 14, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(note.content, pageWidth - 28);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 6;
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Nenhuma nota de evolução no período.', 14, y);
    y += 10;
  }

  // ABC Records
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Registros de Comportamento (ABC)', 14, y);
  y += 4;

  let abcRecords = getABCRecords(patientId).sort((a, b) => b.date.localeCompare(a.date));
  if (startDate) abcRecords = abcRecords.filter(r => r.date >= startDate);
  if (endDate) abcRecords = abcRecords.filter(r => r.date <= endDate);

  if (abcRecords.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Data', 'Antecedente', 'Comportamento', 'Consequência']],
      body: abcRecords.map(r => [formatDate(r.date), r.antecedent, r.behavior, r.consequence]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [100, 149, 200], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  } else {
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Nenhum registro ABC no período.', 14, y);
    y += 10;
  }

  // Attached Media from IndexedDB
  const media = await getAllMedia(patientId);
  if (media.length > 0) {
    if (y > 200) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Fotos Anexadas', 14, y);
    y += 8;

    let x = 14;
    const imgSize = 55;
    media.forEach((item) => {
      if (x + imgSize > pageWidth - 14) {
        x = 14;
        y += imgSize + 10;
      }
      if (y + imgSize > 280) { doc.addPage(); y = 20; x = 14; }
      try {
        doc.addImage(item.dataUrl, 'JPEG', x, y, imgSize, imgSize);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(formatDate(item.date), x, y + imgSize + 4);
      } catch {
        // skip invalid images
      }
      x += imgSize + 8;
    });
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Evolução Psicopedagógica — Relatório confidencial', pageWidth / 2, 290, { align: 'center' });
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, 290, { align: 'right' });
  }

  if (preview) {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } else {
    doc.save(`Relatorio_${patient.name.replace(/\s+/g, '_')}.pdf`);
  }
  return true;
}