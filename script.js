console.log("Hello Ridwan! JavaScript connected successfully.");

const AUTH_KEY = "isLoggedIn";
const THEME_KEY = "theme";
const PROJECTS_KEY = "portfolio_projects";
const PROJECTS_LANG_KEY = "portfolio_projects_lang_v2";

function isLoggedIn() {
    return localStorage.getItem(AUTH_KEY) === "true" || !!localStorage.getItem("adminToken");
}

function setLoggedIn(value) {
    if (value) {
        localStorage.setItem(AUTH_KEY, "true");
    } else {
        localStorage.removeItem(AUTH_KEY);
    }
}

// ─── Theme (Dark / Light) ─────────────────────────────────────────────────────

function getTheme() {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    const icon = document.getElementById("themeIcon");
    if (icon) {
        icon.className = theme === "light" ? "fa-solid fa-moon" : "fa-solid fa-sun";
    }
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
        toggle.setAttribute(
            "aria-label",
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
        );
        toggle.setAttribute("title", theme === "light" ? "Dark mode" : "Light mode");
    }
}

applyTheme(getTheme());

const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        applyTheme(getTheme() === "dark" ? "light" : "dark");
    });
}

// ─── Hamburger Menu ───────────────────────────────────────────────────────────

const hamburgerBtn = document.getElementById("hamburgerBtn");
const navMenu = document.getElementById("navMenu");

if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", function () {
        const isOpen = navMenu.classList.toggle("open");
        hamburgerBtn.classList.toggle("active", isOpen);
        hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            navMenu.classList.remove("open");
            hamburgerBtn.classList.remove("active");
            hamburgerBtn.setAttribute("aria-expanded", "false");
        });
    });
}

// ─── Admin nav links (Dashboard + Logout) ─────────────────────────────────────

(function syncAdminNav() {
    const dashboardLink = document.getElementById("navDashboard");
    const logoutLink = document.getElementById("logoutBtn");
    const loggedIn = isLoggedIn();

    if (dashboardLink) {
        dashboardLink.hidden = !loggedIn;
    }
    if (logoutLink) {
        logoutLink.hidden = !loggedIn;
    }
})();

const DEFAULT_PROJECTS = [
    {
        id: 1,
        title: "Portfolio Website",
        description:
            "My personal developer portfolio built with semantic HTML5, modern CSS 3 layout, and responsive design concepts.",
        link: "index.html#home",
        images: []
    }
];

function migrateProjectsToEnglish(projects) {
    if (localStorage.getItem(PROJECTS_LANG_KEY) === "done") {
        return projects;
    }

    const map = [
        {
            matchTitle: /portofolio/i,
            title: "Portfolio Website",
            description:
                "My personal developer portfolio built with semantic HTML5, modern CSS 3 layout, and responsive design concepts."
        },
        {
            matchTitle: /website e-?commerce|e-?commerce/i,
            title: "E-Commerce Website",
            description:
                "A modern e-commerce website with product catalog, shopping cart, and responsive design for all devices."
        },
        {
            matchTitle: /landing page/i,
            title: "Landing Page",
            description:
                "A clean and conversion-focused landing page built with semantic HTML and modern CSS."
        },
        {
            matchTitle: /blog/i,
            title: "Blog Website",
            description:
                "A blog website with article listing, detail pages, and a clean reading experience."
        },
        {
            matchTitle: /dashboard/i,
            title: "Admin Dashboard",
            description:
                "An admin dashboard for managing data with a clear layout and responsive interface."
        }
    ];

    const updated = projects.map(function (project) {
        const title = project.title || "";
        const description = project.description || "";
        const hasIndonesian =
            /\b(proyek|deskripsi|saya|dengan|untuk|yang|adalah|sebuah|dibangun|menggunakan|portofolio)\b/i.test(
                title + " " + description
            ) || /portofolio/i.test(title);

        let p = { ...project };

        if (!p.images) {
            p.images = p.image ? [p.image] : [];
            delete p.image;
        }

        if (!hasIndonesian) return p;

        for (let i = 0; i < map.length; i++) {
            if (map[i].matchTitle.test(title)) {
                return { ...p, title: map[i].title, description: map[i].description };
            }
        }

        return {
            ...p,
            title: title
                .replace(/Portofolio/gi, "Portfolio")
                .replace(/Proyek/gi, "Project"),
            description: description
                .replace(/Portofolio/gi, "Portfolio")
                .replace(/proyek/gi, "project")
                .replace(/dibangun dengan/gi, "built with")
                .replace(/menggunakan/gi, "using")
                .replace(/dan/gi, "and")
                .replace(/untuk/gi, "for")
                .replace(/yang/gi, "that")
                .replace(/sebuah/gi, "a")
                .replace(/adalah/gi, "is")
                .replace(/saya/gi, "my")
        };
    });

    saveProjects(updated);
    localStorage.setItem(PROJECTS_LANG_KEY, "done");
    return updated;
}

