interface formatTelNoOptions {
  notThrowError: boolean
}

export class Format {
  static formatTelNo(telNo: string, options?: formatTelNoOptions): string {
    if (telNo.slice(0, 3) === '+66' && telNo.length === 12) {
      return telNo
    }
    if (telNo[0] === '0' && telNo.length === 10) {
      return `+66${telNo.slice(1)}`
    }
    if (telNo.slice(0, 2) === '66' && telNo.length === 11) {
      return `+66${telNo.slice(2)}`
    }
    if (!options?.notThrowError)
      throw new Error('Invalid phone number for Thai region')
  }

  static formatThumbnailName(originalname: string): string {
    const splitString = originalname.split('.')
    const thumbnailName = `${splitString[0]}_tn.${splitString[1]}`
    return thumbnailName
  }

  static formatQueryTelNo(telNo: string): string {
    if (!telNo) return
    if (telNo[0] === '0') return `+66${telNo.slice(1) ?? ''}`
    return telNo
  }

  static formatBackTelNo(telNo: string): string {
    if (!telNo) throw new Error('Invalid phone number')
    if (telNo[0] === '0' && telNo.length === 10) {
      return telNo
    }
    if (telNo.slice(0, 2) === '66' && telNo.length === 11) {
      return `0${telNo.slice(2)}`
    }
    if (telNo.slice(0, 3) === '+66' && telNo.length === 12) {
      return `0${telNo.slice(3)}`
    }
    throw new Error('Invalid phone number for Thai region')
  }
}
