'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PortfolioData {
  id: number;
  wallet_address: string;
  timestamp: string;
  portfolio_data: {
    summary: {
      positions: {
        token: {
          spot: {
            totalValue: number;
          };
          yield: {
            totalValue: number;
            estimated24hReward: number;
          };
        };
        lending: {
          tokenPosition: {
            totalValue: number;
            estimated24hReward: number;
          };
        };
        liquidity: {
          clmm: {
            totalValue: number;
            estimated24hReward: number;
            totalPendingReward: number;
          };
        };
      };
      aggregated: {
        netWorth: number;
        defiValue: number;
        tokenValue: number;
        estimated24hReward: number;
        totalPendingReward: number;
      };
    };
    positions: {
      token: {
        spot: Array<{
          asset: {
            symbol: string;
            title: string;
            logoURI: string;
          };
          balance: number;
          valueInUSD: number;
          priceChange24hPct: number;
        }>;
        yield: Array<{
          asset: {
            symbol: string;
            title: string;
            logoURI: string;
          };
          balance: number;
          valueInUSD: number;
          apr: number;
        }>;
      };
      lending: {
        tokenPosition: Array<{
          asset: {
            symbol: string;
            title: string;
            logoURI: string;
          };
          balance: number;
          valueInUSD: number;
          apr: number;
          platform: {
            title: string;
          };
        }>;
      };
      liquidity: {
        clmm: Array<{
          title: string;
          platform: {
            title: string;
          };
          valueInUSD: number;
          apr: number;
          currentPrice: number;
          pendingRewardInUSD: number;
          underlyings: Array<{
            symbol: string;
            balance: number;
            logoURI: string;
          }>;
        }>;
      };
    };
  };
  tx_history: {
    result: Array<{
      signature: string;
      blockTime: number;
      err: any;
      confirmationStatus: string;
    }>;
  };
}

