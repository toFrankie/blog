import { Octokit } from '@octokit/rest'

export const { GITHUB_TOKEN } = process.env

export const GITHUB_REPO = process.env.GITHUB_REPO || 'blog'

export const GITHUB_USER = process.env.GITHUB_USER || 'toFrankie'

export async function fetchIssues(state = 'all') {
  const issues = []
  let page = 1
  let hasNextPage = true

  const octokit = new Octokit({ auth: GITHUB_TOKEN })

  while (hasNextPage) {
    const { data } = await octokit.issues.listForRepo({
      owner: GITHUB_USER,
      repo: GITHUB_REPO,
      state,
      page,
      per_page: 100,
    })

    issues.push(...data)
    hasNextPage = data.length === 100
    page += 1
  }

  return issues
}
