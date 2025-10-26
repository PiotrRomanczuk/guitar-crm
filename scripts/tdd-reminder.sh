#!/bin/bash

# TDD Reminder Script
# This script displays TDD guidelines when starting development

echo "🧪 ========================="
echo "   TDD DEVELOPMENT REMINDER"
echo "=========================="
echo ""
echo "Before you start coding:"
echo ""
echo "✅ 1. Write a failing test first (RED)"
echo "✅ 2. Write minimal code to pass (GREEN)" 
echo "✅ 3. Refactor while tests stay green (REFACTOR)"
echo ""
echo "Commands:"
echo "• npm test           - Run all tests"
echo "• npm test -- --watch - Watch mode"
echo ""
echo "Test file locations:"
echo "• Components: __tests__/components/"
echo "• Schemas:    __tests__/schemas/"
echo "• Utils:      __tests__/utils/"
echo ""
echo "📖 Full guide: docs/TDD_GUIDE.md"
echo ""
echo "Remember: Tests first, then code! 🎯"
echo "=========================="