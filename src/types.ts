export interface Offer {
  shopName: string;
  price?: number;
  formattedPrice: string;
  paymentComparison: string;
  discounts?: string;
  purchaseUrl: string;
  isBestDeal?: boolean;
  isUserEdited?: boolean;
}

export interface SearchResult {
  productName: string;
  summary: string;
  offers: Offer[];
  isFallback?: boolean;
  citations?: {
    title: string;
    uri: string;
  }[];
}

export interface HistoryItem {
  query: string;
  timestamp: string;
}

export interface PriceAlert {
  id: string;
  productName: string;
  targetPrice: number;
  initialPrice: number;
  currentLowestPrice: number;
  storeName: string;
  createdAt: string;
  isTriggered: boolean;
  triggeredAt?: string;
  isRead?: boolean;
}
