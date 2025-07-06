// Main JavaScript file for index.html

document.addEventListener('DOMContentLoaded', function() {
  // Initialize Bootstrap components
  const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
  
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  
  if (startDateInput) {
    startDateInput.min = today;
    startDateInput.value = today;
  }
  if (endDateInput) {
    endDateInput.min = today;
    endDateInput.value = today;
  }

  // Event listeners
  setupEventListeners();
});

function setupEventListeners() {
  // Booking form event listeners
  const rentalOption = document.getElementById('rentalOption');
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  const confirmBookingBtn = document.getElementById('confirmBookingBtn');

  if (rentalOption) rentalOption.addEventListener('change', updateBookingSummary);
  if (startDate) startDate.addEventListener('change', handleStartDateChange);
  if (endDate) endDate.addEventListener('change', updateBookingSummary);
  if (applyCouponBtn) applyCouponBtn.addEventListener('click', applyCoupon);
  if (confirmBookingBtn) confirmBookingBtn.addEventListener('click', confirmBooking);
}

function showBookingModal(car) {
  selectedCar = car;
  appliedCoupon = null;
  
  // Update modal content
  document.getElementById('modalCarName').textContent = car.name;
  document.getElementById('price12hrs').textContent = car.price12hrs;
  document.getElementById('price24hrs').textContent = car.price24hrs;
  
  // Reset form
  document.getElementById('couponCode').value = '';
  document.getElementById('couponMessage').innerHTML = '';
  document.getElementById('phoneNumber').value = currentUser?.phone || '';
  
  // Show/hide sections based on auth state
  if (currentUser) {
    document.getElementById('loginRequired').style.display = 'none';
    document.getElementById('bookingForm').style.display = 'block';
    document.getElementById('confirmBookingBtn').style.display = 'block';
    updateBookingSummary();
  } else {
    document.getElementById('loginRequired').style.display = 'block';
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('confirmBookingBtn').style.display = 'none';
  }
  
  // Show modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
  if (modal) {
    modal.show();
  } else {
    new bootstrap.Modal(document.getElementById('bookingModal')).show();
  }
}

function handleStartDateChange() {
  const startDate = document.getElementById('startDate').value;
  const endDateInput = document.getElementById('endDate');
  
  if (startDate) {
    endDateInput.min = startDate;
    if (endDateInput.value < startDate) {
      endDateInput.value = startDate;
    }
  }
  
  updateBookingSummary();
}

function updateBookingSummary() {
  if (!selectedCar) return;
  
  const startDate = new Date(document.getElementById('startDate').value);
  const endDate = new Date(document.getElementById('endDate').value);
  const rentalOption = document.getElementById('rentalOption').value;
  
  if (isNaN(startDate.getTime())) return;
  
  // Calculate duration
  let totalDays = 1;
  if (!isNaN(endDate.getTime()) && endDate >= startDate) {
    totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  }
  
  // Auto-switch to 24hrs for multi-day bookings
  const effectiveOption = totalDays >= 2 ? '24hrs' : rentalOption;
  const autoSwitchNote = document.getElementById('autoSwitchNote');
  
  if (totalDays >= 2 && rentalOption === '12hrs') {
    document.getElementById('rentalOption').value = '24hrs';
    autoSwitchNote.style.display = 'block';
  } else {
    autoSwitchNote.style.display = 'none';
  }
  
  // Calculate pricing
  const pricePerDay = effectiveOption === '12hrs' ? selectedCar.price12hrs : selectedCar.price24hrs;
  const originalPrice = totalDays * pricePerDay;
  
  // Apply coupon discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (originalPrice * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }
  
  const finalPrice = Math.max(0, originalPrice - discountAmount);
  
  // Update UI
  const totalHours = totalDays * (effectiveOption === '12hrs' ? 12 : 24);
  document.getElementById('durationText').textContent = `${totalDays} days (${totalHours} hours)`;
  document.getElementById('originalPrice').textContent = `₹${originalPrice}`;
  document.getElementById('finalPrice').textContent = `₹${finalPrice}`;
  
  const discountRow = document.getElementById('discountRow');
  if (discountAmount > 0) {
    document.getElementById('discountAmount').textContent = `-₹${discountAmount}`;
    discountRow.style.display = 'flex';
  } else {
    discountRow.style.display = 'none';
  }
}

