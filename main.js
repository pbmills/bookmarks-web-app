class BookmarkApp {
  constructor(form, editModal, editForm, tableBody, tableBodyResult) {
    this.form = form;
    this.input = this.form?.querySelector('[name="url"]');
    this.submitButton = this.form?.querySelector('[name="submit"]');

    this.editModal = editModal;
    this.editModalBackdrop = this.editModal?.querySelector('.backdrop');
    this.editForm = editForm;
    this.editTitleInput = this.editForm?.querySelector('[name="title"]');
    this.editURLInput = this.editForm?.querySelector('[name="url"]');
    this.editSubmitButton = this.editForm?.querySelector('[type="submit"]');
    this.editID = undefined;

    this.tableBody = tableBody;
    this.tableBodyResult = tableBodyResult;
    this.resultBookmark = {};
    this.bookmarks = [];
  }

  getBookmarks() {
    const stored = window.localStorage.getItem('bookmarks');
    const storedResult = window.localStorage.getItem('resultBookmark');
    this.bookmarks = stored ? JSON.parse(stored) : [];
    this.resultBookmark = storedResult ? JSON.parse(storedResult) : [];
  }

  setBookmarks() {
    window.localStorage.setItem('resultBookmark', JSON.stringify(this.resultBookmark));
    window.localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
  }

  deleteBookmark(id) {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      this.bookmarks = this.bookmarks.filter((b) => b.id !== id);
      this.setBookmarks();
      this.renderBookmarks();
    }
  }

  renderBookmarks() {
    if (this.bookmarks.length > 0) {
      this.tableBody.innerHTML = '';
      for (let bookmark of this.bookmarks) {
        const row = document.createElement('tr');

        const title = document.createElement('td');
        title.innerText = bookmark["title"] || 'N/A';

        const url = document.createElement('td');
        const urlLink = document.createElement('a');
        urlLink.href = bookmark["url"];
        urlLink.target = "_blank";
        urlLink.innerText = bookmark["url"];
        url.appendChild(urlLink);

        const actions = document.createElement('td');
        actions.innerHTML = `
          <div class="actions">
            <button class="edit-btn" aria-label="Edit Bookmark" title="Edit Bookmark" data-bookmark-id="${bookmark.id}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
            </button>
            <button class="delete-btn" aria-label="Delete Bookmark" title="Delete Bookmark" data-bookmark-id="${bookmark.id}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        `

        row.append(title, url, actions)
        this.tableBody.appendChild(row);
      }
      this.addActionListeners();
    } else {
      this.tableBody.innerHTML = '<tr id="no-bookmarks"><td colspan="3">No Bookmarks added so far...</td></tr>';
    }
  }

  renderResultBookmark() {
    if (Object.keys(this.resultBookmark).length > 0) {
      this.tableBodyResult.innerHTML = "";
      const row = document.createElement("tr");

      const title = document.createElement("td");
      title.innerText = this.resultBookmark["title"] || "N/A";

      const url = document.createElement("td");
      const urlLink = document.createElement("a");
      urlLink.href = this.resultBookmark["url"] || "#";
      urlLink.target = "_blank";
      urlLink.innerText = this.resultBookmark["url"] || "#";
      url.appendChild(urlLink);

      row.append(title, url)
      this.tableBodyResult.appendChild(row);
    } else {
      this.tableBodyResult.innerHTML = `<tr id="no-bookmarks"><td colspan="2">There must be a problem.</td></tr>`;
    }
  }

  showEditModal(id) {
    if (this.editModal) {
      this.editModal.style.display = 'grid';
      this.editModal.style.visibility = 'visible';

      const matchingBookmarks = this.bookmarks.filter(b => b.id === id);

      if (matchingBookmarks.length && this.editTitleInput && this.editURLInput) {
        const selectedBookmark = matchingBookmarks[0];
        this.editTitleInput.value = selectedBookmark['title'];
        this.editURLInput.value = selectedBookmark['url'];
      }
    }
  }

  hideEditModal() {
    this.editID = undefined;
    if (this.editModal) {
      this.editModal.style.display = 'none';
      this.editModal.style.visibility = 'hidden';

      if (this.editTitleInput && this.editURLInput) {
        this.editTitleInput.value = '';
        this.editURLInput.value = '';
      }
    }
  }

  addActionListeners() {
    const deleteButtons = this.tableBody.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(button.dataset.bookmarkId, 10);
        this.deleteBookmark(id);
      });
    });

    const editButtons = this.tableBody.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(button.dataset.bookmarkId);
        this.editID = id;
        this.showEditModal(id)
      });
    });
  }

  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch (_) {
      return false;
    }
  }

  async validateInput(inputValue) {
    if (!this.isValidUrl(inputValue)) {
      return false;
    }
    return true;
  }

  resetForm() {
    this.input.classList.remove('invalid');
    this.form.reset();
  }

  async handleSubmit() {
    if (await this.validateInput(this.input.value)) {
      const formData = new FormData(this.form);
      const date = new Date();
      const time = date.getTime();

      const newBookmark = {};

      for (const [name, value] of formData.entries()) {
        newBookmark[name] = value;
      }

      newBookmark['id'] = time + Math.floor(Math.random() * 1000);

      this.bookmarks.push(newBookmark);
      this.resultBookmark = newBookmark;
      this.setBookmarks();
      this.renderBookmarks();

      this.resetForm()
      window.location.href = '/result'
    } else {
      this.input.classList.add('invalid');
    }
  }

  async handleEdit() {
    if (await this.validateInput(this.editURLInput.value)) {
      const formData = new FormData(this.editForm);

      const newBookmark = {};

      for (const [name, value] of formData.entries()) {
        newBookmark[name] = value;
      }

      const index = this.bookmarks.findIndex(b => b.id === this.editID);
      
      this.bookmarks[index].title = newBookmark.title;
      this.bookmarks[index].url = newBookmark.url;

      this.setBookmarks();
      this.renderBookmarks();

      this.hideEditModal()
    } else {
      this.editURLInput.classList.add('invalid');
    }
  }

  init() {
    this.getBookmarks();

    if (this.tableBody) {
      this.renderBookmarks();
    }

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      })
    }

    if (this.editForm) {
      this.editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEdit();
      })
    }

    if (this.input) {
      this.input.addEventListener('input', () => {
        this.input.classList.remove('invalid')
      })
    }

    if (this.editURLInput) {
      this.editURLInput.addEventListener('input', () => {
        this.editURLInput.classList.remove('invalid')
      })
    }

    if (this.editModalBackdrop) {
      this.editModalBackdrop.addEventListener('click', () => {
        this.hideEditModal()
      })
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
          this.hideEditModal()
        }
      })
    }

    if (this.tableBodyResult) {
      this.renderResultBookmark()
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#url-form');
  const editModal = document.querySelector('#edit-modal');
  const editForm = document.querySelector('#edit-form');
  const tableBody = document.querySelector('#bookmarks-table tbody');
  const tableBodyResult = document.querySelector('#result-table tbody');
  const myApp = new BookmarkApp(form, editModal, editForm, tableBody, tableBodyResult);
  myApp.init();
})