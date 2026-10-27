/* Ported from the original dashboard: drawing routines are unchanged.
 * They run inside a factory so each canvas gets its own state and the
 * React app only talks to the returned { tick, burst, touch } API. */
import { clamp, safeNum, safeRadialGradient, safeLinearGradient, hslTempColor } from './helpers.js'

export const CANVAS_ID = 'feedMiniCanvas'

export function createFeedScene(canvas, stageParams) {
  const document = {
    getElementById: (id) => (id === CANVAS_ID ? canvas : window.document.getElementById(id)),
    querySelectorAll: (s) => window.document.querySelectorAll(s),
  }
  let t = null

let feedMiniFrame=0, feedMiniAnimId=null, feedMiniActive=false, feedMiniSaveBurst=0;
let feedFillLevel=0; // 0 = empty, 1 = full — rises when user inputs data
const feedMiniCanvas=document.getElementById('feedMiniCanvas');
const feedMiniCtx=feedMiniCanvas.getContext('2d');

function sizeFeedMini(){
  const wrap=feedMiniCanvas.parentElement;
  const W=Math.max(wrap.clientWidth||280,10);
  const H=Math.max(wrap.clientHeight||280,10);
  const ratio=window.devicePixelRatio||1;
  const wPx=Math.round(W*ratio), hPx=Math.round(H*ratio);
  if(feedMiniCanvas.width!==wPx||feedMiniCanvas.height!==hPx){
    feedMiniCanvas.width=wPx; feedMiniCanvas.height=hPx;
    feedMiniCtx.setTransform(ratio,0,0,ratio,0,0);
  }
  return{W,H};
}

function drawFeedMini(frame, burst){
  const{W,H}=sizeFeedMini();
  feedMiniCtx.clearRect(0,0,W,H);

  // ── Advance fill level when active ──
  if(feedMiniActive || burst>0){
    feedFillLevel = Math.min(1, feedFillLevel + 0.008);
  }

  // ── BACKGROUND ──
  const bg=feedMiniCtx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#08111e'); bg.addColorStop(1,'#0e1e34');
  feedMiniCtx.fillStyle=bg; feedMiniCtx.fillRect(0,0,W,H);
  feedMiniCtx.strokeStyle='rgba(80,130,200,0.05)'; feedMiniCtx.lineWidth=0.7;
  for(let x=0;x<W;x+=22){feedMiniCtx.beginPath();feedMiniCtx.moveTo(x,0);feedMiniCtx.lineTo(x,H);feedMiniCtx.stroke();}
  for(let y=0;y<H;y+=22){feedMiniCtx.beginPath();feedMiniCtx.moveTo(0,y);feedMiniCtx.lineTo(W,y);feedMiniCtx.stroke();}

  const cx=W/2;

  // ── HOPPER GEOMETRY ──
  const brimW   = W*0.82;
  const brimTop = H*0.20;
  const brimH   = H*0.06;
  const hopTop  = brimTop+brimH;
  const neckW   = W*0.16;
  const funnelH = H*0.32;
  const chuteH  = H*0.12;
  const neckTop = hopTop+funnelH;
  const neckBot = neckTop+chuteH;

  const platY   = neckTop+4;
  const platH   = 6;
  const platW   = W*0.74;
  const legH    = H*0.22;
  const legBot  = platY+platH+legH;
  const leg1X   = cx-platW*0.36;
  const leg2X   = cx+platW*0.36;

  // ── SUPPORT LEGS ──
  const legCol='#3a4450';
  feedMiniCtx.strokeStyle='#2e3840'; feedMiniCtx.lineWidth=2.5;
  feedMiniCtx.beginPath(); feedMiniCtx.moveTo(leg1X,platY+platH); feedMiniCtx.lineTo(leg2X,legBot); feedMiniCtx.stroke();
  feedMiniCtx.beginPath(); feedMiniCtx.moveTo(leg2X,platY+platH); feedMiniCtx.lineTo(leg1X,legBot); feedMiniCtx.stroke();
  feedMiniCtx.fillStyle=legCol;
  feedMiniCtx.fillRect(leg1X-5,platY+platH,10,legH);
  feedMiniCtx.strokeStyle='rgba(255,255,255,0.08)'; feedMiniCtx.lineWidth=0.8;
  feedMiniCtx.strokeRect(leg1X-5,platY+platH,10,legH);
  feedMiniCtx.fillStyle=legCol;
  feedMiniCtx.fillRect(leg2X-5,platY+platH,10,legH);
  feedMiniCtx.strokeStyle='rgba(255,255,255,0.08)'; feedMiniCtx.lineWidth=0.8;
  feedMiniCtx.strokeRect(leg2X-5,platY+platH,10,legH);
  feedMiniCtx.fillStyle='#2a3340';
  feedMiniCtx.fillRect(leg1X-9,legBot,18,5);
  feedMiniCtx.fillRect(leg2X-9,legBot,18,5);

  // ── PLATFORM ──
  const platGrad=feedMiniCtx.createLinearGradient(cx-platW/2,platY,cx-platW/2,platY+platH);
  platGrad.addColorStop(0,'#5a6472'); platGrad.addColorStop(1,'#3a4250');
  feedMiniCtx.fillStyle=platGrad;
  feedMiniCtx.beginPath(); feedMiniCtx.roundRect(cx-platW/2,platY,platW,platH,2); feedMiniCtx.fill();
  feedMiniCtx.strokeStyle='rgba(255,255,255,0.12)'; feedMiniCtx.lineWidth=0.7;
  feedMiniCtx.beginPath(); feedMiniCtx.roundRect(cx-platW/2,platY,platW,platH,2); feedMiniCtx.stroke();

  // ── SAFETY RAILING ──
  const railY=platY-18; const railH=18; const railCol='#e8b800';
  const posts=[cx-platW/2, cx-platW/4, cx, cx+platW/4, cx+platW/2];
  feedMiniCtx.strokeStyle=railCol; feedMiniCtx.lineWidth=2.2;
  feedMiniCtx.beginPath(); feedMiniCtx.moveTo(cx-platW/2,railY); feedMiniCtx.lineTo(cx+platW/2,railY); feedMiniCtx.stroke();
  feedMiniCtx.lineWidth=1.5;
  feedMiniCtx.beginPath(); feedMiniCtx.moveTo(cx-platW/2,railY+railH*0.5); feedMiniCtx.lineTo(cx+platW/2,railY+railH*0.5); feedMiniCtx.stroke();
  feedMiniCtx.lineWidth=2;
  posts.forEach(px=>{
    feedMiniCtx.beginPath(); feedMiniCtx.moveTo(px,platY); feedMiniCtx.lineTo(px,railY); feedMiniCtx.stroke();
  });

  // ── HOPPER BODY ──
  const fGrad=feedMiniCtx.createLinearGradient(cx-brimW/2,0,cx+brimW/2,0);
  fGrad.addColorStop(0,'#2a3340'); fGrad.addColorStop(0.10,'#4a5560'); fGrad.addColorStop(0.30,'#6a7a88');
  fGrad.addColorStop(0.50,'#8a9aaa'); fGrad.addColorStop(0.70,'#6a7a88'); fGrad.addColorStop(0.90,'#4a5560'); fGrad.addColorStop(1,'#2a3340');
  feedMiniCtx.beginPath();
  feedMiniCtx.moveTo(cx-brimW/2, hopTop); feedMiniCtx.lineTo(cx+brimW/2, hopTop);
  feedMiniCtx.lineTo(cx+neckW/2, neckTop); feedMiniCtx.lineTo(cx-neckW/2, neckTop);
  feedMiniCtx.closePath();
  feedMiniCtx.fillStyle=fGrad; feedMiniCtx.fill();

  // Panel weld lines
  feedMiniCtx.strokeStyle='rgba(255,255,255,0.07)'; feedMiniCtx.lineWidth=0.8;
  for(let p=1;p<=3;p++){
    const t=p/4;
    const lx1=cx-brimW/2+(brimW/2-neckW/2)*t; const rx1=cx+brimW/2-(brimW/2-neckW/2)*t;
    const py=hopTop+funnelH*t;
    feedMiniCtx.beginPath(); feedMiniCtx.moveTo(lx1,py); feedMiniCtx.lineTo(rx1,py); feedMiniCtx.stroke();
  }
  feedMiniCtx.strokeStyle='rgba(200,220,240,0.18)'; feedMiniCtx.lineWidth=1.5;
  feedMiniCtx.beginPath(); feedMiniCtx.moveTo(cx-brimW/2+3,hopTop+3); feedMiniCtx.lineTo(cx-neckW/2+2,neckTop-2); feedMiniCtx.stroke();
  feedMiniCtx.strokeStyle='rgba(0,0,0,0.25)'; feedMiniCtx.lineWidth=1.5;
  feedMiniCtx.beginPath(); feedMiniCtx.moveTo(cx+brimW/2-3,hopTop+3); feedMiniCtx.lineTo(cx+neckW/2-2,neckTop-2); feedMiniCtx.stroke();
  feedMiniCtx.strokeStyle='rgba(80,110,140,0.65)'; feedMiniCtx.lineWidth=1.5;
  feedMiniCtx.beginPath();
  feedMiniCtx.moveTo(cx-brimW/2,hopTop); feedMiniCtx.lineTo(cx+brimW/2,hopTop);
  feedMiniCtx.lineTo(cx+neckW/2,neckTop); feedMiniCtx.lineTo(cx-neckW/2,neckTop);
  feedMiniCtx.closePath(); feedMiniCtx.stroke();

  // ── VERTICAL CHUTE ──
  const chuteGrad=feedMiniCtx.createLinearGradient(cx-neckW/2,0,cx+neckW/2,0);
  chuteGrad.addColorStop(0,'#2e3c48'); chuteGrad.addColorStop(0.5,'#5a6a78'); chuteGrad.addColorStop(1,'#2e3c48');
  feedMiniCtx.fillStyle=chuteGrad;
  feedMiniCtx.fillRect(cx-neckW/2,neckTop,neckW,chuteH);
  feedMiniCtx.strokeStyle='rgba(80,110,140,0.50)'; feedMiniCtx.lineWidth=1;
  feedMiniCtx.strokeRect(cx-neckW/2,neckTop,neckW,chuteH);

  // ── BRIM / TOP RIM ──
  const brimGrad=feedMiniCtx.createLinearGradient(cx-brimW/2-4,brimTop,cx+brimW/2+4,brimTop+brimH);
  brimGrad.addColorStop(0,'#3a4450'); brimGrad.addColorStop(0.4,'#7a8a98'); brimGrad.addColorStop(0.6,'#aabbc8'); brimGrad.addColorStop(1,'#3a4450');
  feedMiniCtx.fillStyle=brimGrad;
  feedMiniCtx.beginPath(); feedMiniCtx.roundRect(cx-brimW/2-4,brimTop,brimW+8,brimH,2); feedMiniCtx.fill();
  feedMiniCtx.strokeStyle='rgba(255,255,255,0.15)'; feedMiniCtx.lineWidth=0.8;
  feedMiniCtx.beginPath(); feedMiniCtx.roundRect(cx-brimW/2-4,brimTop,brimW+8,brimH,2); feedMiniCtx.stroke();

  // ── ORE PILE (only visible based on feedFillLevel) ──
  const pileY=brimTop+brimH+2;
  const pileH=funnelH*0.38;
  if(feedFillLevel > 0.01){
    // Ore mass fill — alpha/size grows with fill level
    const oreAlpha = Math.min(feedFillLevel * 1.1, 0.92);
    // The pile top rises as fill level increases (starts at bottom of funnel, rises up)
    const pileTopOffset = pileH * 0.85 * (1 - feedFillLevel);
    const oreGrad=safeRadialGradient(feedMiniCtx,cx,pileY+pileH*0.4+pileTopOffset,pileH*0.05,cx,pileY+pileH*0.4+pileTopOffset,brimW*0.44);
    oreGrad.addColorStop(0,`rgba(110,70,40,${oreAlpha})`);
    oreGrad.addColorStop(0.7,`rgba(70,45,25,${oreAlpha*0.95})`);
    oreGrad.addColorStop(1,`rgba(40,25,15,0)`);
    feedMiniCtx.save();
    feedMiniCtx.beginPath();
    feedMiniCtx.moveTo(cx-brimW/2+4,hopTop); feedMiniCtx.lineTo(cx+brimW/2-4,hopTop);
    feedMiniCtx.lineTo(cx+neckW/2,neckTop); feedMiniCtx.lineTo(cx-neckW/2,neckTop);
    feedMiniCtx.closePath(); feedMiniCtx.clip();
    feedMiniCtx.fillStyle=oreGrad;
    feedMiniCtx.beginPath();
    feedMiniCtx.ellipse(cx, pileY+pileH*0.55+pileTopOffset, brimW*0.44*Math.min(feedFillLevel+0.1,1), (pileH*0.85-pileTopOffset)*0.85, 0, 0, Math.PI*2);
    feedMiniCtx.fill();
    // Individual ore balls on surface (fade in with fill level)
    const ballAlpha = feedFillLevel;
    const visibleBalls = Math.floor(feedFillLevel * 26);
    for(let b=0;b<visibleBalls;b++){
      const bx=cx-brimW*0.4+b*(brimW*0.8/25);
      const wave=Math.sin(b*0.85+frame*0.008)*3;
      const by=pileY+pileTopOffset+pileH*0.18+Math.abs(Math.sin(b*1.4))*pileH*0.18+wave;
      const br=3+b%3*0.8;
      const bg2=safeRadialGradient(feedMiniCtx,bx-br*0.35,by-br*0.35,0,bx,by,br);
      bg2.addColorStop(0,`rgba(160,95,50,${ballAlpha})`);
      bg2.addColorStop(0.6,`rgba(105,60,28,${ballAlpha*0.9})`);
      bg2.addColorStop(1,`rgba(60,35,15,${ballAlpha*0.8})`);
      feedMiniCtx.beginPath(); feedMiniCtx.arc(bx,by,br,0,Math.PI*2); feedMiniCtx.fillStyle=bg2; feedMiniCtx.fill();
    }
    feedMiniCtx.restore();
  }

  // ── FALLING PARTICLES (only when user is actively entering data OR fill is rising) ──
  if(feedFillLevel > 0.01){
    const speedMul = feedMiniActive ? 2.8 : (burst>0 ? 3.5 : 1.0);
    const numP = feedMiniActive ? 18 : (burst>0 ? 24 : Math.max(3, Math.floor(feedFillLevel * 12)));
    const period = 70;
    for(let p=0;p<numP;p++){
      const t=((frame*speedMul+p*(period/numP))%period)/period;
      const sx=cx-brimW*0.40 + p*(brimW*0.80/Math.max(numP-1,1)) + Math.sin(p*2.1+frame*0.03)*4;
      const startY=brimTop-H*0.10; // starts above brim
      const endY=brimTop+brimH+pileH*0.6;
      const fy=startY + t*(endY-startY);
      // Particles only fall within hopper width at that height
      const fracDown=(fy-hopTop)/funnelH;
      const maxX=brimW/2-(brimW/2-neckW/2)*Math.max(0,Math.min(fracDown,1));
      if(Math.abs(sx-cx)>maxX+4) continue;
      const alpha=(t<0.15?(t/0.15):(t>0.75?(1-(t-0.75)/0.25):1))*0.88*feedFillLevel;
      const r=1.6+p%4*0.55;
      const bOre=safeRadialGradient(feedMiniCtx,sx-r*0.3,fy-r*0.3,0,sx,fy,r);
      bOre.addColorStop(0,`rgba(180,105,45,${alpha.toFixed(2)})`);
      bOre.addColorStop(1,`rgba(100,55,20,${(alpha*0.5).toFixed(2)})`);
      feedMiniCtx.beginPath(); feedMiniCtx.arc(sx,fy,r,0,Math.PI*2);
      feedMiniCtx.fillStyle=bOre; feedMiniCtx.fill();
    }
  }

  // ── DISCHARGE PARTICLES below chute outlet ──
  if(feedFillLevel > 0.3 && (burst>0||feedMiniActive)){
    const dSpd=feedMiniActive?2:3;
    for(let d=0;d<6;d++){
      const t=((frame*dSpd+d*12)%36)/36;
      const dx=cx+(d-2.5)*3.5;
      const dy=neckBot+2+t*H*0.08;
      const da=Math.max(0,(1-t)*0.75*feedFillLevel);
      feedMiniCtx.beginPath(); feedMiniCtx.arc(dx,dy,1.5,0,Math.PI*2);
      feedMiniCtx.fillStyle=`rgba(160,90,35,${da.toFixed(2)})`; feedMiniCtx.fill();
    }
  }

  // ── EMPTY STATE hint ──
  if(feedFillLevel < 0.05){
    feedMiniCtx.save();
    feedMiniCtx.globalAlpha = 0.5 - feedFillLevel * 8;
    feedMiniCtx.fillStyle='rgba(100,140,200,0.45)';
    feedMiniCtx.font='500 8px JetBrains Mono'; feedMiniCtx.textAlign='center';
    feedMiniCtx.fillText('ENTER PARAMETERS', cx, H*0.62);
    feedMiniCtx.fillStyle='rgba(100,140,200,0.28)';
    feedMiniCtx.font='7px JetBrains Mono';
    feedMiniCtx.fillText('TO LOAD ORE', cx, H*0.62+14);
    feedMiniCtx.restore();
  }

  // ── SAVE BURST ──
  if(burst>0){
    const bAlpha=Math.min(1,burst/18);
    for(let b=0;b<20;b++){
      const ang=(b/20)*Math.PI*2; const dist=(1-bAlpha)*W*0.18;
      feedMiniCtx.beginPath(); feedMiniCtx.arc(cx+Math.cos(ang)*dist,brimTop+brimH/2+funnelH*0.4+Math.sin(ang)*dist*0.5,2,0,Math.PI*2);
      feedMiniCtx.fillStyle=`rgba(200,145,42,${(bAlpha*0.8).toFixed(2)})`; feedMiniCtx.fill();
    }
    feedMiniCtx.save();
    feedMiniCtx.globalAlpha=bAlpha*0.95;
    feedMiniCtx.shadowColor='#3aaa6a'; feedMiniCtx.shadowBlur=20;
    feedMiniCtx.strokeStyle='#3aaa6a'; feedMiniCtx.lineWidth=3.5; feedMiniCtx.lineCap='round';
    feedMiniCtx.beginPath(); feedMiniCtx.moveTo(cx-14,H*0.55); feedMiniCtx.lineTo(cx-3,H*0.55+11); feedMiniCtx.lineTo(cx+16,H*0.55-11); feedMiniCtx.stroke();
    feedMiniCtx.restore();
  }

  // ── LABELS ──
  feedMiniCtx.fillStyle='rgba(140,180,220,0.55)'; feedMiniCtx.font='500 8px JetBrains Mono'; feedMiniCtx.textAlign='center';
  feedMiniCtx.fillText('IRON ORE FEED',cx,brimTop-6);

  // live feed rate meter update
  const feedRate=parseFloat(stageParams.feed.feedRate)||0;
  const fillPct=Math.min(feedRate/500*100,100);
  const bar=document.getElementById('feedMeterFill');
  if(bar) bar.style.width=fillPct+'%';
}


  return {
    tick() { if(feedMiniSaveBurst>0) feedMiniSaveBurst-=0.5; drawFeedMini(feedMiniFrame, feedMiniSaveBurst); feedMiniFrame++; },
    burst(){ feedMiniSaveBurst=20; feedMiniActive=true; clearTimeout(t); t=setTimeout(()=>{feedMiniActive=false},2200); },
    touch(){ feedMiniActive=true; clearTimeout(t); t=setTimeout(()=>{feedMiniActive=false},1200); },
  }
}
