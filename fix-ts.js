const fs = require('fs');

function fix(file, regex, replacer) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, replacer);
  fs.writeFileSync(file, content);
}

fix('src/app/api/portal/invoices/[id]/pay/route.ts', /clientId: invoice\.clientId \|\| undefined/g, 'clientId: invoice.clientId || ""');
fix('src/app/api/portal/invoices/[id]/pay/route.ts', /clientId: invoice\.clientId,/g, 'clientId: invoice.clientId || "",');
fix('src/app/api/portal/invoices/[id]/route.ts', /clientId: invoice\.clientId \|\| undefined/g, 'clientId: invoice.clientId || ""');
fix('src/app/api/portal/invoices/[id]/route.ts', /clientId: invoice\.clientId,/g, 'clientId: invoice.clientId || "",');
fix('src/app/api/portal/invoices/[id]/route.ts', /invoice\.client\?\.email/g, 'invoice.client?.email || ""');

fix('src/app/api/portal/orders/[id]/quote/route.ts', /clientId: order\.clientId \|\| undefined/g, 'clientId: order.clientId || ""');
fix('src/app/api/portal/orders/[id]/quote/route.ts', /clientId: order\.clientId,/g, 'clientId: order.clientId || "",');

fix('src/lib/notifications.ts', /invoice\.client\?\.email/g, 'invoice.client?.email || ""');
fix('src/lib/notifications.ts', /invoice\.clientId/g, '(invoice.clientId || "")');
fix('src/lib/notifications.ts', /invoice\.client\?\.fullName/g, 'invoice.client?.fullName || invoice.billingName');
fix('src/lib/notifications.ts', /invoice\.client\.email/g, 'invoice.client?.email || invoice.billingEmail || ""');
fix('src/lib/notifications.ts', /invoice\.client\.fullName/g, 'invoice.client?.fullName || invoice.billingName');

console.log('Fixed more ts errors.');
