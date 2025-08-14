import * as vscode from "vscode"
import getCarbonIntensity from "./services/carbonIntensity"
import { initCommitTracker, setupGitCommitListener, updateCarbonData, getCommitStats, resetCommitHistory, testCommitTracking } from "./utils/commitTracker"
import { getDashboardHtml } from "./utils/webviewUtils"

let carbonStatusBarItem: vscode.StatusBarItem
let latestCarbonData: any = null
let extensionContext: vscode.ExtensionContext

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context
  vscode.window.showInformationMessage(`VSCarbon is active`)
  carbonStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)

  // show dashboard when clicking on status bar
  carbonStatusBarItem.command = "vscarbon.showDashboard"
  context.subscriptions.push(carbonStatusBarItem)
  
  initCommitTracker(context, latestCarbonData)
  setupGitCommitListener()
  
  // register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("vscarbon.showCarbon", showCarbon),
    vscode.commands.registerCommand("vscarbon.showDashboard", showDashboard),
    vscode.commands.registerCommand("vscarbon.setPostcode", setPostcode),
    vscode.commands.registerCommand("vscarbon.testCommitTracking", testCommitTracking),
    vscode.commands.registerCommand("vscarbon.resetCommitStats", resetCommitStats)
  )  
}

async function updateCarbonIntensity() {
  const postcode = await getPostcode()
  if (!postcode) {
    carbonStatusBarItem.text = "⚡Carbon: Set postcode"
    carbonStatusBarItem.show()
    return
  }
  
  const data = await getCarbonIntensity(postcode)
  if (!data) {
    carbonStatusBarItem.text = "⚡Carbon: Unknown"
    carbonStatusBarItem.show()
    return
  }
  latestCarbonData = data
  
  // sync commit tracker with new carbon data
  updateCarbonData(latestCarbonData)

  // Set icon based on intensity index
  // Icon list: 🌱 🌻 🍃 🌧️ 🌞 💚 🦥
  let icon = "⚡"
  if (latestCarbonData?.index === "low" || latestCarbonData?.index === "very low") {
    icon = "😸"
  } else if (latestCarbonData?.index === "moderate" || latestCarbonData?.index === "high") {
    icon = "😿"
  }

  carbonStatusBarItem.text = `${icon} ${latestCarbonData?.intensity} gCO₂/kWh`
  carbonStatusBarItem.show()
}

async function getPostcode(): Promise<string | undefined> {
  return extensionContext.globalState.get<string>('postcode')
}

async function setPostcode() {
  const postcode = await vscode.window.showInputBox({
    prompt: 'Enter your regional postcode (e.g., AL10, SW1A, M1)',
    placeHolder: 'AL10',
    validateInput: (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'Please enter a valid regional postcode'
      }
      // UK regional postcode validation (outward code only)
      // Format: 1-2 letters + 1-2 digits + optional letter
      const regionalPostcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?$/i
      if (!regionalPostcodeRegex.test(value.trim())) {
        return 'Please enter a valid UK regional postcode (e.g., AL10, SW1A, M1, B33)'
      }
      return null
    }
  })

  if (postcode) {
    await extensionContext.globalState.update('postcode', postcode.trim().toLowerCase())
    vscode.window.showInformationMessage(`Postcode set to: ${postcode.trim().toUpperCase()}`)
    updateCarbonIntensity()
  }
}

function showCarbon() {
  updateCarbonIntensity()
  setInterval(updateCarbonIntensity, 30 * 60 * 1000)
}

async function showDashboard() {
  if (!latestCarbonData) {
    vscode.window.showWarningMessage('No carbon data available. Set your postcode first using "VSCarbon: Set Postcode" command.')
    return
  }

  const gridMix = latestCarbonData?.mix.reduce(
    (acc: any, item: any) => {
      acc.labels.push(item.fuel)
      acc.values.push(item.perc)
      return acc
    },
    { labels: [], values: [] }
  )
  
  // get commit stats for the dashboard
  const stats = await getCommitStats()
  stats.sustainabilityRate = stats.totalCommits > 0 
    ? Math.round((stats.sustainableCommits / stats.totalCommits) * 100) 
    : 0

  
  const panel = vscode.window.createWebviewPanel(
    "dashboard",
    "Dashboard",
    vscode.ViewColumn.One,
    { 
      enableScripts: true,
      retainContextWhenHidden: true
    }
  )


  panel.webview.html = getDashboardHtml(extensionContext, {
    carbonData: latestCarbonData,
    gridMix,
    stats
  })
}
async function resetCommitStats() {
  await resetCommitHistory()
}