const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

/**
 * Serve the small stand-ins for images that are shown at thumbnail size.
 * Falls through when a derivative is missing so the original still works.
 */
function resolveOptimized(urlPath) {
  const pathname = decodeURIComponent(String(urlPath || '').split('?')[0]);
  if (pathname.includes('..')) return null;

  let rel = null;
  const head = pathname.match(/^\/headshots\/([^/]+)$/);
  if (head) {
    const stem = head[1].replace(/\.[^.]+$/, '');
    // Prefer the PNG stand-in. Headshots are transparent cutouts; the JPEG
    // derivatives were flattened onto white, which shows as white side
    // slivers inside the circular crop. CSS fills the transparent area.
    const pngRel = path.join('public/headshots/sm', `${stem}.png`);
    rel = fs.existsSync(path.join(ROOT, pngRel))
      ? pngRel
      : path.join('public/headshots/sm', `${stem}.jpg`);
  }

  const avatar = pathname.match(/^\/videos\/(Female|Male)\/([^/]+)\.png$/);
  if (avatar) {
    rel = path.join('public/videos/avatars', avatar[1], `${avatar[2]}.jpg`);
  }

  const shelf = pathname.match(/^\/shelf\/photos\/(photo-\d+)\.png$/);
  if (shelf) {
    rel = path.join('public/shelf/photos/opt', `${shelf[1]}.jpg`);
  }

  if (!rel) return null;
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) return null;
  return file;
}

function contentTypeFor(file) {
  switch (path.extname(file).toLowerCase()) {
    case '.png': return 'image/png';
    case '.webp': return 'image/webp';
    default: return 'image/jpeg';
  }
}

function optimizedMediaMiddleware(req, res, next) {
  const file = resolveOptimized(req.url);
  if (!file) return next();
  res.setHeader('Content-Type', contentTypeFor(file));
  res.setHeader('Cache-Control', 'public, max-age=86400');
  fs.createReadStream(file).pipe(res);
}

module.exports = { optimizedMediaMiddleware, resolveOptimized };
