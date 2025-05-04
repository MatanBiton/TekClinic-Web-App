import validator from 'validator'
import { phone } from 'phone'

export const minNameLength = 1
export const maxNameLength = 100

export const maxSpecialNoteLength = 500

type Validator = (value: string) => string | null

export const israeliIDValidator = (id: string): string | null => {
  if (id.length !== 9 || isNaN(parseInt(id))) {
    return 'Israeli ID must be 9 digits long'
  }

  const digits = id.split('').map(Number)
  const sum = digits.reduce((acc, digit, i) => {
    let step = digit * ((i % 2) + 1)
    if (step > 9) step -= 9
    return acc + step
  }, 0)

  if (sum % 10 !== 0) {
    return 'Invalid Israeli ID'
  }
  return null
}

export const phoneValidator = (value: string, required: boolean = false): string | null => {
  if (validator.isEmpty(value)) {
    return required ? 'Phone number is required' : null
  }
  if (!(phone(value).isValid || phone(value, { country: 'ISR' }).isValid)) {
    return 'Invalid phone number'
  }
  return null
}

export const nameValidator = (value: string, required: boolean = false): string | null => {
  if (validator.isEmpty(value)) {
    return required ? 'Name is required' : null
  }
  if (!validator.isLength(value, {
    min: minNameLength,
    max: maxNameLength
  })) {
    return `Name must be between ${minNameLength} and ${maxNameLength} characters`
  }
  return null
}

export const specialNoteValidator = (value: string): string | null => {
  if (!validator.isLength(value, {
    max: maxSpecialNoteLength
  })) {
    return `Special note must be less than ${maxSpecialNoteLength} characters`
  }
  return null
}

export function notEmptyValidator(
  errorMessage: string = 'Field is required'
): Validator {
  return value =>
    validator.isEmpty(value, { ignore_whitespace: true })
      ? errorMessage
      : null
}
