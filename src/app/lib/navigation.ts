const productionBasePath = '/lecciones'

export function appHref(path: string) {
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  if (process.env.NODE_ENV === 'production') {
    if (!normalizedPath) return `${productionBasePath}/index.html`
    if (normalizedPath.endsWith('.html')) return `${productionBasePath}${normalizedPath}`
    return `${productionBasePath}${normalizedPath}.html`
  }
  return normalizedPath || '/'
}
