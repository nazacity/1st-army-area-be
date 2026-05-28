export class S3Utils {
  static getObjectKeyFromUrl(resourceUrl) {
    try {
      const url = new URL(resourceUrl)
      return url.pathname
    } catch (error) {
      throw new Error('Resource Url is invalid.')
    }
  }

  static getFileNameFromUrl(resourceUrl) {
    try {
      return resourceUrl.split('/').pop()
    } catch (error) {
      throw new Error('Resource Url is invalid.')
    }
  }

  static getHostNameFromUrl(resourceUrl) {
    try {
      const url = new URL(resourceUrl)
      return url.hostname
    } catch (error) {
      throw new Error('Resource Url is invalid.')
    }
  }

  static removeWhiteSpace(fileName) {
    return fileName.replace(/\s+/g, '_')
  }

  static sanitizeFileName(fileName: string): string {
    const ext = fileName.includes('.') ? '.' + fileName.split('.').pop() : ''
    const base = fileName.includes('.') ? fileName.split('.').slice(0, -1).join('.') : fileName
    const sanitized = base.replace(/[^a-zA-Z0-9_-]/g, '')
    return ext ? sanitized + ext : sanitized
  }
}
