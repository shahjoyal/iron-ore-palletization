/* Ported from the original dashboard: drawing routines are unchanged.
 * They run inside a factory so each canvas gets its own state and the
 * React app only talks to the returned { tick, burst, touch } API. */
import { clamp, safeNum, safeRadialGradient, safeLinearGradient, hslTempColor } from './helpers.js'

export const CANVAS_ID = 'coolKilnCanvas'

export function createCoolScene(canvas, stageParams) {
  const document = {
    getElementById: (id) => (id === CANVAS_ID ? canvas : window.document.getElementById(id)),
    querySelectorAll: (s) => window.document.querySelectorAll(s),
  }
  let t = null

let coolAnimId=null, coolFrame=0;
const coolCanvas=document.getElementById('coolKilnCanvas');
const coolCtx=coolCanvas.getContext('2d');

// Live temps read from the input fields inside the card (or fall back to stageParams)
function getCoolLiveTemps(){
  const ids=['cool-z1','cool-z2','cool-z3','cool-z4'];
  return ids.map((id,i)=>{
    const el=document.getElementById(id);
    if(el&&el.value!=='') return Math.max(0,Number(el.value)||0);
    // Check stageParams — if user has saved values, use them; otherwise 0 = silver/steel
    const saved=stageParams.cool['zone'+(i+1)];
    return (saved!==undefined&&saved!==''&&saved!==null)?Math.max(0,Number(saved)||0):0;
  });
}

function sizeCoolCanvas(){
  const wrap=coolCanvas.parentElement;
  const W=Math.max(wrap.clientWidth||440,10);
  const H=Math.max(wrap.clientHeight||260,10);
  const ratio=window.devicePixelRatio||1;
  const wPx=Math.round(W*ratio), hPx=Math.round(H*ratio);
  if(coolCanvas.width!==wPx||coolCanvas.height!==hPx){
    coolCanvas.width=wPx; coolCanvas.height=hPx;
    coolCtx.setTransform(ratio,0,0,ratio,0,0);
  }
  return{W,H};
}

function drawCoolKilnAnim(frame){
  const{W,H}=sizeCoolCanvas();
  const temps=getCoolLiveTemps();
  coolCtx.clearRect(0,0,W,H);

  // Dark background with subtle grid
  const bg=safeLinearGradient(coolCtx,0,0,0,H);
  bg.addColorStop(0,'#0c1520'); bg.addColorStop(1,'#101e30');
  coolCtx.fillStyle=bg; coolCtx.fillRect(0,0,W,H);
  coolCtx.strokeStyle='rgba(80,130,200,0.04)'; coolCtx.lineWidth=0.6;
  for(let gx=0;gx<W;gx+=28){coolCtx.beginPath();coolCtx.moveTo(gx,0);coolCtx.lineTo(gx,H);coolCtx.stroke();}
  for(let gy=0;gy<H;gy+=28){coolCtx.beginPath();coolCtx.moveTo(0,gy);coolCtx.lineTo(W,gy);coolCtx.stroke();}

  // ── Kiln geometry — same proportions as main canvas version ──
  const cx=W*0.5, cy=H*0.46;
  const kilnW=W*0.82, kilnH=H*0.22, slopeY=H*0.10;
  const left=cx-kilnW*0.5, right=cx+kilnW*0.5;
  const topL=cy-kilnH*0.5-slopeY, topR=cy-kilnH*0.5+slopeY;
  const botL=cy+kilnH*0.5-slopeY, botR=cy+kilnH*0.5+slopeY;
  const shellPad=kilnH*0.30;
  const shellTopL=topL-shellPad, shellTopR=topR-shellPad;
  const shellBotL=botL+shellPad, shellBotR=botR+shellPad;

  // Heat colour helpers — silver/steel (no temp) → orange (low) → yellow (mid) → light blue-green (high)
  function heatCol(temp){
    if(!temp || temp<=0) return `rgb(160,165,175)`;
    const t=clamp((temp-50)/(950-50),0,1);
    const r=1-t;
    if(r>=0.75){const s=(r-0.75)/0.25; return `rgb(${Math.round(100-s*20)},${Math.round(220+s*15)},${Math.round(255)})`;}
    if(r>=0.45){const s=(r-0.45)/0.30; return `rgb(${Math.round(250-s*130)},${Math.round(220-s*10)},${Math.round(80+s*175)})`;}
    if(r>=0.18){const s=(r-0.18)/0.27; return `rgb(245,${Math.round(140+s*70)},${Math.round(40+s*40)})`;}
    if(r>0){const s=r/0.18; return `rgb(${Math.round(220+s*20)},${Math.round(100+s*40)},${Math.round(30+s*10)})`;}
    return `rgb(160,165,175)`;
  }
  function heatDark(temp){
    if(!temp||temp<=0) return 'rgb(100,105,115)';
    const t=clamp((temp-50)/(950-50),0,1);
    const r=1-t;
    if(r>=0.75) return 'rgb(40,150,200)'; if(r>=0.45) return 'rgb(160,150,40)';
    if(r>=0.18) return 'rgb(190,100,20)';  return 'rgb(160,70,15)';
  }

  // ── OUTER SHELL ──
  coolCtx.fillStyle='#2e3035';
  coolCtx.strokeStyle='rgba(20,22,26,0.90)'; coolCtx.lineWidth=1.6;
  coolCtx.beginPath();
  coolCtx.moveTo(left,shellTopL); coolCtx.lineTo(right,shellTopR);
  coolCtx.lineTo(right,shellBotR); coolCtx.lineTo(left,shellBotL);
  coolCtx.closePath(); coolCtx.fill(); coolCtx.stroke();
  // Highlight strip
  coolCtx.strokeStyle='rgba(90,95,105,0.45)'; coolCtx.lineWidth=0.8;
  coolCtx.beginPath(); coolCtx.moveTo(left+1,shellTopL+1); coolCtx.lineTo(right-1,shellTopR+1); coolCtx.stroke();

  // ── INNER TUBE — clipped zone slices with live colours ──
  const sliceW=kilnW/4;
  coolCtx.save();
  coolCtx.beginPath();
  coolCtx.moveTo(left,topL); coolCtx.lineTo(right,topR);
  coolCtx.lineTo(right,botR); coolCtx.lineTo(left,botL);
  coolCtx.closePath(); coolCtx.clip();

  // Smooth gradient across all zones — no hard partitions
  const zoneGr=safeLinearGradient(coolCtx,left,0,right,0);
  zoneGr.addColorStop(0,    heatCol(temps[0]));
  zoneGr.addColorStop(0.33, heatCol(temps[1]));
  zoneGr.addColorStop(0.67, heatCol(temps[2]));
  zoneGr.addColorStop(1,    heatCol(temps[3]));
  coolCtx.fillStyle=zoneGr;
  coolCtx.beginPath(); coolCtx.moveTo(left,topL-2); coolCtx.lineTo(right,topR-2);
  coolCtx.lineTo(right,botR+2); coolCtx.lineTo(left,botL+2); coolCtx.closePath(); coolCtx.fill();
  // Cylindrical shading overlay
  const shGr=safeLinearGradient(coolCtx,left,topL,left,botL+2);
  shGr.addColorStop(0,'rgba(255,255,255,0.18)'); shGr.addColorStop(0.35,'rgba(255,255,255,0.05)');
  shGr.addColorStop(0.60,'rgba(0,0,0,0)'); shGr.addColorStop(1,'rgba(0,0,0,0.38)');
  coolCtx.fillStyle=shGr;
  coolCtx.beginPath(); coolCtx.moveTo(left,topL-2); coolCtx.lineTo(right,topR-2);
  coolCtx.lineTo(right,botR+2); coolCtx.lineTo(left,botL+2); coolCtx.closePath(); coolCtx.fill();

  // Travelling shimmer trail
  const p=(frame%100)/100;
  coolCtx.globalAlpha=0.22; coolCtx.fillStyle='#ffffff';
  coolCtx.beginPath(); coolCtx.ellipse(left+kilnW*p,topL+p*(slopeY*2)+kilnH*0.5,kilnW*0.030,kilnH*0.38,0,0,Math.PI*2); coolCtx.fill();
  coolCtx.globalAlpha=1;
  coolCtx.restore(); // end clip

  // Inner tube outline
  coolCtx.strokeStyle='rgba(20,22,26,0.70)'; coolCtx.lineWidth=1;
  coolCtx.beginPath(); coolCtx.moveTo(left,topL); coolCtx.lineTo(right,topR);
  coolCtx.lineTo(right,botR); coolCtx.lineTo(left,botL); coolCtx.closePath(); coolCtx.stroke();

  // ── END CAP ELLIPSES ──
  const shellCapRy=(shellBotL-shellTopL)/2, shellCapRx=shellCapRy*0.20;
  const innerCapRy=kilnH*0.50, innerCapRx=innerCapRy*0.20;
  // Left cap
  coolCtx.fillStyle='#3a3d44'; coolCtx.strokeStyle='rgba(20,22,26,0.85)'; coolCtx.lineWidth=1.2;
  coolCtx.beginPath(); coolCtx.ellipse(left,(shellTopL+shellBotL)/2,shellCapRx,shellCapRy,0,0,Math.PI*2); coolCtx.fill(); coolCtx.stroke();
  coolCtx.fillStyle=heatDark(temps[0]);
  coolCtx.beginPath(); coolCtx.ellipse(left,(topL+botL)/2,innerCapRx,innerCapRy,0,0,Math.PI*2); coolCtx.fill();
  // Right cap
  coolCtx.fillStyle='#3a3d44'; coolCtx.strokeStyle='rgba(20,22,26,0.85)'; coolCtx.lineWidth=1.2;
  coolCtx.beginPath(); coolCtx.ellipse(right,(shellTopR+shellBotR)/2,shellCapRx,shellCapRy,0,0,Math.PI*2); coolCtx.fill(); coolCtx.stroke();
  coolCtx.fillStyle=heatDark(temps[3]);
  coolCtx.beginPath(); coolCtx.ellipse(right,(topR+botR)/2,innerCapRx,innerCapRy,0,0,Math.PI*2); coolCtx.fill();

  // ── RIDING RINGS ──
  [0.25,0.65].forEach(frac=>{
    const rx=left+kilnW*frac;
    const rMy=(shellTopL+shellBotL)/2+frac*((shellTopR+shellBotR)/2-(shellTopL+shellBotL)/2);
    const ringH=shellCapRy*2, ringW=kilnW*0.048;
    coolCtx.fillStyle='#878c96'; coolCtx.strokeStyle='rgba(30,32,36,0.70)'; coolCtx.lineWidth=0.8;
    coolCtx.beginPath(); coolCtx.roundRect(rx-ringW/2,rMy-ringH/2,ringW,ringH,2); coolCtx.fill(); coolCtx.stroke();
    coolCtx.fillStyle='rgba(180,185,195,0.35)';
    coolCtx.beginPath(); coolCtx.roundRect(rx-ringW/2+1,rMy-ringH/2+1,ringW*0.4,ringH*0.45,1); coolCtx.fill();
    // Roller + support block
    const rollerSz=ringW*1.4, rollerY=rMy+ringH/2+1;
    coolCtx.fillStyle='#6a6e78'; coolCtx.strokeStyle='rgba(30,32,36,0.65)'; coolCtx.lineWidth=0.7;
    coolCtx.beginPath(); coolCtx.ellipse(rx,rollerY+rollerSz*0.3,rollerSz*0.55,rollerSz*0.30,0,0,Math.PI*2); coolCtx.fill(); coolCtx.stroke();
    coolCtx.fillStyle='#4a4e56';
    coolCtx.beginPath(); coolCtx.ellipse(rx,rollerY+rollerSz*0.3,rollerSz*0.22,rollerSz*0.12,0,0,Math.PI*2); coolCtx.fill();
    const blkW=ringW*3.8, blkH=kilnH*0.55, blkY=rollerY+rollerSz*0.65;
    coolCtx.fillStyle='#c8cace'; coolCtx.strokeStyle='rgba(100,102,108,0.55)'; coolCtx.lineWidth=0.8;
    coolCtx.beginPath(); coolCtx.roundRect(rx-blkW/2,blkY,blkW,blkH,2); coolCtx.fill(); coolCtx.stroke();
    coolCtx.fillStyle='rgba(0,0,0,0.10)';
    coolCtx.beginPath(); coolCtx.roundRect(rx-blkW/2,blkY,blkW,blkH*0.18,1); coolCtx.fill();
  });

  // ── TEMPERATURE LABELS inside zones ──
  coolCtx.font='bold 9px JetBrains Mono'; coolCtx.textAlign='center';
  for(let z=0;z<4;z++){
    const zx=left+(z+0.5)*sliceW;
    const zy=cy+kilnH*0.1;
    const t=clamp((temps[z]-50)/(950-50),0,1);
    coolCtx.fillStyle=t>0.75?'rgba(20,60,60,0.85)':t>0.35?'rgba(30,20,10,0.80)':'rgba(255,255,255,0.85)';
    coolCtx.fillText(temps[z]+'°',zx,zy);
  }
  coolCtx.textAlign='left';

  // ── DIRECTION ARROWS (flow left → right) ──
  coolCtx.strokeStyle='rgba(255,255,255,0.18)'; coolCtx.lineWidth=1;
  [0.12,0.35,0.62,0.85].forEach(frac=>{
    const ax=left+kilnW*frac, ay=cy;
    coolCtx.beginPath(); coolCtx.moveTo(ax,ay); coolCtx.lineTo(ax+8,ay); coolCtx.stroke();
    coolCtx.beginPath(); coolCtx.moveTo(ax+8,ay-3); coolCtx.lineTo(ax+8,ay+3); coolCtx.lineTo(ax+13,ay); coolCtx.closePath();
    coolCtx.fillStyle='rgba(255,255,255,0.15)'; coolCtx.fill();
  });

  // Zone labels above kiln
  coolCtx.font='500 7px JetBrains Mono'; coolCtx.textAlign='center'; coolCtx.fillStyle='rgba(200,145,42,0.7)';
  ['Z1','Z2','Z3','Z4'].forEach((lbl,z)=>{
    coolCtx.fillText(lbl, left+(z+0.5)*sliceW, shellTopL-4);
  });
  coolCtx.textAlign='left';

  // Update legend chips
  for(let z=0;z<4;z++){
    const sw=document.getElementById('cool-swatch-'+z);
    const vl=document.getElementById('cool-val-'+z);
    if(sw) sw.style.background=heatCol(temps[z]);
    if(vl) vl.textContent=temps[z]+'°C';
  }
  // Update stat readouts
  const inEl=document.getElementById('coolStatIn'), outEl=document.getElementById('coolStatOut');
  if(inEl) inEl.textContent=temps[0]+'°C';
  if(outEl) outEl.textContent=temps[3]+'°C';
}

  return {
    tick() { drawCoolKilnAnim(coolFrame); coolFrame++; },
    burst(){},
    touch(){},
  }
}
