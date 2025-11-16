import React, { useState } from 'react';
import { XIcon, DownloadIcon } from '../Icons';
import { Product, ProductKind } from '../../types';
import mockApi from '../../services/mockApi';

interface ImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

const CSV_HEADERS = "name,description,sku,price,kind,trackStock,unit,warehouseId,stockLevel,lot,expiryDate\n";
const CSV_EXAMPLE_ROWS = 
`"Arroz 25kg","Arroz agulha de alta qualidade.","PROD100",15000,"GOOD",TRUE,"UN","wh1",100,"LOTE_A","2025-12-31"
"Serviço de Limpeza","Limpeza de escritório (1 hora).","SERV101",10000,"SERVICE",FALSE,"HR","wh1",0,"",""
`;
const CSV_CONTENT = CSV_HEADERS + CSV_EXAMPLE_ROWS;

const parseCSV = (csvText: string): Omit<Product, 'id' | 'imageUrl' | 'packaging'>[] => {
    const products: Omit<Product, 'id' | 'imageUrl' | 'packaging'>[] = [];
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const values = lines[i].split(',');

        if (values.length !== headers.length) {
            console.warn(`Skipping malformed CSV row: ${lines[i]}`);
            continue;
        }

        const productData: any = {};
        headers.forEach((header, index) => {
            productData[header] = values[index].trim().replace(/"/g, ''); // remove quotes
        });

        products.push({
            name: productData.name || 'Nome Inválido',
            description: productData.description || '',
            sku: productData.sku || `SKU_${Date.now()}_${i}`,
            price: parseFloat(productData.price) || 0,
            kind: productData.kind === 'SERVICE' ? ProductKind.SERVICE : ProductKind.GOOD,
            trackStock: productData.trackStock.toLowerCase() === 'true',
            unit: productData.unit || 'UN',
            warehouseId: productData.warehouseId || 'wh1',
            stockLevel: parseInt(productData.stockLevel, 10) || 0,
            lot: productData.lot || undefined,
            expiryDate: productData.expiryDate || undefined,
        });
    }
    return products;
};


export const ImportProductsModal: React.FC<ImportProductsModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    if (!isOpen) return null;

    const handleDownloadTemplate = () => {
        const blob = new Blob([CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "template_produtos.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };
    
    const handleImport = () => {
        if (!selectedFile) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const productsToImport = parseCSV(text);
                
                if (productsToImport.length > 0) {
                    await mockApi.addMultipleProducts(productsToImport);
                    onImportSuccess();
                } else {
                    alert("Nenhum produto válido encontrado no ficheiro para importar.");
                }
            } catch (error) {
                console.error("Error processing CSV file:", error);
                alert(`Ocorreu um erro ao processar o ficheiro: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
                setIsImporting(false);
                onClose();
            }
        };

        reader.onerror = () => {
            alert("Ocorreu um erro ao ler o ficheiro.");
            setIsImporting(false);
        }

        reader.readAsText(selectedFile);
    }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Importar Produtos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
                Para importar produtos em massa, descarregue o nosso template CSV, preencha-o com os dados dos seus produtos e depois carregue o ficheiro.
            </p>
            <button 
                onClick={handleDownloadTemplate}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors"
            >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Descarregar Template CSV
            </button>
            <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700">Carregar ficheiro preenchido</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                <span>Selecione um ficheiro</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                            </label>
                            <p className="pl-1">ou arraste e solte aqui</p>
                        </div>
                        <p className="text-xs text-gray-500">CSV até 10MB</p>
                        {selectedFile && <p className="text-sm text-green-700 pt-2">{selectedFile.name}</p>}
                    </div>
                </div>
            </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={handleImport} disabled={!selectedFile || isImporting} className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:bg-gray-400">
              {isImporting ? 'A Processar...' : 'Importar'}
            </button>
        </div>
      </div>
    </div>
  );
};