/**
 * Students List Component for Teacher Dashboard
 * Displays teacher's students and their progress
 */
export function TeacherStudentsList() {
	return (
		<div className='bg-card rounded-lg shadow-md p-6'>
			<h2 className='text-2xl font-bold mb-4 text-foreground flex items-center gap-2'>
				My Students
				<span className='text-xs px-2 py-1 rounded-full bg-warning/10 text-warning font-normal'>
					Coming Soon
				</span>
			</h2>
			<p className='text-muted-foreground'>
				Student management and assignment features are under development.
			</p>
		</div>
	);
}
