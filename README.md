# Foco Único — Mapa mental de proyectos

Aplicación web local para sacar proyectos e ideas de la cabeza y organizarlos visualmente en un mapa mental. No incluye temporizador.

## Funcionalidades
- Mapa visual con nodo central y tarjetas conectadas.
- Crear tarjetas de tipo proyecto, idea o pendiente.
- Añadir tarjetas relacionadas y establecer conexiones.
- Arrastrar tarjetas libremente por el lienzo.
- Editar, eliminar y cambiar estado/color.
- Búsqueda en el mapa y vista de todas las tarjetas.
- Filtros por estado: en marcha, en espera y completadas.
- Descarga mental: guardar notas y convertir cada línea en una tarjeta.
- Persistencia local en el navegador.
- Exportar e importar copias JSON.
- Diseño responsive para escritorio, tablet y móvil.

## Estructura
- `index.html`: estructura y pantallas.
- `styles.css`: diseño y mapa visual.
- `app.js`: lógica del mapa, tarjetas y persistencia.
- `privacy.html`, `cookies.html`, `legal.html`: plantillas legales.

## Instalación
No requiere Node.js ni dependencias. Descomprime el ZIP y abre `index.html` en un navegador moderno. Para servirlo localmente:
```bash
python -m http.server 8000
```
Abre `http://localhost:8000`.

## Despliegue
Es una aplicación estática. Puedes publicarla en Netlify, Vercel, GitHub Pages o un servidor web.

## Requisitos y almacenamiento
Navegador moderno con JavaScript y localStorage habilitados. Los datos permanecen en el navegador y no se sincronizan entre dispositivos. Usa **Exportar** para guardar una copia y **Ajustes > Importar copia** para restaurarla.

## Privacidad y legal
La aplicación no envía tarjetas ni notas a un servidor. Las páginas legales contienen marcadores que deben completarse y revisarse antes de un uso comercial. La aplicación utiliza almacenamiento local del navegador, no cookies publicitarias ni analíticas propias.

## Limitaciones
- No sincroniza datos entre dispositivos.
- Las conexiones se representan visualmente; no hay colaboración multiusuario.
- En móvil el lienzo puede requerir desplazamiento horizontal y vertical.
