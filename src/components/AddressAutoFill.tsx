
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';

interface AddressAutoFillProps {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  onCepChange: (cep: string) => void;
  onAddressChange: (address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  }) => void;
}

const AddressAutoFill = ({
  cep,
  street,
  neighborhood,
  city,
  state,
  onCepChange,
  onAddressChange
}: AddressAutoFillProps) => {
  const { fetchAddressByCEP } = useProfile();
  const [loading, setLoading] = useState(false);

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return value;
  };

  const handleCepChange = async (value: string) => {
    const formattedCep = formatCEP(value);
    onCepChange(formattedCep);

    const cleanCep = value.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setLoading(true);
      try {
        const addressData = await fetchAddressByCEP(cleanCep);
        if (addressData) {
          onAddressChange(addressData);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cep">CEP</Label>
        <Input
          id="cep"
          value={cep}
          onChange={(e) => handleCepChange(e.target.value)}
          placeholder="00000-000"
          maxLength={9}
          disabled={loading}
        />
        {loading && <p className="text-sm text-muted-foreground mt-1">Buscando endereço...</p>}
      </div>
      
      <div>
        <Label htmlFor="street">Rua</Label>
        <Input
          id="street"
          value={street}
          readOnly
          className="bg-muted"
          placeholder="Será preenchido automaticamente"
        />
      </div>
      
      <div>
        <Label htmlFor="neighborhood">Bairro</Label>
        <Input
          id="neighborhood"
          value={neighborhood}
          readOnly
          className="bg-muted"
          placeholder="Será preenchido automaticamente"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={city}
            readOnly
            className="bg-muted"
            placeholder="Será preenchido automaticamente"
          />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            value={state}
            readOnly
            className="bg-muted"
            placeholder="UF"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressAutoFill;
