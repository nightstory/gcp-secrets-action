import * as fs from 'fs';
import {GoogleSecretManagerReference} from './gcp/GoogleSecretManagerReference';
import {GoogleSecretManagerClient} from './gcp/GoogleSecretManagerClient';

export class TemplateProcessor {
  private readonly googleClient: GoogleSecretManagerClient
  private readonly extractRegex: RegExp = /\{\{\s*([a-zA-Z0-9-_/]+)\s*}}/g

  constructor(googleClient: GoogleSecretManagerClient) {
    this.googleClient = googleClient
  }

  async processFile(file: string, keysPrefix: string) {
    this.applySecrets(file, await this.extractSecrets(file, keysPrefix))
  }

  async extractSecrets(file: string, keysPrefix: string): Promise<{ [keys: string]: string }> {
    const secretKeys = this.extractSecretKeys(file)
    const secretsMap: { [keys: string]: string } = {}

    for (let key of secretKeys) {
      secretsMap[key] = await this.googleClient.accessSecret(new GoogleSecretManagerReference(keysPrefix + key).selfLink())
    }

    return secretsMap
  }

  applySecretsInString(input: string, data: { [keys: string]: string }): string {
    let content = input

    for (let key in data) {
      content = content.replace(this.replaceRegex(key), data[key])
    }

    return content
  }

  private replaceRegex(key: string): RegExp {
    return new RegExp(`\\{\\{\\s*${key}\\s*}}`, 'g')
  }

  private extractSecretKeys(file: string): string[] {
    const content = fs.readFileSync(file).toString()
    const matches = content.matchAll(this.extractRegex)
    const keys = [...matches].map(m => m[1])

    return [...new Set(keys)]
  }

  private applySecrets(file: string, data: { [keys: string]: string }): void {
    let content = this.applySecretsInString(fs.readFileSync(file).toString(), data)
    fs.writeFileSync(file, content)
  }
}