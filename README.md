# LykkeLiga Content

Long reads og andet custom content til LykkeLiga. Siderne er almindelig statisk HTML, CSS og JavaScript. Der er intet byggetrin, og det hele kan hostes på Vercel.

## Struktur

```
index.html                          Forside med oversigt over indhold
longreads/<slug>/index.html         Én mappe pr. long read
designsystem/index.html             Designsystemet: farver, typografi, grid og komponenter
assets/lykke.css                    Tokens og alle komponenter (fælles for alle sider)
assets/lykke.js                     Komponent-adfærd (starter kun, hvis markup findes)
assets/designsystem.js              Kun til designsystem-siden
vercel.json                         Pæne URL'er, cache og noindex
```

## Ny long read

1. Kopiér `longreads/musikstjerner/` til `longreads/<ny-slug>/`.
2. Skift tekster og medier. Sidens eget indhold (ordforklaringer, mixer, videokapitler) ligger i `window.LYKKE` nederst i filen.
3. Sæt `data-minutes` på `<main class="article">` til læsetiden.
4. Tilføj et kort på forsiden (`index.html`).

## Video med Mux

Video afspilles med [Mux Player](https://www.mux.com/player), som indlæses fra jsDelivr i en fast version:

```html
<script src="https://cdn.jsdelivr.net/npm/@mux/mux-player@3.14.1" defer></script>
<mux-player playback-id="DIT_PLAYBACK_ID" accent-color="#df6763"></mux-player>
```

Stills og postere hentes direkte fra Mux:
`https://image.mux.com/<PLAYBACK_ID>/thumbnail.webp?time=31&width=900`

## Cache

Siderne henter CSS og JS med et versionsnummer, fx `/assets/lykke.js?v=202611131407`. Når `assets/` ændres, skal tallet opdateres i alle `index.html`-filer, så browsere ikke bruger en gammel kopi sammen med ny HTML.

## Lokalt

```bash
python3 -m http.server 8766
```

Åbn http://localhost:8766

## Udgivelse

Repoet forbindes til Vercel (Add New → Project → importér `content` fra GitHub). Ingen build-indstillinger er nødvendige. Hvert push til `main` udgives, og andre branches får en preview-adresse.

Alle sider har `noindex`, indtil vi er klar til at udgive. Fjern det fra `vercel.json` og sidernes `<meta name="robots">`, når indholdet må findes i søgemaskiner.
