/* Ported from the original dashboard: drawing routines are unchanged.
 * They run inside a factory so each canvas gets its own state and the
 * React app only talks to the returned { tick, burst, touch } API. */
import { clamp, safeNum, safeRadialGradient, safeLinearGradient, hslTempColor } from './helpers.js'

export const CANVAS_ID = 'ballDiscCanvas'

export function createBallScene(canvas, stageParams) {
  const document = {
    getElementById: (id) => (id === CANVAS_ID ? canvas : window.document.getElementById(id)),
    querySelectorAll: (s) => window.document.querySelectorAll(s),
  }
  let t = null

let ballDiscFrame=0, ballDiscAnimId=null, ballDiscSaveBurst=0;
const ballDiscCanvas=document.getElementById('ballDiscCanvas');
const ballDiscCtx=ballDiscCanvas.getContext('2d');

// Physics balls on disc — top-view perspective
const BALL_COUNT=60;
let discBalls=[];
let conveyorBalls=[];

function initDiscBalls(){
  discBalls=[];
  for(let i=0;i<BALL_COUNT;i++){
    const ang=Math.random()*Math.PI*2;
    // Distribute across full disc, denser toward outer rim like real balling disc
    const r=0.12+Math.random()*0.75;
    discBalls.push({
      ang, r,
      vR:(Math.random()-0.5)*0.0012,
      size:1.5+Math.random()*1.2,   // small realistic pellet sizes
      phase:Math.random()*Math.PI*2,
      col:Math.random()             // slight colour variation
    });
  }
  conveyorBalls=[];
}
initDiscBalls();

function sizeBallDisc(){
  const wrap=ballDiscCanvas.parentElement;
  const W=Math.max(wrap.clientWidth||500,10);
  const H=Math.max(wrap.clientHeight||460,10);
  const ratio=window.devicePixelRatio||1;
  const wPx=Math.round(W*ratio), hPx=Math.round(H*ratio);
  if(ballDiscCanvas.width!==wPx||ballDiscCanvas.height!==hPx){
    ballDiscCanvas.width=wPx; ballDiscCanvas.height=hPx;
    ballDiscCtx.setTransform(ratio,0,0,ratio,0,0);
  }
  return{W,H};
}

function drawBallDisc(frame, burst){
  const{W,H}=sizeBallDisc();
  const g=ballDiscCtx;
  g.clearRect(0,0,W,H);

  // ── WARM CREAM BACKGROUND with grid (matching reference) ──
  const bg=g.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#f0ebe0'); bg.addColorStop(1,'#e8e2d4');
  g.fillStyle=bg; g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(180,165,130,0.22)'; g.lineWidth=0.6;
  for(let x=0;x<W;x+=20){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}
  for(let y=0;y<H;y+=20){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}

  // ── READ PARAMS ──
  const angleEl=document.getElementById('m-angle');
  const discRpmEl=document.getElementById('m-discrpm');
  const angleVal=angleEl?parseFloat(angleEl.value)||48:48;
  const rpmVal=discRpmEl?parseFloat(discRpmEl.value)||7:7;
  const wsEl=document.getElementById('m-wsr');
  const wsVal=wsEl?parseFloat(wsEl.value)||50:50;

  // ── DISC GEOMETRY — top-down view, tilted as perspective ellipse ──
  // The disc is tilted ~46-50°. We render it as a top-down slightly angled circle.
  // tiltFraction: 0=46°(more tilted, flatter ellipse), 1=50°(less tilted, rounder)
  const tiltFraction=clamp((angleVal-46)/4,0,1); // clamped: typing a half-finished value must not break the drawing
  const discRx=Math.min(W*0.34, H*0.40); // horizontal radius
  // At 46° tilt, disc face looks more oval (squashed); at 50° slightly rounder
  const discRy=discRx*(0.82+0.10*tiltFraction); // nearly circular top-down view
  const discCX=W*0.33;
  const discCY=H*0.44;

  // Rotation speed
  const rotSpeed=(rpmVal/7)*0.016;
  const rot=frame*rotSpeed;

  // ── DISC SHADOW ──
  g.save(); g.globalAlpha=0.12;
  g.fillStyle='#6a5830';
  g.beginPath(); g.ellipse(discCX+8,discCY+10,discRx*0.96,discRy*0.90,0,0,Math.PI*2); g.fill();
  g.restore();

  // ── OUTER RIM — warm tan/beige like reference ──
  const rimW=discRx*0.09;
  // Outer rim gradient (tan/sand colour matching reference image)
  const rimOuter=g.createRadialGradient(discCX-discRx*0.25,discCY-discRy*0.25,discRx*0.05,discCX,discCY,discRx*1.02);
  rimOuter.addColorStop(0,'#d4c8a8');
  rimOuter.addColorStop(0.55,'#b8a880');
  rimOuter.addColorStop(0.85,'#9a8a60');
  rimOuter.addColorStop(1,'#7a6a48');
  g.beginPath(); g.ellipse(discCX,discCY,discRx,discRy,0,0,Math.PI*2);
  g.fillStyle=rimOuter; g.fill();
  g.strokeStyle='rgba(90,75,40,0.55)'; g.lineWidth=2;
  g.stroke();

  // Inner rim border
  g.beginPath(); g.ellipse(discCX,discCY,discRx-rimW*0.45,discRy-rimW*0.38,0,0,Math.PI*2);
  g.strokeStyle='rgba(80,65,35,0.40)'; g.lineWidth=1.2; g.stroke();

  // ── DISC INTERIOR (clip) ──
  g.save();
  g.beginPath(); g.ellipse(discCX,discCY,discRx-rimW,discRy-rimW*0.85,0,0,Math.PI*2); g.clip();

  // Disc face — warm earthy brown (ore/pellet mix colour)
  const faceGrad=g.createRadialGradient(discCX-discRx*0.2,discCY-discRy*0.2,discRx*0.04,discCX,discCY,discRx);
  faceGrad.addColorStop(0,'#c8a870');
  faceGrad.addColorStop(0.35,'#a8884e');
  faceGrad.addColorStop(0.72,'#8a6e38');
  faceGrad.addColorStop(1,'#6e5428');
  g.fillStyle=faceGrad; g.fillRect(discCX-discRx,discCY-discRy,discRx*2,discRy*2);

  // ── ROTATING SEGMENT LINES (8 radial lines from centre) ──
  const segCount=8;
  g.strokeStyle='rgba(60,44,18,0.40)'; g.lineWidth=1.1;
  for(let s=0;s<segCount;s++){
    const segAng=rot+(s/segCount)*Math.PI*2;
    const ex=discCX+Math.cos(segAng)*(discRx-rimW)*0.97;
    const ey=discCY+Math.sin(segAng)*(discRy-rimW*0.85)*0.97;
    g.beginPath(); g.moveTo(discCX,discCY); g.lineTo(ex,ey); g.stroke();
  }

  // ── CONCENTRIC RINGS ──
  [0.28,0.55,0.82].forEach(f=>{
    g.strokeStyle='rgba(55,40,15,0.20)'; g.lineWidth=0.8;
    g.beginPath();
    g.ellipse(discCX,discCY,(discRx-rimW)*f,(discRy-rimW*0.85)*f,0,0,Math.PI*2);
    g.stroke();
  });

  // Radial highlight (top-left sheen)
  const sheen=g.createRadialGradient(discCX-discRx*0.35,discCY-discRy*0.35,0,discCX-discRx*0.1,discCY-discRy*0.1,discRx*0.65);
  sheen.addColorStop(0,'rgba(255,240,200,0.28)'); sheen.addColorStop(1,'rgba(255,240,200,0)');
  g.fillStyle=sheen; g.fillRect(discCX-discRx,discCY-discRy,discRx*2,discRy*2);

  g.restore(); // end disc clip

  // ── CENTER HUB ──
  const hubR=discRx*0.12;
  const hubGrad=g.createRadialGradient(discCX-hubR*0.3,discCY-hubR*0.3,0,discCX,discCY,hubR);
  hubGrad.addColorStop(0,'#e0d8c0'); hubGrad.addColorStop(0.5,'#b0a880'); hubGrad.addColorStop(1,'#787050');
  g.save();
  g.beginPath(); g.ellipse(discCX,discCY,hubR,hubR*(discRy/discRx),0,0,Math.PI*2);
  g.fillStyle=hubGrad; g.fill();
  g.strokeStyle='rgba(70,55,25,0.55)'; g.lineWidth=1.5; g.stroke();
  // Hub bolts (6)
  for(let b=0;b<6;b++){
    const ba=rot*1.2+(b/6)*Math.PI*2;
    const bx=discCX+Math.cos(ba)*hubR*0.68;
    const by=discCY+Math.sin(ba)*hubR*0.68*(discRy/discRx);
    g.beginPath(); g.arc(bx,by,hubR*0.14,0,Math.PI*2);
    g.fillStyle='#c8c0a0'; g.fill();
    g.strokeStyle='rgba(60,48,20,0.5)'; g.lineWidth=0.6; g.stroke();
  }
  // Centre shine
  g.beginPath(); g.arc(discCX-hubR*0.2,discCY-hubR*0.25,hubR*0.22,0,Math.PI*2);
  g.fillStyle='rgba(255,248,220,0.55)'; g.fill();
  g.restore();

  // ── DISC PELLET BALLS (drawn on top of disc face, clipped to disc) ──
  g.save();
  g.beginPath(); g.ellipse(discCX,discCY,discRx-rimW*1.05,discRy-rimW*0.9,0,0,Math.PI*2); g.clip();

  const dischargeAng=Math.PI*0.52; // ~94° = right side, slightly below horizontal

  for(let i=discBalls.length-1;i>=0;i--){
    const b=discBalls[i];

    // Rotate with disc
    b.ang+=rotSpeed*0.85;
    // Slow centrifugal drift
    b.r+=b.vR;
    b.vR+=(b.r>0.60?0.00018:-0.00008);
    if(b.r>0.88){b.r=0.88; b.vR*=-0.5;}
    if(b.r<0.08){b.r=0.08; b.vR*=-0.5;}

    const bx=discCX+Math.cos(b.ang)*(discRx-rimW*1.1)*b.r;
    const by=discCY+Math.sin(b.ang)*(discRy-rimW*0.95)*b.r;

    // Discharge check — near outer edge, discharge zone angle
    const normAng=((b.ang%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
    const normDis=((dischargeAng%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
    let angDiff=Math.abs(normAng-normDis);
    if(angDiff>Math.PI) angDiff=Math.PI*2-angDiff;
    const inDischarge=b.r>0.72 && angDiff<0.38;

    if(inDischarge && Math.random()<0.012){
      // Shoot onto conveyor
      const spawnX=discCX+Math.cos(dischargeAng)*(discRx+4);
      const spawnY=discCY+Math.sin(dischargeAng)*(discRy+4);
      conveyorBalls.push({
        x:spawnX, y:spawnY,
        vx:2.8+Math.random()*1.2, vy:-0.5+Math.random()*1.0,
        size:b.size, falling:true, settled:false
      });
      // Respawn at inner area
      b.ang=Math.random()*Math.PI*2; b.r=0.08+Math.random()*0.25; b.vR=0;
      continue;
    }

    // Draw pellet — warm earthy brown tones like ore pellets
    const v=0.75+b.col*0.25;
    const pr=Math.round(160+b.col*30), pg=Math.round(110+b.col*30), pb=Math.round(50+b.col*20);
    const pelGrad=g.createRadialGradient(bx-b.size*0.32,by-b.size*0.32,0,bx,by,b.size);
    pelGrad.addColorStop(0,`rgba(${pr+40},${pg+30},${pb+20},0.95)`);
    pelGrad.addColorStop(0.5,`rgba(${pr},${pg},${pb},0.92)`);
    pelGrad.addColorStop(1,`rgba(${Math.round(pr*0.55)},${Math.round(pg*0.55)},${Math.round(pb*0.55)},0.88)`);
    g.beginPath(); g.arc(bx,by,b.size,0,Math.PI*2);
    g.fillStyle=pelGrad; g.fill();
    // Tiny specular highlight
    g.beginPath(); g.arc(bx-b.size*0.28,by-b.size*0.30,b.size*0.22,0,Math.PI*2);
    g.fillStyle='rgba(255,248,220,0.50)'; g.fill();
  }
  g.restore(); // end ball clip

  // ── DISCHARGE CHUTE (right side of disc connecting to conveyor) ──
  const chuteStartX=discCX+Math.cos(dischargeAng)*(discRx-rimW*0.5);
  const chuteStartY=discCY+Math.sin(dischargeAng)*(discRy-rimW*0.4);
  // Conveyor geometry — long narrow belt going right, slightly angled down
  const convStartX=discCX+discRx*0.78;
  const convStartY=discCY+discRy*0.32;
  const convEndX=W*0.98;
  const convEndY=convStartY+6; // very slight downward angle
  const convH=H*0.082;
  const beltMidY=(convStartY+convEndY)/2;

  // ── CONVEYOR SUPPORT LEGS ──
  const legPositions=[0.18,0.38,0.58,0.78];
  legPositions.forEach(t=>{
    const lx=convStartX+(convEndX-convStartX)*t;
    const ly=beltMidY+(convEndY-convStartY)*t+convH*0.5;
    const legH=H*0.09+t*H*0.03; // legs get taller toward right (perspective)
    g.fillStyle='#8a7850'; g.strokeStyle='rgba(60,45,20,0.4)'; g.lineWidth=0.8;
    // Angled leg pair
    g.beginPath();
    g.moveTo(lx-8,ly); g.lineTo(lx-10,ly+legH);
    g.lineTo(lx-6,ly+legH); g.lineTo(lx-4,ly); g.closePath();
    g.fill(); g.stroke();
    g.beginPath();
    g.moveTo(lx+4,ly); g.lineTo(lx+6,ly+legH);
    g.lineTo(lx+10,ly+legH); g.lineTo(lx+8,ly); g.closePath();
    g.fill(); g.stroke();
    // Base plate
    g.fillStyle='#6a5838';
    g.fillRect(lx-12,ly+legH,24,4);
  });

  // ── CONVEYOR BELT BODY ──
  // Shadow
  g.save(); g.globalAlpha=0.10;
  g.fillStyle='#5a4820';
  g.beginPath();
  g.moveTo(convStartX+5, convStartY+convH+5);
  g.lineTo(convEndX+5, convEndY+convH+5);
  g.lineTo(convEndX+5, convEndY+convH+12);
  g.lineTo(convStartX+5, convStartY+convH+12);
  g.closePath(); g.fill();
  g.restore();

  // Belt frame (outer border)
  const beltGrad=g.createLinearGradient(convStartX,(convStartY+convEndY)/2,convStartX,(convStartY+convEndY)/2+convH);
  beltGrad.addColorStop(0,'#c8b888'); beltGrad.addColorStop(0.18,'#d8c898'); beltGrad.addColorStop(0.5,'#b8a870'); beltGrad.addColorStop(0.85,'#a09060'); beltGrad.addColorStop(1,'#887848');
  g.beginPath();
  g.moveTo(convStartX, convStartY);
  g.lineTo(convEndX, convEndY);
  g.lineTo(convEndX, convEndY+convH);
  g.lineTo(convStartX, convStartY+convH);
  g.closePath();
  g.fillStyle=beltGrad; g.fill();
  g.strokeStyle='rgba(80,60,25,0.50)'; g.lineWidth=1.5; g.stroke();

  // Belt moving lines (vertical slats like reference)
  const slotOffset=(frame*1.8)%22;
  g.save();
  g.beginPath();
  g.moveTo(convStartX,convStartY); g.lineTo(convEndX,convEndY);
  g.lineTo(convEndX,convEndY+convH); g.lineTo(convStartX,convStartY+convH); g.closePath();
  g.clip();
  g.strokeStyle='rgba(90,68,30,0.28)'; g.lineWidth=1;
  for(let lx=convStartX-slotOffset;lx<convEndX+22;lx+=22){
    const prog=(lx-convStartX)/(convEndX-convStartX);
    const ly=convStartY+prog*(convEndY-convStartY);
    g.beginPath(); g.moveTo(lx,ly); g.lineTo(lx,ly+convH); g.stroke();
  }
  // Top rail highlight
  const topRail=g.createLinearGradient(convStartX,convStartY,convStartX,convStartY+convH*0.28);
  topRail.addColorStop(0,'rgba(255,248,210,0.28)'); topRail.addColorStop(1,'rgba(255,248,210,0)');
  g.fillStyle=topRail;
  g.fillRect(convStartX-2, convStartY-1, convEndX-convStartX+4, convH*0.28);
  g.restore();

  // Belt side rails
  g.strokeStyle='rgba(90,68,30,0.65)'; g.lineWidth=2;
  g.beginPath(); g.moveTo(convStartX,convStartY); g.lineTo(convEndX,convEndY); g.stroke();
  g.beginPath(); g.moveTo(convStartX,convStartY+convH); g.lineTo(convEndX,convEndY+convH); g.stroke();

  // ── END ROLLER (large drum on right) ──
  const endRollerR=convH*0.75;
  const endRollerX=convEndX-2, endRollerY=(convEndY+convEndY+convH)/2;
  const erGrad=g.createRadialGradient(endRollerX-endRollerR*0.3,endRollerY-endRollerR*0.3,0,endRollerX,endRollerY,endRollerR);
  erGrad.addColorStop(0,'#d8cc9a'); erGrad.addColorStop(0.45,'#b0a070'); erGrad.addColorStop(0.8,'#8a7850'); erGrad.addColorStop(1,'#6a5830');
  g.beginPath(); g.arc(endRollerX,endRollerY,endRollerR,0,Math.PI*2);
  g.fillStyle=erGrad; g.fill();
  g.strokeStyle='rgba(70,52,20,0.55)'; g.lineWidth=1.5; g.stroke();
  // Roller cross
  g.save(); g.translate(endRollerX,endRollerY); g.rotate(frame*0.04);
  g.strokeStyle='rgba(70,52,20,0.40)'; g.lineWidth=1;
  g.beginPath(); g.moveTo(-endRollerR*0.7,0); g.lineTo(endRollerR*0.7,0); g.stroke();
  g.beginPath(); g.moveTo(0,-endRollerR*0.7); g.lineTo(0,endRollerR*0.7); g.stroke();
  g.restore();

  // ── SMALL INTERMEDIATE ROLLERS ──
  const numRollers=5;
  for(let ri=0;ri<numRollers;ri++){
    const t=(ri+0.5)/numRollers;
    const rx=convStartX+(convEndX-convStartX)*t;
    const ry=convStartY+(convEndY-convStartY)*t+convH*0.5;
    const rr=convH*0.30;
    const rGrad=g.createRadialGradient(rx-rr*0.3,ry-rr*0.3,0,rx,ry,rr);
    rGrad.addColorStop(0,'#d0c490'); rGrad.addColorStop(0.5,'#a89860'); rGrad.addColorStop(1,'#706040');
    g.beginPath(); g.arc(rx,ry,rr,0,Math.PI*2);
    g.fillStyle=rGrad; g.fill();
    g.strokeStyle='rgba(70,52,20,0.40)'; g.lineWidth=0.8; g.stroke();
    g.save(); g.translate(rx,ry); g.rotate(frame*0.05+ri*0.5);
    g.strokeStyle='rgba(60,44,16,0.35)'; g.lineWidth=0.7;
    g.beginPath(); g.moveTo(-rr*0.7,0); g.lineTo(rr*0.7,0); g.stroke();
    g.restore();
  }

  // ── MOTOR BOX (right of disc, smaller, tan coloured like reference) ──
  const motorX=discCX+discRx*0.62, motorY=discCY-discRy*0.22;
  const motorW=discRx*0.22, motorH=discRy*0.28;
  g.fillStyle='#c8c0a0'; g.strokeStyle='rgba(80,65,30,0.55)'; g.lineWidth=1.2;
  g.beginPath(); g.roundRect(motorX,motorY,motorW,motorH,3); g.fill(); g.stroke();
  // Label
  g.fillStyle='rgba(60,48,18,0.65)'; g.font='bold 7px JetBrains Mono'; g.textAlign='center';
  g.fillText('MOTOR',motorX+motorW/2,motorY+motorH*0.58);
  // Spinning dot
  const mdAng=frame*0.08;
  g.beginPath(); g.arc(motorX+motorW*0.5+Math.cos(mdAng)*motorW*0.22,motorY+motorH*0.78+Math.sin(mdAng)*motorH*0.10,2.2,0,Math.PI*2);
  g.fillStyle='rgba(100,80,30,0.7)'; g.fill();

  // ── WATER SPRAY NOZZLE ──
  if(wsVal>5){
    // Spray pipe coming diagonally from top-left into disc (like reference)
    const pipeEndX=discCX-discRx*0.08, pipeEndY=discCY-discRy*0.65;
    const pipeStartX=discCX-discRx*0.55, pipeStartY=discCY-discRy*1.18;
    // Pipe line
    g.strokeStyle='#5a80a8'; g.lineWidth=3; g.lineCap='round';
    g.beginPath(); g.moveTo(pipeStartX,pipeStartY); g.lineTo(pipeEndX,pipeEndY); g.stroke();
    g.lineWidth=1;
    g.strokeStyle='rgba(60,100,150,0.4)';
    g.beginPath(); g.moveTo(pipeStartX,pipeStartY); g.lineTo(pipeEndX,pipeEndY); g.stroke();
    // Nozzle tip
    g.fillStyle='#4a6888'; g.strokeStyle='#2a4860'; g.lineWidth=0.8;
    g.beginPath(); g.arc(pipeEndX,pipeEndY,4,0,Math.PI*2); g.fill(); g.stroke();
    // Spray label
    g.save(); g.globalAlpha=0.7;
    g.fillStyle='#3a6090'; g.font='bold 7px JetBrains Mono'; g.textAlign='left';
    const labelAng=Math.atan2(pipeEndY-pipeStartY,pipeEndX-pipeStartX);
    g.save(); g.translate(pipeStartX-8,pipeStartY-8); g.rotate(labelAng);
    g.fillText('WATER SPRAY',0,0); g.restore();
    g.restore();
    // Droplets
    const dropCount=Math.min(10,Math.floor(wsVal/20)+2);
    for(let d=0;d<dropCount;d++){
      const dt=((frame*1.4+d*8)%36)/36;
      const sx=pipeEndX+Math.cos(labelAng+Math.PI*0.5)*d*2;
      const sy=pipeEndY+Math.sin(labelAng+Math.PI*0.5)*d*2;
      const dx=pipeEndX+(Math.cos(labelAng)*dt*discRx*0.35);
      const dy=pipeEndY+(Math.sin(labelAng)*dt*discRy*0.35)+dt*8;
      const alpha=dt<0.15?(dt/0.15):(dt>0.7?(1-(dt-0.7)/0.3):1)*0.65;
      g.beginPath(); g.arc(dx,dy,1.2,0,Math.PI*2);
      g.fillStyle=`rgba(70,140,220,${alpha.toFixed(2)})`; g.fill();
    }
  }

  // ── FEED CHUTE (left side, ore+binder feed pipe) ──
  {
    const feedEndX=discCX-discRx*0.68, feedEndY=discCY-discRy*0.12;
    const feedStartX=discCX-discRx*1.35, feedStartY=discCY-discRy*0.20;
    g.strokeStyle='#8a7050'; g.lineWidth=8; g.lineCap='round';
    g.beginPath(); g.moveTo(feedStartX,feedStartY); g.lineTo(feedEndX,feedEndY); g.stroke();
    g.strokeStyle='rgba(120,100,60,0.35)'; g.lineWidth=4;
    g.beginPath(); g.moveTo(feedStartX,feedStartY); g.lineTo(feedEndX,feedEndY); g.stroke();
    // Label
    g.save(); g.globalAlpha=0.65;
    g.fillStyle='#6a5030'; g.font='bold 6.5px JetBrains Mono'; g.textAlign='left';
    g.fillText('FEED (ORE + BINDER)',feedStartX-2,feedStartY-8);
    g.restore();
    // Small ore particles flowing from feed
    for(let p=0;p<4;p++){
      const pt=((frame*0.9+p*10)%30)/30;
      const px=feedStartX+(feedEndX-feedStartX)*pt;
      const py=feedStartY+(feedEndY-feedStartY)*pt;
      const pa=pt<0.1?(pt/0.1):(pt>0.8?(1-(pt-0.8)/0.2):1)*0.75;
      g.beginPath(); g.arc(px,py,2.0,0,Math.PI*2);
      g.fillStyle=`rgba(150,110,55,${pa.toFixed(2)})`; g.fill();
    }
  }

  // ── DISC + CONVEYOR LABEL ──
  g.save(); g.globalAlpha=0.55;
  g.fillStyle='#5a4828'; g.font='bold 9px JetBrains Mono'; g.textAlign='center';
  g.fillText('DISC PELLETIZER',discCX,discCY+discRy*0.18);
  g.font='bold 7px JetBrains Mono'; g.fillStyle='#4a3818';
  g.fillText('DISC PELLETIZER',discCX,discCY-discRy*0.12);
  g.restore();

  g.save(); g.globalAlpha=0.45;
  g.fillStyle='#5a4828'; g.font='bold 8px JetBrains Mono'; g.textAlign='center';
  const convMidX=(convStartX+convEndX)/2, convMidY=(convStartY+convEndY)/2-convH*0.12;
  g.fillText('CONVEYOR BELT',convMidX,convMidY-8);
  g.restore();

  // ── CONVEYOR BALLS (pellets riding belt) ──
  // Update physics
  for(let i=conveyorBalls.length-1;i>=0;i--){
    const cb=conveyorBalls[i];
    if(cb.falling){
      cb.vy+=0.28;
      cb.x+=cb.vx*0.4;
      cb.y+=cb.vy;
      const t=Math.max(0,Math.min(1,(cb.x-convStartX)/(convEndX-convStartX)));
      const beltSurfaceY=convStartY+t*(convEndY-convStartY)-cb.size;
      if(cb.y>=beltSurfaceY){
        cb.y=beltSurfaceY; cb.vy*=-0.20; cb.vx=1.6+Math.random()*0.5; cb.falling=false; cb.settled=false;
      }
    } else {
      // Ride belt — move right along belt angle
      const angle=Math.atan2(convEndY-convStartY,convEndX-convStartX);
      cb.x+=Math.cos(angle)*1.7;
      cb.y+=Math.sin(angle)*1.7;
    }
    if(cb.x>convEndX+cb.size*3){ conveyorBalls.splice(i,1); continue; }
  }

  // Draw conveyor balls
  g.save();
  // Clip to belt area with generous padding
  g.beginPath();
  g.moveTo(convStartX-8,convStartY-8);
  g.lineTo(convEndX+endRollerR+8,convEndY-8);
  g.lineTo(convEndX+endRollerR+8,convEndY+convH+8);
  g.lineTo(convStartX-8,convStartY+convH+8);
  g.closePath(); g.clip();

  conveyorBalls.forEach(cb=>{
    const pelGrad2=g.createRadialGradient(cb.x-cb.size*0.28,cb.y-cb.size*0.28,0,cb.x,cb.y,cb.size);
    pelGrad2.addColorStop(0,'rgba(210,180,110,0.95)');
    pelGrad2.addColorStop(0.45,'rgba(165,130,65,0.92)');
    pelGrad2.addColorStop(1,'rgba(90,70,30,0.88)');
    g.beginPath(); g.arc(cb.x,cb.y,cb.size,0,Math.PI*2);
    g.fillStyle=pelGrad2; g.fill();
    g.beginPath(); g.arc(cb.x-cb.size*0.28,cb.y-cb.size*0.28,cb.size*0.22,0,Math.PI*2);
    g.fillStyle='rgba(255,248,210,0.45)'; g.fill();
  });
  g.restore();

  // ── ANGLE INDICATOR (bottom of disc, like reference) ──
  {
    const indX=discCX-discRx*0.30, indY=discCY+discRy*1.05;
    // Dashed arc for angle
    g.save(); g.globalAlpha=0.75;
    g.strokeStyle='#4a80c8'; g.lineWidth=1.5; g.setLineDash([3,4]);
    g.beginPath(); g.arc(indX+18,indY-5,22,-Math.PI*0.85,-Math.PI*0.15); g.stroke();
    g.setLineDash([]);
    // Angle lines
    g.strokeStyle='#3a6aaa'; g.lineWidth=1.8; g.lineCap='round';
    g.beginPath(); g.moveTo(indX,indY); g.lineTo(indX+38,indY); g.stroke();
    g.beginPath(); g.moveTo(indX+8,indY); g.lineTo(indX+8+Math.cos(-Math.PI*0.52)*26,indY+Math.sin(-Math.PI*0.52)*26); g.stroke();
    // Label
    g.fillStyle='#3a5a90'; g.font='bold 8px JetBrains Mono'; g.textAlign='center';
    g.fillText(`${angleVal.toFixed(0)}°`,indX+28,indY+14);
    g.restore();
  }

  // ── DISC PELLETIZER TEXT LABELS ──
  g.save(); g.globalAlpha=0.62;
  g.fillStyle='#3a5a90'; g.font='bold 8px JetBrains Mono'; g.textAlign='left';
  g.fillText('DISC',discCX+discRx*0.68, discCY-discRy*0.60);
  g.fillText('PELLETIZER',discCX+discRx*0.68, discCY-discRy*0.42);
  g.restore();

  // ── DISCHARGE label ──
  g.save(); g.globalAlpha=0.50;
  g.fillStyle='#3a5a90'; g.font='bold 7px JetBrains Mono'; g.textAlign='right';
  g.fillText('DISC',W-6,H-18);
  g.restore();

  // ── RPM / ANGLE READOUT ──
  const hud_x=discCX-discRx*0.95, hud_y=H-28;
  g.fillStyle='rgba(26,40,70,0.80)';
  g.beginPath(); g.roundRect(hud_x,hud_y,108,18,4); g.fill();
  g.fillStyle='#e8c86a'; g.font='bold 7.5px JetBrains Mono'; g.textAlign='center';
  g.fillText(`α = ${angleVal.toFixed(1)}°  |  ${rpmVal.toFixed(1)} RPM`, hud_x+54, hud_y+12);

  // ── SAVE BURST ──
  if(burst>0){
    const bAlpha=Math.min(1,burst/18);
    g.save(); g.globalAlpha=bAlpha*0.95;
    g.shadowColor='#3aaa6a'; g.shadowBlur=16;
    g.strokeStyle='#3aaa6a'; g.lineWidth=4; g.lineCap='round';
    g.beginPath(); g.moveTo(W/2-14,H*0.88); g.lineTo(W/2-3,H*0.88+11); g.lineTo(W/2+16,H*0.88-11); g.stroke();
    g.restore();
  }

  // Update footer bar
  const barPct=((angleVal-46)/4)*0.45+(rpmVal-6)/2*0.55;
  const barEl=document.getElementById('ballDiscBarFill');
  if(barEl) barEl.style.width=(18+barPct*72)+'%';
}

  return {
    tick() { if(ballDiscSaveBurst>0) ballDiscSaveBurst-=0.5; drawBallDisc(ballDiscFrame, ballDiscSaveBurst); ballDiscFrame++; },
    burst(){ ballDiscSaveBurst=20; },
    touch(){},
  }
}
