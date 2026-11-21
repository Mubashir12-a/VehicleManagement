export default function ScooterSvg({ uid }) {
  return (
    <g filter={`url(#${uid}-crayon)`}>
      {/* Ground contact shadow */}
      <ellipse cx="182" cy="184" rx="108" ry="14" fill={`url(#${uid}-shadow)`} />
      <path
        d="M72 187 Q180 193 292 186"
        stroke="#c9bfb2"
        strokeWidth="2.5"
        strokeDasharray="10 7"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Far-side wheel depth (pseudo-3D thickness) */}
      <circle cx="113" cy="158" r="24" fill="#25212c" />
      <circle cx="251" cy="158" r="24" fill="#25212c" />

      {/* Rear exhaust & suspension */}
      <path
        d="M114 152 L148 158 L146 168 L108 164 Z"
        fill="#6b7280"
        stroke="#2c2633"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <ellipse cx="108" cy="158" rx="4" ry="6" fill="#374151" stroke="#2c2633" strokeWidth="2" />

      {/* Near-side Rear Wheel (chunky 3D tire) */}
      <circle cx="107" cy="160" r="25" fill="#34303d" stroke="#2c2633" strokeWidth="3" />
      <circle cx="107" cy="160" r="15" fill="#d9d5ce" stroke="#2c2633" strokeWidth="2.4" />
      <circle cx="107" cy="160" r="8" fill="#9ca3af" stroke="#2c2633" strokeWidth="2" />
      <path d="M98 152 A14 14 0 0 1 116 150" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />

      {/* Near-side Front Wheel */}
      <circle cx="245" cy="160" r="25" fill="#34303d" stroke="#2c2633" strokeWidth="3" />
      <circle cx="245" cy="160" r="15" fill="#d9d5ce" stroke="#2c2633" strokeWidth="2.4" />
      <circle cx="245" cy="160" r="8" fill="#9ca3af" stroke="#2c2633" strokeWidth="2" />
      <path d="M236 152 A14 14 0 0 1 254 150" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />

      {/* Front fork */}
      <path
        d="M234 96 L245 160"
        stroke="#4b5563"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M234 96 L245 160"
        stroke="#9ca3af"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Scooter Main Body (rounded retro-modern teal crayon shell with 3D shading) */}
      <path
        d="M84 142 C82 110 106 96 144 98 L174 102 C180 124 188 134 214 134 L224 90 C226 82 238 82 246 92 C256 106 254 128 242 146 L232 152 L168 156 L138 156 C112 156 90 152 84 142 Z"
        fill={`url(#${uid}-teal)`}
        stroke="#2c2633"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* 3D underside body shadow */}
      <path
        d="M88 142 C108 152 146 152 228 148 L240 138 C220 144 136 146 92 134 Z"
        fill="#0f766e"
        opacity="0.45"
      />

      {/* Sculpted rear side cowl bulge (3D rounded panel) */}
      <path
        d="M92 132 C94 111 116 104 146 108 C162 110 166 126 158 140 C142 146 106 146 92 132 Z"
        fill="#2dd4bf"
        stroke="#2c2633"
        strokeWidth="2.4"
      />
      {/* Crayon chalk highlight on cowl */}
      <path
        d="M104 117 Q128 110 150 116"
        stroke="#ecfeff"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      {/* Decorative side chrome vents */}
      <path
        d="M112 130 L134 130 M115 136 L132 136"
        stroke="#115e59"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Front Mudguard (rounded 3D fender) */}
      <path
        d="M222 144 C228 124 256 122 268 142 C256 146 236 147 222 144 Z"
        fill={`url(#${uid}-teal)`}
        stroke="#2c2633"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M232 134 Q246 129 258 136"
        stroke="#ccfbf1"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* Floorboard rubber mat */}
      <path
        d="M168 145 L218 143 L214 150 L166 151 Z"
        fill="#334155"
        stroke="#2c2633"
        strokeWidth="2"
      />

      {/* Cushioned Tan Crayon Seat with 3D top bevel */}
      <path
        d="M98 98 C100 84 128 82 162 86 C178 88 184 96 178 104 C150 106 112 106 98 98 Z"
        fill={`url(#${uid}-tan)`}
        stroke="#2c2633"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M109 90 Q140 86 170 91"
        stroke="#fef3c7"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />

      {/* Rear pillion grab rail */}
      <path
        d="M84 96 C78 92 80 84 92 86 L104 88"
        stroke="#cbd5e1"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M84 96 C78 92 80 84 92 86 L104 88"
        stroke="#2c2633"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Tail light */}
      <rect
        x="82"
        y="108"
        width="10"
        height="14"
        rx="4"
        fill="#f43f5e"
        stroke="#2c2633"
        strokeWidth="2.2"
      />

      {/* Front leg-shield highlight */}
      <path
        d="M236 92 C244 104 244 122 234 138"
        stroke="#ccfbf1"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />

      {/* Handlebar cowl & round headlight */}
      <path
        d="M214 74 C216 64 236 62 246 70 L248 86 L220 88 Z"
        fill={`url(#${uid}-teal)`}
        stroke="#2c2633"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <ellipse
        cx="248"
        cy="76"
        rx="7"
        ry="10"
        fill="#fef08a"
        stroke="#2c2633"
        strokeWidth="2.6"
      />
      <ellipse cx="249" cy="73" rx="2.5" ry="4" fill="#ffffff" opacity="0.9" />

      {/* Handlebar grip & mirror */}
      <path
        d="M214 74 L202 76"
        stroke="#2c2633"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <path
        d="M224 65 L218 46 L208 46"
        stroke="#2c2633"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse
        cx="204"
        cy="46"
        rx="9"
        ry="5.5"
        fill="#e0f2fe"
        stroke="#2c2633"
        strokeWidth="2.4"
      />

      {/* Small windscreen visor */}
      <path
        d="M236 64 C240 46 248 42 252 46 C254 54 252 64 246 68 Z"
        fill="#bae6fd"
        fillOpacity="0.6"
        stroke="#2c2633"
        strokeWidth="2.2"
      />
    </g>
  )
}
