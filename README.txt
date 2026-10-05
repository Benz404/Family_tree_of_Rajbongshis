HERITAGE TREE - deploy steps (Netlify)

1. Put this folder in a GitHub repository (drag-and-drop deploy will NOT run the server function).
2. On Netlify: Add new site > Import from Git > pick the repo. Build settings are read from netlify.toml.
3. Site settings > Environment variables > add ADMIN_PASSWORD = (your own strong password). Redeploy.
4. Display page:  https://YOUR-SITE.netlify.app/
   Admin page:    https://YOUR-SITE.netlify.app/admin.html

The password is checked on the server, never stored in the page code.
Until you save once in admin, the display page shows the starter family map.
