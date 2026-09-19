# Auth App Frontend

React + Vite frontend for full-stack authentication application.

## Features

- User signup and login
- JWT authentication
- Toast notifications
- Dark mode support
- Onboarding tours
- Phone number formatting (+XX XXXXXXXXXX)
- Password strength indicator
- Form validation
- Responsive design
- Mobile-optimized

## Tech Stack

- React 18
- Vite
- React Router
- Axios
- CSS3 (no UI library - minimalistic custom design)

## Environment Variables

Create `.env.development` and `.env.production` files:

```env
VITE_API_URL=http://localhost:8081
```

For production:
```env
VITE_API_URL=https://your-backend.onrender.com
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs on http://localhost:5173

## Build

```bash
npm run build
```

Output in `dist/` folder

## Preview Production Build

```bash
npm run preview
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository on Vercel
3. Set environment variables:
   - `VITE_API_URL`: Your backend URL
4. Deploy automatically

### Manual Deployment

```bash
npm run build
```

Upload `dist/` folder to any static hosting service.

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Toast.jsx
│   │   ├── Spinner.jsx
│   │   ├── OnboardingTour.jsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Signup.jsx
│   │   ├── Login.jsx
│   │   └── Home.jsx
│   ├── services/         # API services
│   │   ├── api.js        # Axios instance
│   │   ├── authService.js
│   │   └── userService.js
│   ├── utils/            # Utility functions
│   │   └── tokenUtils.js
│   ├── contexts/         # React contexts
│   │   └── ThemeContext.jsx
│   ├── config/           # Configuration
│   │   └── api.js        # API URL config
│   └── App.jsx           # Main app component
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
└── package.json          # Dependencies

```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

MIT
