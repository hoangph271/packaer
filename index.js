const { packageInfo } = require('./package-info')
const fs = require('fs-extra')
const path = require('path')

const PATHS = [
  '/Users/garand/useCode/covid4-frontend/frontend2.0'
]
const xlsxColumns = [
  { label: 'Name', value: 'name' },
  { label: 'Version', value: 'version' },
  { label: 'License', value: 'license' },
  { label: 'Author', value: 'author' },
  { label: 'Copyright', value: 'N/A' }
]

async function run() {
  const { default: xlsx } = await import('json-as-xlsx')
  const jsonSheets = []

  for (const PATH of PATHS) {
    const packageJsonPath = path.join(PATH, 'package.json')
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8')
    const { dependencies } = JSON.parse(packageJsonContent)
    const contentPromises = Object.keys(dependencies).map(async packageName => {
      const packageVersion = dependencies[packageName]
      const { name, url, version, license, author } = await packageInfo(packageName, packageVersion)
      if (!name) {
        console.info(`${packageName}@${name}`)
      }

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
    fileName: 'All_OpenSource_Docks_FE.xlsx',
    // extraLength: 3,
    // Style options from https://github.com/SheetJS/sheetjs#writing-options
    writeOptions: {}
  })
}

run()
