import * as vscode from 'vscode'

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

export function initCommitTracker(context: vscode.ExtensionContext, carbonData: any) {
  extensionContext = context
  latestCarbonData = carbonData
}

export function updateCarbonData(carbonData: any) {
  latestCarbonData = carbonData
}

export function setupGitCommitListener() {
  // listen for git extension API if available
  const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports
  if (gitExtension) {
    const git = gitExtension.getAPI(1)
    if (git.repositories.length > 0) {
      git.repositories.forEach((repo: any) => {
        repo.state.onDidChange(() => {
          checkForNewCommit(repo)
        })
      })
    }
  }
}

async function checkForNewCommit(repo: any) {
  // HEAD changes then new commit
  try {
    const head = repo.state.HEAD
    if (!head?.commit) {return}

    const lastCommitHash = extensionContext.workspaceState.get<string>('lastCommitHash')
    
    if (lastCommitHash !== head.commit) {
      await extensionContext.workspaceState.update('lastCommitHash', head.commit)
      await trackCommit()
    }
  } catch (error) {
    console.error('Error checking for new commit:', error)
  }
}

async function trackCommit() {
  const stats = await getCommitStats()
  stats.totalCommits++

  // no carbon data available - still count the commit but no sustainability classification
  if (!latestCarbonData?.index) {    
    vscode.window.showInformationMessage('Commit tracked! Set your postcode to enable carbon-aware tracking.')
    await extensionContext.workspaceState.update('commitStats', stats)
    return
  }

  if (latestCarbonData?.index) {
    const carbonIndex = latestCarbonData.index.toLowerCase()
    stats.lastCommitTime = new Date().toISOString()
    stats.lastCommitCarbon = latestCarbonData.index

    if (carbonIndex === 'very low') {
      stats.lowCarbonCommits++
      stats.sustainableCommits++
      vscode.window.showInformationMessage(`🌱 Sustainable commit! Very low carbon intensity: ${latestCarbonData.intensity} gCO₂/kWh`)
    } else if (carbonIndex === 'low') {
      stats.lowCarbonCommits++
      stats.sustainableCommits++
      vscode.window.showInformationMessage(`🌱 Sustainable commit! Low carbon intensity: ${latestCarbonData.intensity} gCO₂/kWh`)
    } else if (carbonIndex === 'moderate') {
      stats.moderateCommits++
      stats.sustainableCommits++
      vscode.window.showInformationMessage(`🌱 Sustainable commit! Moderate carbon intensity: ${latestCarbonData.intensity} gCO₂/kWh`)
    } else {
      vscode.window.showWarningMessage(`⚡ High carbon commit: ${latestCarbonData.intensity} gCO₂/kWh. Consider committing during low-carbon periods.`)
    }
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
  // simulate a commit for testing
  await trackCommit()
  vscode.window.showInformationMessage('Test commit tracked! Check stats with "VSCarbon: Show Commit Stats"')
}