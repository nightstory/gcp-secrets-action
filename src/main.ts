import * as core from '@actions/core'
import {parseCredential} from '@google-github-actions/actions-utils';

import getOptions, {Options, validateOptions} from './options'
import {TemplateProcessor} from './TemplateProcessor';
import {GoogleSecretManagerClient} from './gcp/GoogleSecretManagerClient';

const main = async () => {
  const options: Options = getOptions()

  if (!validateOptions(options)) {
    process.exit(1)
  }

  const credentials = options.gcpCredentialsJson ? parseCredential(options.gcpCredentialsJson) : undefined

  const client = new GoogleSecretManagerClient({credentials})
  const processor = new TemplateProcessor(client)

  if (options.templateFile) {
    await processor.processFile(options.templateFile, options.keyPrefix)
  }

  if (options.envFile) {
    await processor.processFile(options.envFile, options.keyPrefix)
    const result = require('dotenv').config({ path: options.envFile, override: true })

    if (result.error || !result.parsed) {
      core.setFailed(`failed to parse result env file: ${result.error}`)
      process.exit(1)
    }

    for (const key in result.parsed) {
      core.exportVariable(key, result.parsed[key])
    }
  }
}

try {
  main()
} catch (error) {
  core.setFailed(`${error}`)
}