const spotifyPrettierConfig = require('@spotify/prettier-config');

module.exports = {
  ...spotifyPrettierConfig,
  overrides: [
    {
      // Enable line wrapping for Markdown files
      files: '*.md',
      options: {
        proseWrap: 'always',
      },
    },
  ],
};
