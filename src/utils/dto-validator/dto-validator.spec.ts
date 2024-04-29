import { ValidationArguments } from 'class-validator';
import { IsPasswordMatchingConstraint } from './is-password-matching.validator';

describe('IsPasswordMatchingConstraint', () => {
  let constraint: IsPasswordMatchingConstraint;

  beforeEach(() => {
    constraint = new IsPasswordMatchingConstraint();
  });

  it('should return true if values match', () => {
    const value = 'password';
    const args = {
      constraints: ['confirmPassword'],
      object: {
        confirmPassword: value,
      },
    } as ValidationArguments;
    expect(constraint.validate(value, args)).toBe(true);
  });

  it('should return false if values do not match', () => {
    const value = 'password';
    const args = {
      constraints: ['confirmPassword'],
      object: {
        confirmPassword: 'differentPassword',
      },
    } as ValidationArguments;
    expect(constraint.validate(value, args)).toBe(false);
  });

  it('should generate correct error message', () => {
    const propertyName = 'password';
    const relatedPropertyName = 'confirmPassword';
    const validationArguments = {
      property: propertyName,
      constraints: [relatedPropertyName],
    } as ValidationArguments;
    expect(constraint.defaultMessage(validationArguments)).toBe(
      `${propertyName} must match ${relatedPropertyName}`
    );
  });
});