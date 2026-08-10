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

import { useEffect, useState } from 'react';

export interface DiagnoseStrings {
  // ── Shared / mobile snap flow (SnapDiagnoseClient) ──
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

  // ── Desktop upload flow (DiagnoseFlowClient) ──
  freeNoCard: string;
  freeBadge: string;
  showWrong: string;
  intro: (isMobile: boolean) => string;
  vehicleOptional: string;
  yearLabel: string;
  makeLabel: string;
  modelLabel: string;
  trimLabel: string;
  pickYearFirst: string;
  pickMakeFirst: string;
  pickModelFirst: string;
  takePhotoEyebrow: string;
  problemEyebrow: string;
  tapOpenCamera: string;
  dragPhoto: string;
  pointAtProblem: string;
  orPrefix: string;
  browseFiles: string;
  fileTypes: string;
  loaded: string;
  replace: string;
  uploadExisting: string;
  captionPlaceholder: string;
  anglesCount: (n: number) => string;
  addAngleHint: string;
  proAngles: string;
  chooseImageErr: string;
  analyzingBtn: string;
  diagnoseThis: string;
  needPhoto: (isMobile: boolean) => string;
  vehicleOptionalHint: string;
  tipAddVehicle: (isMobile: boolean) => string;
  analyzingNoVehicle: string;
  flywheelConsent: string;
  handoffPrompt: string;
  saveGarage: string;
  saveOpenChat: string;
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

  freeNoCard: 'Free diagnosis · no card needed',
  freeBadge: 'FREE DIAGNOSIS',
  showWrong: "Show Au7o what's wrong",
  intro: (m) =>
    m
      ? 'Snap a photo of the problem and Au7o takes it from there. Add your car for a sharper read — optional. One free try, no account needed.'
      : 'Drop in a photo of the problem and Au7o takes it from there. Add your car for a sharper read — optional. One free try, no account needed.',
  vehicleOptional: 'YOUR VEHICLE · OPTIONAL',
  yearLabel: 'Year',
  makeLabel: 'Make',
  modelLabel: 'Model',
  trimLabel: 'Trim',
  pickYearFirst: 'Pick a year first',
  pickMakeFirst: 'Pick a make first',
  pickModelFirst: 'Pick a model first',
  takePhotoEyebrow: 'TAKE A PHOTO',
  problemEyebrow: 'THE PROBLEM',
  tapOpenCamera: 'Tap to open your camera',
  dragPhoto: 'Drag a photo here',
  pointAtProblem: 'Point it right at the problem',
  orPrefix: 'or ',
  browseFiles: 'browse your files',
  fileTypes: 'JPG, PNG, or WebP · up to 10 MB',
  loaded: 'Loaded',
  replace: 'Replace',
  uploadExisting: 'Upload an existing photo instead',
  captionPlaceholder: 'Add a note — what does it sound or smell like? (optional)',
  anglesCount: (n) => `${n} angles — more angles help the AI pinpoint the issue.`,
  addAngleHint: 'Add another angle for a sharper read.',
  proAngles: 'Multiple angles is a Pro feature.',
  chooseImageErr: 'Choose a photo (JPEG, PNG, or WebP).',
  analyzingBtn: 'Analyzing…',
  diagnoseThis: 'Diagnose this',
  needPhoto: (m) => (m ? 'Take or upload a photo to diagnose.' : 'Add a photo to diagnose.'),
  vehicleOptionalHint: 'Your vehicle is optional — it makes the result more accurate.',
  tipAddVehicle: (m) =>
    `Tip: add your year, make & model${m ? ' above' : ''} for a more accurate diagnosis (optional).`,
  analyzingNoVehicle:
    'Diagnosing without your vehicle — results are more accurate when you add your year, make & model.',
  flywheelConsent:
    'Help improve Au7o — keep the details of this diagnosis (the part identified; plates & location removed) to make future diagnoses smarter. No photo is kept. Optional.',
  handoffPrompt: 'Want to ask Au7o follow-up questions about this? Save this diagnosis to your garage.',
  saveGarage: 'Save to my garage',
  saveOpenChat: 'Save & open chat',
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

