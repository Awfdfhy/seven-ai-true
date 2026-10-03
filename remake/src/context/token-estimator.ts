import { SevenError } from "../core/errors";
import type { ProviderMessage } from "../providers/contracts";

export interface TokenEstimator {
  estimateText(text: string): number;
  estimateMessages(messages: readonly ProviderMessage[]): number;
}

export class ConservativeTokenEstimator implements TokenEstimator {
  constructor(
    private readonly charsPerToken = 3,
    private readonly messageOverhead = 6,
  ) {
    if (
      !Number.isSafeInteger(charsPerToken) ||
      charsPerToken <= 0 ||
      !Number.isSafeInteger(messageOverhead) ||
      messageOverhead < 0
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Token estimator settings are invalid.",
      });
    }
  }

  estimateText(text: string): number {
    if (typeof text !== "string") {
      throw new SevenError({
        code: "VALIDATION",
        message: "Token estimator text must be a string.",
      });
    }
    if (text.length === 0) return 0;
    return Math.max(1, Math.ceil([...text].length / this.charsPerToken));
  }

  estimateMessages(messages: readonly ProviderMessage[]): number {
    if (!Array.isArray(messages)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Token estimator messages must be an array.",
      });
    }
    let total = 0;
    for (const message of messages) {
      if (
        !message ||
        typeof message !== "object" ||
        (message.role !== "system" &&
          message.role !== "user" &&
          message.role !== "assistant") ||
        typeof message.content !== "string"
      ) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Token estimator received a malformed message.",
        });
      }
      total += this.messageOverhead + this.estimateText(message.content);
    }
    return total;
  }
}
