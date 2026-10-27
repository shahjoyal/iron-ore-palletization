/* Ported from the original dashboard: drawing routines are unchanged.
 * They run inside a factory so each canvas gets its own state and the
 * React app only talks to the returned { tick, burst, touch } API. */
import { clamp, safeNum, safeRadialGradient, safeLinearGradient, hslTempColor } from './helpers.js'

export const CANVAS_ID = 'filterMiniCanvas'

export function createFilterScene(canvas, stageParams) {
  const document = {
    getElementById: (id) => (id === CANVAS_ID ? canvas : window.document.getElementById(id)),
    querySelectorAll: (s) => window.document.querySelectorAll(s),
  }
  let t = null

let filterMiniFrame = 0, filterMiniAnimId = null, filterMiniSaveBurst = 0;

function drawFilterMini(frame, burst) {
  const canvas = document.getElementById('filterMiniCanvas');
  if (!canvas) return;
  const W = canvas.parentElement.clientWidth || 380;
  const H = canvas.parentElement.clientHeight || 380;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = W * ratio; canvas.height = H * ratio;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const g = canvas.getContext('2d');
  g.scale(ratio, ratio);

  // ── WHITE BACKGROUND ──
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, W, H);

  // Subtle light grid
  g.strokeStyle = 'rgba(200,145,42,0.06)'; g.lineWidth = 1;
  for(let x=0;x<W;x+=22){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}
  for(let y=0;y<H;y+=22){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}

  // ── LAYOUT ──
  // Machine occupies top ~45% of canvas
  // Below: filtrate chamber (left), cake collection hopper (right)
  const bodyX = W*0.07, bodyW = W*0.86, bodyH = H*0.30, bodyY = H*0.13;
  const bodyMidY = bodyY + bodyH/2;

  // ── TITLE ──
  g.fillStyle = '#1a3057'; g.font = '600 8px JetBrains Mono'; g.textAlign = 'center';
  g.fillText('VACUUM DISK FILTER', W/2, bodyY - 7);

  // ── SLURRY FEED TROUGH (left side, below drum) ──
  const troughX = bodyX, troughW = bodyW*0.28, troughH = H*0.09, troughY = bodyY + bodyH + H*0.02;
  const troughGrad = g.createLinearGradient(troughX, troughY, troughX+troughW, troughY+troughH);
  troughGrad.addColorStop(0, '#9a5830'); troughGrad.addColorStop(1, '#6b3f22');
  g.fillStyle = troughGrad; g.strokeStyle = '#5a3015'; g.lineWidth = 1.5;
  g.beginPath(); g.roundRect(troughX, troughY, troughW, troughH, 4); g.fill(); g.stroke();
  // Slurry surface shine
  g.fillStyle = 'rgba(180,120,70,0.30)';
  g.beginPath(); g.ellipse(troughX+troughW/2, troughY+4, troughW*0.42, 3, 0, 0, Math.PI*2); g.fill();
  // Slurry bubbles
  for (let sp = 0; sp < 5; sp++) {
    const bx = troughX + 8 + ((frame*1.4+sp*19)%( troughW-16));
    const by = troughY + 5 + (sp%2)*3;
    g.globalAlpha = 0.55; g.fillStyle = '#b06040';
    g.beginPath(); g.arc(bx, by, 2, 0, Math.PI*2); g.fill();
  }
  g.globalAlpha = 1;
  g.fillStyle = '#7a4a20'; g.font = '500 7px JetBrains Mono'; g.textAlign = 'center';
  g.fillText('SLURRY FEED', troughX + troughW/2, troughY + troughH + 9);

  // Feed pipe from trough up into drum left wall
  g.strokeStyle = '#7a5a3a'; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath();
  g.moveTo(troughX + troughW*0.5, troughY);
  g.lineTo(troughX + troughW*0.5, bodyY + bodyH);
  g.stroke();

  // ── MAIN DRUM BODY ──
  const drumGrad = g.createLinearGradient(bodyX, bodyY, bodyX, bodyY+bodyH);
  drumGrad.addColorStop(0, '#d4d8dc'); drumGrad.addColorStop(0.35, '#c9ced3'); drumGrad.addColorStop(1, '#9aa0a8');
  g.fillStyle = drumGrad; g.strokeStyle = '#7a8090'; g.lineWidth = 2;
  g.shadowColor = 'rgba(0,0,0,0.18)'; g.shadowBlur = 10;
  g.beginPath(); g.roundRect(bodyX, bodyY, bodyW, bodyH, 6); g.fill(); g.stroke();
  g.shadowBlur = 0;
  // Top shine
  g.fillStyle = 'rgba(255,255,255,0.22)';
  g.beginPath(); g.roundRect(bodyX+5, bodyY+4, bodyW-10, bodyH*0.22, 4); g.fill();

  // ── BLUE FRAME STRUTS ──
  g.fillStyle = '#1e5bb8'; g.strokeStyle = '#0e3580'; g.lineWidth = 1;
  g.beginPath(); g.roundRect(bodyX-7, bodyY+bodyH*0.15, 8, bodyH*0.70, 2); g.fill(); g.stroke();
  g.beginPath(); g.roundRect(bodyX+bodyW-1, bodyY+bodyH*0.15, 8, bodyH*0.70, 2); g.fill(); g.stroke();
  // Floor legs
  g.fillStyle = '#1e5bb8';
  [[bodyX-4, bodyY+bodyH, 6, H*0.10], [bodyX+bodyW-2, bodyY+bodyH, 6, H*0.10]].forEach(([lx,ly,lw,lh])=>{
    g.beginPath(); g.roundRect(lx, ly, lw, lh, 1); g.fill();
  });

  // ── ROTATING DISCS ──
  const nDiscs = 7;
  const discAreaX = bodyX + bodyW*0.08;
  const discAreaW = bodyW*0.82;
  const discRx = bodyW*0.052, discRy = bodyH*0.43;
  const shaftY = bodyMidY - bodyH*0.02;

  for (let d = 0; d < nDiscs; d++) {
    const dx = discAreaX + (d / (nDiscs-1)) * discAreaW;
    const rot = frame * 0.016 + d * (Math.PI*2 / nDiscs);

    g.save(); g.translate(dx, shaftY);

    // Disc drop shadow on white bg
    g.globalAlpha = 0.10; g.fillStyle = '#000';
    g.beginPath(); g.ellipse(4, discRy*0.95, discRx*0.88, discRy*0.10, 0, 0, Math.PI*2); g.fill();
    g.globalAlpha = 1;

    g.rotate(rot);

    // Disc body — dark grey so it contrasts on white
    const dg = safeRadialGradient(g,0, 0, discRy*0.1, 0, 0, discRy);
    dg.addColorStop(0, '#555'); dg.addColorStop(0.6, '#3a3a3a'); dg.addColorStop(1, '#222');
    g.fillStyle = dg; g.strokeStyle = 'rgba(80,80,80,0.5)'; g.lineWidth = 1;
    g.beginPath(); g.ellipse(0, 0, discRx, discRy, 0, 0, Math.PI*2); g.fill(); g.stroke();

    // Filter cake crust on disc sectors (dark chocolate brown, clearly visible on white)
    for(let sec = 0; sec < 8; sec++){
      const a1 = sec*Math.PI/4; const a2 = a1 + Math.PI/4 - 0.08;
      const cakeThick = 0.18 + 0.10*Math.abs(Math.sin(rot*0.8 + sec*0.6));
      const innerR = discRy*(0.72 - cakeThick);
      const outerR = discRy*0.96;
      g.beginPath();
      g.arc(0, 0, outerR, a1, a2);
      g.arc(0, 0, innerR, a2, a1, true);
      g.closePath();
      // Cake colour: dark brown-grey, clearly visible
      g.fillStyle = sec%2===0 ? '#4a3520' : '#3a2810';
      g.strokeStyle = 'rgba(80,55,25,0.5)'; g.lineWidth = 0.6;
      g.globalAlpha = 0.75 + 0.20*Math.sin(a1*2+rot);
      g.fill(); g.stroke();
    }
    g.globalAlpha = 1;

    // Radial sector lines
    for (let seg = 0; seg < 8; seg++) {
      const a = seg * Math.PI / 4;
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 0.6;
      g.beginPath(); g.moveTo(0,0); g.lineTo(Math.cos(a)*discRx*0.94, Math.sin(a)*discRy*0.94); g.stroke();
    }

    // Hub
    g.fillStyle = '#aab0b8'; g.strokeStyle = '#d0d5da'; g.lineWidth = 0.8;
    g.beginPath(); g.arc(0, 0, discRx*0.20, 0, Math.PI*2); g.fill(); g.stroke();

    g.restore();
  }

  // ── CENTRAL SHAFT ──
  g.strokeStyle = '#8090a0'; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(bodyX+8, shaftY); g.lineTo(bodyX+bodyW-8, shaftY); g.stroke();
  g.strokeStyle = 'rgba(240,245,255,0.5)'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(bodyX+8, shaftY-1.5); g.lineTo(bodyX+bodyW-8, shaftY-1.5); g.stroke();

  // ── SCRAPER BLADE (right side of drum) ──
  const scraperX = bodyX + bodyW*0.88;
  const scraperY = bodyY + bodyH*0.62;
  g.fillStyle = '#5a6575'; g.strokeStyle = '#8898aa'; g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(scraperX - 6, scraperY - 8);
  g.lineTo(scraperX + 8, scraperY - 2);
  g.lineTo(scraperX + 6, scraperY + 8);
  g.lineTo(scraperX - 8, scraperY + 3);
  g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#7a8898'; g.font = '500 6px JetBrains Mono'; g.textAlign = 'center';
  g.fillText('SCRAPER', scraperX, scraperY + 17);

  // ── FILTRATE WATER CHAMBER (left-center, below drum) ──
  const chamX = bodyX + bodyW*0.05, chamW = bodyW*0.50;
  const chamY = bodyY + bodyH + H*0.02, chamH = H*0.11;
  // Chamber walls (light blue tinted)
  const chamGrad = g.createLinearGradient(chamX, chamY, chamX, chamY+chamH);
  chamGrad.addColorStop(0, 'rgba(180,225,255,0.60)');
  chamGrad.addColorStop(1, 'rgba(100,190,255,0.35)');
  g.fillStyle = chamGrad; g.strokeStyle = '#2d9fda'; g.lineWidth = 1.5;
  g.beginPath(); g.roundRect(chamX, chamY, chamW, chamH, 4); g.fill(); g.stroke();
  // Water surface ripple
  for(let rip=0; rip<4; rip++){
    const rx = chamX + chamW*0.1 + ((frame*1.2+rip*25)%( chamW*0.80));
    g.globalAlpha = 0.22; g.strokeStyle = '#34b6ff'; g.lineWidth = 1.5;
    g.beginPath(); g.ellipse(rx, chamY+chamH*0.50, 8, 2.5, 0, 0, Math.PI*2); g.stroke();
  }
  g.globalAlpha = 1;
  g.fillStyle = '#1a6aa0'; g.font = '600 7px JetBrains Mono'; g.textAlign = 'center';
  g.fillText('FILTRATE WATER', chamX+chamW/2, chamY+chamH+10);

  // Filtrate water streams falling from disc bottom into chamber
  for(let w = 0; w < 6; w++){
    const wx = chamX + chamW*0.08 + w*(chamW*0.16);
    const fallDist = bodyH*0.38 + H*0.02;
    const progress = ((frame*2.2 + w*18) % fallDist) / fallDist;
    const wy = bodyY + bodyH*0.60 + progress * fallDist;
    const alpha = 0.80 - progress*0.40;
    g.globalAlpha = alpha;
    g.fillStyle = '#34b6ff';
    // Droplet elongated
    g.beginPath(); g.roundRect(wx-2, wy, 4, 8+progress*5, 2); g.fill();
    // Sparkle at top
    g.globalAlpha = alpha * 0.5;
    g.fillStyle = '#aaddff';
    g.beginPath(); g.arc(wx, wy, 2, 0, Math.PI*2); g.fill();
  }
  g.globalAlpha = 1;

  // Drain outlet pipe
  const drainX = chamX + chamW*0.38;
  g.strokeStyle = '#4a7a9a'; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(drainX, chamY+chamH); g.lineTo(drainX, chamY+chamH+H*0.05); g.stroke();
  // Animated drain drop
  const drainProg = ((frame*2)%(H*0.05))/(H*0.05);
  g.fillStyle = '#34b6ff'; g.globalAlpha = 0.70;
  g.beginPath(); g.arc(drainX, chamY+chamH+drainProg*H*0.05, 3, 0, Math.PI*2); g.fill();
  g.globalAlpha = 1;

  // ── FILTER CAKE COLLECTION HOPPER (right, below drum) ──
  const hopperX = bodyX + bodyW*0.62;
  const hopperTopY = bodyY + bodyH + H*0.02;
  const hopperW = bodyW*0.30, hopperTopH = H*0.04;
  // Hopper walls — clearly visible trapezoid
  const hopperBotW = hopperW * 0.55;
  const hopperBotY = hopperTopY + H*0.18;
  const hopperBotX = hopperX + (hopperW - hopperBotW)*0.5;

  // Hopper body fill (light warm grey so cake chunks inside are visible)
  g.fillStyle = '#f0ede8'; g.strokeStyle = '#8890a0'; g.lineWidth = 1.8;
  g.beginPath();
  g.moveTo(hopperX, hopperTopY);
  g.lineTo(hopperX+hopperW, hopperTopY);
  g.lineTo(hopperBotX+hopperBotW, hopperBotY);
  g.lineTo(hopperBotX, hopperBotY);
  g.closePath(); g.fill(); g.stroke();

  // Hopper label
  g.fillStyle = '#3a3020'; g.font = '600 7px JetBrains Mono'; g.textAlign = 'center';
  g.fillText('FILTER CAKE', hopperX+hopperW/2, hopperTopY - 4);

  // ── CAKE CHUNKS FALLING FROM SCRAPER INTO HOPPER ──
  // Fall zone: from scraper position down into hopper
  const fallStartX = scraperX;
  const fallStartY = scraperY + 12;
  const fallEndY = hopperBotY - 10;
  const fallTargetX = hopperX + hopperW*0.50;

  for(let ck = 0; ck < 6; ck++){
    const seed = ck * 27;
    const progress = ((frame*1.0 + seed) % 90) / 90; // 0→1 = top to bottom
    if(progress < 0.05) continue; // brief gap between chunks
    // Parabolic arc: start at scraper, land in hopper center
    const cx2 = fallStartX + (fallTargetX - fallStartX)*progress;
    const cy2 = fallStartY + (fallEndY - fallStartY)*progress + 30*progress*(progress-1)*(-2.5);
    const alpha = Math.min(1, progress*10); // fade in quickly
    g.globalAlpha = alpha * 0.92;

    // Cake chunk — clearly dark brown, irregular polygon
    const sz = 7 + (ck%3)*3;
    const offsets = [
      [0,-sz*0.5],[sz*0.4,-sz*0.2],[sz*0.45,sz*0.3],
      [sz*0.1,sz*0.55],[-sz*0.35,sz*0.45],[-sz*0.5,sz*0.0],[-sz*0.2,-sz*0.4]
    ];
    g.fillStyle = ck%3===0?'#3a2810':ck%3===1?'#4a3520':'#2e1e08';
    g.strokeStyle = 'rgba(100,70,30,0.6)'; g.lineWidth = 0.8;
    g.beginPath();
    g.moveTo(cx2+offsets[0][0], cy2+offsets[0][1]);
    offsets.slice(1).forEach(([ox,oy])=>g.lineTo(cx2+ox, cy2+oy));
    g.closePath(); g.fill(); g.stroke();
    // Surface crack lines
    g.strokeStyle = 'rgba(200,160,100,0.25)'; g.lineWidth = 0.5;
    g.beginPath(); g.moveTo(cx2-sz*0.1,cy2-sz*0.2); g.lineTo(cx2+sz*0.15,cy2+sz*0.15); g.stroke();
  }
  g.globalAlpha = 1;

  // ── CAKE PILE ACCUMULATING INSIDE HOPPER ──
  // Draw settled cake chunks inside hopper
  const pileBaseY = hopperBotY - 8;
  const pileRows = [
    { n:4, y:pileBaseY,     xStart:hopperBotX+4,  xSpacing:hopperBotW*0.22 },
    { n:3, y:pileBaseY-9,   xStart:hopperBotX+10, xSpacing:hopperBotW*0.27 },
    { n:2, y:pileBaseY-17,  xStart:hopperBotX+18, xSpacing:hopperBotW*0.38 },
  ];
  pileRows.forEach((row,ri)=>{
    for(let pi=0; pi<row.n; pi++){
      const px = row.xStart + pi*row.xSpacing;
      const py = row.y;
      const colours=['#4a3520','#3a2810','#2e1e08','#5a4028'];
      g.fillStyle = colours[(ri*4+pi)%4]; g.strokeStyle='rgba(80,55,25,0.4)'; g.lineWidth=0.6;
      g.beginPath(); g.roundRect(px, py, 10+ri*2, 7, 1.5); g.fill(); g.stroke();
    }
  });

  // ── LIVE VALUE TAGS ──
  const vac = parseFloat(stageParams.filter.vacuumPressure) || -600;
  const moisture = parseFloat(stageParams.filter.cakeMoisture) || 8;
  const moistPct = Math.max(0, Math.min((moisture-8)/5, 1));

  // Small SCADA-style data chips
  const chips = [
    { label:'VACUUM', val: vac + ' mbar', x: chamX+chamW*0.50, y: chamY+chamH+H*0.09, bg:'#e8f4ff', border:'#2d9fda', txt:'#1a5a80' },
    { label:'MOISTURE', val: moisture + '%',       x: hopperX+hopperW*0.50, y: hopperBotY+H*0.06,       bg:'#f5ede0', border:'#c8912a', txt:'#7a4a10' },
  ];
  chips.forEach(c=>{
    const cw=74, ch=24;
    g.fillStyle=c.bg; g.strokeStyle=c.border; g.lineWidth=1;
    g.beginPath(); g.roundRect(c.x-cw/2, c.y-ch/2, cw, ch, 4); g.fill(); g.stroke();
    g.fillStyle=c.txt; g.font='500 6px JetBrains Mono'; g.textAlign='center';
    g.fillText(c.label, c.x, c.y-5);
    g.font='700 8px JetBrains Mono';
    g.fillText(c.val, c.x, c.y+6);
  });

  // Update moisture bar in footer
  const mFill = document.getElementById('filterMoistureFill');
  if(mFill) mFill.style.width = (100 - moistPct*100) + '%';

  // ── SAVE BURST ──
  if (burst > 0) {
    const bAlpha = Math.min(1, burst/18);
    g.save(); g.globalAlpha = bAlpha * 0.95;
    g.shadowColor = '#3aaa6a'; g.shadowBlur = 16;
    g.strokeStyle = '#3aaa6a'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(W/2-14, H*0.88); g.lineTo(W/2-3, H*0.88+11); g.lineTo(W/2+16, H*0.88-11); g.stroke();
    g.restore();
  }
}


  return {
    tick() { if(filterMiniSaveBurst>0) filterMiniSaveBurst-=0.5; drawFilterMini(filterMiniFrame, filterMiniSaveBurst); filterMiniFrame++; },
    burst(){ filterMiniSaveBurst=20; },
    touch(){},
  }
}
