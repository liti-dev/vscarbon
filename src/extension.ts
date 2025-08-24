import * as vscode from "vscode"
import { getCarbonService } from "./services/carbonService"
import { LocationType } from "./types/carbonData"
import { initCommitTracker, setupGitCommitListener, updateCarbonData, getCommitStats, resetCommitHistory, testCommitTracking } from "./utils/commitTracker"
import { getDashboardHtml } from "./utils/webviewUtils"
import { getCountryName } from "./utils/countryMapping"

let carbonStatusBarItem: vscode.StatusBarItem
let latestCarbonData: any = null
let extensionContext: vscode.ExtensionContext
let carbonService: any = null

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context
  vscode.window.showInformationMessage(`VSCarbon is active`)
  carbonStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)

  // show dashboard when clicking on status bar
  carbonStatusBarItem.command = "vscarbon.showDashboard"
  context.subscriptions.push(carbonStatusBarItem)
  
  // init carbon service with API key from configuration
  initializeCarbonService()
  
  initCommitTracker(context, latestCarbonData)
  setupGitCommitListener()
  
  // register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("vscarbon.showCarbon", showCarbon),
    vscode.commands.registerCommand("vscarbon.showDashboard", showDashboard),
    vscode.commands.registerCommand("vscarbon.setPostcode", setPostcode),
    vscode.commands.registerCommand("vscarbon.configureApiKey", configureApiKey),
    vscode.commands.registerCommand("vscarbon.testCommitTracking", testCommitTracking),
    vscode.commands.registerCommand("vscarbon.resetCommitStats", resetCommitStats)
  )  
}

async function updateCarbonIntensity() {
  const postcode = await getPostcode()
  if (!postcode) {
    carbonStatusBarItem.text = "⚡Carbon: Click to set postcode"
    carbonStatusBarItem.command = "vscarbon.setPostcode"
    carbonStatusBarItem.show()
    return
  }
  
  // get carbon service and fetch data
  if (!carbonService) {
    initializeCarbonService()
  }
  const result = await carbonService.getCarbonIntensity(postcode)
  
  if (result.error) {
    console.error('Carbon intensity error:', result.error.message)
    vscode.window.showErrorMessage(`VSCarbon: ${result.error.message}`)
    carbonStatusBarItem.text = "⚡Carbon: Error"
    carbonStatusBarItem.show()
    return
  }
  
  if (!result.data) {
    carbonStatusBarItem.text = "⚡Carbon: Unknown"
    carbonStatusBarItem.show()
    return
  }
  
  // transform data for compatibility
  latestCarbonData = {
    intensity: result.data.intensity,
    index: result.data.index,
    mix: result.data.mix,
    region: result.data.region,
    timestamp: result.data.timestamp,
    source: result.data.source
  }
  
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
  carbonStatusBarItem.command = "vscarbon.showDashboard"
  carbonStatusBarItem.show()
}

async function getPostcode(): Promise<string | undefined> {
  // Get postcode from storage (supports both UK postcodes and EU/global country codes)
  return extensionContext.globalState.get<string>('postcode')
}

function initializeCarbonService() {
  const config = vscode.workspace.getConfiguration('vscarbon')
  const apiKey = config.get<string>('electricityMapsApiKey')
  console.log('Initializing carbon service with API key:', apiKey ? 'configured' : 'not configured')
  carbonService = getCarbonService(apiKey)
}

async function setPostcode() {
  if (!carbonService) {
    initializeCarbonService()
  }
  
  const postcode = await vscode.window.showInputBox({
    prompt: 'Enter your UK postcode (e.g., AL10, SW1A, M1) or country code (e.g., DE, FR, ES)',
    placeHolder: 'AL10 or DE',
    validateInput: (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'Please enter a valid postcode or country code'
      }
      
      const cleanValue = value.trim()
      const locationType = carbonService.detectLocationType(cleanValue)
      
      if (locationType === LocationType.UNKNOWN) {
        return 'Please enter a valid UK postcode (e.g., AL10, SW1A, M1) or country code (e.g., DE, FR, ES)'
      }
      
      return null
    }
  })

  if (!postcode) {
    return // User cancelled
  }

  const cleanPostcode = postcode.trim()
  const locationType = carbonService.detectLocationType(cleanPostcode)
  
  // if country code but no API key configured, guide them to set it up
  if (locationType === LocationType.COUNTRY_CODE && !carbonService.isEUFunctionalityAvailable()) {
    const choice = await vscode.window.showInformationMessage(
      `To get carbon data for ${getCountryName(cleanPostcode)}, you need a free Electricity Maps API key.`,
      'Get API Key & Configure',
      'Cancel'
    )
    
    if (choice === 'Get API Key & Configure') {
      await configureApiKey()
      // reinit service after API key setup
      initializeCarbonService()
      
      // check if API key was actually configured
      if (!carbonService.isEUFunctionalityAvailable()) {
        vscode.window.showWarningMessage('API key not configured. Please try setting your location again.')
        return
      }
    } else {
      return // User cancelled
    }
  }
  
  // save the postcode
  await extensionContext.globalState.update('postcode', cleanPostcode)
  
  if (locationType === LocationType.UK_POSTCODE) {
    vscode.window.showInformationMessage(`UK postcode set to: ${cleanPostcode.toUpperCase()}`)
  } else if (locationType === LocationType.COUNTRY_CODE) {
    const countryName = getCountryName(cleanPostcode)
    vscode.window.showInformationMessage(`Country set to: ${countryName} (${cleanPostcode.toUpperCase()})`)
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
      'No carbon data available. Set your postcode first.',
      'Set Postcode'
    )
    
    if (choice === 'Set Postcode') {
      await setPostcode()
    }
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
      // Reinitialize the carbon service with the new API key
      initializeCarbonService()
    } else {
      vscode.window.showInformationMessage('Electricity Maps API key cleared. Only UK postcodes will be available.')
      initializeCarbonService()
    }
  }
}

async function resetCommitStats() {
  await resetCommitHistory()
}