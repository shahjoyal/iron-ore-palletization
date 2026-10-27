/* Furnace / kiln SVG illustrations, unchanged from the original dashboard. */
export function buildFurnaceSVG() {
  return `<svg viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:340px;height:auto;overflow:visible;">
    <defs>
      <radialGradient id="fCoreGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFD54A"/>
        <stop offset="40%" stop-color="#FF6B00"/>
        <stop offset="100%" stop-color="#FF6B00" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="fChamberGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FF6B00" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#5E646B" stop-opacity="0"/>
      </radialGradient>
      <filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="fShadow">
        <feDropShadow dx="0" dy="5" stdDeviation="10" flood-color="rgba(26,48,87,0.15)"/>
      </filter>
    </defs>

    <!-- Ground shadow -->
    <ellipse cx="180" cy="340" rx="130" ry="12" fill="rgba(26,48,87,0.09)"/>

    <!-- ROTATING PLATFORM -->
    <g style="transform-origin:180px 180px;animation:furnaceRotate 40s linear infinite;">

      <!-- Safety railing outer ring -->
      <circle cx="180" cy="180" r="165" fill="none" stroke="#F2B233" stroke-width="3.5" stroke-dasharray="20,12" opacity="0.8"/>

      <!-- Railing posts at 8 positions -->
      <g stroke="#F2B233" stroke-width="2.2" opacity="0.75">
        <line x1="180" y1="15" x2="180" y2="34"/>
        <line x1="297" y1="52" x2="286" y2="68"/>
        <line x1="345" y1="180" x2="326" y2="180"/>
        <line x1="297" y1="308" x2="286" y2="292"/>
        <line x1="180" y1="345" x2="180" y2="326"/>
        <line x1="63" y1="308" x2="74" y2="292"/>
        <line x1="15" y1="180" x2="34" y2="180"/>
        <line x1="63" y1="52" x2="74" y2="68"/>
      </g>

      <!-- Outer ring body -->
      <circle cx="180" cy="180" r="150" fill="#4A4F55" stroke="#3a3f44" stroke-width="2"/>
      <!-- Outer ring top highlight -->
      <path d="M 95 72 A 120 120 0 0 1 265 72" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8"/>

      <!-- PIPE RIGHT -->
      <rect x="320" y="164" width="54" height="32" rx="16" fill="#C2C8CF" stroke="#adb3ba" stroke-width="1.2"/>
      <rect x="320" y="168" width="54" height="8" fill="rgba(255,255,255,0.28)"/>
      <ellipse cx="370" cy="180" rx="11" ry="16" fill="#B5BCC3" stroke="#9da3aa" stroke-width="1"/>
      <!-- steam joint R -->
      <circle cx="320" cy="170" r="2.5" fill="rgba(200,145,42,0.5)" style="animation:steamRise 3s ease-in-out infinite;"/>
      <circle cx="316" cy="176" r="1.8" fill="rgba(200,145,42,0.35)" style="animation:steamRise 3s ease-in-out 0.8s infinite;"/>

      <!-- PIPE LEFT -->
      <rect x="-14" y="164" width="54" height="32" rx="16" fill="#C2C8CF" stroke="#adb3ba" stroke-width="1.2"/>
      <rect x="-14" y="168" width="54" height="8" fill="rgba(255,255,255,0.28)"/>
      <ellipse cx="-10" cy="180" rx="11" ry="16" fill="#B5BCC3" stroke="#9da3aa" stroke-width="1"/>
      <!-- steam joint L -->
      <circle cx="40" cy="170" r="2.5" fill="rgba(200,145,42,0.5)" style="animation:steamRise 3s ease-in-out 1.2s infinite;"/>
      <circle cx="44" cy="177" r="1.8" fill="rgba(200,145,42,0.35)" style="animation:steamRise 3s ease-in-out 1.9s infinite;"/>

      <!-- PIPE BOTTOM -->
      <rect x="164" y="308" width="32" height="56" rx="16" fill="#C2C8CF" stroke="#adb3ba" stroke-width="1.2"/>
      <rect x="168" y="308" width="8" height="56" fill="rgba(255,255,255,0.28)"/>
      <ellipse cx="180" cy="360" rx="16" ry="10" fill="#B5BCC3" stroke="#9da3aa" stroke-width="1"/>
      <!-- steam bottom -->
      <circle cx="170" cy="310" r="2.5" fill="rgba(200,145,42,0.5)" style="animation:steamRise 3s ease-in-out 0.4s infinite;"/>

      <!-- PIPE TOP -->
      <rect x="164" y="-4" width="32" height="50" rx="16" fill="#C2C8CF" stroke="#adb3ba" stroke-width="1.2"/>
      <rect x="168" y="-4" width="8" height="50" fill="rgba(255,255,255,0.28)"/>
      <ellipse cx="180" cy="-4" rx="16" ry="10" fill="#B5BCC3" stroke="#9da3aa" stroke-width="1"/>
      <!-- steam top -->
      <circle cx="190" cy="46" r="2.5" fill="rgba(200,145,42,0.5)" style="animation:steamRise 3s ease-in-out 2s infinite;"/>

      <!-- Support legs -->
      <g fill="#6e747b">
        <rect x="173" y="322" width="14" height="36" rx="3"/>
        <rect x="173" y="-4" width="14" height="36" rx="3"/>
        <rect x="320" y="173" width="14" height="36" rx="3" transform="rotate(90,327,191)"/>
        <rect x="26" y="173" width="14" height="36" rx="3" transform="rotate(90,33,191)"/>
      </g>

      <!-- Main furnace body -->
      <circle cx="180" cy="180" r="130" fill="#5E646B" stroke="#4a4f54" stroke-width="2" filter="url(#fShadow)"/>
      <!-- Body top highlight -->
      <path d="M 88 94 A 110 110 0 0 1 272 94" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="14"/>
      <!-- Body concentric ring -->
      <circle cx="180" cy="180" r="112" fill="none" stroke="rgba(60,68,76,0.6)" stroke-width="2"/>
      <!-- Bolts on rim (12 bolts) -->
      <g fill="#8a9098" opacity="0.8">
        <circle cx="180" cy="52"/><circle cx="244" cy="75"/><circle cx="296" cy="124"/>
        <circle cx="308" cy="180"/><circle cx="296" cy="236"/><circle cx="244" cy="285"/>
        <circle cx="180" cy="308"/><circle cx="116" cy="285"/><circle cx="64" cy="236"/>
        <circle cx="52" cy="180"/><circle cx="64" cy="124"/><circle cx="116" cy="75"/>
      </g>

      <!-- Inner heating chamber -->
      <circle cx="180" cy="180" r="72" fill="#42474d" stroke="#363b40" stroke-width="2.5"/>
      <circle cx="180" cy="180" r="66" fill="#363b40" stroke="rgba(255,107,0,0.3)" stroke-width="1.5"/>
      <circle cx="180" cy="180" r="62" fill="url(#fChamberGlow)"/>
      <!-- Chamber rings -->
      <circle cx="180" cy="180" r="54" fill="none" stroke="rgba(255,107,0,0.2)" stroke-width="1.2"/>
      <circle cx="180" cy="180" r="44" fill="none" stroke="rgba(255,107,0,0.3)" stroke-width="1"/>

      <!-- Core heat glow (pulsing) -->
      <g style="transform-origin:180px 180px;animation:heatPulse 2s ease-in-out infinite;">
        <circle cx="180" cy="180" r="36" fill="url(#fCoreGlow)" opacity="0.9" filter="url(#fGlow)"/>
        <circle cx="180" cy="180" r="24" fill="#FF6B00" opacity="0.95"/>
        <circle cx="180" cy="180" r="16" fill="#FFD54A"/>
        <circle cx="177" cy="177" r="8" fill="rgba(255,255,255,0.75)"/>
      </g>
    </g>

    <!-- Static staircase -->
    <g fill="none" stroke="#F2B233" stroke-width="1.8" opacity="0.7">
      <line x1="150" y1="326" x2="136" y2="352"/>
      <line x1="164" y1="334" x2="150" y2="360"/>
      <line x1="136" y1="340" x2="164" y2="340"/>
      <line x1="136" y1="352" x2="164" y2="352"/>
      <rect x="132" y="350" width="4" height="16" fill="#F2B233"/>
      <rect x="162" y="350" width="4" height="16" fill="#F2B233"/>
    </g>

    <!-- Label -->
    <text x="180" y="26" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="8.5" font-weight="700" fill="rgba(200,145,42,0.85)" letter-spacing="2">INDURATION FURNACE</text>
  </svg>`;
}

