import path from 'path'
import fs from 'fs/promises'

import dotenv from 'dotenv'

// eslint-disable-next-line import/extensions
import { getTrafficViews } from './common.js'

dotenv.config()

async function updateBadgeSvg(templatePath, outputPath, newCount) {
  const originalBadgeContent = await fs.readFile(outputPath, 'utf8')

  const templateBadgeContent = await fs.readFile(templatePath, 'utf8')
  const currentBadgeContent = templateBadgeContent.replace(/{{views}}/, newCount)

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
  const trafficData = await getTrafficViews()

  const templateBadgePath = path.resolve('docs/templates/traffic-views.svg')
  const outputBadgePath = path.resolve('docs/traffic-views.svg')

  const isUpdated = await updateBadgeSvg(templateBadgePath, outputBadgePath, trafficData.count)

  if (!isUpdated) {
    console.log('No update needed.')
    process.exit(0)
  }
})()
