export interface ChipPlanResponse {
  id: string;
  name: string;
  description: string | null;
  chips: number;
  bonusChips: number;
  totalChips: number;
  priceInPaise: number;
  effectivePriceInPaise: number;
  onSale: boolean;
  active: boolean;
  salePriceInPaise: number | null;
  saleName: string | null;
  saleStartAt: string | null;
  saleEndAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChipPlanRequest {
  name: string;
  description?: string | null;
  chips: number;
  bonusChips?: number | null;
  priceInPaise: number;
  active?: boolean | null;
  salePriceInPaise?: number | null;
  saleName?: string | null;
  saleStartAt?: string | null;
  saleEndAt?: string | null;
}

export interface UpdateChipPlanRequest {
  name?: string | null;
  description?: string | null;
  chips?: number | null;
  bonusChips?: number | null;
  priceInPaise?: number | null;
  active?: boolean | null;
  salePriceInPaise?: number | null;
  saleName?: string | null;
  saleStartAt?: string | null;
  saleEndAt?: string | null;
  clearSale?: boolean | null;
}