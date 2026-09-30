const productionBasePath = '/lecciones'

export function appHref(path: string) {
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  if (process.env.NODE_ENV === 'production') {
    return `${productionBasePath}${normalizedPath}` || productionBasePath
  }
  return normalizedPath || '/'
}
