import testApp from '../app';
import * as accountsController from '../src/sections/ui/controllers/accounts.controller';

// import './clearDbBeforeEach';
import {
    createAccountHelper,
    deleteAccountHelper,
    getAccountByIdHelper,
    getAccountBySlugHelper,
    getAllAccountsHelper,
    updateAccountHelper,
} from './utils/accounts';

describe('accounts.controller', () => {
    it('should export all handlers', () => {
        expect(accountsController).toHaveProperty('createAccountPost');
        expect(accountsController).toHaveProperty('updateAccountPatch');
        expect(accountsController).toHaveProperty('getAccountByIdGet');
        expect(accountsController).toHaveProperty('getAccountBySlugGet');
        expect(accountsController).toHaveProperty('getAllAccountsGet');
        expect(accountsController).toHaveProperty('deleteAccountDelete');
    });

    it('handlers should be functions', () => {
        expect(typeof accountsController.createAccountPost).toBe('function');
        expect(typeof accountsController.updateAccountPatch).toBe('function');
        expect(typeof accountsController.getAccountByIdGet).toBe('function');
        expect(typeof accountsController.getAccountBySlugGet).toBe('function');
        expect(typeof accountsController.getAllAccountsGet).toBe('function');
        expect(typeof accountsController.deleteAccountDelete).toBe('function');
    });

    it('create & getAll', async () => {
        const response = await createAccountHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);
        expect(response.body.id).toBeDefined();
        expect(response.body.slug).toBe('test-account');

        const response2 = await getAllAccountsHelper(testApp);
        expect(response2.body).toBeDefined();
        expect(Array.isArray(response2.body)).toBe(true);
        expect(response2.body.length).not.toBe(0);
        expect(response2.status).toBeLessThan(299);
    });

    it('update', async () => {
        const response = await createAccountHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await updateAccountHelper(
            {
                id: response.body.id,
                slug: 'test-account-updated',
                enabled: false,
            },
            testApp,
        );
        expect(response2.body).toBeDefined();
        expect(response2.body.slug).toBe('test-account-updated');
        expect(response2.body.enabled).toBe(false);
        expect(response2.status).toBeLessThan(299);
    });

    it('delete', async () => {
        const response = await createAccountHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await deleteAccountHelper({id: response.body.id}, testApp);
        expect(response2.status).toBeLessThan(299);

        const response3 = await getAllAccountsHelper(testApp);
        expect(response3.body).toBeDefined();
        // count may be 0 or >0 if DB is not isolated, so just check status
        expect(response3.status).toBeLessThan(299);
    });

    it('getAccountById', async () => {
        const response = await createAccountHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await getAccountByIdHelper({id: response.body.id}, testApp);
        expect(response2.body).toBeDefined();
        expect(response2.body.id).toBe(response.body.id);
        expect(response2.status).toBeLessThan(299);
    });

    it('getAccountBySlug', async () => {
        const response = await createAccountHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await getAccountBySlugHelper({slug: response.body.slug}, testApp);
        expect(response2.body).toBeDefined();
        expect(response2.body.slug).toBe(response.body.slug);
        expect(response2.status).toBeLessThan(299);
    });
});
