import { ExternalLink } from "lucide-react"

interface Transaction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any
  slot: number
  blockTime: number
  signature: string
  confirmationStatus: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="space-y-8">
      {transactions.map((transaction) => {
        const date = new Date(transaction.blockTime * 1000)
        const formattedDate = `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        const isError = transaction.err !== null

        return (
          <a
            key={transaction.signature}
            href={`https://solscan.io/tx/${transaction.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:bg-muted/50 p-2 rounded-lg transition-colors"
          >
            <div className="ml-4 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none">
                  {transaction.signature.slice(0, 4)}...{transaction.signature.slice(-4)}
                </p>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
            <div className={`ml-auto font-medium ${isError ? "text-red-500" : "text-green-500"}`}>
              {isError ? "Failed" : "Success"}
            </div>
          </a>
        )
      })}

      {transactions.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">No transactions found</p>
        </div>
      )}
    </div>
  )
}

