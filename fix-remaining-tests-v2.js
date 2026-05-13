const fs = require('fs');
const path = require('path');

const specFile = path.join(__dirname, 'tests/specs/approveSolutionTeamSales.spec.js');

let content = fs.readFileSync(specFile, 'utf8');
let fixes = 0;

// Pattern 1: Remove try-catch blocks that only have logging and commented expect
// Looking for: try { ... } catch (error) { console.log(...); // FIXED: Removed always-passing assertion\n        // expect(...).toBeTruthy();\n      }
const pattern1 = /try \{([^}]+)\} catch \(error\) \{\s*console\.log\(`⚠️  Test error: \${error\.message}`\);\s*\/\/ FIXED:.*?\n\s*\/\/ expect\(true\)\.toBeTruthy\(\);\s*\}/gs;

let matches = 0;
content = content.replace(pattern1, (match) => {
  matches++;
  // Extract the try block content
  const tryContent = match.match(/try \{([\s\S]+?)\} catch/)[1];
  return tryContent;
});
fixes += matches;
console.log(`✅ Removed ${matches} try-catch blocks with only logging`);

// Pattern 2: Fix tests with incomplete else/catch paths
// Tests where success is checked but no else assertion
const pattern2 = /if \(([^)]+)\) \{\s*expect\(([^)]+)\)\.toBeTruthy\(\);?\s*\} else \{\s*\/\/ FIXED:.*?\/\/ expect\(true\)\.toBeTruthy\(\);\s*\}/gs;

matches = 0;
content = content.replace(pattern2, (match) => {
  const condition = match.match(/if \(([^)]+)\)/)[1];
  // Add a real assertion for the else case
  return `if (${condition}) {
        expect(${condition}).toBeTruthy();
      } else {
        expect(false).toBeTruthy(); // Assertion: condition should be true
      }`;
});
fixes += matches;
console.log(`✅ Fixed ${matches} incomplete conditional branches`);

// Pattern 3: Remove comments about removed assertions that are orphaned
const pattern3 = /\s*\/\/ FIXED: Removed always-passing assertion\s*\/\/ expect\(true\)\.toBeTruthy\(\);\s*\n/g;
matches = 0;
content = content.replace(pattern3, '\n');
matches = (content.match(pattern3) || []).length;
console.log(`✅ Cleaned up ${content.split('// FIXED:').length - 1} orphaned fix comments`);

// Pattern 4: Remove isolated "// expect(true).toBeTruthy();" comments
const pattern4 = /\s*\/\/ expect\(true\)\.toBeTruthy\(\);?\s*\n/g;
matches = 0;
const before = (content.match(pattern4) || []).length;
content = content.replace(pattern4, '\n');
const after = (content.match(pattern4) || []).length;
console.log(`✅ Removed ${before - after} orphaned expect comments`);

// Pattern 5: Fix tests where catch block has no assertion
// catch blocks that only log and need an assertion
const pattern5 = /catch \(error\) \{\s*console\.log\(`⚠️  Test error: \${error\.message}`\);\s*\}/g;
matches = 0;
content = content.replace(pattern5, (match) => {
  matches++;
  return `catch (error) {
        console.log(\`⚠️  Test error: \${error.message}\`);
        expect.soft(false).toBeTruthy(); // Soft assertion: error was thrown
      }`;
});
fixes += matches;
console.log(`✅ Added soft assertions to ${matches} catch blocks`);

// Pattern 6: Fix malformed tests with empty else blocks
const pattern6 = /\} else \{\s*\/\/ FIXED:[^\n]*\n\s*\/\/ expect\(true\)\.toBeTruthy\(\);\s*\}/g;
matches = 0;
content = content.replace(pattern6, (match) => {
  matches++;
  return `} else {
        expect.soft(false).toBeTruthy(); // Assertion: condition should have been true
      }`;
});
fixes += matches;
console.log(`✅ Fixed ${matches} tests with empty else blocks`);

// Pattern 7: Clean up extra newlines that accumulated
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync(specFile, content, 'utf8');
console.log(`\n✅ ALL FIXES COMPLETE! Total structural changes: ${fixes}`);
console.log(`📝 File saved: ${specFile}`);

// Verification
const finalContent = fs.readFileSync(specFile, 'utf8');
const orphanedComments = (finalContent.match(/\/\/ expect\(true\)\.toBeTruthy\(\)/g) || []).length;
const remainingFixComments = (finalContent.match(/\/\/ FIXED:/g) || []).length;

console.log(`\n📊 Verification:`);
console.log(`  Orphaned expect comments remaining: ${orphanedComments}`);
console.log(`  FIXED: comments remaining: ${remainingFixComments}`);
console.log(`  expect(true).toBeTruthy(): ${(finalContent.match(/expect\(true\)\.toBeTruthy/g) || []).length}`);
