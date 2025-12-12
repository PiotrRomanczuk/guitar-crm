'use client';

import Link from 'next/link';
import { AssignmentTemplate } from '@/schemas';
import { deleteAssignmentTemplate } from '@/app/actions/assignment-templates';
import { useRouter } from 'next/navigation';

interface TemplateListProps {
  templates: AssignmentTemplate[];
}

export default function TemplateList({ templates }: TemplateListProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteAssignmentTemplate(id);
      router.refresh();
    }
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No templates</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new assignment template.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard/assignments/templates/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create Template
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Description
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {template.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 max-w-md truncate">
                      {template.description}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link
                        href={`/dashboard/assignments/new?templateId=${template.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Assign
                      </Link>
                      <Link
                        href={`/dashboard/assignments/templates/${template.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
