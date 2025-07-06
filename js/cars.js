// Car data
const cars = [
  {
    id: 'car_001',
    name: 'Maruti Swift',
    image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=600',
    price12hrs: 1200,
    price24hrs: 2000,
    description: 'Compact hatchback with great fuel efficiency and comfortable seating for 5.',
    category: 'economy',
    isActive: true,
    features: ['AC', 'Music System', 'Power Steering', 'Central Lock'],
    sunroof: false,
    withDriver: false
  },
  {
    id: 'car_002',
    name: 'Hyundai i20',
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=600',
    price12hrs: 1500,
    price24hrs: 2500,
    description: 'Premium hatchback with sporty looks and advanced features.',
    category: 'premium',
    sunroof: true,
    isActive: true,
    features: ['AC', 'Sunroof', 'Touchscreen', 'Bluetooth', 'Reverse Camera'],
    withDriver: false
  },
  {
    id: 'car_003',
    name: 'Toyota Fortuner',
    image: 'https://images.pexels.com/photos/35967/mini-cooper-auto-model-vehicle.jpg?auto=compress&cs=tinysrgb&w=600',
    price12hrs: 3500,
    price24hrs: 5000,
    description: 'Premium SUV with powerful engine and luxury features.',
    category: 'luxury',
    withDriver: true,
    isActive: true,
    features: ['AC', 'Leather Seats', 'GPS', 'Premium Sound', 'Driver Available'],
    sunroof: false
  },
  {
    id: 'car_004',
    name: 'Tata Nexon',
    image: 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=600',
    price12hrs: 1800,
    price24hrs: 2800,
    description: 'Safe and stylish compact SUV with panoramic sunroof.',
    category: 'premium',
    sunroof: true,
    isActive: true,
    features: ['AC', 'Sunroof', 'Touchscreen', 'Safety Features', 'Harman Audio'],
    withDriver: false
  },
  {
    id: 'car_005',
    name: 'Maruti Swift Dzire',
    image: 'https://images.pexels.com/photos/92851/pexels-photo-92851.jpeg?auto=compress&cs=tinysrgb&w=600',
    price12hrs: 1500,
    price24hrs: 2300,
    description: 'Popular compact sedan with excellent ride quality.',
    category: 'economy',
    isActive: true,
    features: ['AC', 'Music System', 'Power Steering', 'Central Lock', 'Airbags'],
    sunroof: false,
    withDriver: false
  }
];

// Function to get category color
function getCategoryColor(category) {
  switch(category) {
    case 'economy': return 'success';
    case 'premium': return 'primary';
    case 'luxury': return 'danger';
    default: return 'secondary';
  }
}

// Function to get category badge class
function getCategoryBadgeClass(category) {
  switch(category) {
    case 'economy': return 'badge-economy';
    case 'premium': return 'badge-premium';
    case 'luxury': return 'badge-luxury';
    default: return 'bg-secondary';
  }
}

// Function to render car card
function createCarCard(car) {
  const specialFeatures = [];
  if (car.sunroof) specialFeatures.push('<span class="feature-badge bg-info text-white">Sunroof</span>');
  if (car.withDriver) specialFeatures.push('<span class="feature-badge bg-warning text-dark">With Driver</span>');
  
  const featuresHtml = car.features.map(feature => 
    `<span class="feature-badge bg-light text-dark">${feature}</span>`
  ).join(' ');

  return `
    <div class="col-lg-4 col-md-6 mb-4">
      <div class="card car-card h-100">
        <div class="position-relative">
          <img src="${car.image}" class="card-img-top" alt="${car.name}" 
               onerror="this.onerror=null;this.src='https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=600'">
          <div class="position-absolute top-0 end-0 m-3">
            <span class="badge ${getCategoryBadgeClass(car.category)} text-capitalize">${car.category}</span>
          </div>
        </div>
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title mb-0">${car.name}</h5>
            <div class="text-end">
              <div class="d-flex align-items-center">
                <i class="fas fa-star text-warning me-1"></i>
                <small class="text-muted">4.5</small>
              </div>
            </div>
          </div>
          
          <p class="card-text text-muted mb-3">${car.description}</p>
          
          <div class="pricing-info mb-3">
            <div class="price-item">
              <i class="fas fa-clock text-muted me-2"></i>
              <span class="price-value">₹${car.price12hrs}</span>
              <span class="text-muted ms-1">/12 hours</span>
            </div>
            <div class="price-item">
              <i class="fas fa-calendar text-muted me-2"></i>
              <span class="price-value">₹${car.price24hrs}</span>
              <span class="text-muted ms-1">/24 hours</span>
            </div>
          </div>
          
          <div class="mb-3">
            ${specialFeatures.join(' ')}
            <span class="feature-badge bg-success text-white">
              <i class="fas fa-road me-1"></i>Unlimited KM
            </span>
          </div>
          
          <div class="mb-3">
            ${featuresHtml}
          </div>
          
          <div class="mt-auto">
            <button class="btn btn-primary w-100 book-btn" data-car-id="${car.id}">
              <i class="fas fa-calendar-check me-2"></i>Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Function to render cars by category
function renderCars() {
  const economyContainer = document.getElementById('economyCars');
  const premiumContainer = document.getElementById('premiumCars');
  const luxuryContainer = document.getElementById('luxuryCars');
  
  if (!economyContainer || !premiumContainer || !luxuryContainer) {
    console.error('Car containers not found');
    return;
  }

  const economyCars = cars.filter(car => car.category === 'economy' && car.isActive);
  const premiumCars = cars.filter(car => car.category === 'premium' && car.isActive);
  const luxuryCars = cars.filter(car => car.category === 'luxury' && car.isActive);

  economyContainer.innerHTML = economyCars.map(createCarCard).join('');
  premiumContainer.innerHTML = premiumCars.map(createCarCard).join('');
  luxuryContainer.innerHTML = luxuryCars.map(createCarCard).join('');

  // Add event listeners to book buttons
  document.querySelectorAll('.book-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const carId = this.getAttribute('data-car-id');
      const car = cars.find(c => c.id === carId);
      if (car) showBookingModal(car);
    });
  });
}

// Function to get car by ID
function getCarById(carId) {
  return cars.find(car => car.id === carId);
}