  freeNoCard: 'Kostenlose Diagnose · keine Karte nötig',
  freeBadge: 'KOSTENLOSE DIAGNOSE',
  showWrong: 'Zeig Au7o, was nicht stimmt',
  intro: (m) =>
    m
      ? 'Mach ein Foto vom Problem, den Rest übernimmt Au7o. Auto angeben für ein genaueres Ergebnis — optional. Ein Versuch gratis, kein Konto nötig.'
      : 'Lade ein Foto vom Problem hoch, den Rest übernimmt Au7o. Auto angeben für ein genaueres Ergebnis — optional. Ein Versuch gratis, kein Konto nötig.',
  vehicleOptional: 'DEIN FAHRZEUG · OPTIONAL',
  yearLabel: 'Jahr',
  makeLabel: 'Marke',
  modelLabel: 'Modell',
  trimLabel: 'Ausstattung',
  pickYearFirst: 'Erst Jahr wählen',
  pickMakeFirst: 'Erst Marke wählen',
  pickModelFirst: 'Erst Modell wählen',
  takePhotoEyebrow: 'FOTO AUFNEHMEN',
  problemEyebrow: 'DAS PROBLEM',
  tapOpenCamera: 'Tippen, um die Kamera zu öffnen',
  dragPhoto: 'Foto hierher ziehen',
  pointAtProblem: 'Richte sie direkt auf das Problem',
  orPrefix: 'oder ',
  browseFiles: 'Dateien durchsuchen',
  fileTypes: 'JPG, PNG oder WebP · bis 10 MB',
  loaded: 'Geladen',
  replace: 'Ersetzen',
  uploadExisting: 'Stattdessen vorhandenes Foto hochladen',
  captionPlaceholder: 'Notiz hinzufügen — wie klingt oder riecht es? (optional)',
  anglesCount: (n) => `${n} Perspektiven — mehr Blickwinkel helfen der KI, das Problem zu finden.`,
  addAngleHint: 'Weiteren Blickwinkel für ein genaueres Ergebnis hinzufügen.',
  proAngles: 'Mehrere Blickwinkel sind eine Pro-Funktion.',
  chooseImageErr: 'Wähle ein Foto (JPEG, PNG oder WebP).',
  analyzingBtn: 'Analysiere…',
  diagnoseThis: 'Das diagnostizieren',
  needPhoto: (m) =>
    m ? 'Foto aufnehmen oder hochladen, um zu diagnostizieren.' : 'Foto hinzufügen, um zu diagnostizieren.',
  vehicleOptionalHint: 'Dein Fahrzeug ist optional — es macht das Ergebnis genauer.',
  tipAddVehicle: (m) =>
    `Tipp: Gib Jahr, Marke & Modell${m ? ' oben' : ''} an für eine genauere Diagnose (optional).`,
  analyzingNoVehicle:
    'Diagnose ohne Fahrzeugangabe — mit Jahr, Marke & Modell wird das Ergebnis genauer.',
  flywheelConsent:
    'Hilf Au7o besser zu werden — die Details dieser Diagnose behalten (erkanntes Teil; Kennzeichen & Standort entfernt), um künftige Diagnosen zu verbessern. Es wird kein Foto gespeichert. Optional.',
  handoffPrompt:
    'Möchtest du Au7o dazu Folgefragen stellen? Speichere diese Diagnose in deiner Garage.',
  saveGarage: 'In meiner Garage speichern',
  saveOpenChat: 'Speichern & Chat öffnen',
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

  freeNoCard: 'Diagnostic gratuit · sans carte',
  freeBadge: 'DIAGNOSTIC GRATUIT',
  showWrong: 'Montrez à Au7o ce qui ne va pas',
  intro: (m) =>
    m
      ? "Prenez une photo du problème et Au7o s'occupe du reste. Ajoutez votre voiture pour plus de précision — facultatif. Un essai gratuit, sans compte."
      : "Déposez une photo du problème et Au7o s'occupe du reste. Ajoutez votre voiture pour plus de précision — facultatif. Un essai gratuit, sans compte.",
  vehicleOptional: 'VOTRE VÉHICULE · FACULTATIF',
  yearLabel: 'Année',
  makeLabel: 'Marque',
  modelLabel: 'Modèle',
  trimLabel: 'Finition',
  pickYearFirst: "Choisissez d'abord l'année",
  pickMakeFirst: "Choisissez d'abord la marque",
  pickModelFirst: "Choisissez d'abord le modèle",
  takePhotoEyebrow: 'PRENDRE UNE PHOTO',
  problemEyebrow: 'LE PROBLÈME',
  tapOpenCamera: 'Touchez pour ouvrir la caméra',
  dragPhoto: 'Glissez une photo ici',
  pointAtProblem: 'Pointez-la directement sur le problème',
  orPrefix: 'ou ',
  browseFiles: 'parcourir vos fichiers',
  fileTypes: "JPG, PNG ou WebP · jusqu'à 10 Mo",
  loaded: 'Chargée',
  replace: 'Remplacer',
  uploadExisting: 'Importer une photo existante à la place',
  captionPlaceholder: 'Ajoutez une note — quel bruit ou quelle odeur ? (facultatif)',
  anglesCount: (n) => `${n} angles — plus d'angles aident l'IA à cibler le problème.`,
  addAngleHint: 'Ajoutez un autre angle pour plus de précision.',
  proAngles: 'Les angles multiples sont une fonction Pro.',
  chooseImageErr: 'Choisissez une photo (JPEG, PNG ou WebP).',
  analyzingBtn: 'Analyse…',
  diagnoseThis: 'Diagnostiquer ceci',
  needPhoto: (m) =>
    m ? 'Prenez ou importez une photo pour diagnostiquer.' : 'Ajoutez une photo pour diagnostiquer.',
  vehicleOptionalHint: 'Votre véhicule est facultatif — il rend le résultat plus précis.',
  tipAddVehicle: (m) =>
    `Astuce : ajoutez l'année, la marque et le modèle${m ? ' ci-dessus' : ''} pour un diagnostic plus précis (facultatif).`,
  analyzingNoVehicle:
    "Diagnostic sans votre véhicule — le résultat est plus précis avec l'année, la marque et le modèle.",
  flywheelConsent:
    "Aidez à améliorer Au7o — conservez les détails de ce diagnostic (la pièce identifiée ; plaque et lieu supprimés) pour de meilleurs diagnostics futurs. Aucune photo n'est conservée. Facultatif.",
  handoffPrompt:
    'Vous voulez poser des questions de suivi à Au7o ? Enregistrez ce diagnostic dans votre garage.',
  saveGarage: 'Enregistrer dans mon garage',
  saveOpenChat: 'Enregistrer et ouvrir le chat',
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

