export default function SportsCarSvg({ uid }) {
  return (
    <g filter={`url(#${uid}-crayon)`}>
      {/* Wide low-slung contact shadow */}
      <ellipse cx="180" cy="184" rx="148" ry="13" fill={`url(#${uid}-shadow)`} />
      <path
        d="M32 187 Q180 193 328 186"
        stroke="#c9bfb2"
        strokeWidth="2.5"
        strokeDasharray="13 6"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Far-side wide supercar wheels */}
      <circle cx="110" cy="158" r="27" fill="#1a1721" />
      <circle cx="272" cy="158" r="26" fill="#1a1721" />

      {/* Carbon GT Rear Wing */}
      <path
        d="M36 96 L78 92 L82 100 L42 104 Z"
        fill="#1e293b"
        stroke="#2c2633"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M52 102 L60 120 L70 120 L64 100 Z"
        fill="#334155"
        stroke="#2c2633"
        strokeWidth="2.2"
      />

      {/* Low Aerodynamic Supercar Body (Vibrant Sunset Orange-Red Crayon) */}
      <path
        d="M42 154 L44 126 C52 114 78 108 112 104 L148 80 C174 74 214 78 242 102 L308 118 C326 124 332 138 326 152 L314 158 L48 158 Z"
        fill={`url(#${uid}-orange)`}
        stroke="#2c2633"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />

      {/* Carbon Fiber Front Splitter, Side Skirt & Rear Diffuser */}
      <path
        d="M44 150 L322 150 L316 159 L48 159 Z"
        fill="#1e293b"
        stroke="#2c2633"
        strokeWidth="2.4"
      />

      {/* Sculpted Side Air Intake Scoop (3D depth pocket) */}
      <path
        d="M150 124 L202 118 L192 144 L140 144 Z"
        fill="#0f172a"
        stroke="#2c2633"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M154 132 L194 128"
        stroke="#f97316"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Sculpted 3D Haunch & Hood Crayon Highlights */}
      <path
        d="M64 116 Q104 104 140 108"
        stroke="#ffedd5"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.88"
      />
      <path
        d="M154 83 Q188 76 228 94"
        stroke="#ffedd5"
        strokeWidth="3.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <path
        d="M248 109 L308 122"
        stroke="#fed7aa"
        strokeWidth="3.6"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Sweeping Teardrop Coupe Canopy Glass */}
      <path
        d="M126 105 L154 84 C178 79 208 83 236 105 Z"
        fill="#0f172a"
        stroke="#2c2633"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Glass chalk sheen */}
      <path
        d="M158 88 L142 101 M178 86 L160 101 M200 90 L186 101"
        stroke="#94a3b8"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Aero Side Mirror */}
      <path
        d="M214 104 L232 98 L236 106 L216 109 Z"
        fill={`url(#${uid}-orange)`}
        stroke="#2c2633"
        strokeWidth="2.2"
      />

      {/* Sharp Laser Headlight & Sleek LED Tail Strip */}
      <path
        d="M294 124 L322 130 L314 138 L288 134 Z"
        fill="#fef08a"
        stroke="#2c2633"
        strokeWidth="2.2"
      />
      <path
        d="M42 128 L64 124 L62 132 L42 134 Z"
        fill="#ef4444"
        stroke="#2c2633"
        strokeWidth="2.2"
      />

      {/* Wheel Arches */}
      <path d="M68 158 A32 32 0 0 1 134 158" fill="#0f172a" />
      <path d="M232 158 A32 32 0 0 1 296 158" fill="#0f172a" />

      {/* Rear Low-Profile Supercar Wheel with Red Caliper */}
      <circle cx="101" cy="158" r="27" fill="#231f2a" stroke="#2c2633" strokeWidth="3.4" />
      <circle cx="101" cy="158" r="18" fill="#334155" stroke="#e2e8f0" strokeWidth="2.2" />
      <path d="M87 152 L93 152 L92 164 L86 162 Z" fill="#ef4444" />
      <path
        d="M101 140 L101 176 M85 149 L117 167 M117 149 L85 167"
        stroke="#e2e8f0"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="101" cy="158" r="5" fill="#f97316" stroke="#2c2633" strokeWidth="1.8" />

      {/* Front Low-Profile Supercar Wheel with Red Caliper */}
      <circle cx="264" cy="158" r="26" fill="#231f2a" stroke="#2c2633" strokeWidth="3.4" />
      <circle cx="264" cy="158" r="17" fill="#334155" stroke="#e2e8f0" strokeWidth="2.2" />
      <path d="M250 152 L256 152 L255 164 L249 162 Z" fill="#ef4444" />
      <path
        d="M264 141 L264 175 M249 149 L279 167 M279 149 L249 167"
        stroke="#e2e8f0"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="264" cy="158" r="5" fill="#f97316" stroke="#2c2633" strokeWidth="1.8" />
    </g>
  )
}
