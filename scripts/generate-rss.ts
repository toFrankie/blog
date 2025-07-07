import fs from 'node:fs/promises'

import { Feed } from 'feed'
import MarkdownIt from 'markdown-it'

import { fetchAllIssue, type Issue } from './common'

const md = MarkdownIt({
  html: true,
  linkify: true,
})

main()

async function main() {
  const issues = await fetchAllIssue()
  const rss = await generateRSS(issues)
  await fs.writeFile('rss.xml', rss, 'utf-8')
  console.log('🎉 RSS has been generated.')
}

async function generateRSS(issues: Issue[]) {
  const author = {
    name: 'Frankie',
    email: '1426203851@qq.com',
    link: 'https://github.com/toFrankie',
  }

  const latestUpdatedAt = issues.reduce((latest, issue) => {
    const issueDate = new Date(issue.updated_at)
    return issueDate > latest ? issueDate : latest
  }, new Date('1970-01-01T00:00:00.000Z'))

  const feed = new Feed({
    title: "Frankie's Blog",
    description: '种一棵树，最好的时间是十年前。其次，是现在。',
    id: 'https://github.com/toFrankie/blog',
    link: 'https://github.com/toFrankie/blog',
    language: 'zh-CN',
    copyright: 'All rights reserved 2025',
    author,
    updated: latestUpdatedAt,
  })

  for (const issue of issues) {
    const content = issue.body ? md.render(issue.body) : ''

    feed.addItem({
      title: issue.title,
      id: issue.html_url,
      link: issue.html_url,
      date: new Date(issue.created_at),
      description: content.slice(0, 160),
      content,
      author: [{ name: issue.user?.login || '' }],
      // TODO: 添加图片
    })
  }

  const rss = feed.rss2()

  return rss
}
