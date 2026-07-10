// ============================================================
// PulsePay — Checkout Config Type System
// ============================================================

export type ThemePreset = "dark" | "light" | "gradient" | "neon" | "minimalist" | "elegant" | "urgency" | "clean" | "ocean";
export type FontFamily = "Geist" | "Inter" | "Poppins" | "Montserrat";
export type ButtonStyle = "rounded" | "square" | "pill";
export type TemplateId = "classic" | "minimalist" | "gradient" | "neon" | "elegant" | "urgency" | "clean" | "ocean";
export type TimerDuration = "10min" | "30min" | "1h" | "24h" | "custom";
export type TimerStyle = "minimal" | "urgent";
export type ReviewDisplay = "carousel" | "list";
export type FieldType = "text" | "textarea" | "number" | "date" | "select" | "checkbox";
export type PopupInterval = 5 | 10 | 15 | 30;

// ─── Appearance ────────────────────────────────────────────
export interface AppearanceConfig {
  primaryColor: string;
  bgColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  widgetBgColor: string;
  inputBgColor: string;
  inputTextColor: string;
  layoutType: "standard" | "multistep" | "longform";
  themePreset: ThemePreset;
  templateId?: TemplateId;
  // Overrides granulares de tokens do tema (persistidos no JSON checkoutConfig).
  // Chaves = tokens de CheckoutThemeColors (ex.: { accent: "#..." }). Ver resolveTheme.
  themeOverrides?: Record<string, string>;
  logoUrl: string | null;
  bannerUrl: string | null;
  bannerExternal: string;
  fontFamily: FontFamily;
  buttonStyle: ButtonStyle;
  buttonText: string;
}

// ─── Content ───────────────────────────────────────────────
export interface BenefitItem {
  id: string;
  text: string;
}

export interface ContentConfig {
  headline: string;
  subheadline: string;
  description: string;
  benefits: BenefitItem[];
  videoUrl: string;
}

// ─── Triggers ──────────────────────────────────────────────
export interface CountdownConfig {
  enabled: boolean;
  duration: TimerDuration;
  customMinutes: number;
  label: string;
  style: TimerStyle;
}

export interface ScarcityConfig {
  countdownEnabled: boolean;
  countdown: CountdownConfig;
  vacanciesEnabled: boolean;
  vacanciesCount: number;
  vacanciesText: string;
}

export interface UrgencyConfig {
  enabled: boolean;
  text: string;
  bgColor: string;
}

export interface AuthorityConfig {
  sealSecure: boolean;
  sealSatisfaction: boolean;
  sealProtected: boolean;
  showPaymentLogos: boolean;
}

export interface GuaranteeConfig {
  enabled: boolean;
  days: 7 | 14 | 30;
  text: string;
}

export interface SupportWidgetConfig {
  enabled: boolean;
  whatsapp: string;
  instagram: string;
}

export interface TriggersConfig {
  scarcity: ScarcityConfig;
  urgency: UrgencyConfig;
  authority: AuthorityConfig;
  guarantee: GuaranteeConfig;
  supportWidget: SupportWidgetConfig;
}

// ─── Social Proof ──────────────────────────────────────────
export interface FakePopupConfig {
  enabled: boolean;
  interval: PopupInterval;
  purchaseCountText: string;
  purchaseCount: number;
}

export interface Review {
  id: string;
  name: string;
  photoUrl: string;
  stars: 1 | 2 | 3 | 4 | 5;
  text: string;
}

export interface ReviewsConfig {
  enabled: boolean;
  display: ReviewDisplay;
  items: Review[];
}

export interface BuyerCountConfig {
  enabled: boolean;
  count: number;
  label: string;
}

export interface SocialProofConfig {
  popup: FakePopupConfig;
  reviews: ReviewsConfig;
  buyerCount: BuyerCountConfig;
}

// ─── Form Fields ───────────────────────────────────────────
export interface OptionalFields {
  cpf: boolean;
  phone: boolean;
  birthDate: boolean;
  address: boolean;
  zipCode: boolean;
  company: boolean;
}

export interface CustomField {
  id: string;
  label: string;
  placeholder: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // for select type
  order: number;
}

export interface FormConfig {
  optionalFields: OptionalFields;
  customFields: CustomField[];
}

