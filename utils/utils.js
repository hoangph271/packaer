const fs = require('fs-extra')

export const exportDependencies = async (path) => {
  const packageJsonPath = require('path').join(path, 'package.json')
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8')

  return JSON.parse(packageJsonContent)
}
