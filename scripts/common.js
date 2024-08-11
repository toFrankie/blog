import { Octokit } from '@octokit/rest'

export const getGithubRepo = () => process.env.GITHUB_REPO || 'blog'

export const getGithubUser = () => process.env.GITHUB_USER || 'toFrankie'

export const getGithubToken = () => process.env.GITHUB_TOKEN || ''

export async function fetchAllIssue(state = 'all') {
  const issues = []
  let page = 1
  let hasNextPage = true

  const octokit = new Octokit({ auth: getGithubToken() })

  while (hasNextPage) {
    const { data } = await octokit.issues.listForRepo({
      owner: getGithubUser(),
      repo: getGithubRepo(),
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

export async function fetchRecentIssues(state = 'all') {
  const octokit = new Octokit({ auth: getGithubToken() })

  const { data: issues } = await octokit.issues.listForRepo({
    owner: getGithubUser(),
    repo: getGithubRepo(),
    state,
    sort: 'updated',
    direction: 'desc',
    per_page: 10,
  })

  return issues
}

export async function getTrafficViews() {
  try {
    const octokit = new Octokit({ auth: getGithubToken() })

    // only for the last 14 days
    const { data } = await octokit.rest.repos.getViews({
      owner: getGithubUser(),
      repo: getGithubRepo(),
      per: 'day',
    })

    return data
  } catch (error) {
    throw new Error(`Failed to fetch traffic data: ${error.message}`)
  }
}
