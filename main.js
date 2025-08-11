class BookmarkApp {
  constructor(form, editModal, editForm, tableBody, tableBodyResult, pagination) {
    // Form elements
    this.form = form;
    this.input = form?.querySelector('[name="url"]');
    this.submitButton = form?.querySelector('[name="submit"]');

    // Edit modal elements
    this.editModal = editModal;
    this.editModalBackdrop = editModal?.querySelector('.backdrop');
    this.editForm = editForm;
    this.editTitleInput = editForm?.querySelector('[name="title"]');
    this.editURLInput = editForm?.querySelector('[name="url"]');
    this.editSubmitButton = editForm?.querySelector('[type="submit"]');
    this.editID = null;

    // Tables
    this.tableBody = tableBody;
    this.tableBodyResult = tableBodyResult;

    // Pagination
    this.maxCount = 20;
    this.currentPage = 0;
    this.pagination = pagination;
    this.paginationList = this.pagination?.querySelector('ul');
    this.paginationButtons = null;
    this.paginationPrev = this.pagination?.querySelector('#previous-page');
    this.paginationNext = this.pagination?.querySelector('#next-page');
    this.batches = [];

    // Data
    this.resultBookmark = {};
    this.bookmarks = [];
  }

  // Storage

  getBookmarks() {
    this.bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    this.resultBookmark = JSON.parse(localStorage.getItem('resultBookmark')) || {};
  }

  setBookmarks() {
    localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    localStorage.setItem('resultBookmark', JSON.stringify(this.resultBookmark));
  }

  // Pagination

  paginationButtonEvents() {
    this.paginationButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.currentPage = Number(button.dataset.setPage);
        this.renderBookmarks();
      });
    });
  }

  checkPagination() {
    this.batches = this.batchArray(this.bookmarks, this.maxCount);

    if (this.pagination) {
      if (this.bookmarks.length > this.maxCount) {
        this.pagination.classList.add('shown');
        this.paginationList.innerHTML = '';

        this.batches.forEach((batch, index) => {
          const pageCount = document.createElement('li');
          const pageButton = document.createElement('button');
          pageButton.innerText = index + 1;
          pageButton.dataset.setPage = index;
          pageCount.appendChild(pageButton);
          this.paginationList.appendChild(pageCount);
        })

        this.paginationButtons = this.paginationList?.querySelectorAll('button');
        this.paginationButtons.forEach(button => {
          if (Number(button.dataset.setPage) === this.currentPage) {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }
        });
        this.paginationButtonEvents()
      } else {
        this.pagination.classList.remove('shown');
      }
    }
  }

  // Rendering

  renderBookmarks() {
    this.tableBody.innerHTML = '';

    if (this.bookmarks.length === 0) {
      this.tableBody.innerHTML = `<tr id="no-bookmarks"><td colspan="3">No Bookmarks added so far...</td></tr>`;
      return;
    }

    this.checkPagination();

    if (this.currentPage >= this.batches.length) {
      this.currentPage = this.batches.length - 1;
    }

    if (this.currentPage < 0) {
      this.currentPage = 0;
    }



    const fragment = document.createDocumentFragment();

    this.batches[this.currentPage].forEach(bookmark => {
      const row = document.createElement('tr');

      row.appendChild(this.createCell(bookmark.title || 'N/A'));
      row.appendChild(this.createLinkCell(bookmark.url));
      row.appendChild(this.createActionButtons(bookmark.id));

      fragment.appendChild(row);
    });

    this.tableBody.appendChild(fragment);
    this.addActionListeners();
  }

  renderResultBookmark() {
    this.tableBodyResult.innerHTML = '';

    if (Object.keys(this.resultBookmark).length === 0) {
      this.tableBodyResult.innerHTML = `<tr id="no-bookmarks"><td colspan="2">There must be a problem.</td></tr>`;
      return;
    }

    const row = document.createElement('tr');
    row.appendChild(this.createCell(this.resultBookmark.title || 'N/A'));
    row.appendChild(this.createLinkCell(this.resultBookmark.url || '#'));
    this.tableBodyResult.appendChild(row);
  }

  createCell(text) {
    const td = document.createElement('td');
    td.textContent = text;
    return td;
  }

  createLinkCell(url) {
    const td = document.createElement('td');
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.textContent = url;
    td.appendChild(link);
    return td;
  }

  createActionButtons(id) {
    const td = document.createElement('td');
    td.innerHTML = `
      <div class="actions">
        <button class="edit-btn" title="Edit Bookmark" data-bookmark-id="${id}">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 19.25L9 18.25L18.2929 8.95711C18.6834 8.56658 18.6834 7.93342 18.2929 7.54289L16.4571 5.70711C16.0666 5.31658 15.4334 5.31658 15.0429 5.70711L5.75 15L4.75 19.25Z"></path>
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.25 19.25H13.75"></path>
          </svg>
        </button>
        <button class="delete-btn" title="Delete Bookmark" data-bookmark-id="${id}">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 7.75L7.59115 17.4233C7.68102 18.4568 8.54622 19.25 9.58363 19.25H14.4164C15.4538 19.25 16.319 18.4568 16.4088 17.4233L17.25 7.75"></path>
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 7.5V6.75C9.75 5.64543 10.6454 4.75 11.75 4.75H12.25C13.3546 4.75 14.25 5.64543 14.25 6.75V7.5"></path>
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 7.75H19"></path>
          </svg>
        </button>
      </div>
    `;
    return td;
  }

  // Actions

  deleteBookmark(id) {
    if (!confirm('Are you sure you want to delete this bookmark?')) return;
    this.bookmarks = this.bookmarks.filter(b => b.id !== id);
    this.setBookmarks();
    this.renderBookmarks();
  }

  async handleSubmit() {
    if (!(await this.validateInput(this.input.value))) {
      this.input.classList.add('invalid');
      return;
    }

    const formData = new FormData(this.form);
    const newBookmark = Object.fromEntries(formData.entries());
    newBookmark.id = Date.now() + Math.floor(Math.random() * 1000);

    this.bookmarks.push(newBookmark);
    this.resultBookmark = newBookmark;

    this.setBookmarks();
    this.renderBookmarks();
    this.resetForm();

    window.location.href = '/result.html';
  }

  async handleEdit() {
    if (!(await this.validateInput(this.editURLInput.value))) {
      this.editURLInput.classList.add('invalid');
      return;
    }

    const formData = new FormData(this.editForm);
    const updatedData = Object.fromEntries(formData.entries());
    const index = this.bookmarks.findIndex(b => b.id === this.editID);

    if (index !== -1) {
      this.bookmarks[index] = { ...this.bookmarks[index], ...updatedData };
      this.setBookmarks();
      this.renderBookmarks();
      this.hideEditModal();
    }
  }

  // Edit Modal

  showEditModal(id) {
    this.editID = id;
    const bookmark = this.bookmarks.find(b => b.id === id);

    if (!bookmark) return;

    this.editModal.style.display = 'grid';
    this.editModal.style.visibility = 'visible';

    this.editTitleInput.value = bookmark.title;
    this.editURLInput.value = bookmark.url;
  }

  hideEditModal() {
    this.editID = null;
    this.editModal.style.display = 'none';
    this.editModal.style.visibility = 'hidden';
    this.editTitleInput.value = '';
    this.editURLInput.value = '';
    this.editURLInput.classList.remove('invalid');
  }

  // Event Listeners

  addActionListeners() {
    this.tableBody.querySelectorAll('.delete-btn').forEach(btn =>
      btn.addEventListener('click', () => this.deleteBookmark(Number(btn.dataset.bookmarkId)))
    );

    this.tableBody.querySelectorAll('.edit-btn').forEach(btn =>
      btn.addEventListener('click', () => this.showEditModal(Number(btn.dataset.bookmarkId)))
    );
  }

  // Utility

  batchArray(arr, batchSize) {
    const batches = [];
    for (let i = 0; i < arr.length; i += batchSize) {
      batches.push(arr.slice(i, i + batchSize));
    }
    return batches;
  }

  isValidUrl(str) {
    try {
      const url = new URL(str);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  }

  async validateInput(inputValue) {
    if (!this.isValidUrl(inputValue)) {
      return false;
    }
    
    try {
      await fetch(inputValue, { method: 'HEAD', mode: 'no-cors' });
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkUrlAvailability(url) {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  resetForm() {
    this.input.classList.remove('invalid');
    this.form.reset();
  }

  // Initialization

  init() {
    this.getBookmarks();

    if (this.tableBody) this.renderBookmarks();
    if (this.tableBodyResult) this.renderResultBookmark();

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });

      this.input?.addEventListener('input', () =>
        this.input.classList.remove('invalid')
      );
    }

    if (this.editForm) {
      this.editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEdit();
      });

      this.editURLInput?.addEventListener('input', () =>
        this.editURLInput.classList.remove('invalid')
      );
    }

    this.editModalBackdrop?.addEventListener('click', () => this.hideEditModal());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') this.hideEditModal();
    });

    if (this.paginationPrev && this.paginationNext) {
      if (this.paginationPrev) {
      this.paginationPrev.addEventListener('click', () => {
        if (this.currentPage > 0) {
          this.currentPage -= 1;
          this.renderBookmarks();
        }
      });
    }

    if (this.paginationNext) {
      this.paginationNext.addEventListener('click', () => {
        if (this.currentPage < this.batches.length - 1) {
          this.currentPage += 1;
          this.renderBookmarks();
        }
      });
    }
    }
  }
}

// New App

window.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#url-form');
  const editModal = document.querySelector('#edit-modal');
  const editForm = document.querySelector('#edit-form');
  const tableBody = document.querySelector('#bookmarks-table tbody');
  const tableBodyResult = document.querySelector('#result-table tbody');
  const pagination = document.querySelector('#pagination');

  const app = new BookmarkApp(form, editModal, editForm, tableBody, tableBodyResult, pagination);
  app.init();
});
