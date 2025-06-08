import type { RestEndpointMethodTypes } from '@octokit/rest'
import { Octokit } from '@octokit/rest'

export type IssueState = RestEndpointMethodTypes['issues']['listForRepo']['parameters']['state']
export type Issues = RestEndpointMethodTypes['issues']['listForRepo']['response']['data']
export type Issue = Issues[number]
export type TrafficViews = RestEndpointMethodTypes['repos']['getViews']['response']['data']
export type Views = TrafficViews['views']

export interface TrafficDayItem {
  day: string
  count: number
  uniques: number
}

export interface TrafficMonthItem {
  month: string
  count: number
  uniques: number
  list: TrafficDayItem[]
}

export interface TrafficYear {
  year: string
  count: number
  uniques: number
  list: TrafficMonthItem[]
}

export interface AllTrafficItem {
  year: string
  count: number
  uniques: number
}

export interface AllTraffic {
  count: number
  uniques: number
  list: AllTrafficItem[]
}

export const getGithubRepo = () => process.env.GITHUB_REPO || 'blog'

export const getGithubUser = () => process.env.GITHUB_USER || 'toFrankie'

export const getGithubToken = () => process.env.GITHUB_TOKEN || ''

export const getGithubBranch = () => process.env.GITHUB_BRANCH || 'main'

export async function fetchAllIssue(state: IssueState = 'all') {
  const issues: Issues = []
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

export async function fetchRecentIssues(state: IssueState = 'all') {
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
    if (error instanceof Error) {
      throw new TypeError(`Failed to fetch traffic data: ${error.message}`)
    }
    throw error
  }
}

export async function getMarkdownContent(issue: Issue) {
  if (!issue.body) return ''

  const octokit = new Octokit({ auth: getGithubToken() })

  const res = await octokit.request('POST /markdown', {
    text: issue.body || '',
    mode: 'gfm',
    context: 'toFrankie/blog',
  })

  return res.data
}
