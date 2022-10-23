module.exports = {
  root: true,
  extends: [
    'blockabc/typescript'
  ],
  rules: {
    '@typescript-eslint/indent': 0
  },
  parserOptions: {
    project: 'tsconfig.json',
  }
}