function getProjects() {
    try {
        const raw = localStorage.getItem(PROJECTS_KEY);
        if (raw === null) {
            saveProjects(DEFAULT_PROJECTS);
            localStorage.setItem(PROJECTS_LANG_KEY, "done");
            return DEFAULT_PROJECTS.slice();
        }
        const parsed = JSON.parse(raw) || [];
        return migrateProjectsToEnglish(parsed);
    } catch {
        return DEFAULT_PROJECTS.slice();
    }
}

function saveProjects(projects) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

function getAllProjects() {
    return getProjects().slice().sort(function (a, b) {
        return Number(b.id) - Number(a.id);
    });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
}

// ─── Carousel Lightbox ────────────────────────────────────────────────────────

let _lbImages = [];
let _lbIndex = 0;

function openLightbox(images, startIndex, caption) {
    const lightbox = document.getElementById("imageLightbox");
    if (!lightbox || !images || images.length === 0) return;

    _lbImages = images;
    _lbIndex = startIndex || 0;
    _renderLightboxSlide(caption || "");

    lightbox.hidden = false;
    document.body.style.overflow = "hidden";

    const prevBtn = document.getElementById("lightboxPrev");
    const nextBtn = document.getElementById("lightboxNext");
    if (prevBtn) prevBtn.style.display = images.length > 1 ? "" : "none";
    if (nextBtn) nextBtn.style.display = images.length > 1 ? "" : "none";
}

function _renderLightboxSlide(caption) {
    const img = document.getElementById("lightboxImage");
    const captionEl = document.getElementById("lightboxCaption");
    if (!img) return;

    img.src = _lbImages[_lbIndex];
    img.alt = caption || "Project image";

    if (captionEl) {
        const count = _lbImages.length > 1
            ? " (" + (_lbIndex + 1) + " / " + _lbImages.length + ")"
            : "";
        captionEl.textContent = (caption || "") + count;
    }
}

function lightboxPrev() {
    if (_lbImages.length <= 1) return;
    _lbIndex = (_lbIndex - 1 + _lbImages.length) % _lbImages.length;
    const captionEl = document.getElementById("lightboxCaption");
    const currentText = captionEl ? captionEl.textContent.replace(/ \(\d+ \/ \d+\)$/, "") : "";
    _renderLightboxSlide(currentText);
}

function lightboxNext() {
    if (_lbImages.length <= 1) return;
    _lbIndex = (_lbIndex + 1) % _lbImages.length;
    const captionEl = document.getElementById("lightboxCaption");
    const currentText = captionEl ? captionEl.textContent.replace(/ \(\d+ \/ \d+\)$/, "") : "";
    _renderLightboxSlide(currentText);
}

function closeLightbox() {
    const lightbox = document.getElementById("imageLightbox");
    const img = document.getElementById("lightboxImage");
    if (!lightbox) return;
    lightbox.hidden = true;
    if (img) img.src = "";
    _lbImages = [];
    _lbIndex = 0;
    document.body.style.overflow = "";
}

function initLightbox() {
    const lightbox = document.getElementById("imageLightbox");
    if (!lightbox) return;

    const closeBtn = document.getElementById("lightboxClose");
    const prevBtn = document.getElementById("lightboxPrev");
    const nextBtn = document.getElementById("lightboxNext");

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", lightboxPrev);
    if (nextBtn) nextBtn.addEventListener("click", lightboxNext);

    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
        if (lightbox.hidden) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") lightboxPrev();
        if (e.key === "ArrowRight") lightboxNext();
    });

    let touchStartX = 0;
    lightbox.addEventListener("touchstart", function (e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) {
            if (dx < 0) lightboxNext();
            else lightboxPrev();
        }
    }, { passive: true });
}

initLightbox();

// ─── Hero photo ───────────────────────────────────────────────────────────────

const fotoProfil = document.querySelector(".hero-center img");
if (fotoProfil) {
    fotoProfil.addEventListener("click", function () {
        alert("Hello! Thanks for visiting Ridwan Maulana's portfolio.");
    });
}

// ─── Login ────────────────────────────────────────────────────────────────────

// URL backend yang sudah di-deploy di Vercel (production)
const API_BASE_URL = "https://my-portofolio-7o3h.vercel.app/api";

const loginForm = document.getElementById("login-form");
if (loginForm) {
    // Jika sudah login, langsung ke halaman kelola project
    if (isLoggedIn()) {
        window.location.href = "project-form.html";
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch(API_BASE_URL + "/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Simpan status login (dan token jika ada) ke localStorage
                localStorage.setItem("isLoggedIn", "true");
                if (data.token) {
                    localStorage.setItem("adminToken", data.token);
                }
                alert("Login Berhasil!");
                window.location.href = "project-form.html";
            } else {
                alert(data.message || "Username atau password salah!");
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Gagal menghubungi server. Pastikan backend aktif.");
        }
    });
}

// ─── Manage Projects Form ─────────────────────────────────────────────────────

