import fs from 'node:fs/promises'
import path from 'node:path'
import { exec } from 'node:child_process'

import matter from 'gray-matter'
import dayjs from 'dayjs'
import { Octokit } from '@octokit/rest'
import dotenv from 'dotenv'

dotenv.config()

const { GITHUB_TOKEN, GITHUB_USER, GITHUB_REPO, GITHUB_BRANCH } = process.env
const IMAGES_DIR = path.resolve('./images')
const ARCHIVES_DIR = path.resolve('./archives')
const IGNORE_DIR = '2024'

const octokit = new Octokit({ auth: GITHUB_TOKEN })

// 获取指定目录及子目录的 Markdown 文件路径（忽略特定子目录）
async function getMarkdownFiles(dir, ignoreDir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== ignoreDir) {
      files.push(...(await getMarkdownFiles(fullPath, ignoreDir)))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

// 解析 Markdown 文件，处理图片链接
async function processMarkdownFile(filePath) {
  let fileContent = await fs.readFile(filePath, 'utf8')
  // 需匹配：background-image: url(https://cdn.jsdelivr.net/gh/toFrankie/blog/images/1682475354583.png);

  // /\!\[.*?\]\((https:\/\/cdn\.jsdelivr\.net\/gh\/toFrankie\/blog\/images\/(\d+\.\w+))\)/g
  // /\((https:\/\/cdn\.jsdelivr\.net\/gh\/toFrankie\/blog\/images\/(\d+\.\w+))\)/g

  const imageRegex = new RegExp(
    `(https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}/images/(\\d+\\.\\w+))`,
    'g'
  )

  const matchedImages = Array.from(fileContent.matchAll(imageRegex))
  if (matchedImages.length === 0) return // 无需处理

  const imageFiles = matchedImages.map(match => match[2]) // 提取文件名

  const issueNumber = path.basename(filePath, '.md')

  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i]
    const originalPath = path.join(IMAGES_DIR, filename)

    try {
      await fs.access(originalPath)
    } catch {
      console.warn(`图片文件未找到：${originalPath}`)
      continue
    }

    // 根据文件名（时间戳）计算目标路径
    const timestamp = parseInt(filename.split('.')[0], 10)
    const date = dayjs(timestamp)
    const year = date.format('YYYY')
    const month = date.format('M')

    const targetDir = path.join(IMAGES_DIR, year, month)
    const targetPath = path.join(targetDir, filename)

    try {
      await fs.access(targetPath)
    } catch {
      // 目标文件不存在，创建目录并移动文件
      await fs.mkdir(targetDir, { recursive: true })
      await fs.rename(originalPath, targetPath)
    }

    // 替换 Markdown 文件中的路径
    const newUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${GITHUB_BRANCH}/images/${year}/${month}/${filename}`

    console.log(`路径替换：#${issueNumber}  ${matchedImages[i][1]}  -->  ${newUrl}`)
    fileContent = fileContent.replace(matchedImages[i][1], newUrl)
  }

  // 更新 Front-Matter
  const { data, content } = matter(fileContent)
  data.updated_at = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const newMarkdown = matter.stringify(content, data)

  await fs.writeFile(filePath, newMarkdown, 'utf8')

  await updateGitHubIssue(issueNumber, content)
}

async function updateGitHubIssue(issueNumber, content) {
  try {
    await octokit.rest.issues.update({
      owner: GITHUB_USER,
      repo: GITHUB_REPO,
      issue_number: Number(issueNumber),
      body: content,
    })
    console.log(`Issue #${issueNumber} 更新成功`)
  } catch (error) {
    console.error(`更新 Issue #${issueNumber} 失败：`, error)
  }
}

// 主函数
;(async function main() {
  try {
    const markdownFiles = await getMarkdownFiles(ARCHIVES_DIR, IGNORE_DIR)

    for (const filePath of markdownFiles) {
      await processMarkdownFile(filePath)
    }

    await commitChanges()
  } catch (error) {
    console.error('处理失败：', error)
  }
})()

// 提交变更到 GitHub
async function commitChanges() {
  try {
    await exec('git add .')
    await exec(`git commit -m "chore: migrate article images"`)
    await exec(`git push origin ${GITHUB_BRANCH}`)
    console.log('文件变更已推送到远程仓库')
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
      console.log('无变更，无需提交')
    } else {
      console.error('提交变更失败：', error)
    }
  }
}