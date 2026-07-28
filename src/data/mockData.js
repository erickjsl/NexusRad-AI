// ==========================================================================
// NexusRad AI - Comprehensive Brazilian Ultrasound Template Library
// ==========================================================================

export const MOCK_WORKLIST = [
  {
    id: "EX-90416",
    patientName: "ANTÔNIO RODRIGUES GOMES",
    patientId: "CPF: 088.441.229-30",
    age: "71a",
    gender: "M",
    modality: "US",
    studyDescription: "ULTRASSOM DE ABDÔMEN TOTAL",
    date: "2026-07-28 10:15",
    modalitiesInStudy: ["US"],
    seriesCount: 1,
    instanceCount: 28,
    status: "pronto",
    urgency: "normal",
    physician: "Dr. Marcelo Ramos (Gastroenterologia)",
    institution: "CENTRO DIAGNÓSTICO ULTRASONOGRAFIA BRASIL",
    accessionNumber: "ACC-2026-90416",
    kvp: "Freq: 3.5 MHz Convexo",
    ma: "Ganho: 68dB",
    sliceThickness: "N/A",
    aiFinding: {
      type: "Esteatose Hepática Moderada (Grau II)",
      confidence: "96.2%",
      box: { x: 20, y: 25, width: 50, height: 40 },
      description: "Aumento difuso da ecogenicidade do parênquima hepático com atenuação acústica posterior."
    }
  },
  {
    id: "EX-90417",
    patientName: "CAMILA FREITAS MENDONÇA",
    patientId: "CPF: 312.908.445-12",
    age: "31a",
    gender: "F",
    modality: "US",
    studyDescription: "ULTRASSOM OBSTÉTRICO COM DOPPLER COLORIDO",
    date: "2026-07-28 09:50",
    modalitiesInStudy: ["US"],
    seriesCount: 1,
    instanceCount: 36,
    status: "pronto",
    urgency: "normal",
    physician: "Dra. Renata Vasconcelos (Obstetrícia)",
    institution: "MATERNIDADE SÃO LUIZ",
    accessionNumber: "ACC-2026-90417",
    kvp: "Freq: 4.0 MHz Volumétrico",
    ma: "Ganho: 72dB",
    sliceThickness: "N/A",
    aiFinding: {
      type: "Feto Único Vivo em Apresentação Cefálica",
      confidence: "99.4%",
      box: { x: 15, y: 20, width: 65, height: 55 },
      description: "Biometria fetal compatível com 28 semanas e 4 dias (Hadlock). Frequência cardíaca 148 bpm."
    }
  },
  {
    id: "EX-90418",
    patientName: "LUCAS SILVEIRA SANTOS",
    patientId: "CPF: 441.002.991-88",
    age: "54a",
    gender: "M",
    modality: "CT",
    studyDescription: "TC DE TÓRAX COM CONTRASTE EV",
    date: "2026-07-28 09:15",
    modalitiesInStudy: ["CT"],
    seriesCount: 3,
    instanceCount: 240,
    status: "pronto",
    urgency: "alta",
    physician: "Dr. Roberto Mendonça (Pneumologia)",
    institution: "HOSPITAL CENTRAL DIAGNÓSTICOS",
    accessionNumber: "ACC-2026-90418",
    kvp: "120 kV",
    ma: "240 mA",
    sliceThickness: "1.0 mm",
    aiFinding: {
      type: "Nódulo Pulmonar Sólido Espiculado RLD (14mm)",
      confidence: "94.8%",
      box: { x: 45, y: 35, width: 20, height: 20 },
      description: "Nódulo pulmonar periférico no segmento apical do lobo superior direito."
    }
  }
];

