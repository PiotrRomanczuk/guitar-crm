'use client';

import { useSignUpLogic } from './useSignUpLogic';

interface SignUpFormProps {
	onSuccess?: () => void;
}

function NameInputs({
	firstName,
	lastName,
	onFirstNameChange,
	onLastNameChange,
	onFirstNameBlur,
	onLastNameBlur,
}: {
	firstName: string;
	lastName: string;
	onFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onFirstNameBlur: () => void;
	onLastNameBlur: () => void;
}) {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
			<div className='space-y-1 sm:space-y-2'>
				<label
					htmlFor='firstName'
					className='block text-xs sm:text-sm font-medium text-gray-900 dark:text-white'
				>
					First Name
				</label>
				<input
					id='firstName'
					name='firstName'
					type='text'
					value={firstName}
					onChange={onFirstNameChange}
					onBlur={onFirstNameBlur}
					required
					className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500'
				/>
			</div>

			<div className='space-y-1 sm:space-y-2'>
				<label
					htmlFor='lastName'
					className='block text-xs sm:text-sm font-medium text-gray-900 dark:text-white'
				>
					Last Name
				</label>
				<input
					id='lastName'
					name='lastName'
					type='text'
					value={lastName}
					onChange={onLastNameChange}
					onBlur={onLastNameBlur}
					required
					className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500'
				/>
			</div>
		</div>
	);
}

function EmailInput({
	value,
	onChange,
	onBlur,
}: {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onBlur: () => void;
}) {
	return (
		<div className='space-y-1 sm:space-y-2'>
			<label
				htmlFor='email'
				className='block text-xs sm:text-sm font-medium text-gray-900 dark:text-white'
			>
				Email Address
			</label>
			<input
				id='email'
				name='email'
				type='email'
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				required
				className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500'
			/>
		</div>
	);
}

function PasswordInput({
	value,
	onChange,
	onBlur,
}: {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onBlur: () => void;
}) {
	return (
		<div className='space-y-1 sm:space-y-2'>
			<label
				htmlFor='password'
				className='block text-xs sm:text-sm font-medium text-gray-900 dark:text-white'
			>
				Password
			</label>
			<input
				id='password'
				name='password'
				type='password'
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				required
				minLength={6}
				className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500'
			/>
			<p className='text-xs text-gray-600 dark:text-gray-400'>
				Minimum 6 characters
			</p>
		</div>
	);
}

function AlertMessage({
	message,
	type = 'error',
}: {
	message: string;
	type?: 'error' | 'success';
}) {
	const roleAttr = type === 'error' ? 'alert' : 'status';
	return (
		<div
			role={roleAttr}
			className={`p-2 sm:p-3 text-xs sm:text-sm rounded-lg border ${
				type === 'error'
					? 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 border-red-200 dark:border-red-800'
					: 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-200 border-green-200 dark:border-green-800'
			}`}
		>
			{message}
		</div>
	);
}

function SignUpFooter() {
	return (
		<p className='text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
			Already have an account?{' '}
			<a
				href='/sign-in'
				className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
			>
				Sign in
			</a>
		</p>
	);
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
	const state = useSignUpLogic(onSuccess);

	return (
		<form onSubmit={state.handleSubmit} className='space-y-4 sm:space-y-6'>
			<NameInputs
				firstName={state.firstName}
				lastName={state.lastName}
				onFirstNameChange={(e) => state.setFirstName(e.target.value)}
				onLastNameChange={(e) => state.setLastName(e.target.value)}
				onFirstNameBlur={() =>
					state.setTouched({ ...state.touched, firstName: true })
				}
				onLastNameBlur={() =>
					state.setTouched({ ...state.touched, lastName: true })
				}
			/>

			<EmailInput
				value={state.email}
				onChange={(e) => state.setEmail(e.target.value)}
				onBlur={() => state.setTouched({ ...state.touched, email: true })}
			/>

			<PasswordInput
				value={state.password}
				onChange={(e) => state.setPassword(e.target.value)}
				onBlur={() => state.setTouched({ ...state.touched, password: true })}
			/>

			{state.validationError && (
				<AlertMessage message={state.validationError} />
			)}
			{state.error && <AlertMessage message={state.error} />}
			{state.success && (
				<AlertMessage
					message='Check your email for confirmation'
					type='success'
				/>
			)}

			<button
				type='submit'
				disabled={state.loading}
				className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
			>
				{state.loading ? 'Signing up...' : 'Sign Up'}
			</button>

			<SignUpFooter />
		</form>
	);
}
