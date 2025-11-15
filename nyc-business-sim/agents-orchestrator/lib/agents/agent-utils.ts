/**
 * Utility functions for AI agents
 * Provides robust JSON parsing, validation, and error handling
 */

import { z, ZodSchema } from 'zod';

/**
 * Validates and parses AI agent response
 * @param data Raw data from AI agent
 * @param schema Zod schema for validation
 * @returns Validated and typed data
 * @throws Error if validation fails
 */
export function validateAgentResponse<T>(
  data: unknown,
  schema: ZodSchema<T>,
  agentName: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`${agentName} validation failed:`, {
        errors: error.errors,
        data: JSON.stringify(data, null, 2),
      });
      throw new Error(
        `${agentName} returned invalid data: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    throw error;
  }
}

/**
 * Retry function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param baseDelay Base delay in milliseconds
 * @returns Result from function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }

      const waitTime = Math.pow(2, attempt - 1) * baseDelay;
      console.log(`⏳ Retry attempt ${attempt}/${maxRetries} in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError || new Error('Unknown error in retry');
}

/**
 * Type guard to check if agent result is valid
 */
export function isValidAgentResult<T>(
  result: unknown,
  requiredFields: (keyof T)[]
): result is T {
  if (!result || typeof result !== 'object') return false;
  
  return requiredFields.every(field => field in result);
}

/**
 * Safe JSON stringify with error handling
 */
export function safeStringify(obj: unknown, indent: number = 2): string {
  try {
    return JSON.stringify(obj, null, indent);
  } catch (error) {
    console.error('Failed to stringify object:', error);
    return String(obj);
  }
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
}

/**
 * Log agent execution metrics
 */
export function logAgentMetrics(
  agentName: string,
  startTime: number,
  endTime: number,
  tokenUsage?: { inputTokens: number; outputTokens: number; totalTokens: number }
) {
  const duration = endTime - startTime;
  console.log(`✅ ${agentName} completed in ${duration}ms`);
  
  if (tokenUsage) {
    console.log(`📊 Token usage: ${tokenUsage.totalTokens} total (${tokenUsage.inputTokens} in, ${tokenUsage.outputTokens} out)`);
  }
}
