export interface ApiCatalogItem {
  slug: string;
  provider: string;
  product: string;
  category: string;
  price: string;
  access: string;
  metric: string;
  metricLabel: string;
  latency: string;
  description: string;
  howItWorks: string;
  mark: string;
  markClassName: string;
  accent: string;
  eyebrow: string;
  overview: string;
  bestFor: string[];
  freePlan: string[];
  premiumPlan: string[];
  steps: string[];
  sampleRequest: string;
}

export interface ApiDetailContent {
  baseUrl: string;
  endpoint: string;
  auth: string;
  protocol: string;
  sandboxLimit: string;
  premiumLimit: string;
  successRate: string;
  regions: string[];
  responseHighlights: string[];
  pricingNotes: string[];
  sampleResponse: string;
}

const PROVIDER_URLS: Record<string, string> = {
  OpenAI: 'https://platform.openai.com/',
  ChatGPT: 'https://openai.com/chatgpt/business/',
  Stripe: 'https://stripe.com/',
  Razorpay: 'https://razorpay.com/',
  Twilio: 'https://www.twilio.com/',
  'Google Maps': 'https://developers.google.com/maps',
  'Sarvam AI': 'https://www.sarvam.ai/',
  UIDAI: 'https://uidai.gov.in/',
  'data.gov.in': 'https://www.data.gov.in/',
  GSTN: 'https://services.gst.gov.in/services/searchtp',
  NSDL: 'https://www.protean-tinpan.com/',
  DigiLocker: 'https://www.digilocker.gov.in/',
  Clear: 'https://www.clear.in/',
  Anthropic: 'https://www.anthropic.com/',
  Google: 'https://ai.google.dev/',
  'Mistral AI': 'https://mistral.ai/',
  Cohere: 'https://cohere.com/',
  'Hugging Face': 'https://huggingface.co/',
  'Stability AI': 'https://stability.ai/',
  ElevenLabs: 'https://elevenlabs.io/',
  Deepgram: 'https://deepgram.com/',
  AssemblyAI: 'https://www.assemblyai.com/',
  Replicate: 'https://replicate.com/',
  Groq: 'https://groq.com/',
  Perplexity: 'https://www.perplexity.ai/',
  'Together AI': 'https://www.together.ai/',
  'Fireworks AI': 'https://fireworks.ai/',
  Runway: 'https://runwayml.com/',
  Pinecone: 'https://www.pinecone.io/',
  PayPal: 'https://developer.paypal.com/',
  Square: 'https://developer.squareup.com/',
  Adyen: 'https://www.adyen.com/',
  Cashfree: 'https://www.cashfree.com/',
  PhonePe: 'https://www.phonepe.com/business-solutions/payment-gateway/',
  NPCI: 'https://www.npci.org.in/',
  Braintree: 'https://www.braintreepayments.com/',
  Mollie: 'https://www.mollie.com/',
  RazorpayX: 'https://razorpay.com/x/',
  SendGrid: 'https://sendgrid.com/',
  Mailgun: 'https://www.mailgun.com/',
  Postmark: 'https://postmarkapp.com/',
  Vonage: 'https://www.vonage.com/',
  Meta: 'https://developers.facebook.com/',
  Slack: 'https://api.slack.com/',
  Discord: 'https://discord.com/developers/docs/intro',
  Telegram: 'https://core.telegram.org/',
  Resend: 'https://resend.com/',
  Mapbox: 'https://www.mapbox.com/',
  HERE: 'https://www.here.com/platform',
  TomTom: 'https://developer.tomtom.com/',
  what3words: 'https://what3words.com/products/what3words-api',
  IPinfo: 'https://ipinfo.io/',
  Radar: 'https://radar.com/',
  OpenCage: 'https://opencagedata.com/',
  'Vahan (MoRTH)': 'https://parivahan.gov.in/',
  'e-Courts': 'https://ecourts.gov.in/',
  EPFO: 'https://www.epfindia.gov.in/',
  CERSAI: 'https://www.cersai.org.in/',
  'India Post': 'https://www.indiapost.gov.in/',
  Auth0: 'https://auth0.com/',
  Clerk: 'https://clerk.com/',
  Sumsub: 'https://sumsub.com/',
  Onfido: 'https://onfido.com/',
  Firebase: 'https://firebase.google.com/',
  Okta: 'https://www.okta.com/',
  Jumio: 'https://www.jumio.com/',
  Plaid: 'https://plaid.com/',
  Setu: 'https://setu.co/',
  TrueLayer: 'https://truelayer.com/',
  Yodlee: 'https://www.yodlee.com/',
  MX: 'https://www.mx.com/',
  'Razorpay X': 'https://razorpay.com/x/',
  CoinGecko: 'https://www.coingecko.com/en/api',
  ExchangeRate: 'https://www.exchangerate-api.com/',
  'AWS S3': 'https://aws.amazon.com/s3/',
  Cloudflare: 'https://www.cloudflare.com/developer-platform/',
  Vercel: 'https://vercel.com/',
  Supabase: 'https://supabase.com/',
  DigitalOcean: 'https://www.digitalocean.com/',
  Railway: 'https://railway.app/',
  Render: 'https://render.com/',
  'Fly.io': 'https://fly.io/',
  Upstash: 'https://upstash.com/',
  Neon: 'https://neon.tech/',
  Mixpanel: 'https://mixpanel.com/',
  Amplitude: 'https://amplitude.com/',
  Segment: 'https://segment.com/',
  PostHog: 'https://posthog.com/',
  Sentry: 'https://sentry.io/',
  Datadog: 'https://www.datadoghq.com/',
  LogRocket: 'https://logrocket.com/',
  Algolia: 'https://www.algolia.com/',
  Typesense: 'https://typesense.org/',
  Meilisearch: 'https://www.meilisearch.com/',
  Elastic: 'https://www.elastic.co/',
  'X (Twitter)': 'https://developer.x.com/',
  GitHub: 'https://github.com/',
  LinkedIn: 'https://www.linkedin.com/developers/',
  Instagram: 'https://developers.facebook.com/docs/instagram-platform/',
  YouTube: 'https://developers.google.com/youtube',
  Spotify: 'https://developer.spotify.com/',
  Reddit: 'https://www.redditinc.com/policies/data-api-terms',
  TikTok: 'https://developers.tiktok.com/',
  OpenWeatherMap: 'https://openweathermap.org/api',
  NewsAPI: 'https://newsapi.org/',
  'IMD via APIverse': 'https://mausam.imd.gov.in/',
};

export const marketplaceFilters = [
  'All APIs',
  'AI',
  'Government',
  'Payments',
  'Messaging',
  'Maps',
  'Identity',
  'Fintech',
];

