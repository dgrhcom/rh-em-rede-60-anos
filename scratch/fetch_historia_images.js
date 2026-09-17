import fs from 'fs';

async function run() {
  try {
    const res = await fetch('https://www.dgrh.unicamp.br/dgrh/historia/');
    const html = await res.text();
    console.log('HTML size:', html.length);

    // Find all img tags or links to images
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    const images = [];
    while ((match = imgRegex.exec(html)) !== null) {
      const tag = match[0];
      const src = match[1];
      const altMatch = tag.match(/alt=["']([^"']*)["']/i);
      const titleMatch = tag.match(/title=["']([^"']*)["']/i);
      images.push({
        src,
        alt: altMatch ? altMatch[1] : '',
        title: titleMatch ? titleMatch[1] : '',
      });
    }

    console.log('Total images found:', images.length);
    console.log(JSON.stringify(images, null, 2));

    // Also look for links to images (.jpg, .png, etc.)
    const linkRegex = /href=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))["']/gi;
    const linkedImages = [];
    while ((match = linkRegex.exec(html)) !== null) {
      linkedImages.push(match[1]);
    }
    console.log('Linked images:', linkedImages);

    // Let's also check if there are year sections or headings in the page
    const headings = html.match(/<(?:h[1-6]|strong|p)[^>]*>(?:19\d\d|20\d\d)[^<]*<\/(?:h[1-6]|strong|p)>/gi) || [];
    console.log('Year headings in page:', headings);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
