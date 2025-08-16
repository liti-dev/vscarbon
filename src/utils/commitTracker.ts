import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export interface CommitStats {
  totalCommits: number
  sustainableCommits: number // low + moderate periods
  lowCarbonCommits: number 
  moderateCommits: number
  lastCommitTime?: string
  lastCommitCarbon?: string
  sustainabilityRate?: number
}

let extensionContext: vscode.ExtensionContext
let latestCarbonData: any = null
let logWatcher: fs.FSWatcher | null = null

export function initCommitTracker(context: vscode.ExtensionContext, carbonData: any) {
  extensionContext = context
  latestCarbonData = carbonData
}

export function updateCarbonData(carbonData: any) {
  latestCarbonData = carbonData
}

function getLastCommitHash(logContent: string): string {
  const lines = logContent.trim().split('\n')
  if (lines.length === 0) {return ''}
  
  const lastLine = lines[lines.length - 1]
  const parts = lastLine.split(' ')
  return parts.length >= 2 ? parts[1] : ''
}

function setupGitLogWatcher() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
  if (!workspaceFolder) {return}

  const gitLogFile = path.join(workspaceFolder.uri.fsPath, '.git', 'logs', 'HEAD')
  
  if (!fs.existsSync(gitLogFile)) {
    console.log('Git log file not found, commit tracking disabled')
    return
  }

  try {
    let lastCommitHash = getLastCommitHash(fs.readFileSync(gitLogFile, 'utf8'))

    logWatcher = fs.watch(gitLogFile, () => {
      try {
        const newLogContent = fs.readFileSync(gitLogFile, 'utf8')
        const newCommitHash = getLastCommitHash(newLogContent)
        
        // Check if a new, valid commit hash
        if (newCommitHash && 
            newCommitHash !== lastCommitHash && 
            newCommitHash !== '0000000000000000000000000000000000000000') {
          lastCommitHash = newCommitHash
          setTimeout(() => trackCommit(), 50)
        }
      } catch (error) {
        console.error('Error reading Git log:', error)
      }
    })

  } catch (error) {
    console.error('Failed to setup Git log watcher:', error)
  }
}

export function setupGitCommitListener() {
  setupGitLogWatcher()
}



async function trackCommit() {
  const stats = await getCommitStats()
  stats.totalCommits++

  if (!latestCarbonData?.index) {    
    vscode.window.showInformationMessage('Commit tracked! Set your postcode to enable carbon-aware tracking.')
    await extensionContext.workspaceState.update('commitStats', stats)
    return
  }

  const carbonIndex = latestCarbonData.index.toLowerCase()
  stats.lastCommitTime = new Date().toISOString()
  stats.lastCommitCarbon = latestCarbonData.index

  if (carbonIndex === 'very low' || carbonIndex === 'low') {
    stats.lowCarbonCommits++
    stats.sustainableCommits++
    vscode.window.showInformationMessage(`🌱 Sustainable commit! ${carbonIndex} carbon intensity: ${latestCarbonData.intensity} gCO₂/kWh`)
  } else if (carbonIndex === 'moderate') {
    stats.moderateCommits++
    stats.sustainableCommits++
    vscode.window.showInformationMessage(`🌱 Sustainable commit! Moderate carbon intensity: ${latestCarbonData.intensity} gCO₂/kWh`)
  } else {
    vscode.window.showWarningMessage(`⚡ High carbon commit: ${latestCarbonData.intensity} gCO₂/kWh. Consider committing during low-carbon periods.`)
  }

  await extensionContext.workspaceState.update('commitStats', stats)
}

export async function getCommitStats(): Promise<CommitStats> {
  return extensionContext.workspaceState.get<CommitStats>('commitStats') || {
    totalCommits: 0,
    sustainableCommits: 0,
    lowCarbonCommits: 0,
    moderateCommits: 0
  }
}

export async function showCommitStats() {
  const stats = await getCommitStats()
  const sustainabilityRate = stats.totalCommits > 0 
    ? Math.round((stats.sustainableCommits / stats.totalCommits) * 100) 
    : 0

  const message = `
📊 Carbon-Aware Commit Stats:
• Total commits: ${stats.totalCommits}
• Sustainable commits: ${stats.sustainableCommits} (${sustainabilityRate}%)
  - Low carbon (very low + low): ${stats.lowCarbonCommits}
  - Moderate carbon: ${stats.moderateCommits}
• High carbon commits: ${stats.totalCommits - stats.sustainableCommits}

${stats.lastCommitTime ? `Last commit: ${new Date(stats.lastCommitTime).toLocaleString()} (${stats.lastCommitCarbon})` : ''}
  `.trim()

  vscode.window.showInformationMessage(message, { modal: true })
}

export async function resetCommitHistory() { 
  const choice = await vscode.window.showWarningMessage(
    'Are you sure you want to reset all commit tracking data? This cannot be undone.',
    { modal: true },
    'Reset',
    'Cancel'
  )

  if (choice === 'Reset') {
    // clear commit stats
    await extensionContext.workspaceState.update('commitStats', undefined)
    await extensionContext.workspaceState.update('lastCommitHash', undefined)
    
    vscode.window.showInformationMessage('✅ Commit tracking history has been reset!')
  }
}

export async function testCommitTracking() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder found. Open a Git repository to test commit tracking.')
    return
  }

  const gitLogFile = path.join(workspaceFolder.uri.fsPath, '.git', 'logs', 'HEAD')
  
  if (!fs.existsSync(gitLogFile)) {
    vscode.window.showErrorMessage('No Git repository found. Initialize a Git repo and make at least one commit to test tracking.')
    return
  }

  
  if (!logWatcher) {
    vscode.window.showWarningMessage('Commit tracker not initialized. Try reloading the window.')
    return
  }

  // simulate a commit for testing
  await trackCommit()
  
  const stats = await getCommitStats()
  vscode.window.showInformationMessage(
    `✅ Test commit tracked! Total commits: ${stats.totalCommits}. ` +
    'To test real tracking, make an actual commit with "git commit" and watch for notifications.'
  )
}

export function cleanupCommitTracker() {
  if (logWatcher) {
    logWatcher.close()
    logWatcher = null
  }
}