import { HttpRequest, HttpResponse, Controller, EmailValidator } from '../protocols/index'
import { MissingParamError, InvalidParamError } from '../errors/index'
import { badRequest, serverError } from '../helpers/http-helper'
import { AddAccount } from '../../domain/usecases/add-account'

export class SignUpController implements Controller {
  private readonly emailValidator: EmailValidator
  private readonly AddAccount: AddAccount

  constructor (emailValidator: EmailValidator, AddAccount: AddAccount) {
    this.emailValidator = emailValidator
    this.AddAccount = AddAccount
  }

  handle (httpRequest: HttpRequest): HttpResponse {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }
      const { email, name, password, passwordConfirmation } = httpRequest.body
      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      const isValid = this.emailValidator.isValid(email)
      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }

      this.AddAccount.add({
        email,
        name,
        password
      })
    } catch (error) {
      return serverError()
    }
  }
}
