import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'string-or-number', async: false })
export class IsNumericString implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return typeof value === 'string' && /^[0-9]+$/.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must contain only numeric characters`;
  }
}
