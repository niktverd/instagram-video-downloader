import {randomUUID} from 'crypto';
import {rmSync, writeFileSync} from 'fs';

import {ScenarioMap} from '../scenarios/ScenarioMap';
import {getVideoDuration} from '../video';

import {createPreparedVideo, getAccountById, getScenarioById, getSourceById} from '#src/db';
import {hasPreparedVideoBeenCreated, uploadFileToServer} from '#src/sections/shared';
import {
    CloudRunCreateScenarioVideoParams,
    CloudRunCreateScenarioVideoResponse,
} from '#src/types/cloud-run';
import {IResponse} from '#src/types/common';
import {ScenarioType} from '#src/types/enums';
import {IScenario} from '#src/types/scenario';
import {ThrownError} from '#src/utils/error';
import {getWorkingDirectoryForVideo, log} from '#utils';

// eslint-disable-next-line valid-jsdoc
/**
 * Handler for Pub/Sub push messages
 * Processes messages sent from Pub/Sub to our webhook endpoint
 */
export const runScenarioHandler = async ({
    message: {data, messageId, publishTime, attributes: attributes},
    subscription: _subscription,
}: CloudRunCreateScenarioVideoParams): IResponse<CloudRunCreateScenarioVideoResponse> => {
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
        return {
            result: undefined,
            code: 200,
        };
    }

    const {result: scenario} = await getScenarioById({id: scenarioId});
    if (!scenario) {
        throw new ThrownError(`Scenario with id ${scenarioId} not found`, 404);
    }

    const {result: account} = await getAccountById({id: accountId});
    if (!account) {
        throw new ThrownError(`Account with id ${accountId} not found`, 404);
    }

    const {result: source} = await getSourceById({id: sourceId});
    if (!source) {
        throw new ThrownError(`Source with id ${sourceId} not found`, 404);
    }

    logLocal({scenario, account, source});

    const isScenarioInAccount = Boolean(
        (account.availableScenarios as IScenario[])?.find(
            (accountScenario: IScenario) => accountScenario.slug === scenario.slug,
        ),
    );
    if (!isScenarioInAccount) {
        throw new ThrownError(
            `Scenario with id ${scenarioId} not in account with id ${accountId}`,
            400,
        );
    }

    const isScenarioEnabled = scenario.enabled;
    if (!isScenarioEnabled) {
        throw new ThrownError(`Scenario with id ${scenarioId} is not enabled`, 400);
    }

    const scenarioWorkflow = ScenarioMap[scenario.type as ScenarioType];
    if (!scenarioWorkflow) {
        throw new ThrownError(
            `Scenario workflow not found for scenario with id ${scenarioId}`,
            400,
        );
    }

    const {scenario: scenarioFunction, schema} = scenarioWorkflow;
    const {success, error} = schema.safeParse(scenario);
    if (!success) {
        throw new ThrownError(
            `Scenario with id ${scenarioId} is not valid: ${JSON.stringify(error)}`,
            400,
        );
    }

    if (!scenarioFunction) {
        throw new ThrownError(
            `Scenario function not found for scenario with id ${scenarioId}`,
            400,
        );
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

    return {
        result: undefined,
        code: 200,
    };
};
