export default function SportsBikeSvg({ uid }) {
  return (
    <g filter={`url(#${uid}-crayon)`}>
      {/* Ground contact shadow */}
      <ellipse cx="182" cy="186" rx="122" ry="13" fill={`url(#${uid}-shadow)`} />
      <path
        d="M56 189 Q182 194 304 186"
        stroke="#c9bfb2"
        strokeWidth="2.5"
        strokeDasharray="12 6"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Far-side wide racing slick tires (pseudo-3D width) */}
      <circle cx="104" cy="152" r="32" fill="#1e1b24" />
      <circle cx="268" cy="152" r="31" fill="#1e1b24" />

      {/* Rear Wide Racing Wheel */}
      <circle cx="96" cy="154" r="32" fill="#2d2936" stroke="#2c2633" strokeWidth="3.2" />
      <circle cx="96" cy="154" r="20" fill="#1f2937" stroke="#f43f5e" strokeWidth="2.8" />
      <circle cx="96" cy="154" r="11" fill="#94a3b8" stroke="#2c2633" strokeWidth="2" />
      <path
        d="M96 134 L96 174 M78 144 L114 164 M114 144 L78 164"
        stroke="#e2e8f0"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Front Racing Wheel with Dual Disc Brake & Gold Caliper */}
      <circle cx="260" cy="154" r="31" fill="#2d2936" stroke="#2c2633" strokeWidth="3.2" />
      <circle cx="260" cy="154" r="19" fill="#1f2937" stroke="#f43f5e" strokeWidth="2.8" />
      <circle cx="260" cy="154" r="13" fill="none" stroke="#cbd5e1" strokeWidth="2.8" strokeDasharray="5 3" />
      <path d="M244 150 L252 150 L250 162 L242 160 Z" fill="#f59e0b" stroke="#2c2633" strokeWidth="1.8" />
      <circle cx="260" cy="154" r="6" fill="#e2e8f0" stroke="#2c2633" strokeWidth="2" />

      {/* Beefy Aluminum Swingarm */}
      <path
        d="M96 154 L162 148 L158 134 L96 144 Z"
        fill="#94a3b8"
        stroke="#2c2633"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* Upswept Carbon Racing Exhaust */}
      <path
        d="M164 156 L112 134 L116 122 L172 146 Z"
        fill="#334155"
        stroke="#2c2633"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M112 134 L106 126 L112 120 L118 124 Z" fill="#cbd5e1" stroke="#2c2633" strokeWidth="2.2" />

      {/* Inverted Gold Front Forks */}
      <path
        d="M228 84 L260 154"
        stroke="#d97706"
        strokeWidth="8.5"
        strokeLinecap="round"
      />
      <path
        d="M228 84 L260 154"
        stroke="#fef08a"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Front Aero Fender */}
      <path
        d="M234 128 C252 116 276 120 288 134 C272 130 250 130 234 128 Z"
        fill={`url(#${uid}-red)`}
        stroke="#2c2633"
        strokeWidth="2.5"
      />

      {/* Belly Pan & Full Aerodynamic Side Fairing (Fiery Red Crayon) */}
      <path
        d="M150 152 L228 148 L244 120 L264 98 C256 80 236 74 214 78 L184 94 L164 114 Z"
        fill={`url(#${uid}-red)`}
        stroke="#2c2633"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Lower belly pan dark charcoal contrast */}
      <path
        d="M152 152 L224 148 L234 134 L166 138 Z"
        fill="#1e293b"
        stroke="#2c2633"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Side fairing air vent gills */}
      <path
        d="M196 116 L220 108 L214 126 L190 132 Z"
        fill="#1e293b"
        stroke="#2c2633"
        strokeWidth="2.2"
      />
      {/* Crayon speed stripe & highlight */}
      <path
        d="M178 108 L248 90"
        stroke="#fecdd3"
        strokeWidth="4.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M204 126 L236 114"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Sculpted Muscular Fuel Tank */}
      <path
        d="M148 104 C156 80 188 74 218 82 L210 102 L156 108 Z"
        fill={`url(#${uid}-red)`}
        stroke="#2c2633"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M164 88 Q188 80 210 86"
        stroke="#ffe4e6"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />

      {/* Sharp Upswept Racing Tail Cowl */}
      <path
        d="M66 80 L138 96 L146 110 L96 106 Z"
        fill={`url(#${uid}-red)`}
        stroke="#2c2633"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M78 86 L128 96"
        stroke="#fecdd3"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Split Racing Rider Saddle */}
      <path
        d="M116 96 C130 104 148 106 164 102 L156 112 L116 106 Z"
        fill="#1e293b"
        stroke="#2c2633"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* Tinted Bubble Windscreen */}
      <path
        d="M220 78 C232 58 250 56 260 72 L252 84 Z"
        fill="#0f172a"
        fillOpacity="0.78"
        stroke="#2c2633"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M230 72 Q242 64 252 70"
        stroke="#94a3b8"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Aggressive Slanted LED Headlight */}
      <path
        d="M248 92 L264 90 L258 100 L244 100 Z"
        fill="#fef08a"
        stroke="#2c2633"
        strokeWidth="2.2"
      />

      {/* Low Clip-on Handlebar & Aero Mirror */}
      <path
        d="M214 82 L202 84"
        stroke="#2c2633"
        strokeWidth="4.8"
        strokeLinecap="round"
      />
      <path
        d="M244 70 L252 54"
        stroke="#2c2633"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M246 54 L262 52 L258 58 L244 58 Z"
        fill="#1e293b"
        stroke="#2c2633"
        strokeWidth="2"
      />
    </g>
  )
}
