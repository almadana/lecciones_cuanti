'use client'

import * as d3 from 'd3'

interface SmileyProps {
  cx: number
  cy: number
  radius?: number
  happiness: number // valor entre 0 y 1
}

export default function SmileyViridis({ cx, cy, radius = 18, happiness }: SmileyProps) {
  // Escala de colores viridis
  const color = d3.interpolateViridis(happiness)
  
  // Calcular la curva de la sonrisa basada en el nivel de felicidad
  const smileCurve = () => {
    const smileRadius = radius * 0.6
    const smileOffset = radius * 0.1
    // Ajustar para que valores bajos den cara triste y altos cara feliz
    const smileHeight = radius * 0.4 * (happiness - 0.5) // Aumentamos el factor a 0.4 para expresiones más marcadas
    
    // Para valores bajos (< 0.3), hacer una curva hacia abajo
    // Para valores medios (0.3-0.7), hacer una línea casi recta
    // Para valores altos (> 0.7), hacer una curva hacia arriba
    if (happiness < 0.3) {
      // Cara triste - curva hacia abajo
      return `M ${cx - smileRadius} ${cy + smileOffset} 
              Q ${cx} ${cy + smileOffset - smileHeight}, 
                ${cx + smileRadius} ${cy + smileOffset}`
    } else if (happiness > 0.7) {
      // Cara feliz - curva hacia arriba
      return `M ${cx - smileRadius} ${cy + smileOffset} 
              Q ${cx} ${cy + smileOffset + smileHeight}, 
                ${cx + smileRadius} ${cy + smileOffset}`
    } else {
      // Cara neutral - casi recta con ligera curvatura
      const neutralHeight = radius * 0.1 * (happiness - 0.5)
      return `M ${cx - smileRadius} ${cy + smileOffset} 
              Q ${cx} ${cy + smileOffset + neutralHeight}, 
                ${cx + smileRadius} ${cy + smileOffset}`
    }
  }

  // Ajustar los ojos según el nivel de felicidad
  const eyeShape = () => {
    const baseRx = radius * 0.12
    const baseRy = radius * 0.16

    if (happiness < 0.3) {
      // Ojos más cerrados y angulados para tristeza
      return {
        rx: baseRx * 0.8,
        ry: baseRy * 0.7
      }
    } else if (happiness > 0.7) {
      // Ojos más abiertos para felicidad
      return {
        rx: baseRx * 1.2,
        ry: baseRy * 1.1
      }
    } else {
      // Ojos normales para expresión neutral
      return {
        rx: baseRx,
        ry: baseRy
      }
    }
  }

  const eyes = eyeShape()

  return (
    <g>
      {/* Círculo principal */}
      <circle 
        cx={cx} 
        cy={cy} 
        r={radius} 
        fill={color}
        stroke="black"
        strokeWidth="0.2"
      />
      
      {/* Ojos */}
      <ellipse 
        cx={cx - radius * 0.3} 
        cy={cy - radius * 0.2} 
        rx={eyes.rx} 
        ry={eyes.ry} 
        fill="black" 
      />
      <ellipse 
        cx={cx + radius * 0.3} 
        cy={cy - radius * 0.2} 
        rx={eyes.rx} 
        ry={eyes.ry} 
        fill="black" 
      />
      
      {/* Sonrisa */}
      <path 
        d={smileCurve()} 
        fill="transparent" 
        stroke="black" 
        strokeWidth="0.2" 
      />
    </g>
  )
} 