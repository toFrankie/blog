import path from 'path'
import fs from 'fs/promises'

import dotenv from 'dotenv'

// eslint-disable-next-line import/extensions
import { getTrafficViews } from './common.js'

dotenv.config()

async function updateBadge(templatePath, outputPath, newCount) {
  const originalBadgeContent = await fs.readFile(outputPath, 'utf8')

  const templateBadgeContent = await fs.readFile(templatePath, 'utf8')
  const currentBadgeContent = templateBadgeContent.replace(/{{count}}/, newCount)

  if (currentBadgeContent !== originalBadgeContent) {
    await fs.writeFile(outputPath, currentBadgeContent, 'utf8')
    console.log('badge.svg has been updated.')
    return true
  }

  console.log('No changes detected in badge.svg.')
  return false
}

//
;(async function main() {
  const totalCount = await getTrafficViews()

  const templateBadgePath = path.resolve('docs/templates/badge.svg')
  const outputBadgePath = path.resolve('docs/badge.svg')

  const isUpdated = await updateBadge(templateBadgePath, outputBadgePath, totalCount)

  if (!isUpdated) {
    console.log('No update needed.')
    process.exit(0)
  }
})()
