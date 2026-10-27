/* Ported from the original dashboard: drawing routines are unchanged.
 * They run inside a factory so each canvas gets its own state and the
 * React app only talks to the returned { tick, burst, touch } API. */
import { clamp, safeNum, safeRadialGradient, safeLinearGradient, hslTempColor } from './helpers.js'

export const CANVAS_ID = 'gbFallCanvas'

export function createGreenballScene(canvas, stageParams) {
  const document = {
    getElementById: (id) => (id === CANVAS_ID ? canvas : window.document.getElementById(id)),
    querySelectorAll: (s) => window.document.querySelectorAll(s),
  }
  let t = null

let gbFrame=0, gbAnimId=null, gbActive=false;
let gbBeltOffset=0;
const GB_BELT_SPEED=1.8; // px per frame

const gbCanvas=document.getElementById('gbFallCanvas');
const gbCtx=gbCanvas.getContext('2d');

function sizeGbCanvas(){
  const wrap=gbCanvas.parentElement;
  const W=Math.max(wrap.clientWidth||440,10);
  const H=Math.max(wrap.clientHeight||300,10);
  const ratio=window.devicePixelRatio||1;
  const wPx=Math.round(W*ratio), hPx=Math.round(H*ratio);
  if(gbCanvas.width!==wPx||gbCanvas.height!==hPx){
    gbCanvas.width=wPx; gbCanvas.height=hPx;
    gbCtx.setTransform(ratio,0,0,ratio,0,0);
  }
  return{W,H};
}

// Pre-generate pellet positions on the belt (static layout, belt scrolls underneath)
let GB_PELLETS=null;
function buildPellets(beltW, beltH, count){
  const pels=[];
  const TILE=beltH*2.6; // vertical repeat tile
  for(let i=0;i<count;i++){
    pels.push({
      lx: (Math.random()-0.15)*beltW,           // local x across belt width
      ly: Math.random()*TILE,                    // local y in tile
      r:  3.2+Math.random()*3.8,                 // radius
      jx: (Math.random()-0.5)*1.2,               // jitter x
      jy: (Math.random()-0.5)*0.6,               // jitter y
      shade: 0.78+Math.random()*0.22,            // brightness 0..1
    });
  }
  return{pels, TILE};
}

function drawConveyorBelt(frame){
  const{W,H}=sizeGbCanvas();
  gbCtx.clearRect(0,0,W,H);

  // ── Light cream background ──
  const bg=gbCtx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#fdf8f0'); bg.addColorStop(1,'#f5ede0');
  gbCtx.fillStyle=bg; gbCtx.fillRect(0,0,W,H);

  // Subtle grid lines on cream background
  gbCtx.strokeStyle='rgba(200,145,42,0.08)'; gbCtx.lineWidth=1;
  for(let gx=0;gx<W;gx+=40){gbCtx.beginPath();gbCtx.moveTo(gx,0);gbCtx.lineTo(gx,H);gbCtx.stroke();}
  for(let gy=0;gy<H;gy+=40){gbCtx.beginPath();gbCtx.moveTo(0,gy);gbCtx.lineTo(W,gy);gbCtx.stroke();}

  // ── Belt geometry — INCLINED straight screen, top-left → bottom-right ──
  const TILT = 0.0;               // zero tilt — belt face is perfectly flat/straight
  const beltH_span = H * 0.96;   // longer — nearly full canvas height
  const centreX = W * 0.50;
  const y1 = H * 0.02;            // top end (nearly at very top)
  const y2 = y1 + beltH_span;    // bottom end (nearly at very bottom)
  const incline = beltH_span * 0.28;  // how much the axis shifts right from top to bottom (incline)
  const x1 = centreX + incline * 0.5;   // top end — shifted right
  const x2 = centreX - incline * 0.5;   // bottom end — shifted left

  const beltDX = x2 - x1;
  const beltDY = y2 - y1;
  const beltLen = Math.sqrt(beltDX*beltDX + beltDY*beltDY);

  // Belt thickness — same as before (fraction of W now, since belt is vertical)
  const BELT_THK = W * 0.52;

  // Perpendicular normal pointing LEFT from the belt axis (belt face toward viewer)
  const nxU =  beltDY / beltLen;   // points horizontally outward
  const nyU = -beltDX / beltLen;

  // Four belt corners:
  // "BL" = bottom of top drum (left face), "BR" = bottom of bottom drum (right face)
  // We use L/R to mean the two side edges of the vertical belt
  const bL1 = {x: x1 - nxU*BELT_THK*0.5, y: y1 - nyU*BELT_THK*0.5}; // top-left corner
  const bR1 = {x: x1 + nxU*BELT_THK*0.5, y: y1 + nyU*BELT_THK*0.5}; // top-right corner
  const bR2 = {x: x2 + nxU*BELT_THK*0.5, y: y2 + nyU*BELT_THK*0.5}; // bottom-right corner
  const bL2 = {x: x2 - nxU*BELT_THK*0.5, y: y2 - nyU*BELT_THK*0.5}; // bottom-left corner

  // ── END DRUMS (top and bottom) ──
  [[bL1,bR1,'top'],[bL2,bR2,'bottom']].forEach(([lpt,rpt,side])=>{
    const mx=(lpt.x+rpt.x)/2, my=(lpt.y+rpt.y)/2;
    const dr=BELT_THK/2;
    const dg=safeRadialGradient(gbCtx,mx-dr*0.2,my-dr*0.25,0,mx,my,dr);
    dg.addColorStop(0,'#8a9aaa'); dg.addColorStop(0.5,'#4a5a6a'); dg.addColorStop(1,'#1e2c3c');
    gbCtx.fillStyle=dg;
    gbCtx.beginPath(); gbCtx.ellipse(mx,my,dr,dr*0.18,0,0,Math.PI*2); gbCtx.fill();
    gbCtx.strokeStyle='rgba(60,80,100,0.8)'; gbCtx.lineWidth=2.5; gbCtx.stroke();
    for(let b=0;b<6;b++){
      const ba=b*Math.PI/3;
      const bx2=mx+Math.cos(ba)*dr*0.55, by2=my+Math.sin(ba)*dr*0.55*0.18;
      gbCtx.fillStyle='rgba(70,90,110,0.9)';
      gbCtx.beginPath(); gbCtx.arc(bx2,by2,1.5,0,Math.PI*2); gbCtx.fill();
    }
  });

  // ── UNDERSIDE ROLLERS along the belt length ──
  const rollerCount=10;
  for(let ri=1;ri<rollerCount;ri++){
    const rt=ri/rollerCount;
    const rx=x1+rt*beltDX, ry=y1+rt*beltDY;
    const rcx=rx - nxU*BELT_THK*0.54, rcy=ry - nyU*BELT_THK*0.54;
    const rr=BELT_THK*0.055;
    const rg=safeRadialGradient(gbCtx,rcx-rr*0.3,rcy-rr*0.15,0,rcx,rcy,rr);
    rg.addColorStop(0,'#6a7a8a'); rg.addColorStop(0.7,'#2e3e50'); rg.addColorStop(1,'#141e28');
    gbCtx.fillStyle=rg;
    gbCtx.beginPath(); gbCtx.ellipse(rcx,rcy,rr,rr*0.28,0,0,Math.PI*2); gbCtx.fill();
    gbCtx.strokeStyle='rgba(70,100,130,0.6)'; gbCtx.lineWidth=1; gbCtx.stroke();
  }

  // ── BELT SURFACE + PELLETS (clipped to parallelogram) ──
  gbCtx.save();
  gbCtx.beginPath();
  gbCtx.moveTo(bL1.x,bL1.y); gbCtx.lineTo(bR1.x,bR1.y);
  gbCtx.lineTo(bR2.x,bR2.y); gbCtx.lineTo(bL2.x,bL2.y);
  gbCtx.closePath();
  gbCtx.clip();

  // Belt rubber base
  const bGr=gbCtx.createLinearGradient(bL1.x,bL1.y,bR1.x,bR1.y);
  bGr.addColorStop(0,'#1e2830'); bGr.addColorStop(0.45,'#151c24'); bGr.addColorStop(1,'#0e1520');
  gbCtx.fillStyle=bGr; gbCtx.fillRect(-10,-10,W+20,H+20);

  // Transverse ribs moving with belt (now horizontal bands scrolling downward)
  const ribSpacing=14;
  const ribOff=gbActive?(gbBeltOffset*GB_BELT_SPEED)%ribSpacing:0;
  gbCtx.strokeStyle='rgba(38,52,62,0.9)'; gbCtx.lineWidth=1.1;
  for(let r=-2;r<beltLen/ribSpacing+2;r++){
    const t=(r*ribSpacing+ribOff)/beltLen;
    const rx2=x1+t*beltDX, ry2=y1+t*beltDY;
    gbCtx.beginPath();
    gbCtx.moveTo(rx2 - nxU*BELT_THK*0.5, ry2 - nyU*BELT_THK*0.5);
    gbCtx.lineTo(rx2 + nxU*BELT_THK*0.5, ry2 + nyU*BELT_THK*0.5);
    gbCtx.stroke();
  }

  // ── DENSE PELLETS scrolling TOP → BOTTOM ──
  if(!GB_PELLETS){
    const ROWS=80, COLS=28;
    const pels=[];
    for(let row=0;row<ROWS;row++){
      for(let col=0;col<COLS;col++){
        const offset=(col%2)*0.5;
        pels.push({
          col, row: row+offset,
          COLS, ROWS,
          r: 2.4 + Math.random()*1.2,
          jx:(Math.random()-0.5)*2.0,
          jy:(Math.random()-0.5)*1.5,
          shade: 0.65+Math.random()*0.35,
          phase: Math.random()*Math.PI*2,
        });
      }
    }
    GB_PELLETS={pels,ROWS,COLS};
  }

  const{pels,ROWS,COLS}=GB_PELLETS;
  const scrollAlong=gbActive?gbBeltOffset*GB_BELT_SPEED:0;

  for(const p of pels){
    // Cross-belt position (0..1) — across the width
    const crossT = (p.col+0.5)/COLS;
    // Along-belt position scrolling downward (top→bottom)
    const rawAlong = ((p.row/ROWS)*beltLen + scrollAlong + p.jy + beltLen*2) % beltLen;
    const alongT = rawAlong / beltLen;

    // World coords: move along belt axis, spread across belt width
    const wx = x1 + alongT*beltDX + (crossT-0.5)*nxU*BELT_THK*0.90 + p.jx*0.3;
    const wy = y1 + alongT*beltDY + (crossT-0.5)*nyU*BELT_THK*0.90 + p.jy*0.3;

    const r=p.r, s=p.shade;
    const pg=safeRadialGradient(gbCtx,wx-r*0.32,wy-r*0.35,0,wx,wy,r);
    pg.addColorStop(0,   `rgba(${Math.round(118*s)},${Math.round(132*s)},${Math.round(150*s)},1)`);
    pg.addColorStop(0.5, `rgba(${Math.round(48*s)}, ${Math.round(60*s)}, ${Math.round(75*s)},1)`);
    pg.addColorStop(1,   `rgba(10,15,22,1)`);
    gbCtx.beginPath(); gbCtx.arc(wx,wy,r,0,Math.PI*2);
    gbCtx.fillStyle=pg; gbCtx.fill();
    gbCtx.strokeStyle=`rgba(${Math.round(160*s)},${Math.round(185*s)},${Math.round(210*s)},0.75)`;
    gbCtx.lineWidth=0.7; gbCtx.stroke();

    if(s>0.8){
      gbCtx.save(); gbCtx.globalAlpha=0.3;
      gbCtx.fillStyle='rgba(210,230,250,0.9)';
      gbCtx.beginPath(); gbCtx.ellipse(wx-r*0.28,wy-r*0.3,r*0.3,r*0.18,-0.4,0,Math.PI*2); gbCtx.fill();
      gbCtx.restore();
    }
  }

  // Depth vignette — dark at top and bottom edges
  const vig=gbCtx.createLinearGradient(0,y1,0,y2);
  vig.addColorStop(0,'rgba(0,0,0,0.35)'); vig.addColorStop(0.12,'rgba(0,0,0,0)');
  vig.addColorStop(0.88,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,0.28)');
  gbCtx.fillStyle=vig; gbCtx.fillRect(-10,-10,W+20,H+20);

  // Dust rising from pellet layer at bottom
  if(gbActive){
    for(let d=0;d<10;d++){
      const dt=((d/10 + frame*0.003)%1);
      const dBx = x1 + dt*beltDX + (Math.random()-0.5)*BELT_THK*0.4;
      const dBy = y1 + dt*beltDY;
      const rise=(frame*0.4+d*22)%35;
      const alpha=Math.max(0,0.07*(1-rise/35));
      gbCtx.beginPath(); gbCtx.arc(dBx,dBy-rise,5+rise*0.3,0,Math.PI*2);
      gbCtx.fillStyle=`rgba(170,185,195,${alpha})`; gbCtx.fill();
    }
  }

  gbCtx.restore(); // end belt clip

  // ── STEEL FRAME (drawn on top) ──
  const railY='rgba(185,130,15,0.9)';
  // Left guard rail (along left edge of vertical belt)
  gbCtx.strokeStyle=railY; gbCtx.lineWidth=3.5;
  gbCtx.beginPath(); gbCtx.moveTo(bL1.x,bL1.y); gbCtx.lineTo(bL2.x,bL2.y); gbCtx.stroke();
  // Right guard rail
  gbCtx.beginPath(); gbCtx.moveTo(bR1.x,bR1.y); gbCtx.lineTo(bR2.x,bR2.y); gbCtx.stroke();

  // Horizontal cross-braces (support posts now run left-right across the belt)
  gbCtx.strokeStyle=railY; gbCtx.lineWidth=2.5;
  const postTs=[0.0,0.18,0.36,0.54,0.72,0.90,1.0];
  postTs.forEach(t=>{
    const lx=bL1.x+t*(bL2.x-bL1.x), ly=bL1.y+t*(bL2.y-bL1.y);
    const rx=bR1.x+t*(bR2.x-bR1.x), ry=bR1.y+t*(bR2.y-bR1.y);
    gbCtx.beginPath(); gbCtx.moveTo(lx,ly); gbCtx.lineTo(rx,ry); gbCtx.stroke();
    gbCtx.fillStyle='rgba(175,130,20,0.95)';
    gbCtx.beginPath(); gbCtx.arc(lx,ly,3,0,Math.PI*2); gbCtx.fill();
    gbCtx.beginPath(); gbCtx.arc(rx,ry,3,0,Math.PI*2); gbCtx.fill();
  });

  // Outer side panel beneath belt (bottom discharge)
  const panelGr=gbCtx.createLinearGradient(bL2.x,bL2.y,bL2.x+W*0.08,bL2.y);
  panelGr.addColorStop(0,'rgba(38,50,65,0.88)'); panelGr.addColorStop(1,'rgba(18,25,32,0.0)');
  gbCtx.fillStyle=panelGr;
  gbCtx.beginPath(); gbCtx.moveTo(bL2.x,bL2.y); gbCtx.lineTo(bR2.x,bR2.y); gbCtx.lineTo(bR2.x+W*0.06,bR2.y); gbCtx.lineTo(bL2.x-W*0.06,bL2.y); gbCtx.closePath(); gbCtx.fill();

  // Belt edge glow
  gbCtx.save(); gbCtx.shadowColor='rgba(185,130,20,0.35)'; gbCtx.shadowBlur=10;
  gbCtx.strokeStyle='rgba(185,130,20,0.5)'; gbCtx.lineWidth=2;
  gbCtx.beginPath(); gbCtx.moveTo(bL1.x,bL1.y); gbCtx.lineTo(bL2.x,bL2.y); gbCtx.stroke();
  gbCtx.beginPath(); gbCtx.moveTo(bR1.x,bR1.y); gbCtx.lineTo(bR2.x,bR2.y); gbCtx.stroke();
  gbCtx.restore();

  // Status label
  gbCtx.font='500 8px JetBrains Mono'; gbCtx.fillStyle='rgba(130,100,30,0.75)';
  gbCtx.textAlign='right'; gbCtx.fillText('SCREENING CONVEYOR · LIVE',W-8,H-8); gbCtx.textAlign='left';

  // Advance belt
  if(gbActive) gbBeltOffset++;
}

function gbLoop(){
  drawConveyorBelt(gbFrame);
  gbFrame++;
  gbAnimId=requestAnimationFrame(gbLoop);
}

function gbTriggerBurst(){
  gbActive=true;
  const hint=document.getElementById('gbHintLabel');
  if(hint) hint.classList.add('hidden');
  // Update stat tiles
  const moist=document.getElementById('m-gbp-moist');
  const drop=document.getElementById('m-gbp-drop');
  const gcs=document.getElementById('m-gbp-gcs');
  const recycled=document.getElementById('m-recycled');
  if(document.getElementById('gbStatMoist')) document.getElementById('gbStatMoist').textContent=moist&&moist.value?moist.value+'%':'—';
  if(document.getElementById('gbStatDrop'))  document.getElementById('gbStatDrop').textContent=drop&&drop.value?drop.value:'—';
  if(document.getElementById('gbStatGcs'))   document.getElementById('gbStatGcs').textContent=gcs&&gcs.value?gcs.value+' kg':'—';
  if(document.getElementById('gbStatSize'))  document.getElementById('gbStatSize').textContent=recycled&&recycled.value?recycled.value+'%':'—';
}

function attachGbInputListeners(){
  ['m-gbp-moist','m-gbp-drop','m-gbp-gcs','m-gbp-size','m-gbp-por',
   'm-s8','m-s10','m-s12','m-s14','m-recycled','m-recycled-unit'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){ el.addEventListener('input',gbTriggerBurst); el.addEventListener('change',gbTriggerBurst); }
  });
}

  return {
    tick() { drawConveyorBelt(gbFrame); gbFrame++; },
    burst(){},
    touch(){ gbTriggerBurst(); },
  }
}