export const apiCatalog: ApiCatalogItem[] = [
  {
    slug: 'openai-responses',
    provider: 'OpenAI',
    product: 'Responses API',
    category: 'AI',
    price: '$0.25 / 1M input tokens',
    access: 'Free sandbox + premium production',
    metric: '4.9',
    metricLabel: '2.4k teams',
    latency: '420 ms',
    description: 'Text generation, structured outputs, tools, and agent workflows for production products.',
    howItWorks: 'Open the detail page, review the request and response shape, test in sandbox with your account email, then move the same API to premium production usage.',
    mark: 'OA',
    markClassName: 'bg-[#0f1720] text-white',
    accent: 'from-[#201612] via-[#121a20] to-[#0d2530]',
    eyebrow: 'Popular with product teams',
    overview: 'Build chat, search, document analysis, and agent workflows from one AI endpoint.',
    bestFor: ['AI assistants', 'Structured extraction', 'RAG workflows'],
    freePlan: ['Sandbox requests', 'Basic examples', 'Shared rate limits'],
    premiumPlan: ['Production keys', 'Higher throughput', 'Priority support'],
    steps: ['Create a sandbox key', 'Send a responses request', 'Inspect the tool output', 'Upgrade to premium for live traffic'],
    sampleRequest: "POST /v1/responses\n{\n  \"model\": \"gpt-4.1-mini\",\n  \"input\": \"Summarize yesterday's support logs\"\n}",
  },
  {
    slug: 'chatgpt-conversation-gateway',
    provider: 'ChatGPT',
    product: 'Conversation Gateway',
    category: 'AI',
    price: 'Usage-based',
    access: 'Free trial + premium seats',
    metric: '4.8',
    metricLabel: '1.7k teams',
    latency: '380 ms',
    description: 'Assistant-style conversational APIs with retrieval, orchestration, and rich chat behavior.',
    howItWorks: 'Teams review the conversation flow on the detail screen, try a free trial tied to their login email, and then activate premium seats for larger chat workloads.',
    mark: 'CG',
    markClassName: 'bg-[#1f7a63] text-white',
    accent: 'from-[#133029] via-[#12212b] to-[#0b1520]',
    eyebrow: 'Strong chat UX fit',
    overview: 'Power multi-turn conversational products with memory, tools, and clean chat orchestration.',
    bestFor: ['Support bots', 'Copilots', 'Knowledge chat'],
    freePlan: ['Trial messages', 'Starter prompts', 'Shared model access'],
    premiumPlan: ['Dedicated usage pools', 'Advanced analytics', 'Team seat controls'],
    steps: ['Review the chat schema', 'Test with a sample prompt', 'Add retrieval context', 'Unlock premium traffic from the same account'],
    sampleRequest: "POST /v1/chat\n{\n  \"conversation\": [{\"role\": \"user\", \"content\": \"Draft a refund response\"}]\n}",
  },
  {
    slug: 'stripe-payments',
    provider: 'Stripe',
    product: 'Payments API',
    category: 'Payments',
    price: '2.9% + fixed fee',
    access: 'Free docs + premium live usage',
    metric: '4.9',
    metricLabel: '3.1k teams',
    latency: '110 ms',
    description: 'Charges, subscriptions, invoicing, and payouts with mature webhook and billing workflows.',
    howItWorks: 'Users inspect the payment flow, create a free sandbox account under their email, and then switch to premium live processing without changing products.',
    mark: 'S',
    markClassName: 'bg-[#635bff] text-white',
    accent: 'from-[#251f5f] via-[#1a2440] to-[#111822]',
    eyebrow: 'Revenue-ready',
    overview: 'Accept payments, manage subscriptions, and automate billing operations from one API suite.',
    bestFor: ['Subscriptions', 'One-time checkout', 'Marketplace billing'],
    freePlan: ['Test cards', 'Sandbox webhooks', 'Developer examples'],
    premiumPlan: ['Live transaction flow', 'Billing operations', 'Production reliability controls'],
    steps: ['Read the payment intent flow', 'Try test mode', 'Review webhook events', 'Enable premium live traffic'],
    sampleRequest: "POST /v1/payment_intents\n{\n  \"amount\": 4999,\n  \"currency\": \"usd\"\n}",
  },
  {
    slug: 'razorpay-payouts',
    provider: 'Razorpay',
    product: 'Payouts API',
    category: 'Fintech',
    price: 'Custom pricing',
    access: 'Free onboarding + premium contracts',
    metric: '4.6',
    metricLabel: '640 teams',
    latency: '145 ms',
    description: 'Collections, settlement, and payout orchestration tailored to Indian payment operations.',
    howItWorks: 'A logged-in team explores the payout lifecycle first, activates onboarding in free mode, and then signs a premium contract for higher limits.',
    mark: 'RZ',
    markClassName: 'bg-[#072654] text-white',
    accent: 'from-[#132a59] via-[#102132] to-[#0d1723]',
    eyebrow: 'India-focused finance',
    overview: 'Move money across collections, settlements, and payouts for Indian fintech and commerce operations.',
    bestFor: ['Vendor payouts', 'Settlement operations', 'Indian commerce flows'],
    freePlan: ['Integration review', 'Starter sandbox', 'Basic onboarding'],
    premiumPlan: ['Live payouts', 'Higher volume contracts', 'Operational support'],
    steps: ['Inspect the payout payload', 'Create a sandbox transfer', 'Review settlement states', 'Upgrade to premium contract'],
    sampleRequest: "POST /v1/payouts\n{\n  \"amount\": 120000,\n  \"currency\": \"INR\",\n  \"mode\": \"UPI\"\n}",
  },
  {
    slug: 'twilio-messaging',
    provider: 'Twilio',
    product: 'Messaging API',
    category: 'Messaging',
    price: '$0.0075 / message',
    access: 'Free test credits + premium traffic',
    metric: '4.7',
    metricLabel: '980 teams',
    latency: '190 ms',
    description: 'SMS, OTP, and delivery status APIs with global routing and operational event feeds.',
    howItWorks: 'Teams can read the message flow on the detail page, send test traffic for free from their account, and then purchase premium delivery volume.',
    mark: 'T',
    markClassName: 'bg-[#f22f46] text-white',
    accent: 'from-[#3a1119] via-[#171a22] to-[#101722]',
    eyebrow: 'Reliable OTP lane',
    overview: 'Send transactional messages, OTP flows, and user alerts with route and status visibility.',
    bestFor: ['OTP login', 'Transactional SMS', 'Delivery tracking'],
    freePlan: ['Trial messages', 'Sandbox senders', 'Debug examples'],
    premiumPlan: ['Live routes', 'Higher throughput', 'Delivery analytics'],
    steps: ['Read the SMS request model', 'Send a free trial message', 'Check delivery callbacks', 'Move live with the official provider when ready'],
    sampleRequest: "POST /v1/messages\n{\n  \"to\": \"+919999999999\",\n  \"body\": \"Your OTP is 481920\"\n}",
  },
  {
    slug: 'google-maps-places',
    provider: 'Google Maps',
    product: 'Places API',
    category: 'Maps',
    price: 'Per request',
    access: 'Free preview + premium quotas',
    metric: '4.8',
    metricLabel: '1.2k teams',
    latency: '130 ms',
    description: 'Search, geocoding, routing, and place enrichment with broad international coverage.',
    howItWorks: 'The detail screen explains search, lookup, and map enrichment. Users can test with a free preview and then pay for higher quota under the same email.',
    mark: 'GM',
    markClassName: 'bg-[#ffffff] text-[#1a73e8] border border-stone-200',
    accent: 'from-[#203e69] via-[#163446] to-[#111926]',
    eyebrow: 'Geo discovery',
    overview: 'Power search, geocoding, and route experiences with trusted global mapping data.',
    bestFor: ['Location search', 'Address validation', 'Route planning'],
    freePlan: ['Preview calls', 'Basic examples', 'Starter quota'],
    premiumPlan: ['Larger request pools', 'Commercial quotas', 'Production use'],
    steps: ['Review place search docs', 'Make a preview query', 'Inspect place details', 'Enable premium quota'],
    sampleRequest: "GET /v1/places/search?query=coffee+near+gurgaon",
  },
  {
    slug: 'sarvam-indic-ai',
    provider: 'Sarvam AI',
    product: 'Indic Language API',
    category: 'AI',
    price: 'Freemium',
    access: 'Free trial + premium production',
    metric: '4.4',
    metricLabel: '340 teams',
    latency: '300 ms',
    description: 'Indian language NLP with translation, transliteration, TTS, and STT for multilingual product workflows.',
    howItWorks: 'Teams can open the API detail page, test Indic language requests in the free tier, and then activate premium production access for larger multilingual traffic.',
    mark: 'SA',
    markClassName: 'bg-[#7a2f24] text-white',
    accent: 'from-[#402117] via-[#1b2028] to-[#0f1722]',
    eyebrow: 'Indic AI workflows',
    overview: 'Build translation, transliteration, speech, and text intelligence for Indian-language products from one provider.',
    bestFor: ['Indic translation', 'Multilingual voice', 'Regional support automation'],
    freePlan: ['Starter trial quota', 'Test requests', 'Docs and prompt examples'],
    premiumPlan: ['Production keys', 'Higher regional throughput', 'Commercial support'],
    steps: ['Review supported language pairs', 'Send a sample translation', 'Test TTS or STT response flow', 'Upgrade to premium production access'],
    sampleRequest: "POST /v1/translate\n{\n  \"source_language\": \"en-IN\",\n  \"target_language\": \"hi-IN\",\n  \"text\": \"Your KYC is approved\"\n}",
  },
  {
    slug: 'uidai-aadhaar-verify',
    provider: 'UIDAI',
    product: 'Aadhaar Verify API',
    category: 'Government',
    price: 'Free verification + premium batch',
    access: 'Free single checks + premium batch ops',
    metric: '4.7',
    metricLabel: '870 teams',
    latency: '160 ms',
    description: 'Identity verification workflows for onboarding, KYC, and compliance-heavy citizen journeys.',
    howItWorks: 'Logged-in teams open the API detail dashboard, learn the request flow, test individual Aadhaar checks for free, and then unlock premium batch verification.',
    mark: 'AA',
    markClassName: 'bg-[#15406d] text-white',
    accent: 'from-[#17375a] via-[#112537] to-[#0d1520]',
    eyebrow: 'Government identity',
    overview: 'Verify Aadhaar-linked identity details for onboarding and regulated KYC journeys.',
    bestFor: ['KYC onboarding', 'Identity checks', 'Citizen verification'],
    freePlan: ['Single sandbox checks', 'Docs walkthrough', 'Basic onboarding support'],
    premiumPlan: ['Batch verification', 'Higher rate limits', 'Audit-ready reporting'],
    steps: ['Review request headers', 'Submit a single sandbox Aadhaar check', 'Inspect verification states', 'Upgrade to premium batch mode'],
    sampleRequest: "POST /v1/aadhaar/verify\n{\n  \"aadhaar_number\": \"XXXX-XXXX-1234\",\n  \"consent\": true\n}",
  },
  {
    slug: 'data-gov-open-government',
    provider: 'data.gov.in',
    product: 'Open Government Data API',
    category: 'Government',
    price: 'Free portal access + premium managed integration',
    access: 'Free portal APIs + premium managed support',
    metric: '4.5',
    metricLabel: '610 teams',
    latency: '240 ms',
    description: 'Access public government datasets and API-backed resources through India’s Open Government Data portal.',
    howItWorks: 'Users browse the government dataset flow, review how portal-backed APIs work, test free access where available, and then use premium managed support in APIverse for integration help and operational controls.',
    mark: 'DG',
    markClassName: 'bg-[#0c4c74] text-white',
    accent: 'from-[#143c5a] via-[#102234] to-[#0c1520]',
    eyebrow: 'Open Government Data Portal India',
    overview: 'Use the Open Government Data portal as a gateway to public Indian government datasets and API resources.',
    bestFor: ['Public datasets', 'Government data workflows', 'Civic and compliance products'],
    freePlan: ['Portal API discovery', 'Public dataset access', 'Reference integration guidance'],
    premiumPlan: ['Managed onboarding', 'Priority integration help', 'Workspace-level usage coordination'],
    steps: ['Browse available public APIs', 'Inspect dataset and endpoint metadata', 'Test the public access flow', 'Use premium support for production integration in APIverse'],
    sampleRequest: "GET /catalog/apis\nHost: www.data.gov.in\nAccept: application/json",
  },
  {
    slug: 'gstin-taxpayer-search',
    provider: 'GSTN',
    product: 'GST Taxpayer Search API',
    category: 'Government',
    price: 'Free lookups + premium business volume',
    access: 'Free checks + premium account limits',
    metric: '4.6',
    metricLabel: '540 teams',
    latency: '175 ms',
    description: 'Search GST taxpayer registration data, filing status, and business identity for commerce workflows.',
    howItWorks: 'Users see the endpoint behavior in the detail dashboard, run free GST lookups during evaluation, and then subscribe to premium usage under their workspace email.',
    mark: 'GS',
    markClassName: 'bg-[#0d6b5d] text-white',
    accent: 'from-[#0e4d43] via-[#10212a] to-[#0b1520]',
    eyebrow: 'Tax and business verification',
    overview: 'Check GST registration, taxpayer identity, and filing-linked business verification signals.',
    bestFor: ['Merchant onboarding', 'Vendor verification', 'Taxpayer lookup'],
    freePlan: ['Starter GST checks', 'Docs and examples', 'Shared request limits'],
    premiumPlan: ['Higher lookup volume', 'Business-grade quotas', 'Workspace access controls'],
    steps: ['Open GST detail view', 'Run a free GSTIN lookup', 'Review filing fields', 'Enable premium volume'],
    sampleRequest: "GET /v1/gst/search?gstin=29ABCDE1234F1Z5",
  },
  {
    slug: 'nsdl-pan-verification',
    provider: 'NSDL',
    product: 'PAN Verification API',
    category: 'Government',
    price: 'Per verification',
    access: 'Free trial + premium compliance',
    metric: '4.5',
    metricLabel: '460 teams',
    latency: '150 ms',
    description: 'Validate PAN identity for lending, payroll, onboarding, and tax-linked compliance workflows.',
    howItWorks: 'The detail dashboard explains PAN verification, lets teams test a free trial request, and then move into premium compliance volume attached to their account email.',
    mark: 'PN',
    markClassName: 'bg-[#6f4b18] text-white',
    accent: 'from-[#4f3211] via-[#1c2027] to-[#0f1520]',
    eyebrow: 'Tax identity signal',
    overview: 'Check PAN validity and taxpayer identity for financial onboarding and regulated workflows.',
    bestFor: ['Tax identity', 'Lending checks', 'Payroll onboarding'],
    freePlan: ['Trial request', 'Basic response examples', 'Starter support'],
    premiumPlan: ['Compliance volume', 'Audit trails', 'Priority onboarding'],
    steps: ['Review the PAN field set', 'Test a trial verification', 'Inspect status flags', 'Upgrade to premium compliance use'],
    sampleRequest: "POST /v1/pan/verify\n{\n  \"pan\": \"ABCDE1234F\",\n  \"name\": \"Amit Kumar\"\n}",
  },
  {
    slug: 'digilocker-document-access',
    provider: 'DigiLocker',
    product: 'Document Access API',
    category: 'Government',
    price: 'Free sandbox + premium retrieval',
    access: 'Free sandbox + premium retrieval',
    metric: '4.6',
    metricLabel: '390 teams',
    latency: '210 ms',
    description: 'Access verified digital documents for onboarding, lending, employment, and government-linked compliance.',
    howItWorks: 'Teams review the document retrieval flow first, test free sandbox access with their workspace email, and then enable premium retrieval for real user accounts.',
    mark: 'DL',
    markClassName: 'bg-[#0f5686] text-white',
    accent: 'from-[#15466b] via-[#132132] to-[#0c1420]',
    eyebrow: 'Document proofing',
    overview: 'Fetch verified documents and document metadata through a consent-aware, government-linked flow.',
    bestFor: ['Verified documents', 'Lending onboarding', 'Employment proof'],
    freePlan: ['Sandbox docs', 'Consent walkthroughs', 'Reference examples'],
    premiumPlan: ['Live retrieval', 'Higher limits', 'Production onboarding support'],
    steps: ['Read the consent model', 'Try sandbox document fetch', 'Review metadata fields', 'Enable premium live retrieval'],
    sampleRequest: "POST /v1/documents/fetch\n{\n  \"document_type\": \"aadhaar\",\n  \"consent_token\": \"consent_123\"\n}",
  },
  {
    slug: 'clear-kyc-business',
    provider: 'Clear',
    product: 'Business KYC API',
    category: 'Identity',
    price: 'Per verification',
    access: 'Free trial + premium operations',
    metric: '4.7',
    metricLabel: '520 teams',
    latency: '140 ms',
    description: 'Business onboarding APIs that combine PAN, GST, CIN, and identity verification in one operational workflow.',
    howItWorks: 'The API detail view shows the KYC sequence, lets a team test free verification scenarios, and then upgrades to premium for day-to-day onboarding operations.',
    mark: 'CK',
    markClassName: 'bg-[#13354d] text-white',
    accent: 'from-[#162f45] via-[#152130] to-[#0d1722]',
    eyebrow: 'Business onboarding',
    overview: 'Bundle identity, tax, and business verification into a single onboarding pipeline.',
    bestFor: ['Merchant onboarding', 'Vendor KYC', 'Business identity'],
    freePlan: ['Trial requests', 'Starter docs', 'Shared test quota'],
    premiumPlan: ['Operational volume', 'Team workspace seats', 'Reporting and controls'],
    steps: ['Review KYC flow', 'Run a sample business check', 'Inspect status fields', 'Upgrade for premium onboarding usage'],
    sampleRequest: "POST /v1/business-kyc/verify\n{\n  \"pan\": \"ABCDE1234F\",\n  \"gstin\": \"29ABCDE1234F1Z5\"\n}",
  },
];

