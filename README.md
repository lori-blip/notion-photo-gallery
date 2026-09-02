# Frameflow photo gallery

A responsive, embeddable photo gallery for Netlify and Notion. One deployment supports unlimited independent gallery instances. Each gallery accepts up to 15 photos, supports touch swiping, desktop buttons, keyboard arrows, captions, and a configurable accent color.

## How data isolation works

- Every new gallery receives a random ID in the URL (`?gallery=abc12345`). Its data is stored in IndexedDB under that ID, only in the current browser. No user or gallery can read another gallery's record through the app.
- Galleries made entirely from public image URLs can create a portable `?config=...` link. The complete configuration is encoded in that URL, so it works in Notion and on other devices without a database. Nothing is sent to a shared datastore.
- Uploaded files stay only in the browser. They are intentionally excluded from portable links.

## Deploy to Netlify

### From Git (recommended)

1. Put this folder in a GitHub repository.
2. In Netlify, choose **Add new site → Import an existing project** and select the repository.
3. Netlify will read `netlify.toml`; the build command is `npm run build` and the publish directory is `dist/client`.
4. Deploy the site. Open its URL to create your first gallery.

### With the Netlify CLI

```bash
npm install
npm run build
npx netlify deploy --prod --dir=dist/client
```

## Embed in Notion

For a gallery that works everywhere, add photos using public image URLs, choose **Copy link**, then paste that link into Notion and select **Create embed**. Resize the embed to taste; a wide 16:9 block works best on desktop.

## When a backend is needed

Use a backend or managed database/storage when uploaded photos must work on other devices, galleries need to be shared or edited by multiple people, users need accounts, or data must survive browser clearing. A production upgrade can store gallery metadata by gallery ID in Supabase/Firebase and image files in object storage. Add authentication and row-level access rules so each owner can only update their own gallery. The viewer can remain the same and fetch only the gallery requested in its URL.

## Local development

```bash
npm install
npm run dev
```

Open the local address printed by the development server.
