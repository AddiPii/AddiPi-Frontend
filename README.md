# AddiPi Frontend

[EN] 

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![License](https://img.shields.io/badge/license-Private-red)

User interface for the AddiPi 3D printer management system - a modern web application for managing print jobs, monitoring printer status, and user administration.
Live demo: [AddiPi](https://addipi.vercel.app/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technologies](#-technologies)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running](#-running)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [API and Communication](#-api-and-communication)
- [Components](#-components)
- [Routing](#-routing)
- [State Management](#-state-management)
- [Styles and UI](#-styles-and-ui)
- [Security](#-security)
- [Production Build](#-production-build)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## 🎯 Overview

AddiPi Frontend is a modern web application built with React + TypeScript that serves as the user interface for an integrated 3D printer management system. The application communicates with backend microservices responsible for authentication, user management, files, and printer control.

### Key Features:
- 🎨 Modern, responsive user interface
- 🔐 Secure JWT authentication
- 📊 Real-time printer status monitoring
- 📁 Print file management (G-code)
- 👥 Admin panel for user management
- 📈 Print metrics and statistics
- 🔄 Automatic data refresh
- 🌐 Multi-microservice support

## ✨ Features

### For Users:
- **Registration and Login** - secure authentication system with email verification
- **G-code File Upload** - uploading files for printing
- **Job Management** - viewing, canceling, and monitoring own jobs
- **Dashboard** - current printer state and job queue view
- **User Profile** - editing personal information
- **Real-time Status** - tracking print progress with 5-second updates
- **Responsive Design** - optimized UI for mobile and desktop with adaptive logo positioning
- **Email Verification** - confirmation of email during registration process
- **Multi-language Support** - Polish and English interface with i18next
- **Dark/Light Theme** - toggle between dark and light mode with persistent settings
- **Footer Navigation** - links to main sections, contact info, and social media

### For Administrators:
- **Admin Panel** - comprehensive view of all jobs and users
- **User Management** - viewing, editing, and deleting accounts
- **Queue Management** - control over all print jobs
- **Global Statistics** - system and performance metrics
- **Printer Control** - managing status and jobs

## 🛠 Technologies

### Core:
- **React 18.2** - UI library
- **TypeScript 5.2** - static typing
- **Vite 5.1** - bundler and dev server

### Routing and Navigation:
- **React Router DOM 6.22** - client-side routing

### State Management:
- **Zustand 4.5** - lightweight state management

### HTTP and API:
- **Axios 1.6** - HTTP client with interceptors

### UI and Styling:
- **Tailwind CSS 3.4** - utility-first CSS framework
- **Lucide React 0.344** - icons
- **React Hot Toast 2.4** - notifications

### Utilities:
- **date-fns 3.3** - date operations
- **i18next 23.x** & **react-i18next** - internationalization (i18n) for multi-language support
- **ESLint** - code linting
- **PostCSS** - CSS processing

### DevTools:
- **TypeScript ESLint** - linting rules
- **Autoprefixer** - CSS compatibility

## 📦 Requirements

- **Node.js**: >= 16.x (recommended 18.x or newer)
- **npm**: >= 7.x or **yarn**: >= 1.22.x
- **Backend services** (must be running):
  - Auth Service (port 3001)
  - User Service (port 3002)
  - Printer Service (port 3050)
  - Files Service (port 5000)

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/AddiPii/AddiPi-Frontend.git
cd AddiPi-Frontend
```

### 2. Install Dependencies

```bash
npm install
```

or with yarn:

```bash
yarn install
```

## ⚙️ Configuration

### Environment Variables

The application uses hardcoded backend service URLs. To change API addresses, edit the `src/services/api.ts` file:

```typescript
const API_BASE = 'http://localhost';

const AUTH_URL = `${API_BASE}:3001`;
const USER_URL = `${API_BASE}:3002`;
const PRINTER_URL = `${API_BASE}:3050`;
const FILES_URL = `${API_BASE}:5000`;
```

### Vite Configuration

Development port and other settings can be changed in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,        // Development server port
    host: true,        // Listen on all interfaces
  },
});
```

### Tailwind CSS Configuration

Style customization in `tailwind.config.js`.

## 🏃 Running

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

Application will be available at: **http://localhost:5173**

### Production Mode (preview)

Build and preview production version:

```bash
npm run build
npm run preview
```

### Linting

Check code for errors:

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## 📁 Project Structure

```
AddiPi-Frontend/
├── public/                      # Static files
├── src/
│   ├── assets/                  # Assets (images, fonts)
│   ├── components/              # Reusable components
│   │   ├── Card.tsx            # Card component
│   │   ├── ConfirmDialog.tsx   # Confirmation modal
│   │   ├── ConnectionStatus.tsx # Connection indicator
│   │   ├── EmptyState.tsx      # Empty list state
│   │   ├── ErrorBoundary.tsx   # React error handler
│   │   ├── Layout.tsx          # Main layout with navigation
│   │   ├── LoadingSpinner.tsx  # Loading indicator
│   │   ├── ProgressBar.tsx     # Progress bar
│   │   └── StatusBadge.tsx     # Job status badge
│   ├── hooks/                   # Custom React hooks
│   │   ├── useDebounce.ts      # Debouncing hook
│   │   └── usePolling.ts       # Data polling hook
│   ├── pages/                   # Page components
│   │   ├── AdminDashboard.tsx  # Admin panel
│   │   ├── DashboardPage.tsx   # User dashboard
│   │   ├── HomePage.tsx        # Home page
│   │   ├── LoginPage.tsx       # Login page
│   │   ├── ProfilePage.tsx     # User profile
│   │   ├── RegisterPage.tsx    # Registration
│   │   ├── UploadPage.tsx      # File upload
│   │   └── VerifyEmailPage.tsx # Email verification
│   ├── services/                # Services and API
│   │   └── api.ts              # API client for all microservices
│   ├── store/                   # Global state management
│   │   └── useStore.ts         # Zustand store
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts            # Application data types
│   ├── utils/                   # Utility functions
│   │   └── formatters.ts       # Data formatting
│   ├── App.tsx                  # Main application component
│   ├── App.css                  # Global styles
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Base styles (Tailwind)
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── tsconfig.app.json            # TS config for app
├── tsconfig.node.json           # TS config for Vite
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
├── eslint.config.js             # ESLint configuration
└── README.md                    # This file
```

## 🏗 Architecture

### Design Patterns

#### 1. Component-based Architecture
Application built from reusable React components with clear separation of concerns.

#### 2. Container/Presentational Pattern
- **Pages** - containers with state and business logic
- **Components** - presentational components

#### 3. Custom Hooks
Reusable logic extracted into custom hooks:
- `useDebounce` - function execution delay
- `usePolling` - automatic data refresh

#### 4. Centralized State Management
Global state managed by Zustand with a single store.

#### 5. Service Layer
API abstraction layer in `services/api.ts` with:
- Axios instances for each microservice
- Automatic token refresh
- Authorization interceptors

## 🌐 API and Communication

### Microservices

The application communicates with 4 microservices:

#### 1. Auth Service (port 3001)
- `POST /auth/register` - user registration
- `POST /auth/login` - login
- `POST /auth/logout` - logout
- `PATCH /auth/refresh` - token refresh
- `GET /auth/verify-email` - email verification
- `POST /auth/resend-verification` - resend verification

#### 2. User Service (port 3002)
- `GET /users/me` - get logged-in user data
- `PATCH /users/me` - update profile
- `GET /users/me/jobs` - user jobs
- `GET /users/me/stats` - user statistics

#### 3. Printer Service (port 3050)
- `GET /printer/status` - printer status
- `GET /printer/metrics` - system metrics
- `GET /printer/current-job` - current job
- `GET /admin/jobs` - all jobs (admin)
- `PATCH /admin/jobs/:id/cancel` - cancel job (admin)

#### 4. Files Service (port 5000)
- `POST /files/upload` - G-code file upload
- `POST /files/schedule` - schedule printing

### Authorization

JWT (JSON Web Tokens) system:
- **Access Token** - short-term token (stored in localStorage)
- **Refresh Token** - long-term token for refreshing

Automatic token refresh in Axios interceptors:

```typescript
client.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Automatic token refresh
      const refreshToken = localStorage.getItem('refreshToken');
      const { data } = await this.authClient.patch('/auth/refresh', { refreshToken });
      // Retry original request
    }
  }
);
```

## 🧩 Components

### Layout Components

#### Layout.tsx
Main application layout with:
- Top navigation
- User menu
- Connection status indicator
- Responsive design support

### UI Components

#### Card.tsx
Universal container for displaying content.

#### ConfirmDialog.tsx
Dialog modal for confirming actions (e.g., delete, cancel).

#### ConnectionStatus.tsx
Printer connection status indicator:
- 🟢 **Idle** - printer ready
- 🟡 **Printing** - printing
- 🔴 **Offline** - no connection

#### EmptyState.tsx
Component displayed when there's no data to show.

#### ErrorBoundary.tsx
Global React error handler - catches errors and displays message.

#### LoadingSpinner.tsx
Animated loading indicator.

#### ProgressBar.tsx
Progress bar with percentage and status.

#### StatusBadge.tsx
Badge with colored job status indicator:
- `scheduled` 🔵 - scheduled
- `pending` 🟡 - pending
- `printing` 🟣 - printing
- `completed` 🟢 - completed
- `failed` 🔴 - failed
- `cancelled` ⚫ - cancelled

#### LanguageToggle.tsx
Language switcher component:
- Toggle between Polish (PL) and English (EN)
- Uses i18next for language switching
- Integrated with Zustand store

#### ThemeToggle.tsx
Theme switcher component:
- Toggle between dark and light modes
- Uses Tailwind CSS dark mode class
- Persists preference to localStorage via Zustand
- Shows Sun icon in dark mode, Moon icon in light mode

#### Footer
Main application footer with:
- Logo and brief description
- Navigation links to main sections
- Contact information and social media links (GitHub, LinkedIn)
- Copyright information
- Responsive grid layout (adapts to mobile/desktop)

## 🗺 Routing

Application uses React Router v6 with the following routes:

| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/` | HomePage | Public | Welcome page |
| `/login` | LoginPage | Public | Login |
| `/register` | RegisterPage | Public | Registration |
| `/verify-email` | VerifyEmailPage | Public | Email verification |
| `/verify-email-info` | VerifyEmailInfoPage | Public | Email verification info |
| `/dashboard` | DashboardPage | Protected | User dashboard |
| `/upload` | UploadPage | Protected | File upload |
| `/profile` | ProfilePage | Protected | User profile |
| `/admin` | AdminDashboard | Admin | Admin panel |

### Protected Routes

Protected routes require authentication:

```typescript
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

## 🏪 State Management

Application uses **Zustand** - a lightweight state management library.

### Store Structure

```typescript
interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Printer
  printerStatus: PrinterStatus | null;
  metrics: Metrics | null;
  currentJob: Job | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  fetchPrinterStatus: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchCurrentJob: () => Promise<void>;
  setUser: (user: User | null) => void;
}
```

### Usage in Components

```typescript
import { useStore } from './store/useStore';

function MyComponent() {
  const { user, printerStatus, fetchPrinterStatus } = useStore();
  
  // Use state and actions
}
```

### Automatic Refresh

Printer status and metrics are automatically refreshed every 5 seconds:

```typescript
useEffect(() => {
  fetchPrinterStatus();
  fetchMetrics();

  const interval = setInterval(() => {
    fetchPrinterStatus();
    fetchMetrics();
  }, 5000);

  return () => clearInterval(interval);
}, []);
```

## 🎨 Styles and UI

### Tailwind CSS

Application uses Tailwind CSS version 3.4 with utility-first configuration.

#### Key Classes Used:
- Layout: `container`, `mx-auto`, `px-4`, `py-8`
- Grid: `grid`, `grid-cols-*`, `gap-*`
- Flexbox: `flex`, `items-center`, `justify-between`
- Colors: `bg-*`, `text-*`, `border-*`
- Responsive: `sm:*`, `md:*`, `lg:*`, `xl:*`
- States: `hover:*`, `focus:*`, `disabled:*`

### Icons

**Lucide React** - modern SVG icon set:

```typescript
import { Printer, Upload, User, LogOut } from 'lucide-react';
```

### Notifications

**React Hot Toast** for toast notifications:

```typescript
import toast from 'react-hot-toast';

toast.success('Operation completed successfully!');
toast.error('An error occurred');
toast.loading('Loading...');
```

### Theme

Colors and theme defined in Tailwind config with extension capability.

## 🔒 Security

### Authentication
- JWT with refresh tokens
- Tokens stored in localStorage
- Automatic refresh on expiration

### Authorization
- Protected routes with role validation
- Admin routes only for administrators
- Backend permission checking

### XSS Protection
- React automatically escapes data
- No use of `dangerouslySetInnerHTML`

### CORS
- Backend must have CORS configured
- Allow localhost:5173 in dev

### Best Practices
- Input data validation
- HTTP error handling
- Request timeouts
- Uploaded file sanitization

## 📦 Production Build

### Build

```bash
npm run build
```

Creates optimized build in `dist/` directory:
- JS/CSS minification
- Tree shaking
- Code splitting
- Asset optimization

### Production Requirements

1. **Environment Variables** - update API URLs for production
2. **HTTPS** - required for secure communication
3. **CORS** - configure on backend for production domain
4. **Server** - nginx/Apache with SPA configuration:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Deploy

Possible options:
- **Netlify** - automatic deploy from GitHub
- **Vercel** - React optimization
- **AWS S3 + CloudFront** - scalable hosting
- **Docker** - containerization with nginx

## 🧪 Testing

### Adding Tests (recommended)

Project currently doesn't contain tests. Recommended tools:

#### Jest + React Testing Library

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

#### Vitest (native Vite integration)

```bash
npm install --save-dev vitest @testing-library/react
```

#### E2E Testing

```bash
npm install --save-dev cypress
# or
npm install --save-dev playwright
```

## 🔧 Troubleshooting

### Common Issues

#### 1. API Connection Error

```
Error: Network Error
```

**Solution:**
- Check if all microservices are running
- Verify ports in `api.ts`
- Check CORS on backend

#### 2. Token Expired

```
401 Unauthorized
```

**Solution:**
- Automatic refresh should work
- Check if refresh token is valid
- Logout and login again

#### 3. Build Error

```
TypeScript error
```

**Solution:**
- Check types in `types/index.ts`
- Run `npx tsc --noEmit` for details
- Update types according to API

#### 4. Hot Reload Not Working

**Solution:**
- Restart dev server: Ctrl+C → `npm run dev`
- Clear cache: `rm -rf node_modules/.vite`
- Check Vite configuration

#### 5. Tailwind Styles Not Loading

**Solution:**
- Check import in `index.css`
- Verify `tailwind.config.js`
- Restart dev server

## 🤝 Contributing

### Workflow

1. Fork the project
2. Create branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push: `git push origin feature/new-feature`
5. Open Pull Request

### Code Style

- Use TypeScript
- ESLint for code consistency
- Functional components with hooks
- Tailwind CSS for styles
- Comments for complex logic

### Naming Conventions

- **Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useDebounce.ts`)
- **Utils:** camelCase (e.g., `formatDate.ts`)
- **Types:** PascalCase (e.g., `User`, `PrinterStatus`)

---

## 📄 License

Private project - **AddiPi**

## 📧 Contact

For questions or issues, contact the AddiPi team.

---

**Built with ❤️ by the AddiPi team**


[PL]

# AddiPi Frontend

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![License](https://img.shields.io/badge/license-Private-red)

Interfejs użytkownika dla systemu zarządzania drukarką 3D AddiPi - nowoczesna aplikacja webowa do zarządzania zadaniami drukowania, monitorowania statusu drukarki oraz administracji użytkownikami.

## 📋 Spis treści

- [Przegląd](#-przegląd)
- [Funkcjonalności](#-funkcjonalności)
- [Technologie](#-technologie)
- [Wymagania](#-wymagania)
- [Instalacja](#-instalacja)
- [Konfiguracja](#-konfiguracja)
- [Uruchomienie](#-uruchomienie)
- [Struktura projektu](#-struktura-projektu)
- [Architektura](#-architektura)
- [API i Komunikacja](#-api-i-komunikacja)
- [Komponenty](#-komponenty)
- [Routing](#-routing)
- [Zarządzanie stanem](#-zarządzanie-stanem)
- [Style i UI](#-style-i-ui)
- [Bezpieczeństwo](#-bezpieczeństwo)
- [Budowanie produkcyjne](#-budowanie-produkcyjne)
- [Testowanie](#-testowanie)
- [Rozwiązywanie problemów](#-rozwiązywanie-problemów)
- [Contributing](#-contributing)

## 🎯 Przegląd

AddiPi Frontend to nowoczesna aplikacja webowa napisana w React + TypeScript, która stanowi interfejs użytkownika dla zintegrowanego systemu zarządzania drukarką 3D. Aplikacja komunikuje się z mikrousługami backendowymi odpowiedzialnymi za uwierzytelnianie, zarządzanie użytkownikami, plikami i kontrolę drukarki.

### Główne cechy:
- 🎨 Nowoczesny, responsywny interfejs użytkownika
- 🔐 Bezpieczne uwierzytelnianie z JWT
- 📊 Monitorowanie w czasie rzeczywistym statusu drukarki
- 📁 Zarządzanie plikami do drukowania (G-code)
- 👥 Panel administracyjny dla zarządzania użytkownikami
- 📈 Metryki i statystyki drukowania
- 🔄 Automatyczne odświeżanie danych
- 🌐 Obsługa wielu mikrousług

## ✨ Funkcjonalności

### Dla użytkowników:
- **Rejestracja i logowanie** - bezpieczny system uwierzytelniania z weryfikacją email
- **Upload plików G-code** - przesyłanie plików do drukowania
- **Zarządzanie zadaniami** - przeglądanie, anulowanie i monitorowanie własnych zadań
- **Dashboard** - widok bieżącego stanu drukarki i kolejki zadań
- **Profil użytkownika** - edycja danych osobowych
- **Status w czasie rzeczywistym** - śledzenie postępu drukowania z aktualizacją co 5 sekund
- **Responsywny design** - zoptymalizowany UI dla urządzeń mobilnych i desktopowych z adaptacyjnym pozycjonowaniem logo
- **Weryfikacja email** - potwierdzenie adresu email podczas procesu rejestracji
- **Obsługa wielojęzyczna** - interfejs w j. polskim i angielskim z i18next
- **Tryb ciemny/jasny** - przełączanie pomiędzy trybami ze zapisem ustawień
- **Nawigacja w stopce** - linki do głównych sekcji, dane kontaktowe i media społeczne

### Dla administratorów:
- **Panel administracyjny** - kompleksowy widok wszystkich zadań i użytkowników
- **Zarządzanie użytkownikami** - przeglądanie, edycja i usuwanie kont
- **Zarządzanie kolejką** - kontrola nad wszystkimi zadaniami drukowania
- **Statystyki globalne** - metryki systemu i wydajności
- **Kontrola drukarki** - zarządzanie statusem i zadaniami

## 🛠 Technologie

### Core:
- **React 18.2** - biblioteka UI
- **TypeScript 5.2** - typowanie statyczne
- **Vite 5.1** - bundler i dev server

### Routing i nawigacja:
- **React Router DOM 6.22** - routing po stronie klienta

### Zarządzanie stanem:
- **Zustand 4.5** - lekki state management

### HTTP i API:
- **Axios 1.6** - HTTP client z interceptorami

### UI i styling:
- **Tailwind CSS 3.4** - utility-first CSS framework
- **Lucide React 0.344** - ikony
- **React Hot Toast 2.4** - notyfikacje

### Narzędzia pomocnicze:
- **date-fns 3.3** - operacje na datach
- **i18next 23.x** & **react-i18next** - internacjonalizacja (i18n) dla obsługi wielu języków
- **ESLint** - linting kodu
- **PostCSS** - przetwarzanie CSS

### DevTools:
- **TypeScript ESLint** - reguły lintingu
- **Autoprefixer** - kompatybilność CSS

## 📦 Wymagania

- **Node.js**: >= 16.x (zalecane 18.x lub nowszy)
- **npm**: >= 7.x lub **yarn**: >= 1.22.x
- **Backend services** (muszą być uruchomione):
  - Auth Service (port 3001)
  - User Service (port 3002)
  - Printer Service (port 3050)
  - Files Service (port 5000)

## 🚀 Instalacja

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/AddiPii/AddiPi-Frontend.git
cd AddiPi-Frontend
```

### 2. Instalacja zależności

```bash
npm install
```

lub z yarn:

```bash
yarn install
```

## ⚙️ Konfiguracja

### Zmienne środowiskowe

Aplikacja używa zakodowanych na sztywno URL-i serwisów backendowych. Aby zmienić adresy API, edytuj plik `src/services/api.ts`:

```typescript
const API_BASE = 'http://localhost';

const AUTH_URL = `${API_BASE}:3001`;
const USER_URL = `${API_BASE}:3002`;
const PRINTER_URL = `${API_BASE}:3050`;
const FILES_URL = `${API_BASE}:5000`;
```

### Konfiguracja Vite

Port deweloperski i inne ustawienia można zmienić w `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,        // Port serwera deweloperskiego
    host: true,        // Nasłuchiwanie na wszystkich interfejsach
  },
});
```

### Konfiguracja Tailwind CSS

Personalizacja stylów w `tailwind.config.js`.

## 🏃 Uruchomienie

### Tryb deweloperski

Uruchom serwer deweloperski z hot module replacement:

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: **http://localhost:5173**

### Tryb produkcyjny (preview)

Zbuduj i podejrzyj wersję produkcyjną:

```bash
npm run build
npm run preview
```

### Linting

Sprawdź kod pod kątem błędów:

```bash
npm run lint
```

### Sprawdzanie typów

```bash
npx tsc --noEmit
```

## 📁 Struktura projektu

```
AddiPi-Frontend/
├── public/                      # Pliki statyczne
├── src/
│   ├── assets/                  # Zasoby (obrazy, czcionki)
│   ├── components/              # Komponenty wielokrotnego użytku
│   │   ├── Card.tsx            # Komponent karty
│   │   ├── ConfirmDialog.tsx   # Modal potwierdzenia
│   │   ├── ConnectionStatus.tsx # Wskaźnik połączenia
│   │   ├── EmptyState.tsx      # Pusty stan listy
│   │   ├── ErrorBoundary.tsx   # Obsługa błędów React
│   │   ├── Layout.tsx          # Główny layout z nawigacją
│   │   ├── LoadingSpinner.tsx  # Wskaźnik ładowania
│   │   ├── ProgressBar.tsx     # Pasek postępu
│   │   └── StatusBadge.tsx     # Badge statusu zadania
│   ├── hooks/                   # Custom React hooks
│   │   ├── useDebounce.ts      # Hook do debounce'owania
│   │   └── usePolling.ts       # Hook do pollingu danych
│   ├── pages/                   # Komponenty stron
│   │   ├── AdminDashboard.tsx  # Panel administratora
│   │   ├── DashboardPage.tsx   # Dashboard użytkownika
│   │   ├── HomePage.tsx        # Strona główna
│   │   ├── LoginPage.tsx       # Strona logowania
│   │   ├── ProfilePage.tsx     # Profil użytkownika
│   │   ├── RegisterPage.tsx    # Rejestracja
│   │   ├── UploadPage.tsx      # Upload plików
│   │   └── VerifyEmailPage.tsx # Weryfikacja email
│   ├── services/                # Usługi i API
│   │   └── api.ts              # Klient API dla wszystkich mikrousług
│   ├── store/                   # Zarządzanie stanem globalnym
│   │   └── useStore.ts         # Zustand store
│   ├── types/                   # Definicje typów TypeScript
│   │   └── index.ts            # Typy danych aplikacji
│   ├── utils/                   # Funkcje pomocnicze
│   │   └── formatters.ts       # Formatowanie danych
│   ├── App.tsx                  # Główny komponent aplikacji
│   ├── App.css                  # Style globalne
│   ├── main.tsx                 # Punkt wejścia aplikacji
│   └── index.css                # Style bazowe (Tailwind)
├── index.html                   # HTML template
├── package.json                 # Zależności i skrypty
├── tsconfig.json                # Konfiguracja TypeScript
├── tsconfig.app.json            # TS config dla aplikacji
├── tsconfig.node.json           # TS config dla Vite
├── vite.config.ts               # Konfiguracja Vite
├── tailwind.config.js           # Konfiguracja Tailwind
├── postcss.config.js            # Konfiguracja PostCSS
├── eslint.config.js             # Konfiguracja ESLint
└── README.md                    # Ten plik
```

## 🏗 Architektura

### Wzorce projektowe

#### 1. Component-based Architecture
Aplikacja zbudowana z reużywalnych komponentów React z jasnym podziałem odpowiedzialności.

#### 2. Container/Presentational Pattern
- **Pages** - kontenery ze stanem i logiką biznesową
- **Components** - komponenty prezentacyjne

#### 3. Custom Hooks
Logika wielokrotnego użytku wydzielona do custom hooks:
- `useDebounce` - opóźnienie wykonania funkcji
- `usePolling` - automatyczne odświeżanie danych

#### 4. Centralized State Management
Globalny stan zarządzany przez Zustand z pojedynczym store.

#### 5. Service Layer
Warstwa abstrakcji API w `services/api.ts` z:
- Instancjami Axios dla każdej mikrousługi
- Automatycznym odświeżaniem tokenów
- Interceptorami dla autoryzacji

## 🌐 API i Komunikacja

### Mikrousługi

Aplikacja komunikuje się z 4 mikrousługami:

#### 1. Auth Service (port 3001)
- `POST /auth/register` - rejestracja użytkownika
- `POST /auth/login` - logowanie
- `POST /auth/logout` - wylogowanie
- `PATCH /auth/refresh` - odświeżanie tokenu
- `GET /auth/verify-email` - weryfikacja email
- `POST /auth/resend-verification` - ponowne wysłanie weryfikacji

#### 2. User Service (port 3002)
- `GET /users/me` - pobieranie danych zalogowanego użytkownika
- `PATCH /users/me` - aktualizacja profilu
- `GET /users/me/jobs` - zadania użytkownika
- `GET /users/me/stats` - statystyki użytkownika

#### 3. Printer Service (port 3050)
- `GET /printer/status` - status drukarki
- `GET /printer/metrics` - metryki systemu
- `GET /printer/current-job` - bieżące zadanie
- `GET /admin/jobs` - wszystkie zadania (admin)
- `PATCH /admin/jobs/:id/cancel` - anulowanie zadania (admin)

#### 4. Files Service (port 5000)
- `POST /files/upload` - upload pliku G-code
- `POST /files/schedule` - zaplanowanie drukowania

### Autoryzacja

System JWT (JSON Web Tokens):
- **Access Token** - krótkoterminowy token (przechowywany w localStorage)
- **Refresh Token** - długoterminowy token do odświeżania

Automatyczne odświeżanie tokenów w interceptorach Axios:

```typescript
client.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Automatyczne odświeżanie tokenu
      const refreshToken = localStorage.getItem('refreshToken');
      const { data } = await this.authClient.patch('/auth/refresh', { refreshToken });
      // Retry oryginalnego żądania
    }
  }
);
```

## 🧩 Komponenty

### Komponenty layoutu

#### Layout.tsx
Główny layout aplikacji z:
- Nawigacją górną
- Menu użytkownika
- Wskaźnikiem statusu połączenia
- Obsługą responsywności

### Komponenty UI

#### Card.tsx
Uniwersalny kontener do wyświetlania zawartości.

#### ConfirmDialog.tsx
Modal dialogowy do potwierdzania akcji (np. usuwanie, anulowanie).

#### ConnectionStatus.tsx
Wskaźnik stanu połączenia z drukarką:
- 🟢 **Idle** - drukarka gotowa
- 🟡 **Printing** - drukuje
- 🔴 **Offline** - brak połączenia

#### EmptyState.tsx
Komponent wyświetlany gdy brak danych do pokazania.

#### ErrorBoundary.tsx
Globalny handler błędów React - przechwytuje błędy i wyświetla komunikat.

#### LoadingSpinner.tsx
Animowany wskaźnik ładowania.

#### ProgressBar.tsx
Pasek postępu z procentami i statusem.

#### StatusBadge.tsx
Badge z kolorowym wskaźnikiem statusu zadania:
- `scheduled` 🔵 - zaplanowane
- `pending` 🟡 - oczekujące
- `printing` 🟣 - drukuje
- `completed` 🟢 - ukończone
- `failed` 🔴 - nieudane
- `cancelled` ⚫ - anulowane

#### LanguageToggle.tsx
Komponent przełącznika języka:
- Przełączanie pomiędzy j. polskim (PL) i angielskim (EN)
- Używa i18next do przełączania języka
- Zintegrowany ze store Zustand

#### ThemeToggle.tsx
Komponent przełącznika motywu:
- Przełączanie pomiędzy trybem ciemnym i jasnym
- Używa Tailwind CSS dark mode class
- Zapisuje preferencję do localStorage przez Zustand
- Wyświetla ikonę Słońca w trybie ciemnym, Księżyca w trybie jasnym

#### Footer
Główna stopka aplikacji zawierająca:
- Logo i krótki opis
- Linki nawigacyjne do głównych sekcji
- Dane kontaktowe i linki do mediów społecznych (GitHub, LinkedIn)
- Informacja o prawach autorskich
- Responsywny grid layout (dostosowuje się na mobile/desktop)

## 🗺 Routing

Aplikacja używa React Router v6 z następującymi trasami:

| Ścieżka | Komponent | Dostęp | Opis |
|---------|-----------|--------|------|
| `/` | HomePage | Publiczny | Strona powitalna |
| `/login` | LoginPage | Publiczny | Logowanie |
| `/register` | RegisterPage | Publiczny | Rejestracja |
| `/verify-email` | VerifyEmailPage | Publiczny | Weryfikacja email |
| `/verify-email-info` | VerifyEmailInfoPage | Publiczny | Informacja o weryfikacji email |
| `/dashboard` | DashboardPage | Chroniony | Dashboard użytkownika |
| `/upload` | UploadPage | Chroniony | Upload plików |
| `/profile` | ProfilePage | Chroniony | Profil użytkownika |
| `/admin` | AdminDashboard | Admin | Panel administratora |

### Protected Routes

Chronione trasy wymagają uwierzytelnienia:

```typescript
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

## 🏪 Zarządzanie stanem

Aplikacja używa **Zustand** - lekkiej biblioteki do zarządzania stanem.

### Store Structure

```typescript
interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Printer
  printerStatus: PrinterStatus | null;
  metrics: Metrics | null;
  currentJob: Job | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  fetchPrinterStatus: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchCurrentJob: () => Promise<void>;
  setUser: (user: User | null) => void;
}
```

### Użycie w komponentach

```typescript
import { useStore } from './store/useStore';

function MyComponent() {
  const { user, printerStatus, fetchPrinterStatus } = useStore();
  
  // Użycie stanu i akcji
}
```

### Automatyczne odświeżanie

Status drukarki i metryki są automatycznie odświeżane co 5 sekund:

```typescript
useEffect(() => {
  fetchPrinterStatus();
  fetchMetrics();

  const interval = setInterval(() => {
    fetchPrinterStatus();
    fetchMetrics();
  }, 5000);

  return () => clearInterval(interval);
}, []);
```

## 🎨 Style i UI

### Tailwind CSS

Aplikacja używa Tailwind CSS w wersji 3.4 z konfiguracją utility-first.

#### Kluczowe klasy używane:
- Layout: `container`, `mx-auto`, `px-4`, `py-8`
- Grid: `grid`, `grid-cols-*`, `gap-*`
- Flexbox: `flex`, `items-center`, `justify-between`
- Kolory: `bg-*`, `text-*`, `border-*`
- Responsywność: `sm:*`, `md:*`, `lg:*`, `xl:*`
- Stany: `hover:*`, `focus:*`, `disabled:*`

### Ikony

**Lucide React** - nowoczesny zestaw ikon SVG:

```typescript
import { Printer, Upload, User, LogOut } from 'lucide-react';
```

### Notyfikacje

**React Hot Toast** dla notyfikacji toast:

```typescript
import toast from 'react-hot-toast';

toast.success('Operacja zakończona sukcesem!');
toast.error('Wystąpił błąd');
toast.loading('Ładowanie...');
```

### Theme

Kolory i motyw definiowane w Tailwind config z możliwością rozszerzenia.

## 🔒 Bezpieczeństwo

### Uwierzytelnianie
- JWT z refresh tokenami
- Tokeny przechowywane w localStorage
- Automatyczne odświeżanie przy wygaśnięciu

### Autoryzacja
- Protected routes z walidacją roli
- Admin routes tylko dla administratorów
- Sprawdzanie uprawnień po stronie backendu

### XSS Protection
- React automatycznie escapuje dane
- Brak użycia `dangerouslySetInnerHTML`

### CORS
- Backend musi mieć skonfigurowane CORS
- Pozwolenie na localhost:5173 w dev

### Best Practices
- Walidacja danych wejściowych
- Obsługa błędów HTTP
- Timeout dla requestów
- Sanityzacja uploadowanych plików

## 📦 Budowanie produkcyjne

### Build

```bash
npm run build
```

Utworzy zoptymalizowany build w katalogu `dist/`:
- Minifikacja JS/CSS
- Tree shaking
- Code splitting
- Asset optimization

### Wymagania produkcyjne

1. **Zmienne środowiskowe** - zaktualizuj URL-e API dla produkcji
2. **HTTPS** - wymagane dla bezpiecznej komunikacji
3. **CORS** - skonfiguruj na backendzie dla domeny produkcyjnej
4. **Serwer** - nginx/Apache z konfiguracją SPA:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Deploy

Możliwe opcje:
- **Netlify** - automatyczny deploy z GitHub
- **Vercel** - optymalizacja dla React
- **AWS S3 + CloudFront** - skalowalny hosting
- **Docker** - konteneryzacja z nginx

## 🧪 Testowanie

### Dodanie testów (zalecane)

Projekt nie zawiera obecnie testów. Zalecane narzędzia:

#### Jest + React Testing Library

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

#### Vitest (natywna integracja z Vite)

```bash
npm install --save-dev vitest @testing-library/react
```

#### E2E Testing

```bash
npm install --save-dev cypress
# lub
npm install --save-dev playwright
```

## 🔧 Rozwiązywanie problemów

### Częste problemy

#### 1. Błąd połączenia z API

```
Error: Network Error
```

**Rozwiązanie:**
- Sprawdź czy wszystkie mikrousługi są uruchomione
- Zweryfikuj porty w `api.ts`
- Sprawdź CORS na backendzie

#### 2. Token wygasł

```
401 Unauthorized
```

**Rozwiązanie:**
- Automatyczne odświeżanie powinno działać
- Sprawdź czy refresh token jest ważny
- Wyloguj i zaloguj ponownie

#### 3. Build error

```
TypeScript error
```

**Rozwiązanie:**
- Sprawdź typy w `types/index.ts`
- Uruchom `npx tsc --noEmit` dla szczegółów
- Zaktualizuj typy zgodnie z API

#### 4. Hot reload nie działa

**Rozwiązanie:**
- Restart serwera dev: Ctrl+C → `npm run dev`
- Wyczyść cache: `rm -rf node_modules/.vite`
- Sprawdź konfigurację Vite

#### 5. Tailwind styles nie ładują się

**Rozwiązanie:**
- Sprawdź import w `index.css`
- Zweryfikuj `tailwind.config.js`
- Restart dev servera

## 🤝 Contributing

### Workflow

1. Fork projektu
2. Utwórz branch: `git checkout -b feature/new-feature`
3. Commit zmian: `git commit -m 'Add new feature'`
4. Push: `git push origin feature/new-feature`
5. Otwórz Pull Request

### Code Style

- Używaj TypeScript
- ESLint dla spójności kodu
- Komponenty funkcyjne z hooks
- Tailwind CSS dla stylów
- Komentarze dla złożonej logiki

### Konwencje nazewnictwa

- **Komponenty:** PascalCase (np. `UserProfile.tsx`)
- **Hooks:** camelCase z prefixem `use` (np. `useDebounce.ts`)
- **Utils:** camelCase (np. `formatDate.ts`)
- **Types:** PascalCase (np. `User`, `PrinterStatus`)

---

## 📄 Licencja

Projekt prywatny - **AddiPi**

## 📧 Kontakt

W razie pytań lub problemów, skontaktuj się z zespołem AddiPi.

---

**Zbudowane z ❤️ przez zespół AddiPi**
