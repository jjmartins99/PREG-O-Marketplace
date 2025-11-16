
import React, { useState, useEffect } from 'react';
import { Product, ProductKind } from '../../types';
import { XIcon, SparklesIcon } from '../Icons';
import mockApi, { MOCK_WAREHOUSES } from '../../services/mockApi';
import { GoogleGenAI } from "@google/genai";

interface ProductFormModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const initialFormState: Omit<Product, 'id' | 'imageUrl' | 'packaging'> = {
    name: '',
    description: '',
    sku: '',
    price: 0,
    kind: ProductKind.GOOD,
    trackStock: true,
    unit: 'UN',
    warehouseId: 'wh1',
    stockLevel: 0,
    lot: '',
    expiryDate: '',
};


export const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'imageUrl' | 'packaging'>>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<{ stockLevel?: string }>({});

  useEffect(() => {
    if (isOpen) {
        if (product) {
            // Editing existing product
            const { id, imageUrl, packaging, ...editableFields } = product;
            setFormData(editableFields);
        } else {
            // Adding new product
            setFormData(initialFormState);
        }
        setErrors({});
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { stockLevel?: string } = {};
    if (formData.trackStock && (formData.stockLevel || 0) < 0) {
        newErrors.stockLevel = 'O stock não pode ser negativo.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;

    if (type === 'number') {
        parsedValue = value ? parseFloat(value) : 0;
    }
    
    if (name === 'trackStock' || name === 'kind') {
        const isGood = name === 'kind' ? value === ProductKind.GOOD : formData.kind === ProductKind.GOOD;
        const newTrackStock = name === 'trackStock' ? value === 'true' : formData.trackStock;

        setFormData(prev => ({
            ...prev,
            [name]: parsedValue,
            trackStock: isGood ? newTrackStock : false,
        }));
        return;
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
        alert("Por favor, insira um nome para o produto primeiro.");
        return;
    }
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Gere uma descrição de marketing curta e apelativa para o seguinte produto: "${formData.name}". A descrição deve ter no máximo 2 frases e ser em Português de Angola.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const text = response.text;
        
        setFormData(prev => ({ ...prev, description: text }));
    } catch (error) {
        console.error("Error generating description:", error);
        alert("Não foi possível gerar a descrição. Tente novamente.");
    } finally {
        setIsGenerating(false);
    }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
        const dataToSave = { ...formData, packaging: [] };
        if (product) { // Editing
            const updatedProduct = await mockApi.updateProduct(product.id, dataToSave);
            if(updatedProduct) onSave(updatedProduct);
        } else { // Creating
            const newProduct = await mockApi.addProduct(dataToSave);
            onSave(newProduct);
        }
        onClose();
    } catch (error) {
        console.error("Failed to save product", error);
    } finally {
        setIsSaving(false);
    }
  };

  const isGood = formData.kind === ProductKind.GOOD;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{product ? 'Editar Produto' : 'Adicionar Produto'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full input-style" />
                </div>
                <div>
                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label>
                    <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} required className="mt-1 w-full input-style" />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço (AOA)</label>
                    <input type="number" step="any" name="price" id="price" value={formData.price} onChange={handleChange} required className="mt-1 w-full input-style" />
                </div>
                 <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                        <button
                            type="button"
                            onClick={handleGenerateDescription}
                            disabled={isGenerating || !formData.name}
                            className="flex items-center px-2 py-1 bg-gray-100 text-primary-700 text-xs rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Gerar descrição com IA (requer nome do produto)"
                        >
                            <SparklesIcon className="w-4 h-4 mr-1" />
                            {isGenerating ? 'A gerar...' : 'Gerar com IA'}
                        </button>
                    </div>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} className="w-full input-style" />
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
                <div>
                    <label htmlFor="kind" className="block text-sm font-medium text-gray-700">Tipo de Produto</label>
                    <select name="kind" id="kind" value={formData.kind} onChange={handleChange} className="mt-1 w-full input-style">
                        <option value={ProductKind.GOOD}>Mercadoria</option>
                        <option value={ProductKind.SERVICE}>Serviço</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unidade de Medida</label>
                    <input type="text" name="unit" id="unit" value={formData.unit} onChange={handleChange} required placeholder="Ex: UN, KG, L" className="mt-1 w-full input-style" />
                </div>
                
                {isGood && (
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-medium text-gray-500">Detalhes de Inventário</h3>
                        <div>
                            <label htmlFor="trackStock" className="block text-sm font-medium text-gray-700">Gerir Stock?</label>
                            <select name="trackStock" id="trackStock" value={String(formData.trackStock)} onChange={handleChange} className="mt-1 w-full input-style">
                                <option value="true">Sim</option>
                                <option value="false">Não</option>
                            </select>
                        </div>
                        {formData.trackStock && (
                            <div>
                                <label htmlFor="stockLevel" className="block text-sm font-medium text-gray-700">Stock Inicial</label>
                                <input type="number" name="stockLevel" id="stockLevel" value={formData.stockLevel || 0} onChange={handleChange} required className="mt-1 w-full input-style" />
                                {errors.stockLevel && <p className="text-red-500 text-xs mt-1">{errors.stockLevel}</p>}
                            </div>
                        )}
                        <div>
                            <label htmlFor="warehouseId" className="block text-sm font-medium text-gray-700">Armazém</label>
                            <select name="warehouseId" id="warehouseId" value={formData.warehouseId} onChange={handleChange} className="mt-1 w-full input-style">
                                {MOCK_WAREHOUSES.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="lot" className="block text-sm font-medium text-gray-700">Lote</label>
                                <input type="text" name="lot" id="lot" value={formData.lot || ''} onChange={handleChange} className="mt-1 w-full input-style" />
                            </div>
                            <div>
                                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Data de Validade</label>
                                <input type="date" name="expiryDate" id="expiryDate" value={formData.expiryDate || ''} onChange={handleChange} className="mt-1 w-full input-style" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
          <style>{`.input-style { display: block; width: 100%; border-radius: 0.375rem; border: 1px solid #D1D5DB; padding: 0.5rem 0.75rem; font-size: 0.875rem; line-height: 1.25rem; } .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: #3B82F6; box-shadow: 0 0 0 2px #BFDBFE; } .input-style:disabled { background-color: #F3F4F6; cursor: not-allowed; }`}</style>
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:bg-primary-300">
              {isSaving ? 'A Guardar...' : 'Guardar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};