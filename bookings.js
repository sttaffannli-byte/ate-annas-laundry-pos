<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#0f172a">
  <title>Book Laundry Pickup & Delivery</title>
  <link rel="stylesheet" href="/booking.css">
</head>
<body>
  <main class="booking-shell">
    <header class="hero">
      <div class="logo">AA</div>
      <div>
        <span class="eyebrow">ONLINE LAUNDRY BOOKING</span>
        <h1 id="bookingStoreName">ATE ANNAS LAUNDRY</h1>
        <p>Schedule your laundry pickup or delivery in a few taps.</p>
      </div>
      <div id="customerNetwork" class="customer-network online"><i></i><b>ONLINE</b></div>
    </header>

    <section class="steps">
      <span class="active">1. Details</span><span>2. Service</span><span>3. Confirm</span>
    </section>

    
    <section class="booking-card service-shop">
      <div class="section-heading">
        <div>
          <span class="eyebrow">STEP 1</span>
          <h2>Piliin ang Laundry Service</h2>
          <p>Pindutin ang service card para automatic na maidagdag sa cart.</p>
        </div>
        <div class="cart-badge">🛒 <span id="cartCount">0</span></div>
      </div>

      <div id="onlineServiceGrid" class="online-service-grid"></div>

      <div class="online-cart-panel">
        <div class="online-cart-header">
          <div>
            <span class="eyebrow">YOUR CART</span>
            <h3>Napiling Services</h3>
          </div>
          <button id="clearOnlineCartBtn" type="button" class="ghost-btn">Clear Cart</button>
        </div>
        <div id="onlineCartItems" class="online-cart-items"></div>
        <div class="online-cart-summary">
          <div><span>Items</span><b id="onlineCartQty">0</b></div>
          <div><span>Estimated Total</span><b id="onlineCartTotal">₱0.00</b></div>
        </div>
      </div>
    </section>

    <form id="bookingForm">
      <section class="card">
        <h2>Your Information</h2>
        <div class="grid">
          <label>Full name<input id="bName" required autocomplete="name"></label>
          <label>Mobile number<input id="bMobile" required inputmode="tel" autocomplete="tel"></label>
          <label class="full">Complete address<textarea id="bAddress" required autocomplete="street-address" placeholder="House no., street, barangay, city, landmark"></textarea></label>
        </div>
      </section>

      <section class="card">
        <h2>Pickup & Delivery</h2>
        <div class="choice-grid">
          <label class="choice"><input type="radio" name="type" value="Pickup" checked><span>🚚 Pickup Only<small>We collect your laundry.</small></span></label>
          <label class="choice"><input type="radio" name="type" value="Delivery"><span>📦 Delivery Only<small>For existing ready orders.</small></span></label>
          <label class="choice"><input type="radio" name="type" value="Pickup & Delivery"><span>🔄 Pickup & Delivery<small>Complete door-to-door service.</small></span></label>
        </div>
        <div class="grid">
          <label>Preferred date<input id="bDate" type="date" required></label>
          <label>Preferred time<select id="bTime"><option>8:00 AM - 10:00 AM</option><option>10:00 AM - 12:00 PM</option><option>1:00 PM - 3:00 PM</option><option>3:00 PM - 5:00 PM</option><option>5:00 PM - 7:00 PM</option></select></label>
        </div>
      </section>

      <section class="card">
        <h2>Laundry Service</h2>
        <div id="publicServices" class="public-services"></div>
        <div class="grid">
          <label>Estimated weight / quantity<input id="bQty" type="number" min="1" step="0.5" value="4"></label>
          <label>Promo code<input id="bPromo" placeholder="Optional"></label>
          <label class="full">Special instructions<textarea id="bNotes" placeholder="Stains, delicate items, separate whites, gate instructions..."></textarea></label>
        </div>
      </section>

      <section class="card summary">
        <h2>Booking Summary</h2>
        <div><span>Selected service</span><b id="summaryService">—</b></div>
        <div><span>Estimated service amount</span><b id="summaryAmount">₱0.00</b></div>
        <div><span>Minimum pickup</span><b id="summaryMinimum">₱0.00</b></div>
        <p id="bookingAreaText"></p>
        <label class="agree"><input id="bAgree" type="checkbox" required> I understand that the final amount will be confirmed after actual weighing and inspection.</label>
        <button class="submit" type="submit">SEND BOOKING REQUEST</button>
      </section>
          <input id="cartData" name="cartData" type="hidden">
    </form>

    <dialog id="successDialog">
      <div class="success-icon">✓</div>
      <h2>Booking Request Ready</h2>
      <p>Your request code is:</p>
      <strong id="requestCode"></strong>
      <p>Tap below to send the request to ATE ANNAS through WhatsApp.</p>
      <button id="sendWhatsappBtn">SEND TO WHATSAPP</button>
      <button id="closeSuccessBtn" class="secondary">Close</button>
    </dialog>
  
    <footer class="booking-legal-footer">
      <div>© 2026 ATE ANNAS LAUNDRY. ALL RIGHTS RESERVED.</div>
      <div>DEVELOPED BY <strong>JIMBOYLAUDE.LLC.INFO</strong></div>
      <div><a href="/terms.html">Terms & Conditions</a> · <a href="/privacy-cookies.html">Privacy & Cookies</a></div>
    </footer>
    <div id="cookieBanner" class="cookie-banner hidden">
      <div>
        <b>Cookie Notice</b>
        <p>We use essential browser storage for booking details and site operation. We do not use optional advertising cookies.</p>
        <a href="/privacy-cookies.html">Read policy</a>
      </div>
      <div class="cookie-actions">
        <button id="rejectCookiesBtn" type="button">Essential Only</button>
        <button id="acceptCookiesBtn" type="button">Accept</button>
      </div>
    </div>

  </main>
  <script src="/booking.js"></script>

    <div class="fixed-copyright-bar">
      <span>© 2026 ATE ANNAS LAUNDRY. ALL RIGHTS RESERVED.</span>
      <span>DEVELOPED BY <strong>JIMBOYLAUDE.LLC.INFO</strong></span>
      <span><a href="/terms.html">TERMS</a> · <a href="/privacy-cookies.html">PRIVACY & COOKIES</a></span>
    </div>

</body>
</html>
