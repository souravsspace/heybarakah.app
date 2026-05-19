import type { ReactNode } from "react";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

const BARAKAH_GREEN = "#29603E";

interface MeshProps {
  dark: boolean;
}

function MeshShell({ children }: { children: ReactNode }) {
  return (
    <Svg
      height="100%"
      pointerEvents="none"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }}
      viewBox="0 0 320 220"
      width="100%"
    >
      {children}
    </Svg>
  );
}

export function HomeMesh({ dark }: MeshProps) {
  if (dark) {
    return (
      <MeshShell>
        <Defs>
          <RadialGradient cx="18%" cy="6%" id="homeDarkNorth" r="72%">
            <Stop offset="0" stopColor="#DDE8E1" stopOpacity={0.2} />
            <Stop offset="0.48" stopColor={BARAKAH_GREEN} stopOpacity={0.34} />
            <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="92%" cy="0%" id="homeDarkEast" r="72%">
            <Stop offset="0" stopColor="#F7F9F7" stopOpacity={0.04} />
            <Stop offset="0.5" stopColor={BARAKAH_GREEN} stopOpacity={0.2} />
            <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="92%" cy="106%" id="homeDarkSouth" r="78%">
            <Stop offset="0" stopColor={BARAKAH_GREEN} stopOpacity={0.42} />
            <Stop offset="0.58" stopColor={BARAKAH_GREEN} stopOpacity={0.16} />
            <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="0%" cy="88%" id="homeDarkPaper" r="76%">
            <Stop offset="0" stopColor="#111816" stopOpacity={0.28} />
            <Stop offset="0.6" stopColor="#111816" stopOpacity={0.12} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect fill="#0E1311" height="220" width="320" x="0" y="0" />
        <Rect fill="url(#homeDarkNorth)" height="220" width="320" x="0" y="0" />
        <Rect fill="url(#homeDarkEast)" height="220" width="320" x="0" y="0" />
        <Rect fill="url(#homeDarkSouth)" height="220" width="320" x="0" y="0" />
        <Rect fill="url(#homeDarkPaper)" height="220" width="320" x="0" y="0" />
      </MeshShell>
    );
  }
  return (
    <MeshShell>
      <Defs>
        <RadialGradient cx="14%" cy="-4%" id="homeLightDawn" r="78%">
          <Stop offset="0" stopColor="#FAF7F0" stopOpacity={0.95} />
          <Stop offset="0.55" stopColor="#FAF7F0" stopOpacity={0.32} />
          <Stop offset="1" stopColor="#FAF7F0" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient cx="98%" cy="-6%" id="homeLightTopRight" r="62%">
          <Stop offset="0" stopColor={BARAKAH_GREEN} stopOpacity={0.16} />
          <Stop offset="0.5" stopColor={BARAKAH_GREEN} stopOpacity={0.06} />
          <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient cx="2%" cy="106%" id="homeLightBottomLeft" r="62%">
          <Stop offset="0" stopColor={BARAKAH_GREEN} stopOpacity={0.16} />
          <Stop offset="0.5" stopColor={BARAKAH_GREEN} stopOpacity={0.06} />
          <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect fill="#F8FAF8" height="220" width="320" x="0" y="0" />
      <Rect fill="url(#homeLightDawn)" height="220" width="320" x="0" y="0" />
      <Rect
        fill="url(#homeLightTopRight)"
        height="220"
        width="320"
        x="0"
        y="0"
      />
      <Rect
        fill="url(#homeLightBottomLeft)"
        height="220"
        width="320"
        x="0"
        y="0"
      />
    </MeshShell>
  );
}

