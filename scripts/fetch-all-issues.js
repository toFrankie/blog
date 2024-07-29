/**
 * 获取所有 Issue 并生成与 github-blogger 相同的 Markdown 文件，以批量存档文章。
 */

import fs from 'fs/promises'
import path from 'path'
import { Octokit } from '@octokit/rest'
import matter from 'gray-matter'
import dayjs from 'dayjs'
import dotenv from 'dotenv'

dotenv.config()

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_USER = process.env.GITHUB_USER

const octokit = new Octokit({ auth: GITHUB_TOKEN })

async function fetchIssues() {
  const issues = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const { data } = await octokit.issues.listForRepo({
      owner: GITHUB_USER,
      repo: GITHUB_REPO,
      state: 'all',
      per_page: 100,
      page,
    })

    issues.push(...data)
    hasNextPage = data.length === 100
    page += 1
  }

  return issues
}

function determineYear(issue) {
  const createdAt = dayjs(issue.created_at)
  // if (createdAt.isBefore(dayjs('2023-05-01'))) {
  //   const yearLabel = issue.labels.find(label => /^\d{4}$/.test(label.name))
  //   if (yearLabel) {
  //     return yearLabel.name
  //   }
  // }
  return createdAt.format('YYYY')
}

function generateMarkdown(issue) {
  return matter.stringify(issue.body, {
    title: issue.title,
    number: `#${issue.number}`,
    link: issue.html_url || issue.url,
    created_at: dayjs(issue.created_at).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(issue.updated_at).format('YYYY-MM-DD HH:mm:ss'),
    labels: issue.labels.map(({ name }) => name),
  })
}

async function saveIssue(issue) {
  const year = determineYear(issue)
  const dir = path.join(process.cwd(), 'archives', year)
  const filePath = path.join(dir, `${issue.number}.md`)

  // try {
  //   await fs.mkdir(dir, { recursive: true })
  //   await fs.writeFile(filePath, generateMarkdown(issue), { flag: 'wx' })
  //   console.log(`Saved: ${filePath}`)
  // } catch (error) {
  //   if (error.code === 'EEXIST') {
  //     console.log(`File already exists: ${filePath}`)
  //   } else {
  //     throw error
  //   }
  // }

  try {
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(filePath, generateMarkdown(issue)) // 不再使用 { flag: 'wx' }，这样会覆盖同名文件
    console.log(`Saved: ${filePath}`)
  } catch (error) {
    console.error(`Failed to save: ${filePath}`, error)
  }
}

async function main() {
  try {
    const issues = await fetchIssues()
    console.log(`Fetched ${issues.length} issues`)
    for (const issue of issues) {
      await saveIssue(issue)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
