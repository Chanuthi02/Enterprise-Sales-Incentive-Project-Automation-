const fs = require('fs');
const path = require('path');

const possiblePaths = [
    path.join(__dirname, 'approveSolutionTeamSales.spec.js'),
    path.join(__dirname, 'tests', 'specs', 'approveSolutionTeamSales.spec.js')
];

let filePath = possiblePaths.find(p => fs.existsSync(p));

if (!filePath) {
    console.error('File not found!');
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

console.log('--- BEFORE EXAMPLES ---');
const tryCatchMatch = content.match(/try\s*{[\s\S]*?}\s*catch\s*\(.*?\)\s*{\s*expect\(true\)\.toBe\(true\);\s*}/g);
if (tryCatchMatch) console.log('Found try-catch with expect(true):', tryCatchMatch[0]);

const expectTrueMatch = content.match(/expect\(.*?\s*\|\|\s*true\)/g);
if (expectTrueMatch) console.log('Found expect(|| true):', expectTrueMatch[0]);

// 2. Remove try-catch blocks with masking expect patterns
content = content.replace(/try\s*{([\s\S]*?)}\s*catch\s*\(.*?\)\s*{\s*expect\(true\)\.toBe\(true\);\s*}/g, '$1');

// 3. Replace expect(value || true) with expect(value)
content = content.replace(/expect\((.*?)\s*\|\|\s*true\)/g, 'expect($1)');

// 4. Fix conditional branches where else/catch paths have only expect(true)
content = content.replace(/else\s*{\s*expect\(true\)\.toBe\(true\);\s*}/g, '');

// 5. Remove commented-out expect statements from first pass
content = content.replace(/\/\/s*expect\(.*?\)\.toBe\(.*?\);/g, '');

console.log('\n--- AFTER EXAMPLES ---');
const postTryCatch = content.match(/try\s*{[\s\S]*?}\s*catch/g);
console.log('Remaining try-catch count:', postTryCatch ? postTryCatch.length : 0);

fs.writeFileSync(filePath, content);
console.log('Fixed file saved at: ' + filePath);
