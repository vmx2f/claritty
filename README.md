# Next database project template
This template contains configuration with good practices for a project with auth, database, internationalization, type safety, using Bun as package manager:
## Project structure

```
〥
├── messages/          # Translation files (en.json, es.json)
├── convex/            # Convex backend (database, auth)
│   ├── _generated/
│   │   ├──  api.d.ts
│   │   ├──  api.js
│   │   ├──  dataModel.d.ts
│   │   ├──  server.d.ts
│   │   └──  server.js
│   ├──  auth.config.ts
│   ├──  auth.ts
│   ├──  convex.config.ts
│   ├──  https.ts
│   └──  schema.ts
├── public/                # Static assets
├── src/
│   ├── app/
│   │   ├── [locale]/      # Localized routes
│   │   ├── api/           # Localized routes
│   │   │     └── auth/
│   │   │          └── [...all]/
│   │   │                └── route.ts
│   │   ├── _components/   # Shared components
│   │   ├── globals.css    # Global styles
│   │   ├── robots.ts      # SEO robots.txt
│   │   └── sitemap.ts     # SEO sitemap.xml
│   ├── env/               # Environment variable validation
│   │   ├── client.ts      # Client-side env vars (NEXT_PUBLIC_*)
│   │   └── server.ts      # Server-side env vars
│   ├── i18n/          # Internationalization configuration
│   ├── lib/
│   │   ├── auth-client.ts
│   │   └── auth-server.ts
│   └── proxy.ts       # Middleware for locale handling
├── next.config.ts     # Next.js configuration
├── package.json       # Project dependencies and scripts
└── README.md          # Project documentation
```

## About configurations
### next-intl
This dependency comes packed to handle i18n.
- Uses Extracted for easy translation.
- `proxy.ts` (formely middleware) to handle locale changes, language toggle and routes.
- `navigation.ts` to handle navigation easily.
- `request.ts` to handle the request of all the languages available under `/messages` to use in the app.
- `routing.ts` to handle the languages that the app will manage and the default language.
### Tailwindcss
This dependency comes packed to basic styling and dark mode support.
- `globals.css` to handle global styles smooth transitions and colors.
- `theme-switch.tsx` to handle theme changes.
### Convex + BetterAuth
Use `env-example.txt` for the enviroment variables standard usage
- use `bunx convex dev` to start the convex server
- Generate a secret for encryption and generating hashes. `bunx convex env set BETTER_AUTH_SECRET=generated32charactersecret`
- Add your site URL to your Convex deployment. `bunx convex env set SITE_URL http://localhost:3000`
### SEO
Basic templates for `robots.ts` and `sitemap.ts`.
- `robots.ts` to handle robots.txt.
- `sitemap.ts` to handle sitemaps.xml.
### Zustand
This dependency comes packed for ease of use
### T3 Env
Environment variable validation with build-time type safety.
- `env/client.ts` - Client-side environment variables (NEXT_PUBLIC_*)
- `env/server.ts` - Server-side environment variables
- Uses Zod for validation and TypeScript for type safety

Made with ♡ by [0xSlyv](https://github.com/0xSlyv).