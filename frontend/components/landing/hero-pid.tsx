'use client'

import { useEffect, useRef, useState } from 'react'

export type PidMode = 'flow' | 'loto' | 'asme'

interface NodeTelemetry {
  tag: string
  name: string
  type: string
  status: string
  codeRef?: string
  metrics: { k: string; v: string }[]
  note?: string
}

const TELEMETRY_DATA: Record<string, NodeTelemetry> = {
  'V-2104': {
    tag: 'V-2104',
    name: 'Crude Overhead Accumulator',
    type: 'Vertical Pressure Vessel (2:1 Ellipsoidal Heads)',
    status: 'NORMAL · 3.42 BARG · 118.5 °C',
    codeRef: 'ASME Sec VIII Div 1 UG-32(d)',
    metrics: [
      { k: 'MAWP', v: '15.0 barg / 217.5 psig' },
      { k: 'Head t', v: '12.7 mm (ASME UG-32)' },
      { k: 'Joint Eff', v: 'E = 1.0 (RT-1 Full)' },
      { k: 'Interval', v: '≤ 48 mo (SOP-INS-014)' },
    ],
    note: 'Sealed run #16 traced: internal manway inspection requirement validated against plant records.',
  },
  'PSV-2104A': {
    tag: 'PSV-2104A',
    name: 'Vessel Safety Relief Valve',
    type: 'Spring-Loaded Safety Relief (API 526)',
    status: 'CAR SEALED OPEN (CSO) · ACTIVE',
    codeRef: 'ASME Sec VIII Div 1 UG-125 / API 520',
    metrics: [
      { k: 'Set P', v: '14.5 barg' },
      { k: 'Capacity', v: '42,000 kg/h' },
      { k: 'Service', v: 'Overhead Flare Header' },
      { k: 'Recert', v: 'Annual bench test ok' },
    ],
    note: 'Inlet block valve car-sealed open; discharge tied into 4"-FL-2104 relief header.',
  },
  'E-2104': {
    tag: 'E-2104',
    name: 'Crude Overhead Condenser',
    type: 'Shell & Tube Exchanger (TEMA AES)',
    status: 'IN SERVICE · DUTY 14.2 MW',
    codeRef: 'ASME Sec VIII Div 1 / TEMA',
    metrics: [
      { k: 'Inlet T', v: '138.2 °C' },
      { k: 'Outlet T', v: '118.5 °C' },
      { k: 'Cooling', v: 'CW Supply 28 °C' },
      { k: 'ΔP Shell', v: '0.18 bar' },
    ],
    note: 'Condenses heavy naphtha & water vapor before accumulator separation.',
  },
  'PT-2104': {
    tag: 'PT-2104',
    name: 'Vapor Space Pressure Transmitter',
    type: 'Smart Pressure Transmitter (4-20 mA HART)',
    status: '3.42 BARG · LOOP HEALTHY',
    codeRef: 'ISA-5.1 / IEC 61508 SIL-2',
    metrics: [
      { k: 'Span', v: '0 - 20.0 barg' },
      { k: 'Signal', v: '10.8 mA' },
      { k: 'High Alarm', v: '12.0 barg' },
      { k: 'Trip Set', v: '14.2 barg' },
    ],
    note: 'Tapped into top vapor nozzle. Direct trip input to DCS safety interlock.',
  },
  'LT-2104': {
    tag: 'LT-2104',
    name: 'Accumulator Level Transmitter',
    type: 'Guided Wave Radar (Chamber Bridle)',
    status: '62.4 % · NORMAL OPERATING LEVEL',
    codeRef: 'API RP 551',
    metrics: [
      { k: 'Level', v: '62.4 % (1123 mm)' },
      { k: 'High Trip', v: '85.0 %' },
      { k: 'Low Trip', v: '20.0 %' },
      { k: 'Density', v: '715 kg/m³' },
    ],
    note: 'Controls reflux pump rate and naphtha stabilizer feed draw.',
  },
  'TT-2104': {
    tag: 'TT-2104',
    name: 'Overhead Vapor Line Temperature',
    type: 'Duplex Pt100 RTD in Thermowell',
    status: '118.5 °C · STABLE',
    codeRef: 'ASME PTC 19.3 TW',
    metrics: [
      { k: 'Temp', v: '118.5 °C' },
      { k: 'Range', v: '0 - 250 °C' },
      { k: 'Tolerance', v: 'Class A (±0.3 °C)' },
      { k: 'Element', v: 'Duplex 3-wire RTD' },
    ],
    note: 'Downstream of E-2104 condenser before accumulator inlet.',
  },
  'FV-2104': {
    tag: 'FV-2104',
    name: 'Crude Reflux Flow Control Valve',
    type: 'Pneumatic Globe Valve (Fail-Closed)',
    status: 'AUTO · 54.2 % STROKE',
    codeRef: 'IEC 60534 / ISA-75',
    metrics: [
      { k: 'Flow Rate', v: '14.8 m³/h' },
      { k: 'Air Supply', v: '4.2 barg' },
      { k: 'Fail Mode', v: 'Fail Closed (FC)' },
      { k: 'Cv Max', v: '48.5' },
    ],
    note: 'Maintains column top tray temperature via reflux cascade.',
  },
  'P-2104A': {
    tag: 'P-2104A',
    name: 'Crude Reflux & Overhead Pump A',
    type: 'Centrifugal Process Pump (API 610 OH2)',
    status: 'RUNNING · 1480 RPM',
    codeRef: 'API 610 / ISO 13709',
    metrics: [
      { k: 'Discharge P', v: '7.8 barg' },
      { k: 'Differential', v: '4.4 bar' },
      { k: 'Power', v: '11.2 kW' },
      { k: 'Vibration', v: '1.1 mm/s (Good)' },
    ],
    note: 'Duty reflux pump. P-2104B on auto-standby with check valve isolation.',
  },
  'M1': {
    tag: 'M1',
    name: 'Inspection Manway Nozzle',
    type: '24" Class 150 Raised Face Blind Flange',
    status: 'TORQUED & SEALED',
    codeRef: 'ASME Sec VIII Div 1 UG-36 / UG-44',
    metrics: [
      { k: 'Size', v: '24" NPS (600 mm)' },
      { k: 'Rating', v: 'Class 150 RF' },
      { k: 'Gasket', v: 'Spiral Wound 316L/Graphite' },
      { k: 'Compliance', v: 'SOP-INS-014 §2.2 ≤ 48 mo' },
    ],
    note: 'Internal inspection access point locked by certified SOP protocol.',
  },
}

