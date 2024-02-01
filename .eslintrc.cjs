module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['header'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        'header/header': ['error', './header.js'],
      },
    },
  ],
};
