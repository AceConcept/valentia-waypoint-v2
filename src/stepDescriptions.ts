/**
 * Sidebar titles + body copy — ordered for flow ids: 1–3.
 */

export const STEP_TITLES = [
  'Step one',
  'Step two',
  'Step three',
] as const

export type StepCopyBullet = {
  label: string
  text: string
}

export type StepCopyBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullets'; items: readonly StepCopyBullet[] }
  | { kind: 'callout'; text: string }

export const STEP_COPY_BLOCKS: readonly (readonly StepCopyBlock[])[] = [
  [
    {
      kind: 'paragraph',
      text: 'Valentia is a crypto trading analysis platform that lets you view and compare price and technical data for multiple tokens in a single workspace.',
    },
    {
      kind: 'bullets',
      items: [
        {
          label: 'Main Dashboard',
          text: 'Search tokens to view fundamental data, live price charts, key indicators, and recent activity to get timeframe-based strategy insights.',
        },
        {
          label: 'Multi-Token View',
          text: 'Easily move tokens from the dashboard to compare two candlestick charts simultaneously and unlock advanced trade strategy insights.',
        },
      ],
    },
  ],
  [
    {
      kind: 'paragraph',
      text: 'Multi-Token Comparison puts two selected cryptocurrency charts side by side so you can analyze price action, trends, and volatility in one workspace.',
    },
    {
      kind: 'bullets',
      items: [
        {
          label: 'Side-by-Side Charts',
          text: 'Compare two tokens directly with dual candlestick charts for visual analysis of how each market is moving relative to the other.',
        },
        {
          label: 'Multi-Token Mode',
          text: 'The entire page updates to show you are now in a multi-token setting, with layouts and controls tuned for comparison.',
        },
        {
          label: 'Comparison Strategies',
          text: 'New strategies are generated to account for multi-token comparison perspectives rather than a single asset alone.',
        },
      ],
    },
    {
      kind: 'callout',
      text: '* Click View Strategy in one of the cards to advance to [ step 3 analysis view ]',
    },
  ],
  [
    {
      kind: 'paragraph',
      text: 'Turn your chart comparison into actionable trade ideas using the strategy cards below the charts.',
    },
    {
      kind: 'bullets',
      items: [
        {
          label: 'Strategy Cards',
          text: 'Select one of the cards below the chart to generate several insights based on comparisons and patterns in the market.',
        },
        {
          label: 'Trade Strategy',
          text: 'View the insights to inform trade strategy from historical comparisons and pattern recognition across both tokens.',
        },
      ],
    },
  ],
] as const

export function stepCopyToPlain(blocks: readonly StepCopyBlock[]): string {
  return blocks
    .map((block) => {
      if (block.kind === 'paragraph' || block.kind === 'callout') return block.text
      return block.items.map((item) => `${item.label}: ${item.text}`).join('\n\n')
    })
    .join('\n\n')
}

/** Plain-text fallback (preview rail, flow store body). */
export const STEP_DESCRIPTIONS = STEP_COPY_BLOCKS.map(stepCopyToPlain) as [
  string,
  string,
  string,
]
