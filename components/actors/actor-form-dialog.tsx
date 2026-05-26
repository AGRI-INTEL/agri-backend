'use client';

import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateActor } from '@/hooks/use-actors';
import type { Sector, ActorRole } from '@/types/actor';

interface ActorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSector?: Sector;
}

interface ActorFormValues {
  name: string;
  role: ActorRole;
  sector: Sector;
  country: string;
  region: string;
  city: string;
  email?: string;
  phone?: string;
}

export function ActorFormDialog({ open, onOpenChange, defaultSector = 'vegetal' }: ActorFormDialogProps) {
  const createActor = useCreateActor();
  const { register, handleSubmit, setValue, watch } = useForm<ActorFormValues>({
    defaultValues: { sector: defaultSector, country: 'SN', role: 'producteur' },
  });

  const onSubmit = (data: ActorFormValues) => {
    createActor.mutate(data, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un acteur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input placeholder="Nom" {...register('name', { required: true })} />
          <Select value={watch('sector')} onValueChange={(v) => setValue('sector', v as Sector)}>
            <SelectTrigger><SelectValue placeholder="Secteur" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="vegetal">Végétal</SelectItem>
              <SelectItem value="animal">Animal</SelectItem>
              <SelectItem value="halieutique">Halieutique</SelectItem>
              <SelectItem value="forestier">Forestier</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Région" {...register('region')} />
          <Input placeholder="Ville" {...register('city')} />
          <Input placeholder="Email" type="email" {...register('email')} />
          <Input placeholder="Téléphone" {...register('phone')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" loading={createActor.isPending}>Créer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
