# GitHub Pages Starter Kit

Este repositorio contiene una base mínima de archivos lista para publicarse con GitHub Pages. Úsalo como punto de partida para sitios estáticos rápidos (landing pages, micrositios, documentación sin build) y adáptalo a cualquier marca o contenido.

Los archivos clave son:

- `index.html`: estructura del sitio (HTML + estilos inline para no depender de un build).
- `favicon.png`: ícono por defecto (cámbialo por el tuyo).
- `.nojekyll`: obliga a GitHub Pages a servir los archivos tal cual, sin procesar Jekyll.
- `LICENSE`: MIT para que puedas reutilizar el starter sin fricción.
- `scripts/sync-site.sh`: script opcional para sincronizar los assets publicados a otros repos.

---

## Crea un repositorio "upstream" reutilizable

1. Crea un repositorio nuevo en tu cuenta/organización, por ejemplo `pages-starter`.
2. Usa este branch como base (clona, cambia el remote y haz `git push` al nuevo repo) o en GitHub crea el repo con la opción **Import code** apuntando a esta URL.
3. Habilita GitHub Pages en ese nuevo repo (Branch `main`, carpeta **/ (root)**). Será tu origen central de verdad del starter.

> Cada vez que mejores el starter, haz commit en ese repo upstream y etiqueta versiones (`v1.0.0`, `v1.1.0`, etc.) para que otros proyectos decidan cuándo actualizar.

---

## Reutilizar el starter en otros proyectos

Empieza con la estrategia más simple y escala sólo si necesitas mantener muchas copias sincronizadas.

### 1. Repositorio plantilla (onboarding más rápido)

1. En el repo upstream abre *Settings* → marca **Template repository**.
2. En cada proyecto nuevo haz clic en **Use this template** → **Create a new repository**. Obtendrás una copia independiente lista para GitHub Pages.
3. Ajusta contenidos, estilos, imágenes, copy, etc. a la necesidad del proyecto.
4. Sigue la sección [Publicar manualmente en GitHub Pages](#publicar-manualmente-en-github-pages) para poner el sitio en producción.

> Útil cuando cada equipo quiere personalizar libremente su versión y no necesita mantener sincronía estricta.

### 2. Submódulo Git (dependencia versionada)

1. Desde el repo destino agrega el submódulo, idealmente en una carpeta `vendor/pages-starter`:

   ```bash
   git submodule add https://github.com/<tu-usuario>/pages-starter.git vendor/pages-starter
   git commit -am "Add pages starter submodule"
   ```

2. Copia los archivos públicos a la raíz del repo destino (el script usa `rsync` y deja intactos tus otros archivos):

   ```bash
   ./vendor/pages-starter/scripts/sync-site.sh .
   git status  # revisa qué se va a commitear
   ```

3. Activa GitHub Pages en el repo destino → *Settings* → *Pages* → **Deploy from a branch** → Branch `main`, carpeta **/ (root)**.
4. Para actualizar en el futuro:

   ```bash
   git submodule update --remote vendor/pages-starter
   ./vendor/pages-starter/scripts/sync-site.sh .
   ```

> Aconsejable si quieres centralizar el HTML/CSS y controlar qué versión usa cada proyecto.

### 3. Git subtree (sin dependencias adicionales)

1. Agrega el repo upstream como remoto temporal y trae el contenido dentro de `vendor/pages-starter`:

   ```bash
   git remote add pages-starter https://github.com/<tu-usuario>/pages-starter.git
   git subtree add --prefix vendor/pages-starter pages-starter main
   ```

2. Copia los archivos publicados a tu raíz:

   ```bash
   ./vendor/pages-starter/scripts/sync-site.sh .
   ```

3. Cuando haya actualizaciones:

   ```bash
   git subtree pull --prefix vendor/pages-starter pages-starter main
   ./vendor/pages-starter/scripts/sync-site.sh .
   ```

> El enfoque subtree funciona sin submódulos y mantiene un historial lineal.

### 4. Copia manual (para uno o dos sitios)

Si sólo necesitas un clon ocasional, copia los archivos a mano o usa `scripts/sync-site.sh` apuntando al directorio del nuevo proyecto.

```bash
./scripts/sync-site.sh /ruta/al/proyecto
```

Haz commit en el repo destino con los archivos resultantes y publica en Pages.

### Personaliza tu copia

Edita libremente `index.html`, reemplaza imágenes, agrega CSS/JS, cambia el texto y ajusta el favicon. Si no quieres que futuras sincronizaciones sobrescriban algo, haz tus cambios después de copiar o exclúyelos del script.

---

## Publicar manualmente en GitHub Pages

1. En el repo destino (que ya contiene los archivos) ve a GitHub → *Settings* → *Pages*.
2. En **Source** selecciona **Deploy from a branch**.
3. En **Branch** elige `main` y la carpeta **/ (root)**. Guarda.
4. Espera a que se genere el sitio. GitHub mostrará la URL pública (ej. `https://<usuario>.github.io/<repo>/`).

> Para usar un dominio propio, crea un archivo `CNAME` con tu dominio (ej. `site.midominio.com`) y configura un registro DNS tipo CNAME apuntando a `username.github.io`.

---

## ¿Y si quiero una "test page" por branch?

Si acostumbrabas a previsualizar cambios desde una rama antes de fusionarla, puedes mantener ese flujo incluso usando este starter.

### 1. Rama dedicada a QA

1. Crea una rama específica (ej. `qa` o `preview/<feature>`).
2. Sube los cambios a esa rama y ve a *Settings* → *Pages*.
3. Temporalmente, apunta **Source** → **Deploy from a branch** a la rama de QA y carpeta **/ (root)**.
4. GitHub publicará una URL sólo para esa rama. Cuando valides los cambios, regresa la configuración a `main`.

### 2. Previews automáticos con GitHub Actions

Para no tocar la configuración manualmente, puedes añadir un workflow que genere una preview por cada branch/PR usando GitHub Pages Deploy (Actions).

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches: ["main"]
  pull_request:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v3
      - uses: actions/upload-pages-artifact@v2
        with:
          path: '.'

  deploy:
    needs: build
    if: github.event_name == 'push'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2

  preview:
    needs: build
    if: github.event_name == 'pull_request'
    environment:
      name: github-pages
    runs-on: ubuntu-latest
    steps:
      - name: Deploy preview
        uses: actions/deploy-pages@v2
        with:
          preview: true
```

Ese workflow despliega `main` como producción y, cuando se abre un PR, genera una URL de preview asociada a la rama. Si prefieres mantener el repositorio sin Actions, copia sólo la sección de rama dedicada.

---

## Desarrollo local

Abre `index.html` directamente en tu navegador. No necesita dependencias ni proceso de build.

---

## Licencia

MIT. ¡Adáptalo a tus proyectos!
