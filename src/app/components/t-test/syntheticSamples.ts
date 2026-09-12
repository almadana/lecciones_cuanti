import * as d3 from 'd3'

export type SyntheticPerson = {
  id: number
  gender: 'male' | 'female'
  satisfaction: number
}

export function generateExactSample(n: number, mean: number, std: number, seed: number) {
  let state = seed >>> 0
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0
    return Math.max(Number.EPSILON, state / 4294967296)
  }
  const raw = Array.from({ length: n }, () => {
    const u = random()
    const v = random()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  })
  const rawMean = d3.mean(raw) ?? 0
  const centered = raw.map((value) => value - rawMean)
  const rawStd = d3.deviation(centered) || 1
  const deviations = centered.map((value) => (value / rawStd) * std)
  const boundaryScale = deviations.reduce((scale, deviation) => {
    if (deviation > 0) return Math.min(scale, (35 - mean) / deviation)
    if (deviation < 0) return Math.min(scale, (5 - mean) / deviation)
    return scale
  }, 1)
  const values = deviations.map((deviation) => mean + deviation * boundaryScale)
  values[values.length - 1] += mean * n - d3.sum(values)
  return values
}

export function generateGroups(n: number, maleMean: number, femaleMean: number, std: number, seed: number): SyntheticPerson[] {
  const males = generateExactSample(n, maleMean, std, seed).map((satisfaction, index) => ({
    id: index,
    gender: 'male' as const,
    satisfaction,
  }))
  const females = generateExactSample(n, femaleMean, std, seed + 1009).map((satisfaction, index) => ({
    id: index + n,
    gender: 'female' as const,
    satisfaction,
  }))
  return [...males, ...females]
}

export function calculateIndependentT(data: SyntheticPerson[]) {
  const males = data.filter((person) => person.gender === 'male')
  const females = data.filter((person) => person.gender === 'female')
  const maleMean = d3.mean(males, (person) => person.satisfaction) || 0
  const femaleMean = d3.mean(females, (person) => person.satisfaction) || 0
  const maleStd = d3.deviation(males, (person) => person.satisfaction) || 0
  const femaleStd = d3.deviation(females, (person) => person.satisfaction) || 0
  const n1 = males.length
  const n2 = females.length
  const pooledVariance = n1 + n2 > 2
    ? ((n1 - 1) * maleStd ** 2 + (n2 - 1) * femaleStd ** 2) / (n1 + n2 - 2)
    : 0
  const standardError = Math.sqrt(pooledVariance * (1 / n1 + 1 / n2))
  const tStat = standardError > 0 ? (femaleMean - maleMean) / standardError : 0
  return {
    males,
    females,
    maleMean,
    femaleMean,
    maleStd,
    femaleStd,
    meanDiff: femaleMean - maleMean,
    standardError,
    tStat,
    df: n1 + n2 - 2,
  }
}
