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
    rel = path.join('public/headshots/sm', head[1].replace(/\.[^.]+$/, '.jpg'));
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

function optimizedMediaMiddleware(req, res, next) {
  const file = resolveOptimized(req.url);
  if (!file) return next();
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  fs.createReadStream(file).pipe(res);
}

module.exports = { optimizedMediaMiddleware, resolveOptimized };
