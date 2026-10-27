/* Ported from the original dashboard: drawing routines are unchanged.
 * They run inside a factory so each canvas gets its own state and the
 * React app only talks to the returned { tick, burst, touch } API. */
import { clamp, safeNum, safeRadialGradient, safeLinearGradient, hslTempColor } from './helpers.js'

export const CANVAS_ID = 'mixMiniCanvas'

export function createMixScene(canvas, stageParams) {
  const document = {
    getElementById: (id) => (id === CANVAS_ID ? canvas : window.document.getElementById(id)),
    querySelectorAll: (s) => window.document.querySelectorAll(s),
  }
  let t = null

let mixMiniFrame = 0;
let mixMiniAnimId = null;
let mixMiniSaveBurst = 0;

function drawMixMini(frame, burst) {
  const canvas = document.getElementById('mixMiniCanvas');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const W = wrap.clientWidth || 400;
  const H = wrap.clientHeight || 420;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = W * ratio; canvas.height = H * ratio;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const g = canvas.getContext('2d');
  g.scale(ratio, ratio);

  // Background
  g.clearRect(0, 0, W, H);
  const bgGrad = g.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#f7f3ec'); bgGrad.addColorStop(1, '#ffffff');
  g.fillStyle = bgGrad; g.fillRect(0, 0, W, H);

  // Grid
  g.strokeStyle = 'rgba(200,145,42,0.05)'; g.lineWidth = 1;
  for (let x = 0; x < W; x += 28) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y < H; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }

  // === LAYOUT ===
  // 4 hoppers at top, binder tank top-right, mixer body center, conveyor right
  const hopperY = H * 0.05;
  const hopperH = H * 0.22;
  const hopperW = W * 0.12;
  const mixerTop = H * 0.35;
  const mixerBot = H * 0.68;
  const mixerLeft = W * 0.08;
  const mixerRight = W * 0.82;
  const mixerCX = (mixerLeft + mixerRight) / 2;
  const mixerCY = (mixerTop + mixerBot) / 2;
  const mixerRW = (mixerRight - mixerLeft) / 2;
  const mixerRH = (mixerBot - mixerTop) / 2;

  // ── BINDER TANK (top right) ──
  const tankX = W * 0.84;
  const tankY = H * 0.04;
  const tankW = W * 0.12;
  const tankH = H * 0.26;
  // tank body
  const tGrad = g.createLinearGradient(tankX, 0, tankX + tankW, 0);
  tGrad.addColorStop(0, '#a8b8c8'); tGrad.addColorStop(0.5, '#d8e4ec'); tGrad.addColorStop(1, '#8898a8');
  g.fillStyle = tGrad; g.strokeStyle = 'rgba(120,140,160,0.7)'; g.lineWidth = 1.2;
  g.beginPath(); g.roundRect(tankX, tankY + tankH * 0.08, tankW, tankH * 0.88, 4); g.fill(); g.stroke();
  // tank top cap
  g.fillStyle = '#b8c8d4'; g.strokeStyle = 'rgba(120,140,160,0.6)'; g.lineWidth = 1;
  g.beginPath(); g.ellipse(tankX + tankW / 2, tankY + tankH * 0.08, tankW / 2, tankH * 0.05, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  // liquid fill (light blue semi-transparent)
  const liquidLevel = 0.55 + 0.04 * Math.sin(frame * 0.04);
  const liquidTop = tankY + tankH * (0.1 + (1 - liquidLevel) * 0.75);
  const lGrad = g.createLinearGradient(0, liquidTop, 0, tankY + tankH * 0.94);
  lGrad.addColorStop(0, 'rgba(100,180,240,0.55)'); lGrad.addColorStop(1, 'rgba(60,130,200,0.75)');
  g.fillStyle = lGrad;
  g.save();
  g.beginPath(); g.roundRect(tankX + 2, tankY + tankH * 0.1, tankW - 4, tankH * 0.84, 3); g.clip();
  g.fillRect(tankX + 2, liquidTop, tankW - 4, tankY + tankH * 0.94 - liquidTop);
  // ripple on liquid surface
  g.strokeStyle = 'rgba(180,220,255,0.6)'; g.lineWidth = 1;
  const ripA = frame * 0.06;
  g.beginPath(); g.ellipse(tankX + tankW * 0.5, liquidTop + 3, tankW * 0.30 + 2 * Math.sin(ripA), 3, 0, 0, Math.PI * 2); g.stroke();
  g.restore();
  // agitator shaft
  const agRotSpeed = frame * 0.04;
  g.save(); g.translate(tankX + tankW / 2, tankY + tankH * 0.08);
  g.strokeStyle = '#8898a8'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, tankH * 0.75); g.stroke();
  // agitator blades
  g.save(); g.translate(0, tankH * 0.55); g.rotate(agRotSpeed);
  g.strokeStyle = '#9aacbc'; g.lineWidth = 1.5;
  [-1, 1].forEach(dir => {
    g.beginPath(); g.moveTo(0, 0); g.lineTo(dir * tankW * 0.38, tankH * 0.06); g.stroke();
  });
  g.restore(); g.restore();
  // pipe from tank to mixer
  g.strokeStyle = 'rgba(120,140,160,0.6)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(tankX + tankW / 2, tankY + tankH * 0.96);
  g.lineTo(tankX + tankW / 2, mixerTop - 6);
  g.lineTo(mixerRight - mixerRW * 0.20, mixerTop - 6);
  g.stroke();
  // animated liquid binder drop
  const ldT = ((frame * 0.018) % 1);
  g.fillStyle = 'rgba(100,180,240,0.85)';
  g.beginPath(); g.arc(tankX + tankW / 2, tankY + tankH * 0.96 + ldT * 16, 2.5, 0, Math.PI * 2); g.fill();

  // ── 4 HOPPERS ──
  const hopperColors = [
    { fill: ['#5a2510', '#7a3a18', '#4a1e0c'], label: 'IRON ORE', matColor: '#6a2d12' },
    { fill: ['#d4ccc0', '#f0ece4', '#bab4aa'], label: 'BENTONITE', matColor: '#e0d8cc' },
    { fill: ['#1a1a1a', '#2e2e2e', '#111111'], label: 'ORE FINES', matColor: '#252525' },
    { fill: ['#d4c89a', '#e8dbb0', '#c0b480'], label: 'OB BINDER', matColor: '#d0c090' }
  ];
  const hopperSpacing = W * 0.195;
  const hopperStartX = W * 0.04;

  hopperColors.forEach((hc, hi) => {
    const hcx = hopperStartX + hi * hopperSpacing + hopperW / 2;
    const htop = hopperY;
    const hbotY = hopperY + hopperH;
    const neckW = hopperW * 0.22;
    const neckH = hopperH * 0.12;

    // Hopper body (inverted trapezoid)
    const hGrad = g.createLinearGradient(hcx - hopperW / 2, 0, hcx + hopperW / 2, 0);
    hGrad.addColorStop(0, hc.fill[0]); hGrad.addColorStop(0.5, '#3a4855'); hGrad.addColorStop(1, hc.fill[0]);
    g.fillStyle = hGrad; g.strokeStyle = 'rgba(80,100,120,0.55)'; g.lineWidth = 1;
    g.beginPath();
    g.moveTo(hcx - hopperW / 2, htop);
    g.lineTo(hcx + hopperW / 2, htop);
    g.lineTo(hcx + neckW / 2, hbotY - neckH);
    g.lineTo(hcx + neckW / 2, hbotY);
    g.lineTo(hcx - neckW / 2, hbotY);
    g.lineTo(hcx - neckW / 2, hbotY - neckH);
    g.closePath(); g.fill(); g.stroke();

    // Material fill inside hopper
    const matGrad2 = g.createLinearGradient(0, htop + 4, 0, hbotY - neckH - 4);
    matGrad2.addColorStop(0, hc.matColor + 'cc'); matGrad2.addColorStop(1, hc.matColor + '88');
    g.fillStyle = matGrad2;
    g.save();
    g.beginPath();
    g.moveTo(hcx - hopperW / 2 + 2, htop + 4);
    g.lineTo(hcx + hopperW / 2 - 2, htop + 4);
    g.lineTo(hcx + neckW / 2 + 2, hbotY - neckH - 4);
    g.lineTo(hcx - neckW / 2 - 2, hbotY - neckH - 4);
    g.closePath(); g.clip(); g.fillRect(hcx - hopperW / 2 + 2, htop + 4, hopperW - 4, hopperH - 8);
    g.restore();

    // Label tag below hopper
    g.fillStyle = 'rgba(26,48,87,0.08)'; g.strokeStyle = 'rgba(200,145,42,0.3)'; g.lineWidth = 0.8;
    g.beginPath(); g.roundRect(hcx - hopperW * 0.55, hbotY + 2, hopperW * 1.1, 12, 2); g.fill(); g.stroke();
    g.fillStyle = '#8a7a60'; g.font = '500 5.5px JetBrains Mono'; g.textAlign = 'center';
    g.fillText(hc.label, hcx, hbotY + 10);

    // Animated material fall from neck
    const fSpeed = 0.028 + hi * 0.007;
    for (let fk = 0; fk < 4; fk++) {
      const ft = ((frame * fSpeed + fk * 0.25) % 1);
      if (ft < 0.05) continue;
      const fy = hbotY + ft * (mixerTop - hbotY - 6);
      const fAlpha = Math.min(1, ft * 8) * (1 - ft * 0.5);
      g.globalAlpha = fAlpha * 0.85;
      g.fillStyle = hc.matColor;
      g.beginPath(); g.arc(hcx + (fk % 2 - 0.5) * 3, fy, 2.2, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  });

  // ── MIXER BODY ──
  // Support legs
  g.fillStyle = '#2d5fa6'; g.strokeStyle = 'rgba(45,95,166,0.5)'; g.lineWidth = 0.8;
  [-0.35, -0.05, 0.25, 0.55].forEach(lx => {
    g.beginPath(); g.roundRect(mixerCX + mixerRW * lx - 3, mixerBot, 6, H * 0.07, 1); g.fill(); g.stroke();
  });

  // Outer shell shadow + body
  g.save();
  g.shadowColor = 'rgba(26,48,87,0.18)'; g.shadowBlur = 10; g.shadowOffsetY = 4;
  const shellGrad = g.createLinearGradient(mixerCX, mixerTop - 4, mixerCX, mixerBot + 4);
  shellGrad.addColorStop(0, '#6a7a8a'); shellGrad.addColorStop(0.15, '#a8bac8');
  shellGrad.addColorStop(0.5, '#ccd8e0'); shellGrad.addColorStop(0.85, '#8a9aaa'); shellGrad.addColorStop(1, '#506070');
  g.fillStyle = shellGrad; g.strokeStyle = 'rgba(80,100,120,0.6)'; g.lineWidth = 1.8;
  g.beginPath(); g.ellipse(mixerCX, mixerCY, mixerRW + 3, mixerRH + 3, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.shadowBlur = 0; g.restore();

  // Cutaway window — reveal internals
  g.save();
  g.beginPath(); g.rect(mixerCX - mixerRW * 0.65, mixerTop, mixerRW * 1.30, mixerRH * 0.88); g.clip();

  // Material fill (dark reddish-brown damp pellet feed)
  const matFill = g.createLinearGradient(mixerCX, mixerCY - mixerRH * 0.05, mixerCX, mixerCY + mixerRH);
  matFill.addColorStop(0, '#5a2e14'); matFill.addColorStop(0.5, '#4a2410'); matFill.addColorStop(1, '#362008');
  g.fillStyle = matFill;
  g.beginPath(); g.ellipse(mixerCX, mixerCY + mixerRH * 0.08, mixerRW * 0.62, mixerRH * 0.60, 0, 0, Math.PI * 2); g.fill();

  // Material surface texture
  g.strokeStyle = 'rgba(90,45,15,0.3)'; g.lineWidth = 0.6;
  for (let rr = 0; rr < 3; rr++) {
    const yoff = mixerCY + mixerRH * (0.05 - rr * 0.17);
    g.beginPath(); g.ellipse(mixerCX, yoff, mixerRW * (0.58 - rr * 0.06), mixerRH * 0.10, 0, 0, Math.PI * 2); g.stroke();
  }

  // Slow leftward-to-rightward material flow particles
  const flowSpeed = 0.004;
  for (let fp = 0; fp < 8; fp++) {
    const ft2 = ((frame * flowSpeed + fp / 8) % 1);
    const fx2 = mixerCX - mixerRW * 0.55 + ft2 * mixerRW * 1.10;
    const fy2 = mixerCY + mixerRH * 0.15 + (fp % 3 - 1) * mixerRH * 0.12;
    g.globalAlpha = 0.35;
    g.fillStyle = '#7a3a18';
    g.beginPath(); g.arc(fx2, fy2, 2.5, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
  g.restore();

  // Central shaft
  const shaftGrad2 = g.createLinearGradient(mixerCX, mixerCY - mixerRH * 0.07, mixerCX, mixerCY + mixerRH * 0.07);
  shaftGrad2.addColorStop(0, '#b8c8d4'); shaftGrad2.addColorStop(0.5, '#e0eaf0'); shaftGrad2.addColorStop(1, '#8898a8');
  g.fillStyle = shaftGrad2; g.strokeStyle = 'rgba(110,130,150,0.7)'; g.lineWidth = 0.8;
  g.beginPath(); g.roundRect(mixerCX - mixerRW * 0.65, mixerCY - mixerRH * 0.07, mixerRW * 1.30, mixerRH * 0.14, 2); g.fill(); g.stroke();

  // Rotating paddles
  g.save(); g.translate(mixerCX, mixerCY);
  const padRot = frame * 0.050; // ~1 rev / 8s at 60fps
  g.rotate(padRot);
  const numP = 8;
  for (let p = 0; p < numP; p++) {
    const ang = p * Math.PI * 2 / numP;
    const px = Math.cos(ang) * mixerRW * 0.30;
    const py = Math.sin(ang) * mixerRH * 0.52;
    g.save(); g.translate(px * 0.55, py * 0.55); g.rotate(ang + 0.30);
    const blG = g.createLinearGradient(-5, 0, 5, 0);
    blG.addColorStop(0, '#788898'); blG.addColorStop(0.5, '#c0ccd8'); blG.addColorStop(1, '#607080');
    g.fillStyle = blG; g.strokeStyle = 'rgba(140,160,180,0.6)'; g.lineWidth = 0.7;
    g.beginPath(); g.roundRect(-4.5, -mixerRH * 0.27, 9, mixerRH * 0.54, 1.5); g.fill(); g.stroke();
    g.restore();
  }
  // Center hub
  g.fillStyle = 'rgba(160,175,190,0.9)'; g.strokeStyle = 'rgba(130,150,170,0.6)'; g.lineWidth = 0.8;
  g.beginPath(); g.arc(0, 0, mixerRH * 0.10, 0, Math.PI * 2); g.fill(); g.stroke();
  g.restore();

  // Motor (left)
  const mGrad = g.createLinearGradient(mixerLeft - 18, mixerCY, mixerLeft, mixerCY);
  mGrad.addColorStop(0, '#1a3057'); mGrad.addColorStop(1, '#2d5fa6');
  g.fillStyle = mGrad; g.strokeStyle = 'rgba(45,95,166,0.55)'; g.lineWidth = 1;
  g.beginPath(); g.roundRect(mixerLeft - 16, mixerCY - mixerRH * 0.36, 15, mixerRH * 0.72, 2); g.fill(); g.stroke();

  // Motor shaft coupler
  g.fillStyle = '#405868'; g.strokeStyle = 'rgba(80,100,120,0.5)'; g.lineWidth = 0.7;
  g.beginPath(); g.roundRect(mixerLeft - 1, mixerCY - mixerRH * 0.08, 6, mixerRH * 0.16, 1); g.fill(); g.stroke();

  // Feed inlet ports on top of mixer
  g.fillStyle = '#7a8a9a'; g.strokeStyle = 'rgba(110,130,150,0.55)'; g.lineWidth = 0.8;
  [-0.30, 0, 0.28].forEach(ox => {
    g.beginPath(); g.roundRect(mixerCX + mixerRW * ox - 5, mixerTop - 7, 10, 9, 1.5); g.fill(); g.stroke();
  });

  // ── DISCHARGE CONVEYOR (right side) ──
  const convStartX = mixerRight + 4;
  const convStartY = mixerBot - mixerRH * 0.15;
  const convEndX = W * 0.97;
  const convEndY = H * 0.58;
  const convH = 8;

  // Belt bg
  const convGrad = g.createLinearGradient(convStartX, convStartY, convEndX, convEndY);
  convGrad.addColorStop(0, '#1a2530'); convGrad.addColorStop(1, '#2a3540');
  g.fillStyle = convGrad; g.strokeStyle = 'rgba(45,95,166,0.5)'; g.lineWidth = 1;
  g.save();
  const convAngle = Math.atan2(convEndY - convStartY, convEndX - convStartX);
  g.translate(convStartX, convStartY); g.rotate(convAngle);
  const convLen = Math.hypot(convEndX - convStartX, convEndY - convStartY);
  g.beginPath(); g.roundRect(0, -convH / 2, convLen, convH, 2); g.fill(); g.stroke();

  // Animated belt stripes
  g.strokeStyle = 'rgba(80,100,120,0.4)'; g.lineWidth = 1;
  const beltOffset = (frame * 1.2) % 18;
  for (let bl = -convLen; bl < convLen + 18; bl += 18) {
    g.beginPath(); g.moveTo(bl + beltOffset, -convH / 2); g.lineTo(bl + beltOffset, convH / 2); g.stroke();
  }

  // Material on belt
  for (let mp = 0; mp < 5; mp++) {
    const mt = (mp / 5 + (frame * 0.006) % 1) % 1;
    const mx3 = mt * convLen;
    g.fillStyle = '#5a2e14';
    g.beginPath(); g.ellipse(mx3, 0, 8, 4, 0, 0, Math.PI * 2); g.fill();
  }

  // Rollers
  g.fillStyle = '#506070'; g.strokeStyle = 'rgba(80,100,120,0.4)'; g.lineWidth = 0.8;
  [0, 0.25, 0.5, 0.75, 1.0].forEach(rp => {
    g.beginPath(); g.arc(rp * convLen, 0, 5, 0, Math.PI * 2); g.fill(); g.stroke();
    // Roller rotation marks
    g.save(); g.translate(rp * convLen, 0);
    const rRot = frame * 0.09;
    g.rotate(rRot);
    g.strokeStyle = 'rgba(160,180,200,0.4)'; g.lineWidth = 0.7;
    g.beginPath(); g.moveTo(-4, 0); g.lineTo(4, 0); g.stroke();
    g.restore();
  });
  g.restore();

  // Discharge stream from mixer to conveyor
  const dsSpeed = 0.025;
  for (let ds = 0; ds < 5; ds++) {
    const dt = ((frame * dsSpeed + ds * 0.2) % 1);
    const dsx = mixerRight - 4 + dt * 16;
    const dsy = mixerBot - mixerRH * 0.15 - 5 + dt * 12;
    g.globalAlpha = Math.min(1, dt * 8) * (1 - dt * 0.6) * 0.9;
    g.fillStyle = '#5a2e14';
    g.beginPath(); g.arc(dsx, dsy, 2.8, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;

  // ── LIVE DATA CHIPS ──
  const binder = stageParams.mix.binder || '—';
  const moisture = stageParams.mix.mixMoisture || '—';
  const chips = [
    { label: 'BINDER', val: binder.length > 10 ? binder.substring(0, 9) + '…' : binder, x: mixerCX - mixerRW * 0.25, y: mixerBot + H * 0.10, bg: '#f5ede0', border: '#c8912a', txt: '#7a4a10' },
    { label: 'MOISTURE', val: moisture !== '—' ? moisture + '%' : '—', x: mixerCX + mixerRW * 0.25, y: mixerBot + H * 0.10, bg: '#e8f4ff', border: '#2d9fda', txt: '#1a5a80' },
  ];
  chips.forEach(c => {
    const cw = 78, ch = 24;
    g.fillStyle = c.bg; g.strokeStyle = c.border; g.lineWidth = 1;
    g.beginPath(); g.roundRect(c.x - cw / 2, c.y - ch / 2, cw, ch, 4); g.fill(); g.stroke();
    g.fillStyle = c.txt; g.font = '500 6px JetBrains Mono'; g.textAlign = 'center';
    g.fillText(c.label, c.x, c.y - 5);
    g.font = '700 8px JetBrains Mono';
    g.fillText(c.val, c.x, c.y + 6);
  });

  // Update shaft bar
  const shaftFill = document.getElementById('mixShaftFill');
  if (shaftFill) shaftFill.style.width = (40 + 30 * Math.sin(frame * 0.035)) + '%';

  // ── SAVE BURST ──
  if (burst > 0) {
    const bAlpha = Math.min(1, burst / 18);
    g.save(); g.globalAlpha = bAlpha * 0.95;
    g.shadowColor = '#3aaa6a'; g.shadowBlur = 16;
    g.strokeStyle = '#3aaa6a'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(W / 2 - 14, H * 0.88); g.lineTo(W / 2 - 3, H * 0.88 + 11); g.lineTo(W / 2 + 16, H * 0.88 - 11); g.stroke();
    g.restore();
  }
}


  return {
    tick() { if(mixMiniSaveBurst>0) mixMiniSaveBurst-=0.5; drawMixMini(mixMiniFrame, mixMiniSaveBurst); mixMiniFrame++; },
    burst(){ mixMiniSaveBurst=20; },
    touch(){},
  }
}
