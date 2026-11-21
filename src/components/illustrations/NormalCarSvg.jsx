export default function NormalCarSvg({ uid }) {
  return (
    <g filter={`url(#${uid}-crayon)`}>
      {/* Ground contact shadow */}
      <ellipse cx="180" cy="182" rx="134" ry="15" fill={`url(#${uid}-shadow)`} />
      <path
        d="M46 186 Q180 192 314 185"
        stroke="#c9bfb2"
        strokeWidth="2.5"
        strokeDasharray="11 7"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Far-side wheel depth (3D underside wheels) */}
      <circle cx="116" cy="158" r="24" fill="#231f2a" />
      <circle cx="262" cy="158" r="24" fill="#231f2a" />

      {/* Roof Antenna */}
      <path
        d="M114 78 L98 60"
        stroke="#2c2633"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="97" cy="59" r="3" fill="#2c2633" />

      {/* Car Main Rounded Hatchback Body (Sky-Blue Crayon) */}
      <path
        d="M54 152 C48 134 52 110 70 100 L96 76 C110 66 178 64 204 76 L246 106 L288 112 C304 116 312 130 310 148 L304 158 L60 158 Z"
        fill={`url(#${uid}-sky)`}
        stroke="#2c2633"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />

      {/* 3D Roof Top Bevel & Hood Top Plane */}
      <path
        d="M98 76 C118 68 178 67 202 77 L192 82 C168 75 124 76 104 82 Z"
        fill="#e0f2fe"
        opacity="0.85"
      />
      <path
        d="M244 108 L292 114"
        stroke="#e0f2fe"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Lower body 3D contour shadow */}
      <path
        d="M56 146 L306 146 L304 158 L60 158 Z"
        fill="#0284c7"
        opacity="0.4"
      />

      {/* Side Windows (with diagonal chalk reflection) */}
      <path
        d="M104 82 L152 80 L152 110 L84 110 Z"
        fill="#dbeafe"
        stroke="#2c2633"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M162 80 L198 81 L234 108 L162 110 Z"
        fill="#dbeafe"
        stroke="#2c2633"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      {/* Crayon window glare */}
      <path
        d="M116 86 L102 104 M180 86 L168 104 M194 88 L184 104"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Door Split Line & Handles */}
      <path
        d="M156 112 L156 150 M228 112 L228 148"
        stroke="#0369a1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="132" y="120" width="14" height="4.5" rx="2.2" fill="#2c2633" />
      <rect x="174" y="120" width="14" height="4.5" rx="2.2" fill="#2c2633" />

      {/* Side Mirror */}
      <ellipse
        cx="228"
        cy="108"
        rx="8"
        ry="5.5"
        fill={`url(#${uid}-sky)`}
        stroke="#2c2633"
        strokeWidth="2.4"
      />

      {/* Headlight & Tail light */}
      <path
        d="M292 118 C302 118 309 125 308 134 L294 134 C290 128 290 122 292 118 Z"
        fill="#fef08a"
        stroke="#2c2633"
        strokeWidth="2.4"
      />
      <path
        d="M52 116 L64 116 L62 134 L50 132 Z"
        fill="#fb7185"
        stroke="#2c2633"
        strokeWidth="2.4"
      />

      {/* Front & Rear Bumpers */}
      <rect
        x="294"
        y="142"
        width="18"
        height="11"
        rx="5"
        fill="#334155"
        stroke="#2c2633"
        strokeWidth="2.4"
      />
      <rect
        x="48"
        y="142"
        width="16"
        height="11"
        rx="5"
        fill="#334155"
        stroke="#2c2633"
        strokeWidth="2.4"
      />

      {/* Wheel Arches */}
      <path d="M78 158 A30 30 0 0 1 138 158" fill="#1e293b" />
      <path d="M224 158 A30 30 0 0 1 284 158" fill="#1e293b" />

      {/* Near-side Rear Wheel */}
      <circle cx="108" cy="158" r="25" fill="#322e3b" stroke="#2c2633" strokeWidth="3.2" />
      <circle cx="108" cy="158" r="14" fill="#e5e7eb" stroke="#2c2633" strokeWidth="2.4" />
      <circle cx="108" cy="158" r="6" fill="#94a3b8" stroke="#2c2633" strokeWidth="2" />
      <path d="M99 150 A12 12 0 0 1 117 149" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Near-side Front Wheel */}
      <circle cx="254" cy="158" r="25" fill="#322e3b" stroke="#2c2633" strokeWidth="3.2" />
      <circle cx="254" cy="158" r="14" fill="#e5e7eb" stroke="#2c2633" strokeWidth="2.4" />
      <circle cx="254" cy="158" r="6" fill="#94a3b8" stroke="#2c2633" strokeWidth="2" />
      <path d="M245 150 A12 12 0 0 1 263 149" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
  )
}
