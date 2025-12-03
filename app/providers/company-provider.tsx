'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface CompanyContextType {
  selectedCompany: Company | null;
  companies: Company[];
  setSelectedCompany: (company: Company | null) => void;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within CompanyProvider');
  }
  return context;
}

interface CompanyProviderProps {
  children: ReactNode;
  initialCompanies: Company[];
  initialCompanyId?: string;
}

export function CompanyProvider({
  children,
  initialCompanies,
  initialCompanyId,
}: CompanyProviderProps) {
  const router = useRouter();
  const [companies] = useState<Company[]>(initialCompanies);
  const [selectedCompany, setSelectedCompanyState] = useState<Company | null>(() => {
    if (initialCompanyId) {
      return initialCompanies.find((c) => c.id === initialCompanyId) || initialCompanies[0] || null;
    }
    return initialCompanies[0] || null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('hyrelog-selected-company-id');
    if (stored && companies.length > 0) {
      const company = companies.find((c) => c.id === stored);
      if (company) {
        setSelectedCompanyState(company);
      }
    }
  }, [companies]);

  const setSelectedCompany = (company: Company | null) => {
    setSelectedCompanyState(company);
    if (company) {
      localStorage.setItem('hyrelog-selected-company-id', company.id);
    } else {
      localStorage.removeItem('hyrelog-selected-company-id');
    }
    // Refresh the page to update all queries
    router.refresh();
  };

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        companies,
        setSelectedCompany,
        isLoading,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

