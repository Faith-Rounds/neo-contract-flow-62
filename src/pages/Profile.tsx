import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  MapPin,
  Shield,
  CheckCircle,
  Settings,
  Download,
  Upload,
  RotateCcw
} from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  country: string;
  emailVerified: boolean;
  kycApproved: boolean;
  tosAccepted: boolean;
  tosAcceptedAt?: Date;
}

export default function Profile() {
  const { toast } = useToast();
  const [currentRole, setCurrentRole] = useState<"Cassie" | "Freddy">("Cassie");
  const [demoMode, setDemoMode] = useState(true);
  const [showFees, setShowFees] = useState(true);
  
  const [profile, setProfile] = useState<ProfileData>({
    name: currentRole === "Cassie" ? "Cassie Client" : "Freddy Dev",
    email: currentRole === "Cassie" ? "cassie@example.com" : "freddy@example.com", 
    country: "United States",
    emailVerified: true,
    kycApproved: false,
    tosAccepted: true,
    tosAcceptedAt: new Date("2024-01-15T10:00:00Z")
  });

  const handleSave = () => {
    // Simulate save
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleRoleToggle = () => {
    const newRole = currentRole === "Cassie" ? "Freddy" : "Cassie";
    setCurrentRole(newRole);
    setProfile(prev => ({
      ...prev,
      name: newRole === "Cassie" ? "Cassie Client" : "Freddy Dev",
      email: newRole === "Cassie" ? "cassie@example.com" : "freddy@example.com"
    }));
    
    toast({
      title: `Switched to ${newRole}`,
      description: `Now viewing as ${newRole === "Cassie" ? "Client" : "Freelancer"}`,
    });
  };

  const handleResetDemo = () => {
    toast({
      title: "Demo Data Reset",
      description: "All demo contracts and activity have been cleared.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Exported",
      description: "Demo data has been exported to JSON file.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import Ready",
      description: "Select a JSON file to import demo data.",
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading text-ink">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-heading text-lg text-ink">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentRole === "Cassie" ? "Client" : "Freelancer"}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="pr-10"
                    />
                    {profile.emailVerified && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profile.country}
                    onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="hover-glow">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>Email Verification</span>
                </div>
                <Badge className={profile.emailVerified ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}>
                  {profile.emailVerified ? "Verified" : "Pending"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>KYC Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={profile.kycApproved ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}>
                    {profile.kycApproved ? "Approved" : "Pending"}
                  </Badge>
                  <Switch
                    checked={profile.kycApproved}
                    onCheckedChange={(checked) => 
                      setProfile(prev => ({ ...prev, kycApproved: checked }))
                    }
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Terms of Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={profile.tosAccepted ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}>
                    {profile.tosAccepted ? "Accepted" : "Required"}
                  </Badge>
                  <Checkbox
                    checked={profile.tosAccepted}
                    onCheckedChange={(checked) => 
                      setProfile(prev => ({ 
                        ...prev, 
                        tosAccepted: checked as boolean,
                        tosAcceptedAt: checked ? new Date() : undefined
                      }))
                    }
                  />
                </div>
              </div>
              
              {profile.tosAcceptedAt && (
                <p className="text-xs text-muted-foreground">
                  Accepted on {profile.tosAcceptedAt.toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Demo Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Demo Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Role */}
              <div className="space-y-3">
                <Label>Current Role</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{currentRole}</span>
                  <Switch
                    checked={currentRole === "Freddy"}
                    onCheckedChange={handleRoleToggle}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Toggle between Cassie (Client) and Freddy (Freelancer)
                </p>
              </div>

              <Separator />

              {/* Demo Mode */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Demo Mode</Label>
                  <Switch
                    checked={demoMode}
                    onCheckedChange={setDemoMode}
                  />
                </div>
                <Badge variant={demoMode ? "default" : "secondary"}>
                  {demoMode ? "Active" : "Inactive"}
                </Badge>
              </div>

              <Separator />

              {/* Fee Handling */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Show Fees in UI</Label>
                  <Switch
                    checked={showFees}
                    onCheckedChange={setShowFees}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Display fee calculations in interface
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4" />
                Export Demo Data
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleImportData}
              >
                <Upload className="h-4 w-4" />
                Import Demo Data
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start gap-2"
                onClick={handleResetDemo}
              >
                <RotateCcw className="h-4 w-4" />
                Reset Demo Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}