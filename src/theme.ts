export type ImageTemplate = {
  maxWidth: number;
  borderRadius: string;
  padding: string;
  background: string;
  boxShadow: string;
  captionColor: string;
  captionSize: string;
  captionTransform: "uppercase" | "capitalize" | "none";
};

type HeadingStyle = {
  size: string;
  color: string;
  letterSpacing: string;
  marginTopFactor: number;
  marginBottomFactor: number;
  textTransform?: "uppercase" | "capitalize" | "none";
};

export type Theme = {
  colors: {
    background: string;
    foreground: string;
    muted: string;
    accent: string;
    headingPrimary: string;
    headingSecondary: string;
    codeBackground: string;
    codeBorder: string;
  };
  typography: {
    fontFamily: string;
    headingFontFamily: string;
    monospaceFontFamily: string;
    baseLineHeight: number;
    headingLineHeight: number;
    paragraphSpacing: string;
  };
  headings: {
    h1: HeadingStyle;
    h2: HeadingStyle;
    h3: HeadingStyle;
    h4: HeadingStyle;
    h5: HeadingStyle;
    h6: HeadingStyle;
  };
  lists: {
    margin: string;
    indent: string;
    itemSpacing: string;
    markerColor: string;
    markerWeight: string;
    bullet: string;
    nestedBulletLevel1: string;
    nestedBulletLevel2: string;
    orderedStyle: string;
    nestedOrderedLevel1: string;
    nestedOrderedLevel2: string;
  };
  tables: {
    borderColor: string;
    headerBackground: string;
    headerText: string;
    rowStripeBackground: string;
    cellPaddingY: string;
    cellPaddingX: string;
  };
  images: {
    image_small: ImageTemplate;
    image_medium: ImageTemplate;
    image_big: ImageTemplate;
  };
};

export const theme: Theme = {
  colors: {
    background: "#ffffff",
    foreground: "#1f2937",
    muted: "#4b5563",
    accent: "#2563eb",
    headingPrimary: "#111827",
    headingSecondary: "#1f2937",
    codeBackground: "#0f172a",
    codeBorder: "#1e293b",
  },
  typography: {
    fontFamily:
      "'Inter', 'Helvetica Neue', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    headingFontFamily: "'Clash Display', 'Inter', 'Helvetica Neue', sans-serif",
    monospaceFontFamily: "'JetBrains Mono', 'SFMono-Regular', 'Consolas', monospace",
    baseLineHeight: 1.75,
    headingLineHeight: 1.2,
    paragraphSpacing: "1.4rem",
  },
  headings: {
    h1: {
      size: "clamp(2.5rem, 3vw, 3rem)",
      color: "#0f172a",
      letterSpacing: "-0.01em",
      marginTopFactor: 1.3,
      marginBottomFactor: 0.75,
    },
    h2: {
      size: "clamp(2rem, 2.5vw, 2.4rem)",
      color: "#111827",
      letterSpacing: "-0.008em",
      marginTopFactor: 1.2,
      marginBottomFactor: 0.65,
    },
    h3: {
      size: "clamp(1.65rem, 2vw, 2rem)",
      color: "#111827",
      letterSpacing: "-0.006em",
      marginTopFactor: 1.15,
      marginBottomFactor: 0.6,
    },
    h4: {
      size: "clamp(1.35rem, 1.6vw, 1.6rem)",
      color: "#1f2937",
      letterSpacing: "-0.004em",
      marginTopFactor: 1.1,
      marginBottomFactor: 0.55,
    },
    h5: {
      size: "1.2rem",
      color: "#1f2937",
      letterSpacing: "-0.002em",
      marginTopFactor: 1.0,
      marginBottomFactor: 0.5,
    },
    h6: {
      size: "1.05rem",
      color: "#1f2937",
      letterSpacing: "0.1em",
      marginTopFactor: 1.0,
      marginBottomFactor: 0.45,
      textTransform: "uppercase",
    },
  },
  lists: {
    margin: "1.2rem 0",
    indent: "1.65rem",
    itemSpacing: "0.45rem",
    markerColor: "#2563eb",
    markerWeight: "600",
    bullet: "disc",
    nestedBulletLevel1: "circle",
    nestedBulletLevel2: "square",
    orderedStyle: "decimal",
    nestedOrderedLevel1: "lower-alpha",
    nestedOrderedLevel2: "lower-roman",
  },
  tables: {
    borderColor: "#e5e7eb",
    headerBackground: "#f3f4f6",
    headerText: "#111827",
    rowStripeBackground: "#f9fafb",
    cellPaddingY: "0.6rem",
    cellPaddingX: "0.9rem",
  },
  images: {
    image_small: {
      maxWidth: 280,
      borderRadius: "14px",
      padding: "0.75rem",
      background: "#ffffff",
      boxShadow: "0 12px 32px rgba(15, 23, 42, 0.1)",
      captionColor: "#4b5563",
      captionSize: "0.75rem",
      captionTransform: "uppercase",
    },
    image_medium: {
      maxWidth: 420,
      borderRadius: "16px",
      padding: "1rem",
      background: "#ffffff",
      boxShadow: "0 18px 42px rgba(30, 41, 59, 0.12)",
      captionColor: "#374151",
      captionSize: "0.8rem",
      captionTransform: "capitalize",
    },
    image_big: {
      maxWidth: 840,
      borderRadius: "20px",
      padding: "1.25rem",
      background: "#ffffff",
      boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
      captionColor: "#1f2937",
      captionSize: "0.85rem",
      captionTransform: "none",
    },
  },
};

