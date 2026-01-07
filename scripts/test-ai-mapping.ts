#!/usr/bin/env npx tsx

/**
 * Test AI model mapping with Ollama
 */

import { generateAIResponse } from '@/app/actions/ai';

console.log('🤖 Testing AI Model Mapping');
console.log('==============================');

async function testAIMapping() {
  try {
    console.log('Testing basic AI response...');

    const response = await generateAIResponse(
      'Clean and normalize this song data: title="wonderwal", artist="oasiss"'
    );

    if (response.error) {
      console.log('❌ Error:', response.error);
    } else {
      console.log('✅ Success!');
      console.log('Response:', response.content?.slice(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testAIMapping();
