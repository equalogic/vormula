import { ValidationRuleViolation } from './ValidationRuleViolation';

export interface ServerValidationError {
  error: Error;
  message: string;
  violations: ValidationRuleViolation[];
}
