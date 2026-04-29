import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppFAB from "./WhatsAppFAB";
import ScrollToTopButton from "./ScrollToTopButton";
import DentalChatbot from "./DentalChatbot";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFAB />
      <DentalChatbot />
      <ScrollToTopButton />
    </div>
  );
};

export default Layout;
