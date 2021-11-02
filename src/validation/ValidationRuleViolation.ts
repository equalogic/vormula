export interface ValidationRuleViolation {
  path: string[];
  message: string;
  value?: any;
}
