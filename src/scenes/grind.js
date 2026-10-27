/* Ported from the original dashboard: drawing routines are unchanged.
 * They run inside a factory so each canvas gets its own state and the
 * React app only talks to the returned { tick, burst, touch } API. */
import { clamp, safeNum, safeRadialGradient, safeLinearGradient, hslTempColor } from './helpers.js'

export const CANVAS_ID = 'grindMiniCanvas'

export function createGrindScene(canvas, stageParams) {
  const document = {
    getElementById: (id) => (id === CANVAS_ID ? canvas : window.document.getElementById(id)),
    querySelectorAll: (s) => window.document.querySelectorAll(s),
  }
  let t = null

let grindMiniAnimId = null;
let grindMiniFrame  = 0;
let grindMiniSaveBurst = 0;
let grindMiniActive = false;

function drawGrindMini(frame, burst) {
  const canvas = document.getElementById('grindMiniCanvas');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const W = wrap.clientWidth  || 320;
  const H = wrap.clientHeight || 300;
  canvas.width  = W;
  canvas.height = H;
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, W, H);

  // ── BACKGROUND ──
  const bgGrad = g.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#0b1a2e');
  bgGrad.addColorStop(1, '#071018');
  g.fillStyle = bgGrad;
  g.fillRect(0, 0, W, H);

  // Subtle grid lines
  g.strokeStyle = 'rgba(80,130,200,0.06)';
  g.lineWidth = 0.8;
  for (let y = 0; y < H; y += 28) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
  }
  for (let x = 0; x < W; x += 28) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
  }

  // ── GEOMETRY ──
  const cx      = W * 0.50;
  const cy      = H * 0.42;
  const rx      = W * 0.36;   // half-length (x radius of ellipse perspective)
  const ry      = H * 0.22;   // vertical radius of the cylinder

  // Angle from mill speed; 12–22 RPM maps to a rotation speed
  const speedRpm = parseFloat(stageParams.grind.millSpeed) || 17;
  const rotSpeed = (speedRpm / 22) * 0.04;  // radians per frame
  const rot      = frame * rotSpeed;

  // ── SUPPORT STRUCTURE (under the drum) ──
  // Two concrete pillars
  const pillarW = rx * 0.22;
  const pillarH = ry * 1.6;
  const pillarTop = cy + ry * 0.75;
  [cx - rx * 0.55, cx + rx * 0.55].forEach(px => {
    // pillar body
    const pg = g.createLinearGradient(px - pillarW/2, 0, px + pillarW/2, 0);
    pg.addColorStop(0, '#c0c4cc');
    pg.addColorStop(0.4, '#dde0e6');
    pg.addColorStop(1, '#9fa3aa');
    g.fillStyle = pg;
    g.beginPath();
    g.roundRect(px - pillarW/2, pillarTop, pillarW, pillarH, 2);
    g.fill();
    g.strokeStyle = 'rgba(60,65,75,0.55)'; g.lineWidth = 0.8;
    g.stroke();
    // base plate
    const baseW = pillarW * 1.8;
    g.fillStyle = '#a8acb4';
    g.beginPath(); g.roundRect(px - baseW/2, pillarTop + pillarH - 2, baseW, 7, 1); g.fill();
  });

  // ── RIDING RINGS on cylinder ──
  const ringPositions = [cx - rx * 0.45, cx + rx * 0.45];

  // ── GEAR RING (big ring gear on one end) ──
  const gearCx = cx + rx * 0.85;
  const gearRy = ry * 1.18;
  const gearRx = gearRy * 0.18;
  const toothCount = 28;
  g.save();
  g.globalAlpha = 0.85;
  for (let t = 0; t < toothCount; t++) {
    const a0 = (t / toothCount) * Math.PI * 2 + rot * 0.5;
    const a1 = ((t + 0.45) / toothCount) * Math.PI * 2 + rot * 0.5;
    const innerFrac = 0.82;
    const ox0 = gearCx + Math.cos(a0) * gearRx * innerFrac;
    const oy0 = cy   + Math.sin(a0) * gearRy * innerFrac;
    const ox1 = gearCx + Math.cos(a1) * gearRx * innerFrac;
    const oy1 = cy   + Math.sin(a1) * gearRy * innerFrac;
    const ix0 = gearCx + Math.cos(a0) * gearRx * 1.0;
    const iy0 = cy   + Math.sin(a0) * gearRy * 1.0;
    const ix1 = gearCx + Math.cos(a1) * gearRx * 1.0;
    const iy1 = cy   + Math.sin(a1) * gearRy * 1.0;
    g.beginPath();
    g.moveTo(ox0, oy0); g.lineTo(ix0, iy0); g.lineTo(ix1, iy1); g.lineTo(ox1, oy1);
    g.closePath();
    g.fillStyle = '#7a7e88';
    g.strokeStyle = '#3a3d45'; g.lineWidth = 0.6;
    g.fill(); g.stroke();
  }
  g.restore();

  // ── DRUM BODY — 3-D cylinder ──
  // Back face (far ellipse)
  g.save();
  const shellGrad = g.createLinearGradient(cx, cy - ry, cx, cy + ry);
  shellGrad.addColorStop(0,   '#6a7080');
  shellGrad.addColorStop(0.25,'#8a9098');
  shellGrad.addColorStop(0.50,'#9fa5ae');
  shellGrad.addColorStop(0.75,'#7a8088');
  shellGrad.addColorStop(1,   '#4a4e56');

  // Main cylinder body (rectangular barrel with rounded perspective end-caps)
  const left = cx - rx;
  const right = cx + rx;
  g.beginPath();
  g.moveTo(left,  cy - ry);
  g.lineTo(right, cy - ry);
  g.lineTo(right, cy + ry);
  g.lineTo(left,  cy + ry);
  g.closePath();
  g.fillStyle = shellGrad;
  g.fill();

  // Top highlight
  const topHl = g.createLinearGradient(cx, cy - ry, cx, cy - ry * 0.4);
  topHl.addColorStop(0, 'rgba(255,255,255,0.22)');
  topHl.addColorStop(1, 'rgba(255,255,255,0.00)');
  g.fillStyle = topHl;
  g.fillRect(left, cy - ry, rx * 2, ry * 0.65);

  // Bottom shadow
  const botSh = g.createLinearGradient(cx, cy + ry * 0.5, cx, cy + ry);
  botSh.addColorStop(0, 'rgba(0,0,0,0)');
  botSh.addColorStop(1, 'rgba(0,0,0,0.42)');
  g.fillStyle = botSh;
  g.fillRect(left, cy + ry * 0.5, rx * 2, ry * 0.5);
  g.restore();

  // ── BOLTED MANHOLE COVER (rotating) — drawn as repeating bolts around the end-cap ──
  const drawEndCap = (ecx, ecRx, ecRy, rotOff) => {
    // Base end-cap disc
    const capGrad = safeRadialGradient(g,ecx - ecRx*0.2, cy - ecRy*0.2, 0, ecx, cy, Math.max(ecRx, ecRy));
    capGrad.addColorStop(0, '#7c8190');
    capGrad.addColorStop(0.5,'#5a5e68');
    capGrad.addColorStop(1, '#3a3d45');
    g.save();
    g.fillStyle = capGrad;
    g.strokeStyle = 'rgba(20,22,28,0.75)';
    g.lineWidth = 1.5;
    g.beginPath(); g.ellipse(ecx, cy, ecRx, ecRy, 0, 0, Math.PI*2); g.fill(); g.stroke();

    // Concentric rings on face
    [0.65, 0.40].forEach(frac => {
      g.strokeStyle = 'rgba(100,105,115,0.6)'; g.lineWidth = 1.0;
      g.beginPath(); g.ellipse(ecx, cy, ecRx * frac, ecRy * frac, 0, 0, Math.PI*2); g.stroke();
    });

    // Bolts rotating with the drum
    const bCount = 10;
    for (let b = 0; b < bCount; b++) {
      const bAng = (b / bCount) * Math.PI * 2 + rotOff;
      const bx = ecx + Math.cos(bAng) * ecRx * 0.82;
      const by = cy  + Math.sin(bAng) * ecRy * 0.82;
      const br = Math.min(ecRx, ecRy) * 0.085;
      g.beginPath(); g.arc(bx, by, br, 0, Math.PI*2);
      g.fillStyle = '#c0c4cc'; g.fill();
      g.strokeStyle = '#3a3d48'; g.lineWidth = 0.7; g.stroke();
      // bolt head cross
      g.strokeStyle = '#8a8e96'; g.lineWidth = 0.6;
      g.beginPath(); g.moveTo(bx - br*0.55, by); g.lineTo(bx + br*0.55, by); g.stroke();
      g.beginPath(); g.moveTo(bx, by - br*0.55); g.lineTo(bx, by + br*0.55); g.stroke();
    }
    // Center hub
    g.beginPath(); g.arc(ecx, cy, Math.min(ecRx,ecRy)*0.22, 0, Math.PI*2);
    g.fillStyle = '#5a5e68'; g.fill();
    g.strokeStyle = 'rgba(20,22,28,0.6)'; g.lineWidth = 1; g.stroke();

    g.restore();
  };

  const endCapRx = ry * 0.20;
  const endCapRy = ry;

  // Far (right) end-cap
  drawEndCap(right, endCapRx, endCapRy, rot);
  // Near (left) end-cap
  drawEndCap(left, endCapRx, endCapRy, rot + Math.PI * 0.3);

  // ── RIDING RINGS (over the drum) ──
  ringPositions.forEach(rpx => {
    const ringW = rx * 0.06;
    const ringColor1 = '#b0b4bc';
    const ringColor2 = '#78808c';
    const rg = g.createLinearGradient(rpx, cy - ry, rpx, cy + ry);
    rg.addColorStop(0, ringColor1);
    rg.addColorStop(0.5, '#e0e4ea');
    rg.addColorStop(1, ringColor2);
    g.fillStyle = rg;
    g.strokeStyle = 'rgba(30,32,36,0.6)'; g.lineWidth = 0.9;
    g.beginPath(); g.roundRect(rpx - ringW/2, cy - ry - 3, ringW, ry*2 + 6, 2); g.fill(); g.stroke();
  });

  // ── TRUNNION FEED / DISCHARGE PIPE ──
  // Feed pipe (left)
  const pipeH = ry * 0.40;
  const pipeW = ry * 0.18;
  const drawPipe = (px, isLeft) => {
    const pg2 = g.createLinearGradient(px - pipeW/2, 0, px + pipeW/2, 0);
    pg2.addColorStop(0, '#4a5060');
    pg2.addColorStop(0.5, '#8a9098');
    pg2.addColorStop(1, '#3a4050');
    g.fillStyle = pg2;
    g.strokeStyle = 'rgba(30,32,36,0.5)'; g.lineWidth = 0.8;
    // Pipe body extending outward
    const pipeLen = rx * 0.25;
    const pipeX = isLeft ? px - pipeLen : px;
    g.beginPath(); g.roundRect(pipeX, cy - pipeH/2, pipeLen, pipeH, 3); g.fill(); g.stroke();
    // Flange
    const flangeW = pipeW * 1.4;
    const flangeH = pipeH * 1.25;
    const flangeX = isLeft ? px - pipeLen - flangeW * 0.4 : px + pipeLen - flangeW * 0.6;
    g.fillStyle = '#7a8090';
    g.strokeStyle = 'rgba(30,32,36,0.5)'; g.lineWidth = 0.8;
    g.beginPath(); g.roundRect(flangeX, cy - flangeH/2, flangeW, flangeH, 2); g.fill(); g.stroke();
  };
  drawPipe(left, true);
  drawPipe(right, false);

  // ── SLURRY INLET ARROW (feed end) ──
  const arrowX = left - rx * 0.28;
  const arrowY = cy;
  g.save();
  g.globalAlpha = 0.70;
  g.strokeStyle = '#4aacff'; g.lineWidth = 2.5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(arrowX - 14, arrowY); g.lineTo(arrowX + 4, arrowY); g.stroke();
  g.fillStyle = '#4aacff';
  g.beginPath(); g.moveTo(arrowX + 4, arrowY - 5); g.lineTo(arrowX + 14, arrowY); g.lineTo(arrowX + 4, arrowY + 5); g.closePath(); g.fill();
  g.restore();

  // ── DISCHARGE ARROW (right end) ──
  const dArrX = right + rx * 0.28;
  g.save();
  g.globalAlpha = 0.65;
  g.strokeStyle = '#ffbb44'; g.lineWidth = 2.5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(dArrX - 4, arrowY); g.lineTo(dArrX + 14, arrowY); g.stroke();
  g.fillStyle = '#ffbb44';
  g.beginPath(); g.moveTo(dArrX + 14, arrowY - 5); g.lineTo(dArrX + 24, arrowY); g.lineTo(dArrX + 14, arrowY + 5); g.closePath(); g.fill();
  g.restore();

  // ── ROTATION INDICATOR ARC ──
  const indR = ry * 1.22;
  g.save();
  g.globalAlpha = 0.35 + 0.10 * Math.sin(frame * 0.08);
  const arcGrad = g.createConicalGradient ? null : null;
  g.strokeStyle = '#ffc840';
  g.lineWidth = 1.8;
  g.setLineDash([4, 6]);
  g.beginPath();
  g.arc(cx, cy, indR, -Math.PI * 0.72, Math.PI * 0.72);
  g.stroke();
  g.setLineDash([]);
  // Small arrow tip at end of arc
  const arcEndAng = Math.PI * 0.72;
  const aex = cx + Math.cos(arcEndAng) * indR;
  const aey = cy + Math.sin(arcEndAng) * indR;
  g.globalAlpha = 0.45;
  g.fillStyle = '#ffc840';
  g.beginPath();
  g.arc(aex, aey, 3.5, 0, Math.PI*2);
  g.fill();
  g.restore();

  // ── DRIVE MOTOR (left side) ──
  const motorX = cx - rx * 1.05;
  const motorY = cy + ry * 1.10;
  const motorW = rx * 0.28;
  const motorH = ry * 0.42;
  g.save();
  g.globalAlpha = 0.92;
  const motorGrad = g.createLinearGradient(motorX, motorY, motorX + motorW, motorY + motorH);
  motorGrad.addColorStop(0, '#2a5080');
  motorGrad.addColorStop(0.5,'#3a70a8');
  motorGrad.addColorStop(1, '#1a3060');
  g.fillStyle = motorGrad;
  g.strokeStyle = 'rgba(20,40,80,0.7)'; g.lineWidth = 1;
  g.beginPath(); g.roundRect(motorX, motorY, motorW, motorH, 4); g.fill(); g.stroke();
  // Motor label
  g.fillStyle = 'rgba(180,210,255,0.75)';
  g.font = 'bold 7px JetBrains Mono';
  g.textAlign = 'center';
  g.fillText('MOTOR', motorX + motorW/2, motorY + motorH/2 + 2.5);
  // Spinning indicator dot
  const mDotAng = frame * rotSpeed * 3;
  const mDotX = motorX + motorW/2 + Math.cos(mDotAng) * motorW * 0.28;
  const mDotY = motorY + motorH * 0.28 + Math.sin(mDotAng) * motorH * 0.18;
  g.fillStyle = '#ffcc44';
  g.beginPath(); g.arc(mDotX, mDotY, 2.5, 0, Math.PI*2); g.fill();
  g.restore();

  // ── LABELS ──
  g.save();
  g.fillStyle = 'rgba(140,180,220,0.60)';
  g.font = '500 8px JetBrains Mono';
  g.textAlign = 'center';
  g.fillText('BALL MILL', cx, cy - ry - 12);

  g.fillStyle = 'rgba(100,150,200,0.45)';
  g.font = '6px JetBrains Mono';
  g.fillText('← ORE SLURRY IN', left - rx * 0.14, cy - ry * 0.55);
  g.fillText('GROUND SLURRY OUT →', right + rx * 0.14, cy - ry * 0.55);
  g.restore();

  // ── SAVE BURST ──
  if (burst > 0) {
    const bAlpha = Math.min(1, burst / 18);
    for (let b = 0; b < 20; b++) {
      const ang = (b / 20) * Math.PI * 2;
      const dist = (1 - bAlpha) * W * 0.18;
      g.beginPath(); g.arc(cx + Math.cos(ang)*dist, cy + Math.sin(ang)*dist*0.55, 2, 0, Math.PI*2);
      g.fillStyle = `rgba(255,200,64,${(bAlpha*0.8).toFixed(2)})`; g.fill();
    }
    g.save();
    g.globalAlpha = bAlpha * 0.95;
    g.shadowColor = '#3aaa6a'; g.shadowBlur = 20;
    g.strokeStyle = '#3aaa6a'; g.lineWidth = 3.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx-14, H*0.80); g.lineTo(cx-3, H*0.80+11); g.lineTo(cx+16, H*0.80-11); g.stroke();
    g.restore();
  }

  // Update RPM bar
  const rpmFill = document.getElementById('grindRpmFill');
  if (rpmFill) {
    const pct = Math.min(((speedRpm - 12) / (22 - 12)) * 100, 100);
    rpmFill.style.width = pct + '%';
  }
}


  return {
    tick() { if(grindMiniSaveBurst>0) grindMiniSaveBurst-=0.5; drawGrindMini(grindMiniFrame, grindMiniSaveBurst); grindMiniFrame++; },
    burst(){ grindMiniSaveBurst=20; },
    touch(){ grindMiniActive=true; clearTimeout(t); t=setTimeout(()=>{grindMiniActive=false},800); },
  }
}
