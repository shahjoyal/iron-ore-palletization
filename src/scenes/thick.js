/* Ported from the original dashboard: drawing routines are unchanged.
 * They run inside a factory so each canvas gets its own state and the
 * React app only talks to the returned { tick, burst, touch } API. */
import { clamp, safeNum, safeRadialGradient, safeLinearGradient, hslTempColor } from './helpers.js'

export const CANVAS_ID = 'thickMiniCanvas'

export function createThickScene(canvas, stageParams) {
  const document = {
    getElementById: (id) => (id === CANVAS_ID ? canvas : window.document.getElementById(id)),
    querySelectorAll: (s) => window.document.querySelectorAll(s),
  }
  let t = null

let thickMiniAnimId = null;
let thickMiniFrame  = 0;
let thickMiniSaveBurst = 0;
let thickMiniActive = false;

function drawThickMini(frame, burst) {
  const canvas = document.getElementById('thickMiniCanvas');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const W = wrap.clientWidth  || 360;
  const H = wrap.clientHeight || 360;
  canvas.width  = W;
  canvas.height = H;
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, W, H);

  // ── BACKGROUND ──
  const bgGrad = g.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#f8f5f0');
  bgGrad.addColorStop(1, '#f2efea');
  g.fillStyle = bgGrad;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(180,150,100,0.10)'; g.lineWidth = 0.8;
  for (let y = 0; y < H; y += 26) { g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }
  for (let x = 0; x < W; x += 26) { g.beginPath(); g.moveTo(x,0); g.lineTo(x,H); g.stroke(); }

  // ── GEOMETRY ──
  const cx = W * 0.50;
  const tankR  = W * 0.40;            // outer radius
  const tankTop = H * 0.12;           // top of cylinder
  const cylH   = H * 0.38;            // cylinder height
  const cylBot = tankTop + cylH;       // bottom of cylinder wall
  const coneBot = H * 0.88;           // apex of cone
  const slurryLvl = tankTop + cylH * 0.18; // clear water surface

  // ── OVERFLOW LAUNDER (ring channel at top) ──
  g.save();
  g.strokeStyle = 'rgba(80,140,200,0.45)'; g.lineWidth = 4;
  g.beginPath(); g.ellipse(cx, tankTop, tankR + 4, tankR * 0.12 + 2, 0, 0, Math.PI*2); g.stroke();
  g.restore();

  // ── SLURRY LAYERS ──
  // Bottom dense solids (cone)
  const coneGrad = g.createLinearGradient(cx, cylBot, cx, coneBot);
  coneGrad.addColorStop(0, 'rgba(110,50,18,0.90)');
  coneGrad.addColorStop(1, 'rgba(70,25,8,0.98)');
  g.beginPath();
  g.moveTo(cx - tankR, cylBot); g.lineTo(cx + tankR, cylBot);
  g.lineTo(cx, coneBot); g.closePath();
  g.fillStyle = coneGrad; g.fill();

  // Middle slurry layer (cylinder mid-bottom portion)
  const midBot = cylBot;
  const midTop = slurryLvl + cylH * 0.14;
  const midGrad = g.createLinearGradient(cx, midTop, cx, midBot);
  midGrad.addColorStop(0, 'rgba(145,85,35,0.60)');
  midGrad.addColorStop(1, 'rgba(118,58,22,0.85)');
  g.beginPath();
  g.moveTo(cx - tankR + 2, midTop); g.lineTo(cx + tankR - 2, midTop);
  g.lineTo(cx + tankR - 2, midBot); g.lineTo(cx - tankR + 2, midBot); g.closePath();
  g.fillStyle = midGrad; g.fill();

  // Top clear water layer
  const waterGrad = g.createLinearGradient(cx, slurryLvl, cx, midTop);
  waterGrad.addColorStop(0, 'rgba(100,155,210,0.30)');
  waterGrad.addColorStop(1, 'rgba(140,105,55,0.45)');
  g.beginPath();
  g.moveTo(cx - tankR + 2, slurryLvl); g.lineTo(cx + tankR - 2, slurryLvl);
  g.lineTo(cx + tankR - 2, midTop); g.lineTo(cx - tankR + 2, midTop); g.closePath();
  g.fillStyle = waterGrad; g.fill();

  // Slurry surface subtle ripples
  g.save(); g.globalAlpha = 0.22 + 0.08 * Math.sin(frame * 0.05);
  g.strokeStyle = 'rgba(160,190,230,0.55)'; g.lineWidth = 0.8;
  for (let r = 0; r < 3; r++) {
    const rr = tankR * (0.25 + r * 0.28);
    g.beginPath(); g.ellipse(cx, slurryLvl, rr, rr * 0.07, 0, 0, Math.PI*2); g.stroke();
  }
  g.restore();

  // ── SETTLING PARTICLES ──
  for (let p = 0; p < 18; p++) {
    const seed = p * 137.5;
    const px = cx - tankR * 0.8 + (((seed * 11) % (tankR * 1.6)));
    const speed = 0.3 + (p % 4) * 0.12;
    const py = slurryLvl + 4 + ((frame * speed + seed) % (cylBot - slurryLvl - 8));
    const size = 1.2 + (p % 3) * 0.5;
    if (px > cx - tankR + 8 && px < cx + tankR - 8 && py < cylBot - 2) {
      g.beginPath(); g.arc(px, py, size, 0, Math.PI*2);
      g.fillStyle = `rgba(160,90,40,${0.3 + (p%3)*0.12})`; g.fill();
    }
  }

  // ── TANK WALLS ──
  // Cylinder side walls
  const wallGrad = g.createLinearGradient(cx - tankR, 0, cx + tankR, 0);
  wallGrad.addColorStop(0,   '#1a3a6a');
  wallGrad.addColorStop(0.08,'#2a5090');
  wallGrad.addColorStop(0.92,'#2a5090');
  wallGrad.addColorStop(1,   '#1a3a6a');
  g.strokeStyle = '#2a5090'; g.lineWidth = 3;
  // Left wall
  g.beginPath(); g.moveTo(cx - tankR, tankTop); g.lineTo(cx - tankR, cylBot); g.stroke();
  // Right wall
  g.beginPath(); g.moveTo(cx + tankR, tankTop); g.lineTo(cx + tankR, cylBot); g.stroke();
  // Cone walls
  g.beginPath(); g.moveTo(cx - tankR, cylBot); g.lineTo(cx, coneBot); g.stroke();
  g.beginPath(); g.moveTo(cx + tankR, cylBot); g.lineTo(cx, coneBot); g.stroke();
  // Top rim
  g.beginPath(); g.ellipse(cx, tankTop, tankR, tankR * 0.12, 0, 0, Math.PI*2);
  g.strokeStyle = '#2a5090'; g.lineWidth = 2.5; g.stroke();

  // ── SAFETY RAILING (yellow) ──
  g.save();
  g.strokeStyle = 'rgba(220,185,45,0.75)'; g.lineWidth = 2;
  g.beginPath(); g.ellipse(cx, tankTop - 6, tankR + 2, tankR * 0.12 + 1, 0, 0, Math.PI*2); g.stroke();
  // Posts
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const rx2 = (tankR + 2) * Math.cos(ang);
    const ry2 = (tankR * 0.12 + 1) * Math.sin(ang);
    g.beginPath();
    g.moveTo(cx + rx2, tankTop - 6 + ry2);
    g.lineTo(cx + rx2, tankTop - 6 + ry2 - 8);
    g.stroke();
  }
  g.restore();

  // ── BRIDGE / TRUSS ──
  g.save();
  g.strokeStyle = 'rgba(40,180,80,0.85)'; g.lineWidth = 3.5;
  g.beginPath(); g.moveTo(cx - tankR, tankTop - 6); g.lineTo(cx + tankR, tankTop - 6); g.stroke();
  g.lineWidth = 1.5; g.strokeStyle = 'rgba(40,180,80,0.55)';
  for (let t = -3; t <= 3; t++) {
    const bx = cx + t * (tankR / 3.2);
    g.beginPath(); g.moveTo(bx, tankTop - 6); g.lineTo(bx + (tankR/3.2)*0.5, tankTop - 14); g.stroke();
    g.beginPath(); g.moveTo(bx, tankTop - 6); g.lineTo(bx - (tankR/3.2)*0.5, tankTop - 14); g.stroke();
  }
  g.lineWidth = 2; g.strokeStyle = 'rgba(40,180,80,0.75)';
  g.beginPath(); g.moveTo(cx - tankR, tankTop - 14); g.lineTo(cx + tankR, tankTop - 14); g.stroke();
  g.restore();

  // ── MOTORS on bridge (right side) ──
  g.save(); g.globalAlpha = 0.90;
  const motorGrad = g.createLinearGradient(cx + tankR - 34, tankTop - 26, cx + tankR - 10, tankTop - 8);
  motorGrad.addColorStop(0, '#2a4878'); motorGrad.addColorStop(1, '#3a6aaa');
  g.fillStyle = motorGrad; g.strokeStyle = 'rgba(40,80,160,0.6)'; g.lineWidth = 1;
  g.beginPath(); g.roundRect(cx + tankR - 34, tankTop - 26, 24, 16, 3); g.fill(); g.stroke();
  g.fillStyle = 'rgba(200,230,255,0.95)'; g.font = 'bold 6px JetBrains Mono'; g.textAlign = 'center';
  g.fillText('MOTOR', cx + tankR - 22, tankTop - 16);
  // spinning dot
  const mAng = frame * 0.09;
  g.fillStyle = '#ffcc44';
  g.beginPath(); g.arc(cx + tankR - 22 + Math.cos(mAng) * 5, tankTop - 20 + Math.sin(mAng) * 3, 2, 0, Math.PI*2); g.fill();
  // Red indicator light
  g.fillStyle = '#ff3333';
  g.beginPath(); g.arc(cx + tankR - 14, tankTop - 22, 3, 0, Math.PI*2); g.fill();
  g.restore();

  // ── CENTRAL SHAFT ──
  const shaftW = 8;
  const shaftGrad = g.createLinearGradient(cx - shaftW/2, 0, cx + shaftW/2, 0);
  shaftGrad.addColorStop(0, '#555a66'); shaftGrad.addColorStop(0.5, '#c0c4cc'); shaftGrad.addColorStop(1, '#444850');
  g.fillStyle = shaftGrad;
  g.beginPath(); g.roundRect(cx - shaftW/2, tankTop - 14, shaftW, coneBot - tankTop + 14, 2); g.fill();
  g.strokeStyle = 'rgba(30,35,45,0.7)'; g.lineWidth = 0.8; g.stroke();

  // ── RAKE ARMS (rotating) ──
  const rakeAngle = frame * 0.022; // slow rotation
  const rakeY = cylBot - cylH * 0.15;
  g.save();
  g.translate(cx, rakeY);
  g.rotate(-rakeAngle);
  // 4 arms at 90°
  for (let arm = 0; arm < 4; arm++) {
    g.save();
    g.rotate(arm * Math.PI / 2);
    const armLen = arm % 2 === 0 ? tankR * 0.82 : tankR * 0.58;
    // Arm beam
    g.strokeStyle = 'rgba(40,185,80,0.88)'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, 0); g.lineTo(armLen, 0); g.stroke();
    // Rake teeth
    const teethCount = arm % 2 === 0 ? 5 : 4;
    for (let t = 1; t <= teethCount; t++) {
      const tx = armLen * (t / (teethCount + 1));
      g.strokeStyle = 'rgba(40,185,80,0.60)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(tx, 0); g.lineTo(tx, 7); g.stroke();
    }
    g.restore();
  }
  // Hub
  g.fillStyle = '#4a5060'; g.strokeStyle = '#888'; g.lineWidth = 1;
  g.beginPath(); g.arc(0, 0, 6, 0, Math.PI*2); g.fill(); g.stroke();
  g.restore();

  // ── FEED INLET PIPE (left side) ──
  const feedY = tankTop + cylH * 0.35;
  g.save();
  g.strokeStyle = 'rgba(170,100,45,0.85)'; g.lineWidth = 6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx - tankR - 30, feedY); g.lineTo(cx - tankR + 2, feedY); g.stroke();
  // Flange
  g.strokeStyle = 'rgba(130,80,35,0.9)'; g.lineWidth = 2;
  g.beginPath(); g.roundRect(cx - tankR - 4, feedY - 8, 5, 16, 1); g.fill(); g.stroke();
  // Feed flow particles
  for (let fp = 0; fp < 4; fp++) {
    const fpos = ((frame * 2 + fp * 9) % 32);
    const fx = cx - tankR - 28 + fpos;
    if (fx < cx - tankR) {
      g.beginPath(); g.arc(fx, feedY + (Math.sin(fp * 1.2) * 1.5), 2.5, 0, Math.PI*2);
      g.fillStyle = `rgba(160,90,40,0.75)`; g.fill();
    }
  }
  // Label
  g.fillStyle = 'rgba(140,75,20,0.75)'; g.font = '500 7px JetBrains Mono'; g.textAlign = 'center';
  g.fillText('FEED IN', cx - tankR - 16, feedY - 10);
  g.restore();

  // ── OVERFLOW water at edge ──
  const overflowX = cx + tankR;
  g.save();
  for (let ow = 0; ow < 3; ow++) {
    const owY = tankTop + 8 + ((frame * 1.2 + ow * 10) % 22);
    g.globalAlpha = 0.55 - ow * 0.12;
    g.strokeStyle = 'rgba(120,185,245,0.80)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(overflowX - 2, owY); g.lineTo(overflowX + 16, owY); g.stroke();
  }
  g.restore();
  g.fillStyle = 'rgba(30,80,160,0.60)'; g.font = '500 7px JetBrains Mono'; g.textAlign = 'center';
  g.fillText('OVERFLOW', overflowX + 14, tankTop - 2);

  // ── SOLIDS CREEPING INWARD ──
  g.save();
  for (let sp = 0; sp < 8; sp++) {
    const seed2 = sp * 23.7;
    const startX = cx - tankR * 0.9 + ((seed2 * 7) % (tankR * 1.8));
    const inwardProgress = ((frame * 0.15 + seed2) % (tankR * 0.85));
    const spX = startX > cx ? startX - inwardProgress * 0.4 : startX + inwardProgress * 0.4;
    const spY = cylBot - 6 + (sp % 3) * 4;
    if (spX > cx - tankR + 10 && spX < cx + tankR - 10 && spY < cylBot + 4) {
      g.beginPath(); g.arc(spX, spY, 2.5, 0, Math.PI*2);
      g.fillStyle = `rgba(100,45,15,0.55)`; g.fill();
    }
  }
  g.restore();

  // ── UNDERFLOW DISCHARGE ──
  const ufW = 8;
  g.save();
  g.strokeStyle = 'rgba(90,35,10,0.95)'; g.lineWidth = ufW; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx, coneBot); g.lineTo(cx, coneBot + 28); g.stroke();
  // Pulsing flow
  const pulse = 0.7 + 0.3 * Math.sin(frame * 0.18);
  for (let uf = 0; uf < 5; uf++) {
    const ufProgress = ((frame * 1.5 + uf * 7) % 30);
    g.globalAlpha = pulse * (0.8 - uf * 0.12);
    g.beginPath(); g.arc(cx + (Math.sin(uf) * 2), coneBot + 4 + ufProgress, 3.5, 0, Math.PI*2);
    g.fillStyle = 'rgba(85,30,8,0.90)'; g.fill();
  }
  g.fillStyle = 'rgba(90,35,10,0.60)'; g.font = '500 7px JetBrains Mono'; g.textAlign = 'center'; g.globalAlpha = 1;
  g.fillText('UNDERFLOW', cx, coneBot + 44);
  g.restore();

  // ── DENSITY GRADIENT LABEL ──
  g.save();
  g.fillStyle = 'rgba(30,80,160,0.65)'; g.font = '500 7px JetBrains Mono'; g.textAlign = 'left';
  g.fillText('CLEAR WATER', cx - tankR - 2, slurryLvl + cylH * 0.07);
  g.fillStyle = 'rgba(120,65,20,0.70)';
  g.fillText('DILUTE SLURRY', cx - tankR - 2, midTop + (cylBot - midTop) * 0.5);
  g.fillStyle = 'rgba(90,35,10,0.70)';
  g.fillText('DENSE SOLIDS', cx - tankR - 2, (cylBot + coneBot) * 0.5);
  g.restore();

  // ── TITLE ──
  g.save();
  g.fillStyle = 'rgba(30,80,160,0.60)'; g.font = '500 8px JetBrains Mono'; g.textAlign = 'center';
  g.fillText('THICKENER — CROSS SECTION', cx, H * 0.045);
  g.restore();

  // ── SAVE BURST ──
  if (burst > 0) {
    const bAlpha = Math.min(1, burst / 18);
    for (let b = 0; b < 20; b++) {
      const ang = (b / 20) * Math.PI * 2;
      const dist = (1 - bAlpha) * W * 0.18;
      g.beginPath(); g.arc(cx + Math.cos(ang)*dist, (H*0.5) + Math.sin(ang)*dist*0.55, 2, 0, Math.PI*2);
      g.fillStyle = `rgba(45,150,220,${(bAlpha*0.8).toFixed(2)})`; g.fill();
    }
    g.save(); g.globalAlpha = bAlpha * 0.95;
    g.shadowColor = '#3aaa6a'; g.shadowBlur = 20;
    g.strokeStyle = '#3aaa6a'; g.lineWidth = 3.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx-14, H*0.80); g.lineTo(cx-3, H*0.80+11); g.lineTo(cx+16, H*0.80-11); g.stroke();
    g.restore();
  }

  // Update density bar
  const densityFill = document.getElementById('thickDensityFill');
  if (densityFill) {
    const dens = parseFloat(stageParams.thickner.underflowDensity) || 2.01;
    const pct = Math.min(((dens - 2.01) / (2.1 - 2.01)) * 100, 100);
    densityFill.style.width = pct + '%';
  }
}


  return {
    tick() { if(thickMiniSaveBurst>0) thickMiniSaveBurst-=0.5; drawThickMini(thickMiniFrame, thickMiniSaveBurst); thickMiniFrame++; },
    burst(){ thickMiniSaveBurst=20; },
    touch(){ thickMiniActive=true; clearTimeout(t); t=setTimeout(()=>{thickMiniActive=false},800); },
  }
}
