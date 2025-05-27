import * as vscode from "vscode"
import getCarbonIntensity from "./services/carbonIntensity"

let carbonStatusBarItem: vscode.StatusBarItem

export function activate(context: vscode.ExtensionContext) {
  // Create status bar
  console.log('Congratulations, your extension "vscarbon" is now active!')
  carbonStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  carbonStatusBarItem.command = "extension.showCarbon"
  context.subscriptions.push(carbonStatusBarItem)

  // Update data every 30'
  updateCarbonIntensity()
  setInterval(updateCarbonIntensity, 30 * 60 * 1000)

  // Commands
  // context.subscriptions.push(
  //   vscode.commands.registerCommand("vscarbon.showCarbon", () => {
  //     // vscode.window.showInformationMessage(
  //     //   `Current carbon intensity: ${carbonStatusBarItem.tooltip}`
  //     // )
  //   })
  // )
}
async function updateCarbonIntensity() {
  // hardcode for now
  const data = await getCarbonIntensity("al10")
  console.log("carbon intensity", data?.intensity)
  if (!data) {
    carbonStatusBarItem.text = "⚡Carbon: Unknown"
    return
  }

  // Set icon based on intensity index
  // Icon list: 🌱 🌻 🍃 🌧️ 🌞 💚 🦥
  let icon = "⚡"
  if (data?.index === "low") {
    icon = "😸"
  } else if (data?.index === "moderate" || data?.index === "high") {
    icon = "😿"
  }

  carbonStatusBarItem.text = `${icon} Carbon intensity: ${data?.intensity}gCO₂/kWh`
  // carbonStatusBarItem.tooltip = `Carbon intensity: ${data?.intensity}gCO₂/kWh (${data?.index}) in ${data?.region}`
  carbonStatusBarItem.show()
}
