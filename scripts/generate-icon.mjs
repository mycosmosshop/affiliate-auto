// PNG ikon oluşturucu
import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

const size = 512;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Arka plan
ctx.fillStyle = '#111827';
ctx.beginPath();
ctx.roundRect(0, 0, size, size, 80);
ctx.fill();

// İç kart
ctx.fillStyle = '#1f2937';
ctx.beginPath();
ctx.roundRect(40, 40, 432, 432, 60);
ctx.fill();

// Turuncu daire
ctx.fillStyle = '#f97316';
ctx.beginPath();
ctx.arc(256, 230, 150, 0, Math.PI * 2);
ctx.fill();

// A harfi
ctx.fillStyle = 'white';
ctx.font = 'bold 220px Arial Black';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('A', 256, 240);

// AUTO yazısı
ctx.fillStyle = '#f97316';
ctx.font = 'bold 52px Arial';
ctx.letterSpacing = '4px';
ctx.fillText('AUTO', 256, 440);

writeFileSync('./public/app-icon.png', canvas.toBuffer('image/png'));
console.log('Icon generated: public/app-icon.png');
