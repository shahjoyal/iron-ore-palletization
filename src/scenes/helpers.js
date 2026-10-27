/* Small numeric / gradient helpers shared by the drawing routines. */
export function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
export function safeNum(v, fallback=null){
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function safeRadialGradient(ctx, x0, y0, r0, x1, y1, r1, fallback='#888'){
  if(!Number.isFinite(x0)||!Number.isFinite(y0)||!Number.isFinite(r0)||
     !Number.isFinite(x1)||!Number.isFinite(y1)||!Number.isFinite(r1)||
     r0<0||r1<=0){
    return ctx.createLinearGradient(0,0,1,0); // safe fallback
  }
  return ctx.createRadialGradient(x0,y0,r0,x1,y1,r1);
}
export function safeLinearGradient(ctx, x0, y0, x1, y1){
  if(!Number.isFinite(x0)||!Number.isFinite(y0)||!Number.isFinite(x1)||!Number.isFinite(y1)){
    return ctx.createLinearGradient(0,0,1,0);
  }
  return ctx.createLinearGradient(x0,y0,x1,y1);
}

export function hslTempColor(temp, variant='main'){
  const t = clamp((safeNum(temp, 0) - 120) / (950 - 120), 0, 1);
  const hue = 200 - t * 170; // cool blue -> hot red/orange
  const sat = variant === 'dark' ? 62 + t * 8 : 76 + t * 6;
  const light = variant === 'soft'
    ? 84 - t * 16
    : variant === 'dark'
      ? 28 - t * 4
      : 74 - t * 28;
  return `hsl(${hue.toFixed(1)} ${sat.toFixed(1)}% ${light.toFixed(1)}%)`;
}
