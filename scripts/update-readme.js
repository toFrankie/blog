import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { Octokit } from '@octokit/rest'

dotenv.config()

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_USER = process.env.GITHUB_USER
const GITHUB_REPO = process.env.GITHUB_REPO

const TEMPLATE_FILE = path.resolve('docs', 'templates', 'readme.md')
const OUTPUT_FILE = path.resolve('README.md')

const octokit = new Octokit({ auth: GITHUB_TOKEN })

async function getAllIssues() {
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

// 生成年标签的链接
async function generateYearLinks(issues) {
  const yearLabels = {}
  const yearLabelPattern = /^(20[0-9]{2}|2100)$/

  for (const issue of issues) {
    const yearLabel = issue.labels.find(label => yearLabelPattern.test(label.name))?.name
    if (yearLabel) {
      yearLabels[yearLabel] = (yearLabels[yearLabel] || 0) + 1
    }
  }

  // 按年份递减排序
  const sortedYears = Object.keys(yearLabels).sort((a, b) => b - a)

  const labels = sortedYears.map(
    year =>
      `[${year} 年，共 ${yearLabels[year]} 篇](https://github.com/${GITHUB_USER}/${GITHUB_REPO}/labels/${year})`
  )

  return `- ${labels.join('\n- ')}`
}

function replaceRelativePaths(content, inputDir, outputDir) {
  // image
  content = content.replace(/!\[(.*?)\]\((?!http)(\.\.?\/[^\/].*?)\)/g, (_, alt, filePath) => {
    const outputPath = path.resolve(inputDir, filePath)
    const relativeOutputPath = path.relative(outputDir, outputPath)
    return `![${alt}](${relativeOutputPath})`
  })

  // link
  content = content.replace(/\[([^\]]+)\]\((?!http)(\.\.?\/[^\/].*?)\)/g, (_, text, filePath) => {
    const outputPath = path.resolve(inputDir, filePath)
    const relativeOutputPath = path.relative(outputDir, outputPath)
    return `[${text}](${relativeOutputPath})`
  })

  return content
}

async function updateReadme() {
  let templateContent = fs.readFileSync(TEMPLATE_FILE, 'utf-8')

  const issues = await getAllIssues()

  const yearLinks = await generateYearLinks(issues)

  templateContent = templateContent.replace('{{yearLinks}}', yearLinks)

  templateContent = replaceRelativePaths(
    templateContent,
    path.dirname(TEMPLATE_FILE),
    path.dirname(OUTPUT_FILE)
  )

  fs.writeFileSync(OUTPUT_FILE, templateContent, 'utf-8')
  console.log('README.md has been updated.')
}

updateReadme().catch(err => {
  console.error('Error updating README.md:', err)
})
