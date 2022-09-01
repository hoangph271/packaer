exports.packageInfo = async (packageName, targetVersion) => {
  const { default: got } = await import('got')
  const { satisfies } = await import('compare-versions')
  const { default: registryUrl } = await import('registry-url')

  const url = `${registryUrl()}${packageName.toLowerCase()}`
  const fromPackage = JSON.parse((await got(url)).body)

  const version = Object.keys(fromPackage.versions)
    .find(version => satisfies(version, targetVersion))

  const package = version ? {
    version,
    ...fromPackage.versions[version]
  } : {
    version: fromPackage['dist-tags'].latest,
    fromPackage
  }

  return {
    url: `https://www.npmjs.com/package/${package.name}`,
    name: package.name,
    version: package.version,
    description: package.description,
    license: package.license,
    homepage: package.homepage,
    author: package.author?.name ??
      package.maintainers?.map((maintainer) => maintainer.name).join(', ')
  }
}
