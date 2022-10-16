# Google Cloud Secret Manager config tool

This action allows to replace the secrets in a file.<br/>
Also, to replace the values in a .env file and apply it to the job.

## Inputs
- `gcp_credentials_json`
    - Environment alternative: `GCPSA_CREDENTIALS_JSON`
    - (optional) Embedded auth for GCP. You can skip it and use [google-github-actions/auth](https://github.com/google-github-actions/auth)
    - required: `false`
- `template_file`
    - Environment alternative: `GCPSA_TEMPLATE_FILE`
    - The file where to replace the secrets
    - required: `false` (if `env_file` is provided)
- `env_file`
    - Environment alternative: `GCPSA_ENV_FILE`
    - The env file where to replace the secrets. Env file will be applied
    - required: `false` (if `template_file` is provided)
- `key_prefix`
    - Environment alternative: `GCPSA_KEY_PREFIX`
    - A prefix to add to all keys when calling GCP
    - required: `false`

## Example usage

### Config file values substitution
Your example config:
```yaml
awesome_app:
  foo_config:
    foo: {{ projects/1234567890/secrets/secret-id-one }}
  bar_config: >
    {{ projects/1234567890/secrets/secret-id-two }}
  another_secret: '{{ projects/1234567890/secrets/secret-id-three }}'
```

With environment variables:
```yaml
name: 'whatever'

on: push

env:
  GCPSA_CREDENTIALS_JSON: ${{ secrets.GOOGLE_CREDENTIALS_JSON }}
  GCPSA_TEMPLATE_FILE: config/config.yml

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: nightstory/gcp-secrets-action@v1
      - run: cat config/config.yml
```

Without environment variables:
```yaml
name: 'whatever'

on: push

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: nightstory/gcp-secrets-action@v1
        with:
          gcp_credentials_json: ${{ secrets.GOOGLE_CREDENTIALS_JSON }}
          template_file: config/config.yml
        
      - run: cat config/config.yml
```

Result:
```yaml
awesome_app:
  foo_config:
    foo: value from config for secret-id-one
  bar_config: >
    value from config for secret-id-two
  another_secret: 'value from config for secret-id-three'
```

### Env file

Example env file:
```shell
SOME_SECRET={{ projects/1234567890/secrets/secret-id-one }}
```

Without environment variables:
```yaml
name: 'whatever'

on: push

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: nightstory/gcp-secrets-action@v1
        with:
          gcp_credentials_json: ${{ secrets.GOOGLE_CREDENTIALS_JSON }}
          env_file: .env
        
      - run: echo ${{ env.SOME_SECRET }} # will print the value for secret-id-one
```

### Key prefix
Your example config:
```yaml
awesome_app:
  another_secret: '{{ secret-id-three }}'
```

Without environment variables:
```yaml
name: 'whatever'

on: push

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: nightstory/gcp-secrets-action@v1
        with:
          gcp_credentials_json: ${{ secrets.GOOGLE_CREDENTIALS_JSON }}
          template_file: config/config.yml
          key_prefix: {{ projects/1234567890/secrets }}
        
      - run: cat config/config.yml
```

## License
Licensed under MIT license.<br/>
Please also see [licenses.txt](lib_main/licenses.txt)