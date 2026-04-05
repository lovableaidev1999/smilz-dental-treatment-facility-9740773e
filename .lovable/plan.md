

## Adding Ahrefs Web Analytics

The screenshot shows an Ahrefs analytics verification snippet that needs to be placed in the `<head>` of your site.

### Approach

Add the Ahrefs script tag directly to `index.html` in the `<head>` section. This is the simplest and most reliable method — no React changes needed.

### What changes

**`index.html`** — Add one line before the closing `</head>` tag:

```html
<script src="https://analytics.ahrefs.com/analytics.js" data-key="VHgy6LHj/y0/d6Ullyzd/g" async></script>
```

This loads asynchronously so it won't affect page speed. Once deployed, go back to Ahrefs and click "Recheck installation" to verify.

