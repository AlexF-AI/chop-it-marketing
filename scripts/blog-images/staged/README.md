# Staged image configs

Ready-to-run configs for pages that ranked below the first build wave.
To activate one: move it into ../configs/, check its data against the
article it belongs to, run `npm run generate:blog-images -- <name>`,
insert the image into the page with alt text, and bump that page's
dateModified in the registry (app/lib/blog.ts or app/lib/resources.ts).
