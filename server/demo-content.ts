// Copy packs for the offline demo generator, one per page category.

export type Category =
  | "saas"
  | "fintech"
  | "portfolio"
  | "food"
  | "health"
  | "realestate"
  | "ecommerce"
  | "agency";

export interface CopyPack {
  brand: string;
  designSystem: string;
  eyebrow: string;
  headline: string;
  sub: string;
  primaryCta: string;
  secondaryCta: string;
  nav: string[];
  logos: string[];
  features: { icon: string; title: string; body: string }[];
  showcase: { title: string; body: string; items: { title: string; meta: string; seed: string }[] };
  stats: { value: string; label: string }[];
  testimonials: { quote: string; name: string; role: string }[];
  pricing: { name: string; price: string; period: string; blurb: string; features: string[]; highlight?: boolean }[];
  faq: { q: string; a: string }[];
  ctaTitle: string;
  ctaBody: string;
}

export const CATEGORY_KEYWORDS: [Category, RegExp][] = [
  ["fintech", /\b(fintech|bank|banking|payments?|finance|invoice|card|spend|crypto|wallet|accounting)\b/],
  ["food", /\b(coffee|cafe|café|restaurant|bakery|food|kitchen|bar|wine|tea|pizza|chef|menu|brewery)\b/],
  ["health", /\b(health|clinic|doctor|dental|therapy|wellness|yoga|fitness|gym|medical|care|meditation|spa)\b/],
  ["realestate", /\b(real estate|property|properties|homes?|apartments?|realtor|villa|rental|architecture firm)\b/],
  ["ecommerce", /\b(shop|store|ecommerce|e-commerce|product launch|headphones?|sneakers?|watch|skincare|furniture|fashion|apparel)\b/],
  ["portfolio", /\b(portfolio|photographer|designer|illustrator|artist|architect|personal site|resume|freelancer)\b/],
  ["agency", /\b(agency|studio|consultancy|consulting|branding|marketing firm|creative)\b/],
  ["saas", /\b(saas|app|software|platform|startup|ai|tool|api|developer|analytics|dashboard|crm)\b/],
];

