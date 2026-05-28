/** Types for catalog template - content management */

export interface CatalogData {
  id: string;
  meta: CatalogMeta;
  hero: HeroData;
  overview: OverviewData;
  gallery: GalleryData;
  finishes: FinishesData;
  dimensions: DimensionsData;
  materials: MaterialsData;
  features: FeaturesData;
  gettingStarted: GettingStartedData;
  productCodes: ProductCodesData;
  packshots?: PackshotsData;
  arrangements?: ArrangementsData;
  sections?: SectionConfig[];
}

export interface ArrangementsPlaceholder {
  label: string;
  image?: string;
}

export interface ArrangementsData {
  sectionLabel: string;
  title: string;
  placeholders: ArrangementsPlaceholder[];
}

export type CatalogLayoutType = 'qx' | 'mrc800' | 'mrc1000' | 'type2' | 'type3';

interface CatalogMeta {
  title: string;
  tagline?: string;
  description: string;
  brandName: string;
  collectionName: string;
  layoutType: CatalogLayoutType;
  theme?: string;
  /** When false, materials/finishes configurators are scanned only from the catalog's own folder; the /shared/materials library is not merged in. Defaults to true. */
  useSharedMaterials?: boolean;
  /** When true, the finishes configurator reuses the materials folder scan instead of scanning /finishes/. Lets a layout share one set of swatch files between both sections without duplication. */
  finishesFromMaterials?: boolean;
}

interface HeroSliderConfig {
  /** Enable auto-advance to next slide */
  autoAdvance?: boolean;
  /** Interval in milliseconds between slides */
  interval?: number;
  /** Pause auto-advance when user hovers over slider */
  pauseOnHover?: boolean;
  /** Transition duration in milliseconds */
  transitionMs?: number;
  /** Show prev/next arrow buttons */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Initial slide index (0-based) */
  initialSlide?: number;
}

export type HeroDescriptionPosition =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'top-left'
  | 'top-right';

export interface HeroDescriptionStyleConfig {
  /** Turn slide descriptions on/off for this catalog */
  enabled?: boolean;
  /** Placement preset for the description label */
  position?: HeroDescriptionPosition;
  /** Distance from top or bottom edge (in px) */
  offsetPx?: number;
  /** Text color (CSS color value) */
  textColor?: string;
  /** Label background (CSS color value) */
  backgroundColor?: string;
  /** Backdrop blur (in px) */
  backdropBlurPx?: number;
  /** Horizontal padding (in px) */
  paddingX?: number;
  /** Vertical padding (in px) */
  paddingY?: number;
  /** Corner radius (in px) */
  borderRadiusPx?: number;
  /** Font size (in px) */
  fontSizePx?: number;
  /** Font weight */
  fontWeight?: number;
  /** Letter spacing in em units */
  letterSpacingEm?: number;
  /** Max width, e.g. 90vw or 520px */
  maxWidth?: string;
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
  /** Uppercase transform toggle */
  uppercase?: boolean;
}

interface HeroSlideContentOverrides {
  /** Optional small label above the main hero title */
  brandLabel?: string;
  /** Optional main hero title override */
  collectionName?: string;
  /** Optional primary hero copy override */
  tagline?: string;
  /** Optional secondary hero copy override */
  taglineLine2?: string;
  /** Optional CTA label override */
  ctaLabel?: string;
}

export type HeroAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

type HeroCtaPosition = 'inline' | 'floating' | 'none';

export interface HeroSlideContentLayout {
  /** Where the text block anchors inside the viewport (9 combos: top-left … bottom-right) */
  anchor?: HeroAnchor;
  /** Text alignment within the block */
  textAlign?: 'left' | 'center' | 'right';
  /** Max width of text block (any CSS length, e.g. "32rem", "60vw", "1440px") */
  maxWidth?: string;
  /** Vertical padding (top + bottom). Overridden by paddingTop/paddingBottom if set. */
  paddingY?: string;
  /** Padding from top edge (overrides paddingY for top side) */
  paddingTop?: string;
  /** Padding from bottom edge (overrides paddingY for bottom side) */
  paddingBottom?: string;
  /** Horizontal nudge of the text block (transform translateX), e.g. "2rem" or "-1rem" */
  offsetX?: string;
  /** Vertical nudge of the text block (transform translateY), e.g. "-3rem" or "4rem" */
  contentLift?: string;
  /** CTA placement: inline (after tagline), floating (absolute), or none (hide CTA on this slide) */
  ctaPosition?: HeroCtaPosition;
  /** Floating CTA distance from viewport bottom (any CSS length) */
  ctaFloatingBottom?: string;
}

/** Per-slide text style overrides applied to the hero copy block.
 *  Exposed to CSS as custom properties on .hero-content-wrapper.hero-slide-N. */
interface HeroTextStyle {
  /** Text color (any CSS color value) */
  color?: string;
  /** Font weight (100–900) */
  fontWeight?: number;
  /** Font size (any CSS length, e.g. "2.4rem", "clamp(1.6rem, 4vw, 3rem)") */
  fontSize?: string;
}

