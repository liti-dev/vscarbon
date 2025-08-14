# VSCarbon

Encourage low-carbon coding habits with real-time electricity grid data! VSCarbon shows you when the electricity grid has lower carbon intensity, helping you time energy-intensive tasks.

**Make your coding greener, one commit at a time! 🌱**

<img src="https://github.com/user-attachments/assets/c4433f56-9278-47ea-a6e1-d1e1cc27ae9a" width="500"/>
<img src="https://github.com/user-attachments/assets/c0192d58-6444-4963-9a8c-97d109ec3518" width="500"/>

## Features

✅ **Real-time Carbon Intensity**: Status bar displays current carbon intensity from the UK electricity grid  
✅ **Location-based Data**: Enter your UK postcode for regional carbon intensity data  
✅ **Visual Indicators**: Emoji changes based on carbon levels (😸 for low, 😿 for high)  
✅ **Electricity Mix Breakdown**: Click status bar to see detailed grid composition  
🔄 **Auto-refresh**: Updates every 30 minutes to keep data current  

## Installation

### Option 1: Install from .vsix (Try it now!)
1. Download the latest `vscarbon-0.1.0.vsix` from [Releases](https://github.com/liti-dev/vscarbon/releases)
2. In VS Code: Go to Extension -> More actions -> Install from VSIX, or `Ctrl+Shift+P` → "Extensions: Install from VSIX..."
3. Select the downloaded .vsix file

### Option 2: VS Code Marketplace (Coming soon!)


## Getting Started

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run `VSCarbon: Set Postcode` and enter your UK outward postcode (e.g., "SW1A", "M1", "AL10")
3. Run `VSCarbon: Show Carbon` to start monitoring
4. Check the status bar for current carbon intensity, click on it for dashboard showing electricity mix and sustainable commit stats

## Commands

- `VSCarbon: Show Carbon` - Start monitoring carbon intensity
- `VSCarbon: Set Postcode` - Configure your UK postcode for regional carbon intensity data
- `VSCarbon: Reset Commit Stats` - Clear sustainable commit history

## Requirements

- Internet connection for fetching live grid data
- UK postcode for regional carbon intensity data

## Known Issues

- Currently supports UK postcodes only
- Requires internet connection for real-time data

## Release Notes

### 0.1.0

Initial release of VSCarbon:
- Real-time UK carbon intensity monitoring
- Postcode-based regional data
- Interactive electricity mix visualisation
- Status bar integration with emoji indicators

## Data Source

Carbon intensity data provided by [Carbon Intensity API](https://carbonintensity.org.uk/) - official data from National Grid ESO.

## Development

### Building from Source
```bash
npm install
npm run compile
npx @vscode/vsce package
```

### Testing
```bash
npm test
```

## Contributing

This project was created as part of [Branch magazine](https://branch.climateaction.tech/issues/issue-9/everyday-green-coding-bringing-nature-and-grid-awareness-to-visual-studio-code/)'s exploration of everyday green coding practices. Contributions welcome!
