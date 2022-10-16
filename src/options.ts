import * as core from '@actions/core'

export interface Options {
  readonly gcpCredentialsJson: string | null
  readonly templateFile: string | null
  readonly envFile: string | null
  readonly keyPrefix: string
}

function findOption(inputKey: string, envKey: string) {
  const input = core.getInput(inputKey)

  if (input.length === 0) {
    return process.env[envKey] ?? null
  } else {
    return input
  }
}

const getOptions: () => Options = () => ({
  gcpCredentialsJson: findOption('gcp_credentials_json', 'GCPSA_CREDENTIALS_JSON'),
  templateFile: findOption('template_file', 'GCPSA_TEMPLATE_FILE'),
  envFile: findOption('env_file', 'GCPSA_ENV_FILE'),
  keyPrefix: findOption('key_prefix', 'GCPSA_KEY_PREFIX') ?? '',
})

export const validateOptions: (options: Options) => boolean =
  (o) => {
    let result = true

    if (!o.templateFile && !o.envFile) {
      core.setFailed(`please provide the template file, the env file or both`)
      result = false
    }

    return result
  }

export default getOptions