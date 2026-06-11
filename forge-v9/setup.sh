#!/bin/bash
# FORGE v9 — Setup script
# Cambios DRF v1.1 (11 jun 2026):
# - Planes: metaTrazada y beneficioEsperado eliminados
# - Planes: Formación For+ eliminada del wizard
# - Planes: Matriz de actividades simplificada (hallazgo, compromiso, fechaCompromiso, evidencia)
# - Planes: Adjuntos en seguimientos
# - Planes: Cierre simplificado (un solo campo criterio)
# - Evaluaciones: Tipos simplificados a 'prorroga' | 'otro'
# - Evaluaciones: fechaInicioEncuesta, fechaCierreEncuesta, resultadoMinimoEsperado

set -e
echo "=== FORGE v9 Setup ==="

DEST="forge-app"
mkdir -p $DEST/app $DEST/components/planes $DEST/components/encuestas $DEST/components/radar $DEST/components/forge $DEST/components/ui $DEST/lib

# Config files
cp package.json $DEST/
cp package-lock.json $DEST/
cp next.config.js $DEST/
cp tailwind.config.js $DEST/
cp postcss.config.js $DEST/
cp tsconfig.json $DEST/

# App files
cp layout.tsx $DEST/app/layout.tsx
cp page.tsx $DEST/app/page.tsx
cp globals.css $DEST/app/globals.css
cp next-env.d.ts $DEST/next-env.d.ts

# API route
mkdir -p $DEST/app/api/claude
cp route.ts $DEST/app/api/claude/route.ts

# Lib
cp store.ts $DEST/lib/store.ts
cp utils.ts $DEST/lib/utils.ts
cp index.ts $DEST/lib/index.ts

# Forge components
cp forge-layout.tsx $DEST/components/forge/forge-layout.tsx
cp forge-sidebar.tsx $DEST/components/forge/forge-sidebar.tsx
cp forge-topbar.tsx $DEST/components/forge/forge-topbar.tsx
cp forge-ui.tsx $DEST/components/forge/forge-ui.tsx

# Planes components
cp planes-module.tsx $DEST/components/planes/planes-module.tsx
cp plan-wizard.tsx $DEST/components/planes/plan-wizard.tsx
cp plan-detail.tsx $DEST/components/planes/plan-detail.tsx
cp planes-metricas.tsx $DEST/components/planes/planes-metricas.tsx
cp voice-ai-assistant.tsx $DEST/components/planes/voice-ai-assistant.tsx

# Evaluaciones components
cp encuestas-module.tsx $DEST/components/evaluaciones/encuestas-module.tsx
cp encuesta-editor.tsx $DEST/components/evaluaciones/encuesta-editor.tsx
cp encuesta-resultados.tsx $DEST/components/evaluaciones/encuesta-resultados.tsx
cp lanzamiento-detail.tsx $DEST/components/evaluaciones/lanzamiento-detail.tsx

# Radar components
cp radar-module.tsx $DEST/components/radar/radar-module.tsx

# UI components (shadcn)
for f in alert avatar badge button checkbox dialog dropdown-menu input label popover progress radio-group scroll-area select separator sheet switch tabs textarea tooltip; do
  [ -f "${f}.tsx" ] && cp "${f}.tsx" "$DEST/components/ui/${f}.tsx"
done

echo "=== Build started ==="
cd $DEST
npm install --silent
npm run build
echo "=== FORGE v9 ready ==="