  freeNoCard: 'Diagnóstico gratis · sin tarjeta',
  freeBadge: 'DIAGNÓSTICO GRATIS',
  showWrong: 'Muéstrale a Au7o qué falla',
  intro: (m) =>
    m
      ? 'Toma una foto del problema y Au7o se encarga del resto. Agrega tu coche para mayor precisión — opcional. Una prueba gratis, sin cuenta.'
      : 'Sube una foto del problema y Au7o se encarga del resto. Agrega tu coche para mayor precisión — opcional. Una prueba gratis, sin cuenta.',
  vehicleOptional: 'TU VEHÍCULO · OPCIONAL',
  yearLabel: 'Año',
  makeLabel: 'Marca',
  modelLabel: 'Modelo',
  trimLabel: 'Versión',
  pickYearFirst: 'Elige primero el año',
  pickMakeFirst: 'Elige primero la marca',
  pickModelFirst: 'Elige primero el modelo',
  takePhotoEyebrow: 'TOMAR UNA FOTO',
  problemEyebrow: 'EL PROBLEMA',
  tapOpenCamera: 'Toca para abrir la cámara',
  dragPhoto: 'Arrastra una foto aquí',
  pointAtProblem: 'Apúntala directo al problema',
  orPrefix: 'o ',
  browseFiles: 'explora tus archivos',
  fileTypes: 'JPG, PNG o WebP · hasta 10 MB',
  loaded: 'Cargada',
  replace: 'Reemplazar',
  uploadExisting: 'Subir una foto existente en su lugar',
  captionPlaceholder: 'Agrega una nota — ¿a qué suena o huele? (opcional)',
  anglesCount: (n) => `${n} ángulos — más ángulos ayudan a la IA a localizar el problema.`,
  addAngleHint: 'Agrega otro ángulo para mayor precisión.',
  proAngles: 'Varios ángulos es una función Pro.',
  chooseImageErr: 'Elige una foto (JPEG, PNG o WebP).',
  analyzingBtn: 'Analizando…',
  diagnoseThis: 'Diagnosticar esto',
  needPhoto: (m) =>
    m ? 'Toma o sube una foto para diagnosticar.' : 'Agrega una foto para diagnosticar.',
  vehicleOptionalHint: 'Tu vehículo es opcional — hace el resultado más preciso.',
  tipAddVehicle: (m) =>
    `Consejo: agrega año, marca y modelo${m ? ' arriba' : ''} para un diagnóstico más preciso (opcional).`,
  analyzingNoVehicle:
    'Diagnóstico sin tu vehículo — el resultado es más preciso si agregas año, marca y modelo.',
  flywheelConsent:
    'Ayuda a mejorar Au7o — conserva los detalles de este diagnóstico (la pieza identificada; matrícula y ubicación eliminadas) para mejorar diagnósticos futuros. No se guarda ninguna foto. Opcional.',
  handoffPrompt:
    '¿Quieres hacerle preguntas de seguimiento a Au7o? Guarda este diagnóstico en tu garaje.',
  saveGarage: 'Guardar en mi garaje',
  saveOpenChat: 'Guardar y abrir el chat',
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

