import { CreateCampaignRequest } from "@/lib/api/host";

export type CampaignFormData = Partial<CreateCampaignRequest> & {
  useTiers?: boolean;
  rewardFormat?: string;
  is_cac?: boolean; // CAC - Customer Acquisition Cost
  format_cac?: 'clicks' | 'view'; // Formato do CAC
  quantity_conversion?: number; // Quantidade de clicks/views por conversão
  cac_value_per_conversion?: number; // Valor por conversão no modo CAC
  cac_max_amount_per_creator?: number; // Valor máximo por creator no modo CAC
};

export interface KolReward {
  userId: string;
  amount?: number;
}

