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
  
  // Calcular el color de los ojos y boca basado en el nivel de felicidad
  // Para valores bajos usar blanco, para valores altos usar negro
  const getFaceColor = () => {
    if (happiness < 0.3) {
      return 'white' // Blanco para valores bajos (colores oscuros de fondo)
    } else {
      return 'black' // Negro para valores altos (colores claros de fondo)
    }
  }
  
  const faceColor = getFaceColor()
  
  // Calcular la curva de la sonrisa basada en el nivel de felicidad
  const smileCurve = () => {
    const smileRadius = radius * 0.6
    const smileOffset = radius * 0.25 // Aumentamos de 0.1 a 0.25 para mover la boca más abajo
    // Exagerar aún más la curvatura para expresiones más dramáticas
    const smileHeight = radius * 1.2 * (happiness - 0.5) // Aumentamos de 0.8 a 1.2
    
    // Para valores bajos (< 0.3), hacer una curva hacia abajo (triste)
    // Para valores medios (0.3-0.7), hacer una línea recta
    // Para valores altos (> 0.7), hacer una curva hacia arriba (feliz)
    if (happiness < 0.3) {
      // Cara triste - curva hacia abajo con arco más pronunciado
      return `M ${cx - smileRadius} ${cy + smileOffset} 
              Q ${cx} ${cy + smileOffset - Math.abs(smileHeight)}, 
                ${cx + smileRadius} ${cy + smileOffset}`
    } else if (happiness > 0.7) {
      // Cara feliz - curva hacia arriba con arco más pronunciado
      return `M ${cx - smileRadius} ${cy + smileOffset} 
              Q ${cx} ${cy + smileOffset + Math.abs(smileHeight)}, 
                ${cx + smileRadius} ${cy + smileOffset}`
    } else {
      // Cara neutral - línea recta horizontal
      return `M ${cx - smileRadius} ${cy + smileOffset} 
              L ${cx + smileRadius} ${cy + smileOffset}`
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
        stroke="#8c7ddc"
        strokeWidth="0.2"
      />
      
      {/* Ojos */}
      <ellipse 
        cx={cx - radius * 0.3} 
        cy={cy - radius * 0.2} 
        rx={eyes.rx} 
        ry={eyes.ry} 
        fill={faceColor} 
      />
      <ellipse 
        cx={cx + radius * 0.3} 
        cy={cy - radius * 0.2} 
        rx={eyes.rx} 
        ry={eyes.ry} 
        fill={faceColor} 
      />
      
      {/* Sonrisa */}
      <path 
        d={smileCurve()} 
        fill="transparent" 
        stroke={faceColor} 
        strokeWidth="1.5" 
      />
    </g>
  )
} 