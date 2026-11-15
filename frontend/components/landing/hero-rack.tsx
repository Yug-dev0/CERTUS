'use client'

import { useEffect, useRef } from 'react'

/**
 * The hero visual: a technical architectural CAD line drawing of an air-gapped
 * sovereign compute rack enclosure (42U), housing the local GPU inference
 * blades, the cryptographic Ed25519 hardware signing enclave, and the immutable
 * Merkle ledger storage.
 *
 * Swept by a 1px lime scan line, after which the reticle's corner brackets
 * lock onto the local model compute blade (NODE-01) and pin the recorded run's
 * cited regulatory clause to it.
 */
export function HeroRack({ label, note }: { label: string[]; note: string }) {
  const root = useRef<HTMLDivElement>(null)

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
    onScreen = true
    apply()
    if (io) io.observe(el)
    motion.addEventListener('change', apply)
    return () => {
      io?.disconnect()
      motion.removeEventListener('change', apply)
    }
  }, [])

  return (
    <figure ref={root} className="lp-vessel lp-rack">
      <svg
        viewBox="0 0 320 480"
        role="img"
        aria-labelledby="lp-rack-title"
        className="art"
      >
        <title id="lp-rack-title">{`Technical CAD drawing of an air-gapped sovereign compute rack. A reticle marks the local compute blade with the recorded run's cited answer: ${label.join(', ')}.`}</title>
        <defs>
          <linearGradient id="lp-scan-tail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d4f24a" stopOpacity="0" />
            <stop offset="1" stopColor="#d4f24a" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* ============================================================== */}
        {/* 1. CONSTRUCTION & CAD DIMENSION GUIDES                          */}
        {/* ============================================================== */}
        <g className="aux">
          {/* Vertical rack centerline */}
          <path d="M160 16V468" strokeDasharray="14 4 2 4" />

          {/* Left dimension line: 42U total enclosure height */}
          <path d="M34 46V442M28 46H40M28 442H40" />
          <path d="M34 46H72M34 442H72" strokeDasharray="2 3" />

          {/* Width dimension line */}
          <path d="M72 34H248M72 28V40M248 28V40" strokeDasharray="2 3" />
        </g>

        {/* ============================================================== */}
        {/* 2. RACK CHASSIS & EIA-310 VERTICAL POSTS                       */}
        {/* ============================================================== */}
        <g className="body">
          {/* Outer 42U Enclosure Frame */}
          <rect x="72" y="46" width="176" height="396" rx="1" />

          {/* Top roof cowl with exhaust vents */}
          <path d="M72 46H248V38H72Z" />
          <path d="M96 41H126M145 41H175M194 41H224" className="thin" />

          {/* Bottom plinth & leveling castors */}
          <path d="M72 442H248V450H72Z" />
          <path d="M86 450V462H104V450M216 450V462H234V450" className="thin" />
          <path d="M80 462H110M210 462H240" />

          {/* EIA-310 Vertical Equipment Mounting Rails */}
          {/* Left rail */}
          <path d="M82 46V442M88 46V442" className="thin" />
          {/* Right rail */}
          <path d="M232 46V442M238 46V442" className="thin" />
        </g>

        {/* Rail U-unit indexing ticks */}
        <g className="weld">
          <path
            d="
            M83 60H87M83 75H87M83 95H87M83 115H87M83 135H87M83 155H87
            M83 175H87M83 195H87M83 215H87M83 235H87M83 255H87M83 275H87
            M83 295H87M83 315H87M83 335H87M83 355H87M83 375H87M83 395H87M83 415H87M83 435H87
            M233 60H237M233 75H237M233 95H237M233 115H237M233 135H237M233 155H237
            M233 175H237M233 195H237M233 215H237M233 235H237M233 255H237M233 275H237
            M233 295H237M233 315H237M233 335H237M233 355H237M233 375H237M233 395H237M233 415H237M233 435H237
          "
          />
        </g>

        {/* ============================================================== */}
        {/* 3. UNIT 01: PHYSICAL AIR-GAP ISOLATION GATEWAY (GW-01)         */}
        {/* ============================================================== */}
        <g className="body">
          {/* 2U Enclosure */}
          <rect x="88" y="52" width="144" height="44" rx="1" />

          {/* SFP28 optical ports with physical air-gap disconnection break */}
          <rect x="96" y="64" width="12" height="14" className="thin" />
          <rect x="112" y="64" width="12" height="14" className="thin" />
          <line x1="92" y1="71" x2="96" y2="71" className="thin" />
          <line x1="108" y1="71" x2="112" y2="71" className="thin" />

          {/* Prominent physical knife disconnect switch (Open = 0 Egress) */}
          <path d="M132 75H142" />
          <path d="M142 75L154 62" />
          <circle cx="142" cy="75" r="2" />
          <circle cx="158" cy="75" r="2" />
          <path d="M158 75H168" />

          {/* Status LEDs & Hardware Key Lock */}
          <circle cx="184" cy="71" r="2" className="thin" />
          <circle cx="192" cy="71" r="2" className="thin" />
          <circle cx="200" cy="71" r="2" className="thin" />
          <rect x="210" y="66" width="10" height="10" className="thin" />
          <line x1="215" y1="68" x2="215" y2="74" />
        </g>

        {/* ============================================================== */}
        {/* 4. UNIT 02: CRYPTOGRAPHIC REGULATORY HSM (ED25519 ENCLAVE)     */}
        {/* ============================================================== */}
        <g className="body">
          {/* 3U Enclosure */}
          <rect x="88" y="102" width="144" height="54" rx="1" />

          {/* Tamper-evident perimeter seal */}
          <rect x="94" y="108" width="132" height="42" strokeDasharray="3 3" className="thin" />

          {/* Ed25519 Silicon Cryptoprocessor Core */}
          <rect x="144" y="117" width="32" height="24" rx="1" />
          <path d="M150 123L160 135M160 123L150 135" className="thin" />
          <circle cx="160" cy="129" r="2" />

          {/* Secure cryptographic bus lines */}
          <path d="M102 123H138M102 129H138M102 135H138" className="thin" />
          <path d="M182 123H218M182 129H218M182 135H218" className="thin" />

          {/* Physical tamper bolts */}
          <circle cx="98" cy="112" r="1.5" />
          <circle cx="222" cy="112" r="1.5" />
          <circle cx="98" cy="146" r="1.5" />
          <circle cx="222" cy="146" r="1.5" />
        </g>

        {/* ============================================================== */}
        {/* 5. UNIT 03: LOCAL SOVEREIGN ACCELERATOR (NODE-01) [TARGET]     */}
        {/* ============================================================== */}
        <g className="body">
          {/* 6U Compute Chassis */}
          <rect x="88" y="162" width="144" height="106" rx="1" />

          {/* Dual Local GPU / Tensor Core Dies */}
          {/* Die 0: Qwen 2.5 3B Local Weights */}
          <rect x="98" y="180" width="38" height="38" rx="1" />
          <rect x="103" y="185" width="28" height="28" className="thin" />
          <path d="M111 193H123V205H111Z" className="thin" />

          {/* Die 1: Deterministic Verification Engine */}
          <rect x="184" y="180" width="38" height="38" rx="1" />
          <rect x="189" y="185" width="28" height="28" className="thin" />
          <path d="M197 193H209V205H197Z" className="thin" />

          {/* Inter-die NVLink Copper Bus Traces */}
          <path
            d="
            M136 188H184
            M136 194H184
            M136 200H184
            M136 206H184
            M136 212H184
          "
            strokeDasharray="2 2"
            className="thin"
          />

          {/* Lower Cooling Fin Array */}
          <path
            d="
            M98 232H222
            M98 237H222
            M98 242H222
            M98 247H222
            M98 252H222
            M98 257H222
          "
            className="thin"
          />

          {/* Chassis ejection handles on left & right */}
          <path d="M90 172H95V204H90ZM225 172H230V204H225Z" />
        </g>

        {/* The Target Flange on NODE-01: where the reticle locks */}
        <g className="target">
          <path d="M232 206H258V198M232 248H258V256M258 194V260M264 194V260H258" />
          <path d="M264 210H270M264 244H270M270 206V248" className="thin" />
        </g>

        {/* ============================================================== */}
        {/* 6. UNIT 04: IMMUTABLE MERKLE LEDGER NVMe ARRAY (LEDGER-01)     */}
        {/* ============================================================== */}
        <g className="body">
          {/* 4U Storage Enclosure */}
          <rect x="88" y="274" width="144" height="68" rx="1" />

          {/* 8 Hot-Swap NVMe Drive Caddies */}
          <rect x="94" y="284" width="14" height="48" className="thin" />
          <rect x="111" y="284" width="14" height="48" className="thin" />
          <rect x="128" y="284" width="14" height="48" className="thin" />
          <rect x="145" y="284" width="14" height="48" className="thin" />
          <rect x="162" y="284" width="14" height="48" className="thin" />
          <rect x="179" y="284" width="14" height="48" className="thin" />
          <rect x="196" y="284" width="14" height="48" className="thin" />
          <rect x="213" y="284" width="14" height="48" className="thin" />

          {/* Drive activity LEDs and extraction tabs */}
          <path
            d="
            M98 325H104M115 325H121M132 325H138M149 325H155
            M166 325H172M183 325H189M200 325H206M217 325H223
          "
          />
        </g>

        {/* ============================================================== */}
        {/* 7. UNIT 05: ISOLATED POWER DISTRIBUTION UNIT (PSU-A/B)         */}
        {/* ============================================================== */}
        <g className="body">
          {/* Dual Redundant Power Supplies */}
          <rect x="88" y="348" width="69" height="52" rx="1" />
          <rect x="163" y="348" width="69" height="52" rx="1" />

          {/* PSU cooling fan grills */}
          <circle cx="112" cy="374" r="14" className="thin" />
          <circle cx="112" cy="374" r="7" className="thin" />
          <circle cx="187" cy="374" r="14" className="thin" />
          <circle cx="187" cy="374" r="7" className="thin" />

          {/* AC Power connectors */}
          <rect x="135" y="364" width="14" height="20" className="thin" />
          <rect x="210" y="364" width="14" height="20" className="thin" />

          {/* Heavy chassis earthing busbar */}
          <rect x="92" y="414" width="136" height="16" className="thin" />
          <circle cx="106" cy="422" r="2.5" />
          <circle cx="133" cy="422" r="2.5" />
          <circle cx="160" cy="422" r="2.5" />
          <circle cx="187" cy="422" r="2.5" />
          <circle cx="214" cy="422" r="2.5" />
          {/* Chassis ground symbol */}
          <path d="M160 426V434M154 434H166M156 437H164M158 440H162" className="thin" />
        </g>

        {/* ============================================================== */}
        {/* 8. TAGS & CAD CALLOUTS                                         */}
        {/* ============================================================== */}
        <g className="tags">
          <text x="160" y="26" textAnchor="middle">AIR-GAP 42U</text>
          <text x="256" y="76">GW-01</text>
          <text x="256" y="130">HSM-01</text>
          <text x="280" y="194">NODE-01</text>
          <text x="256" y="310">LEDGER</text>
          <text x="22" y="246">42U</text>

          {/* Model badge on compute blade */}
          <rect x="114" y="165" width="92" height="11" />
          <text x="160" y="173" textAnchor="middle">QWEN2.5 3B · SOVEREIGN</text>
        </g>

        {/* ============================================================== */}
        {/* 9. THE SCAN (1px lime line sweeping down)                     */}
        {/* ============================================================== */}
        <g className="scan">
          <rect x="16" y="-32" width="288" height="32" fill="url(#lp-scan-tail)" className="tail" />
          <path d="M16 0H304" />
          <text x="304" y="-5" textAnchor="end" className="scan-label">
            SCAN
          </text>
        </g>

        {/* ============================================================== */}
        {/* 10. THE RETICLE (Four 8px corner brackets locking on NODE-01)  */}
        {/* ============================================================== */}
        <g className="reticle">
          <path d="M228 190V182H236M276 182H284V190M284 262V270H276M236 270H228V262" />
        </g>
      </svg>

      {/* The certified regulatory clause pinned to NODE-01 */}
      <figcaption className="pin">
        <span className="lead" aria-hidden />
        <span className="box">
          {label.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
      </figcaption>

      <p className="note">{note}</p>
    </figure>
  )
}
