import * as vscode from "vscode"
import getCarbonIntensity from "./services/carbonIntensity"

let carbonStatusBarItem: vscode.StatusBarItem
let latestCarbonData: any = null

export function activate(context: vscode.ExtensionContext) {
  // Create status bar
  vscode.window.showInformationMessage(`VSCarbon is active`)
  carbonStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  // /clicking on status item will show grid composition details
  carbonStatusBarItem.command = "vscarbon.showGridDetails"
  context.subscriptions.push(carbonStatusBarItem)

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("vscarbon.showGridDetails", showGridDetails),
    vscode.commands.registerCommand("vscarbon.showCarbon", showCarbon)
  )
}
async function updateCarbonIntensity() {
  // hardcode postcode for now
  const data = await getCarbonIntensity("al10")
  latestCarbonData = data
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

  carbonStatusBarItem.text = `${icon} Carbon intensity: ${data?.intensity}gCO₂/kWh in ${data.region}`
  carbonStatusBarItem.show()
}

function showCarbon() {
  updateCarbonIntensity()
  setInterval(updateCarbonIntensity, 30 * 60 * 1000)
}

function showGridDetails() {
  const panel = vscode.window.createWebviewPanel(
    "gridDetails",
    "Grid's details",
    vscode.ViewColumn.One,
    {}
  )
  panel.webview.html = `<html>
      <body>
        <h1>Grid's Details</h1>
        <p>pie charts or 24hr forecast</p>
        <p>${latestCarbonData?.intensity}</p>
      </body>
    </html>`
}
