/* eslint-disable no-not-accumulator-reassign/no-not-accumulator-reassign */
/* eslint-disable no-param-reassign */
import fs from 'fs';
import path from 'path';

// Utility: Recursively get all .ts files in a directory, skipping common.ts and common/index.ts
function getAllTSFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir, {withFileTypes: true});
    for (const file of list) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
            results = results.concat(getAllTSFiles(filePath));
        } else if (
            file.name.endsWith('.ts') &&
            !file.name.endsWith('.d.ts') &&
            file.name !== 'common.ts' &&
            !(file.name === 'index.ts' && path.basename(path.dirname(filePath)) === 'common')
        ) {
            results.push(filePath);
        }
    }
    return results;
}

// Utility: Ensure directory exists
function ensureDir(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
}

// Utility: Recursively remove all files and folders in a directory
function clearDir(dir: string) {
    if (!fs.existsSync(dir)) {
        return;
    }
    for (const entry of fs.readdirSync(dir)) {
        const entryPath = path.join(dir, entry);
        if (fs.lstatSync(entryPath).isDirectory()) {
            clearDir(entryPath);
            fs.rmdirSync(entryPath);
        } else {
            fs.unlinkSync(entryPath);
        }
    }
}

// Universal alias replacer: #name/* => relative path to sharedTypes/name/*
function replaceAliases(content: string, destFile: string): string {
    // from '#name/...'
    content = content.replace(
        /from ['"]#([a-zA-Z0-9_-]+)\/(.*?)['"]/g,
        (_m: string, alias: string, p1: string) => {
            let rel = path
                .relative(
                    path.dirname(destFile),
                    path.join(
                        path.dirname(destFile).split('sharedTypes')[0] + `sharedTypes/${alias}`,
                        p1,
                    ),
                )
                .replace(/\\/g, '/');
            rel = rel.replace(/\/src\//g, '/'); // remove /src/ from path
            return `from './${rel.startsWith('.') ? rel : './' + rel}'`;
        },
    );
    // dynamic import('#name/...')
    content = content.replace(
        /import\(['"]#([a-zA-Z0-9_-]+)\/(.*?)['"]\)/g,
        (_m: string, alias: string, p1: string) => {
            let rel = path
                .relative(
                    path.dirname(destFile),
                    path.join(
                        path.dirname(destFile).split('sharedTypes')[0] + `sharedTypes/${alias}`,
                        p1,
                    ),
                )
                .replace(/\\/g, '/');
            rel = rel.replace(/\/src\//g, '/'); // remove /src/ from path
            return `import('./${rel.startsWith('.') ? rel : './' + rel}')`;
        },
    );
    return content;
}

// Copy file, just replacing aliases
function processAndCopyFile(srcFile: string, destFile: string) {
    let content = fs.readFileSync(srcFile, 'utf8');
    // Заменить алиасы на относительные пути
    content = replaceAliases(content, destFile);
    ensureDir(destFile);
    fs.writeFileSync(destFile, content);
}

// Копировать все .ts-файлы из srcDir в destDir, обрабатывая схемы
function copyDirWithProcessing(srcDir: string, destDir: string) {
    const files = getAllTSFiles(srcDir);
    for (const srcFile of files) {
        const relPath = path.relative(srcDir, srcFile);
        const destFile = path.join(destDir, relPath);
        processAndCopyFile(srcFile, destFile);
    }
}

// MAIN COPY LOGIC
const sharedTypesDir = path.resolve(__dirname, 'sharedTypes');
const srcTypesDir = path.resolve(__dirname, 'src/types');
const srcSchemasDir = path.resolve(__dirname, 'src/types/schemas');
const destTypesDir = path.join(sharedTypesDir, 'types');
const destSchemasDir = path.join(sharedTypesDir, 'schemas');

clearDir(sharedTypesDir);

copyDirWithProcessing(srcTypesDir, destTypesDir);
copyDirWithProcessing(srcSchemasDir, destSchemasDir);

function generateIndex(sharedTypesDirLocal: string) {
    // Получаем версию zod из package.json
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));
    const zodVersion =
        (pkg.dependencies && pkg.dependencies.zod) ||
        (pkg.devDependencies && pkg.devDependencies.zod) ||
        'unknown';
    const content = `// Auto-generated. Do not edit\n// zod version: ${zodVersion}\nexport * from './types';\n`;
    fs.writeFileSync(path.join(sharedTypesDirLocal, 'index.ts'), content);
}

generateIndex(sharedTypesDir);

console.log('✅ sharedTypes успешно сгенерированы!');