export function ProfileMesh({ dark }: MeshProps) {
  if (dark) {
    return (
      <MeshShell>
        <Defs>
          <RadialGradient cx="92%" cy="-8%" id="profileDarkDome" r="74%">
            <Stop offset="0" stopColor={BARAKAH_GREEN} stopOpacity={0.3} />
            <Stop offset="0.5" stopColor={BARAKAH_GREEN} stopOpacity={0.12} />
            <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="6%" cy="-4%" id="profileDarkMist" r="60%">
            <Stop offset="0" stopColor="#DDE8E1" stopOpacity={0.07} />
            <Stop offset="0.5" stopColor="#DDE8E1" stopOpacity={0.03} />
            <Stop offset="1" stopColor="#DDE8E1" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="50%" cy="110%" id="profileDarkPaper" r="70%">
            <Stop offset="0" stopColor="#111816" stopOpacity={0.3} />
            <Stop offset="0.6" stopColor="#111816" stopOpacity={0.1} />
            <Stop offset="1" stopColor="#111816" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect fill="#0B0E0C" height="220" width="320" x="0" y="0" />
        <Rect
          fill="url(#profileDarkDome)"
          height="220"
          width="320"
          x="0"
          y="0"
        />
        <Rect
          fill="url(#profileDarkMist)"
          height="220"
          width="320"
          x="0"
          y="0"
        />
        <Rect
          fill="url(#profileDarkPaper)"
          height="220"
          width="320"
          x="0"
          y="0"
        />
      </MeshShell>
    );
  }
  return (
    <MeshShell>
      <Defs>
        <RadialGradient cx="50%" cy="-12%" id="profileLightDome" r="82%">
          <Stop offset="0" stopColor="#FAF7F0" stopOpacity={0.92} />
          <Stop offset="0.5" stopColor="#FAF7F0" stopOpacity={0.38} />
          <Stop offset="1" stopColor="#FAF7F0" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient cx="0%" cy="108%" id="profileLightCorner" r="58%">
          <Stop offset="0" stopColor={BARAKAH_GREEN} stopOpacity={0.14} />
          <Stop offset="0.5" stopColor={BARAKAH_GREEN} stopOpacity={0.05} />
          <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect fill="#F8FAF8" height="220" width="320" x="0" y="0" />
      <Rect
        fill="url(#profileLightDome)"
        height="220"
        width="320"
        x="0"
        y="0"
      />
      <Rect
        fill="url(#profileLightCorner)"
        height="220"
        width="320"
        x="0"
        y="0"
      />
    </MeshShell>
  );
}

export function LockedMesh({ dark }: MeshProps) {
  if (dark) {
    return (
      <MeshShell>
        <Defs>
          <RadialGradient
            cx="50%"
            cy="20%"
            id="lockedDarkColumn"
            rx="44%"
            ry="88%"
          >
            <Stop offset="0" stopColor="#C8D2CC" stopOpacity={0.08} />
            <Stop offset="0.5" stopColor="#C8D2CC" stopOpacity={0.03} />
            <Stop offset="1" stopColor="#C8D2CC" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient
            cx="50%"
            cy="110%"
            id="lockedDarkFloor"
            rx="80%"
            ry="40%"
          >
            <Stop offset="0" stopColor="#000000" stopOpacity={0.5} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect fill="#0B0E0C" height="220" width="320" x="0" y="0" />
        <Rect
          fill="url(#lockedDarkColumn)"
          height="220"
          width="320"
          x="0"
          y="0"
        />
        <Rect
          fill="url(#lockedDarkFloor)"
          height="220"
          width="320"
          x="0"
          y="0"
        />
      </MeshShell>
    );
  }
  return (
    <MeshShell>
      <Defs>
        <RadialGradient
          cx="50%"
          cy="28%"
          id="lockedLightColumn"
          rx="48%"
          ry="92%"
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.85} />
          <Stop offset="0.5" stopColor="#FAF7F0" stopOpacity={0.32} />
          <Stop offset="1" stopColor="#FAF7F0" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient
          cx="50%"
          cy="108%"
          id="lockedLightFloor"
          rx="80%"
          ry="32%"
        >
          <Stop offset="0" stopColor={BARAKAH_GREEN} stopOpacity={0.12} />
          <Stop offset="0.6" stopColor={BARAKAH_GREEN} stopOpacity={0.04} />
          <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect fill="#F4F6F4" height="220" width="320" x="0" y="0" />
      <Rect
        fill="url(#lockedLightColumn)"
        height="220"
        width="320"
        x="0"
        y="0"
      />
      <Rect
        fill="url(#lockedLightFloor)"
        height="220"
        width="320"
        x="0"
        y="0"
      />
    </MeshShell>
  );
}

