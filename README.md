## Usage

1. **Login:**
	- Open the app in your browser.
	- Log in with your credentials to access the dashboard and integrations.

2. **Manage Integrations:**
	- Go to the Integrations section to add, edit, or delete integrations.
	- You can enable Telegram forwarding by providing your Telegram bot token and chat ID.

3. **View Submissions:**
	- Submissions from your integrated websites will appear in the Submissions section.
	- If Telegram forwarding is enabled, you will receive messages in your Telegram chat.

4. **Real-time Chat:**
	- Use the Chat section to communicate in real time (if enabled for your account).

5. **Settings:**
	- Update your profile, API keys, and other settings in the Settings section.

# Contact Frontend

This is the frontend for the Contact SaaS platform. It is built with React, TypeScript, Vite, Tailwind CSS, and shadcn-ui components.

## Features

- User authentication (login, JWT)
- Dashboard for managing integrations
- Integration with Telegram for message forwarding
- Real-time chat via WebSocket
- Responsive UI with modern design

## Getting Started

### Prerequisites
- Node.js (18+ recommended)
- npm (comes with Node.js)

### Installation

Clone the repository and install dependencies:

```sh
git clone <YOUR_GIT_URL>
cd contact-front
npm install
```

### Development

Start the development server:

```sh
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Environment Variables

Create a `.env` file in the root of `contact-front` with the following variables:

```
VITE_API_BASE_URL=https://contact-api.graphmining.dev/api/v1
VITE_WS_BASE_URL=wss://contact-api.graphmining.dev/ws
```

For local development, you can use:

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_WS_BASE_URL=ws://localhost:3000/ws
```

## Tech Stack

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## Project Structure

- `src/components/` – UI and feature components
- `src/contexts/` – React context providers (Auth, WebSocket)
- `src/hooks/` – Custom React hooks
- `src/lib/` – API clients and utilities
- `src/pages/` – Page components

## Deployment

You can deploy this project to any static hosting provider (Vercel, Netlify, Cloudflare Pages, etc.).

For custom domain setup, configure your hosting provider’s domain settings.

## License

This project is licensed under the MIT License.
