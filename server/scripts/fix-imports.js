const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '../test/unit'); // Adjust path as script is in scripts/
const e2eDir = path.join(__dirname, '../test/e2e');
const srcDir = path.join(__dirname, '../src');

function getAllFiles(dirPath, arrayOfFiles) {
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
        // Calculate the hypothetical source file location
        // File: .../server/test/unit/path/to/file.spec.ts
        // Original: .../server/src/path/to/file.spec.ts
        
        let srcFileDir;
        if (file.includes(path.join('test', 'unit'))) {
            srcFileDir = path.dirname(file).replace(path.join('test', 'unit'), 'src');
        } else {
            return match;
        }

        // absolute path of the imported module assuming it is in src
        const absoluteTarget = path.resolve(srcFileDir, importPath);
        
        // Check if it is within src
        const relToSrc = path.relative(srcDir, absoluteTarget);
        
        if (!relToSrc.startsWith('..')) {
            // It is inside src
            return `from '@/${relToSrc.replace(/\\/g, '/')}'`;
        }
        
        return match;
    });

    fs.writeFileSync(file, content);
}

// Fix unit tests
if (fs.existsSync(testDir)) {
    const unitFiles = getAllFiles(testDir).filter(f => f.endsWith('.spec.ts'));
    unitFiles.forEach(fixImports);
}

// Fix e2e
if (fs.existsSync(e2eDir)) {
    const e2eFiles = getAllFiles(e2eDir).filter(f => f.endsWith('.ts'));
    e2eFiles.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        // E2E is easier, just look for ../src
        content = content.replace(/from ['"]\.\.\/src\/(.+)['"]/g, "from '@/$1'");
         // Also handle ./../src/
        content = content.replace(/from ['"]\.\/\.\.\/src\/(.+)['"]/g, "from '@/$1'");
        fs.writeFileSync(file, content);
    });
}

console.log('Fixed imports');
