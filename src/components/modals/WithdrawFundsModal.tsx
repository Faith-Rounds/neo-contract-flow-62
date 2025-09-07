import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  CreditCard, 
  Building, 
  ArrowRight,
  Check,
  Bitcoin,
  Wallet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WithdrawFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractTitle: string;
  availableBalance: number;
  onWithdraw: (amount: number, method: string, details: any) => void;
}

export function WithdrawFundsModal({ 
  open, 
  onOpenChange, 
  contractTitle, 
  availableBalance,
  onWithdraw 
}: WithdrawFundsModalProps) {
  const [amount, setAmount] = useState(availableBalance);
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  // Bank details
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  
  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  
  // Crypto details
  const [walletAddress, setWalletAddress] = useState("");

  const handleContinue = () => {
    if (amount <= 0 || amount > availableBalance) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive"
      });
      return;
    }
    
    setStep(2);
  };

  const handleWithdraw = async () => {
    // Validate based on withdrawal method
    if (withdrawMethod === "bank" && (!bankName || !accountName || !accountNumber || !routingNumber)) {
      toast({
        title: "Missing bank details",
        description: "Please fill in all bank account details.",
        variant: "destructive"
      });
      return;
    }
    
    if (withdrawMethod === "card" && (!cardNumber || !cardName || !expiryDate)) {
      toast({
        title: "Missing card details",
        description: "Please fill in all card details.",
        variant: "destructive"
      });
      return;
    }
    
    if (withdrawMethod === "crypto" && !walletAddress) {
      toast({
        title: "Missing wallet address",
        description: "Please enter your wallet address.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Collect details based on method
    const details = withdrawMethod === "bank" 
      ? { bankName, accountName, accountNumber, routingNumber, currency }
      : withdrawMethod === "card"
        ? { cardNumber, cardName, expiryDate, currency }
        : { walletAddress, currency };
    
    // Mock withdrawal process
    setTimeout(() => {
      onWithdraw(amount, withdrawMethod, details);
      toast({
        title: "Withdrawal successful",
        description: `$${amount.toFixed(2)} has been withdrawn to your ${withdrawMethod === "bank" ? "bank account" : withdrawMethod === "card" ? "card" : "crypto wallet"}.`,
      });
      setLoading(false);
      onOpenChange(false);
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setAmount(availableBalance);
    setWithdrawMethod("bank");
    setCurrency("USD");
    setStep(1);
    setBankName("");
    setAccountName("");
    setAccountNumber("");
    setRoutingNumber("");
    setCardNumber("");
    setCardName("");
    setExpiryDate("");
    setWalletAddress("");
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>
            Withdraw available funds from your contract
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6">
            {/* Contract Info */}
            <div className="space-y-2">
              <h3 className="font-medium text-lg">{contractTitle}</h3>
              
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Available Balance</span>
                  <span className="font-medium text-accent text-lg">${availableBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-sm font-medium">Withdrawal Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  max={availableBalance}
                  step={0.01}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="pl-10 focus:shadow-glow"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Min: $0.01</span>
                <button 
                  type="button" 
                  className="text-accent hover:underline" 
                  onClick={() => setAmount(availableBalance)}
                >
                  Max: ${availableBalance.toFixed(2)}
                </button>
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-3">
              <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full focus:shadow-glow">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={amount <= 0 || amount > availableBalance}
                className="gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Withdrawal Method</h3>
              <div className="text-sm font-medium text-accent">${amount.toFixed(2)}</div>
            </div>

            <Tabs value={withdrawMethod} onValueChange={setWithdrawMethod} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="bank" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Bank
                </TabsTrigger>
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="crypto" className="flex items-center gap-2">
                  <Bitcoin className="h-4 w-4" />
                  Crypto
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="bank" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input 
                      id="bankName" 
                      value={bankName} 
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Holder Name</Label>
                    <Input 
                      id="accountName" 
                      value={accountName} 
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Enter account holder name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input 
                      id="accountNumber" 
                      value={accountNumber} 
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input 
                      id="routingNumber" 
                      value={routingNumber} 
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      placeholder="Enter routing number"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="card" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input 
                      id="cardNumber" 
                      value={cardNumber} 
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Enter card number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input 
                      id="cardName" 
                      value={cardName} 
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Enter name on card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input 
                      id="expiryDate" 
                      value={expiryDate} 
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="crypto" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Wallet Address</Label>
                    <Input 
                      id="walletAddress" 
                      value={walletAddress} 
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Enter your wallet address"
                      className="font-mono"
                    />
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Wallet className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p>Make sure to double-check your wallet address. Transactions cannot be reversed once processed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button 
                onClick={handleWithdraw}
                disabled={loading}
                className="gap-2 bg-accent hover:bg-accent-600"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Withdraw Funds
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