async function applyCoupon() {
  const couponCode = document.getElementById('couponCode').value.trim().toUpperCase();
  const couponMessage = document.getElementById('couponMessage');
  
  if (!couponCode) {
    couponMessage.innerHTML = '<small class="text-danger">Please enter a coupon code</small>';
    return;
  }
  
  try {
    // Query for the coupon
    const couponsQuery = db.collection('offers')
      .where('code', '==', couponCode)
      .where('isActive', '==', true);
    
    const couponsSnapshot = await couponsQuery.get();
    
    if (couponsSnapshot.empty) {
      couponMessage.innerHTML = '<small class="text-danger">Invalid coupon code</small>';
      appliedCoupon = null;
      updateBookingSummary();
      return;
    }
    
    const couponDoc = couponsSnapshot.docs[0];
    const coupon = { id: couponDoc.id, ...couponDoc.data() };
    
    // Check if coupon is still valid
    const validUntil = new Date(coupon.validUntil);
    const now = new Date();
    
    if (validUntil < now) {
      couponMessage.innerHTML = '<small class="text-danger">Coupon has expired</small>';
      appliedCoupon = null;
      updateBookingSummary();
      return;
    }
    
    appliedCoupon = coupon;
    couponMessage.innerHTML = `<small class="text-success"><i class="fas fa-check-circle me-1"></i>Coupon applied! ${coupon.name}</small>`;
    updateBookingSummary();
    
  } catch (error) {
    console.error('Error applying coupon:', error);
    couponMessage.innerHTML = '<small class="text-danger">Error applying coupon</small>';
  }
}

async function confirmBooking() {
  if (!selectedCar || !currentUser) {
    showAlert('Please login to complete booking', 'danger');
    return;
  }
  
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const phoneNumber = document.getElementById('phoneNumber').value.trim();
  
  if (!startDate || !phoneNumber) {
    showAlert('Please fill in all required fields', 'danger');
    return;
  }
  
  const confirmBtn = document.getElementById('confirmBookingBtn');
  const originalText = confirmBtn.innerHTML;
  showLoading(confirmBtn);
  
  try {
    // Calculate booking details
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const effectiveOption = totalDays >= 2 ? '24hrs' : document.getElementById('rentalOption').value;
    const pricePerDay = effectiveOption === '12hrs' ? selectedCar.price12hrs : selectedCar.price24hrs;
    const originalPrice = totalDays * pricePerDay;
    
    let discountAmount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        discountAmount = (originalPrice * appliedCoupon.discountValue) / 100;
      } else {
        discountAmount = appliedCoupon.discountValue;
      }
    }
    
    const finalPrice = Math.max(0, originalPrice - discountAmount);
    const bookingId = generateBookingId();
    
    // Create booking document
    const bookingData = {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.name,
      userPhone: phoneNumber,
      carId: selectedCar.id,
      carName: selectedCar.name,
      carImage: selectedCar.image,
      startDate,
      endDate,
      rentalOption: effectiveOption,
      totalDays,
      totalHours: totalDays * (effectiveOption === '12hrs' ? 12 : 24),
      originalPrice,
      discountAmount,
      finalPrice,
      couponCode: appliedCoupon?.code || '',
      status: 'pending_payment',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      bookingId
    };
    
    await db.collection('bookings').doc(bookingId).set(bookingData);
    
    // Hide modal and redirect to payment
    bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
    window.location.href = `payment.html?bookingId=${bookingId}`;
    
  } catch (error) {
    console.error('Error creating booking:', error);
    showAlert('Error creating booking. Please try again.', 'danger');
  } finally {
    hideLoading(confirmBtn, originalText);
  }
}
