import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { User } from 'src/modules/user/entities/user.entity'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    let status: HttpStatus
    let errorMessage: object
    let errorLogMessage: object
    let responseBody: string | object = ''

    const user = request.user as User

    const userResponse = user
      ? {
          id: user.id,
        }
      : 'Not signed in'
    if (exception instanceof HttpException) {
      status = exception.getStatus()
      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        errorMessage = { message: 'Internal Server Error' }
        errorLogMessage = { message: exception.getResponse() }
      } else {
        const errorResponse = exception.getResponse()
        errorMessage = (errorResponse as object) ?? {
          message: exception.message,
        }
        errorLogMessage = errorMessage
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      errorLogMessage = { message: exception.message }
      errorMessage = { message: 'Internal Server Error' }
    }
    if (Object.keys(request.body).length !== 0) {
      delete request.body.password
      delete request.body.confirmPassword
      responseBody = request.body
    }
    this.logger.error(
      `Status: ${status} - Method: ${request.method} - URL: ${request.url}\n
    ${JSON.stringify(errorLogMessage)}\n
    User:${JSON.stringify(userResponse, null, '\t')}\n${
      Object.keys(request.params).length !== 0
        ? `    Params:${JSON.stringify(request.params, null, '\t')}\n`
        : ''
    }${
      Object.keys(request.query).length !== 0
        ? `    Query:${JSON.stringify(request.query, null, '\t')}\n`
        : ''
    }${`    Body:${JSON.stringify(responseBody, null, '\t')}\n`}
    ${exception instanceof HttpException ? exception.stack : ''}`,
    )
    response.status(status).json(errorMessage)
  }
}
