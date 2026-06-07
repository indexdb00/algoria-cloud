// Deterministic abstract SVG avatar from any seed string.
function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function abstractAvatarDataUrl(seed: string, size = 96): string {
  const h = hash(seed || "aurevia");
  const hueA = h % 360;
  const hueB = (hueA + 40 + (h % 60)) % 360;
  const shape = h % 4;
  const rot = (h % 360);
  const cx1 = 20 + (h % 30);
  const cy1 = 20 + ((h >> 3) % 30);
  const cx2 = 60 + ((h >> 5) % 30);
  const cy2 = 60 + ((h >> 7) % 30);
  let path = "";
  if (shape === 0) path = `<circle cx='${cx1}' cy='${cy1}' r='${22 + (h % 12)}' fill='url(#g2)' opacity='0.85'/><circle cx='${cx2}' cy='${cy2}' r='${18 + ((h >> 2) % 14)}' fill='url(#g1)' opacity='0.9'/>`;
  else if (shape === 1) path = `<polygon points='10,80 50,15 90,80' fill='url(#g1)' opacity='0.9'/><circle cx='${cx2}' cy='${cy2}' r='${14 + (h % 10)}' fill='url(#g2)' opacity='0.85'/>`;
  else if (shape === 2) path = `<rect x='10' y='10' width='50' height='50' rx='14' fill='url(#g1)' opacity='0.9' transform='rotate(${rot} 35 35)'/><rect x='40' y='40' width='50' height='50' rx='14' fill='url(#g2)' opacity='0.85'/>`;
  else path = `<path d='M10,60 Q40,10 90,40 T70,90 Z' fill='url(#g1)' opacity='0.9'/><circle cx='${cx2}' cy='${cy2}' r='${12 + (h % 10)}' fill='url(#g2)' opacity='0.95'/>`;

  const svg = `
<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 100 100'>
  <defs>
    <linearGradient id='g1' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='hsl(${hueA} 80% 65%)'/>
      <stop offset='100%' stop-color='hsl(${hueB} 75% 45%)'/>
    </linearGradient>
    <linearGradient id='g2' x1='1' y1='0' x2='0' y2='1'>
      <stop offset='0%' stop-color='hsl(${hueB} 80% 70%)'/>
      <stop offset='100%' stop-color='hsl(${hueA} 70% 40%)'/>
    </linearGradient>
  </defs>
  <rect width='100' height='100' fill='hsl(${hueA} 30% 18%)'/>
  ${path}
</svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function greetingKey(date = new Date()): "morning" | "afternoon" | "evening" | "night" {
  const h = date.getHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  if (h < 22) return "evening";
  return "night";
}
