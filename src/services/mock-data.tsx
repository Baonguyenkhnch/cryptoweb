import type { WalletAnalysis } from "./api-real";

/**
 * Generate mock wallet data for demo mode
 * This allows users to test UI when backend is down
 */
export function generateMockWalletData(walletAddress: string): WalletAnalysis {
    // Generate deterministic data based on wallet address
    const seed = walletAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
        const x = Math.sin(seed) * 10000;
        return Math.floor(min + (x - Math.floor(x)) * (max - min));
    };

    const score = random(450, 850);
    const walletAge = random(180, 1200);
    const totalTransactions = random(50, 5000);
    const tokenDiversity = random(3, 25);

    // Calculate rating based on score
    const getRating = (score: number): string => {
        if (score >= 750) return "AAA";
        if (score >= 700) return "AA";
        if (score >= 650) return "A";
        if (score >= 600) return "BBB";
        if (score >= 550) return "BB";
        return "B-C"; // ✅ Unified: Show "B-C" for scores < 550 instead of separate "B" or "C"
    };

    const rating = getRating(score);

    // Generate realistic token balances
    const tokens = ['ETH', 'USDT', 'USDC', 'DAI', 'WBTC', 'LINK', 'UNI', 'AAVE'];
    const selectedTokens = tokens.slice(0, tokenDiversity).map(token => ({
        token,
        balance: random(100, 50000),
        value: random(100, 50000),
    }));

    const totalAssets = selectedTokens.reduce((sum, t) => sum + t.value, 0);

    // Calculate percentages for each token
    const tokenBalances = selectedTokens.map(t => ({
        symbol: t.token,
        balance: t.balance,
        value: t.value,
        percentage: (t.value / totalAssets) * 100,
        token_address: `0x${Math.random().toString(16).substring(2, 42)}`,
        name: `${t.token} Token`,
        logo: undefined,
        decimals: 18,
    }));

    // Generate recent transactions
    const recentTransactions = Array.from({ length: 5 }, (_, i) => {
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - i * random(1, 7));
        const txType = i % 2 === 0 ? 'send' as const : 'receive' as const;
        const amount = random(10, 1000) / 100;
        const token = tokens[random(0, Math.min(3, tokens.length - 1))];

        return {
            id: `tx_${i}`,
            hash: `0x${Math.random().toString(16).substring(2, 66)}`,
            date: timestamp.toISOString(),
            type: txType,
            token: token,
            amount: amount,
            value: amount,
            from: txType === 'send' ? walletAddress : `0x${Math.random().toString(16).substring(2, 42)}`,
            to: txType === 'receive' ? walletAddress : `0x${Math.random().toString(16).substring(2, 42)}`,
            category: txType === 'send' ? 'token send' : 'token receive',
            summary: `${txType === 'send' ? 'Sent' : 'Received'} ${amount.toFixed(4)} ${token}`,
        };
    });

    return {
        score,
        walletAge,
        totalTransactions,
        tokenDiversity,
        totalAssets,
        tokenBalances,
        recentTransactions,
        // Additional fields from real API
        totalBalance: totalAssets,
        tokenCount: tokenDiversity,
        nftCount: random(0, 50),
        transactionCount: totalTransactions,
        firstTransactionDate: new Date(Date.now() - walletAge * 24 * 60 * 60 * 1000).toISOString(),
        lastTransactionDate: new Date(Date.now() - random(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
        uniqueInteractedAddresses: random(10, 200),
        avgTransactionValue: random(100, 5000),
        maxTransactionValue: random(1000, 50000),
        minTransactionValue: random(1, 100),
        totalSent: random(10000, 100000),
        totalReceived: random(10000, 100000),
        gasUsed: random(1000000, 10000000),
        avgGasPrice: random(20, 100),
        riskScore: random(1, 10),
        trustScore: score / 10,
        activityScore: random(50, 100),
        diversityScore: (tokenDiversity / 25) * 100,
        ageScore: Math.min((walletAge / 365) * 100, 100),
        volumeScore: Math.min((totalTransactions / 1000) * 100, 100),
        lastActivityDays: random(1, 30),
        isActive: random(0, 10) > 2,
        hasNFTs: random(0, 10) > 3,
        hasTokens: true,
        hasTransactions: true,
        isContract: false,
        ensName: null,
        labels: [] as string[],
        rating,
    };
}