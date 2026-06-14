/**
 * Client-side UI strings for the diagnose flow (SnapDiagnoseClient +
 * DiagnoseFlowClient). These screens are NOT under /[locale] routing, so we
 * localize by the browser's language (navigator.language) rather than a route
 * param. Separate from src/data/i18n/*.json, which localizes the known-issues
 * PAGES. Falls back to English for any unmapped language.
 *
 * Keep this in sync with the diagnosis OUTPUT language map in
 * src/app/api/vision/route.ts (so the chrome + the AI answer match).
 */

export interface DiagnoseStrings {
  addCar: string;
  browseIssues: string;
  freeLeft: string;
  hintProblem: string;
  hintPart: string;
  camTitle: string;
  camBody: string;
  uploadPhoto: string;
  modeDiagnosis: string;
  modeParts: string;
  tapCapture: string;
  analyzing: string;
  log1: string;
  log2: string;
  log3: string;
  log4: string;
  sheetSub: string;
  whichCar: string;
  year: string;
  make: string;
  model: string;
  trimOptional: string;
  yearFirst: string;
  makeFirst: string;
  modelFirst: string;
  diagnose: (model: string | null) => string;
  retake: string;
  diagnoseAnother: string;
  startOver: string;
}

const en: DiagnoseStrings = {
  addCar: 'Add your car below',
  browseIssues: 'Browse 4,500 known issues',
  freeLeft: '1 free left',
  hintProblem: 'Frame the problem — hold steady',
  hintPart: 'Frame the part you want to match',
  camTitle: 'Camera not available',
  camBody: 'Allow camera access in your browser, or upload a photo you already took.',
  uploadPhoto: 'Upload a photo',
  modeDiagnosis: 'Diagnosis',
  modeParts: 'Parts',
  tapCapture: 'Tap to capture',
  analyzing: 'Analyzing your photo…',
  log1: 'Identifying parts in the photo',
  log2: 'Matching against 4,500 known issues',
  log3: 'Cross-referencing TSBs & recalls',
  log4: 'Pricing the fix',
  sheetSub: "Add your car for a sharper read — or skip, it's optional",
  whichCar: 'Which car is this?',
  year: 'YEAR',
  make: 'MAKE',
  model: 'MODEL',
  trimOptional: 'TRIM · OPTIONAL',
  yearFirst: 'Year first',
  makeFirst: 'Make first',
  modelFirst: 'Model first',
  diagnose: (m) => (m ? `Diagnose my ${m}` : 'Diagnose anyway'),
  retake: 'Retake photo',
  diagnoseAnother: 'Diagnose another photo',
  startOver: 'Start over',
};

const de: DiagnoseStrings = {
  addCar: 'Auto unten hinzufügen',
  browseIssues: '4.500 bekannte Probleme durchsuchen',
  freeLeft: '1 gratis übrig',
  hintProblem: 'Problem ins Bild holen — ruhig halten',
  hintPart: 'Das gesuchte Teil ins Bild holen',
  camTitle: 'Kamera nicht verfügbar',
  camBody: 'Erlaube den Kamerazugriff im Browser oder lade ein vorhandenes Foto hoch.',
  uploadPhoto: 'Foto hochladen',
  modeDiagnosis: 'Diagnose',
  modeParts: 'Teile',
  tapCapture: 'Zum Aufnehmen tippen',
  analyzing: 'Dein Foto wird analysiert…',
  log1: 'Teile im Foto erkennen',
  log2: 'Abgleich mit 4.500 bekannten Problemen',
  log3: 'Abgleich mit TSBs & Rückrufen',
  log4: 'Reparatur kalkulieren',
  sheetSub: 'Auto angeben für ein genaueres Ergebnis — optional',
  whichCar: 'Welches Auto ist das?',
  year: 'JAHR',
  make: 'MARKE',
  model: 'MODELL',
  trimOptional: 'AUSSTATTUNG · OPTIONAL',
  yearFirst: 'Erst Jahr',
  makeFirst: 'Erst Marke',
  modelFirst: 'Erst Modell',
  diagnose: (m) => (m ? `Meinen ${m} diagnostizieren` : 'Trotzdem diagnostizieren'),
  retake: 'Foto neu aufnehmen',
  diagnoseAnother: 'Weiteres Foto diagnostizieren',
  startOver: 'Neu starten',
};

