import {rmSync} from 'fs';

import {Request, Response} from 'express';

import {ScenarioType} from '#schemas/scenario';
import {ScenarioMap} from '#src/sections/cloud-run/components/scenarios/ScenarioMap';
import {
    PubSubAction,
    PubSubTopic,
    getWorkingDirectoryForVideo,
    log,
    logError,
    prepareCaption,
} from '#utils';
import {
    addPreparedVideo,
    getAccount,
    getScenario,
    getSource,
    hasPreparedVideoBeenCreated,
    uploadFileToServer,
} from '$/shared';

// eslint-disable-next-line valid-jsdoc
/**
 * Handler for Pub/Sub push messages
 * Processes messages sent from Pub/Sub to our webhook endpoint
 */
export const pubsubHandler = async (req: Request, res: Response) => {
    try {
        // Pub/Sub messages are received as base64-encoded strings
        if (!req.body || !req.body.message) {
            logError('Invalid Pub/Sub message format');
            res.status(400).send('Bad Request: Invalid Pub/Sub message format');
            return;
        }

        const pubsubMessage = req.body.message;

        // Get the base64-encoded data from the message
        const data = pubsubMessage.data ? Buffer.from(pubsubMessage.data, 'base64').toString() : '';
        const logLocal = log.bind(null, 'local', pubsubMessage.messageId);
        // Log details about the received message
        logLocal(`Received Pub/Sub message: ${data}`);
        logLocal(`Message ID: ${pubsubMessage.messageId}`);
        logLocal(`Publish time: ${pubsubMessage.publishTime}`);

        // Parse the message data if it's JSON
        try {
            // let parsedData: Record<string, string>;
            const {accountId, scenarioId, sourceId} = JSON.parse(data) as {
                accountId: string;
                scenarioId: string;
                sourceId: string;
            };
            logLocal('Parsed message data:', {accountId, scenarioId, sourceId});
            if (await hasPreparedVideoBeenCreated({accountId, scenarioId, sourceId})) {
                logLocal('Prepared video already exists');
                res.status(204).send();
                return;
            }

            const scenario = await getScenario(scenarioId);
            if (!scenario) {
                logLocal('Scenario not found', {scenarioId});
                res.status(404).send();
                return;
            }

            const account = await getAccount(accountId);
            if (!account) {
                logLocal('Account not found', {accountId});
                res.status(404).send();
                return;
            }

            const source = await getSource(sourceId);
            if (!source) {
                logLocal('Source not found', {sourceId});
                res.status(404).send();
                return;
            }

            logLocal({scenario, account, source});

            const isScenarioInAccount = account.availableScenarios.includes(scenario.slug);
            if (!isScenarioInAccount) {
                logLocal('Scenario not in account', {scenarioId, accountId});
                res.status(404).send();
                return;
            }

            const isScenarioEnabled = scenario.enabled;
            if (!isScenarioEnabled) {
                logLocal('Scenario is not enabled', {scenarioId, status: scenario.enabled});
                res.status(404).send();
                return;
            }

            const scenarioWorkflow = ScenarioMap[scenario.type as ScenarioType];
            if (!scenarioWorkflow) {
                logLocal('Scenario workflow not found', {
                    scenarioId,
                    scenarioType: scenario.type,
                    ScenarioMap,
                });
                res.status(500).send();
                return;
            }

            const {scenario: scenarioFunction, schema} = scenarioWorkflow;
            const {success, error} = schema.safeParse(scenario);
            if (!success) {
                logLocal('Scenario is not valid', {scenarioId, error});
                res.status(500).send();
                return;
            }

            if (!scenarioFunction) {
                logLocal('Scenario function not found', {scenarioId});
                res.status(404).send();
                return;
            }

            logLocal('Scenario function found', {scenarioId});

            const directoryName = `${accountId}-${scenarioId}-${sourceId}`;

            const basePath = getWorkingDirectoryForVideo(directoryName);
            logLocal('basePath', {basePath});
            const finalFilePath = await scenarioFunction({scenario, source, basePath});
            logLocal('finalFilePath', {finalFilePath});
            const scenarioSlug = scenario.slug;
            const originalHashtags = source.sources.instagramReel?.originalHashtags || [];

            // Upload data to server
            const downloadURL = await uploadFileToServer(
                finalFilePath,
                `${directoryName}-${scenarioSlug}.mp4`,
            );
            logLocal('downloadURL', {downloadURL});
            // update database
            await addPreparedVideo({
                firebaseUrl: downloadURL,
                scenarioSlug,
                scenarioId,
                sourceId,
                title: prepareCaption(scenario),
                originalHashtags,
                accounts: [account.id],
                accountsHasBeenUsed: [],
            });
            logLocal('video added to database');
            // delete tempfiles
            const deleteTempFiles = true;
            if (deleteTempFiles) {
                rmSync(basePath, {recursive: true});
                logLocal('temp files deleted');
            }
            // runCloudRunScenario(parsedData);
        } catch (error) {
            console.log('error', error);
            log('Message data is not valid JSON');
        }

        // runCloudRunScenario(parsedData);

        // Process the message based on attributes or content
        const messageAttributes = pubsubMessage.attributes || {};
        log('Message attributes:', messageAttributes);

        // Acknowledge the message by sending a success response
        // This tells Pub/Sub the message was processed successfully
        res.status(204).send();
    } catch (error) {
        logError('Error processing Pub/Sub message:', error);

        // Important: Return status code 200 to acknowledge the message
        // even on error to avoid Pub/Sub retrying. We handle retries ourselves
        // if needed based on the error type
        res.status(200).send('Error processing message');
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Simplified endpoint to push a test message to a Pub/Sub topic
 * Uses service account authentication via GOOGLE_APPLICATION_CREDENTIALS
 */
export const pushMessageToPubSub = async (req: Request, res: Response) => {
    try {
        // Always use the Instagram video events topic
        const topic = PubSubTopic.INSTAGRAM_VIDEO_EVENTS;
        log('[pubsub] Using topic:', topic);

        // Import the PubSub client utility
        const {publishMessageToPubSub} = await import('../../../utils/pubsub-client');

        // Get project ID from environment variable
        const pubsubProjectId = process.env.GCP_PROJECT_ID || '';

        log('[pubsub] Project ID:', pubsubProjectId);
        log('[pubsub] Using service account authentication');
        log(
            '[pubsub] GOOGLE_APPLICATION_CREDENTIALS:',
            process.env.GOOGLE_APPLICATION_CREDENTIALS || 'not set',
        );

        if (!pubsubProjectId) {
            log('[pubsub] Error: Missing project ID');
            res.status(400).json({
                error: 'Project ID not found in environment variables',
            });

            return;
        }

        // Extract optional parameters from the request query
        const {accountId, scenarioId, sourceId} = req.query;

        // Create a test message with optional client data
        const testMessage = {
            data: 'This is a test message for Instagram video events',
            timestamp: new Date().toISOString(),
            // Add client data if provided
            ...(accountId && {accountId: String(accountId)}),
            ...(scenarioId && {scenarioId: String(scenarioId)}),
            ...(sourceId && {sourceId: String(sourceId)}),
        };
        log('[pubsub] Test message:', testMessage);

        // Create attributes including client data if available
        const attributes = {
            type: PubSubAction.TEST,
            timestamp: new Date().toISOString(),
            source: 'test-endpoint',
            // Include client data in attributes if available
            ...(accountId && {accountId: String(accountId)}),
            ...(scenarioId && {scenarioId: String(scenarioId)}),
            ...(sourceId && {sourceId: String(sourceId)}),
        };
        log('[pubsub] Message attributes:', attributes);

        // Publish the message using service account authentication
        const success = await publishMessageToPubSub(topic, testMessage, attributes);

        log('[pubsub] Publish result:', success);

        if (success) {
            res.status(200).json({
                success: true,
                message: 'Test message published to Pub/Sub',
                topic: topic,
                authMethod: 'service_account',
                // Include client data in response if provided
                ...(accountId && {accountId: String(accountId)}),
                ...(scenarioId && {scenarioId: String(scenarioId)}),
                ...(sourceId && {sourceId: String(sourceId)}),
            });

            return;
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to publish test message to Pub/Sub',
            });

            return;
        }
    } catch (error) {
        logError('Error in push-pubsub test endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while pushing test message to Pub/Sub',
            errorMessage: error instanceof Error ? error.message : String(error),
        });

        return;
    }
};
