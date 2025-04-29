// app.js

let editIndex = null;

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("toggle-btn")) {
        const id = e.target.getAttribute("data-id");
        const fullContent = decodeURIComponent(e.target.getAttribute("data-full"));
        const contentPara = document.getElementById(`note-content-${id}`);
        const isCollapsed = e.target.textContent === "Show More";

        if (isCollapsed) {
            contentPara.textContent = fullContent;
            e.target.textContent = "Show Less";
        } else {
            contentPara.textContent = fullContent.substring(0, 100) + "...";
            e.target.textContent = "Show More";
        }
    }
});



// Toggle Search Bar
document.getElementById("tagFilter").addEventListener("click", function () {
    const searchInput = document.getElementById("searchInput");
    searchInput.classList.toggle("d-none");
    if (!searchInput.classList.contains("d-none")) {
        searchInput.focus();
    } else {
        searchInput.value = "";
        showNotes(); // reset search
    }
});

// Search functionality
document.getElementById("searchInput").addEventListener("input", function () {
    showNotes(this.value.trim().toLowerCase(), document.getElementById("tagFilter").value);
});

// Tag Filter functionality
document.getElementById("tagFilter").addEventListener("change", function () {
    showNotes(document.getElementById("searchInput").value.trim().toLowerCase(), this.value);
});

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();

    auth.signOut().then(() => {
        alert("Logged out successfully!");
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
});

// Add or Save Note
document.getElementById("addNoteBtn").addEventListener("click", function () {
    let title = document.getElementById("noteTitle").value.trim();
    let content = document.getElementById("noteContent").value.trim();
    let tag = document.getElementById("noteTag").value.trim();
    let color = document.getElementById("noteColor").value;

    if (!title || !content) {
        alert("Please fill both title and content!");
        return;
    }

    const user = auth.currentUser;
    if (!user) return;

    if (editIndex !== null) {
        db.collection("users").doc(user.uid).collection("notes").doc(editIndex).update({
            title, content, tag, color
        }).then(() => {
            editIndex = null;
            document.getElementById("addNoteBtn").textContent = "Add Note";
            clearForm();
            showNotes();
            populateTagFilter();
            alert("Note Updated!");
        });
    } else {
        db.collection("users").doc(user.uid).collection("notes").add({
            title, content, tag, color, pinned: false, createdAt: new Date().toISOString()
        }).then(() => {
            clearForm();
            showNotes();
            populateTagFilter();
            alert("Note Added!");
        });
    }
});

// Clear form inputs
function clearForm() {
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";
    document.getElementById("noteTag").value = "";
    document.getElementById("noteColor").value = "#ffffff";
}

// Show all Notes
function showNotes(searchQuery = "", selectedTag = "") {
    const user = auth.currentUser;
    if (!user) return;

    db.collection("users").doc(user.uid).collection("notes").get().then((querySnapshot) => {
        let notesArr = [];
        querySnapshot.forEach((doc) => {
            let note = doc.data();
            note.id = doc.id;
            notesArr.push(note);
        });

        notesArr.sort((a, b) => {
            if (a.pinned === b.pinned) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return b.pinned - a.pinned;
        });

        let html = "";

        notesArr.forEach((note) => {
            let index = note.id;
            let matchesSearch = (
                note.title.toLowerCase().includes(searchQuery) ||
                note.content.toLowerCase().includes(searchQuery) ||
                (note.tag && note.tag.toLowerCase().includes(searchQuery))
            );
            let matchesTag = selectedTag === "" || note.tag === selectedTag;

            if (matchesSearch && matchesTag) {
                html += `
                    <div class="col-md-4 fade-in">
                    <div class="card mb-3" style="background-color: ${note.color || '#ffffff'};">
                        <div class="card-body">
                        <h5 class="card-title">${note.title}</h5>
                        <p class="card-text" id="note-content-${index}">
                            ${note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content}
                        </p>
                        ${note.content.length > 100 ? `
                            <button class="btn btn-sm btn-link p-0 toggle-btn" data-id="${index}" data-full="${encodeURIComponent(note.content)}">Show More</button>
                        ` : ''}
                        <p><small class="text-muted">#${note.tag || 'untagged'}</small></p>
                        <p><small class="text-muted">Created: ${new Date(note.createdAt).toLocaleString()}</small></p>
                        <button class="btn btn-sm btn-outline-primary" onclick="pinNote('${index}')">${note.pinned ? 'Unpin' : 'Pin'}</button>
                        <button class="btn btn-sm btn-warning" onclick="editNote('${index}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteNote('${index}')">Delete</button>
                        </div>
                    </div>
                    </div>`;

            }
        });

        document.getElementById("notes").innerHTML = html || "<p class='text-center w-100'>No matching notes found.</p>";
    });
}

// Populate Tags for filter
function populateTagFilter() {
    const user = auth.currentUser;
    if (!user) return;

    db.collection("users").doc(user.uid).collection("notes").get().then((querySnapshot) => {
        let uniqueTags = new Set();
        querySnapshot.forEach((doc) => {
            let note = doc.data();
            if (note.tag) uniqueTags.add(note.tag);
        });

        const tagFilter = document.getElementById("tagFilter");
        const previousSelectedTag = tagFilter.value;
        tagFilter.innerHTML = '<option value="">All Tags</option>';
        uniqueTags.forEach(tag => {
            tagFilter.innerHTML += `<option value="${tag}">${tag}</option>`;
        });

        if ([...uniqueTags].includes(previousSelectedTag)) {
            tagFilter.value = previousSelectedTag;
        }
    });
}

// Delete a Note
function deleteNote(id) {
    const user = auth.currentUser;
    if (!user) return;

    db.collection("users").doc(user.uid).collection("notes").doc(id).delete().then(() => {
        showNotes();
        populateTagFilter();
        alert("Note Deleted!");
    });
}

// Pin/Unpin Note
function pinNote(id) {
    const user = auth.currentUser;
    if (!user) return;

    db.collection("users").doc(user.uid).collection("notes").doc(id).get().then((doc) => {
        if (doc.exists) {
            let currentPinned = doc.data().pinned;
            db.collection("users").doc(user.uid).collection("notes").doc(id).update({ pinned: !currentPinned }).then(() => {
                showNotes();
                alert(currentPinned ? "Note Unpinned!" : "Note Pinned!");
            });
        }
    });
}

// Edit a Note
function editNote(id) {
    const user = auth.currentUser;
    if (!user) return;

    db.collection("users").doc(user.uid).collection("notes").doc(id).get().then((doc) => {
        if (doc.exists) {
            let note = doc.data();
            document.getElementById("noteTitle").value = note.title;
            document.getElementById("noteContent").value = note.content;
            document.getElementById("noteTag").value = note.tag;
            document.getElementById("noteColor").value = note.color || "#ffffff";
            editIndex = id;
            document.getElementById("addNoteBtn").textContent = "Save Changes";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}
