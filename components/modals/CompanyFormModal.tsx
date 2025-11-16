import React, { useState, useEffect } from 'react';
import { Company } from '../../types';
import { XIcon } from '../Icons';
import mockApi from '../../services/mockApi';

interface CompanyFormModalProps {
  parentCompany: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({ parentCompany, isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
        await mockApi.createCompany(name, parentCompany?.id || null);
        onSave();
    } catch (error) {
        console.error("Failed to save company", error);
    } finally {
        setIsSaving(false);
    }
  };

  const title = parentCompany ? `Adicionar Filial a ${parentCompany.name}` : 'Adicionar Nova Casa Mãe';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">Nome da Loja/Empresa</label>
              <input 
                type="text" 
                name="company-name" 
                id="company-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" 
              />
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:bg-primary-300">
              {isSaving ? 'A Guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};