/** Per-slide horizontal positioning override that applies only on mobile (<768px). */
interface HeroMobileContentLayout {
  /** Text alignment within the hero copy block on mobile */
  textAlign?: 'left' | 'center' | 'right';
  /** Horizontal nudge of the text block on mobile (transform translateX), e.g. "2rem" or "-1rem" */
  offsetX?: string;
}

export interface HeroSlide {
  /** Resolved image URL */
  src: string;
  /** Accessible slide alt text */
  alt: string;
  /** Optional visible caption/description */
  description?: string;
  /** Optional per-slide override for the main hero copy */
  heroContent?: HeroSlideContentOverrides;
  /** Optional per-slide override for description placement and style */
  descriptionStyle?: HeroDescriptionStyleConfig;
  /** Optional per-slide layout/geometry override (desktop) */
  contentLayout?: HeroSlideContentLayout;
  /** Optional per-slide hero text style override (desktop). Falls back to global .hero-text rule. */
  textStyle?: HeroTextStyle;
  /** Optional per-slide hero text style override (mobile <768px). Falls back to textStyle, then global .hero-text rule. */
  mobileTextStyle?: HeroTextStyle;
  /** Optional per-slide horizontal positioning override (mobile <768px) */
  mobileContentLayout?: HeroMobileContentLayout;
  /** Optional per-slide horizontal shift of the hero image on mobile (<768px).
   *  Positive value moves the image visually to the right (e.g. "100px", "-2rem").
   *  Applied as offset on top of the per-catalog mobile object-position baseline. */
  mobileImageOffsetX?: string;
}

interface HeroSlideDefinition {
  /** Relative path inside hero folder, e.g. hero_00.webp */
  image: string;
  /** Optional alt override for the slide */
  alt?: string;
  /** Optional visible caption/description for the slide */
  description?: string;
  /** Optional per-slide override for the main hero copy */
  heroContent?: HeroSlideContentOverrides;
  /** Optional per-slide override for description placement and style */
  descriptionStyle?: HeroDescriptionStyleConfig;
  /** Optional per-slide layout/geometry override (desktop) */
  contentLayout?: HeroSlideContentLayout;
  /** Optional per-slide hero text style override (desktop) */
  textStyle?: HeroTextStyle;
  /** Optional per-slide hero text style override (mobile <768px) */
  mobileTextStyle?: HeroTextStyle;
  /** Optional per-slide horizontal positioning override (mobile <768px) */
  mobileContentLayout?: HeroMobileContentLayout;
  /** Optional per-slide horizontal shift of the hero image on mobile (<768px).
   *  Positive value moves the image visually to the right (e.g. "100px", "-2rem"). */
  mobileImageOffsetX?: string;
}

export interface HeroSliderFile {
  /** Slider settings stored in hero/slider.json */
  settings?: HeroSliderConfig;
  /** Description label style stored in hero/slider.json */
  descriptionStyle?: HeroDescriptionStyleConfig;
  /** Explicit list of slides for the hero carousel */
  slides?: HeroSlideDefinition[];
}

export interface HeroData {
  brandLabel: string;
  collectionName: string;
  tagline: string;
  taglineLine2?: string;
  ctaLabel: string;
  heroImage: string;
  heroImageAlt: string;
  /** Explicit hero slides resolved from hero/slider.json */
  heroSlides?: HeroSlide[];
  /** Auto-discovered hero_NN.webp images for slider, with jpg/jpeg/png fallback */
  heroImages?: string[];
  /** Slider options loaded from hero/slider.json (or legacy hero content) */
  slider?: HeroSliderConfig;
  /** Description label style loaded from hero/slider.json */
  descriptionStyle?: HeroDescriptionStyleConfig;
  /** Dedicated cover used by the PDF print layout (separate from the live
   * hero slider so the print can use a different image/composition). */
  printCover?: {
    image: string;
    alt: string;
  };
}

export interface OverviewData {
  sectionLabel: string;
  title: string;
  titleLine2?: string;
  paragraphs: string[];
  packshotImage: string;
  packshotImageAlt: string;
  packshotCaption: string;
}

interface GalleryImage {
  src: string;
  alt: string;
  category: string;
  /** Natural pixel width (resolved at load time). Optional — used by the
   * print layout to size cells proportionally to image aspect ratio. */
  width?: number;
  /** Natural pixel height (resolved at load time). */
  height?: number;
}

export interface GalleryPrintConfig {
  /** Number of grid columns (default 3) */
  columns?: number;
  /** Number of grid rows (default 2 → 3×2 = 6 cells with 6 images) */
  rows?: number;
  /** Gap between cells, in px (default 16) */
  gap?: number;
  /** Outer padding around the section, in px (default 80) */
  padding?: number;
  /** Background color CSS value (default '#ffffff') */
  background?: string;
  /** Show section label + title above the grid (default true) */
  showTitle?: boolean;
  /** Max number of images to include from gallery.images (default = all) */
  maxImages?: number;
}

