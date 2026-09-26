import Sidebar from "./Sidebar";
import MobileMenu from "./MobileMenu";


interface DashboardLayoutProps {
  children: React.ReactNode;
}


export default function DashboardLayout({

  children,

}: DashboardLayoutProps) {


  return (

    <div
      className="
        min-h-screen
        bg-[#F3F8F7]
      "
    >


      {/* Desktop Sidebar */}

      <Sidebar />



      {/* Mobile Menu */}

      <MobileMenu />





      {/* Main Content */}

      <main

        className="
          min-h-screen

          pt-16

          p-4

          md:ml-[240px]
          md:p-8
          md:pt-8
        "

      >

        {children}


      </main>


    </div>

  );

}