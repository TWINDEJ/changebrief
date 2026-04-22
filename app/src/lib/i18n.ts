export type Locale = 'en' | 'sv';

const translations = {
  // ─── Header ───
  'header.plan.free': { en: 'Free', sv: 'Gratis' },
  'header.plan.pro': { en: 'Pro', sv: 'Pro' },
  'header.plan.team': { en: 'Team', sv: 'Team' },
  'header.upgrade': { en: 'Upgrade', sv: 'Uppgradera' },
  'header.signout': { en: 'Sign out', sv: 'Logga ut' },

  // ─── Dashboard sections ───
  'dashboard.monitored': { en: 'Monitored pages', sv: 'Bevakade sidor' },
  'dashboard.monitored.desc': { en: 'Add a URL and we\'ll check it every 6 hours for changes.', sv: 'Lägg till en URL så kollar vi den var 6:e timme efter ändringar.' },
  'dashboard.monitored.count': { en: 'pages used', sv: 'sidor använda' },
  'dashboard.popular': { en: 'Popular watchlists', sv: 'Populära bevakningar' },
  'dashboard.popular.desc': { en: 'One-click add pages that many teams monitor.', sv: 'Lägg till populära sidor med ett klick.' },
  'dashboard.changes': { en: 'Recent changes', sv: 'Senaste ändringar' },
  'dashboard.changes.desc': { en: 'AI-powered summaries of what changed. Score shows how important the change is (1 = minor, 10 = critical).', sv: 'AI-drivna sammanfattningar av vad som ändrades. Poäng visar hur viktig ändringen är (1 = liten, 10 = kritisk).' },
  'dashboard.settings': { en: 'Notification settings', sv: 'Notisinställningar' },
  'dashboard.settings.desc': { en: 'Choose how you want to be notified when changes are detected.', sv: 'Välj hur du vill bli notifierad när ändringar upptäcks.' },

  // ─── Add URL form ───
  'form.placeholder.url': { en: 'https://example.com/pricing', sv: 'https://example.com/pricing' },
  'form.placeholder.name': { en: 'Name (e.g. Stripe Pricing)', sv: 'Namn (t.ex. Stripe Pricing)' },
  'form.add': { en: 'Add', sv: 'Lägg till' },
  'form.success': { en: 'Monitoring started — first check runs within the hour.', sv: 'Bevakning startad — första kontrollen körs inom en timme.' },
  'form.success.queued': { en: 'Monitoring started — first check is running now (ready in about 2 min).', sv: 'Bevakning startad — första kontrollen körs nu (klar om ca 2 min).' },
  'form.limit': { en: 'You\'ve reached your plan\'s limit of monitored pages.', sv: 'Du har nått din plans gräns för bevakade sidor.' },
  'form.upgrade': { en: 'Upgrade to Pro for 25 pages', sv: 'Uppgradera till Pro för 25 sidor' },
  'form.advanced': { en: 'Advanced: monitor pages behind login, target specific elements', sv: 'Avancerat: bevaka sidor bakom inloggning, rikta mot specifika element' },
  'form.advanced.hide': { en: 'Hide advanced settings', sv: 'Dölj avancerade inställningar' },
  'form.selector': { en: 'CSS selector', sv: 'CSS-selektor' },
  'form.selector.help': { en: 'Only monitor a specific part of the page instead of the whole thing. Leave empty to monitor the full page.', sv: 'Bevaka bara en specifik del av sidan. Lämna tomt för att bevaka hela sidan.' },
  'form.cookies': { en: 'Cookies', sv: 'Cookies' },
  'form.cookies.help': { en: 'For pages behind a login. Find cookies in your browser: Settings → Privacy → Cookies.', sv: 'För sidor bakom inloggning. Hitta cookies i din webbläsare: Inställningar → Integritet → Cookies.' },
  'form.cookies.add': { en: '+ Add cookie', sv: '+ Lägg till cookie' },
  'form.headers': { en: 'HTTP headers', sv: 'HTTP-headers' },
  'form.headers.help': { en: 'Custom headers sent with each request, e.g. API keys or auth tokens.', sv: 'Egna headers som skickas med varje förfrågan, t.ex. API-nycklar eller auth-tokens.' },
  'form.headers.add': { en: '+ Add header', sv: '+ Lägg till header' },

  // ─── URL list ───
  'urls.empty': { en: 'No monitored pages yet', sv: 'Inga bevakade sidor ännu' },
  'urls.empty.desc': { en: 'Add your first URL above or pick from popular watchlists below.', sv: 'Lägg till din första URL ovan eller välj bland populära bevakningar nedan.' },
  'urls.empty.cta': { en: 'Need help getting started? Book a 30-min setup call →', sv: 'Vill du ha hjälp att komma igång? Boka ett 30-min startmöte →' },

  // ─── Intro / booking ───
  'intro.title': { en: 'Book an intro call', sv: 'Boka intromöte' },
  'intro.subtitle': { en: '30 minutes with Kristian. We set up your first monitors together and make sure the AI flags what matters to you — not noise.', sv: '30 minuter med Kristian. Vi sätter upp dina första bevakningar tillsammans och ser till att AI:n larmar på det som är viktigt för just dig — inte på brus.' },
  'intro.form.name': { en: 'Your name', sv: 'Ditt namn' },
  'intro.form.email': { en: 'Email', sv: 'E-post' },
  'intro.form.company': { en: 'Company (optional)', sv: 'Företag (valfritt)' },
  'intro.form.urls': { en: 'Pages you want to monitor (optional)', sv: 'Sidor du vill bevaka (valfritt)' },
  'intro.form.urls.placeholder': { en: 'One URL per line. E.g. competitor pricing pages, government agencies you need to watch.', sv: 'En URL per rad. T.ex. konkurrenters prissidor, myndigheter ni måste bevaka.' },
  'intro.form.times': { en: 'Preferred times (optional)', sv: 'Önskade tider (valfritt)' },
  'intro.form.times.placeholder': { en: 'E.g. weekday mornings, Monday afternoon.', sv: 'T.ex. vardagsförmiddagar, måndag em.' },
  'intro.form.message': { en: 'Anything else we should know? (optional)', sv: 'Något mer vi bör veta? (valfritt)' },
  'intro.form.submit': { en: 'Send request', sv: 'Skicka förfrågan' },
  'intro.form.sending': { en: 'Sending…', sv: 'Skickar…' },
  'intro.success.title': { en: 'Thanks — request received', sv: 'Tack — förfrågan mottagen' },
  'intro.success.body': { en: 'Kristian will get back to you within 24 hours to book a time.', sv: 'Kristian hör av sig inom 24 timmar för att boka en tid.' },
  'intro.error.generic': { en: 'Something went wrong. Please try again or email kristian@changebrief.io.', sv: 'Något gick fel. Försök igen eller mejla kristian@changebrief.io.' },
  'intro.error.rate': { en: 'Too many requests. Please try again in a while.', sv: 'För många förfrågningar. Försök igen om en stund.' },
  'urls.removed': { en: 'Removed', sv: 'Borttagen' },
  'urls.checked': { en: 'Checked', sv: 'Kontrollerad' },
  'urls.waiting': { en: 'Waiting for first check...', sv: 'Väntar på första kontrollen...' },
  'urls.nochanges': { en: 'No changes detected yet', sv: 'Inga ändringar upptäckta ännu' },
  'urls.failed': { en: 'Failed', sv: 'Misslyckades' },
  'urls.nextCheck': { en: 'Next check', sv: 'Nästa kontroll' },
  'urls.nextCheck.soon': { en: 'any minute now', sv: 'alldeles strax' },
  'urls.summary.active': { en: 'active', sv: 'aktiva' },
  'urls.summary.errors': { en: 'with errors', sv: 'med fel' },
  'urls.summary.muted': { en: 'muted', sv: 'pausade' },
  'urls.summary.checked24h': { en: 'checked in last 24h', sv: 'kontrollerade senaste dygnet' },

  // ─── Edit modal ───
  'edit.title': { en: 'Edit monitor', sv: 'Redigera bevakning' },
  'edit.name': { en: 'Name', sv: 'Namn' },
  'edit.save': { en: 'Save changes', sv: 'Spara ändringar' },
  'edit.cancel': { en: 'Cancel', sv: 'Avbryt' },
  'edit.success': { en: 'Monitor updated — baseline preserved.', sv: 'Bevakningen uppdaterad — baseline bevarad.' },
  'edit.nochanges': { en: 'No changes to save.', sv: 'Inga ändringar att spara.' },
  'edit.history': { en: 'Change history', sv: 'Ändringslogg' },
  'edit.history.empty': { en: 'No changes yet.', sv: 'Inga ändringar än.' },

  // ─── Change log ───
  'changes.empty': { en: 'No changes detected yet', sv: 'Inga ändringar upptäckta ännu' },
  'changes.empty.desc': { en: 'Pages are checked every 6 hours. Changes will appear here automatically.', sv: 'Sidor kontrolleras var 6:e timme. Ändringar visas här automatiskt.' },
  'changes.nosignificant': { en: 'No significant change', sv: 'Ingen signifikant ändring' },
  'changes.pixeldiff': { en: 'pixel difference', sv: 'pixelskillnad' },

  // ─── Settings ───
  'settings.email': { en: 'Email notifications', sv: 'E-postnotiser' },
  'settings.email.desc': { en: 'We\'ll email you when a monitored page changes. Sent to your login email.', sv: 'Vi mejlar dig när en bevakad sida ändras. Skickas till din inloggningsadress.' },
  'settings.slack': { en: 'Slack notifications', sv: 'Slack-notiser' },
  'settings.slack.desc': { en: 'Get change alerts in a Slack channel. To get a webhook URL:', sv: 'Få ändringsnotiser i en Slack-kanal. För att få en webhook-URL:' },
  'settings.digest': { en: 'Weekly digest', sv: 'Veckorapport' },
  'settings.digest.desc': { en: 'Receive a summary of all changes every Friday morning, ranked by importance.', sv: 'Få en sammanfattning av alla ändringar varje fredag morgon, rankade efter vikt.' },
  'settings.save': { en: 'Save settings', sv: 'Spara inställningar' },
  'settings.saving': { en: 'Saving...', sv: 'Sparar...' },
  'settings.saved': { en: 'Saved!', sv: 'Sparat!' },

  // ─── Popular watchlists ───
  'watchlists.all': { en: 'All', sv: 'Alla' },
  'watchlists.added': { en: 'Added', sv: 'Tillagd' },
  'watchlists.showAll': { en: 'Show all', sv: 'Visa alla' },
  'watchlists.suggestions': { en: 'suggestions', sv: 'förslag' },
  'watchlists.showLess': { en: 'Show less', sv: 'Visa färre' },
  'watchlists.upgradeError': { en: 'Upgrade to Pro to monitor more pages', sv: 'Uppgradera till Pro för att bevaka fler sidor' },

  // ─── Login ───
  'login.title': { en: 'Sign in to get started', sv: 'Logga in för att komma igång' },
  'login.google': { en: 'Continue with Google', sv: 'Fortsätt med Google' },
  'login.github': { en: 'Continue with GitHub', sv: 'Fortsätt med GitHub' },
  'login.terms': { en: 'By signing in you agree to our terms of service.', sv: 'Genom att logga in godkänner du våra användarvillkor.' },

  // ─── Stats ───
  'stats.pages': { en: 'Monitored', sv: 'Bevakade' },
  'stats.changes': { en: 'Changes (7d)', sv: 'Ändringar (7d)' },
  'stats.checks': { en: 'Checks (7d)', sv: 'Kontroller (7d)' },
  'stats.lastcheck': { en: 'Last check', sv: 'Senaste kontroll' },
  'stats.never': { en: 'Not yet', sv: 'Inte ännu' },

  // ─── Time ───
  'time.justNow': { en: 'just now', sv: 'nyss' },
  'time.mAgo': { en: 'm ago', sv: 'm sedan' },
  'time.hAgo': { en: 'h ago', sv: 'h sedan' },
  'time.dAgo': { en: 'd ago', sv: 'd sedan' },

  // ─── Activity Feed ───
  'feed.title': { en: 'Activity', sv: 'Aktivitet' },
  'feed.desc': { en: 'Change log for your monitored pages', sv: 'Ändringslogg för dina bevakade sidor' },
  'feed.all': { en: 'All', sv: 'Alla' },
  'feed.high': { en: 'High', sv: 'Hög' },
  'feed.medium': { en: 'Medium', sv: 'Medel' },
  'feed.filter.url': { en: 'Filter by page', sv: 'Filtrera på sida' },

  // ─── Monitored Pages ───
  'monitor.title': { en: 'Monitored pages', sv: 'Bevakade sidor' },
  'monitor.sort.name': { en: 'Name', sv: 'Namn' },
  'monitor.sort.changed': { en: 'Last changed', sv: 'Senast ändrad' },
  'monitor.sort.importance': { en: 'Importance', sv: 'Prioritet' },
  'monitor.muted': { en: 'Paused', sv: 'Pausad' },
  'monitor.mute': { en: 'Pause monitoring', sv: 'Pausa bevakning' },
  'monitor.unmute': { en: 'Resume monitoring', sv: 'Återuppta bevakning' },

  // ─── Discover ───
  'discover.title': { en: 'Discover', sv: 'Upptäck' },
  'discover.desc': { en: 'Popular pages that teams monitor. Add with one click.', sv: 'Populära sidor som team bevakar. Lägg till med ett klick.' },

  // ─── Export ───
  'export.csv': { en: 'Export CSV', sv: 'Exportera CSV' },
  'export.pro': { en: 'Pro feature', sv: 'Pro-funktion' },

  // ─── Digest settings ───
  'settings.digest.weekly': { en: 'Weekly (Fridays)', sv: 'Veckovis (fredagar)' },
  'settings.digest.daily': { en: 'Daily', sv: 'Dagligen' },
  'settings.digest.off': { en: 'Off', sv: 'Av' },
  'settings.digest.pro': { en: 'Daily digest is a Pro feature', sv: 'Daglig rapport är en Pro-funktion' },

  // ─── Webhook ───
  'form.webhook': { en: 'Webhook URL', sv: 'Webhook-URL' },
  'form.webhook.help': { en: 'We POST a JSON payload when this page changes.', sv: 'Vi skickar JSON via POST när sidan ändras.' },
  'form.webhook.pro': { en: 'Webhooks are a Pro feature', sv: 'Webhooks är en Pro-funktion' },

  // ─── Tuning ───
  'form.threshold': { en: 'Pixel change threshold', sv: 'Tröskel för pixeländring' },
  'form.threshold.help': { en: 'Minimum percentage of pixels that must change before we run AI analysis. Lower = more sensitive.', sv: 'Minsta andel pixlar som måste ändras innan AI-analysen körs. Lägre = känsligare.' },
  'form.min_importance': { en: 'Notify from importance', sv: 'Notifiera från viktighet' },
  'form.min_importance.help': { en: 'Only send notifications when AI rates the change at this importance or higher (1–10).', sv: 'Skicka bara notifieringar när AI:n bedömer ändringen som minst denna viktighet (1–10).' },
  'form.viewport': { en: 'Viewport', sv: 'Visningsläge' },
  'form.viewport.desktop': { en: 'Desktop (1280×900)', sv: 'Desktop (1280×900)' },
  'form.viewport.mobile': { en: 'Mobile (375×812)', sv: 'Mobil (375×812)' },
  'form.viewport.help': { en: 'Which viewport we screenshot in — useful for responsive pages.', sv: 'Vilket visningsläge vi tar skärmdump i — användbart för responsiva sidor.' },
  'form.category': { en: 'Category (optional)', sv: 'Kategori (valfri)' },
  'form.category.help': { en: 'Regulatory categories unlock compliance classification (jurisdiction, document type, action level).', sv: 'Regulatoriska kategorier låser upp compliance-klassificering (jurisdiktion, dokumenttyp, åtgärdsnivå).' },
  'form.category.none': { en: 'None', sv: 'Ingen' },
  'form.ignore': { en: 'Ignore regions (CSS selectors)', sv: 'Ignorera regioner (CSS-selektorer)' },
  'form.ignore.help': { en: 'One selector per line. These elements will be hidden before we take the screenshot — great for clocks, cookie banners, and rotating carousels that cause false positives.', sv: 'En selektor per rad. Dessa element döljs innan skärmdumpen tas — perfekt för klockor, cookie-bannrar och roterande karuseller som ger falska larm.' },
  'form.ignore.placeholder': { en: '.cookie-banner\n.clock\n#live-ticker', sv: '.cookie-banner\n.klocka\n#live-ticker' },
  'form.interval': { en: 'Check frequency', sv: 'Kontrollfrekvens' },
  'form.interval.help': { en: 'How often we check this page. Slower = less noise and lower API cost.', sv: 'Hur ofta sidan kontrolleras. Glesare = mindre brus och lägre API-kostnad.' },
  'form.interval.6h': { en: 'Every 6 hours (default)', sv: 'Var 6:e timme (standard)' },
  'form.interval.12h': { en: 'Every 12 hours', sv: 'Var 12:e timme' },
  'form.interval.24h': { en: 'Once a day', sv: 'En gång per dag' },
  'form.interval.weekly': { en: 'Once a week', sv: 'En gång i veckan' },

  // ─── Bevaknings-intent ───
  'form.intent': { en: 'What are you watching for?', sv: 'Vad letar du efter?' },
  'form.intent.help': { en: 'Tell us what matters — we focus the analysis accordingly.', sv: 'Berätta vad som är viktigt — vi fokuserar analysen därefter.' },
  'form.intent.page': { en: 'All changes', sv: 'Alla ändringar' },
  'form.intent.page.desc': { en: 'We catch every meaningful change on the page.', sv: 'Vi fångar varje meningsfull ändring på sidan.' },
  'form.intent.keywords': { en: 'Specific keywords', sv: 'Särskilda nyckelord' },
  'form.intent.keywords.desc': { en: 'Only alert when a change mentions one of your words — saves noise and cost.', sv: 'Larma bara när en ändring nämner något av dina ord — sparar brus och kostnad.' },
  'form.intent.custom': { en: 'Custom focus', sv: 'Eget fokus' },
  'form.intent.custom.desc': { en: 'Describe in plain text what you care about — AI uses it as a lens.', sv: 'Beskriv i fri text vad du bryr dig om — AI använder det som lins.' },
  'form.keywords': { en: 'Keywords (one per line)', sv: 'Nyckelord (ett per rad)' },
  'form.keywords.placeholder': { en: 'personal data\nGDPR\narticle 5', sv: 'personuppgifter\nGDPR\nartikel 5' },
  'form.watchIntent.label': { en: 'What are you watching for on this page?', sv: 'Vad letar du efter på den här sidan?' },
  'form.watchIntent.placeholder': { en: "e.g. price changes on the Pro plan, new deadlines, changes to compliance requirements. Ignore news rotation and cosmetic tweaks.", sv: 'T.ex. prisändringar på Pro-planen, nya deadlines, ändrade regulatoriska krav. Ignorera nyhetsrotation och kosmetiska ändringar.' },
  'form.watchIntent.help': { en: 'Optional. Helps the AI decide what matters to you — so a trivial change gets a 2/10 instead of an 8/10.', sv: 'Valfritt. Hjälper AI:n avgöra vad som är viktigt för just dig — så att en oviktig ändring får 2/10 istället för 8/10.' },

  // ─── SPA-rendering ───
  'form.spa.title': { en: 'SPA rendering (for JS-heavy pages)', sv: 'SPA-rendering (för JS-tunga sidor)' },
  'form.spa.help': { en: 'Use these if the page is a SPA and the baseline screenshot looks empty or half-loaded.', sv: 'Använd om sidan är en SPA och baseline-bilden ser tom eller halvladdad ut.' },
  'form.spa.waitFor': { en: 'Wait for element (CSS selector)', sv: 'Vänta på element (CSS-selektor)' },
  'form.spa.waitFor.placeholder': { en: 'e.g. .article-body or [data-ready]', sv: 't.ex. .article-body eller [data-ready]' },
  'form.spa.waitMs': { en: 'Extra wait (ms)', sv: 'Extra väntetid (ms)' },
  'form.spa.waitMs.placeholder': { en: '0–15000', sv: '0–15000' },
  'form.spa.scroll': { en: 'Scroll to bottom before capture (triggers lazy-load)', sv: 'Scrolla till botten före bild (triggar lazy-load)' },

  // ─── Feedback (#10) ───
  'fb.relevant': { en: 'Relevant', sv: 'Relevant' },
  'fb.noise': { en: 'Noise', sv: 'Brus' },
  'fb.thanks.relevant': { en: 'Thanks — we\'ll keep showing these.', sv: 'Tack — vi fortsätter visa liknande.' },
  'fb.thanks.noise': { en: 'Thanks — we\'ll weight these lower.', sv: 'Tack — vi viktar sådana lägre.' },
  'fb.suggest.title': { en: 'Want to tune out this kind of noise?', sv: 'Vill du tona ned den här typen av brus?' },
  'fb.suggest.body': { en: 'You\'ve marked {count} alerts from this page as noise recently. Raising the minimum importance from {from} to {to} would skip similar low-signal alerts.', sv: 'Du har markerat {count} notifieringar från denna sida som brus nyligen. Höj minsta viktighet från {from} till {to} så hoppar vi över liknande svaga signaler.' },
  'fb.suggest.apply': { en: 'Apply', sv: 'Tillämpa' },
  'fb.suggest.dismiss': { en: 'Not now', sv: 'Inte nu' },
  'fb.suggest.applied': { en: 'Updated — thanks!', sv: 'Uppdaterat — tack!' },

  // ─── Compliance ───
  'compliance.title': { en: 'Regulatory Changes', sv: 'Regulatoriska ändringar' },
  'compliance.desc': { en: 'AI-classified changes from government agencies and regulators', sv: 'AI-klassificerade ändringar från myndigheter och tillsynsorgan' },

  // ─── Trend ───
  'trend.title': { en: 'Regulatory Trend', sv: 'Regulatorisk trend' },
  'trend.desc': { en: 'Changes per source — ranked by activity', sv: 'Ändringar per källa — rankade efter aktivitet' },

  // ─── Checkout ───
  'checkout.success': { en: 'Plan upgraded! Welcome aboard.', sv: 'Plan uppgraderad! Välkommen ombord.' },

  // ─── Compliance Tabs ───
  'ctabs.title': { en: 'Compliance', sv: 'Regelefterlevnad' },
  'ctabs.changes': { en: 'Recent Changes', sv: 'Senaste ändringar' },
  'ctabs.sources': { en: 'Sources', sv: 'Källor' },
  'ctabs.trend': { en: 'Trend', sv: 'Trend' },

  // ─── Compliance Overview ───
  'coverview.source': { en: 'Source', sv: 'Källa' },
  'coverview.jurisdiction': { en: 'Jurisdiction', sv: 'Jurisdiktion' },
  'coverview.lastChange': { en: 'Last Change', sv: 'Senaste ändring' },
  'coverview.actionLevel': { en: 'Action Level', sv: 'Åtgärdsnivå' },
  'coverview.status': { en: 'Status', sv: 'Status' },
  'coverview.documentType': { en: 'Document Type', sv: 'Dokumenttyp' },
  'coverview.allJurisdictions': { en: 'All jurisdictions', sv: 'Alla jurisdiktioner' },
  'coverview.allStatuses': { en: 'All', sv: 'Alla' },
  'coverview.pending': { en: 'Pending', sv: 'Väntar' },
  'coverview.reviewed': { en: 'Reviewed', sv: 'Granskade' },
  'coverview.print': { en: 'Print', sv: 'Skriv ut' },
  'coverview.empty.title': { en: 'No compliance sources yet', sv: 'Inga compliance-källor ännu' },
  'coverview.empty.desc': { en: 'Add regulatory authorities from the Discover section below to start monitoring.', sv: 'Lägg till myndigheter från Upptäck-sektionen nedan för att börja bevaka.' },
  'coverview.noMatch': { en: 'No sources match the filter', sv: 'Inga källor matchar filtret' },
  'coverview.reviewedBy': { en: 'Reviewed by', sv: 'Granskad av' },
  'coverview.neverChanged': { en: 'No change yet', sv: 'Ingen ändring ännu' },
  'coverview.actionRequired': { en: 'Action required', sv: 'Åtgärd krävs' },
  'coverview.reviewRecommended': { en: 'Review recommended', sv: 'Granskning rekommenderas' },
  'coverview.infoOnly': { en: 'Info only', sv: 'Bara info' },

  // ─── Compliance Onboarding ───
  'conboard.step1.title': { en: 'Select your jurisdictions', sv: 'Välj dina jurisdiktioner' },
  'conboard.step1.desc': { en: 'Which countries\' regulations do you need to monitor?', sv: 'Vilka länders regelverk behöver ni bevaka?' },
  'conboard.step2.title': { en: 'Select your sector', sv: 'Välj er sektor' },
  'conboard.step2.desc': { en: 'What industry are you in?', sv: 'Vilken bransch tillhör ni?' },
  'conboard.step3.title': { en: 'Recommended authorities', sv: 'Rekommenderade myndigheter' },
  'conboard.step3.desc': { en: 'Based on your selection, we recommend monitoring these authorities:', sv: 'Baserat på ditt val rekommenderar vi att bevaka dessa myndigheter:' },
  'conboard.addAll': { en: 'Add all recommended', sv: 'Lägg till alla rekommenderade' },
  'conboard.adding': { en: 'Adding', sv: 'Lägger till' },
  'conboard.of': { en: 'of', sv: 'av' },
  'conboard.done': { en: 'All added! Refreshing...', sv: 'Alla tillagda! Uppdaterar...' },
  'conboard.noMatch': { en: 'No authorities match your selection. Try broadening your filters.', sv: 'Inga myndigheter matchar ditt val. Prova att bredda dina filter.' },
  'conboard.skip': { en: 'Skip', sv: 'Hoppa över' },
  'conboard.back': { en: 'Back', sv: 'Tillbaka' },
  'conboard.next': { en: 'Next', sv: 'Nästa' },

  // ─── Notification preferences ───
  'settings.notify.heading': { en: 'Notify me for', sv: 'Meddela mig vid' },
  'settings.notify.action': { en: 'Action required', sv: 'Åtgärd krävs' },
  'settings.notify.review': { en: 'Review recommended', sv: 'Granskning rekommenderas' },
  'settings.notify.info': { en: 'Info only', sv: 'Bara info' },

  // ─── Reports tab ───
  'reports.title': { en: 'Your monitoring reports', sv: 'Dina bevakningsrapporter' },
  'reports.subtitle': { en: 'Control how and when you receive reports about your monitored pages.', sv: 'Styr hur och när du får rapporter om dina bevakade sidor.' },
  'reports.banner.next': { en: 'Next report', sv: 'Nästa rapport' },
  'reports.banner.noReport': { en: 'No report scheduled', sv: 'Ingen rapport schemalagd' },
  'reports.banner.disabled': { en: 'Reports are turned off. Enable a frequency below to start receiving reports.', sv: 'Rapporter är avstängda. Välj en frekvens nedan för att börja ta emot rapporter.' },
  'reports.banner.format': { en: 'Format', sv: 'Format' },
  'reports.banner.sections': { en: 'Sections', sv: 'Sektioner' },
  'reports.banner.frequency': { en: 'Frequency', sv: 'Frekvens' },
  'reports.banner.sendNow': { en: 'Send now', sv: 'Skicka nu' },
  'reports.config.frequency': { en: 'Frequency', sv: 'Frekvens' },
  'reports.config.frequency.weekly': { en: 'Weekly (Mondays)', sv: 'Veckovis (måndagar)' },
  'reports.config.frequency.daily': { en: 'Daily', sv: 'Dagligen' },
  'reports.config.frequency.off': { en: 'Off', sv: 'Av' },
  'reports.config.format': { en: 'Format', sv: 'Format' },
  'reports.config.format.html': { en: 'HTML Email', sv: 'HTML-mejl' },
  'reports.config.format.pdf': { en: 'PDF', sv: 'PDF' },
  'reports.config.format.both': { en: 'Both', sv: 'Båda' },
  'reports.config.recipients': { en: 'Recipients', sv: 'Mottagare' },
  'reports.config.recipients.add': { en: 'Add recipients', sv: 'Lägg till mottagare' },
  'reports.config.name': { en: 'Report name', sv: 'Rapportnamn' },
  'reports.config.name.placeholder': { en: 'Weekly report', sv: 'Veckorapport' },
  'reports.content.title': { en: 'Report contents', sv: 'Rapportinnehåll' },
  'reports.content.changeSummary': { en: 'Change summary', sv: 'Ändringssammanfattning' },
  'reports.content.changeSummary.desc': { en: 'High-level overview of all detected changes', sv: 'Översikt av alla upptäckta ändringar' },
  'reports.content.changeLog': { en: 'Detailed change log', sv: 'Detaljerad ändringslogg' },
  'reports.content.changeLog.desc': { en: 'Individual change entries ranked by importance', sv: 'Individuella ändringar rankade efter vikt' },
  'reports.content.compliance': { en: 'Compliance updates', sv: 'Compliance-uppdateringar' },
  'reports.content.compliance.desc': { en: 'Regulatory changes with action classification', sv: 'Regulatoriska ändringar med åtgärdsklassificering' },
  'reports.content.monitorStatus': { en: 'Monitor status overview', sv: 'Övervakningsstatus' },
  'reports.content.monitorStatus.desc': { en: 'Health status of all monitored pages', sv: 'Hälsostatus för alla bevakade sidor' },
  'reports.content.recommendations': { en: 'New recommendations', sv: 'Nya rekommendationer' },
  'reports.content.recommendations.desc': { en: 'Suggested new pages to monitor', sv: 'Föreslagna nya sidor att bevaka' },
  'reports.comingSoon': { en: 'Coming soon', sv: 'Kommer snart' },
  'reports.comingSoonPro': { en: 'Coming soon — Pro', sv: 'Kommer snart — Pro' },
  'reports.preview.title': { en: 'Email preview', sv: 'Förhandsvisning' },
  'reports.history.title': { en: 'Report history', sv: 'Rapporthistorik' },
  'reports.history.empty': { en: 'Report history will appear here once the first report has been sent.', sv: 'Rapporthistorik visas här när den första rapporten har skickats.' },
  'reports.save': { en: 'Save report settings', sv: 'Spara rapportinställningar' },
  'reports.saving': { en: 'Saving...', sv: 'Sparar...' },
  'reports.saved': { en: 'Saved!', sv: 'Sparat!' },
  'reports.pro.daily': { en: 'Daily reports are a Pro feature', sv: 'Dagliga rapporter är en Pro-funktion' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key]?.[locale] ?? translations[key]?.en ?? key;
}

export function getLocaleFromCookie(cookieHeader: string | null): Locale {
  if (!cookieHeader) return 'en';
  const match = cookieHeader.match(/locale=(en|sv)/);
  return (match?.[1] as Locale) ?? 'en';
}
