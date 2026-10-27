/**
 * Dummy simulation output. Replace `makeResults` with the real model call later;
 * the Output card only depends on the shape returned here.
 */
const jitter = (base, spread, lo, hi) => Math.min(hi, Math.max(lo, base + (Math.random() - 0.5) * spread))

export function makeResults(params) {
  const grate = params.indu.mode === 'grate'

  const raw = [jitter(11, 3, 8, 14), jitter(38, 4, 33, 43), jitter(36, 4, 31, 41), jitter(15, 3, 11, 19)]
  const total = raw.reduce((a, b) => a + b, 0)
  const sizes = raw.map((v) => Math.round((v / total) * 1000) / 10)
  sizes[3] = Math.round((100 - sizes[0] - sizes[1] - sizes[2]) * 10) / 10
  const labels = ['8 – 10 mm', '10 – 12 mm', '12 – 14 mm', '14 – 16 mm']

  return {
    sizes: sizes.map((value, i) => ({ label: labels[i], value })),
    kpis: [
      { key: 'fe', label: 'Fe content', value: jitter(60.1, 0.8, 59.3, 60.8), unit: '%', decimals: 1, target: 'Target 59 – 61 %' },
      { key: 'ccs', label: 'Cold crushing strength', value: jitter(255, 30, 215, 290), unit: 'kg/pellet', decimals: 0, target: 'Minimum 180 kg/pellet' },
      { key: 'tumbler', label: 'Tumbler index', value: grate ? jitter(94.5, 0.6, 94.1, 94.9) : jitter(93.6, 1.6, 92.6, 94.8), unit: '%', decimals: 1, target: grate ? 'Target 94 – 95 %' : 'Target 92 – 95 %' },
    ],
    gauges: [
      { key: 'abrasion', label: 'Abrasion index', unit: '%', decimals: 1,
        value: grate ? jitter(3, 0.6, 2.6, 3.4) : jitter(5.9, 1.2, 5.2, 6.8), min: 0, max: grate ? 5 : 9, from: grate ? 2.5 : 5, to: grate ? 3.5 : 7 },
      { key: 'cracked', label: 'Cracked pellets', unit: '%', decimals: 1,
        value: grate ? jitter(2.6, 1.4, 1.2, 4) : jitter(7.4, 2, 5.5, 9.2), min: 0, max: 15, from: 0, to: 10 },
    ],
  }
}
