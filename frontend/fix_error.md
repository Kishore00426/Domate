# Fixing PostCSS / Tailwind CSS Errors

Since this project uses the new **Tailwind CSS v4**, "PostCSS" errors usually happen if:
1.  **Node.js is too old.**
2.  **There is a conflicting `postcss.config.js` file.**
3.  **Dependencies are mismatched.**

Ask your friend to try these steps in order:

## 1. Check Node.js Version
Tailwind v4 requires a modern Node version (v18 or higher is recommended).
run:
```bash
node -v
```
If it is generic (like v14 or v16), **install the latest Node.js LTS** from [nodejs.org](https://nodejs.org/).

## 2. Remove `postcss.config.js`
This project uses `@tailwindcss/vite` which **does not need** a PostCSS config.
If your friend accidentally created one (e.g., by running `npx tailwindcss init`), it will cause conflicts.
**Delete `postcss.config.js`** if it exists in the `frontend` folder.

## 3. Clean Re-install
Sometimes dependencies get mixed up. Run these commands to fix it:

```bash
# Delete existing modules/locks
rm -rf node_modules package-lock.json

# Re-install
npm install

# Start server
npm run dev
```

## 4. Check `package.json`
Ensure their `package.json` looks like this (dependencies section):
```json
"dependencies": {
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "tailwindcss": "^4.0.0", 
  "@tailwindcss/vite": "^4.0.0"
}
```
*(Exact versions might vary slightly, but they should be v4 for tailwind)*
