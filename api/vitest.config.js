import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.test.js'], // Ensures test files are located correctly
        exclude: ['node_modules', 'dist', 'coverage'],
        coverage: {
            provider: 'istanbul', // Use Istanbul for coverage
            reporter: ['text', 'json', 'html'], // Generate coverage reports
            reportsDirectory: './coverage', // Store reports in coverage folder
            all: true, // Ensure all files are instrumented
            include: ['src/**/*.js'], // Include all source files
            exclude: [
                'src/**/*.test.js', // Exclude test files from coverage reports
                'test/', 
                'dist/', 
                'node_modules/',
                'src/**/index.js' // Optional: Exclude entry points if needed
            ]
        },
    },
});