const projectForm = document.getElementById("projectForm");
if (projectForm) {
    // Proteksi halaman: hanya admin yang sudah login boleh mengakses
    if (!isLoggedIn() && !localStorage.getItem("adminToken")) {
        alert("Akses ditolak");
        window.location.href = "index.html";
    }

    const imageInput = document.getElementById("projectImage");
    const imagePreview = document.getElementById("imagePreview");
    const projectIdInput = document.getElementById("projectId");
    const formHeading = document.getElementById("formHeading");
    const formSubtitle = document.getElementById("formSubtitle");
    const submitBtn = document.getElementById("submitBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const resetBtn = document.getElementById("resetBtn");
    const imageHint = document.getElementById("imageHint");
    const messageEl = document.getElementById("formMessage");

    let imageDataArray = [];
    let keepExistingImages = [];
    // Menyimpan objek File asli untuk dikirim ke backend (Data URL hanya untuk preview)
    let selectedFiles = [];

    function renderPreviewGrid() {
        const all = keepExistingImages.concat(imageDataArray);
        if (all.length === 0) {
            imagePreview.innerHTML = "";
            return;
        }
        imagePreview.innerHTML = all
            .map(function (src, i) {
                return (
                    `<div class="preview-thumb">` +
                    `<img src="${src}" alt="Preview ${i + 1}">` +
                    `<button type="button" class="preview-remove" data-index="${i}" aria-label="Remove image">&times;</button>` +
                    `</div>`
                );
            })
            .join("");
    }

    imagePreview.addEventListener("click", function (e) {
        const btn = e.target.closest(".preview-remove");
        if (!btn) return;
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        const totalExisting = keepExistingImages.length;
        if (idx < totalExisting) {
            keepExistingImages.splice(idx, 1);
        } else {
            imageDataArray.splice(idx - totalExisting, 1);
            // Hapus juga File yang bersesuaian dari selectedFiles
            const fileIdx = idx - totalExisting;
            if (fileIdx >= 0 && fileIdx < selectedFiles.length) {
                selectedFiles.splice(fileIdx, 1);
            }
        }
        renderPreviewGrid();
    });

    function resetFormMode() {
        projectIdInput.value = "";
        imageDataArray = [];
        keepExistingImages = [];
        selectedFiles = [];
        imageInput.value = "";
        imageInput.required = false;
        imageHint.textContent = "Images are disabled for now.";
        formHeading.textContent = "ADD PROJECT";
        formSubtitle.textContent = "Fill in the details for a new portfolio project";
        submitBtn.textContent = "Save Project";
        cancelEditBtn.hidden = true;
        resetBtn.hidden = false;
        messageEl.textContent = "";
        messageEl.className = "form-message";
        projectForm.reset();
        renderPreviewGrid();
    }

    function fillFormForEdit(project) {
        projectIdInput.value = project.id;
        document.getElementById("projectTitle").value = project.title;
        document.getElementById("projectDescription").value = project.description;
        document.getElementById("projectLink").value = project.link || "";
        keepExistingImages = (project.images || []).slice();
        imageDataArray = [];
        selectedFiles = [];
        imageInput.value = "";
        imageInput.required = false;
        imageHint.textContent = "Leave empty to keep existing images, or add more.";
        renderPreviewGrid();
        formHeading.textContent = "EDIT PROJECT";
        formSubtitle.textContent = "Update the selected project details";
        submitBtn.textContent = "Update Project";
        cancelEditBtn.hidden = false;
        resetBtn.hidden = true;
        messageEl.textContent = "";
        messageEl.className = "form-message";
        projectForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function renderManageList() {
        const listEl = document.getElementById("manageProjectsList");
        if (!listEl) return;

        fetch("https://my-portofolio-7o3h.vercel.app/api/projects")
            .then(res => res.json())
            .then(result => {
                const projects = (result.data || []).slice().sort((a, b) => Number(b.id) - Number(a.id));
                const countEl = document.getElementById("projectCount");
                if (countEl) {
                    countEl.textContent =
                        projects.length === 0
                            ? "No projects yet"
                            : "Showing " + projects.length + " project" + (projects.length === 1 ? "" : "s");
                }

                if (projects.length === 0) {
                    listEl.innerHTML =
                        '<p class="empty-list">No projects yet. Add one using the form above.</p>';
                    return;
                }

                listEl.innerHTML = projects
                    .map(function (project) {
                        const imgs = project.images || [];
                        const linkHtml = project.link
                            ? `<a href="${escapeHtml(project.link)}" target="_blank" rel="noopener" class="manage-link">Open Link</a>`
                            : '<span class="no-link">No link</span>';

                        const thumbsHtml = imgs.length > 0
                            ? `<div class="manage-thumbs">` +
                              imgs.map(function (src, i) {
                                  return `<img src="${src}" alt="${escapeHtml(project.title)}" class="clickable-image manage-thumb" data-project-id="${project.id}" data-img-index="${i}" title="Click to view full image">`;
                              }).join("") +
                              `</div>`
                            : "";

                        return (
                            `<div class="manage-card" data-id="${project.id}">` +
                            thumbsHtml +
                            `<div class="manage-card-body">` +
                            `<h3>${escapeHtml(project.title)}</h3>` +
                            `<p>${escapeHtml(project.description)}</p>` +
                            linkHtml +
                            `<div class="manage-actions">` +
                            `<button type="button" class="btn-edit" data-edit="${project.id}"><i class="fa-solid fa-pen"></i> Edit</button>` +
                            `<button type="button" class="btn-delete" data-delete="${project.id}"><i class="fa-solid fa-trash"></i> Delete</button>` +
                            `</div></div></div>`
                        );
                    })
                    .join("");
            })
            .catch(err => {
                console.error("Error loading manage projects:", err);
                listEl.innerHTML = '<p class="empty-list">Failed to load projects from server.</p>';
            });
    }

    imageInput.addEventListener("change", function () {
        const files = Array.from(this.files);
        if (files.length === 0) return;

        // Simpan objek File asli untuk nanti dikirim ke backend lewat FormData
        selectedFiles = selectedFiles.concat(files);

        let loaded = 0;
        files.forEach(function (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imageDataArray.push(e.target.result);
                loaded++;
                if (loaded === files.length) {
                    renderPreviewGrid();
                }
            };
            reader.readAsDataURL(file);
        });
        imageInput.value = "";
    });

    projectForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const title = document.getElementById("projectTitle").value.trim();
        const description = document.getElementById("projectDescription").value.trim();
        const link = document.getElementById("projectLink").value.trim();
        const editId = projectIdInput.value;

        if (!title || !description) {
            messageEl.textContent = "Title and description are required.";
            messageEl.className = "form-message error";
            return;
        }

        // Bangun FormData (multipart/form-data) — jangan pakai Content-Type agar
        // browser yang mengatur boundary secara otomatis.
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("link", link || "");

        // Lampirkan setiap file gambar yang dipilih
        selectedFiles.forEach(function (file) {
            formData.append("image", file);
        });

        // Pilih method & URL sesuai mode (tambah = POST, edit = PUT)
        const isEdit = !!editId;
        const method = isEdit ? "PUT" : "POST";
        const url = isEdit
            ? `https://my-portofolio-7o3h.vercel.app/api/projects/${editId}`
            : "https://my-portofolio-7o3h.vercel.app/api/projects";

        fetch(url, {
            method: method,
            body: formData
        })
            .then(function (res) {
                return res.json();
            })
            .then(function (resData) {
                if (resData.success) {
                    alert(resData.success && isEdit
                        ? "Project updated successfully!"
                        : "Project saved successfully!");
                    // Bersihkan state form
                    projectIdInput.value = "";
                    imageDataArray = [];
                    keepExistingImages = [];
                    selectedFiles = [];
                    imageInput.value = "";
                    projectForm.reset();
                    renderPreviewGrid();
                    // Kembali ke halaman utama
                    window.location.href = "index.html";
                } else {
                    messageEl.textContent = resData.message || "Failed to save project.";
                    messageEl.className = "form-message error";
                }
            })
            .catch(function (err) {
                console.error("Error saving project:", err);
                messageEl.textContent = "Error saving project to server.";
                messageEl.className = "form-message error";
            });
    });

    projectForm.addEventListener("reset", function () {
        if (projectIdInput.value) return;
        setTimeout(function () {
            imageDataArray = [];
            keepExistingImages = [];
            selectedFiles = [];
            renderPreviewGrid();
            messageEl.textContent = "";
            messageEl.className = "form-message";
        }, 0);
    });

    cancelEditBtn.addEventListener("click", function () {
        resetFormMode();
    });

    document.getElementById("manageProjectsList").addEventListener("click", function (e) {
        const thumb = e.target.closest("[data-project-id][data-img-index]");
        if (thumb) {
            const pid = thumb.getAttribute("data-project-id");
            const startIdx = parseInt(thumb.getAttribute("data-img-index"), 10);
            const project = getProjects().find(function (p) {
                return String(p.id) === String(pid);
            });
            if (project && project.images && project.images.length > 0) {
                openLightbox(project.images, startIdx, project.title);
            }
            return;
        }

        const editBtn = e.target.closest("[data-edit]");
        const deleteBtn = e.target.closest("[data-delete]");

        if (editBtn) {
            const id = editBtn.getAttribute("data-edit");
            fetch("https://my-portofolio-7o3h.vercel.app/api/projects")
                .then(res => res.json())
                .then(result => {
                    const project = (result.data || []).find(function (p) {
                        return String(p.id) === String(id);
                    });
                    if (project) fillFormForEdit(project);
                })
                .catch(err => {
                    console.error("Error fetching project for edit:", err);
                });
            return;
        }

        if (deleteBtn) {
            const id = deleteBtn.getAttribute("data-delete");
            if (!confirm("Are you sure you want to delete this project?")) return;

            fetch(`https://my-portofolio-7o3h.vercel.app/api/projects/${id}`, {
                method: "DELETE"
            })
            .then(res => res.json())
            .then(resData => {
                if (resData.success) {
                    if (String(projectIdInput.value) === String(id)) {
                        resetFormMode();
                    }
                    renderManageList();
                    messageEl.textContent = "Project deleted successfully.";
                    messageEl.className = "form-message success";
                } else {
                    messageEl.textContent = resData.message || "Failed to delete project.";
                    messageEl.className = "form-message error";
                }
            })
            .catch(err => {
                console.error("Error deleting project:", err);
                messageEl.textContent = "Error deleting project on server.";
                messageEl.className = "form-message error";
            });
        }
    });

    renderManageList();
}

