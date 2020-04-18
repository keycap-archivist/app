# Too much artisans ![Build](https://github.com/zekth/too-much-artisans/workflows/Image%20Build/badge.svg?branch=master&event=push)

accessible here : [https://artisans.mechanical-keyboards.fr/](https://artisans.mechanical-keyboards.fr/).

It uses https://github.com/zekth/too-much-artisans-db artifacts

Documentation available here : [https://artisans.mechanical-keyboards.fr/](https://artisans.mechanical-keyboards.fr/api)

# Development

Project uses Lerna

```bash
# Setup env
yarn
# Install env
npx lerna bootstrap
# Start API and UI
npx lerna run serve --parallel
# UI exposed on 8080 and API on 3000
```
