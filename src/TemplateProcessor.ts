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
    const secretKeys = this.extractSecretKeys(file)
    const secretsMap: { [keys: string]: string } = {}

    for (let key of secretKeys) {
      secretsMap[key] = await this.googleClient.accessSecret(new GoogleSecretManagerReference(keysPrefix + key).selfLink())
    }

    this.applySecrets(file, secretsMap)
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
    let content = fs.readFileSync(file).toString()

    for (let key in data) {
      content = content.replace(this.replaceRegex(key), data[key])
    }

    fs.writeFileSync(file, content)
  }
}