// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJKgz1fONteZPPD5T9bcIVjw3-iBUZyro",
  authDomain: "gopandacars-7085f.firebaseapp.com",
  projectId: "gopandacars-7085f",
  storageBucket: "gopandacars-7085f.appspot.com",
  messagingSenderId: "486383420605",
  appId: "1:486383420605:web:your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Global variables
let currentUser = null;
let selectedCar = null;
let appliedCoupon = null;

// Utility functions
function showLoading(element) {
  element.innerHTML = '<div class="loading-spinner"></div>';
  element.disabled = true;
}

function hideLoading(element, originalText) {
  element.innerHTML = originalText;
  element.disabled = false;
}

function showAlert(message, type = 'info', containerId = 'alertContainer') {
  const alertContainer = document.getElementById(containerId);
  if (!alertContainer) return;
  
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  alertContainer.appendChild(alertDiv);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function generateBookingId() {
  return 'BOOK-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Payment details
const paymentDetails = {
  accountNumber: '1234567890',
  ifsc: 'SBIN0001234',
  beneficiaryName: 'GoPanda Cars',
  bankName: 'State Bank of India',
  branch: 'Guntur Main Branch'
};
