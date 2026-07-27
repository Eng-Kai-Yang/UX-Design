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
        revealItems.forEach(item => {
            observer.observe(item);
        });
    }

    function buttonRipple() {
        const buttons = document.querySelectorAll(
            ".btn-glow, .btn-outline-glow"
        );
        buttons.forEach(button => {
            if (button.dataset.rippleAdded) return;
            button.dataset.rippleAdded = "true";
            button.addEventListener("click", function (event) {
                const circle = document.createElement("span");
                const size = Math.max(
                    button.offsetWidth,
                    button.offsetHeight
                );
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
                requestAnimationFrame(() => {
                    navMenu.classList.add("open");
                });
                toggler.classList.remove("collapsed");
            }
        });
    }

    function loadRatings() {
        try {
            const ratingsKey = "hobbysite_ratings";
            return JSON.parse(localStorage.getItem(ratingsKey)) || {};
        } catch (e) {
            return {};
        }
    }

    function saveRating(photoId, value) {
        const ratingsKey = "hobbysite_ratings";
        const ratings = loadRatings();
        ratings[photoId] = value;
        localStorage.setItem(ratingsKey, JSON.stringify(ratings));
    }

    function openPhotoPopup(source) {
        const popup = document.getElementById("photoPopup");
        if (!popup || typeof bootstrap === "undefined") return;
        const popupImg = document.getElementById("popupImg");
        const popupContent = popup.querySelector(".popup-content");
        const url = source.dataset.url || "";
        document.getElementById("popupLocation").textContent = source.dataset.location || "";
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

    function setupGallery() {
        const grid = document.getElementById("galleryGrid");
        if (!grid) return;
        const ratings = loadRatings();

        document.querySelectorAll(".star-row").forEach(row => {
            const photoId = row.dataset.photoId;
            const current = ratings[photoId] || 0;
            const stars = row.querySelectorAll("i");
            stars.forEach(function (star) {
                star.classList.toggle("filled", parseInt(star.dataset.value, 10) <= current);
            });
            const note = row.querySelector(".rating-note");
            if (note) note.textContent = current ? current + "/5" : "rate this";

            stars.forEach(function (star) {
                star.addEventListener("click", event => {
                    event.stopPropagation();
                    const value = parseInt(star.dataset.value, 10);
                    saveRating(photoId, value);
                    stars.forEach(s => {
                        s.classList.toggle("filled", parseInt(s.dataset.value, 10) <= value);
                    });
                    if (note) note.textContent = value + "/5";
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
        if (total === 0) {
            chartWrap.style.display = "none";
            emptyMsg.style.display = "block";
            return;
        }
        chartWrap.style.display = "block";
        emptyMsg.style.display = "none";
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        values.forEach(v => {
            counts[v] = (counts[v] || 0) + 1;
        });
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
    }

    function setupSlider() {
        const slideContainer = document.querySelector(".slide_box");
        if (!slideContainer) return;
        const slides = document.querySelector(".slide_row");
        const slideItems = document.querySelectorAll(".slide_item");
        slideItems.forEach(item => {
            item.addEventListener("click", () => openPhotoPopup(item));
        });
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
                indicator.setAttribute("aria-label", "Go to slide " + (i + 1));
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

    function setupFeedbackForm() {
        const feedbackKey = "hobbysite_last_feedback";
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
        nameInput.addEventListener("input", () => {
            setFieldState(nameInput, nameError, nameInput.value.trim().length > 0);
        });
        const emailInput = document.getElementById("fbEmail");
        const emailError = document.getElementById("fbEmailError");
        emailInput.addEventListener("input", () => {
            setFieldState(emailInput, emailError, emailPattern.test(emailInput.value.trim()));
        });
        const messageInput = document.getElementById("fbMessage");
        const messageError = document.getElementById("fbMessageError");
        messageInput.addEventListener("input", () => {
            setFieldState(messageInput, messageError, messageInput.value.trim().length > 0);
        });
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

        dropdownMenu.querySelectorAll(".dropdown-item").forEach(item => {
            item.addEventListener("click", function () {
                topicValue = item.dataset.value;
                dropdownLabel.textContent = topicValue;
                dropdownBtn.classList.add("filled");
                dropdownMenu.querySelectorAll(".dropdown-item").forEach(el => {
                    el.classList.remove("selected");
                });
                item.classList.add("selected");
                dropdownBox.classList.remove("open");
                dropdownBtn.classList.remove("is-invalid");
                dropdownBtn.classList.add("is-valid");
                dropdownError.classList.remove("show");
            });
        });

        const stars = document.querySelectorAll("#fbRatingPicker i");
        const ratingHiddenValue = document.getElementById("fbRatingValue");
        const ratingHelp = document.getElementById("fbRatingHelp");
        stars.forEach(function (star) {
            star.addEventListener("click", () => {
                const value = parseInt(star.dataset.value, 10);
                ratingHiddenValue.value = value;
                stars.forEach(s => {
                    s.classList.toggle("filled", parseInt(s.dataset.value, 10) <= value);
                });
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
        const feedbackKey = "hobbysite_last_feedback";
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
        document.getElementById("ticketDescription").textContent =
            "Regarding " + (data.topic || "general thoughts") + ": " + (data.message || "-");
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
    safeRun(setupGallery);
    safeRun(setupSlider);
    safeRun(setupFeedbackForm);
    safeRun(setupFeedbackDetails);
});