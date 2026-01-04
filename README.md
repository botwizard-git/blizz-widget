# WWZ Widgets

A collection of embeddable chatbot widgets for WWZ

## Available Widgets

| Widget | Namespace | Description |
|--------|-----------|-------------|
| wwz-blizz | `WWZBlizz` | Inline embedded chatbot widget |
| wwz-ivy | `WWZIvy` | Floating bubble chatbot widget |

## Project Structure

```
blizz/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── scripts/
│   └── server-deploy.sh        # Server deployment script
├── nginx/
│   └── widgets.conf.example    # Nginx configuration template
├── widgets/
│   ├── wwz-blizz/              # Blizz widget
│   │   ├── wwz-blizz.js
│   │   ├── wwz-blizz.css
│   │   ├── test.html
│   │   └── js/
│   │       ├── wwz-blizz-config.js
│   │       ├── wwz-blizz-storage.js
│   │       ├── wwz-blizz-api.js
│   │       ├── wwz-blizz-state.js
│   │       ├── wwz-blizz-ui.js
│   │       ├── wwz-blizz-events.js
│   │       └── wwz-blizz-main.js
│   └── wwz-ivy/                # Ivy widget
│       ├── wwz-ivy.js
│       ├── wwz-ivy.css
│       ├── test.html
│       └── js/
│           ├── wwz-ivy-config.js
│           ├── wwz-ivy-storage.js
│           ├── wwz-ivy-api.js
│           ├── wwz-ivy-state.js
│           ├── wwz-ivy-ui.js
│           └── wwz-ivy-events.js
└── README.md
```

## Embedding Widgets

### wwz-blizz

```html
<div id="wwz-blizz-parent"></div>
<script src="https://blizz.botwizard.ch/wwz-blizz/wwz-blizz.js"></script>
```

**JavaScript API:**
```javascript
WWZBlizz.Main.collapse()       // Collapse widget
WWZBlizz.Main.expand()         // Expand widget
WWZBlizz.Main.startNewSession() // Start new conversation
WWZBlizz.Main.getVersionInfo()  // Get version info
```

### wwz-ivy

```html
<div id="wwz-ivy-parent"></div>
<script src="https://blizz.botwizard.ch/wwz-ivy/wwz-ivy.js"></script>
```

**JavaScript API:**
```javascript
WWZIvy.Main.collapse()         // Close widget
WWZIvy.Main.expand()           // Open widget
WWZIvy.Main.startNewSession()  // Start new conversation
WWZIvy.Main.sendMessage(text)  // Send message programmatically
WWZIvy.Main.getVersionInfo()   // Get version info
WWZIvy.Main.getState()         // Get current state
```

## Naming Conventions

| Component | Pattern | Example |
|-----------|---------|---------|
| Widget folder | `wwz-{widget}` | `wwz-blizz` |
| Main loader | `wwz-{widget}.js` | `wwz-blizz.js` |
| CSS file | `wwz-{widget}.css` | `wwz-blizz.css` |
| JS modules | `wwz-{widget}-{module}.js` | `wwz-blizz-config.js` |
| Global namespace | `WWZ{Widget}` | `WWZBlizz` |
| CSS class prefix | `wwz-{widget}-` | `.wwz-blizz-container` |
| Storage keys | `wwz_{widget}_` | `wwz_blizz_userId` |
| Container ID | `wwz-{widget}-parent` | `#wwz-blizz-parent` |

## Development

### Local Testing

1. Open the test.html file in each widget folder
2. Or serve locally with any static server

### Adding a New Widget

1. Create directory: `widgets/wwz-{widgetname}/`
2. Copy template from existing widget
3. Rename all files with `wwz-{widgetname}-` prefix
4. Update namespace to `WWZ{Widgetname}`
5. Update CSS prefix to `.wwz-{widgetname}-`
6. Update storage keys to `wwz_{widgetname}_`

## Deployment

### CI/CD Pipeline

On push to `main`, GitHub Actions will:
1. SSH into production server.
2. Pull latest code
3. Run deployment script
4. Reload nginx

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `PRODUCTION_SSH_KEY` | SSH private key for server access |
| `PRODUCTION_HOST` | Server IP or hostname |

### Server Setup

1. Clone repo to `/var/www/blizz-widgets/`
2. Copy nginx config:
   ```bash
   cp nginx/widgets.conf.example /etc/nginx/sites-available/blizz-widgets.conf
   ln -s /etc/nginx/sites-available/blizz-widgets.conf /etc/nginx/sites-enabled/
   ```
3. Set up SSL with certbot:
   ```bash
   certbot --nginx -d blizz.botwizard.ch
   ```
4. Test and reload nginx:
   ```bash
   nginx -t && systemctl reload nginx
   ```

## Widget URLs (Production)

- **wwz-blizz**: `https://blizz.botwizard.ch/wwz-blizz/wwz-blizz.js`
- **wwz-ivy**: `https://blizz.botwizard.ch/wwz-ivy/wwz-ivy.js`

- **wwz-blizz-testpage**: `https://blizz.botwizard.ch/wwz-blizz/test.html`
- **wwz-ivy-testpage**: `https://blizz.botwizard.ch/wwz-blizz/test.html`
