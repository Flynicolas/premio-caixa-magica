
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportPreview {
  headers: string[];
  data: any[][];
  totalRows: number;
}

interface ColumnMapping {
  [key: string]: string;
}

interface ImportResult {
  success: number;
  errors: number;
  errorDetails: string[];
}

const ExcelImporter = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [activeTab, setActiveTab] = useState('upload');

  // Colunas obrigatórias e opcionais
  const requiredColumns = [
    { key: 'name', label: 'Nome do Item', required: true },
    { key: 'base_value', label: 'Valor (R$)', required: true },
    { key: 'rarity', label: 'Raridade', required: true }
  ];

  const optionalColumns = [
    { key: 'description', label: 'Descrição', required: false },
    { key: 'category', label: 'Categoria', required: false },
    { key: 'image_url', label: 'URL da Imagem', required: false },
    { key: 'delivery_type', label: 'Tipo de Entrega', required: false },
    { key: 'requires_address', label: 'Requer Endereço', required: false },
    { key: 'chest_types', label: 'Tipos de Baú', required: false }
  ];

  const allColumns = [...requiredColumns, ...optionalColumns];

  // Valores válidos para campos específicos
  const validRarities = ['common', 'rare', 'epic', 'legendary'];
  const validDeliveryTypes = ['digital', 'physical'];
  const validCategories = ['product', 'money', 'voucher'];

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV.",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    processFile(selectedFile);
  }, []);

  const processFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Converter para JSON mantendo headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          throw new Error('Planilha vazia');
        }

        const headers = jsonData[0] as string[];
        const dataRows = jsonData.slice(1) as any[][];
        
        setPreview({
          headers,
          data: dataRows.slice(0, 10), // Mostrar apenas 10 primeiras linhas na preview
          totalRows: dataRows.length
        });

        // Auto-mapear colunas baseado em nomes similares
        const autoMapping: ColumnMapping = {};
        headers.forEach((header, index) => {
          const normalizedHeader = header.toLowerCase().trim();
          
          if (normalizedHeader.includes('nome') || normalizedHeader.includes('name')) {
            autoMapping.name = index.toString();
          } else if (normalizedHeader.includes('valor') || normalizedHeader.includes('value') || normalizedHeader.includes('preço')) {
            autoMapping.base_value = index.toString();
          } else if (normalizedHeader.includes('raridade') || normalizedHeader.includes('rarity')) {
            autoMapping.rarity = index.toString();
          } else if (normalizedHeader.includes('descrição') || normalizedHeader.includes('description')) {
            autoMapping.description = index.toString();
          } else if (normalizedHeader.includes('categoria') || normalizedHeader.includes('category')) {
            autoMapping.category = index.toString();
          } else if (normalizedHeader.includes('imagem') || normalizedHeader.includes('image')) {
            autoMapping.image_url = index.toString();
          }
        });

        setColumnMapping(autoMapping);
        setActiveTab('mapping');
        
        toast({
          title: "Arquivo processado!",
          description: `${headers.length} colunas e ${dataRows.length} linhas encontradas.`
        });

      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        toast({
          title: "Erro ao processar arquivo",
          description: "Verifique se o arquivo está no formato correto.",
          variant: "destructive"
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const validateData = (data: any[][]): string[] => {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 porque começamos da linha 2 (header é linha 1)
      
      // Validar nome
      const nameIndex = parseInt(columnMapping.name || '-1');
      if (nameIndex >= 0 && (!row[nameIndex] || row[nameIndex].toString().trim() === '')) {
        errors.push(`Linha ${rowNum}: Nome é obrigatório`);
      }
      
      // Validar valor
      const valueIndex = parseInt(columnMapping.base_value || '-1');
      if (valueIndex >= 0) {
        const value = row[valueIndex];
        if (!value || isNaN(Number(value.toString().replace(',', '.')))) {
          errors.push(`Linha ${rowNum}: Valor deve ser um número válido`);
        }
      }
      
      // Validar raridade
      const rarityIndex = parseInt(columnMapping.rarity || '-1');
      if (rarityIndex >= 0) {
        const rarity = row[rarityIndex]?.toString().toLowerCase();
        if (rarity && !validRarities.includes(rarity)) {
          errors.push(`Linha ${rowNum}: Raridade deve ser: ${validRarities.join(', ')}`);
        }
      }
      
      // Validar tipo de entrega
      const deliveryIndex = parseInt(columnMapping.delivery_type || '-1');
      if (deliveryIndex >= 0) {
        const delivery = row[deliveryIndex]?.toString().toLowerCase();
        if (delivery && !validDeliveryTypes.includes(delivery)) {
          errors.push(`Linha ${rowNum}: Tipo de entrega deve ser: ${validDeliveryTypes.join(', ')}`);
        }
      }
    });
    
    return errors;
  };

  const importData = async () => {
    if (!preview || !file) return;
    
    // Reprocessar arquivo completo para importação
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        setImporting(true);
        setImportProgress(0);
        
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const dataRows = jsonData.slice(1) as any[][];
        
        // Validar dados antes da importação
        const validationErrors = validateData(dataRows);
        if (validationErrors.length > 0) {
          toast({
            title: "Dados inválidos encontrados",
            description: `${validationErrors.length} erros encontrados. Verifique a aba de validação.`,
            variant: "destructive"
          });
          setImportResult({
            success: 0,
            errors: validationErrors.length,
            errorDetails: validationErrors
          });
          setActiveTab('result');
          setImporting(false);
          return;
        }
        
        let successCount = 0;
        let errorCount = 0;
        const errorDetails: string[] = [];
        
        // Processar linha por linha
        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          const rowNum = i + 2;
          
          try {
            // Mapear dados da linha
            const itemData: any = {
              name: row[parseInt(columnMapping.name || '-1')]?.toString().trim(),
              base_value: parseFloat(row[parseInt(columnMapping.base_value || '-1')]?.toString().replace(',', '.') || '0'),
              rarity: row[parseInt(columnMapping.rarity || '-1')]?.toString().toLowerCase() || 'common',
              category: row[parseInt(columnMapping.category || '-1')]?.toString() || 'product',
              description: row[parseInt(columnMapping.description || '-1')]?.toString() || null,
              image_url: row[parseInt(columnMapping.image_url || '-1')]?.toString() || null,
              delivery_type: row[parseInt(columnMapping.delivery_type || '-1')]?.toString().toLowerCase() || 'digital',
              requires_address: row[parseInt(columnMapping.requires_address || '-1')]?.toString().toLowerCase() === 'true' || false,
              is_active: true,
              import_source: 'excel_import'
            };
            
            // Processar chest_types se existir
            const chestTypesIndex = parseInt(columnMapping.chest_types || '-1');
            if (chestTypesIndex >= 0 && row[chestTypesIndex]) {
              const chestTypes = row[chestTypesIndex].toString().split(',').map((t: string) => t.trim());
              itemData.chest_types = chestTypes;
            }
            
            // Inserir no banco
            const { error } = await supabase
              .from('items')
              .insert([itemData]);
            
            if (error) throw error;
            successCount++;
            
          } catch (error: any) {
            errorCount++;
            errorDetails.push(`Linha ${rowNum}: ${error.message}`);
          }
          
          // Atualizar progresso
          setImportProgress(Math.round(((i + 1) / dataRows.length) * 100));
        }
        
        setImportResult({
          success: successCount,
          errors: errorCount,
          errorDetails
        });
        
        setActiveTab('result');
        
        toast({
          title: "Importação concluída!",
          description: `${successCount} itens importados com sucesso. ${errorCount} erros.`,
          variant: successCount > 0 ? "default" : "destructive"
        });
        
      } catch (error: any) {
        toast({
          title: "Erro na importação",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setImporting(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      ['Nome do Item', 'Valor (R$)', 'Raridade', 'Categoria', 'Descrição', 'URL da Imagem', 'Tipo de Entrega', 'Requer Endereço', 'Tipos de Baú'],
      ['iPhone 15', '800.00', 'legendary', 'product', 'iPhone 15 128GB', 'https://example.com/iphone.jpg', 'physical', 'true', 'gold,diamond'],
      ['R$ 50,00', '50.00', 'epic', 'money', 'Prêmio em dinheiro', '', 'digital', 'false', 'silver,gold'],
      ['Fone Bluetooth', '45.00', 'common', 'product', 'Fone sem fio básico', '', 'physical', 'true', 'silver']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template-itens.xlsx');
  };

  const clearAll = () => {
    setFile(null);
    setPreview(null);
    setColumnMapping({});
    setImportResult(null);
    setImportProgress(0);
    setActiveTab('upload');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importador de Planilhas
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            {(file || preview) && (
              <Button variant="outline" onClick={clearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">1. Upload</TabsTrigger>
            <TabsTrigger value="mapping" disabled={!preview}>2. Mapeamento</TabsTrigger>
            <TabsTrigger value="preview" disabled={!preview}>3. Preview</TabsTrigger>
            <TabsTrigger value="result" disabled={!importResult}>4. Resultado</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Faça upload de um arquivo Excel (.xlsx, .xls) ou CSV com seus itens. 
                Use o template disponível como referência.
              </AlertDescription>
            </Alert>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-lg font-medium">Clique para selecionar arquivo</span>
                <br />
                <span className="text-sm text-gray-500">ou arraste e solte aqui</span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            
            {file && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700">{file.name}</span>
                <Badge variant="outline">{(file.size / 1024).toFixed(1)} KB</Badge>
              </div>
            )}
          </TabsContent>

          <TabsContent value="mapping" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Mapeie as colunas da sua planilha com os campos do sistema. 
                Campos em vermelho são obrigatórios.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allColumns.map((column) => (
                <div key={column.key} className="space-y-2">
                  <Label className={column.required ? 'text-red-600 font-medium' : ''}>
                    {column.label} {column.required && '*'}
                  </Label>
                  <Select
                    value={columnMapping[column.key] || ''}
                    onValueChange={(value) => setColumnMapping(prev => ({ ...prev, [column.key]: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma coluna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Não mapear</SelectItem>
                      {preview?.headers.map((header, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {header} (Coluna {index + 1})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setActiveTab('preview')} disabled={!columnMapping.name || !columnMapping.base_value || !columnMapping.rarity}>
                Continuar para Preview
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                Preview dos primeiros 10 itens. Total de {preview?.totalRows} itens serão importados.
              </AlertDescription>
            </Alert>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-2 text-left">Nome</th>
                    <th className="border border-gray-200 p-2 text-left">Valor</th>
                    <th className="border border-gray-200 p-2 text-left">Raridade</th>
                    <th className="border border-gray-200 p-2 text-left">Categoria</th>
                  </tr>
                </thead>
                <tbody>
                  {preview?.data.map((row, index) => (
                    <tr key={index}>
                      <td className="border border-gray-200 p-2">
                        {row[parseInt(columnMapping.name || '-1')] || '-'}
                      </td>
                      <td className="border border-gray-200 p-2">
                        R$ {row[parseInt(columnMapping.base_value || '-1')] || '0'}
                      </td>
                      <td className="border border-gray-200 p-2">
                        <Badge variant="outline">
                          {row[parseInt(columnMapping.rarity || '-1')] || 'common'}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 p-2">
                        {row[parseInt(columnMapping.category || '-1')] || 'product'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('mapping')}>
                Voltar
              </Button>
              <Button onClick={importData} disabled={importing}>
                {importing ? 'Importando...' : `Importar ${preview?.totalRows} Itens`}
              </Button>
            </div>
            
            {importing && (
              <div className="space-y-2">
                <Progress value={importProgress} />
                <p className="text-sm text-center text-gray-600">
                  Importando... {importProgress}%
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="result" className="space-y-4">
            {importResult && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
                          <p className="text-sm text-gray-600">Importados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                        <div>
                          <p className="text-2xl font-bold text-red-600">{importResult.errors}</p>
                          <p className="text-sm text-gray-600">Erros</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {importResult.errorDetails.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Detalhes dos Erros</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {importResult.errorDetails.map((error, index) => (
                          <p key={index} className="text-sm text-red-600">{error}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex justify-center">
                  <Button onClick={clearAll}>
                    Fazer Nova Importação
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExcelImporter;