export function buildKilnSVG() {
  return `<svg viewBox="0 0 440 230" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;height:auto;overflow:visible;">
    <defs>
      <linearGradient id="kBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#d4d8de"/>
        <stop offset="25%" stop-color="#A1A7AE"/>
        <stop offset="65%" stop-color="#8c9299"/>
        <stop offset="100%" stop-color="#6e7378"/>
      </linearGradient>
      <linearGradient id="kShineGrad" x1="0%" y1="0%" x2="100%" y2="20%">
        <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
        <stop offset="45%" stop-color="rgba(255,255,255,0.38)"/>
        <stop offset="55%" stop-color="rgba(255,255,255,0.22)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
      <radialGradient id="kHeatGrad" cx="38%" cy="50%" r="62%">
        <stop offset="0%" stop-color="#FFD54A"/>
        <stop offset="28%" stop-color="#FF7A00"/>
        <stop offset="65%" stop-color="#c04010"/>
        <stop offset="100%" stop-color="#1e0400"/>
      </radialGradient>
      <radialGradient id="kRollerGrad" cx="33%" cy="30%" r="68%">
        <stop offset="0%" stop-color="#a0a5aa"/>
        <stop offset="100%" stop-color="#48505a"/>
      </radialGradient>
      <filter id="kShadow">
        <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="rgba(26,48,87,0.18)"/>
      </filter>
      <clipPath id="kBodyClip">
        <rect x="62" y="48" width="304" height="120" rx="2"/>
      </clipPath>
    </defs>

    <!-- Ground shadow -->
    <ellipse cx="215" cy="218" rx="185" ry="10" fill="rgba(26,48,87,0.09)"/>

    <!-- BASE FRAME -->
    <rect x="35" y="190" width="372" height="18" rx="3" fill="#444B52" stroke="#2e3338" stroke-width="1"/>
    <rect x="35" y="190" width="372" height="4" fill="rgba(255,255,255,0.1)"/>
    <!-- Frame vertical ribs -->
    <g stroke="#3a4048" stroke-width="0.8" opacity="0.55">
      <line x1="88" y1="190" x2="88" y2="208"/>
      <line x1="150" y1="190" x2="150" y2="208"/>
      <line x1="215" y1="190" x2="215" y2="208"/>
      <line x1="280" y1="190" x2="280" y2="208"/>
      <line x1="345" y1="190" x2="345" y2="208"/>
    </g>

    <!-- ROLLER PEDESTALS -->
    <g fill="#3c4248" stroke="#2a3038" stroke-width="0.7">
      <rect x="72" y="178" width="28" height="14" rx="2"/>
      <rect x="122" y="178" width="28" height="14" rx="2"/>
      <rect x="178" y="178" width="28" height="14" rx="2"/>
      <rect x="228" y="178" width="28" height="14" rx="2"/>
      <rect x="284" y="178" width="28" height="14" rx="2"/>
      <rect x="334" y="178" width="28" height="14" rx="2"/>
    </g>

    <!-- ROLLERS (6) -->
    <g>
      <!-- R1 -->
      <g style="transform-origin:86px 164px;animation:rollerSpin 4s linear infinite;">
        <circle cx="86" cy="164" r="16" fill="url(#kRollerGrad)" stroke="#3a3f44" stroke-width="1"/>
        <line x1="86" y1="150" x2="86" y2="178" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
        <line x1="72" y1="164" x2="100" y2="164" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
        <circle cx="86" cy="164" r="4" fill="#5a6068"/>
      </g>
      <!-- R2 -->
      <g style="transform-origin:136px 164px;animation:rollerSpin 4s linear infinite;">
        <circle cx="136" cy="164" r="16" fill="url(#kRollerGrad)" stroke="#3a3f44" stroke-width="1"/>
        <line x1="136" y1="150" x2="136" y2="178" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
        <line x1="122" y1="164" x2="150" y2="164" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
        <circle cx="136" cy="164" r="4" fill="#5a6068"/>
      </g>
      <!-- R3 -->
      <g style="transform-origin:192px 164px;animation:rollerSpin 4s linear infinite;">
        <circle cx="192" cy="164" r="16" fill="url(#kRollerGrad)" stroke="#3a3f44" stroke-width="1"/>
        <line x1="192" y1="150" x2="192" y2="178" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
        <line x1="178" y1="164" x2="206" y2="164" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
        <circle cx="192" cy="164" r="4" fill="#5a6068"/>
      </g>
      <!-- R4 -->
      <g style="transform-origin:242px 164px;animation:rollerSpin 4s linear infinite;">
        <circle cx="242" cy="164" r="16" fill="url(#kRollerGrad)" stroke="#3a3f44" stroke-width="1"/>
        <line x1="242" y1="150" x2="242" y2="178" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
        <line x1="228" y1="164" x2="256" y2="164" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
        <circle cx="242" cy="164" r="4" fill="#5a6068"/>
      </g>
      <!-- R5 -->
      <g style="transform-origin:298px 164px;animation:rollerSpin 4s linear infinite;">
        <circle cx="298" cy="164" r="16" fill="url(#kRollerGrad)" stroke="#3a3f44" stroke-width="1"/>
        <line x1="298" y1="150" x2="298" y2="178" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
        <line x1="284" y1="164" x2="312" y2="164" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
        <circle cx="298" cy="164" r="4" fill="#5a6068"/>
      </g>
      <!-- R6 -->
      <g style="transform-origin:348px 164px;animation:rollerSpin 4s linear infinite;">
        <circle cx="348" cy="164" r="16" fill="url(#kRollerGrad)" stroke="#3a3f44" stroke-width="1"/>
        <line x1="348" y1="150" x2="348" y2="178" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
        <line x1="334" y1="164" x2="362" y2="164" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
        <circle cx="348" cy="164" r="4" fill="#5a6068"/>
      </g>
    </g>

    <!-- KILN CYLINDER -->
    <g filter="url(#kShadow)">
      <rect x="62" y="48" width="304" height="120" fill="url(#kBodyGrad)"/>
      <!-- Top highlight -->
      <rect x="62" y="48" width="304" height="24" fill="rgba(255,255,255,0.18)"/>
      <!-- Bottom shadow -->
      <rect x="62" y="142" width="304" height="26" fill="rgba(0,0,0,0.15)"/>

      <!-- Animated stripe lines (suggest rotation) -->
      <g clip-path="url(#kBodyClip)">
        <g style="animation:kilnRotate 20s linear infinite;transform-origin:214px 108px;">
          <line x1="62" y1="48" x2="366" y2="48" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
          <line x1="62" y1="72" x2="366" y2="72" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
          <line x1="62" y1="96" x2="366" y2="96" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
          <line x1="62" y1="120" x2="366" y2="120" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
          <line x1="62" y1="144" x2="366" y2="144" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>
          <line x1="62" y1="166" x2="366" y2="166" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
        </g>
      </g>

      <!-- Metallic shine sweep -->
      <rect x="62" y="48" width="304" height="120" fill="url(#kShineGrad)" clip-path="url(#kBodyClip)" style="animation:shineSwipe 4s linear infinite;"/>

      <!-- Support rings (3 rings, static) -->
      <rect x="120" y="48" width="22" height="120" fill="#686E74" stroke="#565c62" stroke-width="1"/>
      <rect x="120" y="48" width="22" height="7" fill="rgba(255,255,255,0.22)"/>
      <rect x="220" y="48" width="22" height="120" fill="#686E74" stroke="#565c62" stroke-width="1"/>
      <rect x="220" y="48" width="22" height="7" fill="rgba(255,255,255,0.22)"/>
      <rect x="322" y="48" width="22" height="120" fill="#686E74" stroke="#565c62" stroke-width="1"/>
      <rect x="322" y="48" width="22" height="7" fill="rgba(255,255,255,0.22)"/>

      <!-- LEFT endcap heat zone -->
      <ellipse cx="62" cy="108" rx="18" ry="60" fill="url(#kHeatGrad)" stroke="#2a0800" stroke-width="1.2" style="animation:heatGlow 2s ease-in-out infinite;"/>
      <!-- Heat bloom -->
      <ellipse cx="62" cy="108" rx="28" ry="68" fill="rgba(255,122,0,0.14)" style="animation:heatGlow 2s ease-in-out infinite;"/>

      <!-- RIGHT endcap -->
      <ellipse cx="366" cy="108" rx="15" ry="60" fill="#7e8490" stroke="#5a6068" stroke-width="1.2"/>
      <ellipse cx="366" cy="108" rx="9" ry="44" fill="#6a7078"/>
      <ellipse cx="366" cy="108" rx="5" ry="26" fill="#5a6068"/>
      <!-- Exit bolts -->
      <g fill="#9ea3a8" opacity="0.65">
        <circle cx="366" cy="50" r="2.5"/>
        <circle cx="378" cy="68" r="2.5"/>
        <circle cx="380" cy="90" r="2.5"/>
        <circle cx="380" cy="126" r="2.5"/>
        <circle cx="378" cy="148" r="2.5"/>
        <circle cx="366" cy="166" r="2.5"/>
        <circle cx="354" cy="148" r="2.5"/>
        <circle cx="352" cy="108" r="2.5"/>
        <circle cx="354" cy="68" r="2.5"/>
      </g>
    </g>

    <!-- Label -->
    <text x="215" y="24" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="8.5" font-weight="700" fill="rgba(200,145,42,0.85)" letter-spacing="2">GRATE KILN</text>
  </svg>`;
}

