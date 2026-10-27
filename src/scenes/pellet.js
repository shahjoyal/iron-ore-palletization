/* Ported from the original dashboard: drawing routines are unchanged.
 * They run inside a factory so each canvas gets its own state and the
 * React app only talks to the returned { tick, burst, touch } API. */
import { clamp, safeNum, safeRadialGradient, safeLinearGradient, hslTempColor } from './helpers.js'

export const CANVAS_ID = 'pelletFallCanvas'

export function createPelletScene(canvas, stageParams) {
  const document = {
    getElementById: (id) => (id === CANVAS_ID ? canvas : window.document.getElementById(id)),
    querySelectorAll: (s) => window.document.querySelectorAll(s),
  }
  let t = null

let pelletFallFrame=0, pelletFallAnimId=null, pelletFallActive=false;
let pelletFillLevel=0; // 0..1
let pelletBalls=[];    // array of {x,y,vx,vy,r,hue,settled}
const pelletFallCanvas=document.getElementById('pelletFallCanvas');
const pelletFallCtx=pelletFallCanvas.getContext('2d');

const PELLET_COLORS=[
  {h1:'#d4a876',h2:'#8b5e3c',h3:'#4a2e14'},
  {h1:'#c49a6c',h2:'#7a4e2c',h3:'#3a2010'},
  {h1:'#c8a06a',h2:'#7a5030',h3:'#3e2210'},
  {h1:'#be9060',h2:'#6e4428',h3:'#36180e'},
];

function sizePelletCanvas(){
  const wrap=pelletFallCanvas.parentElement;
  const W=Math.max(wrap.clientWidth||380,10);
  const H=Math.max(wrap.clientHeight||170,10);
  const ratio=window.devicePixelRatio||1;
  const wPx=Math.round(W*ratio), hPx=Math.round(H*ratio);
  if(pelletFallCanvas.width!==wPx||pelletFallCanvas.height!==hPx){
    pelletFallCanvas.width=wPx; pelletFallCanvas.height=hPx;
    pelletFallCtx.setTransform(ratio,0,0,ratio,0,0);
  }
  return{W,H};
}

function spawnPelletBall(W){
  const r=6+Math.random()*5;
  const col=PELLET_COLORS[Math.floor(Math.random()*PELLET_COLORS.length)];
  return{
    x: r*2 + Math.random()*(W-r*4),
    y: -r*2 - Math.random()*60,
    vx:(Math.random()-0.5)*0.8,
    vy:0.8+Math.random()*1.2,
    r, col, settled:false,
    spin:Math.random()*Math.PI*2,
    spinV:(Math.random()-0.5)*0.05
  };
}

function drawPelletFall(frame){
  const{W,H}=sizePelletCanvas();
  pelletFallCtx.clearRect(0,0,W,H);

  // Background
  const bg=pelletFallCtx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#08111e'); bg.addColorStop(1,'#0e1e34');
  pelletFallCtx.fillStyle=bg; pelletFallCtx.fillRect(0,0,W,H);

  // Subtle grid
  pelletFallCtx.strokeStyle='rgba(80,130,200,0.04)'; pelletFallCtx.lineWidth=0.6;
  for(let x=0;x<W;x+=24){pelletFallCtx.beginPath();pelletFallCtx.moveTo(x,0);pelletFallCtx.lineTo(x,H);pelletFallCtx.stroke();}
  for(let y=0;y<H;y+=24){pelletFallCtx.beginPath();pelletFallCtx.moveTo(0,y);pelletFallCtx.lineTo(W,y);pelletFallCtx.stroke();}

  // Container walls (industrial steel vessel)
  const wallT=8, wallH=H*0.85, wallY=H-wallH;
  const wallL=wallT, wallR=W-wallT;
  // Left wall
  const lwg=pelletFallCtx.createLinearGradient(0,0,wallT*2,0);
  lwg.addColorStop(0,'#2a3d5a'); lwg.addColorStop(1,'rgba(42,61,90,0)');
  pelletFallCtx.fillStyle=lwg; pelletFallCtx.fillRect(0,wallY,wallT,wallH);
  // Right wall
  const rwg=pelletFallCtx.createLinearGradient(W,0,W-wallT*2,0);
  rwg.addColorStop(0,'#2a3d5a'); rwg.addColorStop(1,'rgba(42,61,90,0)');
  pelletFallCtx.fillStyle=rwg; pelletFallCtx.fillRect(W-wallT,wallY,wallT,wallH);
  // Bottom
  const bwg=pelletFallCtx.createLinearGradient(0,H,0,H-wallT*1.5);
  bwg.addColorStop(0,'#2a3d5a'); bwg.addColorStop(1,'rgba(42,61,90,0)');
  pelletFallCtx.fillStyle=bwg; pelletFallCtx.fillRect(0,H-wallT,W,wallT);
  // Wall borders (gold accent)
  pelletFallCtx.strokeStyle='rgba(200,145,42,0.35)'; pelletFallCtx.lineWidth=1;
  pelletFallCtx.strokeRect(wallT,wallY,W-wallT*2,wallH);

  // Fill level indicator line
  const fillY=H-wallT-(wallH-wallT*2)*pelletFillLevel;
  if(pelletFillLevel>0.02){
    pelletFallCtx.strokeStyle='rgba(200,145,42,0.5)'; pelletFallCtx.lineWidth=0.8;
    pelletFallCtx.setLineDash([4,3]);
    pelletFallCtx.beginPath(); pelletFallCtx.moveTo(wallT,fillY); pelletFallCtx.lineTo(W-wallT,fillY); pelletFallCtx.stroke();
    pelletFallCtx.setLineDash([]);
  }

  // Spawn new balls when active
  if(pelletFallActive && pelletBalls.filter(b=>!b.settled).length<4 && pelletBalls.length<120){
    if(frame%8===0) pelletBalls.push(spawnPelletBall(W));
  }

  const GRAVITY=0.25, FRICTION=0.65, BOUNCE=0.25;
  const floor=H-wallT;

  // Physics
  for(const b of pelletBalls){
    if(b.settled) continue;
    b.vy+=GRAVITY;
    b.x+=b.vx; b.y+=b.vy;
    b.spin+=b.spinV;

    // Floor collision
    if(b.y+b.r>=floor){
      b.y=floor-b.r;
      b.vy*=-BOUNCE;
      b.vx*=FRICTION;
      b.spinV*=0.8;
      if(Math.abs(b.vy)<0.3 && Math.abs(b.vx)<0.3){b.settled=true;}
    }
    // Wall collisions
    if(b.x-b.r<=wallT){b.x=wallT+b.r; b.vx=Math.abs(b.vx)*FRICTION;}
    if(b.x+b.r>=W-wallT){b.x=W-wallT-b.r; b.vx=-Math.abs(b.vx)*FRICTION;}

    // Ball-ball collision (simple)
    for(const b2 of pelletBalls){
      if(b2===b) continue;
      const dx=b2.x-b.x, dy=b2.y-b.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      const minDist=b.r+b2.r;
      if(dist<minDist && dist>0.01){
        const nx=dx/dist, ny=dy/dist;
        const overlap=(minDist-dist)*0.5;
        b.x-=nx*overlap; b.y-=ny*overlap;
        b2.x+=nx*overlap; b2.y+=ny*overlap;
        const dvx=b.vx-b2.vx, dvy=b.vy-b2.vy;
        const dot=dvx*nx+dvy*ny;
        if(dot>0){
          b.vx-=dot*nx*0.5; b.vy-=dot*ny*0.5;
          b2.vx+=dot*nx*0.5; b2.vy+=dot*ny*0.5;
        }
        if(b2.settled && Math.abs(b.vy)<0.5){b.settled=true;}
      }
    }
  }

  // Draw balls (bottom to top for layering)
  const sorted=[...pelletBalls].sort((a,b)=>b.y-a.y);
  for(const b of sorted){
    const px=b.x, py=b.y;
    // Shadow
    pelletFallCtx.save();
    pelletFallCtx.globalAlpha=0.25;
    pelletFallCtx.fillStyle='rgba(0,0,0,0.5)';
    pelletFallCtx.beginPath(); pelletFallCtx.ellipse(px,floor-1,b.r*0.8,b.r*0.25,0,0,Math.PI*2); pelletFallCtx.fill();
    pelletFallCtx.restore();
    // Pellet body
    const gr=safeRadialGradient(pelletFallCtx,px-b.r*0.32,py-b.r*0.32,0,px,py,b.r);
    gr.addColorStop(0,b.col.h1); gr.addColorStop(0.55,b.col.h2); gr.addColorStop(1,b.col.h3);
    pelletFallCtx.beginPath(); pelletFallCtx.arc(px,py,b.r,0,Math.PI*2);
    pelletFallCtx.fillStyle=gr; pelletFallCtx.fill();
    // Highlight
    pelletFallCtx.save(); pelletFallCtx.globalAlpha=0.28;
    pelletFallCtx.fillStyle='rgba(255,255,255,0.9)';
    pelletFallCtx.beginPath(); pelletFallCtx.ellipse(px-b.r*0.28,py-b.r*0.28,b.r*0.35,b.r*0.22,-0.5,0,Math.PI*2); pelletFallCtx.fill();
    pelletFallCtx.restore();
    // Edge
    pelletFallCtx.strokeStyle='rgba(140,175,200,0.2)'; pelletFallCtx.lineWidth=0.5;
    pelletFallCtx.beginPath(); pelletFallCtx.arc(px,py,b.r,0,Math.PI*2); pelletFallCtx.stroke();
  }

  // Chute at top
  pelletFallCtx.fillStyle='rgba(42,61,90,0.85)';
  pelletFallCtx.beginPath(); pelletFallCtx.moveTo(W*0.35,0); pelletFallCtx.lineTo(W*0.65,0); pelletFallCtx.lineTo(W*0.55,18); pelletFallCtx.lineTo(W*0.45,18); pelletFallCtx.closePath(); pelletFallCtx.fill();
  pelletFallCtx.strokeStyle='rgba(200,145,42,0.4)'; pelletFallCtx.lineWidth=1;
  pelletFallCtx.stroke();

  // Update fill level
  const settledCount=pelletBalls.filter(b=>b.settled).length;
  const targetFill=Math.min(1, settledCount/80);
  pelletFillLevel+=(targetFill-pelletFillLevel)*0.03;

  // Update UI
  const pct=Math.round(pelletFillLevel*100);
  const ro=document.getElementById('pelletFillReadout');
  if(ro){ro.textContent=pct+'%'; ro.style.color=pct>75?'#e8b84b':pct>40?'#c8912a':'rgba(200,145,42,0.9)';}
  const mf=document.getElementById('pelletMeterFill');
  if(mf) mf.style.width=pct+'%';
}

function pelletFallLoop(){
  drawPelletFall(pelletFallFrame);
  pelletFallFrame++;
  pelletFallAnimId=requestAnimationFrame(pelletFallLoop);
}

function togglePelletAnim(){
  pelletFallActive=!pelletFallActive;
  const btn=document.getElementById('pelletPlayBtn');
  if(btn) btn.textContent=pelletFallActive?'⏸ Pause':'▶ Start';
}

function resetPelletAnim(){
  pelletFallActive=false;
  pelletBalls=[];
  pelletFillLevel=0;
  pelletFallFrame=0;
  const btn=document.getElementById('pelletPlayBtn');
  if(btn) btn.textContent='▶ Start';
  const ro=document.getElementById('pelletFillReadout');
  if(ro){ro.textContent='0%';}
  const mf=document.getElementById('pelletMeterFill');
  if(mf) mf.style.width='0%';
}

  return {
    tick() { drawPelletFall(pelletFallFrame); pelletFallFrame++; },
    burst(){},
    touch(){},
    toggle(){ togglePelletAnim(); return pelletFallActive; },
    reset(){ resetPelletAnim(); },
  }
}
