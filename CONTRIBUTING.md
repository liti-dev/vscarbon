# Contributing to VSCarbon 🌱

Thank you for your interest in contributing to VSCarbon! We're excited to work together to make coding more environmentally conscious.

## Areas for Contribution 

- **Multi-region support**: Expand beyond UK
- **Accessibility**: Improve screen reader support
- **Performance**: Optimise API calls and data caching
- **Testing**: Increase test coverage
- **UI/UX improvements**: Better dashboard design
- **Documentation**: Guides, case studies

## How to Contribute

### Reporting Issues
- Use GitHub Issues to report bugs or suggest features
- If that's a bug, include VS Code version, operating system, and steps to reproduce
- Check existing issues first to avoid duplicates

### Code Contributions

#### Prerequisites
- Node.js (v16 or higher)
- VS Code (only needed for testing the extension)
- Git

#### Development Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/vscarbon.git
   cd vscarbon
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start developing


**Testing your changes (requires VS Code or VS Code-based editors):**
1. Open project in VS Code: `code .`
2. Press `F5` to launch Extension Development Host
3. Test your changes in the new VS Code window
4. Use Command Palette (`Ctrl+Shift+P`) to run VSCarbon commands

#### Pull Request Process
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Add tests for new functionality
3. Update documentation if needed
4. Commit with descriptive messages
5. Push to your fork and create a pull request

#### Commit Messages
Use clear, descriptive commit messages, for example:
```
feat: add support for European carbon intensity data
fix: resolve status bar update timing issue
docs: update installation instructions
```


## Project Structure

```
src/
├── extension.ts          # Main extension entry point
├── services/            # Core services (API, storage, etc.)
├── utils/               # Utility functions
└── test/                # Test files

webview/                 # Dashboard HTML/CSS/JS
```

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

### Sustainability Focus
When contributing, consider:
- Minimal network requests
- Lightweight dependencies
- Sustainable design

## Recognition

Contributors will be:
- Listed in our README
- Mentioned in release notes

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---
