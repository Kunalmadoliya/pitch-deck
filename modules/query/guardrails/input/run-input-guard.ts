import { GuardrailBlockedError } from "../../errors";
import { classifyInjection } from "./injection-classifier";
import { checkInputRules } from "./rules";
export async function runInputGuard(message: string): Promise<string> {
  const rules = checkInputRules(message);
  if (!rules.safe) throw new GuardrailBlockedError();
  const verdict = await classifyInjection(rules.message);
  if (!verdict.safe) throw new GuardrailBlockedError();
  return rules.message;
}
