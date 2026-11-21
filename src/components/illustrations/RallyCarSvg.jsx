export default function RallyCarSvg({ uid }) {
  return (
    <g filter={`url(#${uid}-crayon)`}>
      {/* Dusty rally ground shadow */}
      <ellipse cx="180" cy="184" rx="142" ry="15" fill={`url(#${uid}-shadow)`} />
      <path
        d="M36 187 Q180 194 324 186"
        stroke="#c9bfb2"
        strokeWidth="2.6"
        strokeDasharray="10 6"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />

      {/* Far-side chunky knobby wheels */}
      <circle cx="114" cy="158" r="26" fill="#1f1b24" />
      <circle cx="268" cy="158" r="26" fill="#1f1b24" />

      {/* Red Rally Mudflaps */}
      <path
        d="M72 154 L84 154 L80 174 L68 172 Z"
        fill="#ef4444"
        stroke="#2c2633"
        strokeWidth="2.2"
      />
      <path
        d="M222 156 L232 156 L228 174 L218 172 Z"
        fill="#ef4444"
        stroke="#2c2633"
        strokeWidth="2.2"
      />

      {/* Big Rear Rally Wing / Spoiler */}
      <path
        d="M44 74 L84 74 L88 86 L56 86 Z"
        fill="#facc15"
        stroke="#2c2633"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M58 86 L66 108 L78 108 L74 86 Z"
        fill="#1e3a8a"
        stroke="#2c2633"
        strokeWidth="2.4"
      />

      {/* Roof Air Scoop */}
      <path
        d="M158 68 L184 68 L192 78 L156 78 Z"
        fill="#facc15"
        stroke="#2c2633"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Wide-Body Rally Chassis (Iconic Rally Blue Crayon) */}
      <path
        d="M52 152 L50 118 L72 104 L106 76 C128 70 184 70 206 78 L244 106 L302 112 C314 116 320 130 316 150 L306 158 L58 158 Z"
        fill={`url(#${uid}-rally)`}
        stroke="#2c2633"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />

      {/* Golden Yellow Rally Livery Diagonal Stripes */}
      <path
        d="M62 146 L112 114 L132 114 L82 146 Z"
        fill="#facc15"
        opacity="0.95"
      />
      <path
        d="M94 146 L142 114 L154 114 L106 146 Z"
        fill="#fde047"
        opacity="0.9"
      />
      <path
        d="M242 116 L308 122 L308 130 L242 124 Z"
        fill="#facc15"
        opacity="0.9"
      />

      {/* 3D Side Skirt & Wide Fender Shading */}
      <path
        d="M60 148 L306 148 L304 158 L60 158 Z"
        fill="#1e3a8a"
        opacity="0.55"
      />
      {/* Crayon chalk top-edge highlight */}
      <path
        d="M112 77 Q156 72 200 78"
        stroke="#bfdbfe"
        strokeWidth="3.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <path
        d="M248 109 L298 114"
        stroke="#bfdbfe"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Racing Number Plate on Door */}
      <rect
        x="158"
        y="116"
        width="38"
        height="26"
        rx="4"
        fill="#ffffff"
        stroke="#2c2633"
        strokeWidth="2.4"
      />
      <text
        x="177"
        y="135"
        textAnchor="middle"
        fill="#1e293b"
        fontSize="16"
        fontWeight="900"
        fontFamily="sans-serif"
      >
        07
      </text>

      {/* Rally Cabin Windows with Roll-Cage Bars */}
      <path
        d="M112 82 L156 81 L156 108 L88 108 Z"
        fill="#cbd5e1"
        stroke="#2c2633"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M164 81 L200 82 L236 108 L164 108 Z"
        fill="#cbd5e1"
        stroke="#2c2633"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      {/* Internal Roll Cage Bar */}
      <path
        d="M118 106 L146 83 M176 83 L204 106"
        stroke="#facc15"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Window shine */}
      <path
        d="M132 86 L120 103 M188 86 L176 103"
        stroke="#ffffff"
        strokeWidth="2.8"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Hood Rally Light Pod (Dual High-Beam Auxiliary Lamps!) */}
      <path
        d="M284 110 C288 98 302 98 306 112 Z"
        fill="#1e293b"
        stroke="#2c2633"
        strokeWidth="2.4"
      />
      <circle cx="299" cy="106" r="5.5" fill="#fef08a" stroke="#2c2633" strokeWidth="2" />
      <circle cx="309" cy="108" r="5" fill="#fef08a" stroke="#2c2633" strokeWidth="2" />

      {/* Aggressive Headlight & Tail Light */}
      <path
        d="M298 124 L316 124 L314 134 L296 134 Z"
        fill="#fef08a"
        stroke="#2c2633"
        strokeWidth="2.2"
      />
      <path
        d="M50 118 L62 118 L60 134 L48 132 Z"
        fill="#ef4444"
        stroke="#2c2633"
        strokeWidth="2.2"
      />

      {/* Wide Boxy Wheel Wells */}
      <path d="M74 158 A32 32 0 0 1 138 158" fill="#0f172a" />
      <path d="M228 158 A32 32 0 0 1 292 158" fill="#0f172a" />

      {/* Rear Rally Wheel (Chunky Tire + Iconic Gold Multi-Spoke Rim) */}
      <circle cx="106" cy="158" r="27" fill="#2d2936" stroke="#2c2633" strokeWidth="3.4" />
      <circle cx="106" cy="158" r="16" fill="#eab308" stroke="#2c2633" strokeWidth="2.5" />
      <circle cx="106" cy="158" r="6" fill="#1e293b" stroke="#2c2633" strokeWidth="2" />
      <path
        d="M106 142 L106 174 M90 158 L122 158 M95 147 L117 169 M117 147 L95 169"
        stroke="#fef9c3"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Front Rally Wheel */}
      <circle cx="260" cy="158" r="27" fill="#2d2936" stroke="#2c2633" strokeWidth="3.4" />
      <circle cx="260" cy="158" r="16" fill="#eab308" stroke="#2c2633" strokeWidth="2.5" />
      <circle cx="260" cy="158" r="6" fill="#1e293b" stroke="#2c2633" strokeWidth="2" />
      <path
        d="M260 142 L260 174 M244 158 L276 158 M249 147 L271 169 M271 147 L249 169"
        stroke="#fef9c3"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </g>
  )
}
