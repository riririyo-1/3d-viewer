const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '../test/unit');
const srcDir = path.join(__dirname, '../src');

function getAllFiles(dirPath, arrayOfFiles) {
  if (!fs.existsSync(dirPath)) return [];
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file))
    }
  })

  return arrayOfFiles
}

function fixImports(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace relative imports starting with ./ or ../
    content = content.replace(/from ['"](\.?\.\/[^'"]+)['"]/g, (match, importPath) => {
        // Calculate the source file location
        let srcFileDir;
        if (file.includes(path.join('test', 'unit'))) {
            srcFileDir = path.dirname(file).replace(path.join('test', 'unit'), 'src');
        } else {
            return match;
        }

        const absoluteTarget = path.resolve(srcFileDir, importPath);
        const relToSrc = path.relative(srcDir, absoluteTarget);
        
        if (!relToSrc.startsWith('..')) {
             return `from '@/${relToSrc.replace(/\\/g, '/')}'`;
        }
        
        return match;
    });

    fs.writeFileSync(file, content);
}

if (fs.existsSync(testDir)) {
    const files = getAllFiles(testDir).filter(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
    files.forEach(fixImports);
}

console.log('Fixed frontend imports');
