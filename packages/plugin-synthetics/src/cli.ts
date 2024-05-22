import {Plugin} from '@d4t4d09-ci/core'

import {RunTestsCommand} from './run-tests-command'
import {UploadApplicationCommand} from './upload-application-command'

const plugin: Plugin = {
  commands: [RunTestsCommand, UploadApplicationCommand],
}

export default plugin
