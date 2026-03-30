import type { AlertRuleCondition, AutomationCondition } from "@/lib/api/types";

export interface SensorSnapshot {
  temperature?: number;
  humidity_air?: number;
  humidity_soil?: number;
  light?: number;
}

type RuleCondition = AlertRuleCondition | AutomationCondition;

function compare(left: number, operator: RuleCondition["operator"], right: number): boolean {
  switch (operator) {
    case "<":
      return left < right;
    case ">":
      return left > right;
    case "<=":
      return left <= right;
    case ">=":
      return left >= right;
    case "==":
      return left === right;
    default:
      return false;
  }
}

export function evaluateCondition(condition: RuleCondition, snapshot: SensorSnapshot): boolean {
  const value = snapshot[condition.metric_type as keyof SensorSnapshot];
  if (typeof value !== "number" || Number.isNaN(value)) {
    return false;
  }

  return compare(value, condition.operator, condition.threshold_value);
}

export function evaluateConditions(conditions: RuleCondition[], snapshot: SensorSnapshot): boolean {
  if (conditions.length === 0) return false;

  const andConditions = conditions.filter((c) => c.logic_group === "AND");
  const orConditions = conditions.filter((c) => c.logic_group === "OR");

  const andResult = andConditions.length === 0 ? true : andConditions.every((c) => evaluateCondition(c, snapshot));
  const orResult = orConditions.length === 0 ? true : orConditions.some((c) => evaluateCondition(c, snapshot));

  if (andConditions.length > 0 && orConditions.length > 0) {
    return andResult && orResult;
  }

  if (andConditions.length > 0) return andResult;
  return orResult;
}
