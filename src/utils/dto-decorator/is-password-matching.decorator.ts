import { registerDecorator, ValidationOptions } from 'class-validator';
import { DtoDecoratorEnum } from '../enums/decorator.enum';
import { IsPasswordMatchingConstraint } from '../dto-validator/is-password-matching.validator';

export function IsPasswordMatching(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: DtoDecoratorEnum.MATCH_DECORATOR_NAME,
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsPasswordMatchingConstraint,
    });
  };
}
