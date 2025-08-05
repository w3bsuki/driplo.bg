import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Ensure the fonts directory exists
const fontsDir = join(projectRoot, 'static', 'fonts');
if (!existsSync(fontsDir)) {
  mkdirSync(fontsDir, { recursive: true });
}

// Font files to copy
const fonts = [
  // Inter
  '@fontsource/inter/files/inter-latin-400-normal.woff2',
  '@fontsource/inter/files/inter-latin-400-normal.woff',
  '@fontsource/inter/files/inter-latin-500-normal.woff2',
  '@fontsource/inter/files/inter-latin-500-normal.woff',
  '@fontsource/inter/files/inter-latin-600-normal.woff2',
  '@fontsource/inter/files/inter-latin-600-normal.woff',
  '@fontsource/inter/files/inter-latin-700-normal.woff2',
  '@fontsource/inter/files/inter-latin-700-normal.woff',
  '@fontsource/inter/files/inter-cyrillic-400-normal.woff2',
  '@fontsource/inter/files/inter-cyrillic-400-normal.woff',
  '@fontsource/inter/files/inter-cyrillic-500-normal.woff2',
  '@fontsource/inter/files/inter-cyrillic-500-normal.woff',
  '@fontsource/inter/files/inter-cyrillic-600-normal.woff2',
  '@fontsource/inter/files/inter-cyrillic-600-normal.woff',
  '@fontsource/inter/files/inter-cyrillic-700-normal.woff2',
  '@fontsource/inter/files/inter-cyrillic-700-normal.woff',
  // Plus Jakarta Sans
  '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2',
  '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff',
  '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2',
  '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
  // JetBrains Mono
  '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2',
  '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff',
];

console.log('Copying font files...');

fonts.forEach(font => {
  try {
    const sourcePath = join(projectRoot, 'node_modules', font);
    const fileName = font.split('/').pop();
    const destPath = join(fontsDir, fileName);
    
    if (existsSync(sourcePath)) {
      copyFileSync(sourcePath, destPath);
      console.log(`✓ Copied ${fileName}`);
    } else {
      console.warn(`⚠ Font file not found: ${font}`);
    }
  } catch (error) {
    console.error(`✗ Error copying ${font}:`, error.message);
  }
});

console.log('Font copying complete!');