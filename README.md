# Portfolio Website

A responsive portfolio website built with React, TypeScript, and Tailwind CSS, optimized for static hosting on GitHub Pages.

## Features

- 📱 Fully responsive design with mobile-first approach
- 🎨 Modern UI with smooth animations and transitions
- 🖼️ Pinterest-style gallery for artwork showcase
- 📧 Contact form integration
- 🎥 Video gallery with YouTube integration
- ⚡ Static site generation for GitHub Pages hosting

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build for static hosting
npm run build
```

### GitHub Pages Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. The `dist` folder contains all static files ready for deployment

3. Push the `dist` folder contents to your GitHub Pages repository

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Site header with logos
│   ├── Navigation.tsx  # Navigation menu
│   ├── ContentArea.tsx # Main content area
│   ├── ProjectCard.tsx # Project display cards
│   ├── VideoCard.tsx   # Video display cards
│   ├── WorkGallery.tsx # Pinterest-style gallery
│   ├── WorkModal.tsx   # Artwork detail modal
│   └── ContactForm.tsx # Contact form component
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## Responsive Design

The website features a mobile-first responsive design:

- **Desktop**: Full layout with sidebar navigation and multi-column grids
- **Tablet**: Adapted layouts with adjusted spacing and grid columns
- **Mobile**: Simplified layout with bottom navigation and single-column grids

## Static Hosting

This project is optimized for static hosting on platforms like:

- GitHub Pages
- Netlify
- Vercel
- Any static file hosting service

All assets are bundled and optimized for production deployment.

## Customization

### Adding New Artworks

Edit the `artworksData` array in `src/components/WorkGallery.tsx` to add new pieces to the gallery.

### Updating Contact Information

Modify the email address in `src/components/ContactForm.tsx` to change where contact forms are sent.

### Styling

The project uses Tailwind CSS for styling. Customize the design by modifying the Tailwind classes or extending the configuration in `tailwind.config.js`.

## License

This project is private and proprietary.