export class Mask {
  static maskAccountNumber(accountNumber: string) {
    if (!accountNumber) return
    const maskedAccountNumber = accountNumber.replace(
      /^(.*)(.{4})$/g,
      (all, mask, show) => mask.replace(/./g, '*') + show,
    )

    return maskedAccountNumber
  }

  static maskTelNo(telNo: string) {
    if (!telNo) return
    const maskedTelNo = telNo.replace(
      /^(.*)(.{3})$/g,
      (all, mask, show) => mask.slice(2).replace(/./g, '*') + show,
    )

    return maskedTelNo
  }

  static maskEmail(email: string) {
    if (!email) return
    const maskedEmail = email.replace(
      /^(.*)(.{3})(@.*)$/g,
      (all, mask, show, back) => mask.replace(/./g, '*') + show + back,
    )
    return maskedEmail
  }
}
