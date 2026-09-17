import fs from 'fs';

async function run() {
  const res = await fetch('https://www.dgrh.unicamp.br/dgrh/historia/');
  const html = await res.text();

  const regex = /<h2[^>]*>(\d{4})<\/h2>([\s\S]*?)(?=<h2\b|$)/gi;
  let m;
  const byYear = {};
  while ((m = regex.exec(html)) !== null) {
    const year = m[1];
    const content = m[2];
    const imgs = [...content.matchAll(/src=["']([^"']+)["']/gi)].map(x => x[1]);
    byYear[year] = imgs;
  }

  const checkYears = [
    '1983', '1985', '1986', '1989', '1990', '1993', '1995', '1996',
    '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004',
    '2005', '2006', '2008', '2011', '2014', '2015', '2017', '2018',
    '2019', '2022', '2024', '2025'
  ];

  for (const y of checkYears) {
    console.log(`${y}:`, byYear[y]);
  }
}

run();
