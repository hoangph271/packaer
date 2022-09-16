const fs = require('fs-extra')

module.exports.exportDependencies = async (packageJsonPath) => {
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8')

  return JSON.parse(packageJsonContent)
}

module.exports.writeXlsx = async (jsonSheets, fileName) => {
  const { default: xlsx } = await import('json-as-xlsx')

  await xlsx(jsonSheets, { fileName, writeOptions: {} })
}
