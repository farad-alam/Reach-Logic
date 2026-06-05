"use client";

import Script from "next/script";

export default function TawkToChat() {
  // To make this work, replace "YOUR_PROPERTY_ID" and "YOUR_WIDGET_ID"
  // with the actual IDs from your free Tawk.to account.
  // 1. Go to tawk.to and create a free account
  // 2. Go to Administration (Gear Icon) > Chat Widget
  // 3. Copy the Direct Chat Link or Widget Code to find your Property ID and Widget ID
  // Example src: 'https://embed.tawk.to/65e5f.../1h...'

  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

  if (!propertyId || !widgetId || propertyId === "YOUR_PROPERTY_ID") {
    // Return null while the ID is not set, so we don't load a broken script
    return null;
  }

  return (
    <Script
      id="tawk-to"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/${propertyId}/${widgetId}';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
  );
}
