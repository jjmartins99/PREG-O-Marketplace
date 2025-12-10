
import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { Company } from '../../types';
import mockApi from '../../services/mockApi';
import { CompanyFormModal } from '../../components/modals/CompanyFormModal';
import { PlusIcon } from '../../components/Icons';

// Define a type for the tree structure
interface CompanyNode extends Company {
    children: CompanyNode[];
}

const buildCompanyTree = (companies: Company[]): CompanyNode[] => {
    const companyMap: { [key: string]: CompanyNode } = {};
    companies.forEach(company => {
        companyMap[company.id] = { ...company, children: [] };
    });

    const tree: CompanyNode[] = [];
    companies.forEach(company => {
        if (company.parentId && companyMap[company.parentId]) {
            companyMap[company.parentId].children.push(companyMap[company.id]);
        } else {
            tree.push(companyMap[company.id]);
        }
    });
    return tree;
};

const CompanyNodeComponent: React.FC<{ node: CompanyNode, onAddSubCompany: (parent: Company) => void }> = ({ node, onAddSubCompany }) => {
    return (
        <li className="ml-6 mt-2">
            <div className="flex items-center group">
                <span className="font-medium text-gray-700">{node.name}</span>
                <button 
                    onClick={() => onAddSubCompany(node)}
                    className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 hover:text-primary-800"
                    title={`Adicionar filial a ${node.name}`}
                >
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>
            {node.children.length > 0 && (
                <ul className="pl-4 border-l border-gray-200">
                    {node.children.map(child => <CompanyNodeComponent key={child.id} node={child} onAddSubCompany={onAddSubCompany} />)}
                </ul>
            )}
        </li>
    );
};

export const SettingsPage: React.FC = () => {
  const { expiryWarningDays, lowStockThreshold, updateSettings } = useSettings();
  const [localWarningDays, setLocalWarningDays] = React.useState(expiryWarningDays);
  const [localStockThreshold, setLocalStockThreshold] = React.useState(lowStockThreshold);
  const [saved, setSaved] = React.useState(false);

  const [companyTree, setCompanyTree] = useState<CompanyNode[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [parentCompany, setParentCompany] = useState<Company | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchCompanies = async () => {
        setLoadingCompanies(true);
        const companies = await mockApi.getCompanyHierarchy();
        const tree = buildCompanyTree(companies);
        setCompanyTree(tree);
        setLoadingCompanies(false);
    };
    fetchCompanies();
  }, [refreshKey]);

  // Update local state if context values change (e.g. initial load)
  useEffect(() => {
    setLocalWarningDays(expiryWarningDays);
    setLocalStockThreshold(lowStockThreshold);
  }, [expiryWarningDays, lowStockThreshold]);


  const handleSaveSettings = () => {
    updateSettings({ expiryWarningDays: localWarningDays, lowStockThreshold: localStockThreshold });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleOpenAddCompanyModal = (parent: Company | null) => {
    setParentCompany(parent);
    setIsCompanyModalOpen(true);
  };

  const handleCompanySaved = () => {
    setIsCompanyModalOpen(false);
    setParentCompany(null);
    setRefreshKey(k => k + 1);
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Configurações</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Gestão de Lojas/Empresas</h2>
                <button
                  onClick={() => handleOpenAddCompanyModal(null)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 flex items-center"
              >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Adicionar Casa Mãe
              </button>
          </div>
            {loadingCompanies ? (
              <p>A carregar estrutura...</p>
            ) : (
              <ul>
                {companyTree.map(node => <CompanyNodeComponent key={node.id} node={node} onAddSubCompany={handleOpenAddCompanyModal} />)}
              </ul>
            )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Parâmetros de Inventário</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="expiryWarningDays" className="block text-sm font-medium text-gray-700">
                Aviso de Validade ('A Expirar Brevemente')
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Defina com quantos dias de antecedência os produtos devem ser marcados como "A Expirar Brevemente" (Alerta Amarelo).
              </p>
              <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    id="expiryWarningDays"
                    value={localWarningDays}
                    onChange={(e) => setLocalWarningDays(parseInt(e.target.value, 10) || 0)}
                    className="mt-1 w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-center"
                  />
                  <span className="ml-3 text-sm text-gray-600">dias</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">
                Limiar de Stock Baixo
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Produtos com quantidade igual ou inferior a este valor serão considerados com "Stock Baixo" e receberão destaque no inventário.
              </p>
              <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    id="lowStockThreshold"
                    value={localStockThreshold}
                    onChange={(e) => setLocalStockThreshold(parseInt(e.target.value, 10) || 0)}
                    className="mt-1 w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-center"
                  />
                  <span className="ml-3 text-sm text-gray-600">unidades</span>
              </div>
            </div>

            <div className="flex items-center pt-4">
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:bg-primary-300 transition-colors"
              >
                Guardar Alterações
              </button>
              {saved && (
                  <span className="ml-4 flex items-center text-green-600 text-sm animate-fade-in">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Configurações guardadas!
                  </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <CompanyFormModal 
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSave={handleCompanySaved}
        parentCompany={parentCompany}
      />
    </>
  );
};
