import * as vscode from "vscode"
import getCarbonIntensity from "./services/carbonIntensity"

let carbonStatusBarItem: vscode.StatusBarItem
let latestCarbonData: any = null
let extensionContext: vscode.ExtensionContext

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context
  vscode.window.showInformationMessage(`VSCarbon is active`)
  carbonStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)

  // clicking on status item will show grid composition details
  carbonStatusBarItem.command = "vscarbon.showGridDetails"
  context.subscriptions.push(carbonStatusBarItem)
  
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("vscarbon.showGridDetails", showGridDetails),
    vscode.commands.registerCommand("vscarbon.showCarbon", showCarbon),
    vscode.commands.registerCommand("vscarbon.setPostcode", setPostcode)
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
  console.log("lastest data", latestCarbonData)

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

function showGridDetails() {
  if (!latestCarbonData) {
    vscode.window.showWarningMessage('No carbon data available. Please set your postcode first using the "VSCarbon: Set Postcode" command.')
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
  console.log("mix", gridMix)
  const panel = vscode.window.createWebviewPanel(
    "electricityMix",
    "Electricity Mix",
    vscode.ViewColumn.One,
    { enableScripts: true }
  )
  panel.webview.html = `<html>
  <head>
    <meta http-equiv="Content-Security-Policy">
    <style>
      #pieChart {
        width: 400px;
        height: 400px;
        display: block;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <h1>Electricity Mix</h1>
    <h2>Carbon intensity in ${latestCarbonData.region}: ${latestCarbonData.intensity} gCO₂/kWh</h2>
    <canvas id="pieChart" width="400" height="400"></canvas>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const ctx = document.getElementById('pieChart').getContext('2d');
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ${JSON.stringify(gridMix.labels)},
            datasets: [{
              data: ${JSON.stringify(gridMix.values)},
              backgroundColor: [
                '#4caf50', '#607d8b', '#8bc34a', '#f44336', '#9c27b0',
                '#ff9800', '#00bcd4', '#ffeb3b', '#e91e63', 
              ]
            }]
          },
          options: {
    plugins: {
      legend: {
        labels: {
          color: "#9c27b0" 
        }
      },
      tooltip: {
        bodyColor: "#9c27b0" 
      }
    }
  }

        });
      });
    </script>
  </body>
</html>`
}
