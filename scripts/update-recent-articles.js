import fs from 'node:fs/promises'
import path from 'node:path'

import dotenv from 'dotenv'

// eslint-disable-next-line import/extensions
import { fetchRecentIssues } from './common.js'

dotenv.config()

async function updateRecentArticles() {
  const issues = await fetchRecentIssues()

  const lines = ['# 近期更新', '']

  for (const issue of issues) {
    lines.push(`- [${issue.title}](${issue.html_url || `#${issue.number}`})`)
  }

  const content = lines.join('\n')
  const filePath = path.join('docs', 'recent-articles.md')

  const dirPath = path.dirname(filePath)
  await fs.mkdir(dirPath, { recursive: true })

  await fs.writeFile(filePath, content, 'utf8')
}

updateRecentArticles().catch(err => {
  console.error(err)
  process.exit(1)
})
