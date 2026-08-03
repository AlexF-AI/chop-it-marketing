/**
 * The ChatGPT section's content config.
 *
 * Chop it in ChatGPT is live and must never carry a "Coming soon" label. What
 * is not live is the account connection, personal-library/pantry access in the
 * conversation, and the rich recipe carousels.
 *
 * When authentication is approved, flip `AUTH_LIVE` to true. That single change
 * moves the three coming-soon lines up into LIVE NOW, drops the COMING SOON
 * block, and swaps the screenshot and its caption for the signed-in carousel
 * capture. No layout work, no copy rewrite.
 */
export const AUTH_LIVE = false;

const LIVE = [
  'Find recipes for an occasion, diet or ingredient.',
  'Create or import recipes.',
  'Build a weekly menu and shopping list.',
  'Open results in Chop it.',
];

const SOON = [
  'Sign in to your Chop it account inside ChatGPT.',
  'Use your personal library and pantry in the conversation.',
  'Browse rich visual recipe carousels.',
];

export type PluginShot = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * The authenticated carousel capture does not exist yet. Until it does,
 * `AUTH_LIVE` must stay false — there is nothing to render in its place.
 */
const PLUGIN_SHOT_UNAUTHED: PluginShot = {
  src: '/screens/chatgpt-shopping-list.jpeg',
  alt: 'Chop it in ChatGPT combining the week into one shopping list',
  width: 1179,
  height: 1568,
};

const PLUGIN_SHOT_AUTHED: PluginShot | null = null;

export const chatgptSection = {
  liveNow: AUTH_LIVE ? [...LIVE, ...SOON] : LIVE,
  comingSoon: AUTH_LIVE ? [] : SOON,
  showComingSoon: !AUTH_LIVE,
  pluginShot: AUTH_LIVE ? PLUGIN_SHOT_AUTHED : PLUGIN_SHOT_UNAUTHED,
  pluginCaption: AUTH_LIVE
    ? 'Signed in, with your own library'
    : 'One shopping list, built in the chat',
} as const;
