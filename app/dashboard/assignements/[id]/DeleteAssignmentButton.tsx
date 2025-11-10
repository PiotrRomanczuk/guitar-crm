'use client';

export function DeleteAssignmentButton({ assignmentId }: { assignmentId: string }) {
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Delete this assignment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }

      window.location.href = '/dashboard/assignements';
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <form onSubmit={handleDelete}>
      <button
        type="submit"
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        data-testid="delete-button"
      >
        Delete Assignment
      </button>
    </form>
  );
}
