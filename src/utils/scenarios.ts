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
    const foundScenarios = scenarios.filter(({slug}) => mediaScenarios.includes(slug));
    const foundAccountScenarios = foundScenarios.filter(({slug}) =>
        accountScenarios.includes(slug),
    );

    return foundAccountScenarios;
};
