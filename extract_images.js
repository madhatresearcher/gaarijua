const fs = require('fs');
const text = fs.readFileSync('prado.html', 'utf8');
const regex = /https:\/\/[^"'>\s]+\.(?:jpg|jpeg)/g;
const urls = text.match(regex) || [];
const carwowUrls = [];
const fallbackUrls = [];
for (const url of urls) {
  if (!fallbackUrls.includes(url)) fallbackUrls.push(url);
  if (
    (url.includes('carwow') || url.includes('caranddriver') || url.includes('hips.hearstapps.com')) &&
    !url.includes('headshots') &&
    !url.includes('wheel')
  ) {
    if (!carwowUrls.includes(url)) {
      carwowUrls.push(url);
      if (carwowUrls.length >= 5) break;
    }
  }
}
const output = carwowUrls.length ? carwowUrls : fallbackUrls.slice(0, 20);
for (const url of output) {
  console.log(url);
}