export function themeToCssVariables(currentTheme: Theme): Record<string, string> {
  return {
    "--theme-background": currentTheme.colors.background,
    "--theme-foreground": currentTheme.colors.foreground,
    "--theme-muted": currentTheme.colors.muted,
    "--theme-accent": currentTheme.colors.accent,
    "--theme-heading-primary": currentTheme.colors.headingPrimary,
    "--theme-heading-secondary": currentTheme.colors.headingSecondary,
    "--theme-code-background": currentTheme.colors.codeBackground,
    "--theme-code-border": currentTheme.colors.codeBorder,
    "--theme-font-family": currentTheme.typography.fontFamily,
    "--theme-heading-font-family": currentTheme.typography.headingFontFamily,
    "--theme-mono-font-family": currentTheme.typography.monospaceFontFamily,
    "--theme-line-height": `${currentTheme.typography.baseLineHeight}`,
    "--theme-heading-line-height": `${currentTheme.typography.headingLineHeight}`,
    "--theme-paragraph-spacing": currentTheme.typography.paragraphSpacing,
    "--theme-heading-h1-size": currentTheme.headings.h1.size,
    "--theme-heading-h1-color": currentTheme.headings.h1.color,
    "--theme-heading-h1-letter": currentTheme.headings.h1.letterSpacing,
    "--theme-heading-h1-mt-factor": `${currentTheme.headings.h1.marginTopFactor}`,
    "--theme-heading-h1-mb-factor": `${currentTheme.headings.h1.marginBottomFactor}`,
    "--theme-heading-h2-size": currentTheme.headings.h2.size,
    "--theme-heading-h2-color": currentTheme.headings.h2.color,
    "--theme-heading-h2-letter": currentTheme.headings.h2.letterSpacing,
    "--theme-heading-h2-mt-factor": `${currentTheme.headings.h2.marginTopFactor}`,
    "--theme-heading-h2-mb-factor": `${currentTheme.headings.h2.marginBottomFactor}`,
    "--theme-heading-h3-size": currentTheme.headings.h3.size,
    "--theme-heading-h3-color": currentTheme.headings.h3.color,
    "--theme-heading-h3-letter": currentTheme.headings.h3.letterSpacing,
    "--theme-heading-h3-mt-factor": `${currentTheme.headings.h3.marginTopFactor}`,
    "--theme-heading-h3-mb-factor": `${currentTheme.headings.h3.marginBottomFactor}`,
    "--theme-heading-h4-size": currentTheme.headings.h4.size,
    "--theme-heading-h4-color": currentTheme.headings.h4.color,
    "--theme-heading-h4-letter": currentTheme.headings.h4.letterSpacing,
    "--theme-heading-h4-mt-factor": `${currentTheme.headings.h4.marginTopFactor}`,
    "--theme-heading-h4-mb-factor": `${currentTheme.headings.h4.marginBottomFactor}`,
    "--theme-heading-h5-size": currentTheme.headings.h5.size,
    "--theme-heading-h5-color": currentTheme.headings.h5.color,
    "--theme-heading-h5-letter": currentTheme.headings.h5.letterSpacing,
    "--theme-heading-h5-mt-factor": `${currentTheme.headings.h5.marginTopFactor}`,
    "--theme-heading-h5-mb-factor": `${currentTheme.headings.h5.marginBottomFactor}`,
    "--theme-heading-h6-size": currentTheme.headings.h6.size,
    "--theme-heading-h6-color": currentTheme.headings.h6.color,
    "--theme-heading-h6-letter": currentTheme.headings.h6.letterSpacing,
    "--theme-heading-h6-mt-factor": `${currentTheme.headings.h6.marginTopFactor}`,
    "--theme-heading-h6-mb-factor": `${currentTheme.headings.h6.marginBottomFactor}`,
    "--theme-heading-h6-transform": currentTheme.headings.h6.textTransform ?? "none",
    "--theme-list-margin": currentTheme.lists.margin,
    "--theme-list-indent": currentTheme.lists.indent,
    "--theme-list-item-spacing": currentTheme.lists.itemSpacing,
    "--theme-list-marker-color": currentTheme.lists.markerColor,
    "--theme-list-marker-weight": currentTheme.lists.markerWeight,
    "--theme-list-bullet": currentTheme.lists.bullet,
    "--theme-list-nested-bullet-1": currentTheme.lists.nestedBulletLevel1,
    "--theme-list-nested-bullet-2": currentTheme.lists.nestedBulletLevel2,
    "--theme-list-ordered-style": currentTheme.lists.orderedStyle,
    "--theme-list-nested-ordered-1": currentTheme.lists.nestedOrderedLevel1,
    "--theme-list-nested-ordered-2": currentTheme.lists.nestedOrderedLevel2,
    "--theme-table-border": currentTheme.tables.borderColor,
    "--theme-table-header-bg": currentTheme.tables.headerBackground,
    "--theme-table-header-text": currentTheme.tables.headerText,
    "--theme-table-row-stripe": currentTheme.tables.rowStripeBackground,
    "--theme-table-cell-py": currentTheme.tables.cellPaddingY,
    "--theme-table-cell-px": currentTheme.tables.cellPaddingX,
    "--theme-image-small-width": `${currentTheme.images.image_small.maxWidth}px`,
    "--theme-image-small-radius": currentTheme.images.image_small.borderRadius,
    "--theme-image-small-padding": currentTheme.images.image_small.padding,
    "--theme-image-small-bg": currentTheme.images.image_small.background,
    "--theme-image-small-shadow": currentTheme.images.image_small.boxShadow,
    "--theme-image-small-caption-color": currentTheme.images.image_small.captionColor,
    "--theme-image-small-caption-size": currentTheme.images.image_small.captionSize,
    "--theme-image-small-caption-transform": currentTheme.images.image_small.captionTransform,
    "--theme-image-medium-width": `${currentTheme.images.image_medium.maxWidth}px`,
    "--theme-image-medium-radius": currentTheme.images.image_medium.borderRadius,
    "--theme-image-medium-padding": currentTheme.images.image_medium.padding,
    "--theme-image-medium-bg": currentTheme.images.image_medium.background,
    "--theme-image-medium-shadow": currentTheme.images.image_medium.boxShadow,
    "--theme-image-medium-caption-color": currentTheme.images.image_medium.captionColor,
    "--theme-image-medium-caption-size": currentTheme.images.image_medium.captionSize,
    "--theme-image-medium-caption-transform": currentTheme.images.image_medium.captionTransform,
    "--theme-image-big-width": `${currentTheme.images.image_big.maxWidth}px`,
    "--theme-image-big-radius": currentTheme.images.image_big.borderRadius,
    "--theme-image-big-padding": currentTheme.images.image_big.padding,
    "--theme-image-big-bg": currentTheme.images.image_big.background,
    "--theme-image-big-shadow": currentTheme.images.image_big.boxShadow,
    "--theme-image-big-caption-color": currentTheme.images.image_big.captionColor,
    "--theme-image-big-caption-size": currentTheme.images.image_big.captionSize,
    "--theme-image-big-caption-transform": currentTheme.images.image_big.captionTransform,
  };
}
