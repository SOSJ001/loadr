import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'static', 'icons');
const masterSvgPath = join(iconsDir, 'icon-512.svg');
const maskableSvgPath = join(iconsDir, 'icon-512-maskable.svg');

mkdirSync(iconsDir, { recursive: true });

const masterSvg = readFileSync(masterSvgPath);

await sharp(masterSvg).resize(192, 192).png().toFile(join(iconsDir, 'icon-192.png'));
await sharp(masterSvg).resize(512, 512).png().toFile(join(iconsDir, 'icon-512.png'));
await sharp(masterSvg).resize(180, 180).png().toFile(join(iconsDir, 'apple-touch-icon.png'));

if (existsSync(maskableSvgPath)) {
	await sharp(readFileSync(maskableSvgPath))
		.resize(512, 512)
		.png()
		.toFile(join(iconsDir, 'icon-512-maskable.png'));
} else {
	console.warn(
		'static/icons/icon-512-maskable.svg not found — generating maskable PNG from icon-512.svg. Export Maskable — 512 from Figma for Android safe-zone padding.'
	);
	await sharp(masterSvg).resize(512, 512).png().toFile(join(iconsDir, 'icon-512-maskable.png'));
}

console.log(
	'Generated static/icons/icon-192.png, icon-512.png, apple-touch-icon.png, and icon-512-maskable.png'
);
