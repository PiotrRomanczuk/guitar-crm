#!/usr/bin/env node

// Simple script to generate bcrypt password hashes for test users
// Run: node scripts/generate-password-hashes.js

const { execSync } = require('child_process');

const passwords = [
  { label: 'Admin', password: 'test123_admin' },
  { label: 'Teacher', password: 'test123_teacher' },
  { label: 'Student', password: 'test123_student' },
];

console.log('\nGenerating bcrypt hashes for test passwords...\n');

// Use htpasswd from apache2-utils if available, or use Docker with Supabase's GoTrue
try {
  passwords.forEach(({ label, password }) => {
    try {
      // Try using htpasswd
      const hash = execSync(`htpasswd -bnBC 10 "" ${password} | tr -d ':\n'`, {
        encoding: 'utf8',
      }).trim();
      console.log(`${label} (${password}):\n${hash}\n`);
    } catch (err) {
      console.log(`Could not generate hash for ${label}: htpasswd not available`);
    }
  });
} catch (error) {
  console.error('Error generating hashes:', error.message);
  console.log('\nAlternatively, you can use an online bcrypt generator:');
  console.log('https://bcrypt-generator.com/');
  console.log('\nPasswords to hash:');
  passwords.forEach(({ label, password }) => {
    console.log(`- ${label}: ${password}`);
  });
}