// ─── Manage Tabs (Projects / Experience) ─────────────────────────────────────

const tabProjectsBtn = document.getElementById("tabProjects");
const tabExperienceBtn = document.getElementById("tabExperience");

if (tabProjectsBtn && tabExperienceBtn) {
    function switchTab(tabId) {
        document.querySelectorAll(".manage-tab").forEach(function (t) {
            t.classList.toggle("active", t.getAttribute("data-tab") === tabId);
        });
        document.querySelectorAll(".manage-tab-panel").forEach(function (p) {
            p.hidden = p.id !== tabId;
        });
    }
    tabProjectsBtn.addEventListener("click", function () {
        switchTab("projects-tab");
    });
    tabExperienceBtn.addEventListener("click", function () {
        switchTab("experience-tab");
    });
}

// ─── Manage Experiences Form ─────────────────────────────────────────────────

const experienceForm = document.getElementById("experienceForm");
if (experienceForm) {
    const expImageInput = document.getElementById("experienceImage");
    const expImagePreview = document.getElementById("expImagePreview");
    const expIdInput = document.getElementById("experienceId");
    const expFormHeading = document.getElementById("expFormHeading");
    const expFormSubtitle = document.getElementById("expFormSubtitle");
    const expSubmitBtn = document.getElementById("expSubmitBtn");
    const expCancelEditBtn = document.getElementById("cancelExpEditBtn");
    const expResetBtn = document.getElementById("expResetBtn");
    const expMessageEl = document.getElementById("expFormMessage");

    let expImageDataArray = [];
    let expKeepExistingImages = [];
    let expSelectedFiles = [];

    function renderExpPreviewGrid() {
        const all = expKeepExistingImages.concat(expImageDataArray);
        if (all.length === 0) {
            expImagePreview.innerHTML = "";
            return;
        }
        expImagePreview.innerHTML = all
            .map(function (src, i) {
                return (
                    '<div class="preview-thumb">' +
                    '<img src="' + src + '" alt="Preview ' + (i + 1) + '">' +
                    '<button type="button" class="preview-remove" data-index="' + i + '" aria-label="Remove image">&times;</button>' +
                    '</div>'
                );
            })
            .join("");
    }

    expImagePreview.addEventListener("click", function (e) {
        const btn = e.target.closest(".preview-remove");
        if (!btn) return;
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        const totalExisting = expKeepExistingImages.length;
        if (idx < totalExisting) {
            expKeepExistingImages.splice(idx, 1);
        } else {
            expImageDataArray.splice(idx - totalExisting, 1);
            const fileIdx = idx - totalExisting;
            if (fileIdx >= 0 && fileIdx < expSelectedFiles.length) {
                expSelectedFiles.splice(fileIdx, 1);
            }
        }
        renderExpPreviewGrid();
    });

    function resetExpFormMode() {
        expIdInput.value = "";
        expImageDataArray = [];
        expKeepExistingImages = [];
        expSelectedFiles = [];
        expImageInput.value = "";
        expFormHeading.textContent = "ADD EXPERIENCE";
        expFormSubtitle.textContent = "Fill in the details for a new work experience";
        expSubmitBtn.textContent = "Save Experience";
        expCancelEditBtn.hidden = true;
        expResetBtn.hidden = false;
        expMessageEl.textContent = "";
        expMessageEl.className = "form-message";
        experienceForm.reset();
        renderExpPreviewGrid();
    }

    function fillExpFormForEdit(exp) {
        expIdInput.value = exp.id;
        document.getElementById("experienceRole").value = exp.role || "";
        document.getElementById("experienceCompany").value = exp.company || "";
        document.getElementById("experiencePeriod").value = exp.period || "";
        document.getElementById("experienceDescription").value = exp.description || "";
        document.getElementById("experienceSkills").value = (exp.skills || []).join(", ");
        expKeepExistingImages = (exp.images || []).slice();
        expImageDataArray = [];
        expSelectedFiles = [];
        expImageInput.value = "";
        renderExpPreviewGrid();
        expFormHeading.textContent = "EDIT EXPERIENCE";
        expFormSubtitle.textContent = "Update the selected experience details";
        expSubmitBtn.textContent = "Update Experience";
        expCancelEditBtn.hidden = false;
        expResetBtn.hidden = true;
        expMessageEl.textContent = "";
        expMessageEl.className = "form-message";
        experienceForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function renderManageExperiencesList() {
        const listEl = document.getElementById("manageExperiencesList");
        if (!listEl) return;

        fetch(API_BASE_URL + "/experiences")
            .then(res => res.json())
            .then(result => {
                const exps = (result.data || []).slice().sort((a, b) => Number(b.id) - Number(a.id));
                const countEl = document.getElementById("experienceCount");
                if (countEl) {
                    countEl.textContent =
                        exps.length === 0
                            ? "No experiences yet"
                            : "Showing " + exps.length + " experience" + (exps.length === 1 ? "" : "s");
                }

                if (exps.length === 0) {
                    listEl.innerHTML = '<p class="empty-list">No experiences yet. Add one using the form above.</p>';
                    return;
                }

                listEl.innerHTML = exps
                    .map(function (exp) {
                        const imgs = exp.images || [];
                        const skillsHtml = (exp.skills || []).length > 0
                            ? '<div class="manage-skill-tags">' +
                              exp.skills.map(function (s) {
                                  return '<span class="manage-skill-tag">' + escapeHtml(s) + '</span>';
                              }).join("") +
                              '</div>'
                            : "";

                        const thumbsHtml = imgs.length > 0
                            ? '<div class="manage-thumbs">' +
                              imgs.map(function (src, i) {
                                  return '<img src="' + src + '" alt="' + escapeHtml(exp.role) + '" class="clickable-image manage-thumb" data-exp-id="' + exp.id + '" data-img-index="' + i + '" title="Click to view full image">';
                              }).join("") +
                              '</div>'
                            : "";

                        return (
                            '<div class="manage-card" data-id="' + exp.id + '">' +
                            thumbsHtml +
                            '<div class="manage-card-body">' +
                            '<h3>' + escapeHtml(exp.role) + ' - ' + escapeHtml(exp.company) + '</h3>' +
                            '<p class="manage-period">' + escapeHtml(exp.period) + '</p>' +
                            '<p>' + escapeHtml(exp.description) + '</p>' +
                            skillsHtml +
                            '<div class="manage-actions">' +
                            '<button type="button" class="btn-edit" data-exp-edit="' + exp.id + '"><i class="fa-solid fa-pen"></i> Edit</button>' +
                            '<button type="button" class="btn-delete" data-exp-delete="' + exp.id + '"><i class="fa-solid fa-trash"></i> Delete</button>' +
                            '</div></div></div>'
                        );
                    })
                    .join("");
            })
            .catch(err => {
                console.error("Error loading manage experiences:", err);
                listEl.innerHTML = '<p class="empty-list">Failed to load experiences from server.</p>';
            });
    }

    expImageInput.addEventListener("change", function () {
        const files = Array.from(this.files);
        if (files.length === 0) return;

        expSelectedFiles = expSelectedFiles.concat(files);

        let loaded = 0;
        files.forEach(function (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                expImageDataArray.push(e.target.result);
                loaded++;
                if (loaded === files.length) {
                    renderExpPreviewGrid();
                }
            };
            reader.readAsDataURL(file);
        });
        expImageInput.value = "";
    });

    experienceForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const role = document.getElementById("experienceRole").value.trim();
        const company = document.getElementById("experienceCompany").value.trim();
        const period = document.getElementById("experiencePeriod").value.trim();
        const description = document.getElementById("experienceDescription").value.trim();
        const skillsRaw = document.getElementById("experienceSkills").value.trim();
        const editId = expIdInput.value;

        if (!role || !company || !period || !description) {
            expMessageEl.textContent = "Role, company, period, and description are required.";
            expMessageEl.className = "form-message error";
            return;
        }

        const skillsArray = skillsRaw
            ? skillsRaw.split(",").map(function (s) { return s.trim(); }).filter(Boolean)
            : [];

        const formData = new FormData();
        formData.append("role", role);
        formData.append("company", company);
        formData.append("period", period);
        formData.append("description", description);
        formData.append("skills", JSON.stringify(skillsArray));

        expSelectedFiles.forEach(function (file) {
            formData.append("image", file);
        });

        const isEdit = !!editId;
        const method = isEdit ? "PUT" : "POST";
        const url = isEdit
            ? API_BASE_URL + "/experiences/" + editId
            : API_BASE_URL + "/experiences";

        fetch(url, {
            method: method,
            body: formData
        })
            .then(function (res) {
                return res.json();
            })
            .then(function (resData) {
                if (resData.success) {
                    alert(isEdit
                        ? "Experience updated successfully!"
                        : "Experience saved successfully!");
                    expIdInput.value = "";
                    expImageDataArray = [];
                    expKeepExistingImages = [];
                    expSelectedFiles = [];
                    expImageInput.value = "";
                    experienceForm.reset();
                    renderExpPreviewGrid();
                    renderManageExperiencesList();
                    resetExpFormMode();
                } else {
                    expMessageEl.textContent = resData.message || "Failed to save experience.";
                    expMessageEl.className = "form-message error";
                }
            })
            .catch(function (err) {
                console.error("Error saving experience:", err);
                expMessageEl.textContent = "Error saving experience to server.";
                expMessageEl.className = "form-message error";
            });
    });

    experienceForm.addEventListener("reset", function () {
        if (expIdInput.value) return;
        setTimeout(function () {
            expImageDataArray = [];
            expKeepExistingImages = [];
            expSelectedFiles = [];
            renderExpPreviewGrid();
            expMessageEl.textContent = "";
            expMessageEl.className = "form-message";
        }, 0);
    });

    expCancelEditBtn.addEventListener("click", function () {
        resetExpFormMode();
    });

    document.getElementById("manageExperiencesList").addEventListener("click", function (e) {
        const thumb = e.target.closest("[data-exp-id][data-img-index]");
        if (thumb) {
            const expId = thumb.getAttribute("data-exp-id");
            const startIdx = parseInt(thumb.getAttribute("data-img-index"), 10);
            fetch(API_BASE_URL + "/experiences")
                .then(res => res.json())
                .then(result => {
                    const exp = (result.data || []).find(function (x) {
                        return String(x.id) === String(expId);
                    });
                    if (exp && exp.images && exp.images.length > 0) {
                        openLightbox(exp.images, startIdx, exp.role + " - " + exp.company);
                    }
                })
                .catch(err => {
                    console.error("Error fetching experience for lightbox:", err);
                });
            return;
        }

        const editBtn = e.target.closest("[data-exp-edit]");
        const deleteBtn = e.target.closest("[data-exp-delete]");

        if (editBtn) {
            const id = editBtn.getAttribute("data-exp-edit");
            fetch(API_BASE_URL + "/experiences")
                .then(res => res.json())
                .then(result => {
                    const exp = (result.data || []).find(function (x) {
                        return String(x.id) === String(id);
                    });
                    if (exp) fillExpFormForEdit(exp);
                })
                .catch(err => {
                    console.error("Error fetching experience for edit:", err);
                });
            return;
        }

        if (deleteBtn) {
            const id = deleteBtn.getAttribute("data-exp-delete");
            if (!confirm("Are you sure you want to delete this experience?")) return;

            fetch(API_BASE_URL + "/experiences/" + id, {
                method: "DELETE"
            })
                .then(res => res.json())
                .then(resData => {
                    if (resData.success) {
                        if (String(expIdInput.value) === String(id)) {
                            resetExpFormMode();
                        }
                        renderManageExperiencesList();
                        expMessageEl.textContent = "Experience deleted successfully.";
                        expMessageEl.className = "form-message success";
                    } else {
                        expMessageEl.textContent = resData.message || "Failed to delete experience.";
                        expMessageEl.className = "form-message error";
                    }
                })
                .catch(err => {
                    console.error("Error deleting experience:", err);
                    expMessageEl.textContent = "Error deleting experience on server.";
                    expMessageEl.className = "form-message error";
                });
        }
    });

    renderManageExperiencesList();
}

