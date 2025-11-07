// 'use client';

// import { useEffect, useState, ReactNode } from 'react';
// import { useRouter } from 'next/navigation';
// import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

interface RequireRoleProps {
	children: React.ReactNode;
	redirectTo?: string;
	loadingComponent?: React.ReactNode;
}

// /**
//  * Base component for authentication requirement
//  * Ensures user is logged in before rendering children
//  */
//        children,
//        redirectTo = '/sign-in',
//        loadingComponent,
// TODO: Implement full auth logic when needed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RequireAuth({
	children,
	redirectTo: _redirectTo = '/sign-in',
	loadingComponent: _loadingComponent,
}: RequireRoleProps) {
	return <>{children}</>;
}
//        useEffect(() => {
// 	       let mounted = true;
// 	       setLoading(true);
// 	       getUserWithRolesSSR().then((result) => {
// 		       if (mounted) {
// 			       setUser(result.user);
// 			       setLoading(false);
// 		       }
// 	       });
// 	       return () => { mounted = false; };
//        }, []);

//        useEffect(() => {
// 	       if (!loading && !user) {
// 		       router.push(redirectTo);
// 	       }
//        }, [user, loading, router, redirectTo]);

//        if (loading) {
// 	       return (
// 		       <>
// 			       {loadingComponent || (
// 				       <div className='min-h-screen flex items-center justify-center'>
// 					       <div className='text-xl text-gray-600 dark:text-gray-300'>
// 						       Loading...
// 					       </div>
// 				       </div>
// 			       )}
// 		       </>
// 	       );
//        }

//        if (!user) {
// 	       return null;
//        }

//        return <>{children}</>;
// }

// /**
//  * Requires user to be an admin
//  * Redirects non-admins to home page, unauthenticated to sign-in
//  */
//        children,
//        redirectTo,
//        loadingComponent,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RequireAdmin({
	children,
	redirectTo: _redirectTo,
	loadingComponent: _loadingComponent,
}: RequireRoleProps) {
	return <>{children}</>;
}

//        useEffect(() => {
// 	       let mounted = true;
// 	       setLoading(true);
// 	       getUserWithRolesSSR().then((result) => {
// 		       if (mounted) {
// 			       setUser(result.user);
// 			       setIsAdmin(result.isAdmin);
// 			       setLoading(false);
// 		       }
// 	       });
// 	       return () => { mounted = false; };
//        }, []);

//        useEffect(() => {
// 	       if (!loading) {
// 		       if (!user) {
// 			       router.push(redirectTo || '/sign-in');
// 		       } else if (!isAdmin) {
// 			       router.push(redirectTo || '/');
// 		       }
// 	       }
//        }, [user, isAdmin, loading, router, redirectTo]);

//        if (loading) {
// 	       return (
// 		       <>
// 			       {loadingComponent || (
// 				       <div className='min-h-screen flex items-center justify-center'>
// 					       <div className='text-xl text-gray-600 dark:text-gray-300'>
// 						       Loading...
// 					       </div>
// 				       </div>
// 			       )}
// 		       </>
// 	       );
//        }

//        if (!user || !isAdmin) {
// 	       return null;
//        }

//        return <>{children}</>;
// }

// /**
//  * Requires user to be a teacher or admin
//  * Teachers can access, admins can access everything
//  */
//        children,
//        redirectTo,
//        loadingComponent,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RequireTeacher({
	children,
	redirectTo: _redirectTo,
	loadingComponent: _loadingComponent,
}: RequireRoleProps) {
	return <>{children}</>;
}
//        const router = useRouter();

//        useEffect(() => {
// 	       let mounted = true;
// 	       setLoading(true);
// 	       getUserWithRolesSSR().then((result) => {
// 		       if (mounted) {
// 			       setUser(result.user);
// 			       setIsTeacher(result.isTeacher);
// 			       setIsAdmin(result.isAdmin);
// 			       setLoading(false);
// 		       }
// 	       });
// 	       return () => { mounted = false; };
//        }, []);

//        useEffect(() => {
// 	       if (!loading) {
// 		       if (!user) {
// 			       router.push(redirectTo || '/sign-in');
// 		       } else if (!isTeacher && !isAdmin) {
// 			       router.push(redirectTo || '/');
// 		       }
// 	       }
//        }, [user, isTeacher, isAdmin, loading, router, redirectTo]);

//        if (loading) {
// 	       return (
// 		       <>
// 			       {loadingComponent || (
// 				       <div className='min-h-screen flex items-center justify-center'>
// 					       <div className='text-xl text-gray-600 dark:text-gray-300'>
// 						       Loading...
// 					       </div>
// 				       </div>
// 			       )}
// 		       </>
// 	       );
//        }

//        if (!user || (!isTeacher && !isAdmin)) {
// 	       return null;
//        }

//        return <>{children}</>;
// }

// /**
//  * Requires user to be a student or admin
//  * Students can access, admins can access everything
//  */
//        children,
//        redirectTo,
//        loadingComponent,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RequireStudent({
	children,
	redirectTo: _redirectTo,
	loadingComponent: _loadingComponent,
}: RequireRoleProps) {
	return <>{children}</>;
}
//        const router = useRouter();

//        useEffect(() => {
// 	       let mounted = true;
// 	       setLoading(true);
// 	       getUserWithRolesSSR().then((result) => {
// 		       if (mounted) {
// 			       setUser(result.user);
// 			       setIsStudent(result.isStudent);
// 			       setIsAdmin(result.isAdmin);
// 			       setLoading(false);
// 		       }
// 	       });
// 	       return () => { mounted = false; };
//        }, []);

//        useEffect(() => {
// 	       if (!loading) {
// 		       if (!user) {
// 			       router.push(redirectTo || '/sign-in');
// 		       } else if (!isStudent && !isAdmin) {
// 			       router.push(redirectTo || '/');
// 		       }
// 	       }
//        }, [user, isStudent, isAdmin, loading, router, redirectTo]);

//        if (loading) {
// 	       return (
// 		       <>
// 			       {loadingComponent || (
// 				       <div className='min-h-screen flex items-center justify-center'>
// 					       <div className='text-xl text-gray-600 dark:text-gray-300'>
// 						       Loading...
// 					       </div>
// 				       </div>
// 			       )}
// 		       </>
// 	       );
//        }

//        if (!user || (!isStudent && !isAdmin)) {
// 	       return null;
//        }

//        return <>{children}</>;
// }
