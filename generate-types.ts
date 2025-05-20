import fs from 'fs';
import path from 'path';

import ts from 'typescript';

// Configure TypeScript compiler options
const compilerOptions: ts.CompilerOptions = {
    declaration: true,
    emitDeclarationOnly: true,
    outDir: 'sharedTypes',
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    paths: {
        '#src/*': ['./src/*'],
        '#schemas/*': ['./schemas/*'],
    },
    baseUrl: '.',
};

const exportFiles = ['src/types/index.ts', 'src/schemas/index.ts'];

// Path of source file that contains Zod schemas
const paths = exportFiles.map((file) => path.resolve(__dirname, file));

// Create a program with the input files
const program = ts.createProgram(paths, compilerOptions);

// Custom transformer to resolve path aliases
const pathAliasTransformer = (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile: ts.SourceFile): ts.SourceFile => {
        // Function to visit each node and transform imports
        const visitor = (node: ts.Node): ts.Node => {
            // Check if node is an import declaration
            if (
                ts.isImportDeclaration(node) &&
                node.moduleSpecifier &&
                ts.isStringLiteral(node.moduleSpecifier)
            ) {
                const importPath = node.moduleSpecifier.text;

                // Check if the import uses a path alias
                if (importPath.startsWith('#src/')) {
                    // Convert #src/ to relative path without src/
                    const relativePath = importPath.replace('#src/', '../');
                    return ts.factory.updateImportDeclaration(
                        node,
                        node.modifiers,
                        node.importClause,
                        ts.factory.createStringLiteral(relativePath),
                        undefined,
                    );
                }

                // Check if the import uses #schemas alias
                if (importPath.startsWith('#schemas/')) {
                    // Convert #schemas/ to relative path
                    const relativePath = importPath.replace('#schemas/', '../schemas/');
                    return ts.factory.updateImportDeclaration(
                        node,
                        node.modifiers,
                        node.importClause,
                        ts.factory.createStringLiteral(relativePath),
                        undefined,
                    );
                }
            }
            return ts.visitEachChild(node, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
};

// Emit only .d.ts files with path alias transformer
const customTransformers: ts.CustomTransformers = {
    before: [pathAliasTransformer],
};

const emitResult = program.emit(undefined, undefined, undefined, true, customTransformers);

if (emitResult.emitSkipped) {
    console.error('Error generating types:');
    emitResult.diagnostics.forEach((diagnostic) => {
        if (diagnostic.file) {
            const {line, character} = ts.getLineAndCharacterOfPosition(
                diagnostic.file,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                diagnostic.start!,
            );
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
        } else {
            console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
        }
    });
    process.exit(1);
} else {
    // Create sharedTypes directory if it doesn't exist
    const sharedTypesDir = path.resolve(__dirname, 'sharedTypes');
    if (!fs.existsSync(sharedTypesDir)) {
        fs.mkdirSync(sharedTypesDir, {recursive: true});
    }

    // Process generated .d.ts files to fix any remaining path aliases
    const processGeneratedFiles = (dir: string) => {
        const files = fs.readdirSync(dir, {withFileTypes: true});

        for (const file of files) {
            const filePath = path.join(dir, file.name);

            if (file.isDirectory()) {
                processGeneratedFiles(filePath);
            } else if (file.name.endsWith('.d.ts')) {
                let content = fs.readFileSync(filePath, 'utf8');

                // Replace any remaining path aliases in the generated .d.ts files
                // Remove src/ from the path
                content = content.replace(/from\s+['"]#src\/(.*?)['"]/g, 'from "../$1"');

                // Replace #schemas paths with ../schemas/
                content = content.replace(
                    /from\s+['"]#schemas\/(.*?)['"]/g,
                    'from "../schemas/$1"',
                );

                // Also fix any direct references to src/
                content = content.replace(/from\s+['"]\.\.\/src\/(.*?)['"]/g, 'from "../$1"');

                // Remove 'declare' keyword from enum declarations
                content = content.replace(/export\s+declare\s+enum/g, 'export enum');

                // Fix paths for imports from '../types/enums' in schema files
                if (filePath.includes('/schemas/')) {
                    content = content.replace(
                        /from\s+['"]\.\.\/\.\.\/types\/enums['"]/g,
                        'from "../types/enums"',
                    );
                }

                // // Remove server-specific imports
                // content = content.replace(/import\s+.*?\s+from\s+['"]objection['"];\s*\n?/g, '');
                // content = content.replace(/import\s+.*?\s+from\s+['"]express['"];\s*\n?/g, '');
                // content = content.replace(/import\s+.*?\s+from\s+['"]knex['"];\s*\n?/g, '');

                // // Remove function declarations - including everything until semicolon
                // content = content.replace(/export\s+declare\s+function\s+[^;]*;/g, '');

                // // Remove export declare const - including everything until semicolon
                // content = content.replace(/export\s+declare\s+const\s+[^;]*;/g, '');

                // Clean up multiple newlines that might be created by our replacements
                content = content.replace(/\n{3,}/g, '\n\n');

                // Add eslint-disable comment for any type if it contains 'any'
                if (
                    content.includes(': any') ||
                    content.includes('<any>') ||
                    content.includes(': Array<any>') ||
                    content.includes(': Record<string, any>')
                ) {
                    content = `/* eslint-disable @typescript-eslint/no-explicit-any */\n${content}`;
                }

                // Write the processed content to a .ts file instead of .d.ts
                const tsFilePath = filePath.replace('.d.ts', '.ts');
                fs.writeFileSync(tsFilePath, content);
                // Remove the original .d.ts file
                fs.unlinkSync(filePath);
            }
        }
    };

    processGeneratedFiles(sharedTypesDir);

    // Generate index.ts file instead of index.d.ts
    const generateIndexFile = () => {
        const exports = exportFiles
            .map((file) => {
                const parsedPath = path.parse(file);
                // Remove src/ from the path
                const relativePath = `./${parsedPath.dir.replace('src/', '')}/${parsedPath.name}`;
                return `export * from '${relativePath}';`;
            })
            .join('\n');

        const indexContent = `// Auto-generated from source files - DO NOT EDIT
/* eslint-disable @typescript-eslint/no-explicit-any */
${exports}
`;

        fs.writeFileSync(path.join(sharedTypesDir, 'index.ts'), indexContent);
    };

    generateIndexFile();

    console.log('✅ Types successfully generated in sharedTypes/ directory as .ts files');
}
