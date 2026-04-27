export default function Ring({ progress, color, size = 280 }) {
  const stroke = 5;
  const r = (size - stroke * 2) / 2;       // radio
  const circ = 2 * Math.PI * r;             // circunferencia
  const offset = circ * (1 - progress);     // cuánto ocultar

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)" }} // empieza arriba, no a la derecha
    >
      {/* Anillo de fondo (gris tenue) */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />

      {/* Anillo de progreso */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.5s ease, stroke 0.6s ease",
        }}
      />
    </svg>
  );
}