import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getCountryName, isCountryCode } from './countryMapping';

export function loadWebviewHtml(context: vscode.ExtensionContext, htmlFile: string): string {
  const htmlPath = path.join(context.extensionPath, 'webview', htmlFile);
  return fs.readFileSync(htmlPath, 'utf8');
}

export function getDashboardHtml(context: vscode.ExtensionContext, data: {
  carbonData: any;
  gridMix: any;
  stats: any;
}): string {
  const html = loadWebviewHtml(context, 'dashboard.html');
  
  // Transform region to full country name if it's a country code
  const transformedData = {
    ...data,
    carbonData: {
      ...data.carbonData,
      region: isCountryCode(data.carbonData.region) 
        ? getCountryName(data.carbonData.region)
        : data.carbonData.region
    }
  };
  
  return html + `
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        window.initializeDashboard(${JSON.stringify(transformedData)});
      });
    </script>
  `;
}