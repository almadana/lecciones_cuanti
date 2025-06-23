'use client';

interface ClockyProps {
  cx: number;
  cy: number;
  radius: number;
  hours: number;
  min: number;
  max: number;
}

export default function Clocky({ cx, cy, radius, hours, min, max }: ClockyProps) {
  // Normalizar las horas al rango [0, 1]
  const normalizedHours = (hours - min) / (max - min);
  
  // Calcular el ángulo para la manecilla (12 en punto es -90 grados, gira en sentido horario)
  const angle = -90 + (normalizedHours * 360);
  
  // Calcular el punto final de la manecilla
  const handLength = radius * 0.8; // La manecilla es 80% del radio
  const endX = cx + handLength * Math.cos(angle * Math.PI / 180);
  const endY = cy + handLength * Math.sin(angle * Math.PI / 180);

  return (
    <g>
      {/* Círculo exterior del reloj */}
      <circle 
        cx={cx} 
        cy={cy} 
        r={radius}
        fill="none"
        stroke="#8c7ddc"
        strokeWidth="0.5"
        opacity="0.3"
      />
      
      {/* Marca de las 12 */}
      <line
        x1={cx}
        y1={cy - radius + 2}
        x2={cx}
        y2={cy - radius + 4}
        stroke="#8c7ddc"
        strokeWidth="0.5"
        opacity="0.3"
      />
      
      {/* Manecilla */}
      <line
        x1={cx}
        y1={cy}
        x2={endX}
        y2={endY}
        stroke="#8c7ddc"
        strokeWidth="0.5"
        opacity="0.3"
      />
      
      {/* Centro del reloj */}
      <circle
        cx={cx}
        cy={cy}
        r={1}
        fill="#8c7ddc"
        opacity="0.3"
      />
    </g>
  );
} 