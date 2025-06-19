import * as vscode from "vscode"
import getCarbonIntensity from "./services/carbonIntensity"

let carbonStatusBarItem: vscode.StatusBarItem
let latestCarbonData: any = null

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage(`VSCarbon is active`)
  carbonStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)

  // clicking on status item will show grid composition details
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
  if (!data) {
    carbonStatusBarItem.text = "⚡Carbon: Unknown"
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

function showCarbon() {
  updateCarbonIntensity()
  setInterval(updateCarbonIntensity, 30 * 60 * 1000)
}

function showGridDetails() {
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
