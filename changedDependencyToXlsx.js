const { exportDependencies, writeXlsx } = require('./utils/utils')
const { packageInfo } = require('./utils/package-info')

const OLD_PATH = '/Users/garand/Desktop/old_package.json'
const NEW_PATH = '/Users/garand/Desktop/new_package.json'
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
  { label: 'Old version', value: 'oldVersion' },
  { label: 'Author', value: 'author' },
  { label: 'License', value: 'license' },
  { label: 'Copyright', value: 'copyright' },
]

module.exports.changedDependencyToXlsx = async () => {
  const { dependencies: oldDependencies, devDependencies: oldDevDependencies } = await exportDependencies(OLD_PATH)
  const { dependencies, devDependencies } = await exportDependencies(NEW_PATH)

  const changedDependencies = Object.entries(dependencies)
    .map(([key, value]) => {
      if (value !== oldDependencies[key]) {
        return [key, value, oldDependencies[key]]
      } else {
        return null
      }
    })
    .filter(Boolean)

  const changedDevDependencies = Object.entries(devDependencies)
    .map(([key, value]) => {
      if (value !== oldDevDependencies[key]) {
        return [key, value, oldDevDependencies[key]]
      } else {
        return null
      }
    })
    .filter(Boolean)

  const allChangedDependencies = [
    ...changedDependencies,
    ...changedDevDependencies
  ].map(([packageName, version, oldVersion]) => ({
    packageName,
    version,
    oldVersion
  }))

  const contentPromises = allChangedDependencies
    .map(async ({ packageName, version, oldVersion }) => {
      const { name, url, license, author, copyright } = await packageInfo(packageName, version)
        .catch((e) => {
          console.error(packageName, version)
          console.error(e)
          process.exit(1)
        })

      return {
        name,
        url,
        version,
        license,
        author,
        oldVersion,
        copyright
      }
    })

  const content = await Promise.all(contentPromises)

  writeXlsx([
    {
      sheet: 'frontend2.0',
      columns: XLSX_COLUMNS,
      content
    }
  ], 'frontend2.0_dependency_changes')
}