export const COPY: Record<Category, CopyPack> = {
  saas: {
    brand: "Northstar",
    designSystem: "midnight-glow",
    eyebrow: "New · Realtime insights engine",
    headline: "Understand every user, the moment it matters",
    sub: "Northstar turns raw product events into answers your whole team can act on. No SQL, no waiting on dashboards, just clarity.",
    primaryCta: "Start free trial",
    secondaryCta: "Book a demo",
    nav: ["Product", "Solutions", "Pricing", "Docs"],
    logos: ["Vercelion", "Lattice", "Quanta", "Fieldwork", "Monolith", "Arcadia"],
    features: [
      { icon: "zap", title: "Live event stream", body: "See sessions, funnels and cohorts update in under a second." },
      { icon: "sparkles", title: "Ask in plain English", body: "Type a question and get a chart, a breakdown and the why." },
      { icon: "git-branch", title: "Experiment tracking", body: "Ship variants and read impact with built-in significance." },
      { icon: "shield-check", title: "Privacy by default", body: "PII redaction, EU residency and SOC 2 Type II out of the box." },
      { icon: "plug", title: "120+ integrations", body: "Pipe in data from your warehouse, CDP or SDKs in minutes." },
      { icon: "bell-ring", title: "Smart alerts", body: "Get pinged when a metric drifts, with the segment that caused it." },
    ],
    showcase: {
      title: "One workspace for every question",
      body: "Product, growth and leadership share the same source of truth.",
      items: [
        { title: "Retention explorer", meta: "Cohorts · Week 12", seed: "retention" },
        { title: "Journey maps", meta: "Paths · 4.2M sessions", seed: "journey" },
        { title: "Revenue lens", meta: "MRR · Expansion", seed: "revenue" },
      ],
    },
    stats: [
      { value: "3.1B", label: "events processed daily" },
      { value: "41%", label: "faster time to insight" },
      { value: "2,400+", label: "product teams" },
      { value: "99.99%", label: "uptime SLA" },
    ],
    testimonials: [
      { quote: "We replaced three tools and our weekly metrics review went from two hours to fifteen minutes.", name: "Priya Raman", role: "VP Product, Lattice" },
      { quote: "The natural-language queries are the first AI feature our analysts actually trust.", name: "Marcus Lee", role: "Head of Data, Quanta" },
      { quote: "Setup took an afternoon. The insights paid for the year within a month.", name: "Elena Ortiz", role: "Founder, Fieldwork" },
    ],
    pricing: [
      { name: "Starter", price: "$0", period: "/mo", blurb: "For side projects", features: ["10k events / mo", "3 dashboards", "Community support"] },
      { name: "Growth", price: "$79", period: "/mo", blurb: "For scaling teams", features: ["5M events / mo", "Unlimited dashboards", "AI queries", "Experiments"], highlight: true },
      { name: "Enterprise", price: "Custom", period: "", blurb: "For large orgs", features: ["Unlimited events", "SSO & SCIM", "Dedicated CSM", "Custom contracts"] },
    ],
    faq: [
      { q: "How long does setup take?", a: "Most teams send their first events within 20 minutes using our SDKs or warehouse sync." },
      { q: "Can I self-host?", a: "Enterprise plans include a single-tenant deployment in your own cloud." },
      { q: "Is there a free plan?", a: "Yes, Starter is free forever for up to 10k events a month." },
    ],
    ctaTitle: "Your next insight is one question away",
    ctaBody: "Start free, invite your team, and see what your users are really doing.",
  },
  fintech: {
    brand: "Cadence",
    designSystem: "electric-lime",
    eyebrow: "Corporate cards, rebuilt",
    headline: "Spend smarter. Close the books in a day.",
    sub: "Issue cards in seconds, set policies that enforce themselves, and let automatic receipts and reconciliation do the rest.",
    primaryCta: "Get your card",
    secondaryCta: "See how it works",
    nav: ["Cards", "Expenses", "Bill pay", "Pricing"],
    logos: ["Helio", "Brightline", "Parcel", "Kinfolk", "Tandem", "Oakwell"],
    features: [
      { icon: "credit-card", title: "Instant virtual cards", body: "Create a card per vendor, per project or per person." },
      { icon: "scan-line", title: "Receipt matching", body: "Snap or forward receipts, matched to transactions automatically." },
      { icon: "sliders-horizontal", title: "Policy controls", body: "Limits, merchant locks and approvals that apply in real time." },
      { icon: "repeat", title: "Auto-reconciliation", body: "Syncs with your ledger and closes the month in a day." },
      { icon: "globe", title: "Global payouts", body: "Pay vendors in 40+ currencies with transparent FX." },
      { icon: "percent", title: "1.5% cashback", body: "Unlimited cashback on every card, every purchase." },
    ],
    showcase: {
      title: "Finance that runs in the background",
      body: "Your team spends, Cadence handles the paperwork.",
      items: [
        { title: "Spend dashboard", meta: "Live · All entities", seed: "spend" },
        { title: "Approvals", meta: "Mobile · Slack", seed: "approve" },
        { title: "Bill pay", meta: "ACH · Wire · SEPA", seed: "bills" },
      ],
    },
    stats: [
      { value: "$4.2B", label: "annual card volume" },
      { value: "8 hrs", label: "saved per finance FTE weekly" },
      { value: "18k", label: "companies" },
      { value: "1.5%", label: "cashback" },
    ],
    testimonials: [
      { quote: "Month-end close went from nine days to one. Our auditors noticed.", name: "Dana Whitfield", role: "Controller, Brightline" },
      { quote: "Policies that enforce themselves mean I stopped chasing receipts entirely.", name: "Omar Haddad", role: "CFO, Parcel" },
      { quote: "The cashback alone covers our accounting software.", name: "Sofia Brandt", role: "COO, Kinfolk" },
    ],
    pricing: [
      { name: "Core", price: "$0", period: "/mo", blurb: "Cards and expenses", features: ["Unlimited cards", "Receipt capture", "1.5% cashback"] },
      { name: "Plus", price: "$12", period: "/user", blurb: "Automation for growing teams", features: ["Custom policies", "Multi-entity", "ERP sync", "Bill pay"], highlight: true },
      { name: "Enterprise", price: "Custom", period: "", blurb: "Global finance teams", features: ["Global payouts", "Dedicated support", "Custom roles", "SLA"] },
    ],
    faq: [
      { q: "Is Cadence a bank?", a: "Cadence is a financial technology company; banking services are provided by our partner banks, FDIC-insured." },
      { q: "Will applying affect my credit?", a: "No personal guarantee and no credit check for the founders." },
      { q: "Which accounting tools do you support?", a: "QuickBooks, Xero, NetSuite and Sage Intacct with two-way sync." },
    ],
    ctaTitle: "Move money at the speed of your business",
    ctaBody: "Apply in ten minutes. Cards ship in two days, virtual cards are instant.",
  },
  portfolio: {
    brand: "Mara Ellison",
    designSystem: "editorial-serif",
    eyebrow: "Independent designer · Lisbon",
    headline: "Quiet spaces, carefully made",
    sub: "I design identities, interiors and objects for brands that prefer substance over noise. Currently booking projects for spring.",
    primaryCta: "View selected work",
    secondaryCta: "Get in touch",
    nav: ["Work", "About", "Journal", "Contact"],
    logos: ["Kinfolk", "Aesop-like", "Monocle-ish", "Cereal", "Openhouse", "Apartamento"],
    features: [
      { icon: "pen-tool", title: "Identity", body: "Naming, logotypes and systems that age gracefully." },
      { icon: "armchair", title: "Interiors", body: "Hospitality and residential spaces with a sense of calm." },
      { icon: "box", title: "Objects", body: "Small-batch furniture and lighting, made with local makers." },
      { icon: "book-open", title: "Editorial", body: "Books, catalogues and printed matter with considered typography." },
      { icon: "camera", title: "Art direction", body: "Photography direction for campaigns and launches." },
      { icon: "compass", title: "Strategy", body: "Positioning workshops that shape everything downstream." },
    ],
    showcase: {
      title: "Selected work, 2021 to now",
      body: "A few projects I'm proud of.",
      items: [
        { title: "Casa Alfama", meta: "Interiors · 2025", seed: "alfama" },
        { title: "Sal Ceramics", meta: "Identity · 2024", seed: "ceramics" },
        { title: "Lumen Hotel", meta: "Art direction · 2023", seed: "hotel" },
      ],
    },
    stats: [
      { value: "12", label: "years of practice" },
      { value: "64", label: "projects delivered" },
      { value: "9", label: "design awards" },
      { value: "3", label: "countries" },
    ],
    testimonials: [
      { quote: "Mara found the soul of our brand and gave it a voice we didn't know we had.", name: "Inês Duarte", role: "Founder, Sal Ceramics" },
      { quote: "Every detail was considered, nothing was decoration for its own sake.", name: "Tom Becker", role: "Owner, Lumen Hotel" },
      { quote: "The calmest, most rigorous collaborator we've worked with.", name: "Ana Lopes", role: "Editor, Openhouse" },
    ],
    pricing: [
      { name: "Sprint", price: "€4k", period: "", blurb: "Two-week identity sprint", features: ["Workshop", "Logotype", "Mini guidelines"] },
      { name: "Studio", price: "€12k", period: "", blurb: "Full identity system", features: ["Strategy", "Identity system", "Templates", "Launch support"], highlight: true },
      { name: "Retainer", price: "€3k", period: "/mo", blurb: "Ongoing creative partner", features: ["Monthly days", "Art direction", "Priority booking"] },
    ],
    faq: [
      { q: "Do you work remotely?", a: "Yes, with clients across Europe and North America, plus on-site visits for interiors." },
      { q: "What's your lead time?", a: "Usually six to eight weeks. Small sprints can sometimes start sooner." },
      { q: "Do you collaborate with agencies?", a: "Often, as a lead designer or creative director on specific projects." },
    ],
    ctaTitle: "Have a project in mind?",
    ctaBody: "Tell me a little about it. I reply to every message within two days.",
  },
  food: {
    brand: "Ember & Oak",
    designSystem: "warm-organic",
    eyebrow: "Small-batch roasters since 2014",
    headline: "Coffee roasted slowly, shared generously",
    sub: "Seasonal single origins and house blends, roasted in small batches every Tuesday and shipped the same day.",
    primaryCta: "Shop coffee",
    secondaryCta: "Visit the café",
    nav: ["Shop", "Subscriptions", "Café", "Wholesale"],
    logos: ["Bon Appétit", "Sprudge", "Eater", "Food & Wine", "Kinfolk", "Monocle"],
    features: [
      { icon: "flame", title: "Roasted Tuesdays", body: "Every bag ships within 24 hours of roasting." },
      { icon: "leaf", title: "Direct trade", body: "We pay farmers 2.4× fair-trade minimums." },
      { icon: "package", title: "Plastic-free bags", body: "Compostable packaging, carbon-neutral shipping." },
      { icon: "coffee", title: "Brew guides", body: "Recipes for V60, AeroPress, espresso and more." },
      { icon: "calendar", title: "Flexible plans", body: "Pause, skip or swap your subscription anytime." },
      { icon: "store", title: "Café & bakery", body: "Visit our roastery café for pastries baked in-house." },
    ],
    showcase: {
      title: "This season's roasts",
      body: "Limited lots, gone when they're gone.",
      items: [
        { title: "Huila, Colombia", meta: "Cherry · Cacao · $19", seed: "huila" },
        { title: "Guji, Ethiopia", meta: "Jasmine · Peach · $22", seed: "guji" },
        { title: "Ember House Blend", meta: "Caramel · Hazelnut · $17", seed: "blend" },
      ],
    },
    stats: [
      { value: "38", label: "partner farms" },
      { value: "24h", label: "roast to ship" },
      { value: "12k", label: "monthly subscribers" },
      { value: "4.9★", label: "average rating" },
    ],
    testimonials: [
      { quote: "The Guji tastes like peaches and jasmine. I've never had coffee like it at home.", name: "Hannah K.", role: "Subscriber since 2021" },
      { quote: "Our café switched to Ember & Oak and customers noticed the first week.", name: "Leo Martins", role: "Owner, Corner Store Café" },
      { quote: "Freshest beans I've ordered online, and the brew guides are excellent.", name: "Sam O.", role: "Home barista" },
    ],
    pricing: [
      { name: "Taster", price: "$16", period: "/ship", blurb: "One 250g bag", features: ["Rotating origin", "Free shipping", "Skip anytime"] },
      { name: "Daily Ritual", price: "$29", period: "/ship", blurb: "Two 250g bags", features: ["Choose your roast", "Free shipping", "10% off the shop", "Brew notes"], highlight: true },
      { name: "Office", price: "$89", period: "/ship", blurb: "2kg for teams", features: ["Bulk bags", "Equipment loans", "Dedicated support"] },
    ],
    faq: [
      { q: "Whole bean or ground?", a: "Both. Choose your grind at checkout, or let us grind for your brewer." },
      { q: "Where do you ship?", a: "Across the US and Canada, with EU shipping from our Lisbon partner." },
      { q: "Can I change my subscription?", a: "Anytime, from your account, no emails required." },
    ],
    ctaTitle: "Fresh coffee, on your schedule",
    ctaBody: "Start a subscription and get your first bag at half price.",
  },
  health: {
    brand: "Halcyon",
    designSystem: "warm-organic",
    eyebrow: "Primary care, reimagined",
    headline: "Healthcare that makes time for you",
    sub: "Same-day appointments, 30-minute visits and a care team you can message anytime. In-clinic and virtual.",
    primaryCta: "Book a visit",
    secondaryCta: "See memberships",
    nav: ["Services", "Locations", "Membership", "Insurance"],
    logos: ["Aetna", "Cigna", "BlueShield", "United", "Oscar", "Humana"],
    features: [
      { icon: "calendar-check", title: "Same-day visits", body: "Book in the app and be seen today, in person or on video." },
      { icon: "message-circle", title: "Message your doctor", body: "Real clinicians answer within the hour, 7 days a week." },
      { icon: "heart-pulse", title: "Preventive care", body: "Annual physicals, labs and screenings included." },
      { icon: "brain", title: "Mental health", body: "Therapy and psychiatry integrated with your primary care." },
      { icon: "pill", title: "Prescriptions", body: "Renewals in a tap, delivered to your door." },
      { icon: "baby", title: "Family care", body: "Pediatrics through geriatrics under one membership." },
    ],
    showcase: {
      title: "Care for every chapter",
      body: "Programs designed with our clinicians.",
      items: [
        { title: "Women's health", meta: "OB-GYN · Fertility", seed: "wellness" },
        { title: "Sleep & stress", meta: "8-week program", seed: "sleep" },
        { title: "Movement", meta: "Physio · Strength", seed: "movement" },
      ],
    },
    stats: [
      { value: "30 min", label: "average visit length" },
      { value: "< 1 hr", label: "message response" },
      { value: "96%", label: "would recommend" },
      { value: "14", label: "clinics" },
    ],
    testimonials: [
      { quote: "For the first time, my doctor actually had time to listen.", name: "Rachel M.", role: "Member since 2023" },
      { quote: "Messaging my care team at 9pm and getting an answer felt like magic.", name: "David P.", role: "Member" },
      { quote: "The clinics are calm and beautiful. It doesn't feel like a doctor's office.", name: "Aisha T.", role: "Member" },
    ],
    pricing: [
      { name: "Essential", price: "$0", period: "/mo", blurb: "Pay per visit", features: ["Insurance accepted", "Online booking", "Virtual visits"] },
      { name: "Membership", price: "$15", period: "/mo", blurb: "Unlimited access", features: ["24/7 messaging", "Same-day visits", "Annual physical", "Lab discounts"], highlight: true },
      { name: "Family", price: "$39", period: "/mo", blurb: "Up to 5 people", features: ["All membership perks", "Pediatrics", "Shared care plan"] },
    ],
    faq: [
      { q: "Do you take insurance?", a: "Yes, most major plans. Membership is a separate, optional fee." },
      { q: "Can I keep my specialist?", a: "Absolutely. We coordinate with your existing specialists." },
      { q: "Is virtual care available everywhere?", a: "Virtual visits are available in all states where our clinicians are licensed." },
    ],
    ctaTitle: "Feel cared for, not processed",
    ctaBody: "Join today and book your first visit this week.",
  },
  realestate: {
    brand: "Vantage Estates",
    designSystem: "editorial-serif",
    eyebrow: "Exceptional homes · Coastal California",
    headline: "Find the home that feels like a long exhale",
    sub: "A curated portfolio of architectural residences, represented by advisors who know every street and every view.",
    primaryCta: "Browse listings",
    secondaryCta: "Talk to an advisor",
    nav: ["Buy", "Sell", "Neighborhoods", "Journal"],
    logos: ["Architectural Digest", "Dwell", "Robb Report", "WSJ Mansion", "Forbes", "Elle Decor"],
    features: [
      { icon: "map-pin", title: "Local advisors", body: "Specialists for each coastline, canyon and village." },
      { icon: "eye-off", title: "Private listings", body: "Access off-market homes shared only with our clients." },
      { icon: "camera", title: "Cinematic tours", body: "Film-quality walkthroughs before you ever visit." },
      { icon: "scale", title: "Valuation insight", body: "Data-backed pricing from 20 years of local sales." },
      { icon: "key-round", title: "Concierge closing", body: "Inspections, design and moving, coordinated for you." },
      { icon: "trees", title: "Land & estates", body: "Vineyards, ranches and acreage with discretion." },
    ],
    showcase: {
      title: "Featured residences",
      body: "New to market this month.",
      items: [
        { title: "Cliffside Modern, Malibu", meta: "$12.4M · 5 bd · 6 ba", seed: "malibu" },
        { title: "Glass Pavilion, Big Sur", meta: "$8.9M · 3 bd · 4 ba", seed: "bigsur" },
        { title: "Courtyard Villa, Montecito", meta: "$15.2M · 6 bd · 7 ba", seed: "montecito" },
      ],
    },
    stats: [
      { value: "$3.8B", label: "in sales since 2004" },
      { value: "212", label: "homes sold last year" },
      { value: "38%", label: "off-market transactions" },
      { value: "21", label: "advisors" },
    ],
    testimonials: [
      { quote: "They found us a home that never hit the market, and negotiated beautifully.", name: "Claire & James W.", role: "Buyers, Montecito" },
      { quote: "The film they made of our house brought offers from three continents.", name: "Robert H.", role: "Seller, Malibu" },
      { quote: "Discreet, knowledgeable and genuinely kind.", name: "Naomi S.", role: "Buyer, Big Sur" },
    ],
    pricing: [
      { name: "Buyer advisory", price: "0%", period: "", blurb: "Paid at closing by seller", features: ["Private listings", "Tour planning", "Negotiation"] },
      { name: "Signature listing", price: "2.5%", period: "", blurb: "Full marketing program", features: ["Cinematic film", "Print & global press", "Private previews", "Staging"], highlight: true },
      { name: "Estate services", price: "Custom", period: "", blurb: "Land, ranch and portfolio", features: ["Valuation", "Discreet marketing", "Legal coordination"] },
    ],
    faq: [
      { q: "Do you work with international buyers?", a: "Yes, about a third of our clients buy from abroad. We coordinate everything remotely." },
      { q: "What areas do you cover?", a: "From Santa Barbara to Big Sur, plus select Bay Area neighborhoods." },
      { q: "Can I list privately?", a: "Our private exchange shares homes only with vetted buyers." },
    ],
    ctaTitle: "Begin your search with a conversation",
    ctaBody: "Tell us what home means to you. An advisor will reach out within a day.",
  },
  ecommerce: {
    brand: "Orbit",
    designSystem: "mono-minimal",
    eyebrow: "Introducing Orbit One",
    headline: "Silence, sculpted",
    sub: "Adaptive noise cancelling, 60-hour battery and studio-grade drivers in a frame milled from a single block of aluminum.",
    primaryCta: "Pre-order · $349",
    secondaryCta: "Compare models",
    nav: ["Headphones", "Earbuds", "Accessories", "Support"],
    logos: ["The Verge", "Wired", "Pitchfork", "Wallpaper*", "Monocle", "TechRadar"],
    features: [
      { icon: "audio-lines", title: "Adaptive ANC", body: "Listens 48,000 times a second and cancels what you don't want." },
      { icon: "battery-full", title: "60-hour battery", body: "A week of commutes, five minutes of charge for five hours." },
      { icon: "headphones", title: "40mm beryllium drivers", body: "Wide, detailed and tuned by mastering engineers." },
      { icon: "bluetooth", title: "Multipoint", body: "Switch between laptop and phone without thinking about it." },
      { icon: "feather", title: "268 grams", body: "Memory foam cushions and balanced weight for all-day wear." },
      { icon: "recycle", title: "Built to last", body: "Replaceable cushions, battery and a 3-year warranty." },
    ],
    showcase: {
      title: "Choose your finish",
      body: "Anodized aluminum with vegan leather cushions.",
      items: [
        { title: "Graphite", meta: "Space black · $349", seed: "graphite" },
        { title: "Chalk", meta: "Soft white · $349", seed: "chalk" },
        { title: "Moss", meta: "Deep green · $369", seed: "moss" },
      ],
    },
    stats: [
      { value: "60h", label: "battery life" },
      { value: "-42dB", label: "noise reduction" },
      { value: "268g", label: "weight" },
      { value: "3 yr", label: "warranty" },
    ],
    testimonials: [
      { quote: "The most comfortable over-ears I've tested this year, and the ANC is uncanny.", name: "Wired", role: "Review, 9/10" },
      { quote: "Orbit One sounds expensive in the best possible way.", name: "Pitchfork", role: "Gear guide" },
      { quote: "A design object that also happens to be a superb headphone.", name: "Wallpaper*", role: "Design awards" },
    ],
    pricing: [
      { name: "Orbit Buds", price: "$179", period: "", blurb: "In-ear, ANC", features: ["8h + 32h case", "Spatial audio", "IPX5"] },
      { name: "Orbit One", price: "$349", period: "", blurb: "Flagship over-ear", features: ["Adaptive ANC", "60h battery", "Beryllium drivers", "Travel case"], highlight: true },
      { name: "Orbit Studio", price: "$499", period: "", blurb: "Wired + wireless", features: ["Lossless USB-C", "Planar drivers", "Studio cable kit"] },
    ],
    faq: [
      { q: "When will pre-orders ship?", a: "First units ship in four weeks, in the order they were placed." },
      { q: "Do they work with iPhone and Android?", a: "Yes, with a companion app for both and multipoint pairing." },
      { q: "What's the return policy?", a: "Try them for 45 days. Free returns, no questions asked." },
    ],
    ctaTitle: "Hear what you've been missing",
    ctaBody: "Pre-order today and get a leather travel case free.",
  },
  agency: {
    brand: "Northwind",
    designSystem: "swiss-bold",
    eyebrow: "Independent creative studio",
    headline: "We build brands people remember",
    sub: "Strategy, identity and digital products for ambitious companies. Small senior team, big outcomes.",
    primaryCta: "Start a project",
    secondaryCta: "See our work",
    nav: ["Work", "Services", "Studio", "Contact"],
    logos: ["Helio", "Parcel", "Monolith", "Arcadia", "Fieldwork", "Brightline"],
    features: [
      { icon: "target", title: "Brand strategy", body: "Positioning, naming and messaging that sharpen your edge." },
      { icon: "shapes", title: "Identity systems", body: "Logos, type and motion built to flex across every surface." },
      { icon: "monitor-smartphone", title: "Websites", body: "Fast, editorial sites designed and engineered in-house." },
      { icon: "layout-dashboard", title: "Product design", body: "UX and UI for apps that need to feel inevitable." },
      { icon: "clapperboard", title: "Motion & film", body: "Launch films, animations and social content." },
      { icon: "rocket", title: "Launch support", body: "From press kit to campaign, we help you go live loud." },
    ],
    showcase: {
      title: "Selected work",
      body: "Recent launches with partners we love.",
      items: [
        { title: "Helio Energy", meta: "Identity · Web", seed: "helio" },
        { title: "Parcel", meta: "Product · Motion", seed: "parcel" },
        { title: "Monolith Coffee", meta: "Naming · Packaging", seed: "monolith" },
      ],
    },
    stats: [
      { value: "14", label: "people" },
      { value: "120+", label: "brands launched" },
      { value: "31", label: "awards" },
      { value: "8 wks", label: "average identity sprint" },
    ],
    testimonials: [
      { quote: "Northwind gave us a brand that made our Series B deck write itself.", name: "Jonas Weber", role: "CEO, Helio" },
      { quote: "Senior people, real opinions, zero fluff. Exactly what we needed.", name: "Lina Park", role: "CMO, Parcel" },
      { quote: "The site they built doubled our conversion in the first month.", name: "Arun Mehta", role: "Founder, Monolith" },
    ],
    pricing: [
      { name: "Sprint", price: "$25k", period: "", blurb: "4-week focused engagement", features: ["Workshop", "Concept direction", "Toolkit"] },
      { name: "Brand", price: "$80k", period: "", blurb: "Full identity program", features: ["Strategy", "Identity system", "Website", "Launch assets"], highlight: true },
      { name: "Partner", price: "$18k", period: "/mo", blurb: "Embedded creative team", features: ["Dedicated team", "Unlimited requests", "Quarterly planning"] },
    ],
    faq: [
      { q: "Who will I work with?", a: "A senior strategist, designer and engineer, every week, no hand-offs to juniors." },
      { q: "How long does a project take?", a: "Identity sprints run 6 to 10 weeks; websites 8 to 12." },
      { q: "Do you take equity?", a: "Occasionally, for early-stage founders we believe in. Ask us." },
    ],
    ctaTitle: "Let's make something unmissable",
    ctaBody: "Tell us where you're headed. We'll reply within 48 hours with next steps.",
  },
};
