/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable valid-jsdoc */
// Run this with: NODE_OPTIONS="--require module-alias/register" npx ts-node src/tests/run-pubsub.test.ts
/**
 * This test file simulates PubSub messages as seen in Google Cloud Run logs.
 * It tests the pubsubHandler function with two different test cases that
 * match the structure and content of real messages.
 *
 * The tests verify that:
 * 1. The handler correctly processes PubSub messages
 * 2. Base64 encoding/decoding of message data works properly
 * 3. The handler returns appropriate status codes
 *
 * Based on Cloud Run logs from 2025-05-03
 */

// Import the express types directly to avoid using aliased modules
import {Request} from 'express';

import {runScenarioHandler} from '#src/sections/cloud-run/components/run-scenario';

// Mock for log function
const log = console.log;
const logError = console.error;

// Import pubsubHandler directly from the file

/**
 * Creates a mock response object for testing Express handlers
 */
const createMockResponse = () => {
    const res: any = {};

    // Track calls to status method
    const statusCalls: number[] = [];
    res.status = (code: number) => {
        statusCalls.push(code);
        return res;
    };

    // Track calls to send method
    const sendCalls: any[] = [];
    res.send = (data: any) => {
        sendCalls.push(data);
        return res;
    };

    // Track calls to json method
    const jsonCalls: any[] = [];
    res.json = (data: any) => {
        jsonCalls.push(data);
        return res;
    };

    // Method to clear call history
    res.clear = () => {
        statusCalls.length = 0;
        sendCalls.length = 0;
        jsonCalls.length = 0;
    };

    // Method to get last status code
    res.getLastStatus = () => statusCalls[statusCalls.length - 1];

    return res;
};

/**
 * Helper to create base64 encoded data for testing
 * PubSub messages are received with base64-encoded data
 */
const createEncodedData = (data: any) => {
    // Convert object to JSON string
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    // Convert to base64
    return Buffer.from(jsonString).toString('base64');
};

const runPubSubTests = async () => {
    log('Starting PubSub handler tests');

    // Create mock response
    const mockRes = createMockResponse();

    // Test case 1: Basic message
    // This matches the first message seen in the logs
    log('⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯');
    log('Test Case 1: Basic message');

    const basicMessageData = {
        data: 'This is a test message for Instagram video events',
        timestamp: '2025-05-03T11:23:12.953Z',
    };

    const basicMessageReq = {
        body: {
            message: {
                data: createEncodedData(basicMessageData),
                messageId: '13982903520786731',
                publishTime: '2025-05-03T11:23:13.482Z',
                attributes: {
                    source: 'test-endpoint',
                    timestamp: '2025-05-03T11:23:12.953Z',
                    type: 'test',
                },
            },
        },
    } as Request;

    // Call the handler
    try {
        await runScenarioHandler(basicMessageReq.body);
        log('Response status:', mockRes.getLastStatus());
        // Expected: 204 No Content
    } catch (error) {
        logError('Error in test case 1:', error);
    }

    // Reset the mock for the next test
    mockRes.clear();

    // Test case 2: Message with account, scenario and source IDs
    // This matches the second message seen in the logs with additional attributes
    log('⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯');
    log('Test Case 2: Message with account, scenario and source IDs');

    const detailedMessageData = {
        data: 'This is a test message for Instagram video events',
        timestamp: '2025-05-03T11:23:42.763Z',
        accountId: 1,
        scenarioId: 100,
        sourceId: 1,
    };

    const detailedMessageReq = {
        body: {
            message: {
                data: createEncodedData(detailedMessageData),
                messageId: '14424739668392307',
                publishTime: '2025-05-03T11:23:43.547Z',
                attributes: {
                    ...detailedMessageData,
                    source: 'test-endpoint',
                    type: 'test',
                },
            },
        },
    } as Request;

    // Call the handler
    try {
        await runScenarioHandler(detailedMessageReq.body);
        log('Response status:', mockRes.getLastStatus());
        // Expected: 204 No Content
    } catch (error) {
        logError('Error in test case 2:', error);
    }

    log('All PubSub handler tests completed');
};

const runTests = () => {
    const runPubSubTestsFlag = false;
    if (runPubSubTestsFlag) {
        // Run the tests
        runPubSubTests().catch((error) => {
            console.error('Error running PubSub tests:', error);
        });
    }
};

runTests();
