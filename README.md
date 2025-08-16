# VSCarbon

Encourage low-carbon coding habits with real-time electricity grid data! VSCarbon shows you when the electricity grid has lower carbon intensity, helping you time energy-intensive tasks.

**Make your coding greener, one commit at a time! 🌱**

<img src="https://github.com/user-attachments/assets/c4433f56-9278-47ea-a6e1-d1e1cc27ae9a" width="500"/>
<img src="https://github.com/user-attachments/assets/c0192d58-6444-4963-9a8c-97d109ec3518" width="500"/>

## Features

✅ **Real-time Carbon Intensity**: Status bar displays current carbon intensity from the UK electricity grid  
✅ **Location-based Data**: Enter your UK postcode for regional carbon intensity data  
✅ **Visual Indicators**: Emoji changes based on carbon levels (😸 for low, 😿 for high)  
✅ **Commit Tracker**: Count sustainable git commits  
✅ **Dashboard**: Click status bar to see detailed grid mix and commit stats  
🔄 **Auto-refresh**: Updates every 30 minutes to keep data current  

## Installation

### Option 1: Install from .vsix (Try it now!)
1. Download the latest version from [Releases](https://github.com/liti-dev/vscarbon/releases)
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
- `VSCarbon: Reset Commit Stats` - Clear commit stats

## Requirements

- Internet connection for fetching live grid data
- UK postcode for regional carbon intensity data

## Known Issues

- Currently supports UK postcodes only
- Requires internet connection for updating data


## Data Source

Carbon intensity data provided by [Carbon Intensity API](https://carbonintensity.org.uk/) - official data from National Grid ESO.

## Contributing

This project was created as part of [Branch magazine](https://branch.climateaction.tech/issues/issue-9/everyday-green-coding-bringing-nature-and-grid-awareness-to-visual-studio-code/)'s exploration of everyday green coding practices. 

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started, development setup, and contribution guidelines.
