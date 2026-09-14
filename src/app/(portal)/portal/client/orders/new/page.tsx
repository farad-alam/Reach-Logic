// src/app/(portal)/portal/client/orders/new/page.tsx
import NewOrderForm from "./NewOrderForm";

export const metadata = { title: "New Order" };

export default function NewOrderPage() {
  return (
    <div className="portal-page" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Start a New Project</h1>
          <p className="page-header-sub">Provide the details below, and we'll review it and provide a quote.</p>
        </div>
      </div>
      <div className="card">
        <NewOrderForm />
      </div>
    </div>
  );
}
