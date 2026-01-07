'use client';

import React from 'react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createCompanyAction } from '@/app/actions/company';
import { createCompanySchema, type CreateCompanyInput } from '@/lib/validations/auth';
import { clientLogger } from '@/lib/logger';

export default function CreateCompanyPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      companyName: '',
      dataRegion: 'US',
      companySize: '',
      industry: '',
      useCase: '',
    },
  });

  const onSubmit = async (data: CreateCompanyInput) => {
    setError('');
    clientLogger.log('[Create Company] Submitting form:', data);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('companyName', data.companyName);
      formData.append('dataRegion', data.dataRegion);
      if (data.companySize) formData.append('companySize', data.companySize);
      if (data.industry) formData.append('industry', data.industry);
      if (data.useCase) formData.append('useCase', data.useCase);

      const result = await createCompanyAction(formData);

      if (!result.success) {
        setError(result.error);
        clientLogger.error('[Create Company] Failed:', result.error);
      } else {
        clientLogger.log('[Create Company] Success:', result.data);
        // Redirect to dashboard
        router.push('/app');
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your workspace
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Get started by creating your HyreLog workspace
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                {...register('companyName')}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.companyName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="dataRegion" className="block text-sm font-medium text-gray-700">
                Data Region <span className="text-red-500">*</span>
              </label>
              <select
                id="dataRegion"
                {...register('dataRegion')}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.dataRegion ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="US">United States (US)</option>
                <option value="EU">Europe (EU)</option>
                <option value="APAC">Asia Pacific (APAC)</option>
              </select>
              {errors.dataRegion && (
                <p className="mt-1 text-sm text-red-600">{errors.dataRegion.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This cannot be changed later. Choose the region where your data will be stored.
              </p>
            </div>
            <div>
              <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
                Company Size (Optional)
              </label>
              <input
                id="companySize"
                type="text"
                {...register('companySize')}
                placeholder="e.g., 1-10, 11-50, 51-200, 201-500, 500+"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                Industry (Optional)
              </label>
              <input
                id="industry"
                type="text"
                {...register('industry')}
                placeholder="e.g., SaaS, E-commerce, Healthcare"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="useCase" className="block text-sm font-medium text-gray-700">
                Use Case (Optional)
              </label>
              <textarea
                id="useCase"
                {...register('useCase')}
                rows={3}
                placeholder="Tell us how you plan to use HyreLog"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isPending ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
