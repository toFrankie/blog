import fs from 'node:fs/promises'
import path from 'node:path'

import { fetchRecentIssues } from './common'

async function updateRecentArticles() {
  const issues = await fetchRecentIssues()

  const lines = ['# 近期更新', '']

  for (const issue of issues) {
    lines.push(`- [${issue.title}](${issue.html_url || `#${issue.number}`})`)
  }

  const content = lines.join('\n')
  const filePath = path.join('docs', 'recent-articles.md')

  const recentArticlesDir = path.dirname(filePath)
  const dirExists = await fs.stat(recentArticlesDir).catch(() => false)
  if (!dirExists) {
    await fs.mkdir(recentArticlesDir, { recursive: true })
  }

  await fs.writeFile(filePath, content, 'utf8')
}

updateRecentArticles().catch(err => {
  console.error(err)
  process.exit(1)
})
