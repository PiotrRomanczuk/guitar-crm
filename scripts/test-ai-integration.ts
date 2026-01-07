#!/usr/bin/env tsx
/**
 * Integration Test - AI Provider with Environment Config
 *
 * Tests the complete AI system with actual environment configuration
 * Usage: npm run test:ai-integration
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { getAIProvider } from '../lib/ai/provider-factory';
import { isAIError } from '../lib/ai/types';

async function testIntegration() {
  console.log('\n🧪 AI Provider Integration Test\n');
  console.log('Environment:');
  console.log(`  AI_PROVIDER: ${process.env.AI_PROVIDER || 'not set (defaults to auto)'}`);
  console.log(`  AI_PREFER_LOCAL: ${process.env.AI_PREFER_LOCAL || 'not set (defaults to true)'}`);
  console.log(`  OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '✅ set' : '❌ not set'}`);
  console.log(
    `  OLLAMA_BASE_URL: ${process.env.OLLAMA_BASE_URL || 'not set (defaults to localhost:11434)'}\n`
  );

  try {
    // Get provider based on environment config
    console.log('📡 Getting AI provider...');
    const provider = await getAIProvider();
    console.log(`✅ Provider selected: ${provider.name}\n`);

    // Check availability
    console.log('🔍 Checking provider availability...');
    const available = await provider.isAvailable();

    if (!available) {
      console.log(`❌ ${provider.name} is not available`);
      process.exit(1);
    }

    console.log(`✅ ${provider.name} is available\n`);

    // List models
    console.log('📋 Fetching available models...');
    const models = await provider.listModels();
    console.log(`✅ Found ${models.length} models:`);
    models.slice(0, 5).forEach((model, index) => {
      const local = model.isLocal ? '🏠 Local' : '☁️  Cloud';
      console.log(`   ${index + 1}. ${model.name} ${local}`);
    });
    if (models.length > 5) {
      console.log(`   ... and ${models.length - 5} more`);
    }
    console.log('');

    // Test completion with first available model
    const testModel = models[0];
    console.log(`🚀 Testing completion with: ${testModel.name}`);
    console.log('   Question: "What is 2+2? Answer briefly."\n');

    const startTime = Date.now();
    const result = await provider.complete({
      model: testModel.id,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Keep responses very concise.',
        },
        {
          role: 'user',
          content: 'What is 2+2? Answer in one short sentence.',
        },
      ],
      temperature: 0.3,
      maxTokens: 50,
    });

    const duration = Date.now() - startTime;

    if (isAIError(result)) {
      console.log(`❌ Completion failed: ${result.error}`);
      process.exit(1);
    }

    console.log('✅ Completion successful!');
    console.log(`\n📝 Response: "${result.content}"`);
    console.log(`⏱️  Time: ${duration}ms`);

    if (result.usage) {
      console.log(
        `📊 Tokens: ${result.usage.totalTokens} (${result.usage.promptTokens} + ${result.usage.completionTokens})`
      );
    }

    console.log('\n🎉 Integration test passed!\n');
    console.log('Your AI system is fully configured and working.');
    console.log(`Using: ${provider.name} with ${models.length} available models.\n`);
  } catch (error) {
    console.log('\n❌ Integration test failed:');
    console.log(`   ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}

testIntegration();
