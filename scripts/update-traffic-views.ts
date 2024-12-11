import type { AllTraffic } from './common'
import fs from 'node:fs/promises'

import path from 'node:path'

async function updateBadgeSvg(templatePath: string, outputPath: string, newCount: number) {
  const originalBadgeContent = await fs.readFile(outputPath, 'utf8')

  const templateBadgeContent = await fs.readFile(templatePath, 'utf8')
  const currentBadgeContent = templateBadgeContent.replace(/\{\{views\}\}/, String(newCount))

  if (currentBadgeContent !== originalBadgeContent) {
    await fs.writeFile(outputPath, currentBadgeContent, 'utf8')
    console.log('traffic-views.svg has been updated.')
    return true
  }

  console.log('No changes detected in traffic-views.svg.')
  return false
}

//
;(async function main() {
  const allJsonPath = path.resolve('docs/traffic/all.json')
  const trafficData: AllTraffic = JSON.parse(await fs.readFile(allJsonPath, 'utf-8'))

  const templateBadgePath = path.resolve('docs/templates/traffic-views.svg')
  const outputBadgePath = path.resolve('docs/traffic-views.svg')

  const isUpdated = await updateBadgeSvg(templateBadgePath, outputBadgePath, trafficData.count)

  if (!isUpdated) {
    console.log('No update needed.')
    process.exit(0)
  }
})()
