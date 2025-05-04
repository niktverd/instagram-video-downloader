import {ScenarioV4} from '#types';

type GetScenariosArgs = {
    mediaScenarios: string[];
    accountScenarios: string[];
    scenarios: ScenarioV4[];
};

export const getCrossedScenarios = ({
    mediaScenarios,
    accountScenarios,
    scenarios,
}: GetScenariosArgs) => {
    const foundScenarios = scenarios.filter(({name}) => mediaScenarios.includes(name));
    const foundAccountScenarios = foundScenarios.filter(({name}) =>
        accountScenarios.includes(name),
    );

    return foundAccountScenarios;
};
