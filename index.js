const path = require('path')
const { packageInfo } = require('./package-info')
const { exportDependencies } = require('./utils/utils')

const PATHS = [
  '/Users/garand/useCode/covid4-frontend/frontend2.0',
  '/Users/garand/useCode/covid4-frontend/frontend-activation-page',
  '/Users/garand/useCode/covid4-frontend/frontend-meeting-room',
  '/Users/garand/useCode/covid4-frontend/frontend-register-photos',
  '/Users/garand/useCode/covid4-frontend/amlos-start-page'
]
const xlsxColumns = [
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

async function dependencyToXlsx() {
  const { default: xlsx } = await import('json-as-xlsx')
  const jsonSheets = []

  for (const PATH of PATHS) {
    const { dependencies, devDependencies } = await exportDependencies(PATH)

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
      columns: xlsxColumns,
      content
    })
  }

  xlsx(jsonSheets, {
    fileName: 'All_OpenSource_Docks_FE',
    writeOptions: {}
  })
}

dependencyToXlsx()
