import * as vscode from "vscode"
import { getCarbonIntensity, isLocationSupported } from "./services/carbonIntensity"
import { LocationType, CarbonData } from "./types/carbonData"
import { initCommitTracker, setupGitCommitListener, updateCarbonData, getCommitStats, resetCommitHistory, testCommitTracking } from "./utils/commitTracker"
import { getDashboardHtml } from "./utils/webviewUtils"
import { getCountryName } from "./utils/countryMapping"

let carbonStatusBarItem: vscode.StatusBarItem
let latestCarbonData: CarbonData | null = null
let extensionContext: vscode.ExtensionContext

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context
  
  // Create status bar item
  carbonStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  carbonStatusBarItem.command = "vscarbon.showDashboard"
  context.subscriptions.push(carbonStatusBarItem)
  
  // Initialize carbon data on activation
  updateCarbonIntensity()
  
  // Initialize commit tracking
  initCommitTracker(context, latestCarbonData)
  setupGitCommitListener()
  
  // Register commands
  const commands = [
    vscode.commands.registerCommand("vscarbon.showCarbon", showCarbon),
    vscode.commands.registerCommand("vscarbon.showDashboard", showDashboard),
    vscode.commands.registerCommand("vscarbon.setPostcode", setPostcode),
    vscode.commands.registerCommand("vscarbon.configureApiKey", configureApiKey),
    vscode.commands.registerCommand("vscarbon.testCommitTracking", testCommitTracking),
    vscode.commands.registerCommand("vscarbon.resetCommitStats", resetCommitStats)
  ]
  
  context.subscriptions.push(...commands)
  
  vscode.window.showInformationMessage("VSCarbon is now active! 🌱")
}

async function updateCarbonIntensity() {
  const location = await getStoredLocation()
  if (!location) {
    carbonStatusBarItem.text = "⚡Carbon: Click to set location"
    carbonStatusBarItem.command = "vscarbon.setPostcode"
    carbonStatusBarItem.show()
    return
  }
  
  try {
    const config = vscode.workspace.getConfiguration('vscarbon')
    const apiKey = config.get<string>('electricityMapsApiKey')
    
    const result = await getCarbonIntensity(location, apiKey)
    
    if (result.error) {
      throw new Error(result.error.message)
    }
    
    if (!result.data) {
      throw new Error('No carbon data available')
    }
    
    // Store for dashboard and commit tracking
    latestCarbonData = result.data
    updateCarbonData(latestCarbonData)

    // Set icon based on intensity index
    let icon = "⚡"
    if (result.data.index === "low" || result.data.index === "very low") {
      icon = "😸"
    } else if (result.data.index === "moderate" || result.data.index === "high") {
      icon = "😿"
    }

    carbonStatusBarItem.text = `${icon} ${result.data.intensity} gCO₂/kWh`
    carbonStatusBarItem.command = "vscarbon.showDashboard"
    carbonStatusBarItem.show()
  } catch (error) {
    console.error('Carbon intensity error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    vscode.window.showErrorMessage(`VSCarbon: ${errorMessage}`)
    carbonStatusBarItem.text = "⚡Carbon: Error"
    carbonStatusBarItem.show()
  }
}

async function getStoredLocation(): Promise<string | undefined> {
  // Get location from storage (supports both UK postcodes and EU/global country codes)
  return extensionContext.globalState.get<string>('postcode')
}

function detectLocationType(location: string): LocationType {
  // UK postcode pattern
  if (/^[A-Z]{1,2}[0-9]{1,2}[A-Z]?$/i.test(location.trim())) {
    return LocationType.UK_POSTCODE
  }
  // Country code pattern
  if (/^[A-Za-z]{2}$/.test(location.trim())) {
    return LocationType.COUNTRY_CODE
  }
  return LocationType.UNKNOWN
}

async function setPostcode() {
  const location = await vscode.window.showInputBox({
    prompt: 'Enter your UK postcode (e.g., AL10, SW1A, M1) or country code (e.g., DE, FR, ES)',
    placeHolder: 'AL10 or DE',
    validateInput: (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'Please enter a valid location'
      }
      
      const cleanValue = value.trim()
      if (!isLocationSupported(cleanValue)) {
        return 'Please enter a valid UK postcode (e.g., AL10, SW1A, M1) or country code (e.g., DE, FR, ES)'
      }
      
      return null
    }
  })

  if (!location) {
    return // User cancelled
  }

  const cleanLocation = location.trim()
  const locationType = detectLocationType(cleanLocation)
  
  // Check if country code but no API key configured
  if (locationType === LocationType.COUNTRY_CODE) {
    const config = vscode.workspace.getConfiguration('vscarbon')
    const apiKey = config.get<string>('electricityMapsApiKey')
    
    if (!apiKey || apiKey.trim().length === 0) {
      const choice = await vscode.window.showInformationMessage(
        `To get carbon data for ${getCountryName(cleanLocation)}, you need a free Electricity Maps API key.`,
        'Get API Key & Configure',
        'Cancel'
      )
      
      if (choice === 'Get API Key & Configure') {
        await configureApiKey()
        
        // Check if API key was actually configured
        const updatedConfig = vscode.workspace.getConfiguration('vscarbon')
        const updatedApiKey = updatedConfig.get<string>('electricityMapsApiKey')
        if (!updatedApiKey || updatedApiKey.trim().length === 0) {
          vscode.window.showWarningMessage('API key not configured. Please try setting your location again.')
          return
        }
      } else {
        return // User cancelled
      }
    }
  }
  
  // Save the location
  await extensionContext.globalState.update('postcode', cleanLocation)
  
  if (locationType === LocationType.UK_POSTCODE) {
    vscode.window.showInformationMessage(`UK postcode set to: ${cleanLocation.toUpperCase()}`)
  } else if (locationType === LocationType.COUNTRY_CODE) {
    const countryName = getCountryName(cleanLocation)
    vscode.window.showInformationMessage(`Country set to: ${countryName} (${cleanLocation.toUpperCase()})`)
  }
  
  updateCarbonIntensity()
}

