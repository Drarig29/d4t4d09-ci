import {Plugin} from '@d4t4d09-ci/core'

import {CloudRunFlareCommand} from './flare'

const plugin: Plugin = {
  commands: [CloudRunFlareCommand],
}

export default plugin
