/**
 * AI Agent Registry System
 *
 * This file re-exports the modular agent registry system components
 * for backward compatibility. The actual implementation is now split
 * across multiple focused modules in the registry/ directory.
 */

// Re-export everything from the modular registry
export * from './registry';

// Maintain backward compatibility by re-exporting the main components
export { agentRegistry, executeAgent } from './registry';
export type { AgentSpecification, AgentContext, AgentRequest, AgentResponse } from './registry';
