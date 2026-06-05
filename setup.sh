#!/bin/bash
set -e

echo "=== FORGE Setup ==="
cd /workspaces/GH

# Create folder structure
mkdir -p app/api/ai/generate-plan
mkdir -p components/ui
mkdir -p components/forge
mkdir -p components/planes
mkdir -p components/encuestas
mkdir -p components/radar
mkdir -p lib
mkdir -p public

# Move app files
[ -f globals.css ]  && mv globals.css  app/
[ -f layout.tsx ]   && mv layout.tsx   app/
[ -f page.tsx ]     && mv page.tsx     app/
[ -f route.ts ]     && mv route.ts     app/api/ai/generate-plan/

# Move lib files
[ -f store.ts ]     && mv store.ts     lib/
[ -f utils.ts ]     && mv utils.ts     lib/

# Move UI components
for f in button.tsx input.tsx textarea.tsx label.tsx select.tsx dialog.tsx tabs.tsx badge.tsx avatar.tsx progress.tsx scroll-area.tsx separator.tsx switch.tsx checkbox.tsx dropdown-menu.tsx alert.tsx sheet.tsx tooltip.tsx popover.tsx radio-group.tsx; do
  [ -f "$f" ] && mv "$f" components/ui/
done

# Move forge components
for f in forge-layout.tsx forge-sidebar.tsx forge-topbar.tsx forge-ui.tsx index.ts; do
  [ -f "$f" ] && mv "$f" components/forge/
done

# Move planes components
for f in planes-module.tsx planes-metricas.tsx plan-wizard.tsx plan-detail.tsx voice-ai-assistant.tsx; do
  [ -f "$f" ] && mv "$f" components/planes/
done

# Move encuestas components
for f in encuestas-module.tsx encuesta-editor.tsx encuesta-resultados.tsx lanzamiento-detail.tsx; do
  [ -f "$f" ] && mv "$f" components/encuestas/
done

# Move radar components
[ -f radar-module.tsx ] && mv radar-module.tsx components/radar/

echo "=== Instalando dependencias ==="
npm install

echo "=== Iniciando servidor ==="
npm run dev