// ─── Logout ───────────────────────────────────────────────────────────────────

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        // Hapus semua data otentikasi dari localStorage
        localStorage.removeItem("adminToken");
        setLoggedIn(false);
        window.location.href = "index.html";
    });
}

// ─── Public Projects Page ─────────────────────────────────────────────────────

const projectsContainer = document.querySelector(".projects-container");
if (projectsContainer && document.getElementById("projects")) {
    projectsContainer.innerHTML = '<p class="empty-list">Loading projects...</p>';

    fetch("https://my-portofolio-7o3h.vercel.app/api/projects")
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            const saved = result.data || [];
            projectsContainer.innerHTML = "";

            if (saved.length === 0) {
                projectsContainer.innerHTML =
                    '<p class="empty-list">No projects to display yet.</p>';
            } else {
                const firstThree = saved.slice(0, 3);
                const rest = saved.slice(3);

                function buildCard(project, idx) {
                    const imgs = project.images || [];
                    const card = document.createElement("div");
                    card.className = "projects-card";

                    if (imgs.length > 0) {
                        card.classList.add("projects-card-clickable");
                        card.setAttribute("data-project-idx", String(idx));
                        card.setAttribute("title", "Click to view images");
                        card.setAttribute("role", "button");
                        card.setAttribute("tabindex", "0");
                    }

                    let html = "";
                    if (imgs.length > 0) {
                        html += `<div class="card-img-wrap">`;
                        html += `<img src="${imgs[0]}" alt="${escapeHtml(project.title)}" class="clickable-image">`;
                        if (imgs.length > 1) {
                            html += `<span class="img-count-badge"><i class="fa-solid fa-images"></i> ${imgs.length}</span>`;
                        }
                        html += `</div>`;
                    }
                    html += `<h3>${escapeHtml(project.title)}</h3><br>`;
                    html += `<p>${escapeHtml(project.description)}</p><br>`;
                    if (project.link) {
                        html += `<a href="${escapeHtml(project.link)}" target="_blank" rel="noopener" class="project-link">View Project</a>`;
                    }
                    card.innerHTML = html;
                    return card;
                }

                const rowFirst = document.createElement("div");
                rowFirst.className = "projects-row-first";
                firstThree.forEach(function (project, i) {
                    rowFirst.appendChild(buildCard(project, i));
                });
                projectsContainer.appendChild(rowFirst);

                if (rest.length > 0) {
                    const rowRest = document.createElement("div");
                    rowRest.className = "projects-row-rest";
                    rest.forEach(function (project, i) {
                        rowRest.appendChild(buildCard(project, i + 3));
                    });
                    projectsContainer.appendChild(rowRest);
                }
            }

            projectsContainer.addEventListener("click", function (e) {
                if (e.target.closest("a")) return;
                const card = e.target.closest("[data-project-idx]");
                if (!card) return;
                const idx = parseInt(card.getAttribute("data-project-idx"), 10);
                const project = saved[idx];
                if (project && project.images && project.images.length > 0) {
                    openLightbox(project.images, 0, project.title);
                }
            });

            projectsContainer.addEventListener("keydown", function (e) {
                if (e.key !== "Enter" && e.key !== " ") return;
                const card = e.target.closest("[data-project-idx]");
                if (!card) return;
                e.preventDefault();
                const idx = parseInt(card.getAttribute("data-project-idx"), 10);
                const project = saved[idx];
                if (project && project.images && project.images.length > 0) {
                    openLightbox(project.images, 0, project.title);
                }
            });
        })
        .catch(function (error) {
            console.error("Error fetching projects:", error);
            projectsContainer.innerHTML = '<p class="empty-list">Failed to load projects. Please try again later.</p>';
        });
}

