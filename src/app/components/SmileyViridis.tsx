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
  
  // Cuadrática: con y creciendo hacia abajo en SVG, la sonrisa pide el control *por debajo* de la cuerda
  // (mayor y) cuando happiness sube; el ceño, control *por encima* (menor y).
  const smileCurve = () => {
    const smileRadius = radius * 0.6
    const smileOffset = radius * 0.25
    const smileHeight = radius * 1.2 * (happiness - 0.5)
    return `M ${cx - smileRadius} ${cy + smileOffset} 
            Q ${cx} ${cy + smileOffset + smileHeight}, 
              ${cx + smileRadius} ${cy + smileOffset}`
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