function showCarbon() {
  updateCarbonIntensity()
  setInterval(updateCarbonIntensity, 30 * 60 * 1000)
}

async function showDashboard() {
  if (!latestCarbonData) {
    const choice = await vscode.window.showWarningMessage(
      'No carbon data available. Set your location first.',
      'Set Location'
    )
    
    if (choice === 'Set Location') {
      await setPostcode()
    }
    return
  }

  const gridMix = latestCarbonData.mix?.reduce(
    (acc: { labels: string[], values: number[] }, item) => {
      acc.labels.push(item.fuel)
      acc.values.push(item.perc)
      return acc
    },
    { labels: [], values: [] }
  ) || { labels: [], values: [] }
  
  // Get commit stats for the dashboard
  const stats = await getCommitStats()
  const sustainabilityRate = stats.totalCommits > 0 
    ? Math.round((stats.sustainableCommits / stats.totalCommits) * 100) 
    : 0

  const panel = vscode.window.createWebviewPanel(
    "dashboard",
    "VSCarbon Dashboard",
    vscode.ViewColumn.One,
    { 
      enableScripts: true,
      retainContextWhenHidden: true
    }
  )

  panel.webview.html = getDashboardHtml(extensionContext, {
    carbonData: latestCarbonData,
    gridMix,
    stats: { ...stats, sustainabilityRate }
  })
}
async function configureApiKey() {
  const config = vscode.workspace.getConfiguration('vscarbon')
  const currentApiKey = config.get<string>('electricityMapsApiKey') || ''
  
  // Show information about getting an API key if none is configured
  if (!currentApiKey) {
    const choice = await vscode.window.showInformationMessage(
      'For countries outside UK, you need a free Electricity Maps API key. Get yours at electricitymaps.com (free tier allows 1 country).',
      'Open Website & Enter Key',
      'I Already Have a Key',
      'Cancel'
    )
    
    if (choice === 'Open Website & Enter Key') {
      vscode.env.openExternal(vscode.Uri.parse('https://portal.electricitymaps.com/auth/login'))      
    } else if (choice === 'I Already Have a Key') {
      // Continue to input
    } else {
      return // User cancelled
    }
  }
  
  const apiKey = await vscode.window.showInputBox({
    prompt: 'Paste your Electricity Maps API key here (free at electricitymaps.com)',
    placeHolder: 'your-api-key-here',
    value: currentApiKey,
    password: true, // hide API key
    validateInput: (value: string) => {
      if (value && value.trim().length < 10) {
        return 'API key seems too short. Please check your Electricity Maps API key.'
      }
      return null
    }
  })

  if (apiKey !== undefined) { // User didn't cancel
    await config.update('electricityMapsApiKey', apiKey.trim(), vscode.ConfigurationTarget.Global)
    
    if (apiKey.trim()) {
      vscode.window.showInformationMessage('✅ Electricity Maps API key configured! You can now use country codes. Note: Free tier allows 1 country only.')
    } else {
      vscode.window.showInformationMessage('Electricity Maps API key cleared. Only UK postcodes will be available.')
    }
  }
}

async function resetCommitStats() {
  const choice = await vscode.window.showWarningMessage(
    'Are you sure you want to reset all commit statistics?',
    'Yes, Reset',
    'Cancel'
  )
  
  if (choice === 'Yes, Reset') {
    await resetCommitHistory()
    vscode.window.showInformationMessage('Commit statistics have been reset.')
  }
}

export function deactivate() {
  // Clean up resources
  if (carbonStatusBarItem) {
    carbonStatusBarItem.dispose()
  }
}