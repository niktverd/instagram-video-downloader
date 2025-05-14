import {IScenario, ISource} from '#src/models/types';

type ScenarioFunctionArgs = {
    scenario: IScenario;
    source: ISource;
    basePath: string;
};

export type ScenarioFunction = (args: ScenarioFunctionArgs) => Promise<string>;
