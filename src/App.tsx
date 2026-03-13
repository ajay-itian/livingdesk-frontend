// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { Suspense, lazy } from "react";

// import Index from "./pages/Index";
// import NotFound from "./pages/NotFound";

// const Booking = lazy(() => import("./components/features/bookings/Booking"));
// const BlogsPage = lazy(() => import("./components/blogs/BlogsPage"));
// const Community = lazy(() => import("./components/Community"));
// const WifiCardApp = lazy(() => import("./components/utils/WifiCustomerPortal"));
// const VisitorSurveyForm = lazy(() => import("./components/utils/VisitorSurveyForm"));
// const ManagedOffices = lazy(() => import("./components/features/offices/ManagedOffices"));

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <BrowserRouter>
//         <Suspense fallback={<div>Loading...</div>}>
//           <Routes>
//             <Route path="/" element={<Index />} />
//             <Route path="/booking" element={<Booking />} />
//             <Route path="/blogs" element={<BlogsPage />} />
//             <Route path="/community" element={<Community />} />
//             <Route path="/survey" element={<VisitorSurveyForm />} />
//             <Route path="/wifi" element={<WifiCardApp />} />
//             <Route path="/visitor-survey" element={<VisitorSurveyForm />} />
//             <Route path="/managed-office-pune" element={<ManagedOffices />} />
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </Suspense>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;
// This file is unused. Routing is handled by Next.js via src/app/
export { };