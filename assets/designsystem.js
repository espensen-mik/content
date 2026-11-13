/* Designsystem-siden: farveprøver, typografi-lab og komponentliste */
(() => {
const { $, css, setV } = window.Lykke;
const ART = '/longreads/musikstjerner/';

/* ---- farver ---- */
const SW = [['--ink','Navy · #163358','Overskrifter, topbjælke og scene-kapitler'],['--teal','Teal · #00a182','Knapper, aktive tilstande, fakta-tal'],['--coral','Coral · #df6763','Hjertet: spornumre, fremhævet ord, citat'],['--olive','Oliven · #323629','Brødtekst på sand'],['--grey','Grå · #d5d1cd','Sekundær tekst på scenen, skillelinjer'],['--mint','Mint · #b6e2d5','Faktabokse, menneske-del i cases'],['--mint-2','Mint 2 · #89d1bc','Spotlys: labels og fokus på scenen'],['--mint-3','Mint 3 · #5dc0a3','Bølgeformer og grafik'],['--green','Grøn · #5a9e84','Grafik og illustrationer, sparsomt'],['--paper','Sand · #f9eedc','Bærende papirfarve i hele artiklen'],['--sand','Dyb sand','Skift mellem sand-kapitler'],['--paper-2','Lys sand','Kort, cases og bokse på sand'],['--teal-ink','Teal tekst','Links og små labels (afledt)'],['--coral-ink','Coral tekst','Eyebrows og små coral-tekster (afledt)']];
function lum(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const [r, g, b] = [0, 2, 4].map(i => { const v = parseInt(h.substr(i, 2), 16) / 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4) }); return .2126 * r + .7152 * g + .0722 * b }
$('#swatches').innerHTML = SW.map(([v, n, u]) => { const fg = lum(css(v)) < .25 ? '#f9eedc' : '#163358'; return `<div class="sw"><div class="chip" style="background:var(${v});color:${fg}">Aa</div><div class="meta"><b>${v}</b>${n}<span>${u}</span></div></div>` }).join('');

/* ---- bredde-lab ---- */
const wd = $('#wdth'), wg = $('#wght'), ws = $('#wdthSample');
function wl() { ws.style.fontVariationSettings = `"wdth" ${wd.value}`; ws.style.fontWeight = wg.value; $('#wdthOut').textContent = wd.value; $('#wghtOut').textContent = wg.value; setV(wd); setV(wg) }
[wd, wg].forEach(i => i.addEventListener('input', wl)); wl();

/* ---- komponenter ---- */
const COMPS = [
 ['Hero med stående video','media','Åbner artiklen med titel og ingress ved siden af en lydløs, stående Mux-video, der kører i loop. Knappen leder til videoen med lyd.',['Titel i versaler, ét nøgleord animeret','Mux Player uden kontroller, lydløs, i loop','Står under titlen på mobil'],''],
 ['Afspilningslinje','play','Topbjælke der viser læsefremdrift som spilletid med markeringer for hvert spor.',['Læsetid omregnet til mm:ss','Spormarkeringer følger kapitlerne','Altid synlig, aldrig klikbar'],'spor-1'],
 ['Kapitel-åbner','read','Spornummer i kontur, spilletid og kapiteltitel. Bølgeformen fyldes, når man ruller.',['Nummerering følger rækkefølgen','Spilletid = kapitlets læsetid','Én pr. kapitel'],'spor-1'],
 ['Brødtekst og ordforklaring','read','19px tekst i læsekolonnen med initial i første afsnit og klikbare fagord.',['Initial kun i kapitlets første afsnit','Ordforklaring første gang et fagord bruges','Maks 68 tegn pr. linje'],'spor-1'],
 ['Faktaboks','read','Kort forklaring med op til tre tal. Svæver ved siden af teksten på desktop.',['Maks 40 ord','Højst tre tal med kort label','Tal skal have kilde i metodeboksen'],'faktaboks'],
 ['Musikvideo, stående','media','Telefonvideo i 4:5 i Mux Player på en navy scene med titel, kunstner og credits ved siden af.',['Starter kun ved klik, med lyd','Credits viser, hvad AI lavede','Mærket "Lavet med hjælp fra AI"'],'optur'],
 ['Triptykon','media','Tre stående stills side om side, hentet direkte fra Mux. Den bedste måde at vise telefonvideo som billeder.',['Altid 4:5','Midterste billede forskudt','To billeder på mobil'],'triptykon'],
 ['Foto, fuld bredde','media','Stort billede, der bryder læsekolonnen og giver pause.',['21:9 på desktop, mindst 240px højt','Billedtekst under, med mono-label','Højst ét pr. kapitel'],'spor-1'],
 ['Karaoke-citat','play','Spillerens citat lyser op ord for ord, mens man ruller. Nøgleordet bliver coral.',['Citat på maks 20 ord','Navn, alder og position','Ét pr. kapitel'],'citat'],
 ['Workshop-case','media','En proces fortalt i trin med rigtige fotos. Hvert trin er et billede med en notelap, der lander på billedet, og trin-chips der følger med.',['3–5 trin, ét foto pr. trin','Kort tekst på notelappen','Billeder i 800 og 1600 px'],'workshop'],
 ['Filmstrimmel','media','Vandret galleri med blandede formater og tæller.',['3–8 billeder','Mix af 3:2 og 4:5','Kan styres med pile og tastatur'],'filmstrip'],
 ['Scrollytelling','play','Fast figur, der skifter, mens tekst-trin ruller forbi. Til processer med 3–5 trin.',['Hvert trin kan læses alene','Figur står øverst på mobil','Trin mærket menneske eller AI'],'scrolly'],
 ['Prompt-mixer','play','Læseren skruer på genre, tempo og energi og ser prompten blive bygget. Lyd kun ved klik.',['Forklarer et begreb, ikke pynt','Tydeligt hvad der er AI, og hvad der ikke er','Ét interaktivt modul pr. kapitel'],'mixer'],
 ['Danmarkskort','media','Enkelt kort, der viser hvor holdene kommer fra. Nål med bynavn på kortet og holdene i en liste ved siden af.',['Byer fra lykkeliga.dk, ingen kontaktdata','Kun bynavn på nålene, holdnavne i listen','Ren illustration uden afspilning'],'holdkort'],
 ['Albumafspiller','play','Alle projektets sange som en plade: cover med vinyl, der glider ud og drejer, farvetone fra coveret og en nummerliste.',['Starter kun ved klik','Næste sang spiller automatisk','Virker med låseskærm og tastatur'],'albummet'],
 ['Biograf','media','Musikvideoer i 16:9 på en mørk scene. Titelkort på plakaten, lysskær fra billedet og en filmrulle med levende forhåndsvisning.',['Mux Player, starter kun ved klik','Forhåndsvisning hentes først ved hover','Kun én lyd ad gangen på siden'],'musikvideoer'],
 ['Forskningsboks','read','Fremhæver forskning eller kilder: en kort forklaring, citatet stort og den fulde reference nederst.',['Citatet på originalsproget','Fuld kildehenvisning','Højst én pr. kapitel'],'forskning'],
 ['Erfaringsboks','read','Samler projektets erfaringer i nummererede kort på mint. Det første kort kan fylde hele bredden.',['3–8 erfaringer','Kort overskrift, så forklaring','Placeres mod slutningen'],'erfaringer'],
 ['Liner notes','read','Credits i albumstil med medvirkende og værktøjer.',['Altid sidst','Nævn værktøjstyper','Fotografer krediteres'],'credits']
];
const KL = { read: 'Læsning', media: 'Medier', play: 'Leg' };
$('#compList').innerHTML = COMPS.map(([n, k, d, r, id]) => `<article class="comp"><header><h3>${n}</h3><span class="kind ${k}">${KL[k]}</span></header><p>${d}</p><ul>${r.map(x => `<li>${x}</li>`).join('')}</ul><a class="go" href="${ART}${id ? '#' + id : ''}">Se i artiklen →</a></article>`).join('');
})();
