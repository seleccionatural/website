const fs = require('fs');
const path = require('path');

// Create a simple build script for static HTML generation
const buildScript = `
const fs = require('fs');
const path = require('path');

// Simple static site generator
function generateStaticSite() {
  const distDir = path.join(__dirname, 'dist');
  
  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Copy public assets
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    files.forEach(file => {
      fs.copyFileSync(
        path.join(publicDir, file),
        path.join(distDir, file)
      );
    });
  }

  console.log('Static site generated successfully!');
}

generateStaticSite();
`;

fs.writeFileSync('build-static.js', buildScript);