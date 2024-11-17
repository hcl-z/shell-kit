import { definePrompt } from '../../src/utils/index.js'

export default definePrompt([
  {
    type: 'confirm',
    name: 'git',
    message: 'Would you like to initialize a git repository?',
    initial: true,
  },
  {
    name: 'gitRemote',
    message: 'Git remote url',
    type: prev => prev ? 'text' : null,
    initial: (prev, store) => {
      return `https://github.com/${store.userName}/${store.name}.git`
    },
  },
])
