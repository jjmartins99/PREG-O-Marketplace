import React from 'react';
import { useSettings } from '../../hooks/useSettings';

export const SettingsPage: React.FC = () => {
  const { expiryWarningDays, setExpiryWarningDays } = useSettings();
  const [localWarningDays, setLocalWarningDays] = React.useState(expiryWarningDays);
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    setExpiryWarningDays(localWarningDays);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Configurações Globais</h1>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Parâmetros de Inventário</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="expiryWarningDays" className="block text-sm font-medium text-gray-700">
              Dias para alerta de validade
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Os produtos serão marcados a amarelo no inventário quando estiverem a X dias de expirar.
            </p>
            <input
              type="number"
              id="expiryWarningDays"
              value={localWarningDays}
              onChange={(e) => setLocalWarningDays(parseInt(e.target.value, 10) || 0)}
              className="mt-1 w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-center">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:bg-primary-300"
            >
              Guardar Alterações
            </button>
            {saved && <span className="ml-4 text-green-600 text-sm">Guardado com sucesso!</span>}
          </div>
        </div>
      </div>
    </div>
  );
};