export const MOCK_TEMPLATES = {
  // GINECOLOGIA E OBSTETRÍCIA
  "US_OBSTETRICO_HADLOCK": {
    name: "Ultrassom Obstétrico 2º/3º Trimestre (Hadlock)",
    modality: "US",
    category: "Ginecologia e Obstetrícia",
    findings: `TÉCNICA:
Exame realizado por via transabdominal com transdutor convexo multifrequencial de 3.5 a 5.0 MHz.

ACHADOS BIOMÉTRICOS FETAIS:
- Situação longitudinal, apresentação cefálica, dorso à esquerda.
- Batimentos Cardíacos Fetais (BCF): Presentes e ritmados, FHR: 146 bpm.
- Diâmetro Biparietal (DBP): 72,0 mm (28w 4d)
- Circunferência Cefálica (CC): 265,0 mm (28w 5d)
- Circunferência Abdominal (CA): 242,0 mm (28w 3d)
- Comprimento do Fêmur (CF): 54,0 mm (28w 4d)
- Peso Fetal Estimado (Hadlock): 1.250 g (Percentil 50).

AVALIAÇÃO ANEXIAL E ANEXOS FETAIS:
- Líquido Amniótico: Índice de Líquido Amniótico (ILA) = 14,2 cm (Normal).
- Placenta: Corporal posterior, grau I de Grannum, sem sinais de descolamento.`,
    impression: "Gestação tópica, única, ativa de 28 semanas e 4 dias por biometria fetal. Crescimento fetal satisfatório."
  },
  "US_OBSTETRICO_DOPPLER": {
    name: "Ultrassom Obstétrico com Doppler Colorido Materno-Fetal",
    modality: "US",
    category: "Ginecologia e Obstetrícia",
    findings: `TÉCNICA:
Estudo bidimensional e Doppler pulsado/colorido das artérias uterinas e circulação feto-placentária.

ACHADOS DOPPLERFLUXOMÉTRICOS:
- ARTÉRIA UTERINA DIREITA: Relação A/B = 1,85 | Índ. Pulsatilidade (IP) = 0,72. Ausência de incisura protodiastólica.
- ARTÉRIA UTERINA ESQUERDA: Relação A/B = 1,90 | Índ. Pulsatilidade (IP) = 0,75. Ausência de incisura protodiastólica.
- ARTÉRIA UMBILICAL: Fluxo anterógrado contínuo na diástole. IP = 0,88 | IR = 0,58.
- ARTÉRIA CEREBRAL MÉDIA (ACM): Onda de alta resistência preservada. IP = 1,65 | VPS = 42 cm/s.
- RAZÃO CÉREBRO-PLACENTÁRIA (RCP): 1,87 (Normal > 1,08).`,
    impression: "Dopplerfluxometria uteroplacentária e feto-placentária dentro dos padrões de normalidade. Ausência de sinais de centralização hemodinâmica."
  },
  "US_PELVICO_ENDOVAGINAL": {
    name: "Ultrassom Pélvico Transvaginal Ginecológico",
    modality: "US",
    category: "Ginecologia e Obstetrícia",
    findings: `TÉCNICA:
Exame realizado por via endocavitária transvaginal com transdutor de 6.0 a 9.0 MHz.

ACHADOS:
- ÚTERO: Em anteversoflexão (AVF), contornos regulares e miométrio homogêneo. Medidas: 7,8 x 4,4 x 3,9 cm (Volume: 70,2 cm³).
- ENDOMÉTRIO: Centrado, homogêneo, secretor/trilaminar, medindo 7,5 mm de espessura.
- OVÁRIO DIREITO: Medindo 3,2 x 2,1 x 1,9 cm (Volume: 6,7 cm³), com estroma ecogênico preservado e folículos anovulatórios.
- OVÁRIO ESQUERDO: Medindo 3,0 x 1,9 x 1,8 cm (Volume: 5,4 cm³), de aspecto ecográfico normal.
- FONDO DE SACO DE DOUGLAS: Livre de coleções líquidas.`,
    impression: "Ultrassonografia pélvica transvaginal sem alterações morfológicas significativas."
  },

  // ABDÔMEN E PELVE
  "US_ABDOMEN_TOTAL": {
    name: "Ultrassom de Abdômen Total (Padrão Completo)",
    modality: "US",
    category: "Abdômen e Pelve",
    findings: `TÉCNICA:
Exame realizado com transdutor convexo multifrequencial de 3.5 a 5.0 MHz.

ACHADOS:
- FÍGADO: Dimensões normais, contornos regulares e bordos afilados. Parênquima hepático com ecogenacidade e distribuição vascular normais. Ausência de lesões expansivas focais.
- VESÍCULA BILIAR: Normotrófica, de paredes finas e lisas, com conteúdo anecoico, sem evidência de cálculos ou lama biliar.
- VIAS BILIARES: Vias biliares intra e extra-hepáticas de calibre preservado (Coledoco: 3,5 mm).
- PANCREAS: Dimensões normais, contornos regulares e ecogenacidade homogênea. Canal de Wirsung não dilatado.
- BAÇO: Dimensões preservadas, contornos regulares e ecotextura homogênea (Índice Esplênico: 9,2 cm).
- RINS: Situados em topografia habitual, de contornos regulares e dimensões preservadas. Espessura e ecogenacidade parenquimatosa mantidas, com boa diferenciação cortico-medular. Ausência de cálculos ou hidronefrose.
- BEXIGA: Repleta, de paredes finas e conteúdo anecoico, sem formações vegetantes.
- AORTA E VCA: Aorta abdominal e veia cava inferior de trajeto e calibre normais.`,
    impression: "Exame ultrassonográfico do abdômen total dentro dos limites da normalidade."
  },
  "US_RINS_VIAS_URINARIAS": {
    name: "Ultrassom de Rins e Vias Urinárias",
    modality: "US",
    category: "Abdômen e Pelve",
    findings: `TÉCNICA:
Exame realizado por via abdominal suprapúbica e lombar bilateral.

ACHADOS:
- RIM DIREITO: Tópico, contornos regulares. Medindo 10,8 x 4,8 cm. Espessura parenquimatosa de 16 mm. Ausência de cálculos ou dilatação do sistema pielocalicial.
- RIM ESQUERDO: Tópico, contornos regulares. Medindo 11,2 x 5,0 cm. Espessura parenquimatosa de 17 mm. Ausência de cálculos ou dilatação do sistema pielocalicial.
- BEXIGA: Adequadamente repleta, paredes finas (2,8 mm), conteúdo anecoico limpo.
- JUNTAS URETEROVESICAIS: Jatos ureterais bilaterais identificados ao Doppler colorido.`,
    impression: "Ultrassonografia dos rins e vias urinárias sem evidência de nefrolitíase ou uronefrose."
  },

  // MAMAS E PEQUENAS PARTES
  "US_MAMAS_BIRADS": {
    name: "Ultrassom de Mamas Bilateral (BI-RADS US)",
    modality: "US",
    category: "Mamas",
    findings: `TÉCNICA:
Exame realizado com transdutor linear de alta frequência (10 a 14 MHz).

ACHADOS:
- Mamas de composição fibroglandular e adiposa distribuídas simetricamente.
- MAMA DIREITA: Ausência de nódulos sólidos ou císticos, distorções de arquitetura ou ectasia ductal.
- MAMA ESQUERDA: Ausência de nódulos sólidos ou císticos suspeitos.
- REGIÕES AXILARES: Linfonodos axilares bilaterais mantendo forma ovalada, cortical fina e hilocentro lipomatoso central.`,
    impression: "Ultrassonografia mamária bilateral sem lesões suspeitas. Categoria ACR BI-RADS US 1 (Exame Negativo)."
  },
  "US_TIREOIDE_TIRADS": {
    name: "Ultrassom de Tireoide com Classificação TI-RADS",
    modality: "US",
    category: "Pequenas Partes",
    findings: `TÉCNICA:
Exame realizado com transdutor linear de alta frequência (10 a 14 MHz) e Doppler colorido.

ACHADOS:
- TIREOIDE: Situada em topografia habitual, contornos regulares e limites precisos.
- LOBO DIREITO: Medindo 4,2 x 1,6 x 1,5 cm (Volume: 5,2 cm³). Ecotextura homogênea, sem nódulos.
- LOBO ESQUERDO: Medindo 4,1 x 1,5 x 1,4 cm (Volume: 4,5 cm³). Ecotextura homogênea, sem nódulos.
- ÍSTIMO: Espessura de 2,5 mm, com ecogenacidade preservada. Volume total: 9,7 cm³.
- CADEIAS CERVICAIS: Sem linfonodomegalias suspeitas.`,
    impression: "Tireoide de dimensões e ecotextura preservadas. Classificação ACR TI-RADS 1 (Exame Benigno)."
  },
  "US_BOLSA_ESCROTAL_DOPPLER": {
    name: "Ultrassom de Bolsa Escrotal e Testículos com Doppler",
    modality: "US",
    category: "Pequenas Partes",
    findings: `TÉCNICA:
Exame com transdutor linear de alta frequência e manobra de Valsalva ao Doppler.

ACHADOS:
- TESTÍCULO DIREITO: Tópico, ecotextura homogênea. Medidas: 4,1 x 2,4 x 2,2 cm (Volume: 11,3 cm³).
- TESTÍCULO ESQUERDO: Tópico, ecotextura homogênea. Medidas: 4,0 x 2,3 x 2,1 cm (Volume: 10,1 cm³).
- EPIDÍDIMOS: Cabeça, corpo e cauda de dimensões normais.
- DOPPLER COLORIDO: Perfusão parenquimatosa testicular simétrica e preservada. Ausência de ectasia do plexo pampiniforme (Varicocele).`,
    impression: "Ultrassonografia com Doppler da bolsa escrotal dentro dos padrões de normalidade."
  },

  // VASCULAR E DOPPLER
  "US_DOPPLER_CAROTIDAS": {
    name: "Ultrassom Doppler Colorido de Carótidas e Vertebrais",
    modality: "US",
    category: "Vascular e Doppler",
    findings: `TÉCNICA:
Mapeamento duplex color das artérias carótidas e vertebrais bilaterais.

ACHADOS:
- CARÓTIDAS COMUNS: Calibre e espessura médio-intimal preservados (EMD < 0,8 mm). Fluxo anterógrado com padrão fisiológico.
- CARÓTIDAS INTERNAS E EXTERNAS: Patentes, sem placas de ateroma hemodinamicamente significativas.
  - Carótida Interna Direita: VPS = 68 cm/s | VDF = 22 cm/s.
  - Carótida Interna Esquerda: VPS = 72 cm/s | VDF = 24 cm/s.
- ARTÉRIAS VERTEBRAIS: Calibre preservado, fluxo craniopeto anterógrado.`,
    impression: "Estudo Doppler das artérias carótidas e vertebrais sem placas ateroscleróticas ou estenoses."
  },
  "US_DOPPLER_VENOSO_MMII": {
    name: "Ultrassom Doppler Venoso de Membros Inferiores (TVP)",
    modality: "US",
    category: "Vascular e Doppler",
    findings: `TÉCNICA:
Mapeamento venoso com manobras de compressibilidade axial e Doppler pulsado.

ACHADOS:
- SISTEMA VENOSO PROFUNDO (Femoral Comum, Femoral, Poplítea e Veias Tibiais): Pérvias, totalmente compressíveis à manobra do transdutor, com fluxo espontâneo e fásico com a respiração. Ausência de trombos intramurais.
- SISTEMA VENOSO SUPERFICIAL: Veias Safenas Magnas e Parvas pérvias, valvuladas e sem refluxo ao teste de compressão distal.`,
    impression: "Ausência de sinais ecográficos de Trombose Venosa Profunda (TVP) ou refluxo valvar superficial."
  },

  // MÚSCULO-ESQUELÉTICO (MSK)
  "US_MSK_OMBRO": {
    name: "Ultrassom Articular de Ombro (Manguito Rotador)",
    modality: "US",
    category: "Músculo-Esquelético",
    findings: `TÉCNICA:
Exame dinâmico do ombro com transdutor linear de 10 a 14 MHz.

ACHADOS:
- TENDÃO DA CABEÇA LONGA DO BÍCEPS: Centrado na goteira bicipital, com espessura e ecotextura preservadas. Ausência de líquido na bainha.
- TENDÃO DO SUBESCAPULAR: Fibras contínuas e ecogênicas.
- TENDÃO DO SUPRAESPINHAL: Espessura normal, fibras contínuas, sem sinais de roturas parciais ou transfixantes.
- TENDÃO DO INFRAESPINHAL: Preservado.
- BURSA SUBACROMIODELTÓIDEA: Sem espessamento ou derrame bursal.
- ARTICULAÇÃO ACROMIOCLAVICULAR: Sem erosões ou osteófitos marcantes.`,
    impression: "Ultrassonografia do ombro sem evidências de tendinopatias ou roturas no manguito rotador."
  },
  "US_MSK_JOELHO": {
    name: "Ultrassom Articular de Joelho",
    modality: "US",
    category: "Músculo-Esquelético",
    findings: `TÉCNICA:
Exame dinâmico anterior, lateral, medial e recessos quadricipitais do joelho.

ACHADOS:
- TENDÃO QUADRICIPITAL E PATELAR: Espessura, contornos e fibrilação ecográfica preservados.
- RECESSO SUBQUADRICIPITAL: Sem derrame articular significativo.
- RETINÁCULOS PATELARES: Integridade mantida.
- FOSSA POPLÍTEA: Ausência de Cisto de Baker ou formações císticas expansivas.`,
    impression: "Ultrassonografia articular do joelho dentro dos limites da normalidade."
  },

  // PRÉ-LAUDOS COM PATOLOGIAS FREQUENTES
  "US_ABDOMEN_ESTEATOSE": {
    name: "Ultrassom de Abdômen com Esteatose Hepática Moderada",
    modality: "US",
    category: "Abdômen e Pelve",
    findings: `TÉCNICA:
Exame realizado com transdutor convexo multifrequencial de 3.5 MHz.

ACHADOS:
- FÍGADO: Aumentado de volume, com contornos regulares. Observa-se aumento difuso da ecogenacidade do parênquima hepático, com atenuação acústica posterior moderada e atenuação do sinal ecográfico dos vasos hepáticos profundos. Ausência de lesões expansivas focais.
- VESÍCULA BILIAR: Anacóica, paredes finas, sem cálculos.
- PANCREAS E BAÇO: Ecotextura preservada.
- RINS: Dimensões normais, sem cálculos ou hidronefrose.`,
    impression: "Sinais ecográficos de Esteatose Hepática Moderada (Grau II)."
  },
  "US_COLELITIASE": {
    name: "Ultrassom com Colelitíase (Pedras na Vesícula)",
    modality: "US",
    category: "Abdômen e Pelve",
    findings: `TÉCNICA:
Exame realizado com paciente em decúbito dorsal e decúbito lateral esquerdo.

ACHADOS:
- VESÍCULA BILIAR: Normotrófica, paredes finas, apresentando em seu interior múltiplas imagens ecogênicas com sombra acústica posterior nítida, móveis à mudança de decúbito, a maior medindo cerca de 1,2 cm.
- VIAS BILIARES: Vias biliares intra e extra-hepáticas de calibre preservado.
- FÍGADO E PANCREAS: Aspecto ultrassonográfico mantido.`,
    impression: "Colelitíase (cálculos na vesícula biliar) sem sinais ecográficos de colecistite aguda no momento."
  },
  "US_TRANSVAGINAL_MIOMA": {
    name: "Ultrassom Transvaginal com Mioma Uterino",
    modality: "US",
    category: "Ginecologia e Obstetrícia",
    findings: `TÉCNICA:
Exame realizado por via endocavitária transvaginal.

ACHADOS:
- ÚTERO: Aumentado de volume, de contornos lobulados. Medidas: 9,2 x 5,8 x 5,1 cm (Volume: 142,0 cm³).
- MIOMÉTRIO: Heterogêneo à custa de imagem nodular hipoecóica, bem delimitada, localizada na parede posterior do corpo uterino (intramural), medindo 3,4 x 3,1 cm.
- ENDOMÉTRIO: Centrado, medindo 6,0 mm.
- OVÁRIOS: Tópicos, de morfologia ecográfica normal.`,
    impression: "Nódulo miomatoso uterino intramural (Miomatose Uterina)."
  },
  "US_TRANSVAGINAL_CISTO": {
    name: "Ultrassom Transvaginal com Cisto Ovariano Simples",
    modality: "US",
    category: "Ginecologia e Obstetrícia",
    findings: `TÉCNICA:
Exame por via endocavitária transvaginal com Doppler.

ACHADOS:
- OVÁRIO DIREITO: Apresenta imagem cística anecóica de paredes finas e lisas, com reforço acústico posterior, sem septos ou vegetações internas, medindo 3,8 x 3,2 cm. Ausência de vascularização ao Doppler colorido.
- OVÁRIO ESQUERDO: Dimensões normais (Volume: 5,2 cm³).
- ÚTERO E ENDOMÉTRIO: Preservados.`,
    impression: "Cisto ovariano simples no ovário direito (provável cisto funcional/folicular)."
  },
  "US_TIREOIDE_NODULO": {
    name: "Ultrassom de Tireoide com Nódulo TI-RADS 3",
    modality: "US",
    category: "Pequenas Partes",
    findings: `TÉCNICA:
Estudo da tireoide com Doppler de alta frequência.

ACHADOS:
- LOBO DIREITO: Observa-se imagem nodular isoecóica, ovalada, de contornos bem definidos, sem microcalcificações, medindo 1,4 x 1,1 cm no terço médio. Ao Doppler, apresenta vascularização predominantemente periférica.
- LOBO ESQUERDO E ÍSTIMO: Ecotextura preservada.`,
    impression: "Nódulo tireoidiano no lobo direito. Classificação ACR TI-RADS 3 (Baixo risco de malignidade)."
  },
  "US_PROSTATA_HPB": {
    name: "Ultrassom de Próstata Abdominal (Hiperplasia Prostática - HPB)",
    modality: "US",
    category: "Abdômen e Pelve",
    findings: `TÉCNICA:
Exame realizado por via suprapúbica com bexiga repleta.

ACHADOS:
- PRÓSTATA: Aumentada de volume, de contornos precisos e textura parenquimatosa heterogênea. Medidas: 5,2 x 4,8 x 4,5 cm (Volume estimado: 58,5 cm³ - Peso normal até 30g). Projeção do lobo mediano sobre a base vesical.
- BEXIGA: Paredes espessadas com trabeculações de esforço.
- RESÍDUO PÓS-MICCIONAL: Medido em 65 mL (Moderado).`,
    impression: "Sinais ecográficos de Hiperplasia Prostática Benigna (HPB) com repercussão vesical moderada."
  },
  "US_RINS_NEFROLITIASE": {
    name: "Ultrassom de Rins com Nefrolitíase (Cálculo Renal)",
    modality: "US",
    category: "Abdômen e Pelve",
    findings: `TÉCNICA:
Exame renal bilateral transabdominal.

ACHADOS:
- RIM DIREITO: Dimensões preservadas. Observa-se imagem hiperrecogênica com sombra acústica posterior no grupo calicial médio, medindo 6,5 mm. Ausência de ectasia pielocalicial.
- RIM ESQUERDO: Aspecto ultrassonográfico normal.`,
    impression: "Nefrolitíase à direita (cálculo renal não obstrutivo no grupo calicial médio)."
  }
};
