import type { CorrelationPoint } from '@/app/components/correlation/CorrelationPlot'

export type ParsedDataPairs = {
  points: CorrelationPoint[]
  errors: string[]
}

const numberPattern = /^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)(?:e[+-]?\d+)?$/i

function parseNumber(value: string) {
  const normalized = value.trim().replace(',', '.')
  if (!numberPattern.test(normalized)) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function splitPair(line: string) {
  const cleaned = line.trim().replace(/^[\[(]\s*/, '').replace(/\s*[\])]$/, '')

  if (cleaned.includes(';')) return cleaned.split(';').map((value) => value.trim())
  if (cleaned.includes('\t')) return cleaned.split(/\t+/).map((value) => value.trim())

  const whitespaceParts = cleaned.split(/\s+/).filter(Boolean)
  if (whitespaceParts.length === 2 && whitespaceParts.every((value) => numberPattern.test(value))) {
    return whitespaceParts
  }

  if (cleaned.includes(',')) return cleaned.split(',').map((value) => value.trim())
  return whitespaceParts
}

export function parseDataPairs(value: string): ParsedDataPairs {
  const points: CorrelationPoint[] = []
  const errors: string[] = []

  value.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim()
    if (!line) return
    if (/^x\s*[,;\t ]+\s*y$/i.test(line)) return

    const parts = splitPair(line)
    if (parts.length !== 2) {
      errors.push(`Línea ${index + 1}: ingresá un solo par x, y.`)
      return
    }

    const x = parseNumber(parts[0])
    const y = parseNumber(parts[1])
    if (x === null || y === null) {
      errors.push(`Línea ${index + 1}: “${line}” no contiene dos números válidos.`)
      return
    }

    points.push({ x, y })
  })

  return { points, errors }
}

function formatNumber(value: number) {
  return Number(value.toFixed(4)).toString()
}

export function formatDataPairs(points: CorrelationPoint[]) {
  return points.map((point) => `${formatNumber(point.x)}, ${formatNumber(point.y)}`).join('\n')
}

export function paddedDomain(values: number[], fallback: [number, number]): [number, number] {
  const finiteValues = values.filter(Number.isFinite)
  if (finiteValues.length === 0) return fallback

  const minimum = Math.min(...finiteValues)
  const maximum = Math.max(...finiteValues)
  const span = maximum - minimum
  const reference = Math.max(Math.abs(minimum), Math.abs(maximum), 1)
  const padding = span === 0 ? reference * 0.15 : span * 0.12

  return [minimum - padding, maximum + padding]
}
