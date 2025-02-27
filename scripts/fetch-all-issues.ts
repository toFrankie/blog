/**
 * 获取所有 Issue 并生成与 github-blogger 相同的 Markdown 文件，以批量存档文章。
 */

import fs from 'node:fs/promises'
import path from 'node:path'

import dayjs from 'dayjs'
import matter from 'gray-matter'

import { fetchAllIssue, type Issue } from './common'

//
;(async function main() {
  try {
    const issues = await fetchAllIssue()
    console.log(`Fetched ${issues.length} issues`)

    for (const issue of issues) {
      await saveIssue(issue)
    }
  } catch (error) {
    console.error('Error:', error)
  }
})()

function determineYear(issue: Issue) {
  const createdAt = dayjs(issue.created_at)
  // if (createdAt.isBefore(dayjs('2023-05-01'))) {
  //   const yearLabel = issue.labels.find(label => /^\d{4}$/.test(label.name))
  //   if (yearLabel) {
  //     return yearLabel.name
  //   }
  // }
  return createdAt.format('YYYY')
}

function generateMarkdown(issue: Issue) {
  return matter.stringify(issue.body || '', {
    title: issue.title,
    number: `#${issue.number}`,
    link: issue.html_url || issue.url,
    created_at: dayjs(issue.created_at).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(issue.updated_at).format('YYYY-MM-DD HH:mm:ss'),
    labels: issue.labels.map(label => (typeof label === 'string' ? label : label.name)),
  })
}

async function saveIssue(issue: Issue) {
  const year = determineYear(issue)
  const dir = path.join(process.cwd(), 'archives', year)
  const filePath = path.join(dir, `${issue.number}.md`)

  try {
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(filePath, generateMarkdown(issue)) // 若不覆盖同名文件，传入 { flag: 'wx' }
    console.log(`Saved: ${filePath}`)
  } catch (error) {
    console.error(`Failed to save: ${filePath}`, error)
  }
}
