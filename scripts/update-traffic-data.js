import fs from 'node:fs/promises'
import path from 'node:path'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import dotenv from 'dotenv'

import { getTrafficViews } from './common.js'

dotenv.config()

dayjs.extend(utc)

async function updateYearTrafficJson(filePath, views) {
  const currentYear = dayjs().year().toString()
  let yearData = { count: 0, uniques: 0, year: currentYear, list: [] }

  try {
    const originalTrafficData = await fs.readFile(filePath, 'utf8')
    yearData = JSON.parse(originalTrafficData)
  }
  catch {
    // Initialize new traffic data if file doesn't exist
  }

  views.forEach((view) => {
    const utcTime = dayjs.utc(view.timestamp)
    const year = utcTime.format('YYYY')
    const month = utcTime.format('YYYY-MM')
    const day = utcTime.format('YYYY-MM-DD')

    if (year !== yearData.year)
      return

    let monthData = yearData.list.find(m => m.month === month)
    if (!monthData) {
      monthData = { month, count: 0, uniques: 0, list: [] }
      yearData.list.push(monthData)
    }

    let dayData = monthData.list.find(d => d.day === day)
    if (!dayData) {
      dayData = { day, count: 0, uniques: 0 }
      monthData.list.push(dayData)
    }

    dayData.count = view.count
    dayData.uniques = view.uniques

    monthData.count = monthData.list.reduce((sum, d) => sum + d.count, 0)
    monthData.uniques = monthData.list.reduce((sum, d) => sum + d.uniques, 0)
  })

  yearData.count = yearData.list.reduce((sum, y) => sum + y.count, 0)
  yearData.uniques = yearData.list.reduce((sum, y) => sum + y.uniques, 0)

  const formattedYearData = JSON.stringify(yearData, null, 2)
  await fs.writeFile(filePath, formattedYearData)
}

async function updateAllTrafficJson(trafficDir, allJsonPath) {
  const allTrafficData = { count: 0, uniques: 0, list: [] }

  const pattern = /^20\d{2}|2100.json$/
  const files = await fs.readdir(trafficDir)

  for (const file of files) {
    if (pattern.test(file)) {
      const filePath = path.resolve(trafficDir, file)
      const yearData = JSON.parse(await fs.readFile(filePath, 'utf-8'))

      const item = { year: yearData.year, count: yearData.count, uniques: yearData.uniques }

      allTrafficData.list.push(item)
      allTrafficData.count += yearData.count
      allTrafficData.uniques += yearData.uniques
    }
  }

  const formattedAllTrafficData = JSON.stringify(allTrafficData, null, 2)
  await fs.writeFile(allJsonPath, formattedAllTrafficData)
}

;(async function main() {
  const trafficData = await getTrafficViews()

  const trafficDir = path.resolve('docs/traffic')
  await fs.mkdir(trafficDir, { recursive: true })

  const trafficDataYearly = Object.groupBy(trafficData.views, item =>
    dayjs(item.timestamp).format('YYYY'))
  for (const [year, views] of Object.entries(trafficDataYearly)) {
    const yearFilePath = path.resolve(trafficDir, `${year}.json`)
    await updateYearTrafficJson(yearFilePath, views)
  }

  const allJsonPath = path.resolve(trafficDir, 'all.json')
  await updateAllTrafficJson(trafficDir, allJsonPath)

  console.log('Traffic data updated.')
})()
