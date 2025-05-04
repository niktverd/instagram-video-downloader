import path from 'path';

import moduleAlias from 'module-alias';

// Register alias paths for source folder instead of dist folder
moduleAlias.addAliases({
    '#config': path.join(__dirname, '../config'),
    '#logic': path.join(__dirname, '../logic/index.ts'),
    '#tests': path.join(__dirname, '../tests'),
    '#types': path.join(__dirname, '../types/index.ts'),
    '#utils': path.join(__dirname, '../utils/index.ts'),
    '#schemas': path.join(__dirname, '../schemas'),
    '#src': path.join(__dirname, '..'),
    $: path.join(__dirname, '../sections'),
});
