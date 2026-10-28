function navigate(page) {
    document.querySelectorAll('.page').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-links button').forEach(btn => btn.classList.remove('active'));

    const targetSection = document.getElementById(`page-${page}`);
    if (targetSection) targetSection.classList.add('active');

    const activeBtn = document.getElementById(`nav-${page}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (page === 'browse') loadBrowseBooks();
    if (page === 'search') handleSearch();
    if (page === 'dashboard') loadDashboard();
    if (page === 'manage') loadManageBooks();
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function renderBookCards(books, containerId) {
    const container = document.getElementById(containerId);
    if (!books || books.length === 0) {
        container.innerHTML = `<p>No books found.</p>`;
        return;
    }
    container.innerHTML = books.map(book => `
        <div class="book-card">
            <div>
                <h3>${book.TITLE}</h3>
                <p class="book-author">by ${book.AUTHOR}</p>
                <span class="badge">${book.GENRE || 'General'}</span>
            </div>
            <div class="book-meta">
                <span class="price-tag">$${Number(book.PRICE).toFixed(2)}</span>
                <button class="btn-outline" onclick="viewBookDetails(${book.ID})">View Details</button>
            </div>
        </div>
    `).join('');
}

async function loadBrowseBooks() {
    const res = await fetch('/api/books');
    const books = await res.json();
    renderBookCards(books, 'browse-grid');
}

async function handleSearch() {
    const query = document.getElementById('search-input').value;
    const res = await fetch(`/api/books?q=${encodeURIComponent(query)}`);
    const books = await res.json();
    renderBookCards(books, 'search-results');
}

async function viewBookDetails(id) {
    const res = await fetch(`/api/books/${id}`);
    if (!res.ok) return showToast('Book not found');
    const b = await res.json();

    document.getElementById('book-details-card').innerHTML = `
        <h2>${b.TITLE}</h2>
        <p class="book-author">By <strong>${b.AUTHOR}</strong></p>
        <div class="details-meta">
            <p><strong>Genre:</strong> ${b.GENRE || 'N/A'}</p>
            <p><strong>Price:</strong> $${Number(b.PRICE).toFixed(2)}</p>
            <p><strong>Published Year:</strong> ${b.PUBLISHED_YEAR || 'N/A'}</p>
            <p><strong>ISBN:</strong> ${b.ISBN || 'N/A'}</p>
        </div>
        <div class="details-desc">
            <strong>Description:</strong>
            <p style="margin-top:0.4rem;">${b.DESCRIPTION || 'No description provided.'}</p>
        </div>
    `;
    navigate('details');
}

async function loadDashboard() {
    const res = await fetch('/api/stats');
    const data = await res.json();
    document.getElementById('stat-total-books').textContent = data.totalBooks;
    document.getElementById('stat-db-mode').textContent = data.dbMode;
}

async function loadManageBooks() {
    const res = await fetch('/api/books');
    const books = await res.json();
    const tbody = document.getElementById('manage-tbody');

    tbody.innerHTML = books.map(b => `
        <tr>
            <td>#${b.ID}</td>
            <td><strong>${b.TITLE}</strong></td>
            <td>${b.AUTHOR}</td>
            <td>${b.GENRE || '-'}</td>
            <td>$${Number(b.PRICE).toFixed(2)}</td>
            <td class="action-btns">
                <button class="btn-outline" onclick="startEditBook(${b.ID})">Edit</button>
                <button class="btn-danger" onclick="deleteBook(${b.ID})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function resetForm() {
    document.getElementById('book-form').reset();
    document.getElementById('book-id').value = '';
    document.getElementById('form-heading').textContent = 'Add New Book';
    document.getElementById('form-submit-btn').textContent = 'Save Book';
}

async function startEditBook(id) {
    const res = await fetch(`/api/books/${id}`);
    const b = await res.json();

    document.getElementById('book-id').value = b.ID;
    document.getElementById('book-title').value = b.TITLE;
    document.getElementById('book-author').value = b.AUTHOR;
    document.getElementById('book-genre').value = b.GENRE || '';
    document.getElementById('book-price').value = b.PRICE;
    document.getElementById('book-year').value = b.PUBLISHED_YEAR || '';
    document.getElementById('book-isbn').value = b.ISBN || '';
    document.getElementById('book-desc').value = b.DESCRIPTION || '';

    document.getElementById('form-heading').textContent = `Edit Book #${b.ID}`;
    document.getElementById('form-submit-btn').textContent = 'Update Book';
    navigate('add');
}

async function submitBookForm(e) {
    e.preventDefault();
    const id = document.getElementById('book-id').value;
    const payload = {
        title: document.getElementById('book-title').value,
        author: document.getElementById('book-author').value,
        genre: document.getElementById('book-genre').value,
        price: document.getElementById('book-price').value,
        published_year: document.getElementById('book-year').value,
        isbn: document.getElementById('book-isbn').value,
        description: document.getElementById('book-desc').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/books/${id}` : '/api/books';

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        showToast(id ? 'Book updated successfully!' : 'Book added successfully!');
        resetForm();
        navigate('manage');
    } else {
        const err = await res.json();
        showToast('Error: ' + (err.error || 'Could not save book'));
    }
}

async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book record?')) return;
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
    if (res.ok) {
        showToast('Book deleted.');
        loadManageBooks();
    }
}