  freeNoCard: 'Diagnóstico grátis · sem cartão',
  freeBadge: 'DIAGNÓSTICO GRÁTIS',
  showWrong: 'Mostre ao Au7o o que há de errado',
  intro: (m) =>
    m
      ? 'Tire uma foto do problema e o Au7o cuida do resto. Adicione seu carro para mais precisão — opcional. Um teste grátis, sem conta.'
      : 'Envie uma foto do problema e o Au7o cuida do resto. Adicione seu carro para mais precisão — opcional. Um teste grátis, sem conta.',
  vehicleOptional: 'SEU VEÍCULO · OPCIONAL',
  yearLabel: 'Ano',
  makeLabel: 'Marca',
  modelLabel: 'Modelo',
  trimLabel: 'Versão',
  pickYearFirst: 'Escolha primeiro o ano',
  pickMakeFirst: 'Escolha primeiro a marca',
  pickModelFirst: 'Escolha primeiro o modelo',
  takePhotoEyebrow: 'TIRAR UMA FOTO',
  problemEyebrow: 'O PROBLEMA',
  tapOpenCamera: 'Toque para abrir a câmera',
  dragPhoto: 'Arraste uma foto aqui',
  pointAtProblem: 'Aponte direto para o problema',
  orPrefix: 'ou ',
  browseFiles: 'procure nos seus arquivos',
  fileTypes: 'JPG, PNG ou WebP · até 10 MB',
  loaded: 'Carregada',
  replace: 'Substituir',
  uploadExisting: 'Enviar uma foto existente em vez disso',
  captionPlaceholder: 'Adicione uma nota — que som ou cheiro tem? (opcional)',
  anglesCount: (n) => `${n} ângulos — mais ângulos ajudam a IA a localizar o problema.`,
  addAngleHint: 'Adicione outro ângulo para mais precisão.',
  proAngles: 'Vários ângulos é um recurso Pro.',
  chooseImageErr: 'Escolha uma foto (JPEG, PNG ou WebP).',
  analyzingBtn: 'Analisando…',
  diagnoseThis: 'Diagnosticar isto',
  needPhoto: (m) =>
    m ? 'Tire ou envie uma foto para diagnosticar.' : 'Adicione uma foto para diagnosticar.',
  vehicleOptionalHint: 'Seu veículo é opcional — deixa o resultado mais preciso.',
  tipAddVehicle: (m) =>
    `Dica: adicione ano, marca e modelo${m ? ' acima' : ''} para um diagnóstico mais preciso (opcional).`,
  analyzingNoVehicle:
    'Diagnóstico sem seu veículo — o resultado é mais preciso com ano, marca e modelo.',
  flywheelConsent:
    'Ajude a melhorar o Au7o — mantenha os detalhes deste diagnóstico (a peça identificada; placa e localização removidas) para melhorar diagnósticos futuros. Nenhuma foto é guardada. Opcional.',
  handoffPrompt:
    'Quer fazer perguntas de acompanhamento ao Au7o? Salve este diagnóstico na sua garagem.',
  saveGarage: 'Salvar na minha garagem',
  saveOpenChat: 'Salvar e abrir o chat',
};

const DICTS: Record<string, DiagnoseStrings> = { en, de, fr, es, pt };

/** Resolve the diagnose-flow strings for the user's browser language.
 *  Client-only; returns English during SSR or for unmapped languages. */
export function diagnoseStrings(): DiagnoseStrings {
  if (typeof navigator === 'undefined' || !navigator.language) return en;
  const key = navigator.language.toLowerCase().split('-')[0];
  return DICTS[key] || en;
}

/**
 * SSR-safe accessor — USE THIS in components, not diagnoseStrings() directly.
 *
 * Returns English on the server AND on the client's first render (so the
 * hydrated DOM matches the server HTML), then swaps to the browser-language
 * strings in an effect after mount. Calling diagnoseStrings() inline during
 * render returned localized text on the client but English on the server,
 * producing a hydration mismatch (React #418) for every non-English visitor —
 * React then discarded the server tree and re-rendered the whole page on the
 * client, spiking LCP/INP. Non-English users now see one frame of English
 * before it localizes, which is imperceptible and infinitely cheaper than a
 * full client re-render.
 */
export function useDiagnoseStrings(): DiagnoseStrings {
  const [strings, setStrings] = useState<DiagnoseStrings>(en);
  useEffect(() => {
    const localized = diagnoseStrings();
    if (localized !== en) setStrings(localized);
  }, []);
  return strings;
}
