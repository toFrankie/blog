import fs from 'node:fs/promises'
import path from 'node:path'
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

const owner = 'toFrankie'
const repo = 'blog'

async function getRecentIssues() {
  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: 'all',
    sort: 'updated',
    direction: 'desc',
    per_page: 10,
  })

  return issues
}

async function updateRecentArticles() {
  const issues = await getRecentIssues()

  const lines = ['# 近期更新', '']

  for (const issue of issues) {
    const year = new Date(issue.updated_at).getFullYear()
    const filePath = `archives/${year}/${issue.number}.md`
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