// ─── Public Experience Timeline ──────────────────────────────────────────────

const timelineContainer = document.querySelector(".timeline");
if (timelineContainer && document.getElementById("experience")) {
    timelineContainer.innerHTML = '<p class="empty-list">Loading experiences...</p>';

    fetch(API_BASE_URL + "/experiences")
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            const exps = result.data || [];
            timelineContainer.innerHTML = "";

            if (exps.length === 0) {
                timelineContainer.innerHTML = '<p class="empty-list">No experiences to display yet.</p>';
                return;
            }

            exps.forEach(function (exp, idx) {
                const skillsHtml = (exp.skills || []).length > 0
                    ? '<div class="timeline-skills">' +
                      exp.skills.map(function (s) {
                          return '<span class="skill-badge">' + escapeHtml(s) + '</span>';
                      }).join("") +
                      '</div>'
                    : "";

                const docsHtml = (exp.images && exp.images.length > 0)
                    ? '<button type="button" class="timeline-docs-btn" data-exp-idx="' + idx + '"><i class="fa-solid fa-images"></i> Lihat Dokumentasi</button>'
                    : "";

                const item = document.createElement("div");
                item.className = "timeline-item";
                item.innerHTML =
                    '<div class="timeline-dot"></div>' +
                    '<div class="timeline-content">' +
                    '<span class="timeline-period">' + escapeHtml(exp.period) + '</span>' +
                    '<h3>' + escapeHtml(exp.role) + '</h3>' +
                    '<h4 class="timeline-company">' + escapeHtml(exp.company) + '</h4>' +
                    '<p>' + escapeHtml(exp.description) + '</p>' +
                    skillsHtml +
                    docsHtml +
                    '</div>';
                timelineContainer.appendChild(item);
            });

            timelineContainer.addEventListener("click", function (e) {
                const btn = e.target.closest("[data-exp-idx]");
                if (!btn) return;
                const idx = parseInt(btn.getAttribute("data-exp-idx"), 10);
                const exp = exps[idx];
                if (exp && exp.images && exp.images.length > 0) {
                    openLightbox(exp.images, 0, exp.role + " - " + exp.company);
                }
            });
        })
        .catch(function (error) {
            console.error("Error fetching experiences:", error);
            timelineContainer.innerHTML = '<p class="empty-list">Failed to load experiences. Please try again later.</p>';
        });
}

// 3D Cube Carousel Logic
document.addEventListener('DOMContentLoaded', () => {
    const cube = document.getElementById('cube');
    const prevBtn = document.getElementById('prevCube');
    const nextBtn = document.getElementById('nextCube');
    
    if (cube && prevBtn && nextBtn) {
        let currentRotation = 0;
        
        function rotateCube(direction) {
            if (direction === 'next') {
                currentRotation -= 90;
            } else {
                currentRotation += 90;
            }
            cube.style.transform = `rotateY(${currentRotation}deg)`;
        }
        
        prevBtn.addEventListener('click', () => rotateCube('prev'));
        nextBtn.addEventListener('click', () => rotateCube('next'));
        
        // Touch events for swipe
        let touchStartX = 0;
        let touchEndX = 0;
        
        cube.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});
        
        cube.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, {passive: true});
        
        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                // Swipe left
                rotateCube('next');
            }
            if (touchEndX > touchStartX + 50) {
                // Swipe right
                rotateCube('prev');
            }
        }
    }
});
