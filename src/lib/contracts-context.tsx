import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Contract interface
export interface Contract {
  id: string;
  title: string;
  role: "Sent" | "Received";
  counterparty: string;
  status: "Draft" | "Active" | "Cancelled" | "Completed";
  total: number;
  accrued: number;
  updated: Date;
  description?: string;
  milestones?: Milestone[];
  paid?: number;
  client?: string;
  freelancer?: string;
  createdAt?: Date;
}

export interface Milestone {
  id: string;
  index: number;
  amount: number;
  description: string;
  status: "Draft" | "Submitted" | "Approved";
  submittedAt?: Date;
  submittedHash?: string;
  approvedAt?: Date;
}

// Initial mock contracts
const initialContracts: Contract[] = [
  {
    id: "1",
    title: "Website Redesign Project",
    role: "Sent",
    counterparty: "Freddy Dev",
    status: "Active",
    total: 1000,
    accrued: 300,
    updated: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: "2", 
    title: "Mobile App UI Design",
    role: "Received",
    counterparty: "Cassie Client",
    status: "Active", 
    total: 800,
    accrued: 400,
    updated: new Date(Date.now() - 6 * 60 * 60 * 1000)
  },
  {
    id: "3",
    title: "Logo Design Brief",
    role: "Sent",
    counterparty: "Alex Designer",
    status: "Completed",
    total: 500,
    accrued: 500,
    updated: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
];

// Context type
interface ContractsContextType {
  contracts: Contract[];
  addContract: (contract: Omit<Contract, 'id' | 'updated'>) => string;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  getContract: (id: string) => Contract | undefined;
}

// Create context
const ContractsContext = createContext<ContractsContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = 'mesyk-contracts';

// Provider component
export function ContractsProvider({ children }: { children: React.ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>(() => {
    // Try to load from localStorage on initial render
    const storedContracts = localStorage.getItem(STORAGE_KEY);
    if (storedContracts) {
      try {
        // Parse dates properly
        const parsed = JSON.parse(storedContracts);
        return parsed.map((contract: any) => ({
          ...contract,
          updated: new Date(contract.updated),
          milestones: contract.milestones?.map((m: any) => ({
            ...m,
            submittedAt: m.submittedAt ? new Date(m.submittedAt) : undefined,
            approvedAt: m.approvedAt ? new Date(m.approvedAt) : undefined,
          }))
        }));
      } catch (error) {
        console.error('Failed to parse stored contracts:', error);
        return initialContracts;
      }
    }
    return initialContracts;
  });

  // Save to localStorage whenever contracts change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
  }, [contracts]);

  // Add a new contract
  const addContract = (contractData: Omit<Contract, 'id' | 'updated'>) => {
    const id = uuidv4();
    const newContract: Contract = {
      ...contractData,
      id,
      updated: new Date()
    };
    
    setContracts(prevContracts => [...prevContracts, newContract]);
    return id;
  };

  // Update an existing contract
  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts(prevContracts => 
      prevContracts.map(contract => 
        contract.id === id 
          ? { ...contract, ...updates, updated: new Date() } 
          : contract
      )
    );
  };

  // Get a contract by ID
  const getContract = (id: string) => {
    return contracts.find(contract => contract.id === id);
  };

  return (
    <ContractsContext.Provider value={{ contracts, addContract, updateContract, getContract }}>
      {children}
    </ContractsContext.Provider>
  );
}

// Custom hook to use the contracts context
export function useContracts() {
  const context = useContext(ContractsContext);
  if (context === undefined) {
    throw new Error('useContracts must be used within a ContractsProvider');
  }
  return context;
}
