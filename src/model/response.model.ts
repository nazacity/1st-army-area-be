export class ResponseModel<T> {
  meta?: any
  data: T
  link?: {
    prev: string
    next: string
  }
}

export class ResourceUrl {
  fileName: string
  resourceUrl: string
  fileType?: string
  fileSize?: number
}

export class ResourceUploadUrl {
  uploadUrl: string
  resourceUrl: string
}
