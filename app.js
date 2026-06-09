/**
 * Kisaan Konnect Client-Side SPA Core Architecture Engine
 * Connects Live Token Arrays with Mock Gemini Vision-AI Pipelining Modules
 */

let mockListings = [
    {
        id: "KK-401",
        cropType: "Rice Straw",
        quantity: 5,
        price: 2200,
        state: "Assam",
        district: "Silchar, Cachar District",
        farmerName: "Anant Hazarika",
        isVerified: true,
        distance: "2.4 km away",
        activeDays: 1,
        imageUrl: "Rice_straw.jpg"
    },
    {
        id: "KK-101",
        cropType: "Rice Straw",
        quantity: 20,
        price: 3500,
        state: "Punjab",
        district: "Patiala, Nabha Block",
        farmerName: "Gurbaksh Singh",
        isVerified: true,
        distance: "12 km away",
        activeDays: 2,
        imageUrl: "Rice_straw.jpg"
    },
    {
        id: "KK-102",
        cropType: "Wheat Stubble",
        quantity: 15,
        price: 3000,
        state: "Haryana",
        district: "Karnal, Gharaunda",
        farmerName: "Harpreet Singh",
        isVerified: true,
        distance: "34 km away",
        activeDays: 3,
        imageUrl: "wheat_stubble.jpg"
    },
    {
        id: "KK-103",
        cropType: "Sugarcane Leaves",
        quantity: 12,
        price: 2800,
        state: "Uttar Pradesh",
        district: "Meerut, Mawana",
        farmerName: "Deepak Yadav",
        isVerified: false,
        distance: "48 km away",
        activeDays: 5,
        imageUrl: "sugarcane_leaves.webp"
    }
];

let currentUser = null; 
let currentSelectedRole = "farmer"; 
let tempUploadedResidue = null; 

document.addEventListener("DOMContentLoaded", () => {
    renderListingsGrid(mockListings);
    populateMockPins();
});

