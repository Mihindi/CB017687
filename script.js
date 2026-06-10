// COMMON ACROSS ALL PAGES
// hamburger menu toggle
const hamMenuICON = document.querySelector('.ham-menu');
const offScreenMenuOVERLAY = document.querySelector('.off-screen-menu');

hamMenuICON.addEventListener('click', () => {
    hamMenuICON.classList.toggle('active');
    offScreenMenuOVERLAY.classList.toggle('active');
});

// Newsletter form
const newsletterFormFORM = document.getElementById("newsletter-form");

if (newsletterFormFORM) {
    newsletterFormFORM.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const email = document.getElementById("nlf-email").value.trim();
        const errorEl = document.getElementById("nlf-error");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            errorEl.innerText = "Please enter your email address.";
            return;
        }
        if (!emailRegex.test(email)) {
            errorEl.innerText = "Please enter a valid email address.";
            return;
        }

        errorEl.innerText = "";
        localStorage.setItem("newsletterEmail", email);
        newsletterFormFORM.innerHTML = '<h2 id="nlf-ty">Thanks for subscribing!</h2>';
    });
}

// fetching data from json once
fetch('destinations.json')
    .then(res => res.json())
    .then(destinations => {

        const HIGHLIGHTS = ["Bali", "Kyoto", "Marrakech", "Santorini",
                            "Machu Picchu", "Amalfi Coast", "Cappadocia", "Banff"];
        const highlights = destinations.filter(d => HIGHLIGHTS.includes(d.name));

        // 1. HOME PAGE - Auto rotating destination highlights
        let i = 0;

        const heroImageIMG = document.getElementById("hero-image");
        const heroNameTXT = document.getElementById("hero-name");
        const heroDescriptionTXT = document.getElementById("hero-description");

        function rotateHeroFn() {
            const highlight = highlights[i];
            heroImageIMG.src = highlight.image;
            heroImageIMG.alt = highlight.name;
            heroNameTXT.innerText = highlight.name;
            heroDescriptionTXT.innerText = highlight.description;
            i = (i + 1) % highlights.length;
        }

        if (heroImageIMG) {
            rotateHeroFn();
            setInterval(rotateHeroFn, 10000);
        }

        // 1. HOME PAGE - Destination of the day
        const dotdNameTXT = document.getElementById("dotd-name");
        const dotdTypeTXT = document.getElementById("dotd-type");
        const dotdImgIMG = document.getElementById("dotd-img");
        const dotdExploreBTN = document.getElementById("dotd-explore-btn")

        function dotdFn() {
            const today = new Date();
            const dateInDigits = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
            const index = dateInDigits % destinations.length;
            const dotd = destinations[index];
            dotdNameTXT.innerText = dotd.name;
            dotdTypeTXT.innerText = dotd.type;
            dotdImgIMG.src = dotd.image;
            dotdImgIMG.alt = dotd.name;
            dotdExploreBTN.addEventListener('click', ()=> window.location.href = `explore.html?dest=${encodeURIComponent(dotd.name)}`);
        }

        if (dotdNameTXT) {
            dotdFn();
        }

        // 2. EXPLORE PAGE
        const exploreDestGrid = document.getElementById("explore-dest-grid");

        // adding cards to the grid
        function getCards(filtered) {
            exploreDestGrid.innerHTML = "";
            filtered.forEach(dest => {
                const card = document.createElement("div");
                card.classList.add("explore-dest-card");
                card.innerHTML = `
                    <div class="explore-card-img">
                        <img class="explore-img" alt="destination image" src="${dest.image}">
                    </div>
                    <div class="explore-card-text">
                        <h4 class="explore-card-name">${dest.name}</h4>
                        <p class="explore-card-country">${dest.country}</p>
                    </div>
                `;
                card.addEventListener("click", () => openModal(dest));
                exploreDestGrid.appendChild(card);
            });
        }

        // 2. EXPLORE PAGE - filter
        function getSelectedContinents() {
            const checkboxes = document.querySelectorAll('#filter-form input[type="checkbox"]');
            return [...checkboxes].filter(cb => cb.checked).map(cb => cb.name);
        }

        function filterDestinations() {
            const selectedContinents = getSelectedContinents();
            if (selectedContinents.length === 0 || selectedContinents.includes("All")) {
                getCards(destinations);
                return;
            }
            getCards(destinations.filter(d => selectedContinents.includes(d.continent)));
        }

        if (exploreDestGrid) {
            document.getElementById("filter-form").addEventListener("change", filterDestinations);
            getCards(destinations);
        }

        const filterButton = document.getElementById("explore-filter");
        const filterMenu = document.getElementById("filter-menu");

        if (filterButton) {
            filterButton.addEventListener("click", (e) => {
                e.stopPropagation();
                filterButton.classList.toggle("active");
                filterMenu.classList.toggle("show");
            });

            window.addEventListener("click", (event) => {
                if (filterMenu.classList.contains("show")) {
                    if (!filterMenu.contains(event.target)) {
                        filterButton.classList.remove("active");
                        filterMenu.classList.remove("show");
                    }
                }
            });
        }

        // 2. EXPLORER PAGE - Search
        const searchForm = document.getElementById("explore-search-form");
        const searchInput = document.getElementById("explore-search-input");

        if (searchForm) {
            searchForm.addEventListener("submit", function(e) {
                e.preventDefault();
                const query = searchInput.value.trim().toLowerCase();
                const results = destinations.filter(d => 
                    d.name.toLowerCase().includes(query)
                );
                getCards(results);
            });

            searchInput.addEventListener("input", function() {
                if (searchInput.value === "") {
                    getCards(destinations);
                }
            });
        }

        // 2. EXPLORER PAGE - Modal
        const modal = document.getElementById("explore-deep");
        const modalCloseBtn = document.getElementById("modal-close");

        function openModal(dest) {
            document.getElementById("modal-img").src = dest.image;
            document.getElementById("modal-name").innerText = dest.name;
            document.getElementById("modal-description").innerText = dest.description;

            const attractionsList = document.getElementById("modal-attractions");
            attractionsList.innerHTML = "";
            dest.attractions.forEach(a => {
                const li = document.createElement("li");
                li.innerText = a;
                attractionsList.appendChild(li);
            });

            document.getElementById("modal-budget").innerText = dest.costs.budget;
            document.getElementById("modal-mid").innerText = dest.costs.mid;
            document.getElementById("modal-luxury").innerText = dest.costs.luxury;

            modal.classList.add("active");
            document.body.style.overflow = "hidden";
        }

        function closeModal() {
            modal.classList.remove("active");
            document.body.style.overflow = "";
        }

        if (modal) {
            modalCloseBtn.addEventListener("click", closeModal);

            modal.addEventListener("click", function(e) {
                if (e.target === modal) closeModal();
            });

            document.addEventListener("keydown", function(e) {
                if (e.key === "Escape") closeModal();
            });
        }
        
        // getting the parameter to open related dotd modal window if the user came through dive deeper
        const params = new URLSearchParams(window.location.search);
        const destParam = params.get('dest');
        if (destParam) {
            const match = destinations.find(d => d.name === destParam);
            if (match) openModal(match);
        }

        // 3. BUDGET PLANNER
        const budgetForm = document.getElementById("trip-calculator-form");
        const budgetSaveBtn = document.getElementById("budget-save-trigger");

        function getBudgetStatus(daily) {
            if (daily < 75) return { label: "Low Tier", width: "25%", color: "#4caf50" };
            if (daily < 200) return { label: "Moderate Tier", width: "60%", color: "#ff9800" };
            return { label: "Luxury Tier", width: "100%", color: "#3d1085" };
        }

        let currentBudgetResult = null;

        if (budgetForm) {
            budgetForm.addEventListener("submit", function(e) {
                e.preventDefault();

                const destination = document.getElementById("bp-destination").value.trim();
                const days = parseInt(document.getElementById("bp-days").value);
                const daily = parseInt(document.getElementById("bp-daily").value);

                // validation
                const errorEl = document.getElementById("budget-error");
                if (!destination) {
                    errorEl.innerText = "Please enter a destination.";
                    return;
                }
                if (!days || days < 1) {
                    errorEl.innerText = "Please enter a valid number of days.";
                    return;
                }
                if (!daily || daily < 1) {
                    errorEl.innerText = "Please enter a valid daily budget.";
                    return;
                }
                errorEl.innerText = "";

                const total = days * daily;
                const status = getBudgetStatus(daily);

                document.getElementById("budget-total-counter").innerText = "$" + total.toLocaleString();

                document.getElementById("budget-status-badge").innerText = status.label;
                document.getElementById("budget-status-badge").style.color = status.color;

                const bar = document.getElementById("budget-progress-bar");
                bar.style.transition = "width 0.8s ease";
                bar.style.width = "0%";
                bar.style.backgroundColor = status.color;
                setTimeout(() => { bar.style.width = status.width; }, 50);

                currentBudgetResult = { destination, days, daily, total, status: status.label };
            });
            
            if(budgetSaveBtn){
                budgetSaveBtn.addEventListener("click", function() {
                    if (!currentBudgetResult) return;

                    const saved = JSON.parse(localStorage.getItem("savedBudgets") || "[]");
                    const isDuplicate = saved.some(t => 
                        t.destination.toLowerCase() === currentBudgetResult.destination.toLowerCase() && 
                        t.days === currentBudgetResult.days && 
                        t.daily === currentBudgetResult.daily
                    );

                    if (isDuplicate) {
                        document.getElementById("budget-save-trigger").innerText = "Already Saved!";
                        setTimeout(() => { document.getElementById("budget-save-trigger").innerText = "Save Trip to Dashboard"; }, 2000);
                        return;
                    }
                    saved.push({ ...currentBudgetResult, savedAt: new Date().toLocaleDateString() });
                    localStorage.setItem("savedBudgets", JSON.stringify(saved));

                    renderSavedBudgets();
                    document.getElementById("budget-save-trigger").innerText = "Saved!";
                    setTimeout(() => { document.getElementById("budget-save-trigger").innerText = "Save Trip to Dashboard"; }, 2000);
            })};

            function renderSavedBudgets() {
                const grid = document.getElementById("budget-saved-cards-grid");
                if (!grid) return;
                const saved = JSON.parse(localStorage.getItem("savedBudgets") || "[]");
                grid.innerHTML = "";

                if (saved.length === 0) {
                    grid.innerHTML = "<p>No saved trips yet.</p>";
                    return;
                }

                saved.forEach((trip, index) => {
                    const card = document.createElement("div");
                    card.classList.add("saved-budget-card");
                    card.innerHTML = `
                        <h4>${trip.destination}</h4>
                        <p>${trip.days} days · $${trip.daily}/day</p>
                        <p>Total: <strong>$${trip.total.toLocaleString()}</strong></p>
                        <p>Status: ${trip.status}</p>
                        <p class="saved-date">${trip.savedAt}</p>
                        <button class="delete-budget-btn" data-index="${index}">Remove</button>
                    `;
                    grid.appendChild(card);
                });

                document.querySelectorAll(".delete-budget-btn").forEach(btn => {
                    btn.addEventListener("click", function() {
                        const saved = JSON.parse(localStorage.getItem("savedBudgets") || "[]");
                        saved.splice(parseInt(this.dataset.index), 1);
                        localStorage.setItem("savedBudgets", JSON.stringify(saved));
                        renderSavedBudgets();
                    });
                });
            }

            renderSavedBudgets();
        }

        // 4. RANDOM TRIP GENERATOR
        const generatorForm = document.getElementById("trip-generator-form");
        const surpriseBtn = document.getElementById("generator-surprise-trigger");
        const generatorSaveBtn = document.getElementById("generator-save-trigger");

        // reusable function — also used on explore page for type matching
        function matchesType(dest, type) {
            return dest.type.toLowerCase().includes(type.toLowerCase());
        }

        let currentGenResult = null;
        let lastFilters = null;

        function generateDestination(type, budget) {
            const filtered = destinations.filter(d => matchesType(d, type));

            const errorEl = document.getElementById("generator-error");

            if (filtered.length === 0) {
                errorEl.innerText = "No destinations match your filters. Try a different combination.";
                return;
            }
            errorEl.innerText = "";

            const pick = filtered[Math.floor(Math.random() * filtered.length)];
            currentGenResult = pick;

            document.getElementById("generator-destination-name").innerText = pick.name + ", " + pick.country;
            document.getElementById("generator-destination-description").innerText = pick.description;

            document.querySelectorAll("#generator-result-display .metric-display-node").forEach(el => {
                el.classList.remove("hidden");
            });

            document.getElementById("generator-actions-dock").style.display = "flex";
        }

        if (generatorForm) {
            generatorForm.addEventListener("submit", function(e) {
                e.preventDefault();
                const type = document.getElementById("generator-travel-type").value;
                const budget = document.getElementById("generator-budget-range").value;
                lastFilters = { type, budget };
                generateDestination(type, budget);
            });

            surpriseBtn.addEventListener("click", function() {
                if (!lastFilters) return;
                generateDestination(lastFilters.type, lastFilters.budget);
            });

            generatorSaveBtn.addEventListener("click", function() {
                if (!currentGenResult) return;

                const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

                const isDuplicate = wishlist.some(w => w.name === currentGenResult.name);
                if (isDuplicate) {
                    generatorSaveBtn.innerText = "Already in Wishlist!";
                    setTimeout(() => { generatorSaveBtn.innerText = "Add to Personal Wishlist"; }, 2000);
                    return;
                }

                wishlist.push({
                    name: currentGenResult.name,
                    country: currentGenResult.country,
                    description: currentGenResult.description,
                    type: currentGenResult.type,
                    savedAt: new Date().toLocaleDateString()
                });
                localStorage.setItem("wishlist", JSON.stringify(wishlist));
                renderWishlist();
                generatorSaveBtn.innerText = "Saved to Wishlist!";
                setTimeout(() => { generatorSaveBtn.innerText = "Add to Personal Wishlist"; }, 2000);
            });

            function renderWishlist() {
                const grid = document.getElementById("wishlist-saved-cards-grid");
                const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
                grid.innerHTML = "";

                if (wishlist.length === 0) {
                    grid.innerHTML = "<p>No destinations saved yet.</p>";
                    return;
                }

                wishlist.forEach((dest, index) => {
                    const card = document.createElement("div");
                    card.classList.add("saved-wishlist-card");
                    card.innerHTML = `
                        <h4>${dest.name}, ${dest.country}</h4>
                        <p>${dest.type}</p>
                        <p class="saved-date">${dest.savedAt}</p>
                        <button class="delete-wishlist-btn" data-index="${index}">Remove</button>
                    `;
                    grid.appendChild(card);
                });

                document.querySelectorAll(".delete-wishlist-btn").forEach(btn => {
                    btn.addEventListener("click", function() {
                        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
                        wishlist.splice(parseInt(this.dataset.index), 1);
                        localStorage.setItem("wishlist", JSON.stringify(wishlist));
                        renderWishlist();
                    });
                });
            }

            renderWishlist();
        }

        // 5. MOOD PAGE - Audio
        const audioButtons = document.querySelectorAll(".audio-toggle-btn");
        let currentAudio = null;
        let currentBtn = null;

        const sounds = {
            beach: "audio/beach.mp3",
            forest: "audio/forest.mp3",
            city: "audio/city.mp3"
        };

        if (audioButtons.length > 0) {
            audioButtons.forEach(btn => {
                btn.addEventListener("click", function() {
                    const sound = this.dataset.sound;

                    if (currentAudio && !currentAudio.paused) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0;
                        if (currentBtn) {
                            currentBtn.innerText = "Play";
                            currentBtn.classList.remove("playing");
                        }
                        if (currentBtn === this) {
                            currentAudio = null;
                            currentBtn = null;
                            return;
                        }
                    }

                    currentAudio = new Audio(sounds[sound]);
                    currentAudio.loop = true;
                    currentAudio.play();
                    currentBtn = this;
                    this.innerText = "Stop";
                    this.classList.add("playing");
                });
            });
        }

        // 5. MOOD PAGE - Destination Tracker
        const moodTrackerForm = document.getElementById("mood-tracker-form");
        const trackerDestSelect = document.getElementById("tracker-dest-select");

        if (moodTrackerForm) {
            // populate dropdown from destinations JSON
            destinations.forEach(dest => {
                const option = document.createElement("option");
                option.value = dest.name;
                option.innerText = dest.name;
                trackerDestSelect.appendChild(option);
            });

            moodTrackerForm.addEventListener("submit", function(e) {
                e.preventDefault();
                const destName = trackerDestSelect.value;
                const status = document.getElementById("tracker-status-select").value;

                if (!destName) return;

                const tracked = JSON.parse(localStorage.getItem("trackedDestinations") || "[]");

                const existingIndex = tracked.findIndex(t => t.name === destName);
                if (existingIndex !== -1) {
                    tracked[existingIndex].status = status;
                } else {
                    tracked.push({ name: destName, status, savedAt: new Date().toLocaleDateString() });
                }

                localStorage.setItem("trackedDestinations", JSON.stringify(tracked));
                renderTracked();
            });

            function renderTracked() {
                const grid = document.getElementById("wishlist-saved-cards-grid");
                if (!grid) return;
                const tracked = JSON.parse(localStorage.getItem("trackedDestinations") || "[]");
                grid.innerHTML = "";

                if (tracked.length === 0) {
                    grid.innerHTML = "<p>No destinations tracked yet.</p>";
                    return;
                }

                tracked.forEach((item, index) => {
                    const card = document.createElement("div");
                    card.classList.add("saved-wishlist-card");
                    card.innerHTML = `
                        <h4>${item.name}</h4>
                        <p>${item.status === "visited" ? "✓ Visited" : "📌 Planned"}</p>
                        <p class="saved-date">${item.savedAt}</p>
                        <button class="delete-tracked-btn" data-index="${index}">Remove</button>
                    `;
                    grid.appendChild(card);
                });

                document.querySelectorAll(".delete-tracked-btn").forEach(btn => {
                    btn.addEventListener("click", function() {
                        const tracked = JSON.parse(localStorage.getItem("trackedDestinations") || "[]");
                        tracked.splice(parseInt(this.dataset.index), 1);
                        localStorage.setItem("trackedDestinations", JSON.stringify(tracked));
                        renderTracked();
                    });
                });
            }

            renderTracked();
        }
        
        // 6. FEEDBACK PAGE
        const feedbackForm = document.getElementById("feedback-form");

        if (feedbackForm) {
            feedbackForm.addEventListener("submit", function(e) {
                e.preventDefault();

                const name = document.getElementById("feedback-name").value.trim();
                const email = document.getElementById("feedback-email").value.trim();
                const message = document.getElementById("feedback-message").value.trim();
                const errorEl = document.getElementById("feedback-error");
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!name) { errorEl.innerText = "Please enter your name."; return; }
                if (!email) { errorEl.innerText = "Please enter your email."; return; }
                if (!emailRegex.test(email)) { errorEl.innerText = "Please enter a valid email."; return; }
                if (!message) { errorEl.innerText = "Please enter a message."; return; }

                errorEl.innerText = "";

                const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
                feedbacks.push({ name, email, message, submittedAt: new Date().toLocaleDateString() });
                localStorage.setItem("feedbacks", JSON.stringify(feedbacks));

                feedbackForm.innerHTML = '<p style="color: #2C4A3E;","font-size:1rem">Thank you, ' + name + '! Your message has been received.</p>';
            });

            // FAQ accordion
            document.querySelectorAll(".faq-trigger-header").forEach(header => {
                header.addEventListener("click", function() {
                    const node = this.parentElement;
                    const icon = this.querySelector(".faq-icon");
                    const pane = node.querySelector(".faq-content-pane");

                    node.classList.toggle("active");
                    pane.style.display = node.classList.contains("active") ? "block" : "none";
                    icon.innerText = node.classList.contains("active") ? "−" : "+";
                });
            });
        }
    })
    
    .catch(err => console.error("Failed to load destinations.json:", err));