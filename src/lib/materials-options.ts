import type {
  MaterialsConfiguratorData,
  MaterialsConfiguratorOption,
} from '@/types/catalog';

export const QX_FRAME_COLOR_NAMES: Record<string, string> = {
  RAL9006: 'GREY',
  RAL9005: 'BLACK',
  RAL9003: 'WHITE',
  RAL7024: 'GRAPHITE',
};

export const MRC1000_DECOR_NAMES: Record<string, string> = {
  U100: 'WHITE',
  U110: 'ASH GREY',
  U120: 'PLATINUM GREY',
  U130: 'GRAPHITE GREY',
  U140: 'BLACK',
  U150: 'BEIGE',
  U160: 'CACAO',
  U170: 'OLIVE',
  U180: 'BURGUNDY',
  U190: 'BLUE',
  W200: 'LIGHT BEECH',
  W210: 'ELM',
  W220: 'LIGHT OAK',
  W240: 'NATURAL OAK',
  W250: 'WALNUT',
  W300: 'ROBSON OAK',
  W310: 'DARK OAK',
  W330: 'DARK WALNUT',
  W340: 'HALIFAX OAK',
  W350: 'ANTHRACITE SEMI-MAT',
};

const METRO_ID_PATTERN = /^metro[_ -]/i;

const FRAME_COLOR_FROM_NAME: Record<string, string> = {
  white: 'RAL9003',
  black: 'RAL9005',
  grey: 'RAL9006',
  gray: 'RAL9006',
};

export function parsePackshotImage(filename: string | undefined): {
  topCode?: string;
  frameCode?: string;
} {
  if (!filename) return {};
  const base = filename.split('/').pop() ?? '';
  const stem = base.replace(/\.[^.]+$/, '').split('__')[0];
  const tokens = stem.split('_');
  const topToken = tokens[1];
  const frameToken = tokens[2];
  const topCode =
    topToken && /^[UW]\d+$/i.test(topToken)
      ? topToken.toUpperCase()
      : undefined;

  let frameCode: string | undefined;
  if (frameToken) {
    if (/^RAL\d+$/i.test(frameToken)) {
      frameCode = frameToken.toUpperCase();
    } else {
      frameCode = FRAME_COLOR_FROM_NAME[frameToken.toLowerCase()];
    }
  }
  return { topCode, frameCode };
}

export function parseMRC1000Image(filename: string | undefined): {
  bodyCode?: string;
  hutchCode?: string;
} {
  if (!filename) return {};
  const base = filename.split('/').pop() ?? '';
  const stem = base.replace(/\.[^.]+$/, '').split('__')[0];
  const codes: string[] = [];
  for (const token of stem.split('_')) {
    if (/^[UW]\d+$/i.test(token)) codes.push(token.toUpperCase());
    if (codes.length === 2) break;
  }
  return { bodyCode: codes[0], hutchCode: codes[1] };
}

export function pickConfiguratorOption(
  options: MaterialsConfiguratorOption[] | undefined,
  code: string | undefined,
): MaterialsConfiguratorOption | undefined {
  if (!options || !code) return undefined;
  const upper = code.toUpperCase();
  const matches = options.filter(
    (option) => option.code.toUpperCase() === upper,
  );
  if (matches.length === 0) return undefined;

  const metroEntry = matches.find((option) => METRO_ID_PATTERN.test(option.id));
  const swatchEntry = matches.find(
    (option) => !METRO_ID_PATTERN.test(option.id),
  );

  if (metroEntry && swatchEntry) {
    return {
      ...metroEntry,
      label: swatchEntry.label,
      thumbnail: swatchEntry.image,
    };
  }
  return swatchEntry ?? metroEntry ?? matches[0];
}

export function dedupeByCode(options: MaterialsConfiguratorOption[]) {
  const seen = new Set<string>();
  const result: MaterialsConfiguratorOption[] = [];
  for (const option of options) {
    if (seen.has(option.code)) continue;
    const preferred = pickConfiguratorOption(options, option.code);
    if (!preferred) continue;
    seen.add(option.code);
    result.push(preferred);
  }
  return result;
}

export function orderOptions(
  options: MaterialsConfiguratorOption[],
  orderedCodes: string[],
): MaterialsConfiguratorOption[] {
  return orderedCodes.flatMap((code) => {
    const option = pickConfiguratorOption(options, code);
    return option ? [option] : [];
  });
}

export function formatOptionCode(code: string): string {
  return code.startsWith('RAL') ? `RAL ${code.slice(3)}` : code;
}

export function applyOptionDescriptions(
  options: MaterialsConfiguratorOption[],
  descriptions: Record<string, string>,
): MaterialsConfiguratorOption[] {
  return options.map((option) => {
    const description = descriptions[option.code];
    if (!description) return option;
    return { ...option, label: `${formatOptionCode(option.code)} ${description}` };
  });
}

export function enrichConfigurator(
  configurator: MaterialsConfiguratorData | undefined,
  descriptions: { frame?: Record<string, string>; desktop?: Record<string, string> },
): MaterialsConfiguratorData | undefined {
  if (!configurator) return configurator;
  return {
    frameOptions: descriptions.frame
      ? applyOptionDescriptions(configurator.frameOptions, descriptions.frame)
      : configurator.frameOptions,
    desktopOptions: descriptions.desktop
      ? applyOptionDescriptions(configurator.desktopOptions, descriptions.desktop)
      : configurator.desktopOptions,
  };
}
