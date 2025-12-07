export class ResponseIdModel {
  meta: any
  data: ResponseIdDataModel
  link: {
    prev: string
    next: string
  }
}

export class ResponseIdArrayModel {
  meta: any
  data: ResponseIdDataModel[]
  link: {
    prev: string
    next: string
  }
}

export class ResponseIdDataModel {
  type: string
  id: number
  attributes: any
  relationships: object
}