export interface GalleryData {
  sectionLabel: string;
  title: string;
  images: GalleryImage[];
  /** Print-only layout config loaded from gallery/print.json (optional). */
  print?: GalleryPrintConfig;
}

interface ColorOption {
  name: string;
  code: string;
  ral?: string;
}

interface SizeOption {
  label: string;
  desc: string;
}

interface ComparisonRow {
  feature: string;
  basic: string;
  premium: string;
}

export interface FinishesData {
  sectionLabel: string;
  title: string;
  description?: string;
  desktopColors: ColorOption[];
  frameColors: ColorOption[];
  sizes: SizeOption[];
  comparisonTable: ComparisonRow[];
  comparisonBasicLabel?: string;
  comparisonPremiumLabel?: string;
  configurator?: MaterialsConfiguratorData;
  /** Optional desktop-option grouping by price tier, used by configurator-driven Finishes layouts. */
  priceGroups?: MaterialsPriceGroup[];
}

interface SpecItem {
  label: string;
  value: string;
}

export interface DimensionsModule {
  image: string;
  label: string;
}

export interface DimensionsData {
  sectionLabel: string;
  title: string;
  description?: string;
  image?: string;
  specs: SpecItem[];
  certifications: string[];
  modules?: DimensionsModule[];
  dimensionDiagram?: {
    width: string;
    depth: string;
    heightRange: string;
  };
}

interface MaterialItem {
  name: string;
  desc: string;
  specs: string;
}

interface ColorSwatch {
  name: string;
  hex: string;
}

export interface MaterialsConfiguratorOption {
  id: string;
  code: string;
  label: string;
  image: string;
  thumbnail: string;
}

export interface MaterialsConfiguratorData {
  frameOptions: MaterialsConfiguratorOption[];
  desktopOptions: MaterialsConfiguratorOption[];
}

export interface MaterialsPriceGroup {
  title: string;
  codes: string[];
}

export interface MaterialsData {
  sectionLabel: string;
  title: string;
  description?: string;
  materials: MaterialItem[];
  swatches: ColorSwatch[];
  configurator?: MaterialsConfiguratorData;
  /** Optional desktop-option grouping by price tier, rendered as separate sub-groups in the configurator. */
  priceGroups?: MaterialsPriceGroup[];
  /**
   * Preview compositing mode. Default 'layered' overlays desktop on top of frame
   * (requires assets where frame has transparent top area and desktop has
   * transparent rest). Use 'frame-only' when materials are full-scene renders
   * (each frame file already contains a complete desk view) to avoid the
   * desktop overlay covering the leg.
   */
  previewMode?: 'layered' | 'frame-only' | 'desktop-only';
}

export interface FeatureVariant {
  title: string;
  video?: {
    src: string;
    poster?: string;
  };
}

export interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
  video?: {
    src: string;
    poster?: string;
  };
  image?: {
    src: string;
    alt?: string;
  };
  variants?: FeatureVariant[];
}

export interface FeaturesData {
  sectionLabel: string;
  title: string;
  items: FeatureItem[];
}

interface GettingStartedStep {
  step: number;
  title: string;
  desc: string;
  icon?: string;
}

export interface GettingStartedData {
  sectionLabel: string;
  title: string;
  steps: GettingStartedStep[];
  ctaLabels: {
    quote: string;
    pdf: string;
    contact: string;
  };
  footerText: string;
  versionInfo: string;
}

type ProductCodeGroupCategory = 'single' | 'bench' | 'manager';

interface ProductCodeRow {
  index: string;
  indexR: string;
  dimensions: string;
}

export interface ProductCodeGroup {
  id: string;
  category: ProductCodeGroupCategory;
  title: string;
  rows: ProductCodeRow[];
}

export interface ProductCodePlaceholder {
  label: string;
  image?: string;
}

export interface ProductCodesData {
  sectionLabel: string;
  title: string;
  description: string;
  image?: string;
  legend?: string;
  gridColumns?: 2 | 4;
  groups: ProductCodeGroup[];
  placeholders?: ProductCodePlaceholder[];
  modules?: DimensionsModule[];
}

export interface SectionConfig {
  id: string;
  label: string;
  enabled?: boolean;
}

interface PackshotItem {
  code: string;
  name: string;
  image?: string;
  frameColorName?: string;
  frameColorCode?: string;
  frameColorHex?: string;
  desktopColorName?: string;
  desktopColorCode?: string;
  desktopColorHex?: string;
  colorName: string;
  colorCode?: string;
  colorHex?: string;
}

interface PackshotGroup {
  model: string;
  label: string;
  desc?: string;
  items: PackshotItem[];
}

export interface PackshotsData {
  sectionLabel: string;
  title: string;
  subtitle?: string;
  groups: PackshotGroup[];
}
