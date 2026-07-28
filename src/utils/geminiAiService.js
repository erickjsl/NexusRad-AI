// ==========================================================================
// NexusRad AI - Gemini Multimodal Medical Copilot Service
// ==========================================================================

/**
 * AI Copilot Medical Engine (Gemini Integration)
 */
export async function analyzeStudyWithGemini(study, promptCustom = "") {
  // Simulate AI Multimodal Copilot Processing
  await new Promise(resolve => setTimeout(resolve, 1200));

  const modalityKey = study.modality || 'CT';
  const studyDesc = study.studyDescription || 'Exame de Imagem';
  const patientAge = study.age || '50a';
  const patientGender = study.gender || 'M';

  let findings = "";
  let impression = "";
  let differential = [];
  let recommendations = "";

  switch (modalityKey) {
    case 'CT':
      findings = `- Parênquima pulmonar: Nódulo sólido de contornos espiculados no Lobo Superior Direito (RLD) medindo 14,2 mm de diâmetro (Slice #16).
- Pleura: Discreto espessamento e lâmina líquida no seio pleurofrênico direito posterior (~12mm).
- Mediastino: Linfonodo pré-traqueal proeminente de 11mm no menor eixo (Estação 2R).
- Estruturas Ósseas: Sem lesões destrutivas líticas/blásticas aparentes na caixa torácica.`;
      impression = `1. NÓDULO PULMONAR SÓLIDO ESPICULADO NO RLD (14mm) ASSOCIADO A LINFONODOMEGALIA MEDIASTINAL (2R).
2. DERRAME PLEURAL DIREITO DISCRETO.`;
      differential = [
        "Neoplasia Pulmonar Primária (ex: Adenocarcinoma)",
        "Processo Infeccioso Granulomatoso (ex: Tuberculose / Fúngica)",
        "Infarto Pulmonar focal"
      ];
      recommendations = "Recomenda-se correlação com PET-CT, Tomografia Computadorizada de alta resolução (TCAR) de controle em 3 meses e avaliação pneumológica / biópsia guiada se clinicamente indicado.";
      break;

    case 'DX':
    case 'CR':
      findings = `- Campos pulmonares com expansibilidade preservada e transparência radiológica habitual.
- Ausência de opacidades consolidadas parenquimatosas ou desvios de linha média.
- Seios pleurofrênicos e cardiofrênicos com contornos livres.
- Silhueta cardíaca com índice cardiotorácico mantido (< 0.50).`;
      impression = `EXAME DE RADIOGRAFIA DE TÓRAX DENTRO DOS LIMITES DA NORMALIDADE.`;
      differential = ["Sem evidências de patologia cardio-pulmonar aguda."];
      recommendations = "Acompanhamento clínico de rotina.";
      break;

    case 'MR':
      findings = `- Menisco Medial: Fissura/rutura oblíqua complexa com extensão à superfície articular inferior no corno posterior.
- Menisco Lateral: Preservado em formato e intensidade de sinal.
- Ligamento Cruzado Anterior (LCA): Fibras contínuas e orientadas, sem evidência de descontinuidade completa.
- Cartilagem Patelofemoral: Redução focal da espessura com condromalácia grau II na faceta lateral da patela.`;
      impression = `1. RUTURA COMPLEXA DO CORNO POSTERIOR DO MENISCO MEDIAL (GRAU III).
2. CONDROMALÁCIA PATELOFEMORAL GRAU II.`;
      differential = [
        "Lesão Meniscal Traumática / Degenerativa",
        "Síndrome de Hiperpressão Patelar Lateral"
      ];
      recommendations = "Avaliação ortopédica especializada em joelho e fisioterapia motora.";
      break;

    case 'MG':
      findings = `- Mamas com padrão fibroglandular denso heterogêneo (Padrão C).
- Quadrante Superior Externo (QSE) da mama esquerda com agrupamento de microcalcificações pleomórficas finas em área de 8mm.
- Ausência de distorção arquitetural ou assimetria focal na mama direita.`;
      impression = `AGRUPAMENTO DE MICROCALCIFICAÇÕES PLEOMÓRFICAS EM MAMA ESQUERDA (CATEGORIA BI-RADS 4B).`;
      differential = [
        "Carcinoma Ductal In Situ (CDIS)",
        "Alteração Fibrocística Benigna com Calcificação"
      ];
      recommendations = "Recomenda-se biópsia estereotácica (Core Biopsy / Mamatomia) para diagnóstico histopatológico.";
      break;

    default:
      findings = `- Estruturas anatômicas avaliadas no estudo sem lesões expansivas identificáveis.
- Transparência de tecidos e parênquima mantidos.`;
      impression = `ESTUDO DIAGNÓSTICO SEM ALTERAÇÕES SIGNIFICATIVAS.`;
      differential = ["Estudo Normal"];
      recommendations = "Correlação com sintomatologia clínica.";
  }

  return {
    patientContext: `${study.patientName} (${patientAge}, ${patientGender})`,
    findings,
    impression,
    differential,
    recommendations,
    timestamp: new Date().toLocaleTimeString()
  };
}

/**
 * Ask AI Copilot a clinical question
 */
export async function askGeminiCopilotQuestion(question, study) {
  await new Promise(resolve => setTimeout(resolve, 800));

  const q = question.toLowerCase();
  if (q.includes('conduta') || q.includes('recomend')) {
    return `🤖 **Recomendação Nexus AI:** Para o achado de ${study.studyDescription}, a conduta recomendada pelas diretrizes Fleischner / BI-RADS é realizar acompanhamento por imagem de alta resolução em 3 meses e avaliar dosagem de marcadores clínicos se houver suspeita infecciosa ou neoplásica.`;
  } else if (q.includes('laudo') || q.includes('resumo')) {
    return `🤖 **Laudo Resumido para Telemedicina:** Estudo de ${study.modality} do paciente ${study.patientName} demonstrando achados descritos. Conclusão: ${study.aiFinding ? study.aiFinding.type : 'Sem alterações agudas'}. Assinado digitalmente.`;
  } else {
    return `🤖 **Nexus Medical Copilot:** Analisando a pergunta "${question}" referente ao exame ${study.accessionNumber}. O padrão observado é condizente com a modalidade ${study.modality}. Recomenda-se manter correlação com antecedentes pessoais e histórico cirúrgico do paciente.`;
  }
}
