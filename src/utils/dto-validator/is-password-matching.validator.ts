import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DtoDecoratorEnum } from '../enums/decorator.enum';

@ValidatorConstraint({ name: DtoDecoratorEnum.MATCH_DECORATOR_NAME })
export class IsPasswordMatchingConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const [relatedPropertyName] = validationArguments.constraints;
    return `${validationArguments.property} must match ${relatedPropertyName}`;
  }
}
