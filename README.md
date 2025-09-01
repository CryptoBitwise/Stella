# AR Star Map - Progressive Web App

A beautiful augmented reality star map that works on any device! Point your phone at the sky to identify stars, constellations, and learn fascinating facts about celestial objects.

## ✨ Features

- **Real Astronomical Calculations** - Uses astronomy-engine for accurate star positions
- **AR Star Identification** - Point your device at the sky to see star names and info
- **Interactive Star Map** - Tap on stars to learn more about them
- **Constellation Lines** - Visualize star patterns in the night sky
- **Real-time Updates** - Star positions update automatically with time
- **GPS Integration** - Get accurate star positions based on your location
- **Offline Support** - Works even without internet connection
- **Installable** - Add to your home screen for a native app experience
- **Responsive Design** - Works perfectly on phones, tablets, and desktops

## 🚀 Getting Started

### Option 1: Quick Start (Local Development)

1. Download all the files to a folder
2. Install dependencies: `npm install` (or the app will use CDN fallback)
3. Open `generate-icons.html` in your browser to create app icons
4. Save the generated icons to an `icons/` folder
5. Open `index.html` in your browser
6. Use Shift + mouse movement to look around (or touch/drag on mobile)

### Option 2: Professional Star Catalog (Recommended)

1. Install dependencies: `npm install`
2. Generate the star catalog: `node process-stars.js`
3. Integrate stars into your app: `node integrate-stars.js`
4. Your app now has 100+ real stars with accurate data!

### Option 3: Deploy to Web Server

1. Upload all files to any web server (GitHub Pages, Netlify, Vercel, etc.)
2. Make sure your server supports HTTPS (required for PWA features)
3. Visit your website - users can now install it as an app!

### Option 4: Local Server (Recommended for Development)

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## 📱 PWA Features

### Install Prompt

- Users will see an "Add to Home Screen" prompt after 3 seconds
- Works on Android Chrome, Edge, and other Chromium browsers
- iOS users can manually add via Safari's share button

### Offline Support

- Service worker caches the app for offline use
- Star data and basic functionality work without internet
- Shows offline indicator when connection is lost

### App-like Experience

- Full-screen display when launched from home screen
- Custom app icons and splash screen
- Native app behavior and animations

## 🎯 How to Use

### On Mobile (Best Experience)

1. **Point your phone at the sky** - The app uses your device's orientation sensors
2. **Look around** - Stars will appear as you move your device
3. **Tap on stars** - Get detailed information and fun facts
4. **Install the app** - Add to home screen for quick access

### On Desktop

1. **Hold Shift + Move mouse** - Simulates looking around
2. **Click on stars** - View star information
3. **Use touch gestures** - If you have a touchscreen

### Controls

- **Toggle Camera** - Switch between camera view and starfield background
- **Toggle Lines** - Show/hide constellation connections
- **Get Location** - Use GPS to improve star positioning accuracy

## 🌟 Star Data

### Basic Version

The app includes information about 8 bright stars:

- **Betelgeuse** - Red supergiant in Orion
- **Sirius** - Brightest star in our sky
- **Polaris** - Current North Star
- **Vega** - First photographed star
- **Arcturus** - Fast-moving orange giant
- **Rigel** - Blue supergiant in Orion
- **Aldebaran** - Eye of Taurus
- **Capella** - Four-star system

### Professional Star Catalog

For a truly professional experience, use the included star catalog processor:

1. **HYG v4.2 Catalog** - Downloads the Yale Bright Star Catalog
2. **100+ Visible Stars** - All stars visible to the naked eye
3. **Real Astronomical Data** - Accurate coordinates, magnitudes, distances
4. **Enhanced Constellations** - More constellation patterns
5. **Auto-generated Facts** - Interesting information about each star

The processor filters stars by magnitude < 6.5 (naked eye visibility) and includes:

- Proper names (when available)
- Constellation assignments
- Spectral types
- Distance data in light years
- Right ascension and declination coordinates

## 🛠️ Technical Details

### Files Structure

```
ar-star-map/
├── index.html              # Main app file
├── manifest.json           # PWA manifest
├── sw.js                  # Service worker
├── generate-icons.html     # Icon generator tool
├── process-stars.js        # Star catalog processor
├── integrate-stars.js      # Star integration script
├── stella_stars.json      # Processed star catalog (generated)
├── icons/                 # App icons (generate these)
├── package.json           # Dependencies
└── README.md              # This file
```

### PWA Requirements Met

- ✅ Web App Manifest
- ✅ Service Worker with offline support
- ✅ HTTPS/secure context
- ✅ Responsive design
- ✅ Install prompt
- ✅ App icons in multiple sizes

### Browser Support

- **Chrome/Edge** - Full PWA support
- **Firefox** - Basic PWA support
- **Safari** - Limited PWA support (can add to home screen)
- **Mobile browsers** - Full AR experience with device orientation

## 🔧 Customization

### Adding More Stars

Edit the `stars` array in `index.html`:

```javascript
{
    name: "New Star",
    constellation: "Constellation Name",
    ra: 123.45,        // Right ascension in degrees
    dec: -67.89,       // Declination in degrees
    magnitude: 2.5,    // Brightness (lower = brighter)
    distance: "100 light years",
    type: "Star Type",
    fact: "Interesting fact about this star!",
    size: 1.0          // Visual size multiplier
}
```

### Adding Constellation Lines

Edit the `constellationLines` array:

```javascript
{ from: "Star1", to: "Star2" }
```

### Changing Colors

Update the CSS variables in the `<style>` section:

- `#4fb3ff` - Primary blue color
- `#000428` - Dark blue background
- `#004e92` - Lighter blue background

## 🚀 Future Enhancements

- **More Stars** - Expand to include hundreds of stars
- **Real-time Data** - Connect to astronomical databases
- **Planet Tracking** - Show planets and their positions
- **Moon Phases** - Display current moon phase
- **Search Function** - Find specific stars or constellations
- **Time Travel** - See how the sky looked in the past/future
- **Social Features** - Share discoveries with friends

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Device Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Device_Orientation_Event)
- [Star Catalogs](https://en.wikipedia.org/wiki/Star_catalog)
- [Celestial Coordinates](https://en.wikipedia.org/wiki/Celestial_coordinate_system)

## 🤝 Contributing

This is a hobby project, but contributions are welcome! Feel free to:

- Add more stars and constellations
- Improve the star positioning algorithm
- Enhance the UI/UX
- Add new features
- Fix bugs

## 📄 License

This project is open source. Feel free to use, modify, and distribute as you wish.

---

**Happy stargazing! 🌟**

*Built with HTML, CSS, and JavaScript - no frameworks required!*
