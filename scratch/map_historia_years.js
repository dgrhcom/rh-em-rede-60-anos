import fs from 'fs';

async function run() {
  const res = await fetch('https://www.dgrh.unicamp.br/dgrh/historia/');
  const html = await res.text();

  // Look for sections by year or blocks
  // Find each year and its images and text
  const regex = /<h2[^>]*>(\d{4})<\/h2>([\s\S]*?)(?=<h2\b|$)/gi;
  let m;
  const byYear = {};
  while ((m = regex.exec(html)) !== null) {
    const year = m[1];
    const content = m[2];
    const imgs = [...content.matchAll(/src=["']([^"']+)["']/gi)].map(x => x[1]);
    const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    byYear[year] = { imgs, text: text.slice(0, 300) };
  }

  console.log('Years parsed:', Object.keys(byYear));
  for (const [y, data] of Object.entries(byYear)) {
    console.log(`=== ${y} ===`);
    console.log('Images:', data.imgs);
    console.log('Text preview:', data.text);
  }
}

run();