export function getApiBySlug(slug: string) {
  return apiCatalog.find((api) => api.slug === slug);
}

export const apiDetailContent: Record<string, ApiDetailContent> = {
  'openai-responses': {
    baseUrl: 'https://api.openai.com',
    endpoint: 'POST /v1/responses',
    auth: 'Bearer API key',
    protocol: 'HTTPS + JSON',
    sandboxLimit: '500 requests/day',
    premiumLimit: 'Custom token throughput',
    successRate: '99.97%',
    regions: ['US', 'EU'],
    responseHighlights: ['output_text', 'tool_calls', 'usage tokens', 'response id'],
    pricingNotes: ['Free sandbox for testing prompts', 'Premium pricing scales by token usage', 'Production keys unlock higher throughput'],
    sampleResponse: "{\n  \"id\": \"resp_01hzk8...\",\n  \"model\": \"gpt-4.1-mini\",\n  \"output_text\": \"Yesterday support volume dropped 8%.\",\n  \"usage\": {\n    \"input_tokens\": 128,\n    \"output_tokens\": 42\n  }\n}",
  },
  'sarvam-indic-ai': {
    baseUrl: 'https://api.sarvam.ai',
    endpoint: 'POST /v1/translate',
    auth: 'Bearer API key',
    protocol: 'HTTPS + JSON',
    sandboxLimit: '1,000 trial requests/month',
    premiumLimit: 'Higher multilingual throughput by plan',
    successRate: '99.75%',
    regions: ['India'],
    responseHighlights: ['translated_text', 'source_language', 'target_language', 'request_id'],
    pricingNotes: ['Free trial covers evaluation traffic', 'Premium plans unlock higher throughput', 'Best suited for Indic-language product experiences'],
    sampleResponse: "{\n  \"request_id\": \"sarv_1234\",\n  \"source_language\": \"en-IN\",\n  \"target_language\": \"hi-IN\",\n  \"translated_text\": \"Aapka KYC approve ho gaya hai\"\n}",
  },
  'chatgpt-conversation-gateway': {
    baseUrl: 'https://api.apiverse.ai',
    endpoint: 'POST /v1/chat/sessions',
    auth: 'Bearer workspace token',
    protocol: 'HTTPS + JSON',
    sandboxLimit: '1,000 trial messages/month',
    premiumLimit: 'Unlimited seats with usage billing',
    successRate: '99.91%',
    regions: ['US', 'India'],
    responseHighlights: ['session_id', 'assistant_reply', 'citations', 'retrieval hits'],
    pricingNotes: ['Trial unlocks message testing', 'Premium enables team seats and analytics', 'Same login email owns seats and usage'],
    sampleResponse: "{\n  \"session_id\": \"sess_78ad\",\n  \"assistant_reply\": \"I can help draft that refund response.\",\n  \"citations\": [\n    { \"source\": \"kb/refund-policy\", \"score\": 0.92 }\n  ]\n}",
  },
  'data-gov-open-government': {
    baseUrl: 'https://www.data.gov.in',
    endpoint: 'GET /catalog/apis',
    auth: 'Portal API key or public access depending on resource',
    protocol: 'HTTPS + portal-backed dataset/API access',
    sandboxLimit: 'Public access based on dataset availability',
    premiumLimit: 'Managed support through APIverse workspace',
    successRate: 'Portal dataset dependent',
    regions: ['India'],
    responseHighlights: ['dataset metadata', 'resource URLs', 'API records', 'organization ownership'],
    pricingNotes: ['Portal access is public where the dataset/API is open', 'Premium in APIverse is for managed integration and support', 'Portal content is owned by the respective ministry/state/department'],
    sampleResponse: "{\n  \"title\": \"Open Government Data Portal India\",\n  \"resource_type\": \"api\",\n  \"organization\": \"Government of India\",\n  \"resource_count\": 24\n}",
  },
  'stripe-payments': {
    baseUrl: 'https://api.stripe.com',
    endpoint: 'POST /v1/payment_intents',
    auth: 'Secret key + webhook signature',
    protocol: 'HTTPS + form encoded / JSON helpers',
    sandboxLimit: 'Unlimited test mode',
    premiumLimit: 'Live traffic by account approval',
    successRate: '99.99%',
    regions: ['Global'],
    responseHighlights: ['payment_intent id', 'client_secret', 'status', 'amount_received'],
    pricingNotes: ['Test mode is free', 'Live mode uses transaction fees', 'Premium operations include subscriptions and billing controls'],
    sampleResponse: "{\n  \"id\": \"pi_3N...\",\n  \"status\": \"requires_payment_method\",\n  \"amount\": 4999,\n  \"currency\": \"usd\",\n  \"client_secret\": \"pi_3N..._secret...\"\n}",
  },
  'razorpay-payouts': {
    baseUrl: 'https://api.razorpay.com',
    endpoint: 'POST /v1/payouts',
    auth: 'Key id + key secret',
    protocol: 'HTTPS + JSON',
    sandboxLimit: '500 sandbox payouts/day',
    premiumLimit: 'Contract-based live volume',
    successRate: '99.95%',
    regions: ['India'],
    responseHighlights: ['payout id', 'fund_account', 'status', 'utr'],
    pricingNotes: ['Free onboarding for sandbox', 'Premium requires live business verification', 'Higher limits are contract-driven'],
    sampleResponse: "{\n  \"id\": \"pout_Ff...\",\n  \"status\": \"processing\",\n  \"amount\": 120000,\n  \"currency\": \"INR\",\n  \"mode\": \"UPI\"\n}",
  },
  'twilio-messaging': {
    baseUrl: 'https://api.twilio.com',
    endpoint: 'POST /2010-04-01/Accounts/{AccountSid}/Messages.json',
    auth: 'Account SID + Auth Token',
    protocol: 'HTTPS + form encoded',
    sandboxLimit: 'Trial messages to verified numbers',
    premiumLimit: 'Paid delivery by route and country',
    successRate: '99.88%',
    regions: ['Global'],
    responseHighlights: ['message sid', 'status', 'to', 'price'],
    pricingNotes: ['Free trial credits for verified recipients', 'Premium unlocks live sender routes', 'Per-message pricing varies by country'],
    sampleResponse: "{\n  \"sid\": \"SM12...\",\n  \"status\": \"queued\",\n  \"to\": \"+919999999999\",\n  \"body\": \"Your OTP is 481920\"\n}",
  },
  'google-maps-places': {
    baseUrl: 'https://maps.googleapis.com',
    endpoint: 'GET /maps/api/place/textsearch/json',
    auth: 'API key',
    protocol: 'HTTPS + query params',
    sandboxLimit: 'Starter quota under free credit',
    premiumLimit: 'Paid per request with quota scaling',
    successRate: '99.95%',
    regions: ['Global'],
    responseHighlights: ['results', 'formatted_address', 'geometry', 'place_id'],
    pricingNotes: ['Free monthly credit supports testing', 'Premium expands request quotas', 'Billing attaches to the same workspace account'],
    sampleResponse: "{\n  \"results\": [\n    {\n      \"name\": \"Blue Tokai Coffee\",\n      \"formatted_address\": \"Cyber Hub, Gurugram\",\n      \"place_id\": \"ChIJ...\"\n    }\n  ],\n  \"status\": \"OK\"\n}",
  },
  'uidai-aadhaar-verify': {
    baseUrl: 'https://api.apiverse.ai/gov',
    endpoint: 'POST /v1/aadhaar/verify',
    auth: 'Bearer government access token',
    protocol: 'HTTPS + JSON + consent',
    sandboxLimit: '200 single verifications/day',
    premiumLimit: 'Batch verification contracts',
    successRate: '99.94%',
    regions: ['India'],
    responseHighlights: ['reference_id', 'verification_status', 'name_match', 'dob_match'],
    pricingNotes: ['Single checks available in free mode', 'Premium unlocks batch and audit exports', 'Consent capture is mandatory'],
    sampleResponse: "{\n  \"reference_id\": \"aad_98ab\",\n  \"verification_status\": \"verified\",\n  \"name_match\": true,\n  \"dob_match\": true\n}",
  },
  'gstin-taxpayer-search': {
    baseUrl: 'https://api.apiverse.ai/gov',
    endpoint: 'GET /v1/gst/search',
    auth: 'Bearer government access token',
    protocol: 'HTTPS + query params',
    sandboxLimit: '500 GST lookups/day',
    premiumLimit: 'Business-grade lookup pool',
    successRate: '99.90%',
    regions: ['India'],
    responseHighlights: ['gstin', 'legal_name', 'trade_name', 'filing_status'],
    pricingNotes: ['Free tier covers lookup evaluation', 'Premium adds larger lookup capacity', 'Workspace controls tie usage to business email'],
    sampleResponse: "{\n  \"gstin\": \"29ABCDE1234F1Z5\",\n  \"legal_name\": \"Acme Supplies Pvt Ltd\",\n  \"filing_status\": \"active\",\n  \"taxpayer_type\": \"regular\"\n}",
  },
  'nsdl-pan-verification': {
    baseUrl: 'https://api.apiverse.ai/gov',
    endpoint: 'POST /v1/pan/verify',
    auth: 'Bearer compliance token',
    protocol: 'HTTPS + JSON',
    sandboxLimit: '100 trial verifications/day',
    premiumLimit: 'Compliance usage by monthly plan',
    successRate: '99.92%',
    regions: ['India'],
    responseHighlights: ['pan_status', 'name_match', 'category', 'last_updated'],
    pricingNotes: ['Free trial supports initial checks', 'Premium adds compliance reporting', 'Usage remains linked to workspace email'],
    sampleResponse: "{\n  \"pan\": \"ABCDE1234F\",\n  \"pan_status\": \"valid\",\n  \"name_match\": true,\n  \"category\": \"individual\"\n}",
  },
  'digilocker-document-access': {
    baseUrl: 'https://api.apiverse.ai/gov',
    endpoint: 'POST /v1/documents/fetch',
    auth: 'Bearer consent token',
    protocol: 'HTTPS + JSON',
    sandboxLimit: '300 sandbox document pulls/day',
    premiumLimit: 'Live retrieval with consent workflows',
    successRate: '99.86%',
    regions: ['India'],
    responseHighlights: ['document_type', 'issuer', 'download_url', 'verified'],
    pricingNotes: ['Sandbox is free for testing', 'Premium unlocks live user document retrieval', 'Consent and audit logs are included'],
    sampleResponse: "{\n  \"document_type\": \"aadhaar\",\n  \"issuer\": \"UIDAI\",\n  \"verified\": true,\n  \"download_url\": \"https://files.apiverse.ai/doc_123.pdf\"\n}",
  },
  'clear-kyc-business': {
    baseUrl: 'https://api.clear.in',
    endpoint: 'POST /v1/business-kyc/verify',
    auth: 'API key + secret',
    protocol: 'HTTPS + JSON',
    sandboxLimit: '250 verification workflows/day',
    premiumLimit: 'Operational KYC volume by plan',
    successRate: '99.89%',
    regions: ['India'],
    responseHighlights: ['business_status', 'pan_verified', 'gst_verified', 'risk_flags'],
    pricingNotes: ['Free trial for workflow evaluation', 'Premium unlocks team workflows and reporting', 'Built for merchant onboarding operations'],
    sampleResponse: "{\n  \"business_status\": \"verified\",\n  \"pan_verified\": true,\n  \"gst_verified\": true,\n  \"risk_flags\": []\n}",
  },
};