export function DhikrMesh({ dark }: MeshProps) {
  if (dark) {
    return (
      <MeshShell>
        <Defs>
          <RadialGradient cx="50%" cy="0%" id="dhikrDarkMoon" r="58%">
            <Stop offset="0" stopColor={BARAKAH_GREEN} stopOpacity={0.32} />
            <Stop offset="0.55" stopColor={BARAKAH_GREEN} stopOpacity={0.1} />
            <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="50%" cy="-4%" id="dhikrDarkMist" r="78%">
            <Stop offset="0" stopColor="#DDE8E1" stopOpacity={0.08} />
            <Stop offset="0.6" stopColor="#DDE8E1" stopOpacity={0.02} />
            <Stop offset="1" stopColor="#DDE8E1" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect fill="#0B0E0C" height="220" width="320" x="0" y="0" />
        <Rect fill="url(#dhikrDarkMist)" height="220" width="320" x="0" y="0" />
        <Rect fill="url(#dhikrDarkMoon)" height="220" width="320" x="0" y="0" />
      </MeshShell>
    );
  }
  return (
    <MeshShell>
      <Defs>
        <RadialGradient cx="50%" cy="-6%" id="dhikrLightHalo" r="74%">
          <Stop offset="0" stopColor="#FAF7F0" stopOpacity={0.92} />
          <Stop offset="0.55" stopColor="#FAF7F0" stopOpacity={0.34} />
          <Stop offset="1" stopColor="#FAF7F0" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient cx="50%" cy="2%" id="dhikrLightCrown" r="38%">
          <Stop offset="0" stopColor={BARAKAH_GREEN} stopOpacity={0.12} />
          <Stop offset="0.6" stopColor={BARAKAH_GREEN} stopOpacity={0.04} />
          <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect fill="#F8FAF8" height="220" width="320" x="0" y="0" />
      <Rect fill="url(#dhikrLightHalo)" height="220" width="320" x="0" y="0" />
      <Rect fill="url(#dhikrLightCrown)" height="220" width="320" x="0" y="0" />
    </MeshShell>
  );
}

export function RecordMesh({ dark }: MeshProps) {
  if (dark) {
    return (
      <MeshShell>
        <Defs>
          <RadialGradient
            cx="-4%"
            cy="50%"
            id="recordDarkMargin"
            rx="62%"
            ry="88%"
          >
            <Stop offset="0" stopColor="#1A2422" stopOpacity={0.6} />
            <Stop offset="0.6" stopColor="#1A2422" stopOpacity={0.18} />
            <Stop offset="1" stopColor="#1A2422" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="106%" cy="106%" id="recordDarkCorner" r="48%">
            <Stop offset="0" stopColor={BARAKAH_GREEN} stopOpacity={0.22} />
            <Stop offset="0.6" stopColor={BARAKAH_GREEN} stopOpacity={0.06} />
            <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect fill="#0B0E0C" height="220" width="320" x="0" y="0" />
        <Rect
          fill="url(#recordDarkMargin)"
          height="220"
          width="320"
          x="0"
          y="0"
        />
        <Rect
          fill="url(#recordDarkCorner)"
          height="220"
          width="320"
          x="0"
          y="0"
        />
      </MeshShell>
    );
  }
  return (
    <MeshShell>
      <Defs>
        <RadialGradient
          cx="-4%"
          cy="50%"
          id="recordLightMargin"
          rx="68%"
          ry="92%"
        >
          <Stop offset="0" stopColor="#FAF7F0" stopOpacity={0.9} />
          <Stop offset="0.6" stopColor="#FAF7F0" stopOpacity={0.3} />
          <Stop offset="1" stopColor="#FAF7F0" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient cx="106%" cy="-4%" id="recordLightCorner" r="44%">
          <Stop offset="0" stopColor={BARAKAH_GREEN} stopOpacity={0.12} />
          <Stop offset="0.6" stopColor={BARAKAH_GREEN} stopOpacity={0.04} />
          <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect fill="#F8FAF8" height="220" width="320" x="0" y="0" />
      <Rect
        fill="url(#recordLightMargin)"
        height="220"
        width="320"
        x="0"
        y="0"
      />
      <Rect
        fill="url(#recordLightCorner)"
        height="220"
        width="320"
        x="0"
        y="0"
      />
    </MeshShell>
  );
}

