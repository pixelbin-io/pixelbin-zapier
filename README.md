# PixelBin.io Zapier Integration

## This is what this integration does:

### A. Allows user to use following PixelBin.io events as trigger events in zapier through webhook

1. Uploading new Files.
2. Deleting the files.
3. Creating the folder.
4. Deleting the folder.

Above triggers are written inside `triggers` folder

### B. Allows user to perform following PixelBin.io actions as zapier actions

1. Tranform Images.
2. Upload Images.
3. Create usage report.

This actions are written inside `creates` folder

## How to test the integration

### A. Testing Locally:

```bash
Validate code

zapier validate
```

```bash
Run tests

zapier test
```

### B. Testing on Zapier.com

Go on https://Zapier.com and create new zap with PixelBin.io to see changes.
