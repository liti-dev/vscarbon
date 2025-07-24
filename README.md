# VSCarbon
This project is part of the submission for [Branch magazine](https://branch.climateaction.tech/)'s issue 9. The goal is to explore how developers can be more mindful of their digital footprint, starting with their everyday tools: code editors (like VSCode) and GitHub. Coding-related activities consume energy.

Why not doing these energy-intensive tasks during low carbon periods (when the grid's carbon intensity is low)?

<img src="https://github.com/user-attachments/assets/c4433f56-9278-47ea-a6e1-d1e1cc27ae9a" width="500"/>
<img src="https://github.com/user-attachments/assets/c0192d58-6444-4963-9a8c-97d109ec3518" width="500"/>




## Features

- [x] Status bar shows carbon intensity from electricity grid based on location (currently only works for UK postcodes)
- [x] User can input postcode (currently only UK postcode is valid)
- [x] Animal emoji changes according to carbon level
- [x] Clicking status bar shows a breakdown of electricity mix

## How to run
The extension hasn't been published yet. If you like to try it out:
- Step 1: Clone the repo
- Step 2: Manually change postcode in func updateCarbonIntensity, file extension.ts
- Step 3: Press F5 or Fn + F5 to enter Testing mode
- Step 4: Enter command mode (Ctr+Shift+P), choose command Show Carbon
  
## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
