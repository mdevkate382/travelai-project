import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useRouter, navigate } from '@/lib/router';
import { useEffect } from 'react';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { Dashboard } from '@/pages/Dashboard';
import { HomePage } from '@/pages/HomePage';
import { Planner } from '@/pages/Planner';
import { PlansPage } from '@/pages/PlansPage';
import { PlanDetails } from '@/pages/PlanDetails';
import { ComparePage } from '@/pages/ComparePage';
import { BookingPage } from '@/pages/BookingPage';
import { MyTripsPage } from '@/pages/MyTripsPage';
import { DestinationsPage } from '@/pages/DestinationsPage';
import { MemoriesPage } from '@/pages/MemoriesPage';
import { ReviewsPage } from '@/pages/ReviewsPage';
import { ChatbotPage } from '@/pages/ChatbotPage';
import { ExploreReelsPage } from '@/pages/ExploreReelsPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { TravelCommunityPage } from '@/pages/TravelCommunityPage';
import { SubscriptionPage } from '@/pages/SubscriptionPage';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { Navbar, Footer } from '@/components/Layout';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}

function AppRoutes() {
  const route = useRouter();
  const path = route.path;

  // Auth pages (no shell)
  if (path === '/login') return <LoginPage />;
  if (path === '/signup') return <SignupPage />;

  // Protected pages (with shell + chatbot)
  return (
    <ProtectedRoute>
      <ShellWithChatbot>
        {renderPage(path, route.params)}
      </ShellWithChatbot>
    </ProtectedRoute>
  );
}

function renderPage(path: string, params: Record<string, string>): React.ReactNode {
  switch (path) {
    case '/dashboard': return <Dashboard />;
    case '/':
    case '/home': return <HomePage />;
    case '/planner': return <Planner />;
    case '/plans': return <PlansPage />;
    case '/plan-details': return <PlanDetails />;
    case '/compare': return <ComparePage />;
    case '/booking': return <BookingPage />;
    case '/my-trips': return <MyTripsPage />;
    case '/destinations': return <DestinationsPage />;
    case '/memories': return <MemoriesPage />;
    case '/reviews': return <ReviewsPage />;
    case '/chatbot': return <ChatbotPage />;
    case '/explore-reels': return <ExploreReelsPage />;
    case '/travel-community': return <TravelCommunityPage />;
    case '/subscription': return <SubscriptionPage />;
    case '/about': return <AboutPage />;
    case '/contact': return <ContactPage />;
    case '/profile': return <ProfilePage />;
    default: return <Dashboard />;
  }
}

function ShellWithChatbot({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
