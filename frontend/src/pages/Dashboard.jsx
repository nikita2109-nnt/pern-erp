
import { useState } from "react";
import Customers from "./Customers";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  ShoppingCart,
  Package,
  Truck,
  LogOut
} from "lucide-react";
import "./Dashboard.css";
import Enquiries from "./Enquiries";
import Quotations from "./Quotations";
import SalesOrders from "./SalesOrders";
import Inventory from "./Inventory";
import Dispatch from "./Dispatch";

function Dashboard() {
  const [activePage, setActivePage] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Customers", icon: Users },
    { name: "Enquiries", icon: ClipboardList },
    { name: "Quotations", icon: FileText },
    { name: "Sales Orders", icon: ShoppingCart },
    { name: "Inventory", icon: Package },
    { name: "Dispatch", icon: Truck }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="erp-layout">
      <aside className="erp-sidebar">
        <h2>PERN ERP</h2>

        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={
                  activePage === item.name ? "menu-item active" : "menu-item"
                }
                onClick={() => setActivePage(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={19} />
          Logout
        </button>
      </aside>

      <main className="erp-main">
        <header className="erp-header">
          <h1>{activePage}</h1>
          <span>ERP Management System</span>
        </header>

        <section className="erp-content">
          {activePage === "Dashboard" ? (
            <>
              <h2>Welcome to your ERP Dashboard</h2>
              <p>Manage your business operations from one place.</p>

              <div className="dashboard-cards">
                <div className="dashboard-card">
                  <Users size={28} />
                  <h3>Customers</h3>
                  <p>Manage customer records</p>
                </div>

                <div className="dashboard-card">
                  <ClipboardList size={28} />
                  <h3>Enquiries</h3>
                  <p>Track customer enquiries</p>
                </div>

                <div className="dashboard-card">
                  <ShoppingCart size={28} />
                  <h3>Sales Orders</h3>
                  <p>Manage confirmed orders</p>
                </div>

                <div className="dashboard-card">
                  <Package size={28} />
                  <h3>Inventory</h3>
                  <p>Monitor product stock</p>
                </div>
              </div>
            </>
          ) : activePage === "Customers" ? (
  <Customers />
) : activePage === "Enquiries" ? (
  <Enquiries />
) : activePage === "Quotations" ? (
  <Quotations 
  
  /> ) : activePage === "Sales Orders" ? (
  <SalesOrders />
) : activePage === "Inventory" ? (
  <Inventory />
) : activePage === "Dispatch" ? (
  <Dispatch />
) : (
  <div className="page-placeholder">
    <h2>{activePage}</h2>
    <p>We'll build this module next.</p>
  </div>
)}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;