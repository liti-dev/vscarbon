# VSCarbon

Encourage low-carbon coding habits with real-time electricity grid data! VSCarbon shows you when the electricity grid has lower carbon intensity, helping you time energy-intensive tasks.

**Make your coding greener, one commit at a time! 🌱**

<img src="https://github.com/user-attachments/assets/c4433f56-9278-47ea-a6e1-d1e1cc27ae9a" width="500"/>
<img src="https://github.com/user-attachments/assets/f09854c4-0b44-418e-b2e3-2274adc4e0d7" width="500"/>

## Features

✅ **Real-time Carbon Intensity**: Status bar displays current carbon intensity from the UK electricity grid  
✅ **Location-based Data**: Enter your UK outward postcode or [country code for users outside UK](https://portal.electricitymaps.com/developer-hub/api/getting-started#geographical-coverage) for local carbon intensity data  
✅ **Visual Indicators**: Emoji changes based on carbon levels (😸 for low, 😿 for high)  
✅ **Commit Tracker**: Track sustainable git commits locally  
✅ **Dashboard**: Click status bar to see detailed grid mix and commit stats  
🔄 **Auto-refresh**: Updates every 30 minutes to keep data current

## Installation

### Option 1: Install from .vsix (Try it now!)

1. Download the latest version from [Releases](https://github.com/liti-dev/vscarbon/releases)
2. In VS Code: Go to Extension -> More actions -> Install from VSIX, or `Ctrl+Shift+P` → "Extensions: Install from VSIX..."
3. Select the downloaded .vsix file

### Option 2: VS Code Marketplace (Coming soon!)

## Getting Started
### For UK users
1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run `VSCarbon: Set Postcode/Country Code` and enter your UK OUTWARD postcode (e.g., SW1A, M1, AL10)
3. Run `VSCarbon: Show Carbon` to start monitoring
4. Check the status bar for current carbon intensity, click on it for dashboard showing electricity mix and sustainable commit stats
### For users outside UK
1. Register your [Electricity Maps API key](https://portal.electricitymaps.com/auth/login). Free tier allows only 1 country so please choose carefully
2. Run `VSCarbon: Configure API Key` command to input your key
3. Run `VSCarbon: Set Postcode/Country Code` and enter country code (e.g., AT, DE, ES)
3. Run `VSCarbon: Show Carbon` to start monitoring
4. Check the status bar for current carbon intensity, click on it for dashboard showing electricity mix and sustainable commit stats

## Commands

- `VSCarbon: Configure API Key` - Input Electricity Maps API key for users outside UK
- `VSCarbon: Set Postcode/Country Code` - Configure your location
- `VSCarbon: Show Carbon` - Start monitoring carbon intensity
- `VSCarbon: Reset Commit Stats` - Clear commit stats

## Known Issues

- Currently supports UK regional data and country-level data for the other countries
- Requires internet connection for updating data

## Data Source

- UK data is provided by [Carbon Intensity API](https://carbonintensity.org.uk/) - National Grid ESO
- [Electricity Maps](https://portal.electricitymaps.com/developer-hub/api/getting-started#geographical-coverage) for the other countries

## Changelog

### v1.0.0
- Expanded country coverage beyond the UK (country list [here](https://portal.electricitymaps.com/developer-hub/api/getting-started#geographical-coverage)) thanks to Electricity Maps API

### v0.2.1 (Bug Fix)
- 🐛 **Fixed commit tracking accuracy**: Commit tracker now only counts actual `git commit` commands, not file changes or staging
- 🔧 **Improved detection method**: Switched from VS Code Git API monitoring to Git log file watching for more reliable commit detection
- ✨ **Enhanced test function**: Better error messages and validation in commit tracking test

### v0.2.0
- ✨ Added commit tracking functionality
- 📊 Commit statistics dashboard
- 🌱 Sustainable commit notifications


## Contributing

This project was created as part of [Branch magazine](https://branch.climateaction.tech/issues/issue-9/everyday-green-coding-bringing-nature-and-grid-awareness-to-visual-studio-code/)'s exploration of everyday green coding practices.

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started, development setup, and contribution guidelines.
