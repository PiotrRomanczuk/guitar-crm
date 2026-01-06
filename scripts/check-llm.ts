#!/usr/bin/env tsx
/**
 * Quick Local LLM Check
 * 
 * Fast verification that Ollama is working.
 * Usage: npm run check:llm
 */

async function quickCheck() {
  console.log('\n🔍 Checking Ollama...\n');
  
  try {
    // Check connection
    const response = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(2000),
    });
    
    if (!response.ok) {
      console.log('❌ Ollama is not responding');
      process.exit(1);
    }
    
    const data = await response.json();
    const models = data.models || [];
    
    console.log('✅ Ollama is running');
    console.log(`📦 Models installed: ${models.length}`);
    
    if (models.length === 0) {
      console.log('\n⚠️  No models found. Install one:');
      console.log('   ollama pull llama3.2');
      process.exit(1);
    }
    
    models.forEach((model: any, index: number) => {
      const size = (model.size / 1024 / 1024 / 1024).toFixed(1);
      console.log(`   ${index + 1}. ${model.name} (${size} GB)`);
    });
    
    console.log('\n✅ Local LLM is ready!');
    console.log('\nTo use in your app:');
    console.log('  AI_PROVIDER=auto');
    console.log('  AI_PREFER_LOCAL=true\n');
    
  } catch (error) {
    console.log('❌ Cannot connect to Ollama');
    console.log('\nMake sure Ollama is running:');
    console.log('   ollama serve\n');
    process.exit(1);
  }
}

quickCheck();