// ─── Order Bump & Upsell ───────────────────────────────────
export interface OrderBumpConfig {
  id: string;
  enabled: boolean;
  productId: string | null;
  productName: string;
  specialPrice: number;
  presentationText: string;
  imageUrl: string | null;
}

export interface UpsellConfig {
  enabled: boolean;
  url: string;
  redirectSeconds: number;
}

export interface BumpUpsellConfig {
  orderBumps: OrderBumpConfig[];
  upsell: UpsellConfig;
}

// ─── Redirects ─────────────────────────────────────────────
export interface RedirectsConfig {
  backRedirectUrl: string;
  thankYouPageUrl: string;
}

// ─── Pixels ────────────────────────────────────────────────
export interface PixelsConfig {
  metaPixelId: string;
  gtmId: string;
  tiktokPixelId: string;
  ga4Id: string;
  customHead: string;
  customBody: string;
}

// ─── Root Config ───────────────────────────────────────────
export interface CheckoutConfig {
  appearance: AppearanceConfig;
  content: ContentConfig;
  triggers: TriggersConfig;
  socialProof: SocialProofConfig;
  form: FormConfig;
  bumpUpsell: BumpUpsellConfig;
  pixels: PixelsConfig;
  redirects: RedirectsConfig;
}

// ─── Default Config ────────────────────────────────────────
export const DEFAULT_CHECKOUT_CONFIG: CheckoutConfig = {
  appearance: {
    // Cores vazias por padrão = "herdar do template" (ver resolveTheme()).
    // Preenchê-las via aba Aparência sobrescreve o token do tema.
    primaryColor: "",
    bgColor: "",
    textColor: "",
    buttonColor: "",
    buttonTextColor: "",
    widgetBgColor: "",
    inputBgColor: "",
    inputTextColor: "",
    layoutType: "standard",
    themePreset: "dark",
    templateId: "classic",
    logoUrl: null,
    bannerUrl: null,
    bannerExternal: "",
    fontFamily: "Geist",
    buttonStyle: "rounded",
    buttonText: "Comprar agora",
  },
  content: {
    headline: "Transforme sua vida hoje",
    subheadline: "Acesso imediato ao conteúdo completo",
    description: "",
    benefits: [
      { id: "1", text: "Acesso vitalício ao conteúdo" },
      { id: "2", text: "Suporte prioritário incluso" },
      { id: "3", text: "Certificado de conclusão" },
    ],
    videoUrl: "",
  },
  triggers: {
    scarcity: {
      countdownEnabled: false,
      countdown: {
        enabled: false,
        duration: "30min",
        customMinutes: 30,
        label: "Oferta encerra em:",
        style: "minimal",
      },
      vacanciesEnabled: false,
      vacanciesCount: 10,
      vacanciesText: "Restam {n} vagas",
    },
    urgency: {
      enabled: false,
      text: "🔥 Promoção por tempo limitado",
      bgColor: "#dc2626",
    },
    authority: {
      sealSecure: true,
      sealSatisfaction: true,
      sealProtected: true,
      showPaymentLogos: true,
    },
    guarantee: {
      enabled: false,
      days: 7,
      text: "Satisfação garantida ou seu dinheiro de volta, sem perguntas.",
    },
    supportWidget: {
      enabled: false,
      whatsapp: "",
      instagram: "",
    },
  },
  socialProof: {
    popup: {
      enabled: false,
      interval: 10,
      purchaseCountText: "pessoas compraram nas últimas 24h",
      purchaseCount: 47,
    },
    reviews: {
      enabled: false,
      display: "carousel",
      items: [],
    },
    buyerCount: {
      enabled: false,
      count: 1240,
      label: "alunos",
    },
  },
  form: {
    optionalFields: {
      cpf: false,
      phone: false,
      birthDate: false,
      address: false,
      zipCode: false,
      company: false,
    },
    customFields: [],
  },
  bumpUpsell: {
    orderBumps: [],
    upsell: {
      enabled: false,
      url: "",
      redirectSeconds: 5,
    },
  },
  pixels: {
    metaPixelId: "",
    gtmId: "",
    tiktokPixelId: "",
    ga4Id: "",
    customHead: "",
    customBody: "",
  },
  redirects: {
    backRedirectUrl: "",
    thankYouPageUrl: "",
  },
};
