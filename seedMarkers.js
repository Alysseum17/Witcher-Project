import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import slugify from 'slugify';
import { Marker } from './server/models/markerModel.js';

dotenv.config({ path: './config.env' });

const REGION_FILES = [
  'white-orchard.json',
  'hos-velen.json',
  'kaer-morhen.json',
  'skellige.json',
  'toussaint.json',
];

const COMMON_NAMES_FILE = 'commonNames.json';
const COMMON_DESCRIPTIONS_FILE = 'commonDescriptions.json';

const loadJSON = async (file) =>
  JSON.parse(await fs.readFile(path.resolve(file), 'utf-8'));

(async () => {
  const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD,
  );
  await mongoose.connect(DB);
  console.log('✅  DB connected');
  const commonNames = await loadJSON(COMMON_NAMES_FILE);
  const commonDescriptions = await loadJSON(COMMON_DESCRIPTIONS_FILE);

  const docs = [];

  for (const file of REGION_FILES) {
    const regionData = await loadJSON(file);

    const rawName = path.basename(file, '.json');
    const spaced = rawName.replace(/([a-z])([A-Z])/g, '$1 $2');
    const mapSlug = slugify(spaced, { lower: true });

    for (const [klass, points] of Object.entries(regionData)) {
      for (const p of points) {
        docs.push({
          map: mapSlug,
          class: klass,
          title: p.title ?? commonNames[klass] ?? klass,
          description: p.descr ?? commonDescriptions[klass] ?? '',
          lat: p.lat,
          lng: p.lng,
          owner: null,
          isPublic: true,
        });
      }
    }
  }
  if (docs.length) {
    await Marker.create(docs);
    console.log(`✅  Inserted ${docs.length} markers`);
  } else {
    console.log('⚠️  Nothing to insert');
  }

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
