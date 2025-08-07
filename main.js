class BookmarkApp {
  constructor(form, input, submitButton, tableBody) {
    this.form = form;
    this.input = input;
    this.submitButton = submitButton;
    this.tableBody = tableBody;
    this.bookmarks = [];

    this.input.addEventListener('input', () => {
      this.input.classList.remove('invalid')
    })
  }

  getBookmarks() {
    const stored = window.localStorage.getItem('bookmarks');
    this.bookmarks = stored ? JSON.parse(stored) : [];
  }

  setBookmarks() {
    window.localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks))
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
        urlLink.rel = "noopener noreferrer";
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

  async validateInput() {
    const inputValue = this.input.value;
    if (!this.isValidUrl(inputValue)) {
      return false;
    }
    return true;
  }

  submitButtonDisabled() {
    this.submitButton.classList.add('disabled');
    this.submitButton.innerHTML = '<span>Validating</span>';
  }

  submitButtonReset() {
    this.submitButton.classList.add('disabled');
    this.submitButton.innerHTML = 'Submit Bookmark';
  }

  resetForm() {
    this.submitButtonReset()
    this.input.classList.remove('invalid');
    this.form.reset();
  }

  async handleSubmit() {
    this.submitButtonDisabled();

    if (await this.validateInput()) {
      const formData = new FormData(this.form);
      const date = new Date();
      const time = date.getTime();

      const newBookmark = {};

      for (const [name, value] of formData.entries()) {
        newBookmark[name] = value;
      }

      newBookmark['id'] = time + Math.floor(Math.random() * 1000);

      this.bookmarks.push(newBookmark);
      this.setBookmarks();
      this.renderBookmarks();

      this.resetForm()
    } else {
      this.submitButtonReset()
      this.input.classList.add('invalid');
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
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#url-form');
  const input = form?.querySelector('#url');
  const submitButton = form?.querySelector('#submit-btn');
  const tableBody = document.querySelector('#bookmarks-table tbody');
  const myApp = new BookmarkApp(form, input, submitButton, tableBody);
  myApp.init();
})