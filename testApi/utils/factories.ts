import {CreateAccountParams} from '../../src/types/account';
import {InstagramLocationSource, ScenarioType} from '../../src/types/enums';
import {CreateScenarioParams} from '../../src/types/scenario';

// Account factory
export function buildAccountPayload(
    overrides: Partial<CreateAccountParams> = {},
): CreateAccountParams {
    return {
        slug: 'test-account-' + Math.random().toString(36).slice(2, 8),
        enabled: true,
        ...overrides,
    };
}

// Scenario factory
export function buildScenarioPayload(
    overrides: Partial<CreateScenarioParams> = {},
): CreateScenarioParams {
    return {
        slug: 'test-scenario-' + Math.random().toString(36).slice(2, 8),
        type: ScenarioType.ScenarioAddBannerAtTheEndUnique,
        enabled: true,
        onlyOnce: false,
        options: {},
        instagramLocationSource: InstagramLocationSource.Scenario,
        ...overrides,
    };
}

// Source factory (можно расширить по мере необходимости)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildSourcePayload(overrides: any = {}): any {
    return {
        sources: {foo: 'bar'},
        ...overrides,
    };
}
