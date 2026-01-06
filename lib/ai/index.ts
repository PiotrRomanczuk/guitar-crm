/**
 * AI System Entry Point
 *
 * Exports all AI-related functionality including the new Agent Registry System
 */

export * from './types';
export * from './provider-factory';
export * from './providers';

// Agent Registry System
export * from './agent-registry';
export * from './agent-specifications';
export * from './agent-execution';

// Initialize agent registry on module load
import { registerAllAgents } from './agent-specifications';

// Register all agents when module is imported
try {
  registerAllAgents();
} catch (error) {
  console.error('[AI] Failed to register agents:', error);
}

// Re-export commonly used functions
export { getAIProvider } from './provider-factory';
