# General Rules

- **No Hardcoded Data**: Never use hardcoded placeholders or mock data in the UI (e.g., hardcoded stock numbers, hardcoded names). Always ensure data is dynamically fetched from the database/backend and handle missing states gracefully. If a module is not yet implemented, you may use placeholders, but you MUST implement dynamic endpoints and replace the placeholders IMMEDIATELY as soon as the respective backend capability becomes available.

# cPanel Deployment Rules
- **NEVER** overwrite the live index.php, .htaccess, or .env files when deploying to cPanel.
- The user relies on customized cPanel routing in public/index.php and public/.htaccess. Overwriting them will cause instant 500 Internal Server Errors.
- Always use sync with exclusions or explicitly verify paths when suggesting manual file copies for deployment.

