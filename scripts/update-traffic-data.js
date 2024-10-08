import path from 'path'
import fs from 'fs/promises'

import dayjs from 'dayjs'
import dotenv from 'dotenv'
import utc from 'dayjs/plugin/utc.js'

// eslint-disable-next-line import/extensions
import { getTrafficViews } from './common.js'

dotenv.config()

dayjs.extend(utc)

async function updateYearTrafficJson(trafficDir, data) {
  const { views } = data

  const currentYear = dayjs().year().toString()
  let yearData = { count: 0, uniques: 0, year: currentYear, list: [] }

  try {
    const originalTrafficData = await fs.readFile(trafficDir, 'utf8')
    yearData = JSON.parse(originalTrafficData)
  } catch (error) {
    // Initialize new traffic data if file doesn't exist
  }

  views.forEach(view => {
    const utcTime = dayjs.utc(view.timestamp)
    const year = utcTime.format('YYYY')
    const month = utcTime.format('YYYY-MM')
    const day = utcTime.format('YYYY-MM-DD')

    if (year !== yearData.year) return

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

  await fs.writeFile(trafficDir, JSON.stringify(yearData, null, 2))
}

async function updateAllTrafficJson(trafficDir, allJsonPath) {
  const allTrafficData = { count: 0, uniques: 0, list: [] }

  const pattern = /^(20[0-9]{2}|2100).json$/
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

  await fs.writeFile(allJsonPath, JSON.stringify(allTrafficData, null, 2))
}

;(async function main() {
  const trafficData = await getTrafficViews()

  const trafficDir = path.resolve('docs/traffic')
  await fs.mkdir(trafficDir, { recursive: true })

  // TODO: 处理跨年数据
  const year = dayjs().format('YYYY')
  const yearFilePath = path.resolve(trafficDir, `${year}.json`)
  await updateYearTrafficJson(yearFilePath, trafficData)

  const allJsonPath = path.resolve(trafficDir, 'all.json')
  await updateAllTrafficJson(trafficDir, allJsonPath)

  console.log('Traffic data updated.')
})()
