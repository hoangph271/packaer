const blacklistedRepos = new Set()

exports.packageInfo = async (packageName, targetVersion) => {
  const { default: got } = await import('got')
  const { satisfies } = await import('compare-versions')
  const { default: registryUrl } = await import('registry-url')

  let copyright = ''
  const url = `${registryUrl()}${packageName.toLowerCase()}`
  const fromPackage = JSON.parse((await got(url)).body)
  const githubUrl = fromPackage.repository?.url
    .replace('git+', '')
    .replace('ssh://git@', 'https://')
    .replace('git://', 'https://')

  if (githubUrl && !blacklistedRepos.has(githubUrl)) {
    const branchNames = ['main', 'master', 'develop']

    while (true) {
      if (branchNames.length === 0) break

      const branchName = branchNames.pop()
      const readmePrefixUrl = githubUrl
        .replace('.git', '')
        .replace('https://github.com/', 'https://raw.githubusercontent.com/')

      const licenseFileNames = ['LICENSE', 'LICENSE.txt', 'LICENSE.md', 'license']

      for (const licenseFileName of licenseFileNames) {
        const readmeUrl = `${readmePrefixUrl}/${branchName}/${licenseFileName}`

        try {
          const text = (await got(readmeUrl)).body
          const lines = text.split('\n')
          copyright = lines.find(line => line.trim().startsWith('Copyright ')) ?? ''

          if (copyright) {
            break
          }
        } catch (_) { }
      }
    }

    if (!copyright) {
      blacklistedRepos.add(githubUrl)
      console.info(`NO Copyright found: ${githubUrl}`)
    }
  }

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
    copyright,
    name: package.name,
    version: package.version,
    description: package.description,
    license: typeof package.license === 'string'
      ? package.license
      : package.license.type,
    homepage: package.homepage,
    author: package.author?.name ??
      package.maintainers?.map((maintainer) => maintainer.name).join(', ')
  }
}
