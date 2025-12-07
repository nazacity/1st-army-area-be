export class firstLetterUpperCase {
  static upperCase(text: string): string {
    return text[0].toUpperCase() + text.slice(1).toLowerCase()
  }
}
