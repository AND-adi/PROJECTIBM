// --- 1. CONFIG & STATE ---
        const ADMIN_PASSWORD = "admin123";
        let isAdminAuthenticated = false;
        let deleteId = null;

        let notices = JSON.parse(localStorage.getItem('secure_notices_db')) || [
            { 
                id: 1, 
                title: "Welcome to NoticeBoard Pro", 
                content: "You can filter notices by category, search by keyword, or switch to Admin mode (pwd: admin123) to manage the content.", 
                category: "general", 
                timestamp: "Jan 09, 11:00 PM" 
            }
        ];

        let currentMode = 'user';

        // --- 2. AUTHENTICATION LOGIC --

        function handleAdminNav() {
            if (isAdminAuthenticated) {
                showView('admin');
            } else {
                openLogin();
            }
        }

        function openLogin() {
            document.getElementById('loginModal').style.display = 'flex';
            document.getElementById('passwordInput').focus();
        }

        function closeLogin() {
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('passwordInput').value = '';
        }

        function verifyPassword() {
            const passInput = document.getElementById('passwordInput');
            if (passInput.value === ADMIN_PASSWORD) {
                isAdminAuthenticated = true;
                showToast("🔓 Authentication Successful");
                closeLogin();
                showView('admin');
            } else {
                passInput.classList.add('shake');
                setTimeout(() => passInput.classList.remove('shake'), 400);
                showToast("❌ Incorrect Password");
            }
        }

        function logoutAdmin() {
            isAdminAuthenticated = false;
            showView('user');
            showToast("🔒 Session Closed");
        }

        // --- 3. UI & VIEW CONTROLS ---

        function showView(mode) {
            currentMode = mode;
            document.getElementById('userNavBtn').classList.toggle('active', mode === 'user');
            document.getElementById('adminNavBtn').classList.toggle('active', mode === 'admin');
            document.getElementById('adminPanel').style.display = (mode === 'admin') ? 'block' : 'none';
            renderNotices();
        }

        function toggleTheme() {
            const body = document.body;
            const icon = document.getElementById('theme-icon');
            const isLight = body.getAttribute('data-theme') === 'light';
            body.setAttribute('data-theme', isLight ? 'dark' : 'light');
            
            icon.innerHTML = isLight ? 
                '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' : 
                '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
        }

        function updateCounter(inputId, counterId, max) {
            const input = document.getElementById(inputId);
            if (!input) return;
            const count = input.value.length;
            document.getElementById(counterId).innerText = `${count}/${max}`;
        }

        // Attach event listeners for character counting
        document.getElementById('titleInput').addEventListener('input', () => updateCounter('titleInput', 'titleCounter', 50));
        document.getElementById('contentInput').addEventListener('input', () => updateCounter('contentInput', 'contentCounter', 200));

        function showToast(msg) {
            const t = document.getElementById('toast');
            t.innerText = msg; 
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 3000);
        }

        // --- 4. CRUD OPERATIONS ---

        function handleNoticeSubmit() {
            if (!isAdminAuthenticated) return showToast("🔒 Security: Login required");
            
            const title = document.getElementById('titleInput').value.trim();
            const content = document.getElementById('contentInput').value.trim();
            const category = document.getElementById('categoryInput').value;
            const editId = document.getElementById('editId').value;

            if (!title || !content) return showToast("⚠️ Form incomplete");

            if (editId) {
                const idx = notices.findIndex(n => n.id == editId);
                if (idx !== -1) {
                    notices[idx] = { ...notices[idx], title, content, category };
                    showToast("✅ Content Updated");
                }
            } else {
                notices.unshift({
                    id: Date.now(), 
                    title, 
                    content, 
                    category,
                    timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                });
                showToast("🚀 Notice Published");
            }

            saveData();
            resetForm();
            renderNotices();
        }

        function editNotice(id) {
            const n = notices.find(item => item.id === id);
            if (!n) return;

            document.getElementById('editId').value = n.id;
            document.getElementById('titleInput').value = n.title;
            document.getElementById('contentInput').value = n.content;
            document.getElementById('categoryInput').value = n.category;
            
            document.getElementById('formTitle').innerText = "Modify Announcement";
            document.getElementById('submitBtn').innerText = "Save Changes";
            document.getElementById('cancelBtn').style.display = "block";
            
            updateCounter('titleInput', 'titleCounter', 50);
            updateCounter('contentInput', 'contentCounter', 200);
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function openDeleteModal(id) {
            deleteId = id;
            document.getElementById('confirmModal').style.display = 'flex';
        }

        function closeDeleteModal() {
            document.getElementById('confirmModal').style.display = 'none';
            deleteId = null;
        }

        document.getElementById('confirmDeleteBtn').onclick = () => {
            if (deleteId) {
                notices = notices.filter(n => n.id !== deleteId);
                saveData();
                renderNotices();
                closeDeleteModal();
                showToast("🗑️ Announcement Removed");
            }
        };

        function saveData() {
            localStorage.setItem('secure_notices_db', JSON.stringify(notices));
        }

        function resetForm() {
            document.getElementById('editId').value = "";
            document.getElementById('titleInput').value = "";
            document.getElementById('contentInput').value = "";
            document.getElementById('formTitle').innerText = "Create New Announcement";
            document.getElementById('submitBtn').innerText = "🚀 Publish Post";
            document.getElementById('cancelBtn').style.display = "none";
            updateCounter('titleInput', 'titleCounter', 50);
            updateCounter('contentInput', 'contentCounter', 200);
        }

        function copyToClipboard(text) {
            const temp = document.createElement('textarea');
            temp.value = text;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            showToast("📋 Text Copied");
        }

        // --- 5. DATA RENDERING ---

        function renderNotices() {
            const list = document.getElementById('noticeList');
            const searchInput = document.getElementById('searchInput');
            const search = searchInput ? searchInput.value.toLowerCase() : "";
            const filterSelect = document.getElementById('filterSelect');
            const filter = filterSelect ? filterSelect.value : "all";
            
            list.innerHTML = ""; 

            const filtered = notices.filter(n => {
                const matchSearch = n.title.toLowerCase().includes(search) || n.content.toLowerCase().includes(search);
                const matchFilter = filter === 'all' || n.category === filter;
                return matchSearch && matchFilter;
            });

            if (filtered.length === 0) {
                list.innerHTML = `
                    <div style="grid-column:1/-1; text-align:center; padding:50px; opacity:0.6;">
                        <p>No announcements found matching your criteria.</p>
                    </div>
                `;
                return;
            }

            filtered.forEach(n => {
                const card = document.createElement('div');
                card.className = `notice-card ${n.category}`;
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center">
                        <span class="badge badge-${n.category}">${n.category}</span>
                        <button class="btn-copy" onclick="copyToClipboard('${n.content.replace(/'/g, "\\'")}')" title="Copy Text">📋</button>
                    </div>
                    <h3>${n.title}</h3>
                    <p>${n.content}</p>
                    <div class="card-footer">
                        <span class="timestamp">${n.timestamp}</span>
                        <div>
                            ${currentMode === 'admin' ? `
                                <button class="btn-action btn-copy" style="color:var(--primary)" onclick="editNotice(${n.id})">Edit</button>
                                <button class="btn-action btn-copy" style="color:var(--danger)" onclick="openDeleteModal(${n.id})">Delete</button>
                            ` : ''}
                        </div>
                    </div>
                `;
                list.appendChild(card);
            });
        }

        renderNotices();