export default function Home() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async () => {
    if (!walletAddress) {
      setMessage('Please enter a wallet address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/portfolios/${walletAddress}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Portfolio data updated successfully!');
        setPortfolioData(data.data);
      } else {
        setMessage(data.error || 'Failed to update portfolio data');
      }
    } catch (error) {
      setMessage('Error updating portfolio data');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGet = async () => {
    if (!walletAddress) {
      setMessage('Please enter a wallet address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/portfolios/${walletAddress}`);
      const data = await response.json();
      
      if (response.ok) {
        setPortfolioData(data);
        setMessage('Portfolio data retrieved successfully!');
      } else {
        setMessage(data.error || 'Failed to retrieve portfolio data');
      }
    } catch (error) {
      setMessage('Error retrieving portfolio data');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getMonthlyTransactionData = () => {
    if (!portfolioData?.tx_history.result) return [];

    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7); // Format: YYYY-MM
    }).reverse();

    const monthlyCounts = last12Months.map(month => {
      const count = portfolioData.tx_history.result.filter(tx => {
        const txDate = new Date(tx.blockTime * 1000).toISOString().slice(0, 7);
        return txDate === month;
      }).length;

      return {
        month,
        count
      };
    });

    return monthlyCounts;
  };

  const getModuleDistributionData = () => {
    if (!portfolioData?.portfolio_data.summary.positions) return [];

    const { token, lending, liquidity } = portfolioData.portfolio_data.summary.positions;
    
    return [
      {
        name: 'Spot',
        value: token.spot.totalValue,
        color: '#3B82F6' // blue
      },
      {
        name: 'Yield',
        value: token.yield.totalValue,
        color: '#10B981' // green
      },
      {
        name: 'Lending',
        value: lending.tokenPosition.totalValue,
        color: '#F59E0B' // amber
      },
      {
        name: 'Liquidity',
        value: liquidity.clmm.totalValue,
        color: '#8B5CF6' // purple
      }
    ].filter(item => item.value > 0);
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-white">Solana Portfolio Manager</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Enter Solana wallet address"
          className="border border-gray-700 bg-gray-800 text-white p-2 rounded mr-2 w-96 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handlePost}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded mr-2 disabled:bg-blue-800 hover:bg-blue-700 transition-colors"
        >
          {isLoading ? 'Updating...' : 'Update Portfolio'}
        </button>
        <button
          onClick={handleGet}
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-green-800 hover:bg-green-700 transition-colors"
        >
          {isLoading ? 'Loading...' : 'Get Portfolio'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 text-sm ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </div>
      )}

      {portfolioData && (
        <div className="mt-4 space-y-6">
          {/* Portfolio Summary */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Portfolio Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded border border-gray-600">
                  <div className="text-sm text-gray-400">Total Net Worth</div>
                  <div className="text-2xl font-bold text-white">{formatUSD(portfolioData.portfolio_data.summary.aggregated.netWorth)}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded border border-gray-600">
                  <div className="text-sm text-gray-400">Spot Value</div>
                  <div className="text-2xl font-bold text-white">{formatUSD(portfolioData.portfolio_data.summary.positions.token.spot.totalValue)}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded border border-gray-600">
                  <div className="text-sm text-gray-400">Yield Value</div>
                  <div className="text-2xl font-bold text-white">{formatUSD(portfolioData.portfolio_data.summary.positions.token.yield.totalValue)}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded border border-gray-600">
                  <div className="text-sm text-gray-400">Lending Value</div>
                  <div className="text-2xl font-bold text-white">{formatUSD(portfolioData.portfolio_data.summary.positions.lending.tokenPosition.totalValue)}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded border border-gray-600">
                  <div className="text-sm text-gray-400">Liquidity Value</div>
                  <div className="text-2xl font-bold text-white">{formatUSD(portfolioData.portfolio_data.summary.positions.liquidity.clmm.totalValue)}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded border border-gray-600">
                  <div className="text-sm text-gray-400">Pending Rewards</div>
                  <div className="text-2xl font-bold text-white">{formatUSD(portfolioData.portfolio_data.summary.aggregated.totalPendingReward)}</div>
                </div>
              </div>
              
              {/* Module Distribution Chart */}
              <div className="bg-gray-700 p-4 rounded border border-gray-600">
                <h3 className="text-lg font-semibold mb-4 text-white text-center">Asset Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getModuleDistributionData()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {getModuleDistributionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }}
                        formatter={(value: number) => formatUSD(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Token Holdings */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Token Holdings</h2>
            <div className="space-y-4">
              {portfolioData.portfolio_data.positions.token.spot.map((token, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded border border-gray-600">
                  <div className="flex items-center">
                    <img src={token.asset.logoURI} alt={token.asset.symbol} className="w-8 h-8 rounded-full mr-3" />
                    <div>
                      <div className="font-medium text-white">{token.asset.symbol}</div>
                      <div className="text-sm text-gray-400">{token.asset.title}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">{formatUSD(token.valueInUSD)}</div>
                    <div className={`text-sm ${token.priceChange24hPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercentage(token.priceChange24hPct)} 24h
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yield Positions */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Yield Positions</h2>
            <div className="space-y-4">
              {portfolioData.portfolio_data.positions.token.yield.map((position, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded border border-gray-600">
                  <div className="flex items-center">
                    <img src={position.asset.logoURI} alt={position.asset.symbol} className="w-8 h-8 rounded-full mr-3" />
                    <div>
                      <div className="font-medium text-white">{position.asset.symbol}</div>
                      <div className="text-sm text-gray-400">{position.asset.title}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">{formatUSD(position.valueInUSD)}</div>
                    <div className="text-sm text-green-400">{formatPercentage(position.apr)} APR</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lending Positions */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Lending Positions</h2>
            <div className="space-y-4">
              {portfolioData.portfolio_data.positions.lending.tokenPosition.map((position, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded border border-gray-600">
                  <div className="flex items-center">
                    <img src={position.asset.logoURI} alt={position.asset.symbol} className="w-8 h-8 rounded-full mr-3" />
                    <div>
                      <div className="font-medium text-white">{position.asset.symbol}</div>
                      <div className="text-sm text-gray-400">{position.platform.title}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">{formatUSD(position.valueInUSD)}</div>
                    <div className="text-sm text-green-400">{formatPercentage(position.apr)} APR</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liquidity Positions */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Liquidity Positions</h2>
            <div className="space-y-4">
              {portfolioData.portfolio_data.positions.liquidity.clmm.map((position, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-white">{position.title}</div>
                    <div className="text-sm text-gray-400">{position.platform.title}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Value</div>
                      <div className="font-medium text-white">{formatUSD(position.valueInUSD)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">APR</div>
                      <div className="font-medium text-green-400">{formatPercentage(position.apr)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Pending Rewards</div>
                      <div className="font-medium text-white">{formatUSD(position.pendingRewardInUSD)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Current Price</div>
                      <div className="font-medium text-white">{formatUSD(position.currentPrice)}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-400">Underlying Assets:</div>
                    <div className="flex gap-2 mt-1">
                      {position.underlyings.map((asset, idx) => (
                        <div key={idx} className="flex items-center bg-gray-800 p-2 rounded border border-gray-600">
                          <img src={asset.logoURI} alt={asset.symbol} className="w-4 h-4 rounded-full mr-2" />
                          <span className="text-sm text-white">{asset.symbol}: {asset.balance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History Chart */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Monthly Transactions</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getMonthlyTransactionData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction History Table */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Transaction History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-4 text-gray-400">Date</th>
                    <th className="text-left py-2 px-4 text-gray-400">Signature</th>
                    <th className="text-left py-2 px-4 text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.tx_history.result.map((tx, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-2 px-4 text-white">{formatDate(tx.blockTime)}</td>
                      <td className="py-2 px-4">
                        <a 
                          href={`https://solscan.io/tx/${tx.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 truncate block max-w-md"
                        >
                          {tx.signature}
                        </a>
                      </td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          tx.err ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'
                        }`}>
                          {tx.err ? 'Failed' : 'Success'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