export function ProgressMesh({ dark }: MeshProps) {
  if (dark) {
    return (
      <MeshShell>
        <Defs>
          <RadialGradient cx="-8%" cy="112%" id="progressDarkSweep" r="118%">
            <Stop offset="0" stopColor={BARAKAH_GREEN} stopOpacity={0.32} />
            <Stop offset="0.4" stopColor={BARAKAH_GREEN} stopOpacity={0.1} />
            <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="104%" cy="-4%" id="progressDarkMist" r="46%">
            <Stop offset="0" stopColor="#DDE8E1" stopOpacity={0.07} />
            <Stop offset="0.6" stopColor="#DDE8E1" stopOpacity={0.02} />
            <Stop offset="1" stopColor="#DDE8E1" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect fill="#0B0E0C" height="220" width="320" x="0" y="0" />
        <Rect
          fill="url(#progressDarkSweep)"
          height="220"
          width="320"
          x="0"
          y="0"
        />
        <Rect
          fill="url(#progressDarkMist)"
          height="220"
          width="320"
          x="0"
          y="0"
        />
      </MeshShell>
    );
  }
  return (
    <MeshShell>
      <Defs>
        <RadialGradient cx="-8%" cy="112%" id="progressLightSweep" r="120%">
          <Stop offset="0" stopColor="#FAF7F0" stopOpacity={0.88} />
          <Stop offset="0.5" stopColor="#FAF7F0" stopOpacity={0.28} />
          <Stop offset="1" stopColor="#FAF7F0" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient cx="104%" cy="-4%" id="progressLightCorner" r="50%">
          <Stop offset="0" stopColor={BARAKAH_GREEN} stopOpacity={0.14} />
          <Stop offset="0.5" stopColor={BARAKAH_GREEN} stopOpacity={0.05} />
          <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect fill="#F8FAF8" height="220" width="320" x="0" y="0" />
      <Rect
        fill="url(#progressLightSweep)"
        height="220"
        width="320"
        x="0"
        y="0"
      />
      <Rect
        fill="url(#progressLightCorner)"
        height="220"
        width="320"
        x="0"
        y="0"
      />
    </MeshShell>
  );
}

export function SplashMesh({ dark }: MeshProps) {
  if (dark) {
    return (
      <MeshShell>
        <Defs>
          <RadialGradient cx="88%" cy="14%" id="splashDarkAccent" r="68%">
            <Stop offset="0" stopColor="#29603E" stopOpacity={0.14} />
            <Stop offset="0.55" stopColor="#29603E" stopOpacity={0.05} />
            <Stop offset="1" stopColor="#29603E" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="8%" cy="92%" id="splashDarkCream" r="70%">
            <Stop offset="0" stopColor="#F5EBDB" stopOpacity={0.06} />
            <Stop offset="0.6" stopColor="#F5EBDB" stopOpacity={0.02} />
            <Stop offset="1" stopColor="#F5EBDB" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect fill="#0E1311" height="220" width="320" x="0" y="0" />
        <Rect
          fill="url(#splashDarkAccent)"
          height="220"
          width="320"
          x="0"
          y="0"
        />
        <Rect
          fill="url(#splashDarkCream)"
          height="220"
          width="320"
          x="0"
          y="0"
        />
      </MeshShell>
    );
  }
  return (
    <MeshShell>
      <Defs>
        <RadialGradient cx="88%" cy="12%" id="splashLightAccent" r="68%">
          <Stop offset="0" stopColor="#29603E" stopOpacity={0.1} />
          <Stop offset="0.55" stopColor="#29603E" stopOpacity={0.04} />
          <Stop offset="1" stopColor="#29603E" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient cx="8%" cy="92%" id="splashLightGreen" r="70%">
          <Stop offset="0" stopColor={BARAKAH_GREEN} stopOpacity={0.06} />
          <Stop offset="0.6" stopColor={BARAKAH_GREEN} stopOpacity={0.02} />
          <Stop offset="1" stopColor={BARAKAH_GREEN} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect fill="#F8F1E1" height="220" width="320" x="0" y="0" />
      <Rect
        fill="url(#splashLightAccent)"
        height="220"
        width="320"
        x="0"
        y="0"
      />
      <Rect
        fill="url(#splashLightGreen)"
        height="220"
        width="320"
        x="0"
        y="0"
      />
    </MeshShell>
  );
}
