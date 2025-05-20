import {randomUUID} from 'crypto';
import {rmSync, writeFileSync} from 'fs';

import {ScenarioMap} from '../scenarios/ScenarioMap';
import {getVideoDuration} from '../video';

import {createPreparedVideo, getAccountById, getScenarioById, getSourceById} from '#src/db';
import {hasPreparedVideoBeenCreated, uploadFileToServer} from '#src/sections/shared';
import {CloudRunCreateScenarioVideoParams} from '#src/types/cloud-run';
import {ScenarioType} from '#src/types/enums';
import {IScenario} from '#src/types/scenario';
import {getWorkingDirectoryForVideo, log} from '#utils';

// eslint-disable-next-line valid-jsdoc
/**
 * Handler for Pub/Sub push messages
 * Processes messages sent from Pub/Sub to our webhook endpoint
 */
export const runScenarioHandler = async ({
    message: {data, messageId, publishTime, attributes: attributes},
    subscription: _subscription,
}: CloudRunCreateScenarioVideoParams): Promise<void> => {
    // Remove express req/res, just business logic
    // Pub/Sub messages are received as base64-encoded strings
    // All validation is done in the wrapper

    // Generate a unique request ID for logging
    writeFileSync('reqId.log', randomUUID());

    // Decode the base64 data from the Pub/Sub message
    const decodedData = Buffer.from(data, 'base64').toString();
    const {accountId, scenarioId, sourceId} = JSON.parse(decodedData);

    const logLocal = log.bind(null, 'local', `${accountId}-${scenarioId}-${sourceId}`);
    logLocal('attributes', {attributes});
    logLocal('Received runScenarioHandler call', {
        accountId,
        scenarioId,
        sourceId,
        messageId,
        publishTime,
    });

    if (await hasPreparedVideoBeenCreated({accountId, scenarioId, sourceId})) {
        logLocal('Prepared video already exists');
        return;
    }

    const scenario = await getScenarioById({id: scenarioId});
    if (!scenario) {
        logLocal('Scenario not found', {scenarioId});
        throw new Error('Scenario not found');
    }

    const account = await getAccountById({id: accountId});
    if (!account) {
        logLocal('Account not found', {accountId});
        throw new Error('Account not found');
    }

    const source = await getSourceById({id: sourceId});
    if (!source) {
        logLocal('Source not found', {sourceId});
        throw new Error('Source not found');
    }

    logLocal({scenario, account, source});

    const isScenarioInAccount = Boolean(
        (account.availableScenarios as IScenario[])?.find(
            (accountScenario: IScenario) => accountScenario.slug === scenario.slug,
        ),
    );
    if (!isScenarioInAccount) {
        logLocal('Scenario not in account', {scenarioId, accountId});
        throw new Error('Scenario not in account');
    }

    const isScenarioEnabled = scenario.enabled;
    if (!isScenarioEnabled) {
        logLocal('Scenario is not enabled', {scenarioId, status: scenario.enabled});
        throw new Error('Scenario is not enabled');
    }

    const scenarioWorkflow = ScenarioMap[scenario.type as ScenarioType];
    if (!scenarioWorkflow) {
        logLocal('Scenario workflow not found', {
            scenarioId,
            scenarioType: scenario.type,
            ScenarioMap,
        });
        throw new Error('Scenario workflow not found');
    }

    const {scenario: scenarioFunction, schema} = scenarioWorkflow;
    const {success, error} = schema.safeParse(scenario);
    if (!success) {
        logLocal('Scenario is not valid', {scenarioId, error});
        throw new Error('Scenario is not valid');
    }

    if (!scenarioFunction) {
        logLocal('Scenario function not found', {scenarioId});
        throw new Error('Scenario function not found');
    }

    logLocal('Scenario function found', {scenarioId});

    const directoryName = `${accountId}-${scenarioId}-${sourceId}`;
    const basePath = getWorkingDirectoryForVideo(directoryName);
    logLocal('basePath', {basePath});
    const finalFilePath = await scenarioFunction({scenario, source, basePath});
    logLocal('finalFilePath', {finalFilePath});
    const scenarioSlug = scenario.slug;

    const duration = await getVideoDuration(finalFilePath);

    // Upload data to server
    const downloadURL = await uploadFileToServer(
        finalFilePath,
        `${directoryName}-${scenarioSlug}.mp4`,
    );
    logLocal('downloadURL', {downloadURL});
    // update database
    const savedPreparedVideo = await createPreparedVideo({
        firebaseUrl: downloadURL,
        scenarioId,
        sourceId,
        accountId,
        duration,
    });
    logLocal('video added to database', savedPreparedVideo);
    // delete tempfiles
    const deleteTempFiles = true;
    if (deleteTempFiles) {
        rmSync(basePath, {recursive: true});
        logLocal('temp files deleted');
    }
};