export const ALL_APIS = [
  {
    "id": "ai-openai",
    "name": "Responses API",
    "provider": "OpenAI",
    "description": "Text generation, structured outputs, tools, and agent workflows for production products.",
    "category": "AI / ML",
    "tags": [
      "LLM",
      "GPT",
      "Agents"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.9,
    "reviews": 3120,
    "uptime": 99.97,
    "latency": "420ms",
    "version": "v1.8",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "Go"
    ],
    "monthlyFree": "$5 credits",
    "slug": "openai-responses"
  },
  {
    "id": "ai-chatgpt",
    "name": "Conversation Gateway",
    "provider": "ChatGPT",
    "description": "Assistant-style conversational APIs with retrieval, orchestration, and rich chat behavior.",
    "category": "AI / ML",
    "tags": [
      "Chat",
      "Retrieval",
      "Memory"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.8,
    "reviews": 1700,
    "uptime": 99.91,
    "latency": "380ms",
    "version": "v2.0",
    "trending": true,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "Trial msgs",
    "slug": "chatgpt-conversation-gateway"
  },
  {
    "id": "ai-claude",
    "name": "Claude API",
    "provider": "Anthropic",
    "description": "Advanced reasoning, analysis, code generation with configurable safety controls and long context.",
    "category": "AI / ML",
    "tags": [
      "LLM",
      "Reasoning",
      "Safety"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.8,
    "reviews": 1920,
    "uptime": 99.93,
    "latency": "350ms",
    "version": "v3.5",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "Go"
    ],
    "monthlyFree": "$5 credits",
    "slug": "ai-claude"
  },
  {
    "id": "ai-gemini",
    "name": "Gemini API",
    "provider": "Google",
    "description": "Multimodal AI model for text, image, audio, and video understanding with grounding support.",
    "category": "AI / ML",
    "tags": [
      "Multimodal",
      "Vision",
      "Grounding"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.7,
    "reviews": 2450,
    "uptime": 99.95,
    "latency": "310ms",
    "version": "v2.0",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "Go",
      "Dart"
    ],
    "monthlyFree": "60 req/min",
    "slug": "ai-gemini"
  },
  {
    "id": "ai-mistral",
    "name": "Chat Completions",
    "provider": "Mistral AI",
    "description": "Open-weight and proprietary models for chat, code, and embeddings with EU data residency.",
    "category": "AI / ML",
    "tags": [
      "LLM",
      "Open-source",
      "EU"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.6,
    "reviews": 870,
    "uptime": 99.88,
    "latency": "280ms",
    "version": "v1.2",
    "trending": false,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "$5 credits",
    "slug": "ai-mistral"
  },
  {
    "id": "ai-cohere",
    "name": "Embed & Rerank",
    "provider": "Cohere",
    "description": "Text embeddings and semantic reranking for RAG, search, and classification workflows.",
    "category": "AI / ML",
    "tags": [
      "Embeddings",
      "Search",
      "RAG"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.5,
    "reviews": 640,
    "uptime": 99.85,
    "latency": "120ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "1K embed/mo",
    "slug": "ai-cohere"
  },
  {
    "id": "ai-huggingface",
    "name": "Inference API",
    "provider": "Hugging Face",
    "description": "Run 200K+ open-source models for NLP, vision, audio, and multimodal tasks via serverless endpoints.",
    "category": "AI / ML",
    "tags": [
      "Open-source",
      "Models",
      "NLP"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 3400,
    "uptime": 99.8,
    "latency": "450ms",
    "version": "v4.0",
    "trending": false,
    "sdks": [
      "Python",
      "Node",
      "Rust"
    ],
    "monthlyFree": "Rate limited",
    "slug": "ai-huggingface"
  },
  {
    "id": "ai-stability",
    "name": "Image Generation",
    "provider": "Stability AI",
    "description": "Generate, edit, and upscale images with Stable Diffusion models via REST API.",
    "category": "AI / ML",
    "tags": [
      "Image",
      "Diffusion",
      "Creative"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.5,
    "reviews": 1230,
    "uptime": 99.82,
    "latency": "3200ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "25 credits",
    "slug": "ai-stability"
  },
  {
    "id": "ai-elevenlabs",
    "name": "Text to Speech",
    "provider": "ElevenLabs",
    "description": "Ultra-realistic AI voice generation with custom voice cloning and 29+ language support.",
    "category": "AI / ML",
    "tags": [
      "TTS",
      "Voice",
      "Audio"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.7,
    "reviews": 1560,
    "uptime": 99.9,
    "latency": "250ms",
    "version": "v2.5",
    "trending": true,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "10K chars",
    "slug": "ai-elevenlabs"
  },
  {
    "id": "ai-deepgram",
    "name": "Speech to Text",
    "provider": "Deepgram",
    "description": "Real-time and batch speech recognition with diarization, punctuation, and language detection.",
    "category": "AI / ML",
    "tags": [
      "STT",
      "Transcription",
      "Real-time"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 890,
    "uptime": 99.87,
    "latency": "180ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Python",
      "Node",
      "Go"
    ],
    "monthlyFree": "$200 credits",
    "slug": "ai-deepgram"
  },
  {
    "id": "ai-assemblyai",
    "name": "Transcription API",
    "provider": "AssemblyAI",
    "description": "Audio intelligence with transcription, summarization, sentiment, and content moderation.",
    "category": "AI / ML",
    "tags": [
      "Transcription",
      "Audio",
      "NLP"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.5,
    "reviews": 720,
    "uptime": 99.84,
    "latency": "200ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "100 hrs",
    "slug": "ai-assemblyai"
  },
  {
    "id": "ai-replicate",
    "name": "Model Hosting",
    "provider": "Replicate",
    "description": "Run open-source ML models in the cloud with one API call. Pay per second of compute.",
    "category": "AI / ML",
    "tags": [
      "ML",
      "Hosting",
      "Serverless"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.4,
    "reviews": 950,
    "uptime": 99.78,
    "latency": "1200ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "Free tier",
    "slug": "ai-replicate"
  },
  {
    "id": "ai-groq",
    "name": "Fast Inference",
    "provider": "Groq",
    "description": "Ultra-fast LLM inference with Llama, Mixtral, and Gemma models. Sub-100ms token generation.",
    "category": "AI / ML",
    "tags": [
      "LLM",
      "Fast",
      "Open-source"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.7,
    "reviews": 1100,
    "uptime": 99.9,
    "latency": "45ms",
    "version": "v1.0",
    "trending": true,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "14.4K req/day",
    "slug": "ai-groq"
  },
  {
    "id": "ai-perplexity",
    "name": "Online Search",
    "provider": "Perplexity",
    "description": "AI-powered search API with real-time web access, citations, and source attribution.",
    "category": "AI / ML",
    "tags": [
      "Search",
      "Web",
      "Citations"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.6,
    "reviews": 780,
    "uptime": 99.85,
    "latency": "800ms",
    "version": "v1.0",
    "trending": true,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "None",
    "slug": "ai-perplexity"
  },
  {
    "id": "ai-together",
    "name": "Open Models",
    "provider": "Together AI",
    "description": "Serverless and dedicated inference for open-source models with fine-tuning support.",
    "category": "AI / ML",
    "tags": [
      "LLM",
      "Fine-tuning",
      "Open-source"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.4,
    "reviews": 520,
    "uptime": 99.82,
    "latency": "180ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "$5 credits",
    "slug": "ai-together"
  },
  {
    "id": "ai-fireworks",
    "name": "Serverless Models",
    "provider": "Fireworks AI",
    "description": "Fastest open-source model serving with function calling, JSON mode, and grammar constraints.",
    "category": "AI / ML",
    "tags": [
      "LLM",
      "Fast",
      "Functions"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.5,
    "reviews": 430,
    "uptime": 99.85,
    "latency": "120ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "$1 credits",
    "slug": "ai-fireworks"
  },
  {
    "id": "ai-sarvam",
    "name": "Indic Language API",
    "provider": "Sarvam AI",
    "description": "Indian language NLP with translation, transliteration, TTS, and STT for 10+ Indic languages.",
    "category": "AI / ML",
    "tags": [
      "Indic",
      "Translation",
      "NLP"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.4,
    "reviews": 340,
    "uptime": 99.75,
    "latency": "300ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "1K calls",
    "slug": "sarvam-indic-ai"
  },
  {
    "id": "ai-runway",
    "name": "Video Generation",
    "provider": "Runway",
    "description": "Generate and edit video with Gen-3 Alpha. Text-to-video, image-to-video, and motion brush.",
    "category": "AI / ML",
    "tags": [
      "Video",
      "Gen-AI",
      "Creative"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.6,
    "reviews": 890,
    "uptime": 99.8,
    "latency": "8000ms",
    "version": "v3.0",
    "trending": true,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "None",
    "slug": "ai-runway"
  },
  {
    "id": "ai-pinecone",
    "name": "Vector Database",
    "provider": "Pinecone",
    "description": "Managed vector database for similarity search, recommendation, and RAG applications at scale.",
    "category": "AI / ML",
    "tags": [
      "Vector",
      "Search",
      "RAG"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.5,
    "reviews": 1340,
    "uptime": 99.95,
    "latency": "30ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Python",
      "Node",
      "Go"
    ],
    "monthlyFree": "100K vectors",
    "slug": "ai-pinecone"
  },
  {
    "id": "ai-vision",
    "name": "Image Recognition",
    "provider": "APIverse Vision",
    "description": "Object detection, scene classification, OCR, and face detection with 94% accuracy benchmark.",
    "category": "AI / ML",
    "tags": [
      "Vision",
      "OCR",
      "Detection"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.5,
    "reviews": 876,
    "uptime": 99.82,
    "latency": "180ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "200 calls",
    "slug": "ai-vision"
  },
  {
    "id": "ai-sentiment",
    "name": "Sentiment Analysis",
    "provider": "NLP Labs",
    "description": "Analyze text sentiment, emotions, and intent with multilingual support including Hindi and Tamil.",
    "category": "AI / ML",
    "tags": [
      "NLP",
      "Sentiment",
      "Multilingual"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.3,
    "reviews": 654,
    "uptime": 99.78,
    "latency": "95ms",
    "version": "v1.5",
    "trending": false,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "5K calls",
    "slug": "ai-sentiment"
  },
  {
    "id": "pay-stripe",
    "name": "Payments API",
    "provider": "Stripe",
    "description": "Charges, subscriptions, invoicing, and payouts with mature webhook and billing workflows.",
    "category": "Payments",
    "tags": [
      "Cards",
      "Subscriptions",
      "Webhooks"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.9,
    "reviews": 3100,
    "uptime": 99.99,
    "latency": "110ms",
    "version": "v15.0",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "Go",
      "Ruby",
      "PHP",
      "Java"
    ],
    "monthlyFree": "Test mode",
    "slug": "stripe-payments"
  },
  {
    "id": "pay-razorpay",
    "name": "Payouts API",
    "provider": "Razorpay",
    "description": "Collections, settlement, and payout orchestration tailored to Indian payment operations.",
    "category": "Payments",
    "tags": [
      "India",
      "Payouts",
      "UPI"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.6,
    "reviews": 640,
    "uptime": 99.95,
    "latency": "145ms",
    "version": "v2.3",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP"
    ],
    "monthlyFree": "Test mode",
    "slug": "razorpay-payouts"
  },
  {
    "id": "pay-paypal",
    "name": "Checkout API",
    "provider": "PayPal",
    "description": "One-click checkout, subscriptions, invoicing, and global payment acceptance in 200+ markets.",
    "category": "Payments",
    "tags": [
      "Global",
      "Checkout",
      "Subscriptions"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.5,
    "reviews": 2800,
    "uptime": 99.96,
    "latency": "200ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Java"
    ],
    "monthlyFree": "Sandbox",
    "slug": "pay-stripe"
  },
  {
    "id": "pay-square",
    "name": "Payments API",
    "provider": "Square",
    "description": "In-person and online payments with invoicing, terminal integration, and inventory sync.",
    "category": "Payments",
    "tags": [
      "POS",
      "Cards",
      "Inventory"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.4,
    "reviews": 1200,
    "uptime": 99.93,
    "latency": "130ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Ruby",
      "PHP"
    ],
    "monthlyFree": "Sandbox",
    "slug": "pay-square"
  },
  {
    "id": "pay-adyen",
    "name": "Payment Gateway",
    "provider": "Adyen",
    "description": "Unified commerce platform for online, in-app, and in-store payments with global acquiring.",
    "category": "Payments",
    "tags": [
      "Enterprise",
      "Global",
      "Omnichannel"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.7,
    "reviews": 890,
    "uptime": 99.98,
    "latency": "95ms",
    "version": "v70",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Go",
      "Java",
      ".NET"
    ],
    "monthlyFree": "Test mode",
    "slug": "pay-adyen"
  },
  {
    "id": "pay-cashfree",
    "name": "Payment Gateway",
    "provider": "Cashfree",
    "description": "Accept payments via UPI, cards, net banking, and wallets with instant split settlements.",
    "category": "Payments",
    "tags": [
      "India",
      "UPI",
      "Splits"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.5,
    "reviews": 560,
    "uptime": 99.92,
    "latency": "140ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Java"
    ],
    "monthlyFree": "Test mode",
    "slug": "pay-cashfree"
  },
  {
    "id": "pay-phonepe",
    "name": "Business API",
    "provider": "PhonePe",
    "description": "UPI payments, subscriptions, and merchant settlement for Indian commerce workflows.",
    "category": "Payments",
    "tags": [
      "UPI",
      "India",
      "Subscriptions"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.4,
    "reviews": 430,
    "uptime": 99.9,
    "latency": "160ms",
    "version": "v4.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Java"
    ],
    "monthlyFree": "UAT mode",
    "slug": "pay-phonepe"
  },
  {
    "id": "pay-upi",
    "name": "UPI Transaction Status",
    "provider": "NPCI",
    "description": "Real-time UPI payment status check, VPA validation, and merchant settlement confirmation.",
    "category": "Payments",
    "tags": [
      "UPI",
      "NPCI",
      "Status"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.8,
    "reviews": 987,
    "uptime": 99.99,
    "latency": "28ms",
    "version": "v4.0",
    "trending": true,
    "sdks": [
      "Java",
      "Node",
      "PHP"
    ],
    "monthlyFree": "None",
    "slug": "pay-upi"
  },
  {
    "id": "pay-braintree",
    "name": "Payment API",
    "provider": "Braintree",
    "description": "Drop-in payment UI with Venmo, PayPal, cards, and Apple Pay support built-in.",
    "category": "Payments",
    "tags": [
      "Venmo",
      "Drop-in",
      "Multi-method"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.3,
    "reviews": 1100,
    "uptime": 99.94,
    "latency": "180ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Ruby",
      "PHP",
      "Java"
    ],
    "monthlyFree": "Sandbox",
    "slug": "pay-braintree"
  },
  {
    "id": "pay-mollie",
    "name": "Payments API",
    "provider": "Mollie",
    "description": "European payment methods including iDEAL, SEPA, Bancontact, and credit cards with simple integration.",
    "category": "Payments",
    "tags": [
      "Europe",
      "iDEAL",
      "SEPA"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.5,
    "reviews": 670,
    "uptime": 99.93,
    "latency": "150ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Ruby"
    ],
    "monthlyFree": "Test mode",
    "slug": "pay-mollie"
  },
  {
    "id": "pay-bankverify",
    "name": "Bank Account Verify",
    "provider": "RazorpayX",
    "description": "Instant penny drop verification to validate bank account ownership and IFSC routing.",
    "category": "Payments",
    "tags": [
      "Banking",
      "Verification",
      "KYC"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.6,
    "reviews": 743,
    "uptime": 99.95,
    "latency": "420ms",
    "version": "v2.3",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP"
    ],
    "monthlyFree": "None",
    "slug": "pay-bankverify"
  },
  {
    "id": "msg-twilio",
    "name": "Messaging API",
    "provider": "Twilio",
    "description": "SMS, OTP, and delivery status APIs with global routing and operational event feeds.",
    "category": "Messaging",
    "tags": [
      "SMS",
      "OTP",
      "Global"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.7,
    "reviews": 980,
    "uptime": 99.88,
    "latency": "190ms",
    "version": "v3.1",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Java",
      "Go"
    ],
    "monthlyFree": "Trial credits",
    "slug": "twilio-messaging"
  },
  {
    "id": "msg-sendgrid",
    "name": "Email API",
    "provider": "SendGrid",
    "description": "Transactional and marketing email delivery with templates, analytics, and deliverability tools.",
    "category": "Messaging",
    "tags": [
      "Email",
      "Templates",
      "Analytics"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.5,
    "reviews": 2100,
    "uptime": 99.9,
    "latency": "120ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Ruby",
      "Go",
      "Java"
    ],
    "monthlyFree": "100/day",
    "slug": "msg-twilio"
  },
  {
    "id": "msg-mailgun",
    "name": "Email API",
    "provider": "Mailgun",
    "description": "Email sending, receiving, and validation with powerful routing rules and webhook events.",
    "category": "Messaging",
    "tags": [
      "Email",
      "Validation",
      "Webhooks"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.4,
    "reviews": 1450,
    "uptime": 99.85,
    "latency": "130ms",
    "version": "v4.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Ruby",
      "Go",
      "Java"
    ],
    "monthlyFree": "100/day",
    "slug": "msg-mailgun"
  },
  {
    "id": "msg-postmark",
    "name": "Transactional Email",
    "provider": "Postmark",
    "description": "Fast transactional email delivery with inbound processing and broadcast messaging.",
    "category": "Messaging",
    "tags": [
      "Email",
      "Fast",
      "Inbound"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.7,
    "reviews": 890,
    "uptime": 99.95,
    "latency": "85ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Ruby"
    ],
    "monthlyFree": "100 emails",
    "slug": "msg-postmark"
  },
  {
    "id": "msg-vonage",
    "name": "SMS API",
    "provider": "Vonage",
    "description": "Programmable SMS, MMS, and voice APIs with number insights and verify workflows.",
    "category": "Messaging",
    "tags": [
      "SMS",
      "Voice",
      "Verify"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.4,
    "reviews": 760,
    "uptime": 99.82,
    "latency": "200ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Java",
      ".NET"
    ],
    "monthlyFree": "€2 credits",
    "slug": "msg-vonage"
  },
  {
    "id": "msg-whatsapp",
    "name": "WhatsApp Business",
    "provider": "Meta",
    "description": "Send template messages, interactive buttons, and media via WhatsApp Business with webhooks.",
    "category": "Messaging",
    "tags": [
      "WhatsApp",
      "Templates",
      "Media"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.4,
    "reviews": 932,
    "uptime": 99.8,
    "latency": "145ms",
    "version": "v18.0",
    "trending": true,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "1K msgs",
    "slug": "msg-whatsapp"
  },
  {
    "id": "msg-slack",
    "name": "Web API",
    "provider": "Slack",
    "description": "Send messages, manage channels, handle events, and build interactive Slack apps and bots.",
    "category": "Messaging",
    "tags": [
      "Chat",
      "Bots",
      "Events"
    ],
    "pricing": "Free",
    "pricingTier": "free",
    "rating": 4.6,
    "reviews": 3200,
    "uptime": 99.95,
    "latency": "90ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Java"
    ],
    "monthlyFree": "Unlimited",
    "slug": "msg-slack"
  },
  {
    "id": "msg-discord",
    "name": "Bot API",
    "provider": "Discord",
    "description": "Build bots with slash commands, interactions, voice channels, and rich message components.",
    "category": "Messaging",
    "tags": [
      "Bots",
      "Gaming",
      "Community"
    ],
    "pricing": "Free",
    "pricingTier": "free",
    "rating": 4.5,
    "reviews": 4100,
    "uptime": 99.88,
    "latency": "80ms",
    "version": "v10",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Rust"
    ],
    "monthlyFree": "Unlimited",
    "slug": "msg-discord"
  },
  {
    "id": "msg-telegram",
    "name": "Bot API",
    "provider": "Telegram",
    "description": "Build conversational bots with inline keyboards, payments, games, and group management.",
    "category": "Messaging",
    "tags": [
      "Bots",
      "Inline",
      "Payments"
    ],
    "pricing": "Free",
    "pricingTier": "free",
    "rating": 4.6,
    "reviews": 5200,
    "uptime": 99.9,
    "latency": "60ms",
    "version": "v7.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Go",
      "PHP"
    ],
    "monthlyFree": "Unlimited",
    "slug": "msg-telegram"
  },
  {
    "id": "msg-resend",
    "name": "Email API",
    "provider": "Resend",
    "description": "Modern email API built for developers with React Email support and real-time webhooks.",
    "category": "Messaging",
    "tags": [
      "Email",
      "React",
      "Modern"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 340,
    "uptime": 99.9,
    "latency": "95ms",
    "version": "v1.0",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "Go",
      "Ruby"
    ],
    "monthlyFree": "100/day",
    "slug": "msg-resend"
  },
  {
    "id": "msg-sms-gw",
    "name": "SMS & OTP Gateway",
    "provider": "APIverse Messaging",
    "description": "Send transactional SMS and OTPs across 190+ countries with DLT compliance and delivery receipts.",
    "category": "Messaging",
    "tags": [
      "SMS",
      "OTP",
      "DLT"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.5,
    "reviews": 1654,
    "uptime": 99.88,
    "latency": "95ms",
    "version": "v3.1",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Java",
      "Go"
    ],
    "monthlyFree": "100 SMS",
    "slug": "msg-sms-gw"
  },
  {
    "id": "map-google",
    "name": "Places API",
    "provider": "Google Maps",
    "description": "Search, geocoding, routing, and place enrichment with broad international coverage.",
    "category": "Maps",
    "tags": [
      "Search",
      "Geocoding",
      "Routing"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.8,
    "reviews": 1200,
    "uptime": 99.97,
    "latency": "130ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Go",
      "Java"
    ],
    "monthlyFree": "$200 credit",
    "slug": "google-maps-places"
  },
  {
    "id": "map-mapbox",
    "name": "Maps SDK",
    "provider": "Mapbox",
    "description": "Custom map styles, navigation, geocoding, and real-time traffic with GL rendering.",
    "category": "Maps",
    "tags": [
      "Custom",
      "Navigation",
      "GL"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.7,
    "reviews": 980,
    "uptime": 99.93,
    "latency": "100ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Swift",
      "Kotlin"
    ],
    "monthlyFree": "50K loads",
    "slug": "map-google"
  },
  {
    "id": "map-here",
    "name": "Geocoding API",
    "provider": "HERE",
    "description": "Location services with geocoding, routing, fleet management, and indoor positioning.",
    "category": "Maps",
    "tags": [
      "Fleet",
      "Routing",
      "Indoor"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.5,
    "reviews": 670,
    "uptime": 99.9,
    "latency": "120ms",
    "version": "v7.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Java"
    ],
    "monthlyFree": "250K txns",
    "slug": "map-here"
  },
  {
    "id": "map-tomtom",
    "name": "Routing API",
    "provider": "TomTom",
    "description": "Route planning, traffic flow, EV routing, and map display with real-time traffic data.",
    "category": "Maps",
    "tags": [
      "Routing",
      "Traffic",
      "EV"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.4,
    "reviews": 430,
    "uptime": 99.88,
    "latency": "150ms",
    "version": "v6.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "2.5K req/day",
    "slug": "map-tomtom"
  },
  {
    "id": "map-w3w",
    "name": "Address API",
    "provider": "what3words",
    "description": "Convert 3-word addresses to coordinates and back. Precise location in any language.",
    "category": "Maps",
    "tags": [
      "Addressing",
      "Precise",
      "Global"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.3,
    "reviews": 320,
    "uptime": 99.85,
    "latency": "80ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Swift",
      "Java"
    ],
    "monthlyFree": "1K calls",
    "slug": "map-w3w"
  },
  {
    "id": "map-ipinfo",
    "name": "IP Geolocation",
    "provider": "IPinfo",
    "description": "IP to location, ASN, company, privacy detection, and abuse contact data for any IP.",
    "category": "Maps",
    "tags": [
      "IP",
      "Privacy",
      "ASN"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 1100,
    "uptime": 99.95,
    "latency": "25ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Go",
      "PHP",
      "Ruby"
    ],
    "monthlyFree": "50K/mo",
    "slug": "map-ipinfo"
  },
  {
    "id": "map-radar",
    "name": "Geofencing API",
    "provider": "Radar",
    "description": "Geofencing, trip tracking, address autocomplete, and fraud detection for mobile and web.",
    "category": "Maps",
    "tags": [
      "Geofencing",
      "Mobile",
      "Fraud"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.5,
    "reviews": 450,
    "uptime": 99.9,
    "latency": "70ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Node",
      "Swift",
      "Kotlin",
      "React Native"
    ],
    "monthlyFree": "100K calls",
    "slug": "map-radar"
  },
  {
    "id": "map-opencage",
    "name": "Geocoding API",
    "provider": "OpenCage",
    "description": "Forward and reverse geocoding using open data sources. No vendor lock-in, transparent pricing.",
    "category": "Maps",
    "tags": [
      "Open-data",
      "Geocoding",
      "Transparent"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.4,
    "reviews": 290,
    "uptime": 99.88,
    "latency": "110ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Ruby"
    ],
    "monthlyFree": "2.5K/day",
    "slug": "map-opencage"
  },
  {
    "id": "gov-aadhaar",
    "name": "Aadhaar Verify",
    "provider": "UIDAI",
    "description": "Identity verification workflows for onboarding, KYC, and compliance-heavy citizen journeys.",
    "category": "Government",
    "tags": [
      "KYC",
      "Identity",
      "Biometric"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.7,
    "reviews": 2341,
    "uptime": 99.97,
    "latency": "160ms",
    "version": "v3.2",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "Go"
    ],
    "monthlyFree": "1K calls",
    "slug": "uidai-aadhaar-verify"
  },
  {
    "id": "gov-gst",
    "name": "GST Taxpayer Search",
    "provider": "GSTN",
    "description": "Search GST taxpayer registration data, filing status, and business identity for commerce.",
    "category": "Government",
    "tags": [
      "Tax",
      "Business",
      "Compliance"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 1876,
    "uptime": 99.94,
    "latency": "175ms",
    "version": "v2.1",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Java"
    ],
    "monthlyFree": "Free lookups",
    "slug": "gstin-taxpayer-search"
  },
  {
    "id": "gov-pan",
    "name": "PAN Verification",
    "provider": "NSDL",
    "description": "Validate PAN identity for lending, payroll, onboarding, and tax-linked compliance workflows.",
    "category": "Government",
    "tags": [
      "KYC",
      "Tax",
      "Identity"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.5,
    "reviews": 1432,
    "uptime": 99.91,
    "latency": "150ms",
    "version": "v2.4",
    "trending": false,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "Trial calls",
    "slug": "nsdl-pan-verification"
  },
  {
    "id": "gov-digilocker",
    "name": "Document Access",
    "provider": "DigiLocker",
    "description": "Access verified digital documents for onboarding, lending, employment, and government compliance.",
    "category": "Government",
    "tags": [
      "Documents",
      "eKYC",
      "Digital"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 390,
    "uptime": 99.85,
    "latency": "210ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "Sandbox",
    "slug": "digilocker-document-access"
  },
  {
    "id": "gov-vahan",
    "name": "Vehicle RC Check",
    "provider": "Vahan (MoRTH)",
    "description": "Vehicle registration lookup with owner details, insurance status, and fitness certificate data.",
    "category": "Government",
    "tags": [
      "Vehicle",
      "RC",
      "Insurance"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.4,
    "reviews": 560,
    "uptime": 99.8,
    "latency": "320ms",
    "version": "v1.5",
    "trending": false,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "None",
    "slug": "gov-aadhaar"
  },
  {
    "id": "gov-ecourts",
    "name": "Case Status API",
    "provider": "e-Courts",
    "description": "Search court cases by CNR, party name, or FIR number across district and high courts.",
    "category": "Government",
    "tags": [
      "Legal",
      "Courts",
      "Case-status"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.2,
    "reviews": 280,
    "uptime": 99.7,
    "latency": "450ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "None",
    "slug": "gov-ecourts"
  },
  {
    "id": "gov-epfo",
    "name": "UAN Verification",
    "provider": "EPFO",
    "description": "Verify Universal Account Number and fetch EPF passbook data for employment verification.",
    "category": "Government",
    "tags": [
      "Employment",
      "EPF",
      "Verification"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.3,
    "reviews": 340,
    "uptime": 99.75,
    "latency": "380ms",
    "version": "v1.2",
    "trending": false,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "None",
    "slug": "gov-epfo"
  },
  {
    "id": "gov-ckyc",
    "name": "Central KYC",
    "provider": "CERSAI",
    "description": "Fetch and submit KYC records from the Central KYC Registry for financial institution compliance.",
    "category": "Government",
    "tags": [
      "KYC",
      "Financial",
      "Compliance"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.4,
    "reviews": 410,
    "uptime": 99.85,
    "latency": "250ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Java"
    ],
    "monthlyFree": "None",
    "slug": "gov-ckyc"
  },
  {
    "id": "gov-pincode",
    "name": "India Pincode API",
    "provider": "India Post",
    "description": "Postal data lookup with district, state, taluk, and nearby post offices for any 6-digit pincode.",
    "category": "Government",
    "tags": [
      "Postal",
      "Location",
      "Address"
    ],
    "pricing": "Free",
    "pricingTier": "free",
    "rating": 4.6,
    "reviews": 4230,
    "uptime": 100,
    "latency": "18ms",
    "version": "v1.3",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Java",
      "Go",
      "Ruby"
    ],
    "monthlyFree": "Unlimited",
    "slug": "gov-pincode"
  },
  {
    "id": "id-clear",
    "name": "Business KYC",
    "provider": "Clear",
    "description": "Bundle PAN, GST, CIN, and identity verification into a single onboarding pipeline.",
    "category": "Identity",
    "tags": [
      "KYC",
      "Onboarding",
      "Business"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.7,
    "reviews": 520,
    "uptime": 99.9,
    "latency": "140ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "Trial calls",
    "slug": "clear-kyc-business"
  },
  {
    "id": "id-auth0",
    "name": "Authentication",
    "provider": "Auth0",
    "description": "Universal login, MFA, SSO, and user management with pre-built UI components and rules.",
    "category": "Identity",
    "tags": [
      "Auth",
      "SSO",
      "MFA"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.7,
    "reviews": 2800,
    "uptime": 99.95,
    "latency": "80ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Go",
      "Java",
      ".NET",
      "Swift"
    ],
    "monthlyFree": "25K MAU",
    "slug": "id-clear"
  },
  {
    "id": "id-clerk",
    "name": "User Auth",
    "provider": "Clerk",
    "description": "Modern authentication with pre-built components, session management, and organization support.",
    "category": "Identity",
    "tags": [
      "Auth",
      "React",
      "Sessions"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 890,
    "uptime": 99.93,
    "latency": "70ms",
    "version": "v5.0",
    "trending": true,
    "sdks": [
      "Node",
      "React",
      "Next.js"
    ],
    "monthlyFree": "10K MAU",
    "slug": "id-clerk"
  },
  {
    "id": "id-sumsub",
    "name": "KYC & AML",
    "provider": "Sumsub",
    "description": "Identity verification, KYC, AML screening, and document authentication in 220+ countries.",
    "category": "Identity",
    "tags": [
      "KYC",
      "AML",
      "Documents"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.5,
    "reviews": 670,
    "uptime": 99.9,
    "latency": "2000ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Java"
    ],
    "monthlyFree": "None",
    "slug": "id-sumsub"
  },
  {
    "id": "id-onfido",
    "name": "Identity Verification",
    "provider": "Onfido",
    "description": "Document and biometric verification with AI-powered fraud detection and atlas reports.",
    "category": "Identity",
    "tags": [
      "Biometric",
      "Documents",
      "Fraud"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.5,
    "reviews": 540,
    "uptime": 99.88,
    "latency": "1800ms",
    "version": "v3.6",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Java"
    ],
    "monthlyFree": "None",
    "slug": "id-onfido"
  },
  {
    "id": "id-firebase-auth",
    "name": "Authentication",
    "provider": "Firebase",
    "description": "Drop-in authentication with email, phone, Google, Apple, and social sign-in providers.",
    "category": "Identity",
    "tags": [
      "Auth",
      "Social",
      "Phone"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 5400,
    "uptime": 99.95,
    "latency": "60ms",
    "version": "v9.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Swift",
      "Kotlin",
      "Flutter"
    ],
    "monthlyFree": "50K MAU",
    "slug": "id-firebase-auth"
  },
  {
    "id": "id-okta",
    "name": "Identity Management",
    "provider": "Okta",
    "description": "Enterprise identity platform with workforce and customer identity, SSO, and lifecycle management.",
    "category": "Identity",
    "tags": [
      "Enterprise",
      "SSO",
      "SCIM"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.6,
    "reviews": 1200,
    "uptime": 99.97,
    "latency": "90ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Java",
      ".NET",
      "Go"
    ],
    "monthlyFree": "Dev account",
    "slug": "id-okta"
  },
  {
    "id": "id-jumio",
    "name": "ID Verification",
    "provider": "Jumio",
    "description": "AI-powered identity proofing with liveness detection, age estimation, and fraud prevention.",
    "category": "Identity",
    "tags": [
      "Liveness",
      "ID-proofing",
      "Fraud"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.4,
    "reviews": 380,
    "uptime": 99.85,
    "latency": "2200ms",
    "version": "v4.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Swift",
      "Kotlin"
    ],
    "monthlyFree": "None",
    "slug": "id-jumio"
  },
  {
    "id": "fin-plaid",
    "name": "Bank Linking",
    "provider": "Plaid",
    "description": "Connect bank accounts, verify identity, check balances, and access transaction history.",
    "category": "Fintech",
    "tags": [
      "Banking",
      "Accounts",
      "Transactions"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.6,
    "reviews": 1800,
    "uptime": 99.92,
    "latency": "350ms",
    "version": "v2.0",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "Ruby",
      "Go"
    ],
    "monthlyFree": "100 items",
    "slug": "fin-plaid"
  },
  {
    "id": "fin-setu",
    "name": "UPI & AA API",
    "provider": "Setu",
    "description": "UPI DeepLinks, Account Aggregator data, and BBPS payments for Indian fintech products.",
    "category": "Fintech",
    "tags": [
      "UPI",
      "AA",
      "India"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.5,
    "reviews": 430,
    "uptime": 99.88,
    "latency": "200ms",
    "version": "v2.0",
    "trending": true,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "Sandbox",
    "slug": "fin-setu"
  },
  {
    "id": "fin-truelayer",
    "name": "Open Banking",
    "provider": "TrueLayer",
    "description": "Open banking payments, data access, and identity verification for UK and European markets.",
    "category": "Fintech",
    "tags": [
      "Open-banking",
      "PSD2",
      "Europe"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.5,
    "reviews": 540,
    "uptime": 99.9,
    "latency": "280ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      ".NET"
    ],
    "monthlyFree": "Sandbox",
    "slug": "fin-truelayer"
  },
  {
    "id": "fin-yodlee",
    "name": "Financial Data",
    "provider": "Yodlee",
    "description": "Aggregate financial data from 20K+ sources for PFM, lending, and wealth management apps.",
    "category": "Fintech",
    "tags": [
      "Aggregation",
      "Wealth",
      "PFM"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.3,
    "reviews": 670,
    "uptime": 99.85,
    "latency": "400ms",
    "version": "v1.1",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Java"
    ],
    "monthlyFree": "None",
    "slug": "fin-yodlee"
  },
  {
    "id": "fin-mx",
    "name": "Financial API",
    "provider": "MX",
    "description": "Financial data enrichment, categorization, and account connectivity for banking and fintech.",
    "category": "Fintech",
    "tags": [
      "Enrichment",
      "Categories",
      "Banking"
    ],
    "pricing": "Paid",
    "pricingTier": "paid",
    "rating": 4.4,
    "reviews": 320,
    "uptime": 99.88,
    "latency": "220ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Ruby"
    ],
    "monthlyFree": "None",
    "slug": "fin-mx"
  },
  {
    "id": "fin-razorpayx",
    "name": "Banking API",
    "provider": "Razorpay X",
    "description": "Current accounts, payouts, vendor payments, and tax payments via banking APIs for businesses.",
    "category": "Fintech",
    "tags": [
      "Banking",
      "Payouts",
      "India"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.5,
    "reviews": 380,
    "uptime": 99.9,
    "latency": "180ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP"
    ],
    "monthlyFree": "Test mode",
    "slug": "fin-razorpayx"
  },
  {
    "id": "fin-coingecko",
    "name": "Crypto API",
    "provider": "CoinGecko",
    "description": "Real-time crypto prices, market data, exchange volumes, and historical OHLC for 13K+ coins.",
    "category": "Fintech",
    "tags": [
      "Crypto",
      "Prices",
      "Markets"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.5,
    "reviews": 2100,
    "uptime": 99.85,
    "latency": "60ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Ruby"
    ],
    "monthlyFree": "30 calls/min",
    "slug": "fin-coingecko"
  },
  {
    "id": "fin-exchangerate",
    "name": "Currency API",
    "provider": "ExchangeRate",
    "description": "Real-time and historical exchange rates for 160+ currencies with daily updates and caching.",
    "category": "Fintech",
    "tags": [
      "Forex",
      "Currency",
      "Rates"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.4,
    "reviews": 1800,
    "uptime": 99.95,
    "latency": "30ms",
    "version": "v6.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP"
    ],
    "monthlyFree": "1.5K req/mo",
    "slug": "fin-exchangerate"
  },
  {
    "id": "cloud-aws-s3",
    "name": "Object Storage",
    "provider": "AWS S3",
    "description": "Scalable object storage with lifecycle policies, versioning, and cross-region replication.",
    "category": "Cloud",
    "tags": [
      "Storage",
      "S3",
      "CDN"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.8,
    "reviews": 4500,
    "uptime": 99.99,
    "latency": "50ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Go",
      "Java",
      ".NET",
      "Ruby"
    ],
    "monthlyFree": "5GB",
    "slug": "cloud-aws-s3"
  },
  {
    "id": "cloud-cloudflare",
    "name": "Workers API",
    "provider": "Cloudflare",
    "description": "Serverless compute at the edge with KV storage, Durable Objects, and D1 database.",
    "category": "Cloud",
    "tags": [
      "Edge",
      "Serverless",
      "CDN"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.7,
    "reviews": 2300,
    "uptime": 99.98,
    "latency": "15ms",
    "version": "v4.0",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "Rust"
    ],
    "monthlyFree": "100K req/day",
    "slug": "cloud-cloudflare"
  },
  {
    "id": "cloud-vercel",
    "name": "Deployment API",
    "provider": "Vercel",
    "description": "Deploy frontend apps, serverless functions, and edge middleware with automatic scaling.",
    "category": "Cloud",
    "tags": [
      "Deploy",
      "Serverless",
      "Edge"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.7,
    "reviews": 1800,
    "uptime": 99.97,
    "latency": "40ms",
    "version": "v13",
    "trending": true,
    "sdks": [
      "Node"
    ],
    "monthlyFree": "Hobby tier",
    "slug": "cloud-vercel"
  },
  {
    "id": "cloud-supabase",
    "name": "Backend API",
    "provider": "Supabase",
    "description": "Postgres database, authentication, storage, edge functions, and real-time subscriptions.",
    "category": "Cloud",
    "tags": [
      "Postgres",
      "Auth",
      "Real-time"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.7,
    "reviews": 2100,
    "uptime": 99.93,
    "latency": "35ms",
    "version": "v2.0",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "Dart",
      "Swift",
      "Kotlin"
    ],
    "monthlyFree": "500MB DB",
    "slug": "cloud-supabase"
  },
  {
    "id": "cloud-do",
    "name": "Droplets API",
    "provider": "DigitalOcean",
    "description": "Manage virtual machines, Kubernetes clusters, managed databases, and object storage via API.",
    "category": "Cloud",
    "tags": [
      "VMs",
      "K8s",
      "Database"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.5,
    "reviews": 1600,
    "uptime": 99.95,
    "latency": "60ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Go",
      "Ruby"
    ],
    "monthlyFree": "$200 credits",
    "slug": "cloud-do"
  },
  {
    "id": "cloud-railway",
    "name": "Deploy API",
    "provider": "Railway",
    "description": "Instant deployment for apps, databases, and cron jobs with automatic scaling and networking.",
    "category": "Cloud",
    "tags": [
      "Deploy",
      "Database",
      "Scaling"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.5,
    "reviews": 780,
    "uptime": 99.9,
    "latency": "55ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "$5/mo",
    "slug": "cloud-railway"
  },
  {
    "id": "cloud-render",
    "name": "Hosting API",
    "provider": "Render",
    "description": "Deploy web services, static sites, cron jobs, and managed Postgres with zero DevOps.",
    "category": "Cloud",
    "tags": [
      "Hosting",
      "Postgres",
      "DevOps"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.4,
    "reviews": 650,
    "uptime": 99.88,
    "latency": "70ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "Free tier",
    "slug": "cloud-render"
  },
  {
    "id": "cloud-flyio",
    "name": "Machines API",
    "provider": "Fly.io",
    "description": "Run full-stack apps close to users with micro VMs, GPU instances, and global anycast.",
    "category": "Cloud",
    "tags": [
      "Edge",
      "Micro-VMs",
      "GPU"
    ],
    "pricing": "Pay-as-you-go",
    "pricingTier": "payg",
    "rating": 4.5,
    "reviews": 520,
    "uptime": 99.85,
    "latency": "30ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Go",
      "Rust"
    ],
    "monthlyFree": "3 shared VMs",
    "slug": "cloud-flyio"
  },
  {
    "id": "cloud-upstash",
    "name": "Serverless Redis",
    "provider": "Upstash",
    "description": "Serverless Redis and Kafka with per-request pricing, global replication, and REST API.",
    "category": "Cloud",
    "tags": [
      "Redis",
      "Kafka",
      "Serverless"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 430,
    "uptime": 99.93,
    "latency": "8ms",
    "version": "v2.0",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "Go"
    ],
    "monthlyFree": "10K cmd/day",
    "slug": "cloud-upstash"
  },
  {
    "id": "cloud-neon",
    "name": "Serverless Postgres",
    "provider": "Neon",
    "description": "Serverless Postgres with branching, autoscaling, and bottomless storage. Scale to zero.",
    "category": "Cloud",
    "tags": [
      "Postgres",
      "Serverless",
      "Branching"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 670,
    "uptime": 99.92,
    "latency": "20ms",
    "version": "v2.0",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "Go"
    ],
    "monthlyFree": "512MB",
    "slug": "cloud-neon"
  },
  {
    "id": "ana-mixpanel",
    "name": "Analytics API",
    "provider": "Mixpanel",
    "description": "Behavioural analytics with funnel analysis, cohort tracking, and real-time event streaming.",
    "category": "Analytics",
    "tags": [
      "Events",
      "Funnels",
      "Cohorts"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 1400,
    "uptime": 99.93,
    "latency": "80ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Swift",
      "Kotlin"
    ],
    "monthlyFree": "20M events",
    "slug": "ana-mixpanel"
  },
  {
    "id": "ana-amplitude",
    "name": "Event API",
    "provider": "Amplitude",
    "description": "Product analytics with behavioral cohorting, feature flagging, and A/B experiment tracking.",
    "category": "Analytics",
    "tags": [
      "Product",
      "Experiments",
      "Flags"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.5,
    "reviews": 1200,
    "uptime": 99.9,
    "latency": "90ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Swift",
      "Kotlin",
      "Flutter"
    ],
    "monthlyFree": "50K MTU",
    "slug": "ana-amplitude"
  },
  {
    "id": "ana-segment",
    "name": "CDP API",
    "provider": "Segment",
    "description": "Customer data platform that routes events to 400+ destinations with identity resolution.",
    "category": "Analytics",
    "tags": [
      "CDP",
      "Routing",
      "Identity"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.5,
    "reviews": 980,
    "uptime": 99.92,
    "latency": "100ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Swift",
      "Kotlin",
      "Go"
    ],
    "monthlyFree": "1K visitors",
    "slug": "ana-segment"
  },
  {
    "id": "ana-posthog",
    "name": "Product Analytics",
    "provider": "PostHog",
    "description": "Open-source product analytics with session replay, feature flags, surveys, and A/B testing.",
    "category": "Analytics",
    "tags": [
      "Open-source",
      "Replay",
      "Flags"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 890,
    "uptime": 99.88,
    "latency": "75ms",
    "version": "v1.0",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "React",
      "Go"
    ],
    "monthlyFree": "1M events",
    "slug": "ana-posthog"
  },
  {
    "id": "ana-sentry",
    "name": "Error Tracking",
    "provider": "Sentry",
    "description": "Real-time error monitoring with stack traces, breadcrumbs, performance tracing, and release health.",
    "category": "Analytics",
    "tags": [
      "Errors",
      "Performance",
      "Traces"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.7,
    "reviews": 3400,
    "uptime": 99.95,
    "latency": "50ms",
    "version": "v7.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Go",
      "Java",
      "Swift",
      "Kotlin",
      "Rust"
    ],
    "monthlyFree": "5K errors",
    "slug": "ana-sentry"
  },
  {
    "id": "ana-datadog",
    "name": "Monitoring API",
    "provider": "Datadog",
    "description": "Infrastructure monitoring, APM, log management, and real user monitoring in a unified platform.",
    "category": "Analytics",
    "tags": [
      "APM",
      "Logs",
      "Infra"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 2100,
    "uptime": 99.97,
    "latency": "60ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Go",
      "Java",
      ".NET",
      "Ruby"
    ],
    "monthlyFree": "5 hosts",
    "slug": "ana-datadog"
  },
  {
    "id": "ana-logrocket",
    "name": "Session Replay",
    "provider": "LogRocket",
    "description": "Session replay with error tracking, performance monitoring, and product analytics for web apps.",
    "category": "Analytics",
    "tags": [
      "Replay",
      "Frontend",
      "Errors"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.4,
    "reviews": 560,
    "uptime": 99.88,
    "latency": "100ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "React",
      "Vue",
      "Angular",
      "Node"
    ],
    "monthlyFree": "1K sessions",
    "slug": "ana-logrocket"
  },
  {
    "id": "src-algolia",
    "name": "Search API",
    "provider": "Algolia",
    "description": "Hosted search with typo tolerance, faceting, geo-search, and AI-powered recommendations.",
    "category": "Search",
    "tags": [
      "Full-text",
      "AI",
      "Facets"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.7,
    "reviews": 1800,
    "uptime": 99.97,
    "latency": "30ms",
    "version": "v4.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Ruby",
      "Go",
      "Swift"
    ],
    "monthlyFree": "10K searches",
    "slug": "src-algolia"
  },
  {
    "id": "src-typesense",
    "name": "Search API",
    "provider": "Typesense",
    "description": "Open-source search engine with typo tolerance, faceting, and geo-search. Self-hosted or cloud.",
    "category": "Search",
    "tags": [
      "Open-source",
      "Typo-tolerant",
      "Fast"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.5,
    "reviews": 540,
    "uptime": 99.9,
    "latency": "25ms",
    "version": "v0.25",
    "trending": true,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Ruby",
      "Go"
    ],
    "monthlyFree": "Self-hosted",
    "slug": "src-typesense"
  },
  {
    "id": "src-meilisearch",
    "name": "Search API",
    "provider": "Meilisearch",
    "description": "Lightning-fast open-source search with typo handling, filters, and instant results under 50ms.",
    "category": "Search",
    "tags": [
      "Open-source",
      "Fast",
      "Filters"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.5,
    "reviews": 620,
    "uptime": 99.88,
    "latency": "20ms",
    "version": "v1.6",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Ruby",
      "Go",
      "Rust"
    ],
    "monthlyFree": "100K docs",
    "slug": "src-meilisearch"
  },
  {
    "id": "src-elastic",
    "name": "Elasticsearch",
    "provider": "Elastic",
    "description": "Distributed search and analytics engine for structured and unstructured data at petabyte scale.",
    "category": "Search",
    "tags": [
      "Enterprise",
      "Analytics",
      "Logs"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.6,
    "reviews": 3200,
    "uptime": 99.95,
    "latency": "35ms",
    "version": "v8.12",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Java",
      "Go",
      ".NET",
      "PHP",
      "Ruby"
    ],
    "monthlyFree": "14-day trial",
    "slug": "src-elastic"
  },
  {
    "id": "soc-twitter",
    "name": "API v2",
    "provider": "X (Twitter)",
    "description": "Post tweets, search, manage followers, and stream real-time data from the X platform.",
    "category": "Social",
    "tags": [
      "Twitter",
      "Streams",
      "Posts"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.2,
    "reviews": 4500,
    "uptime": 99.85,
    "latency": "120ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Ruby"
    ],
    "monthlyFree": "1.5K tweets",
    "slug": "soc-twitter"
  },
  {
    "id": "soc-github",
    "name": "REST API",
    "provider": "GitHub",
    "description": "Manage repos, issues, PRs, actions, and user data. Build integrations and GitHub Apps.",
    "category": "Social",
    "tags": [
      "DevTools",
      "Repos",
      "Actions"
    ],
    "pricing": "Free",
    "pricingTier": "free",
    "rating": 4.8,
    "reviews": 6200,
    "uptime": 99.95,
    "latency": "80ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Ruby",
      "Go",
      ".NET"
    ],
    "monthlyFree": "5K req/hr",
    "slug": "soc-github"
  },
  {
    "id": "soc-linkedin",
    "name": "Marketing API",
    "provider": "LinkedIn",
    "description": "Share content, manage ad campaigns, fetch company pages, and access member profile data.",
    "category": "Social",
    "tags": [
      "Marketing",
      "Ads",
      "Professional"
    ],
    "pricing": "Free",
    "pricingTier": "free",
    "rating": 4.3,
    "reviews": 1200,
    "uptime": 99.9,
    "latency": "200ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "Rate limited",
    "slug": "soc-linkedin"
  },
  {
    "id": "soc-instagram",
    "name": "Graph API",
    "provider": "Instagram",
    "description": "Publish content, read insights, moderate comments, and manage Instagram business accounts.",
    "category": "Social",
    "tags": [
      "Media",
      "Insights",
      "Publishing"
    ],
    "pricing": "Free",
    "pricingTier": "free",
    "rating": 4.3,
    "reviews": 2100,
    "uptime": 99.85,
    "latency": "180ms",
    "version": "v18.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP"
    ],
    "monthlyFree": "Rate limited",
    "slug": "soc-instagram"
  },
  {
    "id": "soc-youtube",
    "name": "Data API",
    "provider": "YouTube",
    "description": "Search videos, manage channels, upload content, and access analytics and live streaming data.",
    "category": "Social",
    "tags": [
      "Video",
      "Channels",
      "Analytics"
    ],
    "pricing": "Free",
    "pricingTier": "free",
    "rating": 4.5,
    "reviews": 3400,
    "uptime": 99.93,
    "latency": "150ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Java",
      "Go",
      "PHP",
      "Ruby"
    ],
    "monthlyFree": "10K units",
    "slug": "soc-youtube"
  },
  {
    "id": "soc-spotify",
    "name": "Web API",
    "provider": "Spotify",
    "description": "Search tracks, manage playlists, control playback, and access audio features and recommendations.",
    "category": "Social",
    "tags": [
      "Music",
      "Playlists",
      "Audio"
    ],
    "pricing": "Free",
    "pricingTier": "free",
    "rating": 4.6,
    "reviews": 2800,
    "uptime": 99.92,
    "latency": "100ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "Java"
    ],
    "monthlyFree": "Rate limited",
    "slug": "soc-spotify"
  },
  {
    "id": "soc-reddit",
    "name": "Data API",
    "provider": "Reddit",
    "description": "Access posts, comments, subreddits, user profiles, and moderation tools via OAuth2 API.",
    "category": "Social",
    "tags": [
      "Forum",
      "Community",
      "Content"
    ],
    "pricing": "Free",
    "pricingTier": "free",
    "rating": 4.2,
    "reviews": 1600,
    "uptime": 99.8,
    "latency": "200ms",
    "version": "v1.0",
    "trending": false,
    "sdks": [
      "Python",
      "Node"
    ],
    "monthlyFree": "100 req/min",
    "slug": "soc-reddit"
  },
  {
    "id": "soc-tiktok",
    "name": "Business API",
    "provider": "TikTok",
    "description": "Ads management, content publishing, audience insights, and creator marketplace integration.",
    "category": "Social",
    "tags": [
      "Ads",
      "Short-video",
      "Creator"
    ],
    "pricing": "Free",
    "pricingTier": "free",
    "rating": 4.3,
    "reviews": 780,
    "uptime": 99.82,
    "latency": "220ms",
    "version": "v2.0",
    "trending": true,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "Rate limited",
    "slug": "soc-tiktok"
  },
  {
    "id": "data-weather",
    "name": "Weather API",
    "provider": "OpenWeatherMap",
    "description": "Current weather, 7-day forecast, air quality, and historical weather data for any location.",
    "category": "Weather",
    "tags": [
      "Forecast",
      "Air-quality",
      "Historical"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.5,
    "reviews": 3100,
    "uptime": 99.9,
    "latency": "80ms",
    "version": "v3.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Ruby"
    ],
    "monthlyFree": "1K calls/day",
    "slug": "data-weather"
  },
  {
    "id": "data-news",
    "name": "Headlines API",
    "provider": "NewsAPI",
    "description": "Search 150K+ news sources and blogs. Get breaking headlines and historical articles globally.",
    "category": "Weather",
    "tags": [
      "News",
      "Headlines",
      "Global"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.4,
    "reviews": 1200,
    "uptime": 99.85,
    "latency": "120ms",
    "version": "v2.0",
    "trending": false,
    "sdks": [
      "Node",
      "Python",
      "PHP",
      "Ruby"
    ],
    "monthlyFree": "100 req/day",
    "slug": "data-news"
  },
  {
    "id": "data-imd",
    "name": "India Weather",
    "provider": "IMD via APIverse",
    "description": "Real-time and 7-day forecast data for 800+ Indian cities with IMD-sourced accuracy.",
    "category": "Weather",
    "tags": [
      "IMD",
      "Forecast",
      "India"
    ],
    "pricing": "Freemium",
    "pricingTier": "freemium",
    "rating": 4.4,
    "reviews": 1120,
    "uptime": 99.85,
    "latency": "62ms",
    "version": "v2.2",
    "trending": false,
    "sdks": [
      "Node",
      "Python"
    ],
    "monthlyFree": "10K calls",
    "slug": "data-imd"
  },
  {
    "id": "gov-data-gov",
    "name": "Open Government Data API",
    "provider": "data.gov.in",
    "description": "Portal-backed access to public government datasets and API resources published through India’s open data platform.",
    "category": "Government",
    "tags": [
      "Open Data",
      "Government",
      "Datasets"
    ],
    "pricing": "Free",
    "pricingTier": "free",
    "rating": 4.5,
    "reviews": 610,
    "uptime": 99.7,
    "latency": "240ms",
    "version": "v1.0",
    "trending": true,
    "sdks": [
      "REST",
      "JSON"
    ],
    "monthlyFree": "Public access",
    "slug": "data-gov-open-government"
  }
];
export function getUnifiedApiBySlug(slug: string) {
  const baseData = ALL_APIS.find(a => a.slug === slug);
  if (!baseData) return null;

  const catalogMatched = apiCatalog.find(a => a.slug === slug);
  const detailMatched = apiDetailContent[slug];

  // Default generated catalog data when hand-curated doesn't exist
  const catalogData = catalogMatched || {
    slug: baseData.slug,
    provider: baseData.provider,
    product: baseData.name,
    category: baseData.category,
    price: baseData.pricing,
    access: baseData.pricingTier === 'payg' ? 'Free sandbox + premium usage' : 
            baseData.pricingTier === 'free' ? 'Free usage' : 
            baseData.pricingTier === 'freemium' ? 'Free tier + paid upgrades' : 'Paid access',
    metric: baseData.rating.toString(),
    metricLabel: baseData.reviews + ' reviews',
    latency: baseData.latency,
    description: baseData.description,
    howItWorks: 'Open the detail page, review the integration components, test the request shape, and integrate it straight into your products.',
    mark: baseData.provider.substring(0, 2).toUpperCase(),
    markClassName: 'bg-stone-900 text-white',
    accent: 'from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a]',
    eyebrow: baseData.tags[0] + ' workflow',
    overview: baseData.description,
    bestFor: baseData.tags,
    freePlan: ['Test usage', 'Sandbox docs', 'Basic examples'],
    premiumPlan: ['Production capacity', 'Higher throughput', 'Priority support'],
    steps: ['Review endpoints', 'Generate your access key', 'Send a test request', 'Implement in production'],
    sampleRequest: `GET /v1/example HTTP/1.1\nHost: api.${baseData.provider.toLowerCase().replace(/\s/g, '')}.com\nAccept: application/json`
  };

  const detailData = detailMatched || {
    baseUrl: `https://api.${baseData.provider.toLowerCase().replace(/\s/g, '')}.com`,
    endpoint: `GET /v1/${baseData.slug.split('-').pop()}`,
    auth: 'Bearer API key',
    protocol: 'HTTPS + JSON',
    sandboxLimit: baseData.monthlyFree,
    premiumLimit: 'Volume based tier',
    successRate: baseData.uptime + '%',
    regions: ['Global'],
    responseHighlights: ['status', 'data', 'timestamp', 'request_id'],
    pricingNotes: [`Pricing tier: ${baseData.pricing}`, baseData.monthlyFree !== 'None' ? `Includes ${baseData.monthlyFree}` : 'No free trial provided', 'Contact provider for large volume'],
    sampleResponse: "{\n  \"status\": \"success\",\n  \"data\": {}\n}"
  };

  return {
    base: baseData,
    catalog: catalogData,
    detail: detailData
  };
}

// Modify generateStaticParams
export function getAllApiSlugs() {
  return ALL_APIS.map(a => a.slug);
}

export function getOfficialProviderUrl(slug: string, provider?: string) {
  const unifiedApi = getUnifiedApiBySlug(slug);
  const resolvedProvider = provider ?? unifiedApi?.catalog.provider ?? unifiedApi?.base.provider;

  if (!resolvedProvider) {
    return 'https://www.google.com/search?q=api+provider';
  }

  return PROVIDER_URLS[resolvedProvider] ?? `https://www.google.com/search?q=${encodeURIComponent(resolvedProvider + ' API')}`;
}
