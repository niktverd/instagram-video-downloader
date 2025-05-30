const {createDefaultPreset} = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
    testEnvironment: 'node',
    transform: {
        ...tsJestTransformCfg,
    },
    moduleNameMapper: {
        '^#src/(.*)$': '<rootDir>/src/$1',
        '^#utils$': '<rootDir>/src/utils/index.ts',
        '^#schemas/(.*)$': '<rootDir>/src/schemas/$1',
        '^#types/(.*)$': '<rootDir>/src/types/$1',
        '^#config/(.*)$': '<rootDir>/src/config/$1',
        '^#config$': '<rootDir>/src/config/index.ts',
        '^#logic$': '<rootDir>/src/logic/index.ts',
        '^#tests/(.*)$': '<rootDir>/src/tests/$1',
        '^\\$(.*)$': '<rootDir>/src/sections/$1',
        '^#types$': '<rootDir>/src/types/index.ts',
    },
};
