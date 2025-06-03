import {randomUUID} from 'crypto';
import {rmSync, writeFileSync} from 'fs';

import {ScenarioMap} from '../scenarios/ScenarioMap';
import {getVideoDuration} from '../video';

import {IAccount} from '#src/types/account';
import {
    CloudRunCreateScenarioVideoParams,
    CloudRunCreateScenarioVideoResponse,
} from '#src/types/cloud-run';
import {ApiFunctionPrototype} from '#src/types/common';
import {CloudRunScenarioExecutionStatusEnum, ScenarioType} from '#src/types/enums';
import {IScenario} from '#src/types/scenario';
import {ISource} from '#src/types/source';
import {ThrownError} from '#src/utils/error';
import {fetchGet, fetchPatch, fetchPost} from '#src/utils/fetchHelpers';
import {FetchRoutes, getWorkingDirectoryForVideo, log, uploadFileToServer} from '#utils';

// eslint-disable-next-line valid-jsdoc
/**
 * Handler for Pub/Sub push messages
 * Processes messages sent from Pub/Sub to our webhook endpoint
 */
export const runScenarioHandler: ApiFunctionPrototype<
    CloudRunCreateScenarioVideoParams,
    CloudRunCreateScenarioVideoResponse
> = async (params) => {
    const {
        message: {data, messageId, publishTime, attributes: attributes},
        subscription: _subscription,
    } = params;

    // fetchPost /api/ui/create-cloud-run-scenario-execution
    // textPayload: "  ["reqId_8d993305-301c-42dd-8115-3f86a25a29a2","local","81-100-583","attributes",{"attributes":{"timestamp":"2025-05-28T23:09:52.357Z","type":"run_scenario"}}]"
    const cloudRunScenarioExecution = await fetchPost({
        route: FetchRoutes.createCloudRunScenarioExecution,
        body: {
            // export const CloudRunScenarioExecutionSchema = createEntitySchema({
            //     id: zodNumber(),
            //     messageId: z.string(),
            //     accountId: zodOptionalNumber(),
            //     scenarioId: zodOptionalNumber(),
            //     sourceId: zodOptionalNumber(),
            //     status: z.nativeEnum(CloudRunScenarioExecutionStatusEnum),
            //     reqId: z.string(),
            //     attempt: z.number(),
            //     queueName: z.string(),
            //     traceId: z.string().optional(),
            //     errorDetails: z.string().optional(),
            //     artifactPath: z.string().optional(),
            //     startedAt: z.string().datetime().optional(),
            //     finishedAt: z.string().datetime().optional(),
            //     duration: z.number().optional(),
            //     cancelled: z.boolean().optional(),
            //     userId: z.string().optional(),
            // }).strict();
            messageId,
            status: CloudRunScenarioExecutionStatusEnum.InProgress,
            attempt: 1,
            queueName: attributes?.queueName,
            traceId: attributes?.traceId,
            userId: attributes?.userId,
            startedAt: new Date().toISOString(),
        },
    });

    // Remove express req/res, just business logic
    // Pub/Sub messages are received as base64-encoded strings
    // All validation is done in the wrapper

    // Generate a unique request ID for logging
    const reqId = randomUUID();
    writeFileSync('reqId.log', reqId);

    // Decode the base64 data from the Pub/Sub message
    const decodedData = Buffer.from(data, 'base64').toString();
    const {accountId, scenarioId, sourceId} = JSON.parse(decodedData);

    await fetchPatch({
        route: FetchRoutes.updateCloudRunScenarioExecutionStatus,
        body: {
            id: cloudRunScenarioExecution.id,
            status: CloudRunScenarioExecutionStatusEnum.InProgress,
            reqId,
            accountId,
            scenarioId,
            sourceId,
        },
    });

    const logLocal = log.bind(null, 'local', `${accountId}-${scenarioId}-${sourceId}`);
    logLocal('attributes', {attributes});
    logLocal('Received runScenarioHandler call', {
        accountId,
        scenarioId,
        sourceId,
        messageId,
        publishTime,
    });

    const hasPreparedVideoBeenCreated = await fetchGet<boolean>({
        route: FetchRoutes.hasPreparedVideoBeenCreated,
        query: {accountId, scenarioId, sourceId},
    });
    if (hasPreparedVideoBeenCreated) {
        await fetchPatch({
            route: FetchRoutes.updateCloudRunScenarioExecutionStatus,
            body: {
                id: cloudRunScenarioExecution.id,
                status: CloudRunScenarioExecutionStatusEnum.Success,
                cancelled: true,
                finishedAt: new Date().toISOString(),
                duration:
                    new Date().getTime() - new Date(cloudRunScenarioExecution.startedAt).getTime(),
                errorDetails: 'hasPreparedVideoBeenCreated',
            },
        });

        return {
            result: undefined,
            code: 200,
        };
    }

    const scenario = await fetchGet<IScenario>({
        route: FetchRoutes.getScenario,
        query: {id: scenarioId},
    });
    if (!scenario) {
        const errorDetails = `Scenario with id ${scenarioId} not found`;
        await fetchPatch({
            route: FetchRoutes.updateCloudRunScenarioExecutionStatus,
            body: {
                id: cloudRunScenarioExecution.id,
                status: CloudRunScenarioExecutionStatusEnum.Fail,
                errorDetails,
                finishedAt: new Date().toISOString(),
                duration:
                    new Date().getTime() - new Date(cloudRunScenarioExecution.startedAt).getTime(),
                cancelled: true,
            },
        });

        throw new ThrownError(errorDetails, 404);
    }

    // const {result: account} = await getAccountById({id: accountId}, db);
    const account = await fetchGet<IAccount>({
        route: FetchRoutes.getAccountById,
        query: {id: accountId},
    });
    if (!account) {
        const errorDetails = `Account with id ${accountId} not found`;
        await fetchPatch({
            route: FetchRoutes.updateCloudRunScenarioExecutionStatus,
            body: {
                id: cloudRunScenarioExecution.id,
                status: CloudRunScenarioExecutionStatusEnum.Fail,
                errorDetails,
                finishedAt: new Date().toISOString(),
                duration:
                    new Date().getTime() - new Date(cloudRunScenarioExecution.startedAt).getTime(),
                cancelled: true,
            },
        });

        throw new ThrownError(errorDetails, 404);
    }

    // const {result: source} = await getSourceById({id: sourceId}, db);
    const source = await fetchGet<ISource>({
        route: FetchRoutes.getOneSource,
        query: {id: sourceId},
    });
    if (!source) {
        const errorDetails = `Source with id ${sourceId} not found`;
        await fetchPatch({
            route: FetchRoutes.updateCloudRunScenarioExecutionStatus,
            body: {
                id: cloudRunScenarioExecution.id,
                status: CloudRunScenarioExecutionStatusEnum.Fail,
                errorDetails,
                finishedAt: new Date().toISOString(),
                duration:
                    new Date().getTime() - new Date(cloudRunScenarioExecution.startedAt).getTime(),
                cancelled: true,
            },
        });

        throw new ThrownError(errorDetails, 404);
    }

    logLocal({scenario, account, source});

    const isScenarioInAccount = Boolean(
        (account.availableScenarios as IScenario[])?.find(
            (accountScenario: IScenario) => accountScenario.slug === scenario.slug,
        ),
    );
    logLocal('isScenarioInAccount', isScenarioInAccount);
    logLocal('account.availableScenarios', account.availableScenarios);
    if (!isScenarioInAccount) {
        const errorDetails = `Scenario with id ${scenarioId} not in account with id ${accountId}`;
        await fetchPatch({
            route: FetchRoutes.updateCloudRunScenarioExecutionStatus,
            body: {
                id: cloudRunScenarioExecution.id,
                status: CloudRunScenarioExecutionStatusEnum.Fail,
                errorDetails,
                finishedAt: new Date().toISOString(),
                duration:
                    new Date().getTime() - new Date(cloudRunScenarioExecution.startedAt).getTime(),
                cancelled: true,
            },
        });

        throw new ThrownError(errorDetails, 400);
    }

    const isScenarioEnabled = scenario.enabled;
    if (!isScenarioEnabled) {
        const errorDetails = `Scenario with id ${scenarioId} is not enabled`;
        await fetchPatch({
            route: FetchRoutes.updateCloudRunScenarioExecutionStatus,
            body: {
                id: cloudRunScenarioExecution.id,
                status: CloudRunScenarioExecutionStatusEnum.Fail,
                errorDetails,
                finishedAt: new Date().toISOString(),
                duration:
                    new Date().getTime() - new Date(cloudRunScenarioExecution.startedAt).getTime(),
                cancelled: true,
            },
        });

        throw new ThrownError(errorDetails, 400);
    }

    const scenarioWorkflow = ScenarioMap[scenario.type as ScenarioType];
    if (!scenarioWorkflow) {
        const errorDetails = `Scenario workflow not found for scenario with id ${scenarioId}`;
        await fetchPatch({
            route: FetchRoutes.updateCloudRunScenarioExecutionStatus,
            body: {
                id: cloudRunScenarioExecution.id,
                status: CloudRunScenarioExecutionStatusEnum.Fail,
                errorDetails,
                finishedAt: new Date().toISOString(),
                duration:
                    new Date().getTime() - new Date(cloudRunScenarioExecution.startedAt).getTime(),
                cancelled: true,
            },
        });

        throw new ThrownError(errorDetails, 400);
    }

    const {scenario: scenarioFunction, schema} = scenarioWorkflow;
    const {success, error} = schema.safeParse(scenario);
    if (!success) {
        const errorDetails = `Scenario with id ${scenarioId} is not valid: ${JSON.stringify(
            error,
        )}`;
        await fetchPatch({
            route: FetchRoutes.updateCloudRunScenarioExecutionStatus,
            body: {
                id: cloudRunScenarioExecution.id,
                status: CloudRunScenarioExecutionStatusEnum.Fail,
                errorDetails,
                finishedAt: new Date().toISOString(),
                duration:
                    new Date().getTime() - new Date(cloudRunScenarioExecution.startedAt).getTime(),
                cancelled: true,
            },
        });

        throw new ThrownError(errorDetails, 400);
    }

    if (!scenarioFunction) {
        const errorDetails = `Scenario function not found for scenario with id ${scenarioId}`;

        await fetchPatch({
            route: FetchRoutes.updateCloudRunScenarioExecutionStatus,
            body: {
                id: cloudRunScenarioExecution.id,
                status: CloudRunScenarioExecutionStatusEnum.Fail,
                errorDetails,
                finishedAt: new Date().toISOString(),
                duration:
                    new Date().getTime() - new Date(cloudRunScenarioExecution.startedAt).getTime(),
                cancelled: true,
            },
        });

        throw new ThrownError(errorDetails, 400);
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
    // const savedPreparedVideo = await createPreparedVideo(
    //     {
    //         firebaseUrl: downloadURL,
    //         scenarioId,
    //         sourceId,
    //         accountId,
    //         duration,
    //     },
    //     db,
    // );
    const savedPreparedVideo = await fetchPost({
        route: FetchRoutes.createPreparedVideo,
        body: {
            firebaseUrl: downloadURL,
            scenarioId,
            sourceId,
            accountId,
            duration,
        },
    });
    await fetchPatch({
        route: FetchRoutes.updateCloudRunScenarioExecutionStatus,
        body: {
            id: cloudRunScenarioExecution.id,
            status: CloudRunScenarioExecutionStatusEnum.Success,
            finishedAt: new Date().toISOString(),
            duration:
                new Date().getTime() - new Date(cloudRunScenarioExecution.startedAt).getTime(),
            artifactPath: downloadURL,
        },
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
