# HTTP Status Codes

Interactive HTTP status code reference with search, categories, descriptions and usage examples. Everything runs client-side -- no data is sent to any server.

**[Live Demo](https://gmowses.github.io/http-status)**

## Features

- **25 status codes** covering all major classes: 1xx, 2xx, 3xx, 4xx, 5xx
- **Search** -- filter by code number, name, or description text
- **Color-coded categories** -- blue (1xx), green (2xx), yellow (3xx), orange (4xx), red (5xx)
- **Expandable cards** -- click any code to reveal full description and usage example
- **RFC references** -- each code links to the relevant RFC section
- **Copy to clipboard** -- one-click copy of the status code number
- **Expand / collapse all** -- toggle all cards at once
- **Dark / Light mode** -- toggle or auto-detect from system preference
- **i18n** -- English and Portuguese (auto-detect from browser language)
- **Zero dependencies on backend** -- pure client-side, works offline

## Status Codes Covered

| Class | Codes |
|-------|-------|
| 1xx Informational | 100, 101 |
| 2xx Success | 200, 201, 202, 204 |
| 3xx Redirection | 301, 302, 304, 307, 308 |
| 4xx Client Error | 400, 401, 403, 404, 405, 408, 409, 413, 415, 422, 429 |
| 5xx Server Error | 500, 501, 502, 503, 504 |

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS v4
- Vite
- Lucide icons

## Getting Started

```bash
git clone https://github.com/gmowses/http-status.git
cd http-status
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build

```bash
npm run build
```

Static files are generated in `dist/`.

## License

[MIT](LICENSE) -- Gabriel Mowses
