import fs from 'node:fs/promises'
import path from 'node:path'

import { fetchAllIssue, getGithubRepo, getGithubUser, type Issues } from './common'

const TEMPLATE_FILE = path.resolve('docs', 'templates', 'readme.md')
const OUTPUT_FILE = path.resolve('README.md')

;(async function main() {
  let templateContent = await fs.readFile(TEMPLATE_FILE, 'utf-8')

  const issues = await fetchAllIssue()

  const yearLinks = await genYearLinks(issues)

  templateContent = templateContent.replace('{{yearLinks}}', yearLinks)

  templateContent = replaceRelativePaths(
    templateContent,
    path.dirname(TEMPLATE_FILE),
    path.dirname(OUTPUT_FILE),
  )

  await fs.writeFile(OUTPUT_FILE, templateContent, 'utf-8')
  console.log('README.md has been updated.')
})()

interface YearLabel {
  [year: string]: number
}

// 生成年标签的链接
async function genYearLinks(issues: Issues) {
  const yearLabels: YearLabel = {}
  const yearLabelPattern = /^20\d{2}|2100$/

  for (const issue of issues) {
    const matchedLabel = issue.labels.find(label => {
      if (typeof label === 'string') return yearLabelPattern.test(label)
      return yearLabelPattern.test(label.name ?? '')
    })

    const yearLabel = typeof matchedLabel === 'string' ? matchedLabel : matchedLabel?.name
    if (yearLabel) {
      yearLabels[yearLabel] = (yearLabels[yearLabel] || 0) + 1
    }
  }

  // 按年份递减排序
  const sortedYears = Object.keys(yearLabels).sort((a, b) => Number(b) - Number(a))

  const githubUser = getGithubUser()
  const githubRepo = getGithubRepo()

  const labels = sortedYears.map(
    year =>
      `[${year} 年，共 ${yearLabels[year]} 篇](https://github.com/${githubUser}/${githubRepo}/labels/${year})`,
  )

  return `- ${labels.join('\n- ')}`
}

function replaceRelativePaths(content: string, inputDir: string, outputDir: string) {
  // image
  let newContent = content.replace(
    // eslint-disable-next-line regexp/no-useless-assertions
    /!\[(.*?)\]\((?!http)(\.\.?\/[^/].*?)\)/g,
    (_, alt, filePath) => {
      const outputPath = path.resolve(inputDir, filePath)
      const relativeOutputPath = path.relative(outputDir, outputPath)
      return `![${alt}](${relativeOutputPath})`
    },
  )

  // link
  newContent = newContent.replace(
    // eslint-disable-next-line regexp/no-useless-assertions
    /\[([^\]]+)\]\((?!http)(\.\.?\/[^/].*?)\)/g,
    (_, text, filePath) => {
      const outputPath = path.resolve(inputDir, filePath)
      const relativeOutputPath = path.relative(outputDir, outputPath)
      return `[${text}](${relativeOutputPath})`
    },
  )

  return newContent
}
