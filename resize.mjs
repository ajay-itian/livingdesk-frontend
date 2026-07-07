import sharp from 'sharp';

const files = [
  'public/images/CABIN_3_NEW.webp',
  'public/images/VTP/VTP_Altitude.webp',
  'public/images/CABIN_2_NEW.webp',
  'public/images/hot_desk.webp'
];

async function run() {
  for (const file of files) {
    const thumb = file.replace('.webp', '-thumb.webp');
    await sharp(file)
      .resize(800) // Resize width to 800px, keeping aspect ratio
      .webp({ quality: 80, effort: 6 }) // Compress WebP
      .toFile(thumb);
    console.log(`Created thumbnail: ${thumb}`);
  }
}

run().catch(console.error);
