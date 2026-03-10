# QueueBuzz Web

A modern, mobile-first queue management system built with Vue 3 and Vite.

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [Vue Router](https://router.vuejs.org/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide Vue](https://lucide.vuejs.org/)
- **Testing**: [Vitest](https://vitest.dev/)
- **E2E Testing**: [Playwright](https://playwright.dev/)

## Project Structure

```
src/
├── api/          # API client configuration
├── assets/       # Static assets
├── components/   # Reusable UI components
│   ├── base/     # Base UI primitives
│   └── layout/   # Layout components
├── composables/  # Vue composables
├── modules/      # Feature modules (host, customer, auth)
│   ├── auth/     # Authentication flows
│   ├── customer/ # Customer-facing queue features
│   └── host/     # Business/host features
├── router/       # Vue Router configuration
├── stores/       # Pinia stores
├── utils/        # Utility functions
└── views/        # Page views
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd queuebuzz-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev -- --port 5173
```

The application will be available at `http://localhost:5173`.

### Build

Build the production bundle:

```bash
npm run build
```

The output will be in the `dist/` directory.

### Testing

Run unit tests:

```bash
npm run test:unit
```

Run end-to-end tests:

```bash
npm run test:e2e
```

## License

[MIT](LICENSE)
