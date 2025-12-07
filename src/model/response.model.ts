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
}

export class ResourceUploadUrl {
  uploadUrl: string
  resourceUrl: string
}