const fr: DiagnoseStrings = {
  addCar: 'Ajoutez votre voiture ci-dessous',
  browseIssues: 'Parcourir 4 500 problèmes connus',
  freeLeft: '1 gratuit restant',
  hintProblem: 'Cadrez le problème — restez stable',
  hintPart: 'Cadrez la pièce à identifier',
  camTitle: 'Caméra indisponible',
  camBody: "Autorisez l'accès à la caméra dans votre navigateur, ou importez une photo déjà prise.",
  uploadPhoto: 'Importer une photo',
  modeDiagnosis: 'Diagnostic',
  modeParts: 'Pièces',
  tapCapture: 'Touchez pour capturer',
  analyzing: 'Analyse de votre photo…',
  log1: 'Identification des pièces sur la photo',
  log2: 'Comparaison avec 4 500 problèmes connus',
  log3: 'Recoupement des TSB et rappels',
  log4: 'Estimation de la réparation',
  sheetSub: 'Ajoutez votre voiture pour plus de précision — facultatif',
  whichCar: 'Quelle voiture est-ce ?',
  year: 'ANNÉE',
  make: 'MARQUE',
  model: 'MODÈLE',
  trimOptional: 'FINITION · FACULTATIF',
  yearFirst: "L'année d'abord",
  makeFirst: "La marque d'abord",
  modelFirst: "Le modèle d'abord",
  diagnose: (m) => (m ? `Diagnostiquer ma ${m}` : 'Diagnostiquer quand même'),
  retake: 'Reprendre la photo',
  diagnoseAnother: 'Diagnostiquer une autre photo',
  startOver: 'Recommencer',
};

const es: DiagnoseStrings = {
  addCar: 'Agrega tu coche abajo',
  browseIssues: 'Explorar 4.500 problemas conocidos',
  freeLeft: '1 gratis restante',
  hintProblem: 'Encuadra el problema — mantén firme',
  hintPart: 'Encuadra la pieza que quieres identificar',
  camTitle: 'Cámara no disponible',
  camBody: 'Permite el acceso a la cámara en tu navegador, o sube una foto que ya tengas.',
  uploadPhoto: 'Subir una foto',
  modeDiagnosis: 'Diagnóstico',
  modeParts: 'Piezas',
  tapCapture: 'Toca para capturar',
  analyzing: 'Analizando tu foto…',
  log1: 'Identificando piezas en la foto',
  log2: 'Comparando con 4.500 problemas conocidos',
  log3: 'Cruzando TSB y llamados a revisión',
  log4: 'Calculando la reparación',
  sheetSub: 'Agrega tu coche para mayor precisión — opcional',
  whichCar: '¿Qué coche es este?',
  year: 'AÑO',
  make: 'MARCA',
  model: 'MODELO',
  trimOptional: 'VERSIÓN · OPCIONAL',
  yearFirst: 'Primero el año',
  makeFirst: 'Primero la marca',
  modelFirst: 'Primero el modelo',
  diagnose: (m) => (m ? `Diagnosticar mi ${m}` : 'Diagnosticar de todos modos'),
  retake: 'Volver a tomar la foto',
  diagnoseAnother: 'Diagnosticar otra foto',
  startOver: 'Empezar de nuevo',
};

const pt: DiagnoseStrings = {
  addCar: 'Adicione seu carro abaixo',
  browseIssues: 'Ver 4.500 problemas conhecidos',
  freeLeft: '1 grátis restante',
  hintProblem: 'Enquadre o problema — segure firme',
  hintPart: 'Enquadre a peça que quer identificar',
  camTitle: 'Câmera indisponível',
  camBody: 'Permita o acesso à câmera no navegador, ou envie uma foto que você já tirou.',
  uploadPhoto: 'Enviar uma foto',
  modeDiagnosis: 'Diagnóstico',
  modeParts: 'Peças',
  tapCapture: 'Toque para capturar',
  analyzing: 'Analisando sua foto…',
  log1: 'Identificando peças na foto',
  log2: 'Comparando com 4.500 problemas conhecidos',
  log3: 'Cruzando TSBs e recalls',
  log4: 'Calculando o conserto',
  sheetSub: 'Adicione seu carro para um diagnóstico mais preciso — opcional',
  whichCar: 'Qual carro é este?',
  year: 'ANO',
  make: 'MARCA',
  model: 'MODELO',
  trimOptional: 'VERSÃO · OPCIONAL',
  yearFirst: 'Primeiro o ano',
  makeFirst: 'Primeiro a marca',
  modelFirst: 'Primeiro o modelo',
  diagnose: (m) => (m ? `Diagnosticar meu ${m}` : 'Diagnosticar mesmo assim'),
  retake: 'Tirar a foto novamente',
  diagnoseAnother: 'Diagnosticar outra foto',
  startOver: 'Recomeçar',
};

const DICTS: Record<string, DiagnoseStrings> = { en, de, fr, es, pt };

/** Resolve the diagnose-flow strings for the user's browser language.
 *  Client-only; returns English during SSR or for unmapped languages. */
export function diagnoseStrings(): DiagnoseStrings {
  if (typeof navigator === 'undefined' || !navigator.language) return en;
  const key = navigator.language.toLowerCase().split('-')[0];
  return DICTS[key] || en;
}
