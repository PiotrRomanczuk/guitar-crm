#!/usr/bin/env tsx
/**
 * Local LLM Test Script
 * 
 * This script tests the Ollama local LLM setup by:
 * 1. Checking if Ollama is running
 * 2. Listing available models
 * 3. Testing a simple completion request
 * 4. Verifying the AI provider abstraction layer
 * 
 * Usage:
 *   npx tsx scripts/test-local-llm.ts
 *   or
 *   npm run test:llm
 */

import { OllamaProvider } from '../lib/ai/providers/ollama';
import { OpenRouterProvider } from '../lib/ai/providers/openrouter';
import { AIProviderFactory } from '../lib/ai/provider-factory';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function success(message: string) {
  log(`✅ ${message}`, COLORS.green);
}

function error(message: string) {
  log(`❌ ${message}`, COLORS.red);
}

function info(message: string) {
  log(`ℹ️  ${message}`, COLORS.blue);
}

function section(title: string) {
  log(`\n${'='.repeat(60)}`, COLORS.cyan);
  log(`  ${title}`, COLORS.bright + COLORS.cyan);
  log(`${'='.repeat(60)}`, COLORS.cyan);
}

async function testOllamaConnection() {
  section('Testing Ollama Connection');
  
  const ollama = new OllamaProvider();
  
  try {
    const available = await ollama.isAvailable();
    
    if (available) {
      success('Ollama is running and available');
      const config = ollama.getConfig();
      info(`Endpoint: ${config.baseUrl}`);
      return true;
    } else {
      error('Ollama is not available');
      info('Make sure Ollama is running: ollama serve');
      return false;
    }
  } catch (err) {
    error(`Failed to connect to Ollama: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function testListModels() {
  section('Listing Available Models');
  
  const ollama = new OllamaProvider();
  
  try {
    const models = await ollama.listModels();
    
    if (models.length === 0) {
      error('No models found');
      info('Pull a model first: ollama pull llama3.2');
      return false;
    }
    
    success(`Found ${models.length} model(s):`);
    models.forEach((model, index) => {
      log(`\n${index + 1}. ${model.name}`, COLORS.bright);
      log(`   Provider: ${model.provider}`);
      log(`   Context: ${model.contextWindow.toLocaleString()} tokens`);
      log(`   Free: ${model.isFree ? 'Yes' : 'No'}`);
      log(`   Local: ${model.isLocal ? 'Yes' : 'No'}`);
    });
    
    return true;
  } catch (err) {
    error(`Failed to list models: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function testCompletion() {
  section('Testing Completion Request');
  
  const ollama = new OllamaProvider();
  
  try {
    const models = await ollama.listModels();
    
    if (models.length === 0) {
      error('No models available for testing');
      return false;
    }
    
    const testModel = models[0];
    info(`Using model: ${testModel.name}`);
    
    const startTime = Date.now();
    
    const result = await ollama.complete({
      model: testModel.id,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Keep responses concise.',
        },
        {
          role: 'user',
          content: 'What is 2+2? Answer in one sentence.',
        },
      ],
      temperature: 0.7,
    });
    
    const duration = Date.now() - startTime;
    
    if ('error' in result) {
      error(`Completion failed: ${result.error}`);
      return false;
    }
    
    success('Completion successful!');
    log(`\n📝 Response:`, COLORS.bright);
    log(`   ${result.content}`, COLORS.reset);
    log(`\n⏱️  Response time: ${duration}ms`, COLORS.yellow);
    
    if (result.usage) {
      log(`\n📊 Token usage:`, COLORS.bright);
      log(`   Prompt tokens: ${result.usage.promptTokens}`);
      log(`   Completion tokens: ${result.usage.completionTokens}`);
      log(`   Total tokens: ${result.usage.totalTokens}`);
    }
    
    return true;
  } catch (err) {
    error(`Completion test failed: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function testProviderFactory() {
  section('Testing Provider Factory (Auto Mode)');
  
  try {
    const factory = AIProviderFactory.getInstance();
    
    info('Checking available providers...');
    const providers = await factory.getAvailableProviders();
    
    providers.forEach(p => {
      if (p.available) {
        success(`${p.name}: Available`);
      } else {
        log(`${p.name}: Not available`, COLORS.yellow);
      }
    });
    
    log('\nGetting auto-selected provider...', COLORS.bright);
    const provider = await factory.getProvider();
    
    success(`Selected provider: ${provider.name}`);
    
    const available = await provider.isAvailable();
    if (available) {
      success('Provider is ready to use');
    } else {
      error('Provider is not available');
    }
    
    return true;
  } catch (err) {
    error(`Provider factory test failed: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function testOpenRouterFallback() {
  section('Testing OpenRouter Fallback');
  
  const openrouter = new OpenRouterProvider();
  const available = await openrouter.isAvailable();
  
  if (available) {
    success('OpenRouter is configured and available');
    info('API key is set');
  } else {
    log('OpenRouter is not configured (API key missing)', COLORS.yellow);
    info('This is OK if you only want to use local LLM');
    info('Set OPENROUTER_API_KEY in .env.local for cloud fallback');
  }
  
  return true;
}

async function runAllTests() {
  log('\n' + '🎸 Guitar CRM - Local LLM Test Suite 🎸'.padStart(50), COLORS.bright + COLORS.cyan);
  
  const results = {
    connection: false,
    models: false,
    completion: false,
    factory: false,
    fallback: false,
  };
  
  // Test 1: Connection
  results.connection = await testOllamaConnection();
  
  if (!results.connection) {
    error('\n❌ Ollama is not running. Please start it first:');
    info('   ollama serve');
    process.exit(1);
  }
  
  // Test 2: List models
  results.models = await testListModels();
  
  if (!results.models) {
    error('\n❌ No models found. Please install a model:');
    info('   ollama pull llama3.2');
    info('   ollama pull mistral');
    process.exit(1);
  }
  
  // Test 3: Completion
  results.completion = await testCompletion();
  
  // Test 4: Provider factory
  results.factory = await testProviderFactory();
  
  // Test 5: OpenRouter fallback
  results.fallback = await testOpenRouterFallback();
  
  // Summary
  section('Test Results Summary');
  
  const allPassed = Object.values(results).every(r => r);
  
  log('\nTest Results:', COLORS.bright);
  log(`  Ollama Connection: ${results.connection ? '✅ PASS' : '❌ FAIL'}`, 
      results.connection ? COLORS.green : COLORS.red);
  log(`  Model Listing: ${results.models ? '✅ PASS' : '❌ FAIL'}`, 
      results.models ? COLORS.green : COLORS.red);
  log(`  Completion Request: ${results.completion ? '✅ PASS' : '❌ FAIL'}`, 
      results.completion ? COLORS.green : COLORS.red);
  log(`  Provider Factory: ${results.factory ? '✅ PASS' : '❌ FAIL'}`, 
      results.factory ? COLORS.green : COLORS.red);
  log(`  OpenRouter Fallback: ${results.fallback ? '✅ PASS' : '❌ FAIL'}`, 
      results.fallback ? COLORS.green : COLORS.red);
  
  if (allPassed) {
    log('\n🎉 All tests passed! Local LLM is ready to use!', COLORS.bright + COLORS.green);
    log('\nNext steps:', COLORS.bright);
    info('1. Set AI_PROVIDER=auto in .env.local');
    info('2. Set AI_PREFER_LOCAL=true in .env.local');
    info('3. Start your dev server: npm run dev');
    info('4. Open admin dashboard and try the AI Assistant');
  } else {
    log('\n⚠️  Some tests failed. Please fix the issues above.', COLORS.yellow);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(err => {
  error(`\nFatal error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
