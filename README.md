# FitVerse - 3D Avatar Customizer

A modern web application for creating and customizing 3D avatars with real-time visualization. Built with React, Vite, Three.js, and Tailwind CSS.

## Features

- 🎨 **3D Avatar Visualization** - Interactive 3D avatar rendered with Three.js
- 📏 **Height & Weight Controls** - Adjustable sliders for body measurements
- 🎭 **Skin Color Selection** - Choose from multiple skin tone options
- 💇 **Hair Type Selection** - Multiple hair styles: Short, Medium, Long, Curly, and Bald
- 📊 **BMI Calculation** - Automatic BMI calculation based on height and weight
- 🎯 **Real-time Updates** - See changes instantly as you customize
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 💾 **Save & Load Avatars** - Save your avatar configurations to the cloud
- 🔐 **User Authentication** - Secure login and registration system

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Three.js** - 3D graphics library
- **Tailwind CSS v4** - Utility-first CSS framework
- **PocketBase** - Backend database and authentication

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PocketBase (see setup instructions below)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mmtandico/FitVerse.git
cd FitVerse
```

2. Install dependencies:
```bash
npm install
```

3. Set up PocketBase:
   - Download PocketBase from [releases](https://github.com/pocketbase/pocketbase/releases)
   - Extract `pocketbase.exe` (Windows) or `pocketbase` (macOS/Linux) to the project root
   - See [POCKETBASE_SETUP.md](./POCKETBASE_SETUP.md) for detailed setup instructions

4. Start PocketBase server:
```bash
# Windows
npm run pb:serve:win

# macOS/Linux
npm run pb:serve
```

5. Create your PocketBase admin account at `http://127.0.0.1:8090/_/`

6. Set up the `avatars` collection (see POCKETBASE_SETUP.md for details)

7. Create `.env` file (copy from `.env.example`):
```bash
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

8. Start the development server:
```bash
npm run dev
```

9. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run pb:serve` - Start PocketBase server (macOS/Linux)
- `npm run pb:serve:win` - Start PocketBase server (Windows)

## Project Structure

```
FitVerse/
├── src/
│   ├── components/
│   │   └── AuthModal.jsx    # Authentication modal component
│   ├── lib/
│   │   └── pocketbase.js    # PocketBase service and utilities
│   ├── App.jsx              # Main application component
│   ├── App.css              # App-specific styles
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles with Tailwind
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── POCKETBASE_SETUP.md      # PocketBase setup guide
└── .env.example             # Environment variables template
```

## Customization Options

- **Height**: 140cm - 200cm
- **Weight**: 40kg - 120kg
- **Skin Colors**: 5 preset options
- **Hair Types**: Short, Medium, Long, Curly, Bald

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
