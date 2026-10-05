import { SevenError, toSevenError } from "./errors";

export type SevenErrorCategory =
  | "MODEL_ERROR"
  | "NETWORK_ERROR"
  | "TOOL_ERROR"
  | "MEMORY_ERROR"
  | "FILE_ERROR"
  | "AUTH_ERROR"
  | "RATE_LIMIT"
  | "VALIDATION_ERROR"
  | "CANCELLED"
  | "TIMEOUT"
  | "INTERNAL_ERROR";

export type ErrorDisposition = Readonly<{
  category: SevenErrorCategory;
  retryable: boolean;
  userMessage: string;
  internalCode: SevenError["code"];
}>;

function storageCategory(error: SevenError): SevenErrorCategory {
  const domain = error.details?.domain;
  if (domain === "memory") return "MEMORY_ERROR";
  if (domain === "file" || domain === "attachment") return "FILE_ERROR";
  return "INTERNAL_ERROR";
}

export function classifySevenError(error: unknown): ErrorDisposition {
  const normalized = toSevenError(error);
  const rateLimited =
    normalized.details?.rateLimited === true ||
    normalized.details?.httpStatus === 429;

  let category: SevenErrorCategory;
  switch (normalized.code) {
    case "CANCELLED": category = "CANCELLED"; break;
    case "DEADLINE_EXCEEDED": category = "TIMEOUT"; break;
    case "NETWORK": category = "NETWORK_ERROR"; break;
    case "PROVIDER": category = rateLimited ? "RATE_LIMIT" : "MODEL_ERROR"; break;
    case "TOOL": category = "TOOL_ERROR"; break;
    case "PERMISSION": category = "AUTH_ERROR"; break;
    case "VALIDATION": category = "VALIDATION_ERROR"; break;
    case "STORAGE": category = storageCategory(normalized); break;
    case "BRIDGE":
    case "UNKNOWN":
    default: category = "INTERNAL_ERROR"; break;
  }

  const userMessage =
    category === "CANCELLED" ? "The request was cancelled." :
    category === "TIMEOUT" ? "The request timed out. You can try again." :
    category === "NETWORK_ERROR" ? "Seven could not reach the network. Check the connection and try again." :
    category === "RATE_LIMIT" ? "The model provider is temporarily rate-limited. Seven can retry or use another route." :
    category === "MODEL_ERROR" ? "The model provider could not complete the request." :
    category === "TOOL_ERROR" ? "A tool could not complete the requested action." :
    category === "MEMORY_ERROR" ? "Seven could not access memory safely for this request." :
    category === "FILE_ERROR" ? "Seven could not access the requested file safely." :
    category === "AUTH_ERROR" ? "Seven does not have permission to complete that action." :
    category === "VALIDATION_ERROR" ? "The request or returned data was invalid." :
    "Seven hit an internal error while processing the request.";

  return Object.freeze({
    category,
    retryable: normalized.retryable || category === "NETWORK_ERROR" || category === "RATE_LIMIT" || category === "TIMEOUT",
    userMessage,
    internalCode: normalized.code,
  });
}
