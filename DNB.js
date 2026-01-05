const board = document.getElementById("noticeBoard");

const colors = [
    "paper-yellow",
    "paper-pink",
    "paper-blue",
    "paper-green",
    "paper-purple"
];

loadNotices();

function addNotice() {
    if (!isAdmin()) {
        alert("Only admin can add notices");
        return;
    }

    const input = document.getElementById("noticeInput");
    const text = input.value.trim();

    if (text === "") {
        alert("Please enter a notice");
        return;
    }

    const notice = {
        message: text,
        time: new Date().toLocaleString(),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotate: (Math.random() * 6 - 3).toFixed(1)
    };

    const notices = getNotices();
    notices.push(notice);
    localStorage.setItem("notices", JSON.stringify(notices));

    input.value = "";
    displayNotices();
}

function displayNotices() {
    board.innerHTML = "";
    const notices = getNotices();

    notices.forEach((n, i) => {
        const div = document.createElement("div");
        div.className = `notice ${n.color}`;
        div.style.setProperty("--rotate", `${n.rotate}deg`);

        // Message
        const p = document.createElement("p");
        p.textContent = n.message;
        div.appendChild(p);

        // Time
        const small = document.createElement("small");
        small.textContent = n.time;
        div.appendChild(small);

        // Delete button
        const del = document.createElement("button");
        del.className = "delete";
        del.title = "Delete notice";
        del.textContent = "×";
        del.addEventListener('click', () => deleteNotice(i));
        div.appendChild(del);

        board.appendChild(div);
    });
}

function deleteNotice(index) {
    const notices = getNotices();
    notices.splice(index, 1);
    localStorage.setItem("notices", JSON.stringify(notices));
    displayNotices();
}

function getNotices() {
    return JSON.parse(localStorage.getItem("notices")) || [];
}

function loadNotices() {
    displayNotices();
}

const ADMIN_PASSWORD = "teacher123";

function adminLogin() {
    const password = prompt("Enter Admin Password:");

    if (password === ADMIN_PASSWORD) {
        localStorage.setItem("isAdmin", "true");
        alert("Admin access granted");
        updateUI();
    } else {
        alert("Incorrect password");
    }
}

function adminLogout() {
    localStorage.removeItem("isAdmin");
    alert("Logged out");
    updateUI();
}

function isAdmin() {
    return localStorage.getItem("isAdmin") === "true";
}

function updateUI() {
    const input = document.getElementById("noticeInput");
    const addBtn = document.getElementById("addBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (isAdmin()) {
        input.disabled = false;
        input.placeholder = "Enter notice here";
        addBtn.disabled = false;
        logoutBtn.style.display = "inline-block";
    } else {
        input.disabled = true;
        input.placeholder = "Admin only — please login";
        addBtn.disabled = true;
        logoutBtn.style.display = "none";
    }

    displayNotices();
}

updateUI();