export function HeroPid({ label, note }: { label: string[]; note: string }) {
  const root = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<PidMode>('flow')
  const [activeTag, setActiveTag] = useState<string>('V-2104')

  useEffect(() => {
    const el = root.current
    if (!el) return
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)')
    let onScreen = false
    const apply = () => {
      if (!motion.matches) delete el.dataset.play
      else el.dataset.play = onScreen ? 'on' : 'off'
    }
    const io =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              onScreen = entry.isIntersecting
              apply()
            },
            { threshold: 0.15 },
          )
    if (io) io.observe(el)
    else {
      onScreen = true
      apply()
    }
    motion.addEventListener('change', apply)
    return () => {
      io?.disconnect()
      motion.removeEventListener('change', apply)
    }
  }, [])

  const current = TELEMETRY_DATA[activeTag] ?? TELEMETRY_DATA['V-2104']

  return (
    <figure ref={root} className="lp-pid" data-mode={mode}>
      {/* Interactive Mode Toolbar */}
      <div className="lp-pid-header">
        <div className="lp-pid-meta">
          <span className="lp-pid-live-dot" />
          <span className="lp-pid-tag">PID-2104-01 REV B</span>
          <span className="lp-pid-title">CDU OVERHEAD · V-2104</span>
        </div>
        <div className="lp-pid-modes" role="tablist" aria-label="Diagram display mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'flow'}
            className={`lp-pid-mode-btn ${mode === 'flow' ? 'is-active' : ''}`}
            onClick={() => setMode('flow')}
          >
            FLOW
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'loto'}
            className={`lp-pid-mode-btn ${mode === 'loto' ? 'is-active' : ''}`}
            onClick={() => setMode('loto')}
          >
            LOTO
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'asme'}
            className={`lp-pid-mode-btn ${mode === 'asme' ? 'is-active' : ''}`}
            onClick={() => setMode('asme')}
          >
            ASME
          </button>
        </div>
      </div>

      {/* Primary SVG P&ID Diagram */}
      <svg
        viewBox="0 0 360 480"
        role="img"
        aria-labelledby="lp-pid-svg-title"
        className="lp-pid-art"
      >
        <title id="lp-pid-svg-title">
          Interactive Piping and Instrumentation Diagram (P&ID) for Crude Overhead System V-2104.
        </title>
        <defs>
          <linearGradient id="pid-scan-tail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d4f24a" stopOpacity="0" />
            <stop offset="1" stopColor="#d4f24a" stopOpacity="0.12" />
          </linearGradient>

          {/* Liquid fill gradient inside V-2104 */}
          <linearGradient id="pid-liquid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4f24a" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#d4f24a" stopOpacity="0.16" />
          </linearGradient>

          {/* Flow pulse marker */}
          <marker id="pid-flow-arrow" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#d4f24a" />
          </marker>
        </defs>

        {/* Engineering Background Grid */}
        <g className="lp-pid-grid">
          <line x1="20" y1="0" x2="20" y2="480" />
          <line x1="180" y1="0" x2="180" y2="480" />
          <line x1="340" y1="0" x2="340" y2="480" />
          <line x1="0" y1="76" x2="360" y2="76" />
          <line x1="0" y1="236" x2="360" y2="236" />
          <line x1="0" y1="388" x2="360" y2="388" />
        </g>

        {/* LOTO Safe Isolation Zone Perimeter */}
        {mode === 'loto' && (
          <g className="lp-pid-loto-zone">
            <rect x="94" y="104" width="220" height="236" rx="4" />
            <text x="100" y="117" className="lp-pid-zone-lbl">
              ISOLATION BOUNDARY · LOTO #04
            </text>
            <text x="306" y="334" textAnchor="end" className="lp-pid-zone-sub">
              ZERO ENERGY DEPRESSED
            </text>
          </g>
        )}

        {/* ASME UG-32 Head Thickness Overlay */}
        {mode === 'asme' && (
          <g className="lp-pid-asme-bounds">
            {/* Top 2:1 Ellipsoidal Head Dimension Callout */}
            <path d="M 160 162 H 144 V 176 H 152" stroke="#d4f24a" strokeWidth="1" strokeDasharray="2 2" fill="none" />
            <text x="140" y="166" textAnchor="end" className="lp-pid-calc-lbl">
              ASME UG-32(d) 2:1 HEAD
            </text>
            <text x="140" y="176" textAnchor="end" className="lp-pid-calc-val">
              t = 12.7 mm (MAWP 15 BAR)
            </text>

            {/* Shell Cylinder Course & Radiography */}
            <path d="M 252 208 H 268 M 252 244 H 268" stroke="#d4f24a" strokeWidth="1" strokeDasharray="2 2" />
            <text x="272" y="212" className="lp-pid-calc-val">RT-1 WELD (E=1.0)</text>
            <text x="272" y="222" className="lp-pid-calc-lbl">t_shell = 14.3 mm</text>
          </g>
        )}

        {/* ============================================================== */}
        {/* PIPELINES (Process, Relief, Signal, Instrument)                */}
        {/* ============================================================== */}
        <g className="lp-pid-pipes">
          {/* Main Crude Overhead Vapor Line from C-2101 */}
          <path d="M 16 74 H 142" className="pipe-main" />
          <path d="M 16 74 H 142" className="pipe-pulse" />

          {/* Wash Water Supply Line entering tee at x:68 */}
          <path d="M 68 44 V 74" className="pipe-aux" />

          {/* Line through E-2104 condenser */}
          <path d="M 182 74 H 244 V 154" className="pipe-main" />
          <path d="M 182 74 H 244 V 154" className="pipe-pulse" />

          {/* Cooling water lines for E-2104 */}
          <path d="M 162 44 V 60" className="pipe-cw" />
          <path d="M 162 88 V 104" className="pipe-cw" />

          {/* Relief line from top of V-2104 to PSV-2104A and Flare Header */}
          <path d="M 188 154 V 120 H 16" className="pipe-relief" />
          {mode === 'flow' && <path d="M 188 154 V 120 H 16" className="pipe-relief-pulse" />}

          {/* Vessel centerline */}
          <path d="M 208 142 V 332" className="pipe-centerline" />

          {/* Vessel bottom nozzle N3 to pumps */}
          <path d="M 208 298 V 348 H 88 V 386" className="pipe-main" />
          <path d="M 208 298 V 348 H 88 V 386" className="pipe-pulse" />

          {/* Standby pump P-2104B header branch */}
          <path d="M 208 348 H 272 V 364" className="pipe-aux" />

          {/* Pump discharge and reflux header */}
          <path d="M 100 386 H 344" className="pipe-main" />
          <path d="M 100 386 H 344" className="pipe-pulse" />

          {/* Instrument Signal Lines (dashed) */}
          {/* TT-2104 to line */}
          <line x1="110" y1="58" x2="110" y2="74" className="pipe-signal" />
          {/* PT-2104 to vessel */}
          <line x1="134" y1="184" x2="172" y2="184" className="pipe-signal" />
          {/* LT-2104 bridle taps */}
          <line x1="146" y1="216" x2="172" y2="216" className="pipe-signal" />
          <line x1="146" y1="262" x2="172" y2="262" className="pipe-signal" />
          <line x1="146" y1="216" x2="146" y2="262" className="pipe-bridle" />
          <line x1="134" y1="239" x2="146" y2="239" className="pipe-signal" />
          {/* FT-2104 to FV-2104 loop */}
          <line x1="228" y1="414" x2="228" y2="396" className="pipe-signal" />
        </g>

        {/* ============================================================== */}
        {/* MAJOR EQUIPMENT NODES                                          */}
        {/* ============================================================== */}

        {/* 1. Crude Overhead Condenser E-2104 */}
        <g
          className={`lp-pid-node ${activeTag === 'E-2104' ? 'is-selected' : ''}`}
          onClick={() => setActiveTag('E-2104')}
          tabIndex={0}
          role="button"
          aria-label="Condenser E-2104"
        >
          <circle cx="162" cy="74" r="18" className="equip-body" />
          <path d="M 150 74 Q 156 66 162 74 T 174 74" className="equip-internal" />
          <text x="162" y="100" textAnchor="middle" className="equip-tag">E-2104</text>
        </g>

        {/* 2. Crude Overhead Accumulator V-2104 */}
        <g
          className={`lp-pid-node ${activeTag === 'V-2104' ? 'is-selected' : ''}`}
          onClick={() => setActiveTag('V-2104')}
          tabIndex={0}
          role="button"
          aria-label="Accumulator Vessel V-2104"
        >
          {/* Liquid level fill inside bottom half */}
          <path
            d="M 172 250 H 244 V 276 C 244 298, 172 298, 172 276 Z"
            fill="url(#pid-liquid-grad)"
          />
          {/* Liquid surface wave */}
          <path d="M 172 250 Q 190 248 208 250 T 244 250" className="vessel-liquid-surf" />

          {/* 2:1 Ellipsoidal Heads + Cylindrical Shell */}
          {/* Top head */}
          <path d="M 172 176 C 172 154, 244 154, 244 176 V 276 C 244 298, 172 298, 172 276 Z" className="vessel-shell" />

          {/* Circumferential seam welds */}
          <path d="M 172 210 H 244 M 172 244 H 244" className="vessel-welds" />

          {/* Skirt and Base Ring */}
          <path d="M 184 292 L 180 326 M 232 292 L 236 326" className="vessel-skirt" />
          <path d="M 172 326 H 244 V 331 H 172 Z" className="vessel-base" />

          {/* Nozzles N1 (Top Inlet), N2 (Relief), N3 (Bottom Out) */}
          {/* N1 */}
          <path d="M 238 156 V 166 M 250 156 V 166 M 234 156 H 254" className="nozzle" />
          <text x="250" y="150" className="nozzle-tag">N1</text>
          {/* N2 */}
          <path d="M 182 156 V 166 M 194 156 V 166 M 178 156 H 198" className="nozzle" />
          <text x="188" y="150" className="nozzle-tag">N2</text>
          {/* N3 */}
          <path d="M 202 298 V 306 M 214 298 V 306 M 198 306 H 218" className="nozzle" />
          <text x="222" y="312" className="nozzle-tag">N3</text>

          {/* Vessel Tag Plate */}
          <rect x="188" y="218" width="40" height="15" className="vessel-plate" />
          <text x="208" y="229" textAnchor="middle" className="vessel-plate-txt">V-2104</text>
        </g>

        {/* 3. Manway M1 on V-2104 (Reticle Attachment Point) */}
        <g
          className={`lp-pid-node ${activeTag === 'M1' ? 'is-selected' : ''}`}
          onClick={() => setActiveTag('M1')}
          tabIndex={0}
          role="button"
          aria-label="Manway M1"
        >
          <path d="M 244 231 H 256 V 243 H 244" className="nozzle" />
          <path d="M 256 226 H 261 V 248 H 256 Z" className="manway-flange" />
          <text x="266" y="239" className="manway-tag">M1</text>
        </g>

        {/* 4. Reflux Pump P-2104A */}
        <g
          className={`lp-pid-node ${activeTag === 'P-2104A' ? 'is-selected' : ''}`}
          onClick={() => setActiveTag('P-2104A')}
          tabIndex={0}
          role="button"
          aria-label="Reflux Pump P-2104A"
        >
          <circle cx="88" cy="386" r="12" className="equip-body" />
          <path d="M 82 379 L 96 386 L 82 393 Z" className="pump-impeller" />
          <text x="88" y="410" textAnchor="middle" className="equip-tag">P-2104A</text>
        </g>

        {/* ============================================================== */}
        {/* VALVES & SAFETY RELIEF                                         */}
        {/* ============================================================== */}

        {/* Pressure Safety Valve PSV-2104A */}
        <g
          className={`lp-pid-node ${activeTag === 'PSV-2104A' ? 'is-selected' : ''}`}
          onClick={() => setActiveTag('PSV-2104A')}
          tabIndex={0}
          role="button"
          aria-label="Safety Relief Valve PSV-2104A"
        >
          {/* PSV triangles */}
          <path d="M 183 120 L 193 120 L 188 126 Z" className="valve-body" />
          <path d="M 188 120 L 188 111 L 182 108 L 194 105 L 188 102" className="psv-spring" />
          <circle cx="188" cy="100" r="2.5" className="psv-cap" />
          <text x="188" y="93" textAnchor="middle" className="valve-tag">PSV-2104A</text>
          <text x="150" y="116" textAnchor="end" className="psv-spec">14.5 BARG</text>
        </g>

        {/* Car-Sealed Open Valve CSO on PSV Inlet */}
        <g className="lp-pid-cso">
          <circle cx="188" cy="138" r="4.5" className="cso-ring" />
          <text x="198" y="141" className="cso-txt">CSO</text>
        </g>

        {/* Wash Water Gate Valve GV-2107 & Check Valve CV-2107 */}
        <g className="lp-pid-valves">
          {/* GV-2107 */}
          <path
            d="M 64 54 L 72 62 L 72 54 L 64 62 Z"
            className={mode === 'loto' ? 'valve-locked-out' : 'valve-body'}
          />
          {mode === 'loto' && <rect x="58" y="55" width="5" height="6" className="loto-padlock" />}

          {/* CV-2107 check valve */}
          <path d="M 64 68 L 72 74 L 64 80 Z" className="valve-body" />
        </g>

        {/* Suction Spectacle Blind SB-2104 */}
        <g className="lp-pid-valves">
          <circle cx="120" cy="348" r="4" className={mode === 'loto' ? 'blind-turned' : 'blind-open'} />
          <circle cx="128" cy="348" r="4" className={mode === 'loto' ? 'blind-open' : 'blind-turned'} />
          <line x1="120" y1="344" x2="128" y2="344" stroke="#8a8a82" strokeWidth="1" />
          <text x="124" y="340" textAnchor="middle" className="valve-tag">SB-2104</text>
        </g>

        {/* Pump Suction Isolation Valve GV-2104A */}
        <g className="lp-pid-valves">
          <path
            d="M 148 344 L 158 352 L 158 344 L 148 352 Z"
            className={mode === 'loto' ? 'valve-locked-out' : 'valve-body'}
          />
          {mode === 'loto' && <rect x="142" y="345" width="5" height="6" className="loto-padlock" />}
          <text x="153" y="338" textAnchor="middle" className="valve-tag">GV-2104A</text>
        </g>

        {/* Pump Discharge Check Valve CV-2104 */}
        <g className="lp-pid-valves">
          <path d="M 124 382 L 132 386 L 124 390 Z" className="valve-body" />
          <line x1="132" y1="380" x2="132" y2="392" stroke="#8a8a82" strokeWidth="1.2" />
        </g>

        {/* Flow Control Valve FV-2104 */}
        <g
          className={`lp-pid-node ${activeTag === 'FV-2104' ? 'is-selected' : ''}`}
          onClick={() => setActiveTag('FV-2104')}
          tabIndex={0}
          role="button"
          aria-label="Control Valve FV-2104"
        >
          {/* Diaphragm Actuator */}
          <path d="M 228 386 V 374 M 220 374 C 220 366 236 366 236 374 Z" className="actuator-body" />
          {/* Valve Body */}
          <path d="M 222 382 L 234 390 L 234 382 L 222 390 Z" className="valve-body" />
          <text x="228" y="362" textAnchor="middle" className="valve-tag">FV-2104</text>
          <text x="228" y="399" textAnchor="middle" className="valve-sub">FC (54%)</text>
        </g>

        {/* ============================================================== */}
        {/* INSTRUMENTATION BUBBLES                                        */}
        {/* ============================================================== */}

        {/* Temperature Transmitter TT-2104 */}
        <g
          className={`lp-pid-node ${activeTag === 'TT-2104' ? 'is-selected' : ''}`}
          onClick={() => setActiveTag('TT-2104')}
          tabIndex={0}
          role="button"
          aria-label="Temperature Transmitter TT-2104"
        >
          <circle cx="110" cy="50" r="10" className="inst-bubble" />
          <line x1="100" y1="50" x2="120" y2="50" className="inst-line" />
          <text x="110" y="47" textAnchor="middle" className="inst-txt-top">TT</text>
          <text x="110" y="57" textAnchor="middle" className="inst-txt-btm">2104</text>
          <text x="110" y="36" textAnchor="middle" className="inst-telemetry">118.5°C</text>
        </g>

        {/* Pressure Transmitter PT-2104 */}
        <g
          className={`lp-pid-node ${activeTag === 'PT-2104' ? 'is-selected' : ''}`}
          onClick={() => setActiveTag('PT-2104')}
          tabIndex={0}
          role="button"
          aria-label="Pressure Transmitter PT-2104"
        >
          <circle cx="124" cy="184" r="10" className="inst-bubble" />
          <line x1="114" y1="184" x2="134" y2="184" className="inst-line" />
          <text x="124" y="181" textAnchor="middle" className="inst-txt-top">PT</text>
          <text x="124" y="191" textAnchor="middle" className="inst-txt-btm">2104</text>
          <text x="124" y="170" textAnchor="middle" className="inst-telemetry">3.42 BAR</text>
        </g>

        {/* Level Transmitter LT-2104 */}
        <g
          className={`lp-pid-node ${activeTag === 'LT-2104' ? 'is-selected' : ''}`}
          onClick={() => setActiveTag('LT-2104')}
          tabIndex={0}
          role="button"
          aria-label="Level Transmitter LT-2104"
        >
          <circle cx="124" cy="239" r="10" className="inst-bubble" />
          <line x1="114" y1="239" x2="134" y2="239" className="inst-line" />
          <text x="124" y="236" textAnchor="middle" className="inst-txt-top">LT</text>
          <text x="124" y="246" textAnchor="middle" className="inst-txt-btm">2104</text>
          <text x="124" y="225" textAnchor="middle" className="inst-telemetry">62.4%</text>
        </g>

        {/* Flow Transmitter FT-2104 */}
        <g className="lp-pid-node">
          <circle cx="228" cy="424" r="9" className="inst-bubble" />
          <line x1="219" y1="424" x2="237" y2="424" className="inst-line" />
          <text x="228" y="421" textAnchor="middle" className="inst-txt-top">FT</text>
          <text x="228" y="430" textAnchor="middle" className="inst-txt-btm">2104</text>
          <text x="228" y="442" textAnchor="middle" className="inst-telemetry">14.8 m³/h</text>
        </g>

        {/* Boundary Takeoff Arrows & Service Notes */}
        <g className="lp-pid-boundaries">
          {/* Top Left: From C-2101 */}
          <text x="16" y="66" className="boundary-lbl">FROM C-2101 O/H</text>
          {/* Relief Discharge */}
          <text x="16" y="113" className="boundary-lbl">TO FLARE HEADER</text>
          {/* Wash Water */}
          <text x="68" y="38" textAnchor="middle" className="boundary-lbl">WW-21</text>
          {/* Discharge to Stabilizer */}
          <text x="344" y="380" textAnchor="end" className="boundary-lbl">TO CDU REFLUX & STAB</text>
        </g>

        {/* ============================================================== */}
        {/* THE SCAN & TARGET RETICLE (Matches Certus Landing Aesthetic)    */}
        {/* ============================================================== */}

        {/* Vertical Scan Bar sweeping through diagram */}
        <g className="lp-pid-scan">
          <rect x="8" y="-28" width="344" height="28" fill="url(#pid-scan-tail)" className="scan-tail" />
          <line x1="8" y1="0" x2="352" y2="0" className="scan-line" />
          <text x="348" y="-4" textAnchor="end" className="scan-lbl">SCAN</text>
        </g>

        {/* Target Reticle brackets locking on M1 / V-2104 */}
        <g className="lp-pid-reticle">
          <path d="M 238 214 V 206 H 246 M 274 206 H 282 V 214 M 282 258 V 266 H 274 M 246 266 H 238 V 258" />
        </g>
      </svg>

      {/* The Pin: Certified Regulatory Run Citation pinned to Manway M1 */}
      <figcaption className="lp-pid-pin">
        <span className="lead" aria-hidden />
        <span className="box">
          {label.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
      </figcaption>

      {/* Interactive Telemetry HUD Card (Bottom) */}
      <div className="lp-pid-hud">
        <div className="lp-pid-hud-top">
          <div className="lp-pid-hud-badge">
            <span className="dot" />
            <span className="tag">{current.tag}</span>
            <span className="type">{current.type}</span>
          </div>
          <span className="lp-pid-hud-status">{current.status}</span>
        </div>

        <div className="lp-pid-hud-grid">
          {current.metrics.map((m) => (
            <div key={m.k} className="cell">
              <span className="k">{m.k}</span>
              <span className="v">{m.v}</span>
            </div>
          ))}
        </div>

        {current.note && <div className="lp-pid-hud-note">{current.note}</div>}
      </div>

      <p className="note">{note}</p>
    </figure>
  )
}
