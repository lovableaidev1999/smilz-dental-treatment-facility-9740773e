

## Fix Favicon for smilz.net

**Problem**: The `index.html` has no `<link rel="icon">` tag, so browsers fall back to requesting `/favicon.ico` which may not exist or may be stale.

**Solution**: Use the uploaded logo image as the favicon.

### Steps

1. **Copy the uploaded logo** to `public/favicon.png`
2. **Delete the existing `public/favicon.ico`** (browsers auto-request `/favicon.ico` and it would override the new one)
3. **Add favicon link tag** to `index.html` `<head>`:
   ```html
   <link rel="icon" href="/favicon.png" type="image/png" />
   ```

This will add one line to `index.html` and replace the favicon file. No visual or layout changes.

