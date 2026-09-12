# Lecciones Cuanti v2

Sitio de lecciones interactivas de estadística para Psicología. Las nuevas lecciones se construyen como historias breves: pregunta, predicción, datos, conflicto, herramienta, conclusión y transferencia.

## Desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). `next.config.js` activa la exportación estática solamente en producción, para que el modo de desarrollo no dependa de manifiestos de un build anterior.

Verificación:

```bash
npx tsc --noEmit
npx eslint src/app
```

## Contrato narrativo

Los componentes reutilizables están en `src/app/components/narrative/LessonStory.tsx`:

1. `LessonStory`: portada y ancho general.
2. `StoryBeat`: una escena con texto y visualización.
3. `PredictionPrompt`: compromiso inicial antes de revelar una explicación.
4. `StoryConclusion`: afirmación que los datos permiten sostener.
5. `TransferTask`: aplicación a una situación nueva.
6. `DataAttribution`: origen, licencia y transformaciones de los datos.

Una lección nueva debería presentar una idea principal en 6–8 escenas y reservar las fórmulas para el momento en que resuelven un problema ya visible. Las interacciones deben pedir predecir, clasificar, comparar o simular; no ser decorativas.

## Sistema visual y accesibilidad

- Poppins en títulos y Roboto en cuerpo, con fallbacks del sistema para que el desarrollo no dependa de una descarga del servidor.
- Tokens de color, superficie, foco y espaciado en `src/app/globals.css`.
- Violeta, lavanda y verde de Cuanti; fondos claros y bordes visibles.
- Controles operables por teclado, foco visible y respeto por `prefers-reduced-motion`.
- Visualizaciones anchas dentro de contenedores con desplazamiento horizontal en pantallas pequeñas.

El currículo vive en `src/app/data/curriculum.ts` y alimenta tanto la portada como el índice lateral. No dupliques las rutas en otro arreglo.
