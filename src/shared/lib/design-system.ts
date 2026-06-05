import { createThemeCss, defaultTheme, defaultThemeName, light } from '@reqly/design-system';

const DESIGN_SYSTEM_STYLE_ID = 'reqly-design-system';

const designSystemCss = createThemeCss(defaultTheme, light, {
    lightSelector: ':root, html.dark',
    darkSelector: 'html.light',
});

export function injectDesignSystemStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(DESIGN_SYSTEM_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = DESIGN_SYSTEM_STYLE_ID;
    style.textContent = designSystemCss;
    document.head.prepend(style);
}

export { defaultThemeName };
