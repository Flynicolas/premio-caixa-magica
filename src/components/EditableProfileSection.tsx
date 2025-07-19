
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit3, Save, X, Loader2 } from 'lucide-react';

interface EditableProfileSectionProps {
  title: string;
  icon?: React.ReactNode;
  fields: {
    key: string;
    label: string;
    value: string | undefined;
    type?: 'text' | 'email' | 'tel' | 'textarea';
    placeholder?: string;
    disabled?: boolean;
  }[];
  onSave: (updates: Record<string, string>) => Promise<void>;
  loading?: boolean;
}

const EditableProfileSection = ({ 
  title, 
  icon, 
  fields, 
  onSave, 
  loading = false 
}: EditableProfileSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    const initialData: Record<string, string> = {};
    fields.forEach(field => {
      initialData[field.key] = field.value || '';
    });
    setEditData(initialData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editData);
      setIsEditing(false);
      setEditData({});
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setEditData(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit3 className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>
                  {field.label}
                </Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    value={editData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    rows={3}
                  />
                ) : (
                  <Input
                    id={field.key}
                    type={field.type || 'text'}
                    value={editData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                  />
                )}
              </div>
            ))}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.key}>
                <Label className="text-sm text-muted-foreground">
                  {field.label}
                </Label>
                <p className="text-sm font-medium">
                  {field.value || (
                    <span className="text-muted-foreground italic">
                      Não informado
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EditableProfileSection;
