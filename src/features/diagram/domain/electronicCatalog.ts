export type ElectronicCategory = 'passive' | 'semiconductor' | 'control' | 'io' | 'power'
export type ElectronicComponent = { id: string; name: string; fr: string; category: ElectronicCategory; svg: string }

export const electronicCategories: { id: ElectronicCategory; label: string; fr: string }[] = [
  { id: 'passive', label: 'Passive components', fr: 'Composants passifs' },
  { id: 'semiconductor', label: 'Semiconductors', fr: 'Semi-conducteurs' },
  { id: 'control', label: 'Control & logic', fr: 'Contrôle & logique' },
  { id: 'io', label: 'Sensors & outputs', fr: 'Capteurs & sorties' },
  { id: 'power', label: 'Power', fr: 'Alimentation' },
]

const component = (id: string, name: string, fr: string, category: ElectronicCategory, svg: string): ElectronicComponent => ({ id, name, fr, category, svg })
const stroke = 'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"'

export const electronicComponents: ElectronicComponent[] = [
  component('resistor', 'Resistor', 'Résistance', 'passive', `<path ${stroke} d="M2 12h3l2-4 3 8 3-8 3 8 2-4h4"/>`),
  component('capacitor', 'Capacitor', 'Condensateur', 'passive', `<path ${stroke} d="M3 12h7m0-6v12m4-12v12m0-6h7"/>`),
  component('inductor', 'Inductor', 'Bobine', 'passive', `<path ${stroke} d="M2 12h3c0-5 4-5 4 0 0-5 4-5 4 0 0-5 4-5 4 0h5"/>`),
  component('potentiometer', 'Potentiometer', 'Potentiomètre', 'passive', `<path ${stroke} d="M2 14h3l2-4 3 8 3-8 3 8 2-4h4M12 3v7m0 0-2-2m2 2 2-2"/>`),
  component('fuse', 'Fuse', 'Fusible', 'passive', `<path ${stroke} d="M2 12h5m10 0h5"/><rect ${stroke} x="7" y="8" width="10" height="8" rx="1"/><path ${stroke} d="m9 14 6-4"/>`),
  component('crystal', 'Crystal oscillator', 'Oscillateur à quartz', 'passive', `<path ${stroke} d="M2 12h5m10 0h5M8 5v14m8-14v14"/><rect ${stroke} x="8" y="7" width="8" height="10" rx="1"/>`),
  component('transformer', 'Transformer', 'Transformateur', 'passive', `<path ${stroke} d="M2 12h3c0-5 4-5 4 0 0-5 4-5 4 0m2-7v14m3-7c0-5 4-5 4 0"/>`),
  component('thermistor', 'Thermistor', 'Thermistance', 'passive', `<path ${stroke} d="M2 12h3l2-4 3 8 3-8 3 8 2-4h4M15 5 9 19"/>`),
  component('diode', 'Diode', 'Diode', 'semiconductor', `<path ${stroke} d="M3 12h6m6 0h6M9 6v12l6-6-6-6Zm6 0v12"/>`),
  component('led', 'LED', 'LED', 'semiconductor', `<path ${stroke} d="M2 14h6m7 0h7M8 8v12l7-6-7-6Zm7 0v12m1-15 3-3m-1 6 3-3m-2-3h-3m3 0v3m2 0h-3m3 0v3"/>`),
  component('transistor', 'NPN transistor', 'Transistor NPN', 'semiconductor', `<path ${stroke} d="M4 12h5m0-6v12m0-9 7-4v5m0 4v5l-7-4m7-1 4 5m-4-5h5m-5-4 4-5"/>`),
  component('mosfet', 'MOSFET', 'MOSFET', 'semiconductor', `<path ${stroke} d="M3 12h5m2-7v14m3-11v8m0-4h5m0-7v14m0-14h3m-3 14h3"/>`),
  component('opamp', 'Operational amplifier', 'Amplificateur opérationnel', 'semiconductor', `<path ${stroke} d="M4 5v14l13-7L4 5Zm0 4H1m3 6H1m16-3h5M6 9h3M7.5 7.5v3M6 15h3"/>`),
  component('pnp-transistor', 'PNP transistor', 'Transistor PNP', 'semiconductor', `<path ${stroke} d="M4 12h5m0-6v12m0-9 7-4v5m0 4v5l-7-4m7-1 4-5m-4 5h5m-5-4 4 5"/>`),
  component('photodiode', 'Photodiode', 'Photodiode', 'semiconductor', `<path ${stroke} d="M3 14h6m6 0h6M9 8v12l6-6-6-6Zm6 0v12m-1-15 3-3m-1 6 3-3"/>`),
  component('bridge-rectifier', 'Bridge rectifier', 'Pont redresseur', 'semiconductor', `<path ${stroke} d="M12 3 21 12 12 21 3 12 12 3ZM3 12h4m10 0h4M12 3v4m0 10v4M9 9l6 6m0-6-6 6"/>`),
  component('voltage-regulator', 'Voltage regulator', 'Régulateur de tension', 'semiconductor', `<rect ${stroke} x="5" y="5" width="14" height="14" rx="2"/><path ${stroke} d="M2 9h3m0 6H2m17-6h3m-3 6h3M9 12h6m-3-3v6"/>`),
  component('microcontroller', 'Microcontroller', 'Microcontrôleur', 'control', `<rect ${stroke} x="6" y="4" width="12" height="16" rx="2"/><path ${stroke} d="M9 8h6v8H9zM3 7h3M3 12h3M3 17h3m12-10h3m-3 5h3m-3 5h3"/>`),
  component('logic-gate', 'Logic gate', 'Porte logique', 'control', `<path ${stroke} d="M5 5h5c5 0 8 3 8 7s-3 7-8 7H5c3-4 3-10 0-14Zm13 7h4M3 8h4M3 16h4"/>`),
  component('relay', 'Relay', 'Relais', 'control', `<rect ${stroke} x="3" y="7" width="8" height="10" rx="2"/><path ${stroke} d="M11 12h3m0 0 6-5m-6 5 6 5M5 10c3 0 3 4 0 4"/>`),
  component('switch', 'Switch', 'Interrupteur', 'control', `<path ${stroke} d="M3 15h6m6 0h6M9 15l6-6"/><circle cx="9" cy="15" r="1.5" fill="currentColor"/><circle cx="15" cy="15" r="1.5" fill="currentColor"/>`),
  component('timer-555', '555 timer', 'Temporisateur 555', 'control', `<rect ${stroke} x="5" y="4" width="14" height="16" rx="2"/><path ${stroke} d="M2 7h3m-3 5h3m-3 5h3m14-10h3m-3 5h3m-3 5h3M8 9h8M8 12h8M8 15h5"/>`),
  component('shift-register', 'Shift register', 'Registre à décalage', 'control', `<rect ${stroke} x="4" y="6" width="16" height="12" rx="2"/><path ${stroke} d="M1 9h3m-3 6h3m16-6h3m-3 6h3M8 9v6m4-6v6m4-6v6M6 12h12"/>`),
  component('fpga', 'FPGA', 'FPGA', 'control', `<rect ${stroke} x="5" y="5" width="14" height="14" rx="2"/><path ${stroke} d="M2 8h3m-3 4h3m-3 4h3m14-8h3m-3 4h3m-3 4h3M9 9h6v6H9z"/>`),
  component('adc', 'ADC / DAC', 'CAN / CNA', 'control', `<rect ${stroke} x="4" y="6" width="16" height="12" rx="2"/><path ${stroke} d="M1 12h3m16 0h3M7 15l2-6 2 6m-3-2h2m5-4v6m0-6h2a3 3 0 0 1 0 6h-2"/>`),
  component('sensor', 'Sensor', 'Capteur', 'io', `<circle ${stroke} cx="12" cy="12" r="4"/><path ${stroke} d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2m0-14-2 2M7 17l-2 2"/>`),
  component('current-sensor', 'Current sensor', 'Capteur de courant', 'io', `<circle ${stroke} cx="12" cy="12" r="7"/><path ${stroke} d="M2 12h5m10 0h5M9 15l6-6m-3 0h3v3"/>`),
  component('motor', 'Motor', 'Moteur', 'io', `<circle ${stroke} cx="12" cy="12" r="7"/><path ${stroke} d="M2 12h3m14 0h3M9 16V8l3 5 3-5v8"/>`),
  component('antenna', 'Antenna', 'Antenne', 'io', `<path ${stroke} d="M12 13v9m-5 0h10M8 9a6 6 0 0 1 8 0M5 6a10 10 0 0 1 14 0"/><circle cx="12" cy="12" r="2" fill="currentColor"/>`),
  component('connector', 'Connector', 'Connecteur', 'io', `<rect ${stroke} x="5" y="4" width="14" height="16" rx="3"/><path ${stroke} d="M9 8v3m6-3v3m-6 5h6"/>`),
  component('buzzer', 'Buzzer', 'Buzzer', 'io', `<path ${stroke} d="M3 10h5l5-4v12l-5-4H3zM17 9c3 2 3 4 0 6m2-9c5 4 5 8 0 12"/>`),
  component('display', 'Display', 'Afficheur', 'io', `<rect ${stroke} x="3" y="5" width="18" height="14" rx="2"/><path ${stroke} d="M7 9h10M7 12h10M7 15h5"/>`),
  component('microphone', 'Microphone', 'Microphone', 'io', `<rect ${stroke} x="9" y="3" width="6" height="11" rx="3"/><path ${stroke} d="M6 11a6 6 0 0 0 12 0m-6 6v4m-4 0h8"/>`),
  component('rotary-encoder', 'Rotary encoder', 'Encodeur rotatif', 'io', `<circle ${stroke} cx="12" cy="12" r="6"/><circle ${stroke} cx="12" cy="12" r="2"/><path ${stroke} d="M12 2v4m0 12v4M2 12h4m12 0h4"/>`),
  component('battery', 'Battery', 'Batterie', 'power', `<path ${stroke} d="M3 12h5m8 0h5M8 7v10m4-7v4m4-7v10"/>`),
  component('power-supply', 'Power supply', 'Alimentation', 'power', `<rect ${stroke} x="3" y="5" width="18" height="14" rx="3"/><path ${stroke} d="M7 12h4m-2-2v4m5-2h4"/>`),
  component('ground', 'Ground', 'Masse', 'power', `<path ${stroke} d="M12 3v10m-7 0h14m-11 4h8m-5 4h2"/>`),
  component('dc-dc-converter', 'DC/DC converter', 'Convertisseur DC/DC', 'power', `<rect ${stroke} x="3" y="6" width="18" height="12" rx="2"/><path ${stroke} d="M6 12h4m-2-2v4m5-2h5m-2-2v4"/>`),
  component('solar-panel', 'Solar panel', 'Panneau solaire', 'power', `<path ${stroke} d="M5 5h14l-2 12H7L5 5Zm3 0 9 12m-1-12-9 12M6 9h12m-11 4h10M12 20v2m-4 0h8"/>`),
  component('ac-source', 'AC source', 'Source alternative', 'power', `<circle ${stroke} cx="12" cy="12" r="7"/><path ${stroke} d="M2 12h3m14 0h3m-11 0c1.5-3 3.5-3 5 0s3.5 3 5 0"/>`),
]

export const getElectronicComponent = (id?: string) => electronicComponents.find(item => item.id === id)
