import { useState, useEffect } from 'react';

export function useSolPrice() {
  const [price, setPrice] = useState<number>(200); // Default fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Try CoinGecko first
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        const data = await response.json();
        
        if (data.solana && data.solana.usd) {
          setPrice(data.solana.usd);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching SOL price:', error);
        
        // Fallback to Binance API
        try {
          const binanceResponse = await fetch(
            'https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT'
          );
          const binanceData = await binanceResponse.json();
          
          if (binanceData.price) {
            setPrice(parseFloat(binanceData.price));
            setLoading(false);
          }
        } catch (fallbackError) {
          console.error('Fallback price fetch failed:', fallbackError);
          setLoading(false);
        }
      }
    };

    // Fetch immediately
    fetchPrice();

    // Fetch every 30 seconds
    const interval = setInterval(fetchPrice, 30000);

    return () => clearInterval(interval);
  }, []);

  return { price, loading };
}

// Helper function to format USD
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
}

// Helper function to format SOL
export function formatSOL(lamports: number): string {
  return (lamports / 1e9).toFixed(4);
}
