/* eslint-disable valid-jsdoc */
import {v4 as uuidv4} from 'uuid';

import User from '../models/User';

export class UserService {
    /**
     * Create a new user
     */
    async createUser(userData: {
        email: string;
        displayName?: string;
        photoURL?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        providerData?: any;
        providerId?: string;
    }): Promise<User> {
        const user = await User.query().insert({
            id: uuidv4(),
            email: userData.email,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            providerData: userData.providerData,
            providerId: userData.providerId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return user;
    }

    /**
     * Find a user by email
     */
    async findUserByEmail(email: string): Promise<User | undefined> {
        const user = await User.query().findOne({email});
        return user;
    }

    /**
     * Find a user by ID
     */
    async findUserById(id: string): Promise<User | undefined> {
        const user = await User.query().findById(id);
        return user;
    }

    /**
     * Update a user
     */
    async updateUser(
        id: string,
        userData: Partial<{
            email: string;
            displayName: string;
            photoURL: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            providerData: any;
            providerId: string;
        }>,
    ): Promise<User | undefined> {
        const updatedUser = await User.query().patchAndFetchById(id, {
            ...userData,
            updatedAt: new Date(),
        });

        return updatedUser;
    }

    /**
     * Delete a user
     */
    async deleteUser(id: string): Promise<number> {
        return await User.query().deleteById(id);
    }
}
