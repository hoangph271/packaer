const path = require('path')
const { packageInfo } = require('./utils/package-info')
const { exportDependencies, writeXlsx } = require('./utils/utils')

const PATHS = [
  '/Users/garand/useCode/covid4-frontend/frontend2.0',
  '/Users/garand/useCode/covid4-frontend/frontend-activation-page',
  '/Users/garand/useCode/covid4-frontend/frontend-meeting-room',
  '/Users/garand/useCode/covid4-frontend/frontend-register-photos',
  '/Users/garand/useCode/covid4-frontend/amlos-start-page'
]
const XLSX_COLUMNS = [
  {
    label: 'Name',
    value: row => ({
      l: {
        Target: row.url,
        Tooltip: `Click to open ${row.name} on NPM`
      },
      v: row.name
    }),
    format: 'l'
  },
  { label: 'Version', value: 'version' },
  { label: 'License', value: 'license' },
  { label: 'Author', value: 'author' },
  { label: 'Copyright', value: 'N/A' }
]

module.exports.dependencyToXlsx = async () => {
  const jsonSheets = []

  for (const PATH of PATHS) {
    const packageJsonPath = path.join(PATH, 'package.json')
    const { dependencies, devDependencies } = await exportDependencies(packageJsonPath)

    const packageEntries = [
      ...Object.entries(dependencies),
      ...Object.entries(devDependencies)
    ]

    const contentPromises = packageEntries.map(async ([packageName, packageVersion]) => {
      const { name, url, version, license, author } = await packageInfo(packageName, packageVersion)
        .catch(() => {
          console.info(packageName, packageVersion)
          process.exit(1)
        })

      return {
        name,
        url,
        version,
        license,
        author
      }
    })

    const content = await Promise.all(contentPromises)
    const sheet = path.basename(PATH)

    jsonSheets.push({
      sheet,
      columns: XLSX_COLUMNS,
      content
    })
  }

  writeXlsx(jsonSheets, 'All_OpenSource_Docks_FE')
}
