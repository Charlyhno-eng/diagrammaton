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
  component('diode', 'Diode', 'Diode', 'semiconductor', `<path ${stroke} d="M3 12h6m6 0h6M9 6v12l6-6-6-6Zm6 0v12"/>`),
  component('led', 'LED', 'LED', 'semiconductor', `<path ${stroke} d="M2 14h6m7 0h7M8 8v12l7-6-7-6Zm7 0v12m1-15 3-3m-1 6 3-3m-2-3h-3m3 0v3m2 0h-3m3 0v3"/>`),
  component('transistor', 'NPN transistor', 'Transistor NPN', 'semiconductor', `<path ${stroke} d="M4 12h5m0-6v12m0-9 7-4v5m0 4v5l-7-4m7-1 4 5m-4-5h5m-5-4 4-5"/>`),
  component('mosfet', 'MOSFET', 'MOSFET', 'semiconductor', `<path ${stroke} d="M3 12h5m2-7v14m3-11v8m0-4h5m0-7v14m0-14h3m-3 14h3"/>`),
  component('opamp', 'Operational amplifier', 'Amplificateur opérationnel', 'semiconductor', `<path ${stroke} d="M4 5v14l13-7L4 5Zm0 4H1m3 6H1m16-3h5M6 9h3M7.5 7.5v3M6 15h3"/>`),
  component('microcontroller', 'Microcontroller', 'Microcontrôleur', 'control', `<rect ${stroke} x="6" y="4" width="12" height="16" rx="2"/><path ${stroke} d="M9 8h6v8H9zM3 7h3M3 12h3M3 17h3m12-10h3m-3 5h3m-3 5h3"/>`),
  component('logic-gate', 'Logic gate', 'Porte logique', 'control', `<path ${stroke} d="M5 5h5c5 0 8 3 8 7s-3 7-8 7H5c3-4 3-10 0-14Zm13 7h4M3 8h4M3 16h4"/>`),
  component('relay', 'Relay', 'Relais', 'control', `<rect ${stroke} x="3" y="7" width="8" height="10" rx="2"/><path ${stroke} d="M11 12h3m0 0 6-5m-6 5 6 5M5 10c3 0 3 4 0 4"/>`),
  component('switch', 'Switch', 'Interrupteur', 'control', `<path ${stroke} d="M3 15h6m6 0h6M9 15l6-6"/><circle cx="9" cy="15" r="1.5" fill="currentColor"/><circle cx="15" cy="15" r="1.5" fill="currentColor"/>`),
  component('sensor', 'Sensor', 'Capteur', 'io', `<circle ${stroke} cx="12" cy="12" r="4"/><path ${stroke} d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2m0-14-2 2M7 17l-2 2"/>`),
  component('motor', 'Motor', 'Moteur', 'io', `<circle ${stroke} cx="12" cy="12" r="7"/><path ${stroke} d="M2 12h3m14 0h3M9 16V8l3 5 3-5v8"/>`),
  component('antenna', 'Antenna', 'Antenne', 'io', `<path ${stroke} d="M12 13v9m-5 0h10M8 9a6 6 0 0 1 8 0M5 6a10 10 0 0 1 14 0"/><circle cx="12" cy="12" r="2" fill="currentColor"/>`),
  component('connector', 'Connector', 'Connecteur', 'io', `<rect ${stroke} x="5" y="4" width="14" height="16" rx="3"/><path ${stroke} d="M9 8v3m6-3v3m-6 5h6"/>`),
  component('battery', 'Battery', 'Batterie', 'power', `<path ${stroke} d="M3 12h5m8 0h5M8 7v10m4-7v4m4-7v10"/>`),
  component('power-supply', 'Power supply', 'Alimentation', 'power', `<rect ${stroke} x="3" y="5" width="18" height="14" rx="3"/><path ${stroke} d="M7 12h4m-2-2v4m5-2h4"/>`),
  component('ground', 'Ground', 'Masse', 'power', `<path ${stroke} d="M12 3v10m-7 0h14m-11 4h8m-5 4h2"/>`),
]

export const getElectronicComponent = (id?: string) => electronicComponents.find(item => item.id === id)
