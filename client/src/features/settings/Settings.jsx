import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { 
  User, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Shield, 
  Paintbrush, 
  Lock, 
  Eye, 
  EyeOff, 
  Trash2, 
  Smartphone, 
  Globe 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  
  // States for mocked UI toggles
  const [notifStates, setNotifStates] = useState({
    insights: true,
    weekly: true,
    alerts: false,
    marketing: false
  });

  const [appearanceStates, setAppearanceStates] = useState({
    compact: false,
    grid: true
  });

  const toggleNotif = (key) => setNotifStates(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleAppearance = (key) => setAppearanceStates(prev => ({ ...prev, [key]: !prev[key] }));

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Paintbrush },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === "profile" && <ProfileSection user={user} />}
              {activeTab === "appearance" && <AppearanceSection theme={theme} setTheme={setTheme} states={appearanceStates} toggle={toggleAppearance} />}
              {activeTab === "notifications" && <NotificationsSection states={notifStates} toggle={toggleNotif} />}
              {activeTab === "security" && <SecuritySection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ user }) {
  return (
    <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile Information</h3>
        <p className="text-sm text-muted-foreground">Update your personal details and how others see you.</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input 
            type="text" 
            defaultValue={user?.name} 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <input 
            type="email" 
            defaultValue={user?.email} 
            disabled
            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" 
          />
          <p className="text-[10px] text-muted-foreground">Email cannot be changed once the account is created.</p>
        </div>
        <div className="pt-2">
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}

function AppearanceSection({ theme, setTheme, states, toggle }) {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-6">
        <div>
          <h3 className="text-lg font-medium">Theme Preference</h3>
          <p className="text-sm text-muted-foreground">Choose the visual style of your interface.</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setTheme(mode.id)}
              className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                theme === mode.id 
                  ? "border-primary bg-primary/5 ring-1 ring-primary" 
                  : "border-border/50 bg-background hover:border-primary/50"
              }`}
            >
              <mode.icon className={`w-6 h-6 ${theme === mode.id ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
        <h3 className="text-sm font-medium">Layout Options</h3>
        <div className="space-y-4">
          <ToggleItem 
            label="Compact Mode" 
            desc="Reduce spacing to show more content at once." 
            active={states.compact} 
            onToggle={() => toggle("compact")} 
          />
          <ToggleItem 
            label="Show Grid Lines" 
            desc="Display visual boundaries between dashboard elements." 
            active={states.grid} 
            onToggle={() => toggle("grid")} 
          />
        </div>
      </div>
    </div>
  );
}

function NotificationsSection({ states, toggle }) {
  return (
    <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">Control when and how you want to be notified.</p>
      </div>
      
      <div className="space-y-6">
        <ToggleItem 
          label="Smart Insights" 
          desc="Receive alerts about budget risks and financial patterns." 
          active={states.insights} 
          onToggle={() => toggle("insights")} 
        />
        <ToggleItem 
          label="Weekly Summary" 
          desc="Get a summary of your spending every Monday morning." 
          active={states.weekly} 
          onToggle={() => toggle("weekly")} 
        />
        <ToggleItem 
          label="Large Transaction Alerts" 
          desc="Notify me when a transaction exceeds 5,000 BDT." 
          active={states.alerts} 
          onToggle={() => toggle("alerts")} 
        />
        <ToggleItem 
          label="Marketing Emails" 
          desc="Stay updated with new features and promotions." 
          active={states.marketing} 
          onToggle={() => toggle("marketing")} 
        />
      </div>
    </div>
  );
}

function SecuritySection() {
  const [showPass, setShowPass] = useState(false);
  
  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Security</h3>
            <p className="text-sm text-muted-foreground">Manage your password and account security.</p>
          </div>
        </div>
        
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} 
                placeholder="••••••••"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-10" 
              />
              <button 
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <input 
              type="password" 
              placeholder="Min. 8 characters"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
            />
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
            Change Password
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Active Sessions</h3>
          <button className="text-xs text-primary hover:underline font-medium">Sign out all devices</button>
        </div>
        <div className="space-y-3">
          <SessionItem device="Chrome on Windows" location="Dhaka, Bangladesh" current />
          <SessionItem device="Spendly Mobile (iOS)" location="Dhaka, Bangladesh" />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
          <p className="text-xs text-muted-foreground">Permanently delete your account and all its data.</p>
        </div>
        <button className="px-4 py-2 bg-destructive text-destructive-foreground text-sm font-medium rounded-md hover:bg-destructive/90 transition-colors flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>
    </div>
  );
}

function ToggleItem({ label, desc, active, onToggle }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${active ? "bg-primary" : "bg-secondary"}`}
      >
        <motion.div 
          layout
          className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm"
          animate={{ x: active ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function SessionItem({ device, location, current }) {
  const isDesktop = device.toLowerCase().includes("chrome") || device.toLowerCase().includes("firefox") || device.toLowerCase().includes("safari");
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-background/50">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-secondary">
          {isDesktop ? <Globe className="w-4 h-4 text-muted-foreground" /> : <Smartphone className="w-4 h-4 text-muted-foreground" />}
        </div>
        <div>
          <p className="text-sm font-medium flex items-center gap-2">
            {device}
            {current && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">CURRENT</span>}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Globe className="w-3 h-3" /> {location}
          </p>
        </div>
      </div>
      {!current && <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">Revoke</button>}
    </div>
  );
}
