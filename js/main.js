document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".topnav-link").forEach(link => {
        if (link.getAttribute("href") === currentPage) link.classList.add("active");
    });

    function showReveal() {
        const revealItems = document.querySelectorAll(".reveal");
        if (!revealItems.length) return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15
        });
        revealItems.forEach(item => observer.observe(item));
    }

    function buttonRipple() {
        const buttons = document.querySelectorAll(".btn-glow, .btn-outline-glow");
        buttons.forEach(button => {
            if (button.dataset.rippleAdded) return;
            button.dataset.rippleAdded = "true";
            button.addEventListener("click", function (event) {
                const circle = document.createElement("span");
                const size = Math.max(button.offsetWidth, button.offsetHeight);
                const rect = button.getBoundingClientRect();
                circle.className = "ripple";
                circle.style.width = size + "px";
                circle.style.height = size + "px";
                circle.style.left = event.clientX - rect.left - size / 2 + "px";
                circle.style.top = event.clientY - rect.top - size / 2 + "px";
                button.appendChild(circle);
                setTimeout(() => {
                    circle.remove();
                }, 600);
            });
        });
    }

    function navbarShadow() {
        const navbar = document.querySelector(".topnav");
        if (!navbar) return;
        window.addEventListener("scroll", () => {
            if (window.scrollY > 12) navbar.style.boxShadow = "0 10px 30px -18px rgba(0,0,0,0.2)";
            else navbar.style.boxShadow = "none";
        });
    }

    function mobileNavMenu() {
        const navMenu = document.getElementById("navMenu");
        const toggler = document.querySelector(".navbar-toggler");
        if (!navMenu || !toggler) return;
        toggler.addEventListener("click", () => {
            const isOpen = navMenu.classList.contains("open");
            if (isOpen) {
                navMenu.classList.remove("open");
                toggler.classList.add("collapsed");
                setTimeout(() => {
                    navMenu.style.visibility = "hidden";
                    navMenu.style.pointerEvents = "none";
                }, 200);
            } else {
                navMenu.style.visibility = "visible";
                navMenu.style.pointerEvents = "auto";
                requestAnimationFrame(() => navMenu.classList.add("open"));
                toggler.classList.remove("collapsed");
            }
        });
        document.querySelectorAll(".topnav-link").forEach(link => {
            link.addEventListener("click", (e) => {
                if (navMenu.classList.contains("open")) {
                    e.preventDefault();
                    const destination = link.href;
                    toggler.classList.add("collapsed");
                    navMenu.classList.remove("open");
                    setTimeout(() => {
                        window.location.href = destination;
                    }, 200);
                }
            });
        });
    }

    function setupCategoryFilters() {
        const grid = document.getElementById("galleryGrid");
        const filterRow = document.getElementById("categoryFilters");
        if (!grid || !filterRow) return;
        const items = Array.from(grid.children);
        const categories = new Set();
        items.forEach(item => {
            const card = item.querySelector(".photo-card");
            const url = card ? card.dataset.url || "" : "";
            const match = url.match(/images\/([^/]+)\//i);
            item.dataset.category = match ? match[1] : "Other";
            categories.add(item.dataset.category);
        });
        Array.from(categories).sort().reverse().forEach(cat => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "filter-btn";
            btn.textContent = cat;
            btn.dataset.filter = cat;
            filterRow.appendChild(btn);
        });
        let animating = false;
        const HIDE_STAGGER = 45;
        const HIDE_DURATION = 320;
        const SHOW_STAGGER = 45;
        const SHOW_DURATION = 350;
        const FLIP_DURATION = 500;
        filterRow.addEventListener("click", event => {
            const btn = event.target.closest(".filter-btn");
            if (!btn || animating) return;
            filterRow.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            applyFilter(btn.dataset.filter);
        });
        function applyFilter(filter) {
            const toHide = [];
            const toShow = [];
            const staying = [];
            items.forEach(item => {
                const shouldShow = filter === "all" || item.dataset.category === filter;
                const isHidden = item.classList.contains("filter-hidden");
                if (shouldShow && isHidden) toShow.push(item);
                else if (!shouldShow && !isHidden) toHide.push(item);
                else if (shouldShow && !isHidden) staying.push(item);
            });
            if (!toHide.length && !toShow.length) return;
            animating = true;
            toHide.forEach((item, i) => {
                item.style.transitionDelay = (i * HIDE_STAGGER) + "ms";
                item.classList.add("filter-hide");
            });
            const hideTotalTime = toHide.length ? (toHide.length - 1) * HIDE_STAGGER + HIDE_DURATION : 0;
            setTimeout(() => {
                const flipItems = staying.concat(toShow);
                const firstRects = new Map();
                flipItems.forEach(item => firstRects.set(item, item.getBoundingClientRect()));
                toHide.forEach(item => {
                    item.classList.add("filter-hidden");
                    item.style.transitionDelay = "";
                });
                toShow.forEach(item => {
                    item.classList.remove("filter-hidden");
                    item.classList.add("filter-hide");
                });
                void grid.offsetWidth;
                const lastRects = new Map();
                flipItems.forEach(item => lastRects.set(item, item.getBoundingClientRect()));
                staying.forEach(item => {
                    const first = firstRects.get(item);
                    const last = lastRects.get(item);
                    const dx = first.left - last.left;
                    const dy = first.top - last.top;
                    if (dx || dy) {
                        item.style.transition = "none";
                        item.style.transform = `translate(${dx}px, ${dy}px)`;
                        void item.offsetWidth;
                    }
                });
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        staying.forEach(item => {
                            item.style.transition = `transform ${FLIP_DURATION}ms var(--ease)`;
                            item.style.transform = "";
                        });
                        toShow.forEach((item, i) => {
                            item.style.transitionDelay = (i * SHOW_STAGGER) + "ms";
                            void item.offsetWidth;
                            item.classList.remove("filter-hide");
                        });
                        const showTotalTime = toShow.length ? (toShow.length - 1) * SHOW_STAGGER + SHOW_DURATION : 0;
                        setTimeout(() => {
                            staying.forEach(item => { item.style.transition = ""; item.style.transform = ""; });
                            toShow.forEach(item => { item.style.transitionDelay = ""; });
                            animating = false;
                        }, Math.max(showTotalTime, FLIP_DURATION) + 50);
                    });
                });
            }, hideTotalTime + 30);
        }
    }

    function loadRatings() {
        try {
            const ratingsKey = "photography_ratings";
            return JSON.parse(localStorage.getItem(ratingsKey)) || {};
        } catch (e) {
            return {};
        }
    }

    function saveRating(photoId, value) {
        const ratingsKey = "photography_ratings";
        const ratings = loadRatings();
        ratings[photoId] = value;
        localStorage.setItem(ratingsKey, JSON.stringify(ratings));
    }

    function deleteRating(photoId) {
        const ratingsKey = "photography_ratings";
        const ratings = loadRatings();
        delete ratings[photoId];
        localStorage.setItem(ratingsKey, JSON.stringify(ratings));
    }

    function clearAllRatings() {
        localStorage.removeItem("photography_ratings");
    }

    function setPanelVisible(panel, visible) {
        if (!panel) return;
        if (visible) {
            panel.style.maxHeight = panel.scrollHeight + "px";
            panel.style.opacity = "1";
        } else {
            panel.style.maxHeight = "0px";
            panel.style.opacity = "0";
        }
    }

    function renderStarRow(row) {
        const current = parseInt(row.dataset.current, 10) || 0;
        const stars = row.querySelectorAll("i");
        stars.forEach(s => s.classList.toggle("filled", parseInt(s.dataset.value, 10) <= current));
        const note = row.querySelector(".rating-note");
        if (note) note.textContent = current ? `${current}/5` : "rate this";
    }

    function openPhotoPopup(source) {
        const popup = document.getElementById("photoPopup");
        if (!popup || typeof bootstrap === "undefined") return;
        const popupImg = document.getElementById("popupImg");
        const popupContent = popup.querySelector(".popup-content");
        const url = source.dataset.url || "";
        document.getElementById("popupLocation").textContent = source.dataset.location || "";
        const mapsLink = document.getElementById("popupMapsLink");
        if (mapsLink) {
            const mapsUrl = source.dataset.maps || "";
            if (mapsUrl) {
                mapsLink.href = mapsUrl;
                mapsLink.style.display = "";
            } else mapsLink.style.display = "none";
        }
        document.getElementById("popupTitle").textContent = source.dataset.title || "";
        document.getElementById("popupDesc").textContent = source.dataset.desc || "";
        document.getElementById("popupBy").textContent = "By " + (source.dataset.photographer || "");
        document.getElementById("popupDate").textContent = source.dataset.date || "";

        function reveal() {
            popup.style.removeProperty("display");
            popup.style.removeProperty("visibility");
            const modal = new bootstrap.Modal(popup);
            modal.show();
        }
        if (!popupContent) {
            popupImg.src = url;
            popupImg.alt = source.dataset.title || "";
            reveal();
            return;
        }
        popupContent.style.width = "";
        popup.style.display = "block";
        popup.style.visibility = "hidden";
        let settled = false;
        function finish() {
            if (settled) return;
            settled = true;
            popupContent.style.width = popupImg.getBoundingClientRect().width + "px";
            reveal();
        }
        popupImg.onload = finish;
        popupImg.onerror = finish;
        popupImg.src = url;
        popupImg.alt = source.dataset.title || "";
        if (popupImg.complete) finish();
        setTimeout(finish, 1500);
    }

    function stripImage(url) {
        if (!url) return "";
        const filename = url.split("/").pop() || "";
        return filename.replace(/\.[a-zA-Z0-9]+$/, "");
    }

    function setupGallery() {
        const grid = document.getElementById("galleryGrid");
        if (!grid) return;
        document.querySelectorAll(".photo-card").forEach(card => {
            const id = stripImage(card.dataset.url);
            card.dataset.id = id;
            const row = card.querySelector(".star-row");
            if (row) row.dataset.photoId = id;
        });
        const ratings = loadRatings();

        document.querySelectorAll(".star-row").forEach(row => {
            const photoId = row.dataset.photoId;
            row.dataset.current = ratings[photoId] || 0;
            renderStarRow(row);
            const stars = row.querySelectorAll("i");
            stars.forEach(star => {
                star.addEventListener("click", event => {
                    event.stopPropagation();
                    const value = parseInt(star.dataset.value, 10);
                    const current = parseInt(row.dataset.current, 10) || 0;
                    if (value === current) {
                        deleteRating(photoId);
                        row.dataset.current = 0;
                    } else {
                        saveRating(photoId, value);
                        row.dataset.current = value;
                    }
                    renderStarRow(row);
                    updateRatingsChart();
                });
            });
        });

        document.querySelectorAll(".photo-card").forEach(card => {
            card.addEventListener("click", event => {
                if (event.target.closest(".star-row")) return;
                openPhotoPopup(card);
            });
        });
        updateRatingsChart();
    }

    function updateRatingsChart() {
        const box = document.getElementById("ratingsBox");
        if (!box) return;
        const totalPhotos = document.querySelectorAll(".photo-card").length;
        const ratings = loadRatings();
        const values = Object.values(ratings);
        const total = values.length;
        document.getElementById("ratedCount").textContent = total;
        document.getElementById("totalCount").textContent = totalPhotos;
        const chartWrap = document.getElementById("ratingsChart");
        const emptyMsg = document.getElementById("ratingsEmpty");
        const clearBtn = document.getElementById("clearRatingsBtn");
        if (clearBtn) clearBtn.classList.toggle("is-visible", total > 0);
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                clearAllRatings();
                document.querySelectorAll(".star-row").forEach(row => {
                    row.dataset.current = 0;
                    renderStarRow(row);
                });
                updateRatingsChart();
            });
        }
        if (total === 0) {
            setPanelVisible(chartWrap, false);
            setPanelVisible(emptyMsg, true);
            return;
        }
        setPanelVisible(emptyMsg, false);
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        values.forEach(v => counts[v] = (counts[v] || 0) + 1);
        let maxCount = 1;
        for (const key in counts) if (counts[key] > maxCount) maxCount = counts[key];
        for (let star = 1; star <= 5; star++) {
            const fill = document.getElementById("chartFill" + star);
            const count = document.getElementById("chartCount" + star);
            if (fill && count) {
                fill.style.width = (counts[star] / maxCount) * 100 + "%";
                count.textContent = counts[star];
            }
        }
        setPanelVisible(chartWrap, true);
    }

    function setupSlider() {
        const slideContainer = document.querySelector(".slide_box");
        if (!slideContainer) return;
        const slides = document.querySelector(".slide_row");
        const slideItems = document.querySelectorAll(".slide_item");
        slideItems.forEach(item => item.addEventListener("click", () => openPhotoPopup(item)));
        const prevBtn = document.querySelector(".prev_btn");
        const nextBtn = document.querySelector(".next_btn");
        const indicatorsContainer = document.querySelector(".dot_row");
        let currentIndex = 0;
        const totalSlides = slideItems.length;
        if (!totalSlides) return;
        if (indicatorsContainer) {
            for (let i = 0; i < totalSlides; i++) {
                const indicator = document.createElement("button");
                indicator.classList.add("dot_item");
                if (i === 0) indicator.classList.add("active");
                indicator.setAttribute("aria-label", `Go to slide ${i + 1}`);
                indicator.addEventListener("click", () => goToSlide(i));
                indicatorsContainer.appendChild(indicator);
            }
        }
        const indicators = document.querySelectorAll(".dot_item");

        function updateContainer() {
            if (slides) slides.style.transform = "translateX(-" + (currentIndex * 100) + "%)";
            indicators.forEach((ind, index) => {
                if (index === currentIndex) ind.classList.add("active");
                else ind.classList.remove("active");
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateContainer();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateContainer();
        }

        if (nextBtn) nextBtn.addEventListener("click", nextSlide);
        if (prevBtn) prevBtn.addEventListener("click", prevSlide);
        let autoSlideInterval = setInterval(nextSlide, 5000);
        slideContainer.addEventListener("mouseenter", () => {
            clearInterval(autoSlideInterval);
        });
        slideContainer.addEventListener("mouseleave", () => {
            autoSlideInterval = setInterval(nextSlide, 5000);
        });

        function goToSlide(index) {
            currentIndex = index;
            updateContainer();
        }
    }

    function setupTipsCarousel() {
        const track = document.getElementById("tipsTrack");
        if (!track) return;
        const prevBtn = document.getElementById("tipsPrev");
        const nextBtn = document.getElementById("tipsNext");
        let tips = [];
        let currentIndex = 0;
        function visibleCount() {
            const w = window.innerWidth;
            if (w >= 992) return 3;
            if (w >= 576) return 2;
            return 1;
        }

        function maxIndex() {
            return Math.max(0, tips.length - visibleCount());
        }

        function updateContainer() {
            currentIndex = Math.min(currentIndex, maxIndex());
            const cardWidth = track.children.length ? track.children[0].getBoundingClientRect().width : 0;
            track.style.transform = "translateX(-" + (currentIndex * cardWidth) + "px)";
            if (prevBtn) prevBtn.style.visibility = currentIndex <= 0 ? "hidden" : "visible";
            if (nextBtn) nextBtn.style.visibility = currentIndex >= maxIndex() ? "hidden" : "visible";
        }

        function renderTips() {
            track.innerHTML = tips.map(tip => `
                <div class="tip_card">
                    <div class="tip_card_inner">
                        <div class="tip_card_icon"><i class="${tip.icon}"></i></div>
                        <h3 class="tip_card_title">${tip.title}</h3>
                        <p class="tip_card_text">${tip.text}</p>
                    </div>
                </div>
            `).join("");
            updateContainer();
        }

        function nextTip() {
            currentIndex = Math.min(maxIndex(), currentIndex + 1);
            updateContainer();
        }

        function prevTip() {
            currentIndex = Math.max(0, currentIndex - 1);
            updateContainer();
        }

        if (nextBtn) nextBtn.addEventListener("click", nextTip);
        if (prevBtn) prevBtn.addEventListener("click", prevTip);
        window.addEventListener("resize", updateContainer);
        fetch("./data/tips.json").then(res => res.json()).then(data => {
            tips = data;
            renderTips();
        })
        .catch(err => {
            console.error("Could not load tips.json", err);
            track.innerHTML = '<div class="tip_card"><div class="tip_card_inner"><p class="tip_card_text">Tips could not be loaded.</p></div></div>';
        });
    }

    function setupFeedbackForm() {
        const feedbackKey = "feedback_details";
        const form = document.getElementById("feedbackForm");
        if (!form) return;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        function setFieldState(input, errorEl, valid) {
            input.classList.toggle("is-invalid", !valid);
            input.classList.toggle("is-valid", valid);
            if (errorEl) errorEl.classList.toggle("show", !valid);
        }

        const nameInput = document.getElementById("fbName");
        const nameError = document.getElementById("fbNameError");
        nameInput.addEventListener("input", () => setFieldState(nameInput, nameError, nameInput.value.trim().length > 0));
        const emailInput = document.getElementById("fbEmail");
        const emailError = document.getElementById("fbEmailError");
        emailInput.addEventListener("input", () => setFieldState(emailInput, emailError, emailPattern.test(emailInput.value.trim())));
        const messageInput = document.getElementById("fbMessage");
        const messageError = document.getElementById("fbMessageError");
        messageInput.addEventListener("input", () => setFieldState(messageInput, messageError, messageInput.value.trim().length > 0));
        const dropdownBox = document.getElementById("fbTopicBox");
        const dropdownBtn = document.getElementById("fbTopicBtn");
        const dropdownLabel = document.getElementById("fbTopicLabel");
        const dropdownMenu = document.getElementById("fbTopicMenu");
        const dropdownError = document.getElementById("fbTopicError");
        let topicValue = "";

        dropdownBtn.addEventListener("click", event => {
            event.stopPropagation();
            dropdownBox.classList.toggle("open");
        });

        document.addEventListener("click", event => {
            if (!dropdownBox.contains(event.target)) dropdownBox.classList.remove("open");
        });

        const otherDiv = document.getElementById("fbTopicOthers");
        const otherInput = document.getElementById("fbTopicOther");
        dropdownMenu.querySelectorAll(".dropdown-item").forEach(item => {
            item.addEventListener("click", function () {
                const selected = item.dataset.value;
                dropdownLabel.textContent = selected;
                dropdownBtn.classList.add("filled");
                dropdownMenu.querySelectorAll(".dropdown-item").forEach(el => el.classList.remove("selected"));
                item.classList.add("selected");
                dropdownBox.classList.remove("open");
                if (selected === "Something else") {
                    otherDiv.classList.add("is-visible");
                    setTimeout(() => otherInput.focus(), 300);
                    topicValue = otherInput.value.trim();
                } else {
                    otherDiv.classList.remove("is-visible");
                    otherInput.value = "";
                    topicValue = selected;
                }

                dropdownBtn.classList.toggle("is-valid", topicValue.length > 0);
                dropdownBtn.classList.remove("is-invalid");
                if (topicValue.length > 0) dropdownError.classList.remove("show");
            });
        });
        otherInput.addEventListener("input", () => {
            topicValue = otherInput.value.trim();
            otherInput.classList.toggle("is-valid", topicValue.length > 0);
            dropdownBtn.classList.toggle("is-valid", topicValue.length > 0);
            if (topicValue.length > 0) dropdownError.classList.remove("show");
        });
        const stars = document.querySelectorAll("#fbRatingPicker i");
        const ratingHiddenValue = document.getElementById("fbRatingValue");
        const ratingHelp = document.getElementById("fbRatingHelp");
        stars.forEach(function (star) {
            star.addEventListener("click", () => {
                const value = parseInt(star.dataset.value, 10);
                ratingHiddenValue.value = value;
                stars.forEach(s => s.classList.toggle("filled", parseInt(s.dataset.value, 10) <= value));
                ratingHelp.textContent = value + " out of 5";
            });
        });

        form.addEventListener("submit", event => {
            event.preventDefault();
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();
            const rating = parseInt(ratingHiddenValue.value, 10) || 0;
            const nameValid = name.length > 0;
            const emailValid = emailPattern.test(email);
            const messageValid = message.length > 0;
            const topicValid = topicValue.length > 0;
            setFieldState(nameInput, nameError, nameValid);
            setFieldState(emailInput, emailError, emailValid);
            setFieldState(messageInput, messageError, messageValid);
            dropdownBtn.classList.toggle("is-invalid", !topicValid);
            dropdownError.classList.toggle("show", !topicValid);
            if (!nameValid || !emailValid || !messageValid || !topicValid) return;

            sessionStorage.setItem(feedbackKey, JSON.stringify({
                name: name,
                email: email,
                topic: topicValue,
                rating: rating,
                message: message,
                submittedAt: new Date().toISOString()
            }));
            window.location.href = "feedbackDetails.html";
        });
    }

    function setupFeedbackDetails() {
        const wrap = document.getElementById("ticketWrap");
        if (!wrap) return;
        const feedbackKey = "feedback_details";
        const raw = sessionStorage.getItem(feedbackKey);
        if (!raw) {
            window.location.replace("feedback.html");
            return;
        }
        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            window.location.replace("feedback.html");
            return;
        }
        document.getElementById("ticketName").textContent = data.name || "-";
        document.getElementById("ticketEmail").textContent = data.email || "-";
        document.getElementById("ticketSubject").textContent = data.topic || "general thoughts";
        document.getElementById("ticketDescription").textContent = data.message || "-";
        const submitted = data.submittedAt ? new Date(data.submittedAt) : new Date();
        const dateStr = submitted.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
        const timeStr = submitted.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
        document.getElementById("ticketDate").textContent = dateStr + " at " + timeStr;
        const ratingEl = document.getElementById("ticketRating");
        const rating = parseInt(data.rating, 10) || 0;
        if (rating > 0) {
            let starsHtml = "";
            for (let i = 1; i <= 5; i++) {
                starsHtml += '<i class="fa-solid fa-star" style="color:' + (i <= rating ? "var(--orange)" : "var(--text-faint)") + '"></i>';
            }
            starsHtml += ' <span class="text-faint" style="font-size:.75rem">(' + rating + '/5)</span>';
            ratingEl.innerHTML = starsHtml;
        } else ratingEl.textContent = "Not rated";
        const anotherBtn = document.getElementById("anotherBtn");
        if (anotherBtn) {
            anotherBtn.addEventListener("click", () => {
                sessionStorage.removeItem(feedbackKey);
            });
        }
    }
    function safeRun(fn) {
        try {
            fn();
        } catch (err) {
            console.error(err);
        }
    }

    safeRun(showReveal);
    safeRun(mobileNavMenu);
    safeRun(buttonRipple);
    safeRun(navbarShadow);
    safeRun(setupCategoryFilters);
    safeRun(setupGallery);
    safeRun(setupSlider);
    safeRun(setupTipsCarousel);
    safeRun(setupFeedbackForm);
    safeRun(setupFeedbackDetails);
});