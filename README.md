<h1 align="center">
Ciny
<br>
<a href="https://npm.im/shell-kit">
  <img src="https://badgen.net/npm/v/shell-kit">
</a>
<a href="https://npm.im/shell-kit">
  <img src="https://badgen.net/github/stars/hcl-z/shell-kit">
</a>
<a href="https://npm.im/shell-kit">
  <img src="https://badgen.net/npm/license/shell-kit">
</a>
</h1>

><p align="center">
tool chain for node-cli 
</p>
🚧 in progress 🚧

## Install

```sh
npm install ciny
```

## Usage

```sh
const shellkit = createShellKit({
  mixins: [CommandMixin, PromptMixin, TemplateMixin, PackageMixin],
})

shellkit.addCommand({
  name: 'init',
  description: 'init the project',
  callback: () => {
    shellkit.prompt({
      name: 'name',
      message: 'What is the project name?',
    })
  },
})

await shellkit.parse()
shellkit.copyFromTemplate().toDest()

```

## Api
### createShellKit

- description: create a shellkit instance
- params:
  - config: ShellKitConfig
- return: ShellkitContext

## Mixin
> mixin methods to the shellkit instance

### commandMixin
- description: mixin command methods to the shellkit instance
- config:
  - locale: string
  - usage: string
- methods:
  - addCommand: add a command to the shellkit instance
  - addOption: add a option to the command
  - parse: parse the command and options

### promptMixin

- description: mixin prompt methods to the shellkit instance
- methods:
  - prompt: prompt the user for input

### templateMixin

- description: mixin template methods to the shellkit instance
- methods:
  - copyFromRoot: copy a file from the root directory
  - copyFromTemplate: copy a file from the template directory
  - copyFromDest: copy a file from the destination directory

### packageMixin

- description: mixin package methods to the shellkit instance
- methods:
  - setPkgManager: set the package manager
  - runScript: run a script with the package manager
  - install: install a package with the package manager

