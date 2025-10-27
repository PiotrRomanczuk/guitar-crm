import type { User } from '@/schemas/UserSchema';

export const getUserRoles = (user: User) => {
	const roles = [];
	if (user.isAdmin) roles.push('Admin');
	if (user.isTeacher) roles.push('Teacher');
	if (user.isStudent) roles.push('Student');
	return roles;
};
