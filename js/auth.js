// Authentication functions
function checkAuthState() {
  auth.onAuthStateChanged(async (user) => {
    currentUser = null;
    
    if (user) {
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          currentUser = { uid: user.uid, ...userDoc.data() };
          updateNavigation(true);
        } else {
          updateNavigation(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        updateNavigation(false);
      }
    } else {
      updateNavigation(false);
    }
    
    // Render cars after auth state is determined
    renderCars();
  });
}

function updateNavigation(isLoggedIn) {
  const loginLink = document.getElementById('loginLink');
  const profileNavItem = document.getElementById('profileNavItem');
  const bookingsNavItem = document.getElementById('bookingsNavItem');
  const adminNavItem = document.getElementById('adminNavItem');
  
  if (isLoggedIn && currentUser) {
    loginLink.textContent = 'Logout';
    loginLink.href = '#';
    loginLink.onclick = handleLogout;
    
    if (profileNavItem) profileNavItem.style.display = 'block';
    if (bookingsNavItem) bookingsNavItem.style.display = 'block';
    
    // Show admin link only for admin users
    if (adminNavItem && currentUser.role === 'admin') {
      adminNavItem.style.display = 'block';
    }
  } else {
    loginLink.textContent = 'Login';
    loginLink.href = 'login.html';
    loginLink.onclick = null;
    
    if (profileNavItem) profileNavItem.style.display = 'none';
    if (bookingsNavItem) bookingsNavItem.style.display = 'none';
    if (adminNavItem) adminNavItem.style.display = 'none';
  }
}

async function handleLogout() {
  try {
    await auth.signOut();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error signing out:', error);
    showAlert('Error signing out. Please try again.', 'danger');
  }
}

// Login function
async function loginUser(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// Register function
async function registerUser(userData) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(userData.email, userData.password);
    const user = userCredential.user;

    // Create user document in Firestore
    await db.collection('users').doc(user.uid).set({
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      driverLicense: userData.driverLicense || '',
      role: 'user',
      isActive: true,
      isBlocked: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

// Initialize auth state checking
document.addEventListener('DOMContentLoaded', function() {
  checkAuthState();
});
