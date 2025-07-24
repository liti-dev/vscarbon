# Change Log

All notable changes to the "VSCarbon" extension will be documented in this file.

## [0.1.0] - 2025-07-24

### Added
- Initial release of VSCarbon extension
- Real-time carbon intensity monitoring for UK electricity grid
- Status bar integration with emoji indicators (😸 for low carbon, 😿 for high carbon)
- Postcode-based regional carbon intensity data
- Interactive electricity mix visualisation with pie charts
- Commands for setting postcode and viewing grid details
- Auto-refresh every 30 minutes
- Configuration options for auto-start and update intervals

### Features
- `VSCarbon: Show Carbon` - Start monitoring carbon intensity
- `VSCarbon: Set Postcode` - Configure UK postcode for regional data
- `VSCarbon: Show Grid Details` - View detailed electricity mix breakdown
- Status bar shows current carbon intensity in gCO₂/kWh
- Click status bar to see electricity generation mix
- Persistent postcode storage across VS Code sessions

### Technical
- Uses Carbon Intensity API from National Grid ESO
- Basic test suite for core functionality