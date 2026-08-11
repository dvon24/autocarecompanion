const SNAPSHOT_FILE = 'data/_saab-deeplink-snapshot-2026-08-11.json';
const REVIEW_DATE = '2026-08-11';

const contracts = {
  '900': {
    make: 'Saab',
    model: '900',
    reviewDate: REVIEW_DATE,
    snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-saab-900-adjudication-2026-08-11.json',
    allIds: ['saab-900-classic-windshield-frame-rust'],
    retainedIds: [],
    reportCountCleanupIds: [],
    observations: [
      'The frozen vehicle metadata covers 1990-1993, while the frozen title asserts 1979-1993; this scope conflict cannot be fixed by a body-only rewrite.',
      'Independent buyer guides support inspection for corrosion at wheel arches, door bottoms, floors, suspension mounting areas and other structural locations, but the captured sources do not validate the frozen windshield-frame-plus-rear-arch composite as one recurring defect across every listed trim.',
      'No captured primary Saab communication supports the frozen prevalence, hidden-inner-structure sequence, annual trim-lifting instruction, convertible-stiffener claim, repair-price ranges or named restoration-service availability.',
    ],
    pdfSources: {},
    otherSources: {
      carAndDriverGuide: {
        url: 'https://www.caranddriver.com/features/a44601095/what-to-buy-1979-1993-saab-900/',
        type: 'article',
        title: 'Car and Driver 1979-1993 Saab 900 buyer guide',
        contains: ['wheel arches', 'suspension mounting points'],
      },
      hemmingsGuide: {
        url: 'https://www.hemmings.com/stories/buyers-guide-1986-94-saab-900-convertible/',
        type: 'article',
        title: 'Hemmings 1986-1994 Saab 900 Convertible buyer guide',
        contains: ['floors under the carpets', 'common corrosion points'],
      },
    },
    bulletinInventory: {
      method: 'Exact Saab 900 corrosion searches and captured buyer-guide review; no primary Saab service communication was found that establishes the frozen composite identity or prevalence.',
      exactDocuments: 0,
    },
    recallInventory: {
      method: 'No safety recall was used to substantiate age-, climate- and condition-dependent body corrosion.',
      exactCampaigns: 0,
    },
    modelAliases: ['900', 'Classic 900', 'C900'],
    searchTerms: ['windshield frame rust', 'windscreen surround rust', 'rear wheel arch rust', 'floor corrosion'],
    relevantDocumentIds: [],
    campaigns: [],
    requiredProse: [
      {
        id: 'saab-900-classic-windshield-frame-rust',
        field: 'description',
        patterns: ['vehicle metadata is limited to 1990-1993', 'do not establish the windshield frame and rear wheel arches as one recurring defect'],
      },
    ],
    content: {
      'saab-900-classic-windshield-frame-rust': {
        description: 'The frozen title describes 1979-1993 Classic 900s, but this page\'s indexed vehicle metadata is limited to 1990-1993. Independent buyer guides support careful corrosion inspection on surviving Classic 900s, including wheel arches, door bottoms, floors, jacking or suspension mounting areas and moisture-trapping locations. The captured guides do not establish the windshield frame and rear wheel arches as one recurring defect across every listed trim, do not prove that inner structure always rusts first and do not supply a failure rate for salt-region cars. Vehicle history, prior glass or body work, storage, drainage, coatings and road-salt exposure materially change the condition.',
        solution: 'Have a qualified body or restoration shop inspect the whole body and understructure, ideally on a lift. Look for paint bubbles, seam swelling, perforation, soft metal, wet carpet and repairs hidden by trim or undercoating; a glass specialist should assess corrosion near the windshield before moldings or bonded glass are disturbed. Structural corrosion, suspension-mount damage or perforation needs professional measurement and repair planning rather than a cosmetic patch. Do not buy wheel-arch panels, floor sections, windshield trim or rust treatment from this page; the location, depth, body style and repair section require hands-on inspection.',
        symptoms: ['Paint bubbling or seam swelling near a wheel arch or body joint', 'Wet carpet or visible corrosion under interior trim', 'Perforation, flaking metal or damage near a structural or suspension mounting point', 'Corrosion near windshield trim requiring glass-and-body inspection'],
        affectedSystems: ['Body panels, seams and floor structure', 'Wheel arches, jacking and suspension mounting areas', 'Windshield opening, exact condition unresolved'],
        citations: ['carAndDriverGuide', 'hemmingsGuide'],
        evidence: ['Car and Driver identifies wheel-arch and suspension-mount corrosion as inspection priorities on 1979-1993 Saab 900s.', 'Hemmings identifies multiple corrosion locations and trapped-moisture inspection points on 1986-1994 Saab 900 convertibles, while not proving the frozen all-trim composite.'],
        summary: 'Removed unsupported prevalence, hidden-rust sequence, price, annual trim-lifting, convertible-stiffener and restoration-provider claims; exposed the frozen 1979-1993 versus indexed 1990-1993 conflict.',
        conflict: 'The frozen title claims 1979-1993 while the indexed years are 1990-1993, and the title combines windshield-frame and rear-wheel-arch corrosion without exact evidence that they form one cross-trim recurring defect.',
        commerceDecision: 'corrosion location, depth, body style, prior repair and required panel section must be established by inspection; no universal retail part',
      },
    },
  },
  '9-2X': {
    make: 'Saab',
    model: '9-2X',
    reviewDate: REVIEW_DATE,
    snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-saab-9-2x-adjudication-2026-08-11.json',
    allIds: ['saab-9-2x-head-gasket-2.5'],
    retainedIds: [],
    reportCountCleanupIds: [],
    observations: [
      'Saab workshop information confirms the 9-2X 2.5i/Linear configuration and supplies the cylinder-head gasket replacement procedure, but does not label external head-gasket leakage a recurring 2005-2006 9-2X defect.',
      'A gasket-manufacturer technical note describes external oil leakage as a possible failure mode on Subaru EJ-series 2.5 L engines, but it does not establish 9-2X incidence, mileage, all listed years or the frozen cost range.',
      'Subaru WWP-99 is not used: it covered earlier 1999-2002 Subaru populations and external coolant leakage, not the frozen 2005-2006 Saab 9-2X external-oil identity.',
    ],
    pdfSources: {
      felProGuide: {
        url: 'https://www.felpro.com/content/dam/marketing/North-America/felpro/pdfs/article-bulletins/Fel-Pro%20TechTip_Solving%20Subaru%202.5L%20Head%20Gasket%20Problems%20With%20Fel-Pro.pdf',
        type: 'manufacturer',
        title: 'Fel-Pro technical note on Subaru 2.5 L head-gasket diagnosis',
        contains: ['External oil leak from failed gasket', 'EJ-series 2.5L boxer engine'],
      },
    },
    otherSources: {
      saabSpecification: {
        url: 'https://saabwisonline.com/9-2x-9346/2005/2-engine/mechanical-2-5i/general-description/technical-data/specification',
        type: 'manufacturer',
        title: 'Saab WIS 2005 9-2X 2.5i engine specification',
        contains: ['Saab 9-2X 2.5i Linear', 'single over-head camshaft'],
      },
      saabHeadInstallation: {
        url: 'https://saabwisonline.com/9-2x-9346/2005/2-engine/mechanical-2-5i/cylinder-head/adjustment-replacement/installation',
        type: 'manufacturer',
        title: 'Saab WIS 2005 9-2X 2.5i cylinder-head installation procedure',
        contains: ['Use new cylinder head gaskets', 'mating surface'],
      },
    },
    bulletinInventory: {
      method: 'Exact Saab 9-2X WIS and Subaru head-gasket campaign searches; WWP-99 was rejected as an earlier Subaru-only coolant-leak population.',
      exactDocuments: 2,
    },
    recallInventory: {
      method: 'No recall was used to substantiate this non-safety engine-leak identity.',
      exactCampaigns: 0,
    },
    modelAliases: ['9-2X', '9-2X 2.5i', '9-2X Linear'],
    searchTerms: ['head gasket external oil leak', 'head gasket coolant leak', '2.5i cylinder head'],
    relevantDocumentIds: [],
    campaigns: [],
    requiredProse: [
      {
        id: 'saab-9-2x-head-gasket-2.5',
        field: 'description',
        patterns: ['do not establish a recurring 2005-2006 Saab 9-2X defect', 'WWP-99 does not apply'],
      },
    ],
    content: {
      'saab-9-2x-head-gasket-2.5': {
        description: 'Saab workshop information confirms that the 9-2X 2.5i/Linear uses a 2,457 cc horizontally opposed SOHC engine and supplies a cylinder-head gasket installation procedure. A Fel-Pro technical note for Subaru EJ-series 2.5 L engines identifies external oil leakage as one possible head-gasket failure mode. Those documents do not establish a recurring 2005-2006 Saab 9-2X defect, an 80,000-150,000-mile onset or a universal front-of-engine leak location. Subaru service program WWP-99 does not apply: it addressed external coolant leakage on specified 1999-2002 Subaru vehicles, not this frozen Saab population. Oil or coolant observed near the head-to-block joint can also travel from another seal or component and requires source confirmation.',
        solution: 'Clean the area and have a Subaru/Saab-experienced technician identify the fluid and its highest fresh source; pressure testing, UV dye, cooling-system testing or a combustion-gas test may be appropriate depending on the symptoms. If a head-gasket leak is confirmed, use the exact 9-2X service procedure, new gaskets and measured checks of the head and block surfaces. Resurfacing, timing-belt service, idlers and water-pump replacement should follow measurements, maintenance history and component condition rather than an automatic rule. Stop driving if the engine overheats, loses coolant rapidly or oil pressure is affected. Do not buy a head-gasket kit, timing parts or water pump from this page; engine identification, leak source, machining needs and kit contents require VIN-level diagnosis.',
        symptoms: ['Fresh oil or coolant at the head-to-block joint after the engine is cleaned', 'Burning-fluid odor or smoke from fluid reaching hot exhaust parts', 'Coolant loss or overheating requiring immediate diagnosis', 'Leak traced to another upper-engine seal rather than the head gasket'],
        affectedSystems: ['2.5i cylinder-head sealing surfaces and gaskets', 'Cooling and lubrication systems, leak source unresolved', 'Timing-belt-area components, condition-dependent'],
        citations: ['saabSpecification', 'saabHeadInstallation', 'felProGuide'],
        evidence: ['Saab WIS identifies the 2.5i/Linear engine configuration and the exact cylinder-head installation sequence.', 'Fel-Pro documents external oil leakage as a possible EJ-series 2.5 L head-gasket failure mode but does not prove Saab 9-2X frequency or mileage.'],
        summary: 'Removed unsupported prevalence, mileage, price, universal leak location, gasket-brand recommendation and automatic resurfacing/timing-system replacement claims; added leak-source and measurement gates.',
        conflict: 'The frozen page converts a general EJ-series possible failure mode into a high-confidence, all-2005-2006 Saab 9-2X pattern with exact mileage, price and mandatory repair steps unsupported by a 9-2X-specific campaign.',
        commerceDecision: 'engine identity, leak source, surface measurements, maintenance history and kit contents require VIN-level diagnosis; no universal retail part',
      },
    },
  },
  '9-3': {
    make: 'Saab',
    model: '9-3',
    reviewDate: REVIEW_DATE,
    snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-saab-9-3-adjudication-2026-08-11.json',
    allIds: [
      'saab-9-3-direct-ignition-cassette',
      'saab-9-3-second-gen-control-arm-bushings',
      'saab-9-3-sentronic-af33-failure',
      'saab-9-3-sunroof-drain-clog',
      'saab-9-3-turbo-failure-b207',
    ],
    retainedIds: [],
    reportCountCleanupIds: [],
    observations: [
      'The frozen 9-3 rows repeatedly combine the 9400 first generation with the 9440 second generation or apply one powertrain component across incompatible engines and transmissions.',
      'NHTSA and Saab WIS support an ignition-discharge-module condition on older 2000-2002 9-3 vehicles, while B207 second-generation cars use individual coils; the frozen 1999-2011 DIC scope is false.',
      'Saab WIS explicitly provides separate front and rear suspension-arm bushing procedures, and its transmission documents split M03-M04 5-speed conditions from AF40 6-speed applications.',
      'Second-generation electrical architecture identifies SRM, BCM, CIM and REC rather than the frozen DICE/TWICE damage chain, and B207 turbocharger type varies by engine calibration.',
    ],
    pdfSources: {
      dicInvestigation: {
        url: 'https://static.nhtsa.gov/odi/inv/2005/INRL-PE05017-20825P.pdf',
        type: 'nhtsa',
        title: 'NHTSA PE05-017 information request on Saab ignition discharge modules',
        contains: ['2000-2002 Saab 9-3', 'ignition discharge module'],
      },
    },
    otherSources: {
      oldIgnition: {
        url: 'https://saabwisonline.com/9-3-9400/2002/2-engine/trionic-t7/technical-description/brief-description',
        type: 'manufacturer',
        title: 'Saab WIS 9-3 9400 Trionic T7 ignition description',
        contains: ['Ignition is performed by an ignition discharge module'],
      },
      b207Ignition: {
        url: 'https://saabwisonline.com/9-3-9440/2003/2-engine/4-cylinder-petrol/engine-management-system-trionic-t8/adjustment-replacement/ignition-coil-with-integrated-power-stage-320-b207',
        type: 'manufacturer',
        title: 'Saab WIS 9-3 9440 B207 individual ignition-coil procedure',
        contains: ['ignition coil', 'integrated power stage'],
      },
      rearArmBush: {
        url: 'https://saabwisonline.com/9-3-9440/2008/7-suspension-wheels/front-suspension/adjustment-replacement/suspension-arm-bush-rear',
        type: 'manufacturer',
        title: 'Saab WIS second-generation 9-3 rear suspension-arm bushing procedure',
        contains: ['remove the bush from the suspension arm', 'Four wheel alignment'],
      },
      frontArmBush: {
        url: 'https://saabwisonline.com/9-3-9440/2009/7-suspension-wheels/front-suspension/adjustment-replacement/suspension-arm-bush-front',
        type: 'manufacturer',
        title: 'Saab WIS second-generation 9-3 front suspension-arm bushing procedure',
        contains: ['Press out the bush', 'Press the bush into the suspension arm'],
      },
      fiveSpeedBulletin: {
        url: 'https://saabwisonline.com/9-3-9440/2003/4-transmission/automatic-transmission/bulletins-si-mi/440-2498-utg-2-general-fault-diagnosis-for-automatic-transmission',
        type: 'manufacturer',
        title: 'Saab bulletin 440-2498 for M03-M04 5-speed automatic diagnosis',
        contains: ['Saab 9-3 M03-04 with 5-speed automatic transmission', 'Hard, delayed and incorrect shifting'],
      },
      af40Designation: {
        url: 'https://saabwisonline.com/9-3-9440/2005/4-transmission/automatic-transmission/6-speed-af-40/technical-data/type-designations',
        type: 'manufacturer',
        title: 'Saab WIS AF40 6-speed type designation',
        contains: ['6-speed automatic transmission', 'AF40'],
      },
      sunroofAssembly: {
        url: 'https://saabwisonline.com/9-3-9440/2005/8-body/sunroof/adjustment-replacement/sunroof-assembly',
        type: 'manufacturer',
        title: 'Saab WIS second-generation 9-3 sunroof assembly and drainage hoses',
        contains: ['drainage hoses', 'sunroof assembly'],
      },
      electricalArchitecture: {
        url: 'https://saabwisonline.com/9-3-9440/2009/3-electrical-system/bus-and-diagnostics-communication/technical-description/main-components',
        type: 'manufacturer',
        title: 'Saab WIS second-generation 9-3 bus and control-module architecture',
        contains: ['Sun Roof Module', 'Body Control Module', 'Column Integration Module', 'Rear Electrical Centre'],
      },
      turboTypes: {
        url: 'https://saabwisonline.com/9-3-9440/2009/2-engine/4-cyl-petrol-e85/turbocharger-system/technical-data/basic-charging-pressure',
        type: 'manufacturer',
        title: 'Saab WIS B207 turbocharger type and base-pressure table',
        contains: ['Garrett GT2052s', 'MHI TD04-11TK', 'MHI TD04L-14T'],
      },
      turboProcedure: {
        url: 'https://saabwisonline.com/9-3-9440/2010/2-engine/4-cyl-petrol-e85/turbocharger-system/adjustment-replacement/turbo-b207',
        type: 'manufacturer',
        title: 'Saab WIS B207 turbocharger replacement procedure',
        contains: ['oil delivery pipe', 'Fill with plenty of engine oil'],
      },
      chargeAirTest: {
        url: 'https://saabwisonline.com/9-3-9440/2009/2-engine/4-cyl-petrol-e85/turbocharger-system/adjustment-replacement/pressure-testing-the-charge-air-cooler-and-delivery-pipe-b207',
        type: 'manufacturer',
        title: 'Saab WIS B207 charge-air leakage test',
        contains: ['check the hoses, pipes and connections for leaks'],
      },
    },
    bulletinInventory: {
      method: 'Exact first- and second-generation WIS component review plus NHTSA PE05-017 and Saab bulletin 440-2498; sources were not extrapolated across generations or powertrains.',
      exactDocuments: 11,
    },
    recallInventory: {
      method: 'No recall was used; PE05-017 is an investigation record and is described as such, not as a recall or owner-frequency total.',
      exactCampaigns: 0,
    },
    modelAliases: ['9-3', '9-3 9400', '9-3 9440', 'Sport Sedan', 'SportCombi', 'Convertible'],
    searchTerms: ['ignition discharge module', 'B207 ignition coil', 'suspension arm bushing', '5-speed automatic', 'AF40', 'sunroof drainage hose', 'B207 turbocharger'],
    relevantDocumentIds: ['PE05-017', '440-2498'],
    campaigns: [],
    requiredProse: [
      { id: 'saab-9-3-direct-ignition-cassette', field: 'description', patterns: ['2003-and-later B207 system uses four individual ignition coils', 'does not validate the frozen 1999-2011 scope'] },
      { id: 'saab-9-3-second-gen-control-arm-bushings', field: 'description', patterns: ['separate replacement procedures', 'contradicts the frozen claim'] },
      { id: 'saab-9-3-sentronic-af33-failure', field: 'description', patterns: ['M03-M04', 'AF40 6-speed'] },
      { id: 'saab-9-3-sunroof-drain-clog', field: 'description', patterns: ['not DICE and TWICE', 'do not establish a recurring 2003-2011 drain-clog pattern'] },
      { id: 'saab-9-3-turbo-failure-b207', field: 'description', patterns: ['three different turbocharger applications', 'do not establish bearing failure'] },
    ],
    content: {
      'saab-9-3-direct-ignition-cassette': {
        description: 'NHTSA opened PE05-017 to investigate ignition-discharge-module allegations on model-year 2000-2002 Saab 9-3 four-cylinder vehicles, and Saab WIS shows the older Trionic T7 system uses one ignition discharge module. Saab WIS separately shows that the 2003-and-later B207 system uses four individual ignition coils with integrated power stages. That architecture change does not validate the frozen 1999-2011 scope, which combines B205/B235 cassette-equipped cars with B207 coil-on-plug cars and later trims. The captured records do not support a universal 80,000-mile threshold, heat-shield cracking mechanism or rubber-boot failure rate.',
        solution: 'Identify the generation and engine before diagnosing a misfire. Read and preserve DTCs, inspect the specified spark plugs and wiring, and follow Saab WIS tests for the ignition discharge module on a 9400 car or the individual coils and ionization system on a B207 9440 car. Do not assume every misfire is ignition hardware, continue driving through a flashing malfunction lamp or rely on carrying a spare cassette as a safety plan. Do not buy a DIC, individual coil or spark-plug set from this page; the frozen row spans incompatible ignition architectures and fitment requires VIN and engine confirmation.',
        symptoms: ['Misfire or uneven running with cylinder-specific DTCs', 'Check-engine lamp, including a flashing lamp requiring immediate load reduction', 'No-start condition requiring fuel, crank-sensor, plug and ignition-system diagnosis'],
        affectedSystems: ['Trionic T7 ignition discharge module on applicable older 9-3 vehicles', 'Trionic T8 individual B207 ignition coils, separate architecture'],
        citations: ['dicInvestigation', 'oldIgnition', 'b207Ignition'],
        evidence: ['PE05-017 identifies a narrow 2000-2002 9-3 investigation population, not all 1999-2011 cars.', 'Saab WIS proves the old single-module versus later individual-coil architecture split.'],
        summary: 'Removed cross-generation DIC fitment, mileage, mechanism, price, plug-number and carry-a-spare claims; separated older ignition-discharge modules from B207 individual coils.',
        conflict: 'The frozen title and vehicle scope treat incompatible first-generation cassette and second-generation coil-on-plug systems as one 1999-2011 defect identity.',
        commerceDecision: 'generation, engine, DTC, plug specification and failed ignition component require VIN-level diagnosis; no universal retail part',
      },
      'saab-9-3-second-gen-control-arm-bushings': {
        description: 'Saab WIS provides separate replacement procedures for both the front and rear bushings of the second-generation 9-3 front suspension arm. The rear bushing can be removed from the arm and fitted separately, while the front bushing is pressed out and into the arm. That directly contradicts the frozen claim that Saab supplies the bushing only with an entire control arm. The procedures establish serviceability, not a 60,000-100,000-mile failure pattern, paired-control-arm requirement, part brand or universal cause of clunks, wander, vibration and tire wear.',
        solution: 'Have both front suspension sides inspected with the vehicle safely supported. Separate bushing cracking or movement from ball-joint wear, loose fasteners, strut or anti-roll-bar faults, wheel damage and alignment problems. Saab WIS allows bushing-level service with the specified fixtures; complete-arm replacement is appropriate only when the arm, ball joint, corrosion or economics justify it. Tighten bonded bushings in the specified normal position and perform the WIS four-wheel alignment after repair. Do not buy a bushing, arm or polyurethane kit from this page; side, bushing position, chassis configuration and required tools must be confirmed.',
        symptoms: ['Clunk or movement localized to a front suspension-arm bushing', 'Steering wander or uneven tire wear requiring full suspension and alignment inspection', 'Visible cracking, separation or excessive bushing movement'],
        affectedSystems: ['Front suspension-arm front and rear bushings, separate service parts', 'Suspension arm, ball joint and alignment, condition-dependent'],
        citations: ['rearArmBush', 'frontArmBush'],
        evidence: ['Saab WIS explicitly removes and replaces the rear bushing separately from the suspension arm.', 'Saab WIS explicitly presses the front bushing out of and into the existing arm.'],
        summary: 'Corrected the false whole-arm-only claim, removed unsupported mileage, paired replacement, brand, price and spring-compressor advice, and retained WIS alignment requirements.',
        conflict: 'The frozen body says the bushing is unavailable separately and requires whole-arm replacement, while Saab WIS provides direct bushing-level procedures.',
        commerceDecision: 'front versus rear bushing, side, chassis configuration, arm and ball-joint condition and tooling require inspection; no universal retail part',
      },
      'saab-9-3-sentronic-af33-failure': {
        description: 'Saab bulletin 440-2498 addresses hard, delayed and incorrect shifting on M03-M04 9-3 vehicles with the 5-speed automatic and lists distinct causes and remedies including software, an output-speed sensor, valve housing, fluid level, cooling-system contamination and adaptation. Saab WIS separately identifies the AF40 6-speed automatic in later 9-3 applications. Those records do not support one Aisin AF33-5 failure identity across every 2003-2011 2.0T and 2.8T vehicle, a 100,000-150,000-mile failure threshold or the frozen claim that a universal lifetime-fill policy caused the failures.',
        solution: 'Identify the transmission from the VIN, option label and gearbox designation before service. Preserve DTCs and document whether the complaint is cold or warm, the exact shift, fluid state and engine/transmission software. For an applicable M03-M04 5-speed condition, follow bulletin 440-2498 in order; later AF40 or other configurations require their own WIS procedure and exact fluid specification. Do not perform a universal six-quart drain-and-fill or condemn a valve body or torque converter from symptoms alone. Do not buy fluid, a valve body, torque converter or used transmission from this page; transmission identity, cause, calibration and fitment require VIN-level diagnosis.',
        symptoms: ['Hard, delayed or incorrect shift on a verified M03-M04 5-speed application', 'Shift flare, unexpected downshift or harsh engagement requiring DTC and fluid checks', 'Coolant contamination, sensor, software or valve-housing fault requiring separate diagnosis'],
        affectedSystems: ['M03-M04 5-speed automatic, exact type and condition VIN-dependent', 'AF40 6-speed and other later applications, separate identities'],
        citations: ['fiveSpeedBulletin', 'af40Designation'],
        evidence: ['Bulletin 440-2498 limits its 5-speed diagnostic table primarily to M03-M04 and lists multiple non-terminal causes.', 'Saab WIS identifies an AF40 6-speed automatic, disproving the frozen all-year AF33-5 scope.'],
        summary: 'Bound documented 5-speed symptoms to M03-M04, exposed later AF40 applications and removed universal mileage, lifetime-fill causality, interval, fluid-volume, price and replacement claims.',
        conflict: 'The frozen identity calls every 2003-2011 2.0T/2.8T automatic an AF33-5 even though Saab documents both narrow M03-M04 5-speed conditions and later AF40 6-speed applications.',
        commerceDecision: 'gearbox designation, model year, engine, DTC, software, fluid condition and root cause require VIN-level diagnosis; no universal retail part',
      },
      'saab-9-3-sunroof-drain-clog': {
        description: 'Saab WIS confirms that the second-generation 9-3 sunroof assembly has drainage hoses. Its electrical architecture identifies the Sun Roof Module, Body Control Module, Column Integration Module and Rear Electrical Centre, not DICE and TWICE as the frozen page claims. The captured Saab documents do not establish a recurring 2003-2011 drain-clog pattern, a fixed overflow path into modules beneath the front carpet or the asserted no-start, instrument, and ABS cascade. A wet headliner or carpet can result from a disconnected, pinched or obstructed drain, glass or seal alignment, windshield or body seam, door membrane or another water path and requires leak tracing.',
        solution: 'Locate the water entry with a controlled low-volume test performed by a qualified technician; inspect the sunroof cassette, glass and seals, each drain connection and outlet, windshield and body seams, and other nearby paths. Do not use high-pressure compressed air or rigid wire that can disconnect or pierce a hose. If the carpet is wet, disconnect power only as the service procedure permits, remove moisture promptly and inspect actual connectors and modules in the water path before replacing or programming anything. Do not buy a DICE, TWICE, BCM, CIM, REC, sunroof module or drain hose from this page; the frozen modules are misidentified and the entry path must be proven.',
        symptoms: ['Water at headliner, pillar trim or carpet after rain or washing', 'Slow or uneven drainage during a controlled low-volume test', 'Electrical symptoms appearing after verified water exposure, module not assumed'],
        affectedSystems: ['Sunroof cassette and drainage hoses', 'Body seals and alternate water-entry paths', 'SRM, BCM, CIM, REC or connectors only if they are in the proven water path'],
        citations: ['sunroofAssembly', 'electricalArchitecture'],
        evidence: ['Saab WIS confirms drainage hoses but does not establish a universal clog or overflow path.', 'The WIS module inventory identifies second-generation control modules and disproves the frozen DICE/TWICE architecture.'],
        summary: 'Removed the false DICE/TWICE cascade, universal clog path, annual compressed-air instruction, module-price and dehumidifier claims; added controlled leak tracing and module-identification gates.',
        conflict: 'The frozen title assigns second-generation 9-3 water damage to DICE/TWICE modules from the older architecture and treats multiple possible leak paths as one drain-clog defect.',
        commerceDecision: 'water-entry path, body style, drain state, connector exposure and actual module identity require controlled diagnosis; no universal retail part',
      },
      'saab-9-3-turbo-failure-b207': {
        description: 'Saab WIS lists three different turbocharger applications within the B207 family: Garrett GT2052s for B207E, MHI TD04-11TK for B207L and MHI TD04L-14T for B207R. That disproves the frozen claim that every 2003-2011 B207 trim uses one Mitsubishi TD04. The WIS replacement and charge-air testing procedures describe correct service and leak checks but do not establish bearing failure at 100,000-150,000 miles, higher Aero failure frequency, automatic bypass-diaphragm co-failure or a universal oil-feed-line cause.',
        solution: 'Identify the exact B207 calibration and turbo unit before diagnosis. Record smoke conditions, oil consumption, boost DTCs and noise; inspect crankcase ventilation, intake and charge-air hoses, bypass control, oil supply and return, coolant connections and turbine/compressor condition. Pressure-test the charge-air system using the WIS limit before condemning the turbo. If replacement is proven, follow the exact WIS procedure, renew specified seals and washers and prime the turbo with oil; replace pipes or the bypass component only when restricted, damaged or failed. Do not buy a turbo, oil pipe, bypass valve or gasket kit from this page; B207 variant, turbo unit and failure path require VIN-level confirmation.',
        symptoms: ['Blue exhaust smoke or increased oil consumption requiring source diagnosis', 'Abnormal turbo noise with verified shaft or wheel damage', 'Low boost or charge-air leak DTC requiring hose and cooler pressure testing'],
        affectedSystems: ['B207E Garrett GT2052s, B207L TD04-11TK or B207R TD04L-14T', 'Turbo oil and coolant pipes, charge-air system and bypass control'],
        citations: ['turboTypes', 'turboProcedure', 'chargeAirTest'],
        evidence: ['Saab WIS maps three turbo units to distinct B207 variants.', 'WIS supplies replacement and pressure-test procedures but no universal bearing-failure frequency, mileage or co-failure rule.'],
        summary: 'Corrected the one-TD04-for-all claim, removed mileage, Aero-frequency, price, mandatory feed-line and bypass-valve claims, and added variant-specific diagnosis and WIS priming.',
        conflict: 'The frozen identity assigns one TD04 bearing-failure pattern to all B207 trims even though Saab documents three turbo units and no cross-variant failure campaign.',
        commerceDecision: 'B207 calibration, exact turbo unit, oil/coolant pipe condition, bypass control and verified failure path require VIN-level diagnosis; no universal retail part',
      },
    },
  },
};

const supportedModels = Object.freeze(Object.keys(contracts));
function getContract(model) {
  const contract = contracts[model];
  if (!contract) throw new Error(`Unsupported Saab model: ${model}`);
  return contract;
}

module.exports = { getContract, supportedModels };
