// Script to fix problematic test patterns
const fs = require('fs');
const path = require('path');

const testFile = path.join(__dirname, 'tests/specs/approveSolutionTeamSales.spec.js');
let content = fs.readFileSync(testFile, 'utf-8');
let changeCount = 0;

console.log('🔧 Fixing problematic test patterns...\n');

// 1. Replace patterns with "expect(true).toBeTruthy()" 
const pattern1 = /(\s+)expect\(true\)\.toBeTruthy\(\);/g;
const matches1 = content.match(pattern1);
if (matches1) {
  console.log(`Found ${matches1.length} instances of "expect(true).toBeTruthy()"`);
  // Comment them out instead of removing
  content = content.replace(pattern1, '$1// FIXED: Removed always-passing assertion\n$1// expect(true).toBeTruthy();');
  changeCount += matches1.length;
}

// 2. Replace patterns with "expect(... || true).toBeTruthy()"
const pattern2 = /expect\((.+?)\s*\|\|\s*true\)\.toBeTruthy\(\)/g;
const matches2 = content.match(pattern2);
if (matches2) {
  console.log(`Found ${matches2.length} instances of "expect(... || true).toBeTruthy()"`);
  content = content.replace(pattern2, 'expect($1).toBeTruthy() // FIXED: Removed OR true masking');
  changeCount += matches2.length;
}

// 3. Fix specific try-catch patterns that catch and expect(true)
const tryPattern = /try\s*\{\s*([^}]+?)\s*\}\s*catch\s*\(\s*error\s*\)\s*\{\s*console\.log\(`⚠️\s+Test error:[^`]+`\);\s*expect\(true\)\.toBeTruthy\(\);\s*\}/g;
const tryMatches = content.match(tryPattern);
if (tryMatches) {
  console.log(`Found ${tryMatches.length} try-catch blocks with masking expect(true)`);
  content = content.replace(tryPattern, '$1');
  changeCount += tryMatches.length;
}

// 4. Fix patterns where assertions are followed by expect(true) in else blocks
const elsePattern = /else\s*\{\s*expect\(true\)\.toBeTruthy\(\);\s*\}/g;
const elseMatches = content.match(elsePattern);
if (elseMatches) {
  console.log(`Found ${elseMatches.length} else blocks with expect(true)`);
  content = content.replace(elsePattern, '// No assertion needed for fallback case');
  changeCount += elseMatches.length;
}

// Write the fixed content
fs.writeFileSync(testFile, content, 'utf-8');

console.log(`\n✅ Fixed ${changeCount} problematic patterns`);
console.log(`📝 Updated: ${testFile}`);
console.log('\n⚠️  Note: Manual review recommended for specific test logic adjustments');