// Single Page Router Logic
function showPage(pageId) {
    document.querySelectorAll(".page-view").forEach(view => {
        view.classList.remove("active");
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add("active");
        window.scrollTo(0, 0);
    }
}

function handleHomeSearch() {
    const query = document.getElementById("home-search-input").value.toLowerCase().trim();
    showPage("marketplace");
    if(query) {
        if(["punjab", "haryana", "uttar pradesh", "assam"].includes(query)) {
            document.getElementById("filter-state").value = query.charAt(0).toUpperCase() + query.slice(1);
        } else if(["rice", "wheat", "sugarcane", "husk", "stalks"].includes(query)) {
            if(query === "rice") document.getElementById("filter-crop").value = "Rice Straw";
            if(query === "wheat") document.getElementById("filter-crop").value = "Wheat Stubble";
            if(query === "sugarcane") document.getElementById("filter-crop").value = "Sugarcane Leaves";
            if(query === "husk") document.getElementById("filter-crop").value = "Husk";
            if(query === "stalks") document.getElementById("filter-crop").value = "Stalks";
        }
        applyMarketplaceFilters();
    }
}

// User Context and Verification Handlers
function setAuthRole(role) {
    currentSelectedRole = role;
    const farmerBtn = document.getElementById("toggle-farmer");
    const buyerBtn = document.getElementById("toggle-buyer");
    const indGroup = document.getElementById("industry-type-group");
    const submitBtn = document.getElementById("auth-submit-btn");

    if (role === "farmer") {
        farmerBtn.classList.add("active");
        buyerBtn.classList.remove("active");
        indGroup.classList.add("hidden");
        submitBtn.innerHTML = `Login as Farmer <i class="fa-solid fa-arrow-right"></i>`;
    } else {
        buyerBtn.classList.add("active");
        farmerBtn.classList.remove("active");
        indGroup.classList.remove("hidden");
        submitBtn.innerHTML = `Login as Buyer <i class="fa-solid fa-arrow-right"></i>`;
    }
}

function handleAuthSubmit(event) {
    event.preventDefault();
    const nameVal = document.getElementById("auth-name").value;
    
    currentUser = {
        name: nameVal,
        role: currentSelectedRole,
        credits: 450,
        divertedTons: 3.2
    };

    document.getElementById("auth-nav-btn").innerText = `Logout (${nameVal.split(' ')[0]})`;
    document.getElementById("auth-nav-btn").onclick = logoutUser;

    if (currentUser.role === "farmer") {
        document.getElementById("farmer-dash-link").classList.remove("hidden");
        document.getElementById("buyer-dash-link").classList.add("hidden");
        document.getElementById("dash-farmer-name").innerText = currentUser.name;
        syncFarmerDashboardInventory();
        showPage("farmer-dashboard");
    } else {
        document.getElementById("buyer-dash-link").classList.remove("hidden");
        document.getElementById("farmer-dash-link").classList.add("hidden");
        document.getElementById("dash-buyer-name").innerText = currentUser.name;
        showPage("buyer-dashboard");
    }
}

function logoutUser() {
    currentUser = null;
    document.getElementById("auth-nav-btn").innerText = "Login / Register";
    document.getElementById("auth-nav-btn").onclick = () => showPage('login');
    document.getElementById("farmer-dash-link").classList.add("hidden");
    document.getElementById("buyer-dash-link").classList.add("hidden");
    showPage("homepage");
}

function updatePriceLabel(val) {
    document.getElementById("price-limit-lbl").innerText = `Up to ₹${parseInt(val).toLocaleString('en-IN')}/Ton`;
}

function renderListingsGrid(dataArray) {
    const wrapper = document.getElementById("listings-grid-wrapper");
    wrapper.innerHTML = "";

    if(dataArray.length === 0) {
        wrapper.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: var(--text-muted);">No listings match the current filters.</div>`;
        return;
    }

    dataArray.forEach(item => {
        const card = document.createElement("div");
        card.className = "listing-card";
        card.innerHTML = `
            <div class="card-image-box">
                <img src="${item.imageUrl}" alt="${item.cropType}" onerror="this.src='https://placehold.co/400x250?text=Crop+Residue+Image'">
                <span class="badge-distance">${item.distance}</span>
            </div>
            <div class="card-body">
                <h4>${item.cropType}</h4>
                <div class="meta-row-txt"><i class="fa-solid fa-location-dot"></i> ${item.district}, ${item.state}</div>
                <div class="meta-row-txt"><i class="fa-solid fa-scale-balanced"></i> Volume Available: <strong>${item.quantity} Tons</strong></div>
                <div class="meta-row-txt"><i class="fa-solid fa-clock"></i> Active inside last 7 days</div>
                <div class="card-price-line">₹${item.price.toLocaleString('en-IN')} <span style="font-size:0.8rem; font-weight:400; color:var(--text-muted);">/ Ton</span></div>
                <button class="btn-card-action" onclick="renderDetailedListing('${item.id}')">View Details</button>
            </div>
        `;
        wrapper.appendChild(card);
    });
}

function applyMarketplaceFilters() {
    const crop = document.getElementById("filter-crop").value;
    const state = document.getElementById("filter-state").value;
    const maxPrice = parseFloat(document.getElementById("filter-price").value);
    const minQty = parseFloat(document.getElementById("filter-quantity").value) || 0;

    const filtered = mockListings.filter(item => {
        if (crop !== "all" && item.cropType !== crop) return false;
        if (state !== "all" && item.state !== state) return false;
        if (item.price > maxPrice) return false;
        if (item.quantity < minQty) return false;
        return true;
    });

    renderListingsGrid(filtered);
}

function resetFilters() {
    document.getElementById("filter-crop").value = "all";
    document.getElementById("filter-state").value = "all";
    document.getElementById("filter-price").value = 5000;
    document.getElementById("filter-quantity").value = "";
    updatePriceLabel(5000);
    renderListingsGrid(mockListings);
}

function toggleLayout(type) {
    const gridView = document.getElementById("listings-grid-wrapper");
    const mapView = document.getElementById("listings-map-wrapper");
    const btnCard = document.getElementById("btn-view-card");
    const btnMap = document.getElementById("btn-view-map");

    if(type === 'grid') {
        gridView.classList.remove("hidden");
        mapView.classList.add("hidden");
        btnCard.classList.add("active");
        btnMap.classList.remove("active");
    } else {
        gridView.classList.add("hidden");
        mapView.classList.remove("hidden");
        btnCard.classList.remove("active");
        btnMap.classList.add("active");
    }
}

function populateMockPins() {
    const container = document.getElementById("mock-map-pins-container");
    container.innerHTML = "";
    for(let i=0; i<6; i++) {
        const pin = document.createElement("div");
        pin.className = "map-pin";
        pin.style.top = `${Math.floor(Math.random() * 60) + 20}%`;
        pin.style.left = `${Math.floor(Math.random() * 70) + 15}%`;
        container.appendChild(pin);
    }
}

function renderDetailedListing(id) {
    const item = mockListings.find(x => x.id === id);
    if(!item) return;

    const targetDiv = document.getElementById("detailed-item-injector");
    targetDiv.innerHTML = `
        <div class="detail-gallery">
            <img src="${item.imageUrl}" alt="Residue Core asset Image" onerror="this.src='https://placehold.co/600x400?text=Residue+Visual'">
        </div>
        <div class="detail-info">
            <span class="badge-verified"><i class="fa-solid fa-user-shield"></i> Verified Badge (Aadhaar / Land linked)</span>
            <h2>${item.cropType} Asset</h2>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;"><i class="fa-solid fa-location-dot"></i> Approx Location: ${item.district}, ${item.state}</p>
            
            <div style="background:#171917; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border:1px solid var(--border-grey)">
                <span style="font-size:0.85rem; color: var(--text-muted);">Farmer's Name</span>
                <h4 style="font-size:1.1rem; color: #fff; margin-top:0.25rem;">${item.farmerName}</h4>
            </div>

            <div class="detail-fields-grid">
                <div class="df-node"><strong>Quantity Available</strong><span>${item.quantity} Metric Tons</span></div>
                <div class="df-node"><strong>Asking Price</strong><span>₹${item.price.toLocaleString('en-IN')} / Ton</span></div>
                <div class="df-node"><strong>Preferred Pickup Method</strong><span>Buyer Truck Logistics</span></div>
                <div class="df-node"><strong>Platform Verification</strong><span>Identity Match [Aadhaar Checked]</span></div>
            </div>

            <button class="btn-contact-action" onclick="alert('Contacting Farmer and drafting transaction proposal context...')">
                Contact Farmer / Make an Offer
            </button>
        </div>
    `;
    showPage("listing-detail");
}

function switchDashSubView(type) {
    document.querySelectorAll(".dash-tab-btn").forEach((btn, index) => {
        btn.classList.toggle("active", (type === 'post' && index === 0) || (type === 'manage' && index === 1));
    });
    document.getElementById("dash-subview-post").classList.toggle("active", type === 'post');
    document.getElementById("dash-subview-manage").classList.toggle("active", type === 'manage');
}

function simulatePhotoSelection() {
    document.getElementById("hidden-file-input").click();
}

function handlePhotoAttached() {
    document.getElementById("upload-status-text").innerHTML = `<i class="fa-solid fa-circle-check text-green"></i> Photo attached safely. Ready to invoke Gemini AI API.`;
    document.getElementById("btn-submit-analysis").removeAttribute("disabled");
    document.getElementById("step-1").classList.remove("active");
    document.getElementById("step-2").classList.add("active");
}

// GEMINI API IMAGE INTERPRETATION MODEL LOOP (REAL-TIME ANALYSIS RECOMMENDATION ENGINE SIMULATOR)
function triggerAIAnalysis(event) {
    event.preventDefault();
    const cropInput = document.getElementById("upload-crop").value;
    const qtyInput = parseFloat(document.getElementById("upload-qty").value);
    const stateInput = document.getElementById("upload-state").value;
    const addrInput = document.getElementById("upload-address").value;
    const customPrice = parseFloat(document.getElementById("upload-price-manual").value) || 2000;

    document.getElementById("btn-submit-analysis").innerHTML = `Invoking Gemini AI API Parsing Engine... <i class="fa-solid fa-spinner fa-spin"></i>`;

    setTimeout(() => {
        let basePrice = customPrice || 2200;
        let industries = ["Biomass power plants", "Compost producers"];
        
        if (cropInput === "Rice Straw") {
            industries = ["Biomass power plants", "Mushroom growers", "Paper industries", "Cattle feed manufacturers", "Biofuel companies"];
        } else if (cropInput === "Wheat Stubble") {
            industries = ["Paper industries", "Cattle feed manufacturers", "Compost producers"];
        } else if (cropInput === "Sugarcane Leaves") {
            industries = ["Biofuel companies", "Biomass power plants"];
        }

        const calculatedCO2 = (qtyInput * 1.1).toFixed(1);

        document.getElementById("ai-out-type").innerText = cropInput;
        document.getElementById("ai-out-price").innerText = `₹${(basePrice - 200).toLocaleString('en-IN')} – ₹${(basePrice + 200).toLocaleString('en-IN')} / Ton`;
        document.getElementById("ai-out-co2").innerText = `CO₂ Saved: ~${calculatedCO2} Tons Avoided`;
        document.getElementById("ai-out-credits").innerText = `You Earn: ₹${(qtyInput * basePrice).toLocaleString('en-IN')}`;
        
        const tagRow = document.getElementById("ai-out-industries");
        tagRow.innerHTML = "";
        industries.forEach(ind => {
            const span = document.createElement("span");
            span.innerText = ind;
            tagRow.appendChild(span);
        });

        tempUploadedResidue = {
            cropType: cropInput,
            quantity: qtyInput,
            price: basePrice,
            state: stateInput,
            district: addrInput,
            co2Saved: parseFloat(calculatedCO2)
        };

        document.getElementById("gemini-ai-modal").classList.remove("hidden");
        document.getElementById("btn-submit-analysis").innerHTML = `Analyze with Gemini AI API <i class="fa-solid fa-sparkles"></i>`;
        document.getElementById("step-2").classList.remove("active");
        document.getElementById("step-3").classList.add("active");
    }, 1200);
}

function abortAISchematic() {
    document.getElementById("gemini-ai-modal").classList.add("hidden");
    document.getElementById("residue-upload-form").reset();
    document.getElementById("upload-status-text").innerText = "Take photo or upload via Camera / Gallery systems";
    document.getElementById("btn-submit-analysis").setAttribute("disabled", "true");
    document.getElementById("step-3").classList.remove("active");
    document.getElementById("step-1").classList.add("active");
    tempUploadedResidue = null;
}

function commitAISuggestionsToMarket() {
    if(!tempUploadedResidue) return;

    const newListingId = `KK-${Math.floor(Math.random() * 9000) + 1000}`;
    const finalizedAssetRecord = {
        id: newListingId,
        cropType: tempUploadedResidue.cropType,
        quantity: tempUploadedResidue.quantity,
        price: tempUploadedResidue.price,
        state: tempUploadedResidue.state,
        district: tempUploadedResidue.district,
        farmerName: currentUser ? currentUser.name : "Anant Hazarika",
        isVerified: true,
        distance: "Nearest",
        activeDays: 0,
        imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600"
    };

    mockListings.unshift(finalizedAssetRecord);
    
    // Reward farmers with Green Credits across profile frameworks visible at every touchpoint
    if (currentUser) {
        currentUser.credits += 150; // Biggest reward milestone modifier for reducing stubble burning
        currentUser.divertedTons += parseFloat(tempUploadedResidue.quantity);
        
        document.getElementById("dash-credit-balance").innerText = currentUser.credits;
        document.getElementById("dash-ton-diverted").innerText = currentUser.divertedTons.toFixed(1);
        document.getElementById("stat-diverted").innerText = `${currentUser.divertedTons.toFixed(1)} Tons`;
    }

    applyMarketplaceFilters();
    syncFarmerDashboardInventory();

    alert(`Residue Listing successfully injected onto the marketplace feed under reference index: ${newListingId}. Your active wallet has been awarded +150 Green Credits for reducing stubble burning.`);
    
    abortAISchematic();
    switchDashSubView('manage');
}

function syncFarmerDashboardInventory() {
    const tableBody = document.getElementById("farmer-active-listings-table");
    tableBody.innerHTML = "";

    const activeUser = currentUser ? currentUser.name : "Anant Hazarika";
    const userOwnedInventories = mockListings.filter(x => x.farmerName === activeUser);

    userOwnedInventories.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>#${item.id}</strong></td>
            <td>${item.cropType}</td>
            <td>${item.quantity} Tons</td>
            <td>₹${item.price.toLocaleString('en-IN')}/Ton</td>
            <td><span class="badge-status active">Active Feed</span></td>
            <td><button class="btn-table-action" onclick="settleListingTransaction('${item.id}')">Mark as Sold</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function settleListingTransaction(id) {
    mockListings = mockListings.filter(x => x.id !== id);
    
    if(currentUser) {
        currentUser.credits += 300; // Milestone payout for completing a buyer transaction match loop
        document.getElementById("dash-credit-balance").innerText = currentUser.credits;
    }

    applyMarketplaceFilters();
    syncFarmerDashboardInventory();
    
    alert(`Asset tracking completed. Transaction closed out successfully. Partner tie-up discount codes unlocked via additional +300 Green Credits.`);
}
// Configuration state vectors matching your exact requirements
const locations = {
    "Assam": [26.1445, 91.7362],
    "Punjab": [31.1471, 75.3412],
    "Haryana": [29.0588, 76.0856],
    "Uttar Pradesh": [26.8467, 80.9462]
};

let mapEngineInstance = null;
let activeMarkerInstance = null;

function toggleLayout(type) {
    const gridView = document.getElementById("listings-grid-wrapper");
    const mapView = document.getElementById("listings-map-wrapper");
    const btnCard = document.getElementById("btn-view-card");
    const btnMap = document.getElementById("btn-view-map");

    if (type === 'grid') {
        gridView.classList.remove("hidden");
        mapView.classList.add("hidden");
        if(btnCard) btnCard.classList.add("active");
        if(btnMap) btnMap.classList.remove("active");
    } else {
        gridView.classList.add("hidden");
        mapView.classList.remove("hidden");
        if(btnCard) btnCard.classList.remove("active");
        if(btnMap) btnMap.classList.add("active");

        // Initialize map engine safely targeting your update element id='map'
        if (!mapEngineInstance) {
            // Default center focal view on Assam
            mapEngineInstance = L.map('map').setView([26.1445, 91.7362], 6);

            // Use beautiful dark-theme map styles matching your layout style
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(mapEngineInstance);

            // Create tracking pointer marker
            activeMarkerInstance = L.marker([26.1445, 91.7362])
                .addTo(mapEngineInstance)
                .bindPopup("<b>Assam Hub Active</b><br>Filter by state to find nearby crop residue listings.")
                .openPopup();

            // Set up state change tracking event observer
            const filterDropdown = document.getElementById("filter-state");
            if (filterDropdown) {
                filterDropdown.addEventListener("change", function () {
                    const selectedState = this.value;

                    if (locations[selectedState]) {
                        const coords = locations[selectedState];

                        mapEngineInstance.setView(coords, 7);

                        activeMarkerInstance.setLatLng(coords)
                            .bindPopup(`<b>${selectedState} Residue Listings</b><br>Live view updated.`)
                            .openPopup();
                    }
                });
            }
        }

        // CRITICAL FIX: Forces the browser to recalculate dimensions instantly as soon as hidden class drops
        setTimeout(() => {
            if (mapEngineInstance) {
                mapEngineInstance.invalidateSize();
            }
        }, 50);
    }
}