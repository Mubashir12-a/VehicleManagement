export default function NormalBikeSvg({ uid }) {
  return (
    <g filter={`url(#${uid}-crayon)`}>
      {/* Ground contact shadow */}
      <ellipse cx="180" cy="185" rx="116" ry="13" fill={`url(#${uid}-shadow)`} />
      <path
        d="M62 188 Q180 194 298 186"
        stroke="#c9bfb2"
        strokeWidth="2.5"
        strokeDasharray="11 7"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Far-side tire thickness (3D depth) */}
      <circle cx="104" cy="153" r="30" fill="#231f2a" />
      <circle cx="260" cy="153" r="30" fill="#231f2a" />

      {/* Rear Wheel */}
      <circle cx="98" cy="155" r="31" fill="#322e3b" stroke="#2c2633" strokeWidth="3.2" />
      <circle cx="98" cy="155" r="20" fill="#e5e7eb" stroke="#2c2633" strokeWidth="2.5" />
      <circle cx="98" cy="155" r="7" fill="#64748b" stroke="#2c2633" strokeWidth="2.2" />
      <path
        d="M98 135 L98 175 M78 155 L118 155 M84 141 L112 169 M112 141 L84 169"
        stroke="#475569"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Front Wheel */}
      <circle cx="254" cy="155" r="31" fill="#322e3b" stroke="#2c2633" strokeWidth="3.2" />
      <circle cx="254" cy="155" r="20" fill="#e5e7eb" stroke="#2c2633" strokeWidth="2.5" />
      <circle cx="254" cy="155" r="11" fill="#cbd5e1" stroke="#475569" strokeWidth="1.6" strokeDasharray="3 2" />
      <circle cx="254" cy="155" r="6.5" fill="#64748b" stroke="#2c2633" strokeWidth="2.2" />
      <path
        d="M254 135 L254 175 M234 155 L274 155 M240 141 L268 169 M268 141 L240 169"
        stroke="#475569"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Swingarm & Engine Block (layered 3D metal block) */}
      <path
        d="M98 155 L164 150 L164 140 L102 148 Z"
        fill="#64748b"
        stroke="#2c2633"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <rect
        x="154"
        y="112"
        width="54"
        height="44"
        rx="10"
        fill="#94a3b8"
        stroke="#2c2633"
        strokeWidth="2.8"
      />
      {/* Engine cooling fins */}
      <path
        d="M162 122 L200 122 M162 129 L200 129 M162 136 L200 136"
        stroke="#334155"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="178" cy="147" r="9" fill="#cbd5e1" stroke="#2c2633" strokeWidth="2.2" />

      {/* Tubular Frame */}
      <path
        d="M148 104 L216 90 L204 148 L156 148 Z"
        fill="none"
        stroke="#334155"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Exhaust Pipe (chrome crayon bevel) */}
      <path
        d="M196 144 C198 158 184 162 164 162 L92 154 L90 143 L166 152 C180 152 188 150 188 140 Z"
        fill="#cbd5e1"
        stroke="#2c2633"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M96 147 L160 155"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Rear shock absorber */}
      <path
        d="M114 148 L128 112"
        stroke="#f59e0b"
        strokeWidth="5.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <path d="M114 148 L128 112" stroke="#2c2633" strokeWidth="2" />

      {/* Front Telescopic Fork */}
      <path
        d="M214 78 L254 155"
        stroke="#475569"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M214 78 L254 155"
        stroke="#e2e8f0"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Front & Rear Fenders */}
      <path
        d="M226 130 C240 116 268 118 282 134 C268 131 244 130 226 130 Z"
        fill={`url(#${uid}-blue)`}
        stroke="#2c2633"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M68 122 C82 106 112 106 128 118 L112 122 C96 116 82 118 68 122 Z"
        fill={`url(#${uid}-blue)`}
        stroke="#2c2633"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Side Panel under seat */}
      <path
        d="M126 106 L168 106 L162 128 L134 128 Z"
        fill="#1e3a8a"
        stroke="#2c2633"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Teardrop Fuel Tank (Cobalt Blue Crayon with 3D highlight) */}
      <path
        d="M162 102 C164 80 198 74 222 86 C230 92 226 108 210 112 L168 110 Z"
        fill={`url(#${uid}-blue)`}
        stroke="#2c2633"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* 3D tank underside shadow */}
      <path
        d="M168 106 L214 106 C220 104 224 100 224 96 C214 103 184 104 166 102 Z"
        fill="#1d4ed8"
        opacity="0.5"
      />
      {/* Chalky crayon shine on tank */}
      <path
        d="M174 88 Q196 81 214 89"
        stroke="#dbeafe"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Flat Commuter Seat */}
      <path
        d="M90 100 C94 92 132 94 166 98 C170 104 164 110 156 110 L96 110 C88 110 86 104 90 100 Z"
        fill="#3f3f46"
        stroke="#2c2633"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M98 98 Q130 98 158 101"
        stroke="#a1a1aa"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />

      {/* Tail light */}
      <rect
        x="76"
        y="102"
        width="10"
        height="10"
        rx="3"
        fill="#ef4444"
        stroke="#2c2633"
        strokeWidth="2.2"
      />

      {/* Upright Handlebars & Mirror */}
      <path
        d="M214 78 L204 62 L188 64"
        stroke="#2c2633"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M206 62 L202 46 L192 46"
        stroke="#2c2633"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse
        cx="188"
        cy="46"
        rx="8"
        ry="5"
        fill="#e0f2fe"
        stroke="#2c2633"
        strokeWidth="2.2"
      />

      {/* Classic Round Headlight */}
      <path
        d="M226 78 C236 74 246 80 246 90 C246 99 236 104 226 100 Z"
        fill="#334155"
        stroke="#2c2633"
        strokeWidth="2.6"
      />
      <ellipse
        cx="244"
        cy="89"
        rx="5.5"
        ry="10"
        fill="#fef08a"
        stroke="#2c2633"
        strokeWidth="2.4"
      />
      <ellipse cx="245" cy="86" rx="2" ry="4" fill="#ffffff" />
    </g>
  )
}
